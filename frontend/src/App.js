import logo from "./logo.svg";
import "./App.css";
import NewCustomersAdded from "./components/newCustomersAdded";
import TotalSales from "./components/totalSales";
import SalesGrowthRate from "./components/salesGrowth";
import RepeatCustomers from "./components/repeatCustomers";
import GeographicalDistributionChart from "./components/geographicalDistribution";
import CohortValues from "./components/cohortsValue";

function App() {
  return (
    <div className="App">
      <h1 className="head-title">Shopify Sales Insights</h1>
      <div className="charts-component">
        <div className="customers-chart-component">
          <TotalSales />
        </div>
        <div className="customers-chart-component">
          <SalesGrowthRate />
        </div>
        <div className="customers-chart-component">
          <NewCustomersAdded />
        </div>
        <div className="customers-chart-component">
          <RepeatCustomers />
        </div>
        <div className="customers-chart-component">
          <GeographicalDistributionChart />
        </div>
        <div className="customers-chart-component">
          <CohortValues />
        </div>
      </div>
    </div>
  );
}

export default App;
