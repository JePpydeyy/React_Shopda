import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Checkout.module.css';
import ToastNotification from '../ToastNotification/ToastNotification';
import QRCode from 'qrcode.react'; // Thêm thư viện qrcode.react

const API_BASE_URL = 'https://api-tuyendung-cty.onrender.com/api';

const Checkout = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    selectedDate: null,
    phone: '',
    email: '',
    country: '',
    province: '',
    district: '',
    ward: '',
    addressDetail: '',
    note: '',
    paymentMethod: 'bank_transfer', // Mặc định là chuyển khoản
  });
  const [cartItems, setCartItems] = useState([]);
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
  const calendarRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart_da')) || [];
    const discount = JSON.parse(localStorage.getItem('applied_discount')) || null;
    setCartItems(cart);
    setAppliedDiscount(discount);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        setShowCalendar(false);
      }
    };
    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCalendar]);

  const renderCalendar = () => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const dates = [];
    for (let i = 0; i < startingDay; i++) dates.push(<div key={`empty-${i}`} />);
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentYear, currentMonth, i);
      dates.push(
        <div
          key={i}
          className={formData.selectedDate && formData.selectedDate.toDateString() === date.toDateString() ? styles.selectedDate : ''}
          onClick={() => {
            setFormData({ ...formData, selectedDate: date });
            setShowCalendar(false);
          }}
        >
          {i}
        </div>
      );
    }
    return dates;
  };

  const setToday = () => {
    const today = new Date();
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setFormData({ ...formData, selectedDate: today });
    setShowCalendar(false);
  };

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + ' VND';

  const updateProductStock = async (productId, sizeName, quantity) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          size: [{ size_name: sizeName, stock: -quantity }],
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Lỗi cập nhật số lượng sản phẩm');
      }
      const data = await response.json();
      console.log('Cập nhật stock thành công:', data);
    } catch (error) {
      console.error('Lỗi cập nhật stock:', error.message);
    }
  };

  const handleOrder = async () => {
    if (!formData.fullName || !formData.selectedDate || !formData.phone || !formData.email || !formData.province || !formData.district || !formData.ward || !formData.addressDetail) {
      setToastMessage('Mời bạn nhập đầy đủ thông tin.');
      setToastType('error');
      setShowToast(true);
      return;
    }

    if (cartItems.length === 0) {
      setToastMessage('Giỏ hàng trống! Vui lòng thêm sản phẩm trước khi đặt hàng.');
      setToastType('error');
      setShowToast(true);
      return;
    }

    const orderData = {
      fullName: formData.fullName,
      dateOfBirth: formData.selectedDate.toISOString().split('T')[0],
      phoneNumber: formData.phone,
      email: formData.email,
      country: formData.country,
      city: formData.province,
      district: formData.district,
      ward: formData.ward,
      address: formData.addressDetail,
      orderNote: formData.note,
      products: cartItems.map(item => ({
        productId: item._id || item.productId,
        productName: item.name,
        quantity: item.quantity,
        price: item.price,
        size_name: item.size_name,
      })),
      totalAmount: cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
      grandTotal: appliedDiscount
        ? cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0) -
          (cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0) * appliedDiscount.discountPercentage) / 100
        : cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
      status: 'Chờ xử lý',
      paymentMethod: formData.paymentMethod,
    };

    try {
      const orderResponse = await fetch(`${API_BASE_URL}/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      if (!orderResponse.ok) throw new Error('Đã có lỗi khi gửi đơn hàng.');

      const orderResult = await orderResponse.json();
      const paymentReference = orderResult.paymentReference;

      // Giảm stock cho mỗi sản phẩm trong giỏ hàng
      for (const item of cartItems) {
        const productId = item._id || item.productId;
        const sizeName = item.size_name;
        const quantity = item.quantity;
        if (sizeName) {
          await updateProductStock(productId, sizeName, quantity);
        } else {
          console.warn(`Không tìm thấy size_name cho sản phẩm ${productId}, bỏ qua cập nhật stock.`);
        }
      }

      if (appliedDiscount) {
        const discountResponse = await fetch(`${API_BASE_URL}/discount/apply`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: appliedDiscount.code }),
        });
        if (!discountResponse.ok) throw new Error('Đã có lỗi khi cập nhật mã giảm giá.');
        const data = await discountResponse.json();
        if (data.message && data.message.includes('thành công')) {
          setToastMessage('Đặt hàng thành công!');
          setToastType('success');
        } else {
          setToastMessage(data.message || 'Đặt hàng thành công nhưng có vấn đề với mã giảm giá.');
          setToastType('warning');
        }
      } else {
        setToastMessage('Đặt hàng thành công!');
        setToastType('success');
      }
      setShowToast(true);

      // Chuyển hướng dựa trên phương thức thanh toán
      if (formData.paymentMethod === 'bank_transfer') {
        setTimeout(() => {
          navigate(`/payment-online?orderId=${paymentReference}&amount=${orderData.grandTotal}`);
        }, 2000);
      } else {
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }

      // Xóa giỏ hàng khỏi localStorage
      localStorage.removeItem('cart_da');
      localStorage.removeItem('applied_discount');
      setCartItems([]);
      setAppliedDiscount(null);
      setFormData({
        fullName: '',
        selectedDate: null,
        phone: '',
        email: '',
        country: '',
        province: '',
        district: '',
        ward: '',
        addressDetail: '',
        note: '',
        paymentMethod: 'bank_transfer',
      });
    } catch (error) {
      setToastMessage('Đã có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.');
      setToastType('error');
      setShowToast(true);
      console.error('Error:', error.message);
    }
  };

  const handleToastClose = () => {
    setShowToast(false);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = appliedDiscount ? (subtotal * appliedDiscount.discountPercentage) / 100 : 0;
  const grandTotal = subtotal - discountAmount;

  return (
    <div className={styles.container}>
      <h1 className={`${styles.container} h1`}>Đặt Hàng</h1>
      <div className={styles.formContainer}>
        <div className={styles.customerInfo}>
          <h2 className={`${styles.customerInfo} h2`}>THÔNG TIN KHÁCH HÀNG</h2>
          <p className={styles.error} style={{ display: !formData.fullName || !formData.selectedDate || !formData.phone || !formData.email || !formData.province || !formData.district || !formData.ward || !formData.addressDetail ? 'block' : 'none' }}>
            Mời bạn nhập đầy đủ thông tin.
          </p>
          <div className={styles.formGroup}>
            <label htmlFor="full-name" className={`${styles.formGroup} label`}>Họ và tên *</label>
            <input
              type="text"
              id="full-name"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Họ tên của bạn"
              className={`${styles.formGroup} input`}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="birth-date" className={`${styles.formGroup} label`}>Ngày sinh *</label>
            <div className={styles.datePicker} ref={calendarRef}>
              <input
                type="text"
                id="selected-date"
                value={formData.selectedDate ? `${formData.selectedDate.getDate()} ${monthNames[formData.selectedDate.getMonth()]} ${formData.selectedDate.getFullYear()}` : ''}
                placeholder="Chọn ngày sinh"
                readOnly
                className={`${styles.datePicker} #selectedDate`}
              />
              <button
                className={styles.calendarBtn}
                onClick={() => setShowCalendar(!showCalendar)}
              >
                📅
              </button>
              {showCalendar && (
                <div className={styles.calendarPopup} style={{ display: showCalendar ? 'block' : 'none' }}>
                  <div className={styles.calendarHeader}>
                    <select
                      id="month-select"
                      value={currentMonth}
                      onChange={(e) => setCurrentMonth(parseInt(e.target.value))}
                      className={`${styles.calendarHeader} select`}
                    >
                      {monthNames.map((month, index) => (
                        <option key={index} value={index}>{month}</option>
                      ))}
                    </select>
                    <select
                      id="year-select"
                      value={currentYear}
                      onChange={(e) => setCurrentYear(parseInt(e.target.value))}
                      className={`${styles.calendarHeader} select`}
                    >
                      {Array.from({ length: new Date().getFullYear() - 1899 }, (_, i) => new Date().getFullYear() - i).map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                    <button onClick={setToday} className={`${styles.calendarHeader} button`}>Hôm nay</button>
                    <button onClick={() => setShowCalendar(false)} className={`${styles.calendarHeader} button`}>Đóng</button>
                  </div>
                  <div className={styles.calendarDays}>
                    <div>H</div><div>B</div><div>T</div><div>N</div><div>S</div><div>B</div><div>C</div>
                  </div>
                  <div className={styles.calendarDates}>
                    {renderCalendar()}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className={`${styles.formGroup} ${styles.mergeForms}`}>
            <div className={styles.sdt}>
              <label htmlFor="phone" className={`${styles.formGroup} label`}>Số điện thoại *</label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Số điện thoại của bạn"
                className={`${styles.formGroup} input`}
              />
            </div>
            <div className={styles.email}>
              <label htmlFor="email" className={`${styles.formGroup} label`}>Email *</label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Email của bạn"
                className={`${styles.formGroup} input`}
              />
            </div>
          </div>
          <div className={`${styles.formGroup} ${styles.mergeForms}`}>
            <div className={styles.country}>
              <label htmlFor="country" className={`${styles.formGroup} label`}>Quốc gia *</label>
              <input
                type="text"
                id="country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="Nhập quốc gia"
                className={`${styles.formGroup} input`}
              />
            </div>
            <div className={styles.province}>
              <label htmlFor="province" className={`${styles.formGroup} label`}>Tỉnh/Thành phố *</label>
              <input
                type="text"
                id="province"
                value={formData.province}
                onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                placeholder="Nhập tỉnh/thành phố"
                className={`${styles.formGroup} input`}
              />
            </div>
          </div>
          <div className={`${styles.formGroup} ${styles.mergeForms}`}>
            <div className={styles.districtWard}>
              <label htmlFor="district" className={`${styles.formGroup} label`}>Quận/Huyện *</label>
              <input
                type="text"
                id="district"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                placeholder="Nhập quận/huyện"
                className={`${styles.formGroup} input`}
              />
            </div>
            <div className={styles.ward}>
              <label htmlFor="ward" className={`${styles.formGroup} label`}>Xã/Phường *</label>
              <input
                type="text"
                id="ward"
                value={formData.ward}
                onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                placeholder="Nhập xã/phường"
                className={`${styles.formGroup} input`}
              />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="address-detail" className={`${styles.formGroup} label`}>Địa chỉ *</label>
            <input
              type="text"
              id="address-detail"
              value={formData.addressDetail}
              onChange={(e) => setFormData({ ...formData, addressDetail: e.target.value })}
              placeholder="Ví dụ: Số 20, ngõ 90"
              className={`${styles.formGroup} input`}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="note" className={`${styles.formGroup} label`}>Ghi chú đặt hàng</label>
            <textarea
              id="note"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="Ghi chú cho đơn hàng của bạn"
              className={`${styles.formGroup} textarea`}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="payment-method" className={`${styles.formGroup} label`}>Phương thức thanh toán *</label>
            <select
              id="payment-method"
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              className={`${styles.formGroup} input`}
            >
              <option value="bank_transfer">Chuyển khoản (Online)</option>
              <option value="cod">Trả khi nhận hàng (COD)</option>
            </select>
          </div>
        </div>
        <div className={styles.orderInfo}>
          <h2 className={`${styles.orderInfo} h2`}>THÔNG TIN ĐƠN HÀNG</h2>
          {cartItems.length > 0 && (
            <div className={styles.productList}>
              {cartItems.map((item, index) => (
                <div key={index} className={styles.productGroup}>
                  <p className={styles.productName}>{item.name} x {item.quantity} - {formatPrice(item.price * item.quantity)}</p>
                  <p className={styles.productDetails}>
                    Chất: {item.charm}, Size Viên Đá: {item.stoneSize}, Size Tay: {item.wristSize}
                  </p>
                </div>
              ))}
            </div>
          )}
          <div className={styles.order}>
            <div className={`${styles.orderItem} ${styles.total}`}>
              <p>Thành tiền</p>
              <p>{formatPrice(subtotal)}</p>
            </div>
            {appliedDiscount && (
              <div className={styles.orderItem}>
                <p>Giảm giá ({appliedDiscount.discountPercentage}%)</p>
                <p>-{formatPrice(discountAmount)}</p>
              </div>
            )}
            <div className={`${styles.orderItem} ${styles.total}`}>
              <p>Tổng tiền</p>
              <p>{formatPrice(grandTotal)}</p>
            </div>
            <div className={styles.orderItem}>
              <p>Giao Hàng</p>
              <p>Miễn phí vận chuyển</p>
            </div>
            <div className={`${styles.orderItem} ${styles.total}`}>
              <p>Tổng cộng</p>
              <p>{formatPrice(grandTotal)}</p>
            </div>
          </div>
          <div className={styles.orderBtn}>
            <button
              onClick={handleOrder}
              className={`${styles.orderBtn} button`}
            >
              ĐẶT HÀNG
            </button>
          </div>
        </div>
      </div>
      {showToast && (
        <ToastNotification
          message={toastMessage}
          type={toastType}
          onClose={handleToastClose}
        />
      )}
    </div>
  );
};

export default Checkout;