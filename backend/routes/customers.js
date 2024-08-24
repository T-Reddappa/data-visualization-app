const express = require("express");
const router = express.Router();

const ShopifyCustomer = require("../models/customerModel.js");

// Customer Routes
router.get("/", async (req, res) => {
  try {
    console.log("getting customers");
    const customers = await ShopifyCustomer.find({});
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//New Customers Added Over Time:
router.get("/new-customers", async (req, res) => {
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
          newCustomers: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } }, // Sort by date in ascending order
    ];

    const newCustomers = await ShopifyCustomer.aggregate(pipeline);
    res.status(200).json(newCustomers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//Geographical Distribution of Customers:
router.get("/customer-distribution", async (req, res) => {
  try {
    // Define the aggregation pipeline
    const pipeline = [
      {
        $match: {
          "default_address.city": { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: "$default_address.city",
          customerCount: { $sum: 1 },
        },
      },
      {
        $sort: { customerCount: -1 }, // Sort by the number of customers in descending order
      },
    ];

    const customerDistribution = await ShopifyCustomer.aggregate(pipeline);
    res.status(200).json(customerDistribution);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
