import React, { useState } from "react";
import axios from "axios";
import jwt_decode from "jwt-decode";

const LoginForm = ({ onSwitchToRegister, onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/api/login", {
        email,
        password,
      });
      const { token, name } = response.data;

      const decodedToken = jwt_decode(token); // Используем jwt_decode
      const { userId, role } = decodedToken;
      // Сохраняем токен и данные пользователя в localStorage
      localStorage.setItem("authToken", token);
      localStorage.setItem("userName", name);
      localStorage.setItem("userRole", role);
      localStorage.setItem("userId", userId);

      onLoginSuccess({ token, user: { name, role, userId } });

      alert("Успешный вход!");
      setEmail("");
      setPassword("");
      // Редирект в зависимости от роли пользователя
      if (role === "admin") {
        window.location.href = "http://localhost:5000/admin"; // Перенаправляем на страницу админа
      } else {
        window.location.href = "http://localhost:5173"; // Перенаправляем на главную страницу
      }
    } catch (error) {
      console.error("Ошибка при входе:", error);
      alert("Ошибка при входе");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Войти в аккаунт</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Электронная почта"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="auth-btn">
            Войти
          </button>
        </form>
        <div class="auth-switch">
          <p>
            Нет аккаунта?{" "}
            <button onClick={onSwitchToRegister}>Зарегистрироваться</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
