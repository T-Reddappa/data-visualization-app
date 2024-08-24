import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJs, registerables } from "chart.js";

ChartJs.register(...registerables);

const TotalSales = () => {
  const [dailyData, setDailyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [quarterlyData, setQuarterlyData] = useState([]);
  const [yearlyData, setYearlyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          dailyResponse,
          monthlyResponse,
          quarterlyResponse,
          yearlyResponse,
        ] = await Promise.all([
          fetch(
            "https://data-visualization-app-sndo.onrender.com/api/sales?interval=daily"
          ),
          fetch(
            "https://data-visualization-app-sndo.onrender.com/api/sales?interval=monthly"
          ),
          fetch(
            "https://data-visualization-app-sndo.onrender.com/api/sales?interval=quarterly"
          ),
          fetch(
            "https://data-visualization-app-sndo.onrender.com/api/sales?interval=yearly"
          ),
        ]);

        setDailyData(await dailyResponse.json());
        setMonthlyData(await monthlyResponse.json());
        setQuarterlyData(await quarterlyResponse.json());
        setYearlyData(await yearlyResponse.json());
        setLoading(false);
      } catch (error) {
        console.log("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading Sales Data...Please Wait...</div>;
  }

  const chartConfig = {
    labels: monthlyData?.map((item) => item._id),
    datasets: [
      {
        label: "Daily Sales($)",
        data: dailyData?.map((item) => item.totalSales),
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
        hidden: true,
      },
      {
        label: "Monthly Sales($)",
        data: monthlyData?.map((item) => item.totalSales),
        backgroundColor: "rgba(153, 102, 255, 0.2)",
        borderColor: "rgba(153, 102, 255, 1)",
        borderWidth: 1,
        hidden: false,
      },
      {
        label: "Quarterly Sales($)",
        data: quarterlyData?.map((item) => item.totalSales),
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
        hidden: true,
      },
      {
        label: "Yearly Sales($)",
        data: yearlyData?.map((item) => item.totalSales),
        backgroundColor: "rgba(255, 206, 86, 0.2)",
        borderColor: "rgba(255, 206, 86, 1)",
        borderWidth: 1,
        hidden: true,
      },
    ],
  };

  return (
    <div>
      <h2>Total Sales Over Time</h2>
      <Bar
        data={chartConfig}
        options={{
          responsive: true,
          scales: {
            y: {
              position: "left",
              title: {
                display: true,
                text: "Total Sales Value ($)",
              },
            },
            x: {
              title: {
                display: true,
                text: "Time Interval",
              },
            },
          },
          plugins: {
            legend: {
              onClick: (e, legendItem, legend) => {
                const ci = legend.chart;
                const index = legendItem.datasetIndex;

                // Hide all datasets
                ci.data.datasets.forEach((dataset, i) => {
                  ci.getDatasetMeta(i).hidden = true;
                });

                // Show the selected dataset and update labels
                ci.getDatasetMeta(index).hidden = false;

                ci.data.labels = [
                  dailyData,
                  monthlyData,
                  quarterlyData,
                  yearlyData,
                ][index]?.map((item) => item._id);

                ci.update();
              },
            },
          },
        }}
      />
    </div>
  );
};

export default TotalSales;
