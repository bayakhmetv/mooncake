import React from "react";
import ProductList from "./ProductList";

function Product_fruits({ category, addToCart }) {
  return (
    <div className="container">
      <div className="common-title">Выберите набор</div>
      <ProductList category={category} addToCart={addToCart} />
    </div>
  );
}

export default Product_fruits;
