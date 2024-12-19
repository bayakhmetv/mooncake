import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  CardElement,
  Elements,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  "pk_test_51QTTyQCk7oJUMRsDPxThBZ8xN0hLy0wl4wmysB6iIHllcM4akTDpWCalLaO8IzajitaIGiQkQgAjUQT4rXxaYGH2007qLBc57x"
);

function CheckoutForm({ cartItems, totalPrice, onConfirmOrder }) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const stripe = useStripe();
  const elements = useElements();

  // Функция для отправки данных заказа и обработки платежа
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !address || !phone) {
      alert("Пожалуйста, заполните все поля.");
      return;
    }

    setIsLoading(true);
    setIsProcessing(true);

    const orderData = {
      name,
      address,
      phone,
      cartItems,
      totalPrice,
    };

    // Запрос к серверу для создания платежного намерения
    const response = await fetch(
      "http://localhost:5000/create-payment-intent",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: totalPrice * 100 }), // Преобразуем в копейки
      }
    );

    const { clientSecret } = await response.json();

    // Получаем элемент карты
    const cardElement = elements.getElement(CardElement);

    const { error, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: cardElement, // Передаем CardElement
          billing_details: {
            name: orderData.name,
            address: {
              line1: orderData.address,
            },
            phone: orderData.phone,
          },
        },
      }
    );

    if (error) {
      setError(error.message);
    } else if (paymentIntent.status === "succeeded") {
      console.log("Платеж успешен, сохраняем заказ...");

      const token = localStorage.getItem("authToken");

      // ВАЖНО: добавляем вывод токена в консоль
      console.log("Token before sending:", token);
      if (!token) {
        console.error("Token is missing");
        return;
      }
      // Отправка данных заказа на сервер для сохранения в базе данных
      const orderResponse = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData), // Отправляем заказ на сервер
      });

      if (orderResponse.ok) {
        onConfirmOrder(); // Сообщаем родительскому компоненту, что заказ подтвержден
        alert("Платеж успешно подтверждён! Ваш заказ в обработке.");
      } else {
        console.error("Ошибка при сохранении заказа");
        alert("Произошла ошибка при сохранении заказа. Попробуйте снова.");
      }
    }
    setIsLoading(false);
    setIsProcessing(false);
  };

  return (
    <div className="checkout-form">
      <h2>Оформление заказа</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Имя:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="address">Адрес доставки:</label>
          <input
            type="text"
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="phone">Номер телефона:</label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
        <div>
          <p>Общая стоимость: {totalPrice} T</p>
        </div>
        {/* Вставьте Stripe элемент для ввода карты */}
        <CardElement />

        {error && <p>{error}</p>}

        <button type="submit" disabled={isProcessing || isLoading}>
          {isProcessing
            ? "Обрабатываем..."
            : isLoading
            ? "Оформление заказа..."
            : "Подтвердить заказ"}
        </button>
      </form>
    </div>
  );
}

function StripeWrapper({ cartItems, totalPrice, onConfirmOrder }) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm
        cartItems={cartItems}
        totalPrice={totalPrice}
        onConfirmOrder={onConfirmOrder}
      />
    </Elements>
  );
}

export default StripeWrapper;
