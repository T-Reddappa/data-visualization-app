import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJs, registerables } from "chart.js";

ChartJs.register(...registerables);

const CohortValues = () => {
  const [cohortValues, setCohortValues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(
      "https://data-visualization-app-sndo.onrender.com/api/sales/cltv-by-cohort"
    )
      .then((response) => response.json())
      .then((data) => {
        setCohortValues(data);
        setLoading(false);
      })
      .catch((error) => {
        console.log("Error fetching data:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>fetching Customer Lifetime Value by Cohorts... </div>;
  }

  const chartData = {
    labels: cohortValues?.map((item) => item._id),
    datasets: [
      {
        type: "bar",
        label: "Cohort Lifetime Value ($)",
        data: cohortValues?.map((item) => item.cohortLifetimeValue),
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
        yAxisID: "y-axis-1",
      },
      {
        type: "line",
        label: "Customer Count",
        data: cohortValues?.map((item) => item.customerCount),
        backgroundColor: "rgba(153, 102, 255, 0.2)",
        borderColor: "rgba(153, 102, 255, 1)",
        borderWidth: 2,
        fill: false,
        yAxisID: "y-axis-2",
      },
    ],
  };
  const chartOptions = {
    responsive: true,
    scales: {
      "y-axis-1": {
        type: "linear",
        position: "left",
        title: {
          display: true,
          text: "Cohort Lifetime Value ($)",
        },
      },
      "y-axis-2": {
        type: "linear",
        position: "right",
        title: {
          display: true,
          text: "Customer Count",
        },
        grid: {
          drawOnChartArea: false, // only want the grid lines for one axis to show up
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
    },
  };

  return (
    <div>
      <h2>Customer Lifetime Value by Cohorts</h2>
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
};

export default CohortValues;
