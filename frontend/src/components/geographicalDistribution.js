import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJs, registerables } from "chart.js";

ChartJs.register(...registerables);

const GeographicalDistributionChart = () => {
  const [customersData, setCustomersData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(
      "https://data-visualization-app-sndo.onrender.com/api/customers/customer-distribution"
    )
      .then((response) => response.json())
      .then((data) => {
        setCustomersData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.log("Error fetching data:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Fetching Geographical Data....</div>;
  }

  const chartData = {
    labels: customersData?.map((item) => item._id),
    datasets: [
      {
        label: "Geographical Distribution",
        data: customersData?.map((item) => item.customerCount),
      },
    ],
  };

  return (
    <div>
      <h2>Geographical Distribution of Customers</h2>
      <Pie data={chartData} options={{ responsive: true }} />
    </div>
  );
};

export default GeographicalDistributionChart;
