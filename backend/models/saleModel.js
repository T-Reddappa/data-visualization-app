const mongoose = require("mongoose");

const shopifyOrderSchema = new mongoose.Schema(
  {
    created_at: Date,
  },
  { collection: "shopifyOrders" }
);

const ShopifyOrder = mongoose.model("ShopifyOrder", shopifyOrderSchema);

module.exports = ShopifyOrder;
