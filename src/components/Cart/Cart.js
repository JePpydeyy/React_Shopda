import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import styles from './Cart.module.css';
import ToastNotification from '../ToastNotification/ToastNotification';

const API_BASE_URL = process.env.REACT_APP_API_URL;

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [showPopup, setShowPopup] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);
  const navigate = useNavigate();

  // Load cart from localStorage on mount
  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart_da')) || [];
    setCartItems(cart);
  }, []);

  // Format price in VND
  const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + ' VND';

  // Update item quantity
  const updateQuantity = (index, newQuantity) => {
    const quantity = Math.max(1, parseInt(newQuantity) || 1);
    const newCart = [...cartItems];
    const item = newCart[index];
    if (quantity > item.stock) {
      setToastMessage(`Chỉ còn ${item.stock} sản phẩm trong kho!`);
      setToastType('error');
      setShowToast(true);
      newCart[index].quantity = item.stock;
    } else {
      newCart[index].quantity = quantity;
    }
    setCartItems(newCart);
    localStorage.setItem('cart_da', JSON.stringify(newCart));
    setAppliedDiscount(null); // Clear discount on cart update
    setToastMessage('Giỏ hàng đã được cập nhật!');
    setToastType('success');
    setShowToast(true);
  };

  // Increase item quantity
  const increaseQuantity = (index) => {
    updateQuantity(index, cartItems[index].quantity + 1);
  };

  // Decrease item quantity
  const decreaseQuantity = (index) => {
    if (cartItems[index].quantity > 1) {
      updateQuantity(index, cartItems[index].quantity - 1);
    }
  };

  // Open confirmation popup for item removal
  const openPopup = (index) => {
    setItemToRemove(index);
    setShowPopup(true);
  };

  // Close confirmation popup
  const closePopup = () => {
    setShowPopup(false);
    setItemToRemove(null);
  };

  // Confirm item removal
  const confirmRemove = () => {
    if (itemToRemove !== null) {
      const newCart = cartItems.filter((_, i) => i !== itemToRemove);
      setCartItems(newCart);
      localStorage.setItem('cart_da', JSON.stringify(newCart));
      setAppliedDiscount(null); // Clear discount on item removal
      setToastMessage('Sản phẩm đã được xóa khỏi giỏ hàng!');
      setToastType('success');
      setShowToast(true);
    }
    closePopup();
  };

  // Apply coupon code
  const applyCoupon = async () => {
    if (!cartItems.length) {
      setToastMessage('Giỏ hàng trống, không thể áp dụng mã giảm giá!');
      setToastType('error');
      setShowToast(true);
      return;
    }

    const trimmedCouponCode = couponCode.trim();
    if (!trimmedCouponCode) {
      setToastMessage('Vui lòng nhập mã giảm giá!');
      setToastType('error');
      setShowToast(true);
      return;
    }

    const couponCodeRegex = /^[A-Za-z0-9-]+$/;
    if (!couponCodeRegex.test(trimmedCouponCode)) {
      setToastMessage('Mã giảm giá chỉ được chứa chữ cái, số và dấu gạch ngang!');
      setToastType('error');
      setShowToast(true);
      return;
    }

    try {
      const subtotal = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1), 0);
      const response = await axios.post(`${API_BASE_URL}/discount/preview`, {
        code: trimmedCouponCode,
        totalAmount: subtotal
      });

      const { discountCode, discountPercentage, grandTotal } = response.data;
      const discount = { code: discountCode, discountPercentage, grandTotal };
      setAppliedDiscount(discount);
      setCouponCode('');
      setToastMessage(`Mã giảm giá ${discountCode} đã được áp dụng!`);
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      setAppliedDiscount(null);
      const errorMsg = error.response?.data?.message || 'Có lỗi xảy ra khi áp dụng mã giảm giá!';
      setToastMessage(errorMsg);
      setToastType('error');
      setShowToast(true);
    }
  };

  // Navigate to checkout with discount data
  const checkout = () => {
    if (cartItems.length > 0) {
      navigate('/checkout', { state: { appliedDiscount } });
    } else {
      setToastMessage('Giỏ hàng trống!');
      setToastType('error');
      setShowToast(true);
    }
  };

  // Close toast notification
  const handleToastClose = () => {
    setShowToast(false);
  };

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1), 0);
  const discountAmount = appliedDiscount ? (subtotal * appliedDiscount.discountPercentage) / 100 : 0;
  const grandTotal = appliedDiscount ? appliedDiscount.grandTotal : subtotal;

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
            <h2>Giỏ Hàng</h2>
            <div className={styles.desktopView}>
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
                            {/* <div className={styles.charmInfo}>Charm: {item.charm || 'N/A'}</div> */}
                            <div className={styles.sizeInfo}>Size: {item.size_name || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className={styles.priceCell}>{formatPrice(item.price)}</td>
                      <td className={styles.quantityCell}>
                        <div className={styles.quantityControls}>
                          <button
                            className={styles.quantityBtn}
                            onClick={() => decreaseQuantity(index)}
                            disabled={item.quantity <= 1}
                          >
                            <FontAwesomeIcon icon={faMinus} />
                          </button>
                          <input
                            type="number"
                            className={styles.quantityInput}
                            value={item.quantity}
                            min="1"
                            max={item.stock}
                            onChange={(e) => updateQuantity(index, e.target.value)}
                          />
                          <button
                            className={styles.quantityBtn}
                            onClick={() => increaseQuantity(index)}
                            disabled={item.quantity >= item.stock}
                          >
                            <FontAwesomeIcon icon={faPlus} />
                          </button>
                        </div>
                      </td>
                      <td className={styles.totalCell}>{formatPrice((parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1))}</td>
                      <td>
                        <button
                          className={styles.removeBtn}
                          onClick={() => openPopup(index)}
                          title="Xóa sản phẩm"
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className={styles.mobileView}>
              {cartItems.map((item, index) => (
                <div key={index} className={styles.mobileCard}>
                  <div className={styles.mobileCardHeader}>
                    <div className={styles.mobileProductInfo}>
                      <div className={styles.mobileProductImage}>
                        <img src={item.image} alt={item.name} />
                      </div>
                      <div className={styles.mobileProductDetails}>
                        <h3>{item.name}</h3>
                        <div className={styles.charmInfo}>Charm: {item.charm || 'N/A'}</div>
                        <div className={styles.sizeInfo}>Size: {item.size_name || 'N/A'}</div>
                      </div>
                    </div>
                    <button
                      className={styles.mobileRemoveBtn}
                      onClick={() => openPopup(index)}
                      title="Xóa sản phẩm"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </div>
                  <div className={styles.mobileCardBody}>
                    <div className={styles.mobilePriceRow}>
                      <span>Giá:</span>
                      <span className={styles.price}>{formatPrice(item.price)}</span>
                    </div>
                    <div className={styles.mobileQuantityRow}>
                      <span>Số lượng:</span>
                      <div className={styles.mobileQuantityControls}>
                        <button
                          className={styles.quantityBtn}
                          onClick={() => decreaseQuantity(index)}
                          disabled={item.quantity <= 1}
                        >
                          <FontAwesomeIcon icon={faMinus} />
                        </button>
                        <input
                          type="number"
                          className={styles.quantityInput}
                          value={item.quantity}
                          min="1"
                          max={item.stock}
                          onChange={(e) => updateQuantity(index, e.target.value)}
                        />
                        <button
                          className={styles.quantityBtn}
                          onClick={() => increaseQuantity(index)}
                          disabled={item.quantity >= item.stock}
                        >
                          <FontAwesomeIcon icon={faPlus} />
                        </button>
                      </div>
                    </div>
                    <div className={styles.mobileTotalRow}>
                      <span>Thành tiền:</span>
                      <span className={styles.total}>{formatPrice((parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1))}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.couponSection}>
              <input
                type="text"
                className={styles.couponInput}
                placeholder="Mã giảm giá"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
              />
              <button className={styles.applyBtn} onClick={applyCoupon}>
                Áp dụng
              </button>
            </div>
            <div className={styles.bottomActions}>
              <Link to="/product" className={styles.continueShopping}>
                TIẾP TỤC MUA SẮM
              </Link>
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
      {showToast && (
        <ToastNotification
          message={toastMessage}
          type={toastType}
          onClose={handleToastClose}
        />
      )}
      {showPopup && (
        <div className={styles.popupOverlay} onClick={closePopup}>
          <div className={styles.popupContent} onClick={(e) => e.stopPropagation()}>
            <h3>Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?</h3>
            <div className={styles.popupButtons}>
              <button className={styles.okBtn} onClick={confirmRemove}>OK</button>
              <button className={styles.cancelBtn} onClick={closePopup}>Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;