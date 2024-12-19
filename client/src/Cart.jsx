import React, { useState, useEffect } from "react";
import CheckoutForm from "./CheckoutForm";

function Cart({
  cartItems,
  removeFromCart,
  onCloseCart,
  updateCartItems,
  clearCart,
}) {
  const [updatedCartItems, setUpdatedCartItems] = useState(cartItems);

  // Синхронизация с родительским компонентом при изменении корзины
  useEffect(() => {
    setUpdatedCartItems(cartItems);
  }, [cartItems]);

  const handleClearCart = () => {
    // Очищаем корзину
    clearCart(); // Передаем функцию очистки корзины
  };
  // Функция для изменения количества товара
  const handleChangeQuantity = (product, delta) => {
    const updatedCart = updatedCartItems.map((item) => {
      if (item._id === product._id) {
        const updatedCount = item.count + delta;
        return updatedCount > 0 ? { ...item, count: updatedCount } : item;
      }
      return item;
    });
    setUpdatedCartItems(updatedCart);
    updateCartItems(updatedCart); // Обновляем корзину в родительском компоненте
  };

  const calculateTotalPrice = () => {
    return updatedCartItems.reduce(
      (total, item) => total + item.price * item.count,
      0
    );
  };

  const totalPrice = calculateTotalPrice();

  return (
    <div className="cart">
      <button className="close-cart" onClick={onCloseCart}>
        &times;
      </button>
      <h2>Корзина</h2>
      {updatedCartItems.length === 0 ? (
        <p>Корзина пуста</p>
      ) : (
        <div>
          {updatedCartItems.map((product, index) => (
            <div key={index} className="cart-item">
              <img
                src={`http://localhost:5000${product.imageUrl}`}
                alt={product.title}
              />
              <div>{product.title}</div>
              <div>{product.price} T</div>

              {/* Кнопки для изменения количества */}
              <div className="cart-item-quantity">
                <button onClick={() => handleChangeQuantity(product, -1)}>
                  -
                </button>
                <span>{product.count}</span>
                <button onClick={() => handleChangeQuantity(product, 1)}>
                  +
                </button>
              </div>

              <button onClick={() => removeFromCart(product)}>Удалить</button>
            </div>
          ))}
          <div className="cart-total">
            <p>Общая стоимость: {totalPrice} T</p>
            <CheckoutForm
              cartItems={updatedCartItems}
              totalPrice={totalPrice}
              onConfirmOrder={handleClearCart}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
