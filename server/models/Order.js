const mongoose = require("mongoose");

// Схема заказа
const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Ссылка на модель пользователя
    required: true,
  }, // Идентификатор пользователя, связанный с заказом
  name: { type: String, required: true }, // Имя заказчика
  address: { type: String, required: true }, // Адрес доставки
  phone: { type: String, required: true }, // Номер телефона
  cartItems: [
    {
      title: { type: String, required: true }, // Название товара
      count: { type: Number, required: true }, // Количество товара
      price: { type: Number, required: true }, // Цена за единицу товара
      imageUrl: { type: String, required: true },
    },
  ],
  totalPrice: { type: Number, required: true }, // Общая стоимость заказа
  status: {
    type: String,
    enum: ["В обработке", "Подтвержден", "Отменен"],
    default: "В обработке",
  }, // Статус заказа
  createdAt: { type: Date, default: Date.now }, // Дата создания заказа
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
