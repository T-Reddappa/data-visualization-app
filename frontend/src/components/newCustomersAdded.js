import React, { useEffect, useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import { Chart as ChartJs, registerables } from "chart.js";

ChartJs.register(...registerables);

const NewCustomersAdded = () => {
  const [monthlyData, setMonthlyData] = useState([]);
  const [quarterlyData, setQuarterlyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [monthlyResponse, quarterlyResponse] = await Promise.all([
          fetch(
            "https://data-visualization-app-sndo.onrender.com/api/customers/new-customers?interval=monthly"
          ),
          fetch(
            "https://data-visualization-app-sndo.onrender.com/api/customers/new-customers?interval=quarterly"
          ),
        ]);

        const monthlyData = await monthlyResponse.json();
        const quarterlyData = await quarterlyResponse.json();

        setMonthlyData(monthlyData);
        setQuarterlyData(quarterlyData);
        setLoading(false);
      } catch (error) {
        console.log("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const chartData = {
    labels: monthlyData?.map((item) => item._id),
    datasets: [
      {
        label: "Monthly",
        data: monthlyData?.map((item) => item.newCustomers),
        backgroundColor: "rgba(153, 102, 255, 0.2)",
        borderColor: "rgba(153, 102, 255, 1)",
        borderWidth: 1,
        hidden: false,
      },
      {
        label: "Quarterly",
        data: quarterlyData?.map((item) => item.newCustomers),
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
        hidden: true,
      },
    ],
  };

  if (loading) {
    return <div>Loading Customer Data...Please Wait...</div>;
  }

  return (
    <div>
      <h2>New Customers Added Over Time</h2>
      <Bar
        data={chartData}
        options={{
          responsive: true,
          scales: {
            y: {
              title: {
                display: true,
                text: "Number of Customers Added",
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

                //Hide all datasets
                ci.data.datasets.forEach((dataset, i) => {
                  ci.getDatasetMeta(i).hidden = true;
                });

                ci.getDatasetMeta(index).hidden = false;

                ci.data.labels = [monthlyData, quarterlyData][index]?.map(
                  (item) => item._id
                );
                ci.update();
              },
            },
          },
        }}
      />
    </div>
  );
};

export default NewCustomersAdded;
