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
  const [errorMessage, setErrorMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [showPopup, setShowPopup] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart_da')) || [];
    setCartItems(cart);

    const savedDiscount = JSON.parse(localStorage.getItem('applied_discount'));
    if (savedDiscount) {
      setAppliedDiscount(savedDiscount);
    } else {
      setAppliedDiscount(null);
    }
    setErrorMessage('');
  }, []);

  const formatPrice = price => new Intl.NumberFormat('vi-VN').format(price) + ' VND';

  const updateQuantity = (quantity, index) => {
    const newCart = [...cartItems];
    const item = newCart[index];
    const newQuantity = Math.max(1, parseInt(quantity));
    if (newQuantity > item.stock) {
      setToastMessage(`Chỉ còn tối đa ${item.stock} sản phẩm trong kho!`);
      setToastType('error');
      setShowToast(true);
      item.quantity = item.stock;
    } else {
      item.quantity = newQuantity;
    }
    setCartItems(newCart);
    localStorage.setItem('cart_da', JSON.stringify(newCart));
    setAppliedDiscount(null);
    localStorage.removeItem('applied_discount');
    setErrorMessage('');
  };

  const increaseQuantity = (index) => {
    const item = cartItems[index];
    updateQuantity(item.quantity + 1, index);
  };

  const decreaseQuantity = (index) => {
    const item = cartItems[index];
    if (item.quantity > 1) {
      updateQuantity(item.quantity - 1, index);
    }
  };

  const openPopup = (index) => {
    setItemToRemove(index);
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setItemToRemove(null);
  };

  const confirmRemove = () => {
    if (itemToRemove !== null) {
      const newCart = cartItems.filter((_, i) => i !== itemToRemove);
      setCartItems(newCart);
      localStorage.setItem('cart_da', JSON.stringify(newCart));
      setAppliedDiscount(null);
      localStorage.removeItem('applied_discount');
      setErrorMessage('');
      setToastMessage('Sản phẩm đã được xóa khỏi giỏ hàng!');
      setToastType('success');
      setShowToast(true);
    }
    closePopup();
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setErrorMessage('Vui lòng nhập mã giảm giá!');
      setAppliedDiscount(null);
      localStorage.removeItem('applied_discount');
      setToastMessage('Vui lòng nhập mã giảm giá!');
      setToastType('error');
      setShowToast(true);
      return;
    }

    try {
      const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const response = await axios.post(`${API_BASE_URL}/discounts/preview`, {
        code: couponCode,
        totalAmount: subtotal
      });

      const { discountCode, discountPercentage, grandTotal } = response.data;
      const discount = { code: discountCode, discountPercentage, grandTotal };
      setAppliedDiscount(discount);
      localStorage.setItem('applied_discount', JSON.stringify(discount));
      setErrorMessage('');
      setCouponCode('');
      setToastMessage(`Mã giảm giá ${discountCode} đã áp dụng thành công!`);
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      setAppliedDiscount(null);
      localStorage.removeItem('applied_discount');
      setErrorMessage(error.response?.data?.message || 'Có lỗi xảy ra khi áp dụng mã giảm giá!');
      setToastMessage(error.response?.data?.message || 'Có lỗi xảy ra khi áp dụng mã giảm giá!');
      setToastType('error');
      setShowToast(true);
    }
  };

  const checkout = () => {
    if (cartItems.length > 0) {
      // appliedDiscount đã được lưu vào localStorage trong applyCoupon
      navigate('/checkout');
    } else {
      setToastMessage('Giỏ hàng trống!');
      setToastType('error');
      setShowToast(true);
    }
  };

  const updateCart = () => {
    setToastMessage('Giỏ hàng đã được cập nhật!');
    setToastType('success');
    setShowToast(true);
    setAppliedDiscount(null);
    localStorage.removeItem('applied_discount');
    setErrorMessage('');
  };

  const handleToastClose = () => {
    setShowToast(false);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = appliedDiscount
    ? (subtotal * appliedDiscount.discountPercentage) / 100
    : 0;
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
            {/* Desktop Table View */}
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
                            <div className={styles.charmInfo}>Charm: {item.charm}</div>
                            <div className={styles.sizeInfo}>Size: {item.size_name}</div>
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
                            onChange={e => updateQuantity(e.target.value, index)}
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
                      <td className={styles.totalCell}>{formatPrice(item.price * item.quantity)}</td>
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

            {/* Mobile Card View */}
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
                        <div className={styles.charmInfo}>Charm: {item.charm}</div>
                        <div className={styles.sizeInfo}>Size: {item.size_name}</div>
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
                          onChange={e => updateQuantity(e.target.value, index)}
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
                      <span className={styles.total}>{formatPrice(item.price * item.quantity)}</span>
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
                onChange={e => setCouponCode(e.target.value)}
              />
              <button className={styles.applyBtn} onClick={applyCoupon}>
                Áp dụng
              </button>
              {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
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
          <div className={styles.popupContent} onClick={e => e.stopPropagation()}>
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