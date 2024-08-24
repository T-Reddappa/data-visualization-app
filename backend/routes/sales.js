const express = require("express");
const router = express.Router();

const ShopifyOrder = require("../models/saleModel");

//Get Sales
router.get("/", async (req, res) => {
  try {
    console.log("getting sales");
    // const orders = await ShopifyOrder.find({});
    // res.status(200).json(orders);
    const interval = req.query.interval || "daily";
    let groupFormat;

    // Determine the date format based on the interval
    switch (interval) {
      case "daily":
        groupFormat = "%Y-%m-%d";
        break;
      case "monthly":
        groupFormat = "%Y-%m";
        break;
      case "quarterly":
        groupFormat = {
          $concat: [
            { $substr: [{ $year: "$created_at" }, 0, 4] },
            "-Q",
            {
              $toString: { $ceil: { $divide: [{ $month: "$created_at" }, 3] } },
            },
          ],
        };
        break;
      case "yearly":
        groupFormat = "%Y";
        break;
      default:
        return res.status(400).json({ error: "Invalid interval" });
    }

    // Define the aggregation pipeline
    const pipeline = [
      {
        $addFields: {
          created_at_date: {
            $dateFromString: { dateString: "$created_at" },
          },
        },
      },
      {
        $group: {
          _id:
            typeof groupFormat === "string"
              ? {
                  $dateToString: {
                    format: groupFormat,
                    date: "$created_at_date",
                  },
                }
              : groupFormat,
          totalSales: {
            $sum: { $toDouble: "$total_price_set.shop_money.amount" },
          },
        },
      },
      { $sort: { _id: 1 } }, // Sort by date in ascending order
    ];

    const aggregatedSales = await ShopifyOrder.aggregate(pipeline);
    res.status(200).json(aggregatedSales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//Get Sales Growth
router.get("/sales-growth", async (req, res) => {
  try {
    const interval = req.query.interval || "monthly";
    let groupFormat;

    // Determine the date format based on the interval
    switch (interval) {
      case "daily":
        groupFormat = "%Y-%m-%d";
        break;
      case "monthly":
        groupFormat = "%Y-%m";
        break;
      case "quarterly":
        groupFormat = {
          $concat: [
            { $substr: [{ $year: "$created_at_date" }, 0, 4] },
            "-Q",
            {
              $toString: {
                $ceil: { $divide: [{ $month: "$created_at_date" }, 3] },
              },
            },
          ],
        };
        break;
      case "yearly":
        groupFormat = "%Y";
        break;
      default:
        return res.status(400).json({ error: "Invalid interval" });
    }

    // Define the aggregation pipeline
    const pipeline = [
      {
        $addFields: {
          created_at_date: {
            $dateFromString: { dateString: "$created_at" },
          },
        },
      },
      {
        $group: {
          _id:
            typeof groupFormat === "string"
              ? {
                  $dateToString: {
                    format: groupFormat,
                    date: "$created_at_date",
                  },
                }
              : groupFormat,
          totalSales: {
            $sum: { $toDouble: "$total_price_set.shop_money.amount" },
          },
        },
      },
      { $sort: { _id: 1 } }, // Sort by date in ascending order
      {
        $setWindowFields: {
          partitionBy: null,
          sortBy: { _id: 1 },
          output: {
            previousSales: {
              $shift: {
                output: "$totalSales",
                by: -1, // Shift by 1 period backward
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          totalSales: 1,
          previousSales: 1,
          growthRate: {
            $cond: {
              if: { $eq: ["$previousSales", 0] },
              then: null,
              else: {
                $multiply: [
                  {
                    $divide: [
                      { $subtract: ["$totalSales", "$previousSales"] },
                      "$previousSales",
                    ],
                  },
                  100,
                ],
              },
            },
          },
        },
      },
    ];

    const salesGrowth = await ShopifyOrder.aggregate(pipeline);
    res.status(200).json(salesGrowth);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//Number of Repeat Customers:
router.get("/repeat-customers", async (req, res) => {
  try {
    const interval = req.query.interval || "monthly";
    let groupFormat;

    // Determine the date format based on the interval
    switch (interval) {
      case "daily":
        groupFormat = "%Y-%m-%d";
        break;
      case "monthly":
        groupFormat = "%Y-%m";
        break;
      case "quarterly":
        groupFormat = {
          $concat: [
            { $substr: [{ $year: "$created_at_date" }, 0, 4] },
            "-Q",
            {
              $toString: {
                $ceil: { $divide: [{ $month: "$created_at_date" }, 3] },
              },
            },
          ],
        };
        break;
      case "yearly":
        groupFormat = "%Y";
        break;
      default:
        return res.status(400).json({ error: "Invalid interval" });
    }

    // Define the aggregation pipeline
    const pipeline = [
      {
        $addFields: {
          created_at_date: {
            $dateFromString: { dateString: "$created_at" },
          },
        },
      },
      {
        $group: {
          _id: {
            customerId: "$customer.id",
            period:
              typeof groupFormat === "string"
                ? {
                    $dateToString: {
                      format: groupFormat,
                      date: "$created_at_date",
                    },
                  }
                : groupFormat,
          },
          purchaseCount: { $sum: 1 },
        },
      },
      {
        $match: {
          purchaseCount: { $gt: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.period",
          repeatCustomers: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } }, // Sort by period in ascending order
    ];

    const repeatCustomers = await ShopifyOrder.aggregate(pipeline);
    res.status(200).json(repeatCustomers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//Customer Lifetime Value by Cohorts:
router.get("/cltv-by-cohort", async (req, res) => {
  try {
    const pipeline = [
      // Step 1: Match orders with the 'paid' financial status (adjust as necessary)
      {
        $match: {
          financial_status: "paid", // Exclude canceled, refunded, etc.
        },
      },
      // Step 2: Group orders by customer, calculating the first purchase date and total spent
      {
        $group: {
          _id: "$customer.id", // Group by customer ID
          firstPurchaseDate: { $min: "$created_at" }, // Get the earliest purchase date for each customer
          lifetimeValue: { $sum: { $toDouble: "$total_price" } }, // Calculate total spent by the customer
        },
      },
      // Step 3: Format the first purchase date into the month and year
      {
        $addFields: {
          cohortMonth: {
            $dateToString: {
              format: "%Y-%m",
              date: { $dateFromString: { dateString: "$firstPurchaseDate" } },
            },
          },
        },
      },
      // Step 4: Group by cohort month to calculate the total lifetime value for each cohort
      {
        $group: {
          _id: "$cohortMonth", // Group by cohort month
          cohortLifetimeValue: { $sum: "$lifetimeValue" }, // Sum up the lifetime value for the cohort
          customerCount: { $sum: 1 }, // Count the number of customers in each cohort
        },
      },
      // Step 5: Sort results by cohort month
      {
        $sort: { _id: 1 }, // Sort by cohort month in ascending order
      },
    ];

    // Execute the aggregation pipeline
    const cltvByCohort = await ShopifyOrder.aggregate(pipeline);
    res.status(200).json(cltvByCohort);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
