const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  ingredients: { type: [String], required: true }, // Массив ингредиентов
  price: { type: Number, required: true },
  count: { type: Number, required: true },
  category: { type: String, required: true },
  imageUrl: { type: String, required: true },
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
