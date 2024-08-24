const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    created_at: Date,
  },
  {
    collection: "shopifyProducts",
  }
);

const ShopifyProduct = mongoose.model("ShopifyProduct", productSchema);

module.exports = ShopifyProduct;
