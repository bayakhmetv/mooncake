import React from "react";
import ProductList from "./ProductList.jsx";

function AllProducts({ products, addToCart }) {
  // Категории товаров
  const categories = [
    { name: "Торты", title: "Выберите торт" },
    { name: "Пироги", title: "Выберите пирог" },
    { name: "Десерты", title: "Выберите десерт" },
    { name: "Фрукты в шоколаде", title: "Выберите набор" },
  ];

  return (
    <div>
      {categories.map((category) => (
        <div key={category.name}>
          <div className="common-title">{category.title}</div>
          <ProductList
            category={category.name}
            products={products}
            addToCart={addToCart}
          />
        </div>
      ))}
    </div>
  );
}

export default AllProducts;
