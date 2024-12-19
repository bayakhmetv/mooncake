import React from "react";

function UserDashboard({ orders }) {
  if (!orders || orders.length === 0) {
    return <p>У вас пока нет заказов.</p>;
  }

  return (
    <div>
      <h2>Ваши заказы</h2>
      <ul>
        {orders.map((order) => (
          <li key={order._id}>
            <p>Имя: {order.name}</p>
            <p>Адрес: {order.address}</p>
            <p>Телефон: {order.phone}</p>
            <p>Общая стоимость: {order.totalPrice} T</p>
            <p>Статус: {order.status}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UserDashboard;
