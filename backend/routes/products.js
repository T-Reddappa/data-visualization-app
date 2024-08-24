const express = require("express");
const router = express.Router();
const shopifyProduct = require("../models/productModel");

//Product Routes

router.get("/", async (req, res) => {
  try {
    console.log("getting products");
    const products = await shopifyProduct.find({});
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
