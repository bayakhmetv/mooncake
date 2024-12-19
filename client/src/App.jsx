import React, { useState, useEffect } from "react";
import {
  Route,
  Routes,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom"; // useLocation только здесь
import Header from "./Header.jsx";
import Home from "./Home.jsx";
import Product_cakes from "./Product_cakes.jsx";
import Product_pies from "./Product_pies.jsx";
import Product_desserts from "./Product_desserts.jsx";
import Product_fruits from "./Product_fruits.jsx";
import Footer from "./Footer.jsx";
import Cart from "./Cart.jsx";
import AllProducts from "./AllProducts.jsx";
import Profile from "./Profile";
import Notification from "./Notification.jsx";

function App() {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [notification, setNotification] = useState(null);

  const location = useLocation(); // Получаем текущий путь
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem("authToken");

  // Функции для управления корзиной
  const addToCart = (product) => {
    setCartItems([...cartItems, product]);
    setNotification(`${product.title} добавлен в корзину!`);

    // Скрыть уведомление через 3 секунды
    setTimeout(() => setNotification(null), 3000);
  };

  const removeFromCart = (product) => {
    setCartItems(cartItems.filter((item) => item._id !== product._id));
  };

  const handleChangeQuantity = (product, delta) => {
    const updatedCart = cartItems.map((item) => {
      if (item._id === product._id) {
        const updatedCount = item.count + delta;
        return updatedCount > 0 ? { ...item, count: updatedCount } : item;
      }
      return item;
    });
    setCartItems(updatedCart);
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const closeCart = () => {
    setIsCartOpen(false);
  };

  useEffect(() => {
    // Загружаем все товары с сервера
    fetch("http://localhost:5000/api/products")
      .then((response) => response.json())
      .then((data) => setProducts(data))
      .catch((error) => console.error("Ошибка загрузки товаров:", error));
  }, []);

  useEffect(() => {
    if (!isAuthenticated && location.pathname === "/profile") {
      navigate("/"); // Перенаправление неавторизованного пользователя
    }
  }, [isAuthenticated, location, navigate]);

  return (
    <div>
      <Header cartItems={cartItems} toggleCart={toggleCart} />
      {notification && <Notification message={notification} />}
      {location.pathname === "/section=all" && <Home />}
      <Routes>
        <Route path="/" element={<Navigate to="/section=all" />} />
        <Route
          path="/section=all"
          element={<AllProducts products={products} addToCart={addToCart} />}
        />
        <Route
          path="/section=torty"
          element={<Product_cakes category="Торты" addToCart={addToCart} />}
        />
        <Route
          path="/section=pirogi"
          element={<Product_pies category="Пироги" addToCart={addToCart} />}
        />
        <Route
          path="/section=deserty"
          element={
            <Product_desserts category="Десерты" addToCart={addToCart} />
          }
        />
        <Route
          path="/section=frukty"
          element={
            <Product_fruits
              category="Фрукты в шоколаде"
              addToCart={addToCart}
            />
          }
        />
        <Route path="/profile" element={<Profile />} />
      </Routes>
      {isCartOpen && (
        <Cart
          cartItems={cartItems}
          removeFromCart={removeFromCart}
          onCloseCart={closeCart}
          handleChangeQuantity={handleChangeQuantity}
          clearCart={clearCart}
        />
      )}
      {location.pathname === "/section=all"}
      <Footer />
    </div>
  );
}

export default App;
