import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import styles from './Cart.module.css';

const API_BASE_URL = 'https://api-tuyendung-cty.onrender.com/api';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [couponCode, setCouponCode] = useState('');
  const [discounts, setDiscounts] = useState([]);
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch cart items from localStorage
  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart_da')) || [];
    setCartItems(cart);
  }, []);

  // Fetch discount codes from API
  useEffect(() => {
    fetch(`${API_BASE_URL}/discount`)
      .then(res => res.json())
      .then(data => setDiscounts(data))
      .catch(() => setDiscounts([]));
  }, []);

  const formatPrice = price => new Intl.NumberFormat('vi-VN').format(price) + ' VND';

  const updateQuantity = (quantity, index) => {
    const newCart = [...cartItems];
    const item = newCart[index];
    const newQuantity = Math.max(1, parseInt(quantity));
    if (newQuantity > item.stock) {
      alert(`Chỉ còn tối đa ${item.stock} sản phẩm trong kho!`);
      item.quantity = item.stock;
    } else {
      item.quantity = newQuantity;
    }
    setCartItems(newCart);
    localStorage.setItem('cart_da', JSON.stringify(newCart));
  };

  const removeItem = index => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?')) {
      const newCart = cartItems.filter((_, i) => i !== index);
      setCartItems(newCart);
      localStorage.setItem('cart_da', JSON.stringify(newCart));
      setAppliedDiscount(null); // Reset discount if cart changes
      setErrorMessage('');
    }
  };

  const applyCoupon = () => {
    if (!couponCode.trim()) {
      setErrorMessage('Vui lòng nhập mã giảm giá!');
      setAppliedDiscount(null); // Reset discount if no code
      return;
    }

    const now = new Date();
    const coupon = discounts.find(d => d.code.toUpperCase() === couponCode.toUpperCase());

    if (!coupon) {
      setErrorMessage('Mã giảm giá không tồn tại!');
      setAppliedDiscount(null); // Reset discount if invalid
      return;
    }

    if (!coupon.isActive) {
      setErrorMessage('Mã giảm giá không hoạt động!');
      setAppliedDiscount(null); // Reset discount if inactive
      return;
    }

    if (new Date(coupon.expirationDate) < now) {
      setErrorMessage('Mã giảm giá đã hết hạn!');
      setAppliedDiscount(null); // Reset discount if expired
      return;
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      setErrorMessage('Mã giảm giá đã hết lượt sử dụng!');
      setAppliedDiscount(null); // Reset discount if usage limit reached
      return;
    }

    setAppliedDiscount(coupon);
    setErrorMessage(''); // Clear error message on successful application
    setCouponCode('');
    alert(`Mã giảm giá "${coupon.code}" đã được áp dụng thành công!`);
  };

  const checkout = () => {
    if (cartItems.length > 0) {
      // Placeholder for checkout logic
      alert('Tiến hành thanh toán...');
    } else {
      alert('Giỏ hàng trống!');
    }
  };

  const updateCart = () => {
    alert('Giỏ hàng đã được cập nhật!');
    setAppliedDiscount(null); // Reset discount if cart is updated
    setErrorMessage('');
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = appliedDiscount
    ? (subtotal * appliedDiscount.discountPercentage) / 100
    : 0;
  const grandTotal = subtotal - discountAmount;

  return (
    <div className={styles.container}>
      <div className={styles.cartSection}>
        {cartItems.length === 0 ? (
          <div className={styles.emptyCart}>
            <h3>Giỏ hàng trống</h3>
            <p>Bạn chưa có sản phẩm nào trong giỏ hàng</p>
            <Link to="/product" className={styles.continueShopping}>
              Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          <>
            <table className={styles.productTable}>
              <thead>
                <tr>
                  <th>SẢN PHẨM</th>
                  <th>GIÁ</th>
                  <th>SỐ LƯỢNG</th>
                  <th>THÀNH TIỀN</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <div className={styles.productInfo}>
                        <div className={styles.productImage}>
                          <img src={item.image} alt={item.name} style={{ width: 60, borderRadius: 8 }} />
                        </div>
                        <div className={styles.productDetails}>
                          <h3>{item.name}</h3>
                          <div className={styles.charmInfo}>Charm: {item.charm}</div>
                          <div className={styles.sizeInfo}>Size Viên Đá: {item.stoneSize}</div>
                          <div className={styles.sizeInfo}>Size Tay: {item.wristSize}</div>
                        </div>
                      </div>
                    </td>
                    <td className={styles.priceCell}>{formatPrice(item.price)}</td>
                    <td className={styles.quantityCell}>
                      <input
                        type="number"
                        className={styles.quantityInput}
                        value={item.quantity}
                        min="1"
                        onChange={e => updateQuantity(e.target.value, index)}
                      />
                    </td>
                    <td className={styles.totalCell}>{formatPrice(item.price * item.quantity)}</td>
                    <td>
                      <button
                        className={styles.removeBtn}
                        onClick={() => removeItem(index)}
                        title="Xóa sản phẩm"
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className={styles.couponSection}>
              <input
                type="text"
                className={styles.couponInput}
                placeholder="Mã giảm giá"
                value={couponCode}
                onChange={e => setCouponCode(e.target.value)}
              />
              <button className={styles.applyBtn} onClick={applyCoupon}>
                Áp dụng
              </button>
              {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
              {appliedDiscount && (
                <p className={styles.successMessage}>
                  Đã áp dụng mã "{appliedDiscount.code}" ({appliedDiscount.discountPercentage}% off)
                </p>
              )}
            </div>

            <div className={styles.bottomActions}>
              <Link to="/product" className={styles.continueShopping}>
                TIẾP TỤC MUA SẮM
              </Link>
              <button className={styles.updateCartBtn} onClick={updateCart}>
                Cập nhật giỏ hàng
              </button>
            </div>
          </>
        )}
      </div>

      <div className={styles.summarySection}>
        <h2 className={styles.summaryTitle}>TỔNG CỘNG</h2>
        <div className={styles.summaryContent}>
          <table className={styles.summaryTable}>
            <tbody>
              <tr>
                <td className={styles.labelCell}>Thành tiền</td>
                <td className={styles.valueCell}>{formatPrice(subtotal)}</td>
              </tr>
              {appliedDiscount && (
                <tr>
                  <td className={styles.labelCell}>Giảm giá ({appliedDiscount.discountPercentage}%)</td>
                  <td className={styles.valueCell}>-{formatPrice(discountAmount)}</td>
                </tr>
              )}
              <tr className={styles.totalRow}>
                <td className={styles.labelCell}>Tổng tiền</td>
                <td className={styles.valueCell}>{formatPrice(grandTotal)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <button className={styles.checkoutBtn} onClick={checkout}>
          MUA HÀNG
        </button>
      </div>
    </div>
  );
};

export default Cart;