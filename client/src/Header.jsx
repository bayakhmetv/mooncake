import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./index.css";
import logo from "/images/logo.png";
import searchIcon from "/images/search-icon.png";
import accountIcon from "/images/account-icon.png";
import logoutIcon from "/images/logout-icon.png";
import basketIcon from "/images/basket-icon.png";
import Search from "./Search";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

const Header = ({ cartItems, toggleCart }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("authToken")
  ); // Проверяем токен в localStorage
  const [userName, setUserName] = useState(localStorage.getItem("userName")); // Получаем имя пользователя

  // Загрузка состояния авторизации из localStorage
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setIsAuthenticated(!!token);
    const storedUserName = localStorage.getItem("userName");
    setUserName(storedUserName);
  }, []);

  const handleSearchClick = () => {
    setIsModalOpen(true);
    setIsSearchMode(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleOverlayClick = (e) => {
    if (e.target.className === "modal") {
      closeModal();
    }
  };

  const handleSwitchToRegister = () => {
    setIsLoginMode(false);
  };

  const handleLoginSuccess = (data) => {
    // Сохранение токена в localStorage
    localStorage.setItem("authToken", data.token);
    // Сохранение данных пользователя (имя, email)
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("userName", data.user.name);

    // Обновление состояния
    setIsAuthenticated(true);
    setUserName(data.user.name);

    closeModal();
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userName");
    setIsAuthenticated(false);
    setUserName(null);
    alert("Вы вышли из аккаунта!");
  };

  const handleAccountClick = () => {
    if (isAuthenticated) {
      window.location.href = "/profile"; // Переход в профиль
    } else {
      setIsModalOpen(true);
      setIsSearchMode(false);
      setIsLoginMode(true);
    }
  };

  return (
    <>
      <header className="header">
        <div className="container">
          <div className="header-logo">
            <img src={logo} alt="Логотип компании" />
          </div>
          <nav className="header-nav">
            <ul className="header-list">
              <li className="header-item">
                <Link to="/section=all">Главная</Link>
              </li>
              <li className="header-item">
                <Link to="/section=torty">Торты</Link>
              </li>
              <li className="header-item">
                <Link to="/section=pirogi">Пироги</Link>
              </li>
              <li className="header-item">
                <Link to="/section=deserty">Десерты</Link>
              </li>
              <li className="header-item">
                <Link to="/section=frukty">Фрукты в шоколаде</Link>
              </li>
            </ul>
          </nav>
          <div className="header-icons">
            <button className="icon" onClick={handleSearchClick}>
              <img src={searchIcon} alt="Поиск" />
            </button>
            <button className="icon" onClick={toggleCart}>
              <img src={basketIcon} alt="Корзина" />
              <span>{cartItems.length}</span>
            </button>
            <button
              className="icon"
              onClick={
                isAuthenticated
                  ? () => (window.location.href = "/profile")
                  : handleAccountClick
              }
            >
              <div className="user-info">
                <img src={accountIcon} alt="Аккаунт" />
                {isAuthenticated && <span>{userName}</span>}{" "}
                {/* Имя пользователя под иконкой */}
              </div>
            </button>
            {isAuthenticated && (
              <button className="icon" onClick={handleLogout}>
                <img src={logoutIcon} alt="Выйти" />
              </button>
            )}
          </div>
        </div>
      </header>

      {isModalOpen && (
        <div className="modal" onClick={handleOverlayClick}>
          <div className="modal-content">
            <button className="close-modal" onClick={closeModal}>
              ✖
            </button>
            {isSearchMode ? (
              <Search />
            ) : isLoginMode ? (
              <LoginForm
                onSwitchToRegister={handleSwitchToRegister}
                onLoginSuccess={handleLoginSuccess}
              />
            ) : (
              <RegisterForm />
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
