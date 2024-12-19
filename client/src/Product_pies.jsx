import React from "react";
import ProductList from "./ProductList";

function Product_pies({ category, addToCart }) {
  return (
    <div className="container">
      <div className="common-title">Выберите пирог</div>
      <ProductList category={category} addToCart={addToCart} />
    </div>
  );
}

export default Product_pies;
