import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import styles from './Cart.module.css';

const Cart = () => {
  const [cartItems, setCartItems] = useState([
    {
      name: 'VÒNG APATITE BIỂN XANH',
      price: 2740000,
      quantity: 1,
      charm: 'Charm Kim Thọ',
      stoneSize: '10 Li (Phù Hợp Size Tay: 15cm-18cm)',
      wristSize: '12 cm',
    },
  ]);
  const [couponCode, setCouponCode] = useState('');

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + ' VND';

  const updateQuantity = (quantity) => {
    setCartItems([
      {
        ...cartItems[0],
        quantity: Math.max(1, parseInt(quantity)),
      },
    ]);
  };

  const removeItem = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?')) {
      setCartItems([]);
    }
  };

  const applyCoupon = () => {
    if (couponCode.trim()) {
      alert(`Mã giảm giá "${couponCode}" đang được xử lý...`);
      setCouponCode('');
    } else {
      alert('Vui lòng nhập mã giảm giá!');
    }
  };

  const checkout = () => {
    if (cartItems.length > 0) {
      const { quantity, price, name } = cartItems[0];
      const total = quantity * price;
      alert(
        `Tiến hành thanh toán:\n- Sản phẩm: ${name}\n- Số lượng: ${quantity}\n- Tổng tiền: ${formatPrice(total)}`
      );
    } else {
      alert('Giỏ hàng trống!');
    }
  };

  const updateCart = () => {
    alert('Giỏ hàng đã được cập nhật!');
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const grandTotal = subtotal; // Có thể thêm logic giảm giá sau này

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
                          <div className={styles.braceletVisual}>
                            {[...Array(8)].map((_, i) => (
                              <div key={i} className={styles.bead}></div>
                            ))}
                          </div>
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
                        onChange={(e) => updateQuantity(e.target.value)}
                      />
                    </td>
                    <td className={styles.totalCell}>{formatPrice(item.price * item.quantity)}</td>
                    <td>
                      <button
                        className={styles.removeBtn}
                        onClick={removeItem}
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
              <tr>
                <td className={styles.labelCell}>Giao Hàng</td>
                <td className={styles.valueCell}>
                  <div className={styles.shippingDetails}>
                    <div className={styles.freeShipping}>Miễn phí vận chuyển</div>
                    <div>Tùy chọn giao hàng sẽ được cập nhật trong quá trình thanh toán.</div>
                    <div className={styles.calcShipping}>Tính phí giao hàng</div>
                  </div>
                </td>
              </tr>
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