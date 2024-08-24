const express = require("express");
const app = express();
const cors = require("cors");

app.use(express.json());
app.use(cors());

require("./db.js");

app.get("/", (req, res) => {
  res.send("Data Visualization Server");
});

//Routes
const salesRouter = require("./routes/sales.js");
const customersRouter = require("./routes/customers.js");
const productsRouter = require("./routes/products.js");

app.use("/api/sales", salesRouter);
app.use("/api/customers", customersRouter);
app.use("/api/products", productsRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
