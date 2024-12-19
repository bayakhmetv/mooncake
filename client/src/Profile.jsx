import React, { useEffect, useState } from "react";

const Profile = () => {
  const [orders, setOrders] = useState([]); // Инициализируем как массив
  const [loading, setLoading] = useState(true); // Статус загрузки
  const [userName, setUserName] = useState(localStorage.getItem("userName"));

  // Эффект для загрузки данных пользователя и заказов
  useEffect(() => {
    // Загрузка данных пользователя из localStorage или API
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUserName(storedUser.name); // Здесь используем setUserName, а не setUser
    }
    const userId = localStorage.getItem("userId");

    // Логика загрузки заказов с сервера
    fetch(`http://localhost:5000/api/orders?userId=${userId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setOrders(data.orders || []); // Убедимся, что orders — это массив
        setLoading(false);
      })
      .catch((error) => {
        console.error("Ошибка загрузки заказов:", error);
        setLoading(false);
      });
  }, []);

  console.log("Заказы, полученные от API:", orders);

  return (
    <div className="profile-container">
      {/* Блок профиля пользователя */}
      <div className="profile-info">
        <img src="images/avatar.jpg" alt="Avatar" />
        <h3>{userName}</h3>
      </div>

      {/* Блок заказов */}
      <div className="profile-orders">
        <h2>Ваши заказы</h2>
        {orders.length > 0 ? (
          <ul>
            {orders.map((order) => (
              <li key={order._id}>
                {/* Проверка наличия items перед отображением */}
                <h4>Товары:</h4>
                {Array.isArray(order.cartItems) &&
                order.cartItems.length > 0 ? (
                  <ul>
                    {order.cartItems.map((item, index) => (
                      <li key={index}>
                        <img
                          src={`http://localhost:5000${item.imageUrl}`} // Добавляем базовый URL сервера
                          alt={item.title || "Товар"}
                          style={{
                            width: "100px",
                            height: "100px",
                            objectFit: "cover",
                          }}
                        />
                        <p>Товар: {item.title}</p>
                        <p>Количество: {item.count}</p>
                        <p>Цена за единицу: {item.price} T</p>
                        <p>Итого: {item.count * item.price} T</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Товары не указаны или данные отсутствуют.</p>
                )}

                {/* Информация о заказе */}
                <p>Имя: {order.name}</p>
                <p>Адрес: {order.address}</p>
                <p>Телефон: {order.phone}</p>
                <p>Общая стоимость: {order.totalPrice} T</p>
                <p>Статус: {order.status}</p>
                <p>Дата: {new Date(order.createdAt).toLocaleDateString()}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>У вас пока нет заказов.</p>
        )}
      </div>
    </div>
  );
};

export default Profile;
