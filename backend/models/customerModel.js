const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    created_at: Date,
  },
  {
    collection: "shopifyCustomers",
  }
);

const ShopifyCustomer = mongoose.model("ShopifyCustomer", customerSchema);

module.exports = ShopifyCustomer;
