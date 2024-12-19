import React from "react";
import ProductList from "./ProductList";

function Product_desserts({ category, addToCart }) {
  return (
    <div className="container">
      <div className="common-title">Выберите десерт</div>
      <ProductList category={category} addToCart={addToCart} />
    </div>
  );
}

export default Product_desserts;
