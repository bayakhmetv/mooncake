import React, { useState, useEffect } from "react";
import axios from "axios";

function ProductList({ category, title, addToCart }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Получаем все товары с сервера
    axios
      .get("http://localhost:5000/api/products")
      .then((response) => {
        // Фильтруем товары по категории или показываем все товары, если category === 'all'
        const filteredProducts =
          category === "all"
            ? response.data
            : response.data.filter((product) => product.category === category);
        setProducts(filteredProducts);
      })
      .catch((error) => {
        console.error("Ошибка при загрузке данных:", error);
      });
  }, [category]);

  return (
    <div id="products-section" className="products">
      <div className="container">
        <div className="common-title">{title}</div>
        <div className="products-items">
          {products.length > 0 ? (
            products.map((product) => (
              <div key={product._id} className="products-item">
                <div className="products-item-image">
                  <img
                    src={`http://localhost:5000${product.imageUrl}`}
                    alt={product.title}
                  />
                </div>
                <div className="products-item-details">
                  <div className="products-item-title">{product.title}</div>
                  <div className="products-item-text">
                    {product.description}
                  </div>
                  <div className="products-item-extra">
                    <div className="products-item-info">
                      <div className="products-item-price">
                        {product.price} T
                      </div>
                      <div className="products-item-count">
                        {product.count} шт.
                      </div>
                    </div>
                    <button
                      className="button white-button"
                      onClick={() => addToCart({ ...product, count: 1 })}
                    >
                      Заказать
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div>Товары не найдены</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductList;
