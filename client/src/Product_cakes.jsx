import React from "react";
import ProductList from "./ProductList";

function Product_cakes({ category, addToCart }) {
  return (
    <div className="container">
      <div className="common-title">Выберите торт</div>
      <ProductList category={category} addToCart={addToCart} />
    </div>
  );
}

export default Product_cakes;
