import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJs, registerables } from "chart.js";

ChartJs.register(...registerables);

const SalesGrowthRate = () => {
  const [monthlyData, setMonthlyData] = useState([]);
  const [quarterlyData, setQuarterlyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [monthlyResponse, quarterlyResponse] = await Promise.all([
          fetch(
            "https://data-visualization-app-sndo.onrender.com/api/sales/sales-growth?interval=monthly"
          ),
          fetch(
            "https://data-visualization-app-sndo.onrender.com/api/sales/sales-growth?interval=quarterly"
          ),
        ]);

        const monthlyData = await monthlyResponse.json();
        const quarterlyData = await quarterlyResponse.json();

        setMonthlyData(monthlyData);
        setQuarterlyData(quarterlyData);
        setLoading(false);
      } catch (error) {
        console.log("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading Sales Data...Please Wait..</div>;
  }

  const chartData = {
    labels: monthlyData.map((item) => item._id), // Default to monthly labels
    datasets: [
      {
        label: "Monthly Growth (%)",
        data: monthlyData.map((item) => item.growthRate),
        backgroundColor: "rgba(153, 102, 255, 0.2)",
        borderColor: "rgba(153, 102, 255, 1)",
        borderWidth: 1,
        hidden: false, // Show monthly data by default
      },
      {
        label: "Quarterly Growth (%)",
        data: quarterlyData.map((item) => item.growthRate),
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
        hidden: true, // Hide quarterly data by default
      },
    ],
  };

  return (
    <div>
      <h2>Sales Growth Rate Over Time</h2>
      <Line
        data={chartData}
        options={{
          responsive: true,
          scales: {
            y: {
              position: "left",
              title: {
                display: true,
                text: "Growth Rate (%)",
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

                // Show the selected dataset and its labels
                ci.getDatasetMeta(index).hidden = false;
                ci.data.labels =
                  index === 0
                    ? monthlyData.map((item) => item._id)
                    : quarterlyData.map((item) => item._id);

                ci.update();
              },
            },
          },
        }}
      />
    </div>
  );
};

export default SalesGrowthRate;
