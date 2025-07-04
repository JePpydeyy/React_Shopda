import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import styles from './Checkout.module.css';
import ToastNotification from '../ToastNotification/ToastNotification';

const API_BASE_URL = process.env.REACT_APP_API_URL;

const Checkout = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    selectedDate: null,
    phone: '',
    email: '',
    country: 'vietnam',
    province: '',
    district: '',
    ward: '',
    addressDetail: '',
    note: ''
  });
  const [cartItems, setCartItems] = useState([]);
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [billInfo, setBillInfo] = useState(null);
  const [billCart, setBillCart] = useState([]);
  const [billDiscount, setBillDiscount] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
  const calendarRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Load cart and discount from location state, save discount to localStorage
  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart_da')) || [];
    setCartItems(cart);
    const discount = location.state?.appliedDiscount || null;
    if (discount && discount.code && discount.discountPercentage && discount.grandTotal) {
      setAppliedDiscount(discount);
      localStorage.setItem('applied_discount', JSON.stringify(discount));
    } else {
      setAppliedDiscount(null);
      localStorage.removeItem('applied_discount');
    }

    const fetchProvinces = async () => {
      try {
        const response = await fetch('https://provinces.open-api.vn/api/p/');
        const data = await response.json();
        setProvinces(data);
      } catch (error) {
        setToastMessage('Không thể tải danh sách tỉnh/thành phố.');
        setToastType('error');
        setShowToast(true);
      }
    };
    fetchProvinces();
  }, [location.state]);

  // Fetch districts when province changes
  useEffect(() => {
    if (formData.province) {
      const fetchDistricts = async () => {
        try {
          const response = await fetch(`https://provinces.open-api.vn/api/p/${formData.province}?depth=2`);
          const data = await response.json();
          setDistricts(data.districts || []);
          setFormData(prev => ({ ...prev, district: '', ward: '' }));
          setWards([]);
        } catch (error) {
          setToastMessage('Không thể tải danh sách quận/huyện.');
          setToastType('error');
          setShowToast(true);
        }
      };
      fetchDistricts();
    }
  }, [formData.province]);

  // Fetch wards when district changes
  useEffect(() => {
    if (formData.district) {
      const fetchWards = async () => {
        try {
          const response = await fetch(`https://provinces.open-api.vn/api/d/${formData.district}?depth=2`);
          const data = await response.json();
          setWards(data.wards || []);
          setFormData(prev => ({ ...prev, ward: '' }));
        } catch (error) {
          setToastMessage('Không thể tải danh sách xã/phường.');
          setToastType('error');
          setShowToast(true);
        }
      };
      fetchWards();
    }
  }, [formData.district]);

  // Handle calendar click outside
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

  // Render calendar dates
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

  // Set calendar to today
  const setToday = () => {
    const today = new Date();
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setFormData({ ...formData, selectedDate: today });
    setShowCalendar(false);
  };

  // Format price in VND
  const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + ' VND';

  // Handle order submission
  const handleOrder = async () => {
    const errors = [];
    if (!formData.fullName) errors.push('Họ và tên');
    if (!formData.phone) errors.push('Số điện thoại');
    if (!formData.email) errors.push('Email');
    if (!formData.province) errors.push('Tỉnh/Thành phố');
    if (!formData.district) errors.push('Quận/Huyện');
    if (!formData.ward) errors.push('Xã/Phường');
    if (!formData.addressDetail) errors.push('Địa chỉ chi tiết');
    if (errors.length > 0) {
      setToastMessage(`Vui lòng nhập: ${errors.join(', ')}.`);
      setToastType('error');
      setShowToast(true);
      return;
    }

    const phoneRegex = /^\d{10,11}$/;
    if (!phoneRegex.test(formData.phone)) {
      setToastMessage('Số điện thoại không hợp lệ (10-11 chữ số).');
      setToastType('error');
      setShowToast(true);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setToastMessage('Email không hợp lệ.');
      setToastType('error');
      setShowToast(true);
      return;
    }
    if (formData.selectedDate && formData.selectedDate > new Date()) {
      setToastMessage('Ngày sinh không được là ngày trong tương lai.');
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

    const subtotal = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1), 0);
    if (appliedDiscount && Math.abs(subtotal * (1 - appliedDiscount.discountPercentage / 100) - appliedDiscount.grandTotal) > 0.01) {
      setToastMessage('Tổng tiền giảm giá không khớp, vui lòng kiểm tra lại mã giảm giá.');
      setToastType('error');
      setShowToast(true);
      setAppliedDiscount(null);
      localStorage.removeItem('applied_discount');
      return;
    }

    setIsLoading(true);
    const orderData = {
      fullName: formData.fullName.trim(),
      dateOfBirth: formData.selectedDate ? formData.selectedDate.toISOString() : null,
      phoneNumber: formData.phone.trim(),
      email: formData.email.trim(),
      country: 'Việt Nam',
      city: provinces.find(p => p.code === parseInt(formData.province))?.name || '',
      district: districts.find(d => d.code === parseInt(formData.district))?.name || '',
      ward: wards.find(w => w.code === parseInt(formData.ward))?.code || '',
      address: formData.addressDetail.trim(),
      orderNote: formData.note ? formData.note.trim() : '',
      products: cartItems.map(item => ({
        productId: item._id || item.productId || '',
        productName: item.name || 'Unknown Product',
        size_name: item.size_name || 'N/A',
        quantity: parseInt(item.quantity) || 1,
        price: parseFloat(item.price) || 0
      })),
      totalAmount: subtotal,
      grandTotal: appliedDiscount ? appliedDiscount.grandTotal : subtotal,
      discountCode: appliedDiscount ? appliedDiscount.code : null
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/order`, orderData);
      setBillInfo({
        ...formData,
        provinceName: provinces.find(p => p.code === parseInt(formData.province))?.name || '',
        districtName: districts.find(d => d.code === parseInt(formData.district))?.name || '',
        wardName: wards.find(w => w.code === parseInt(formData.ward))?.name || ''
      });
      setBillCart([...cartItems]);
      setBillDiscount(appliedDiscount);

      localStorage.removeItem('cart_da');
      localStorage.removeItem('applied_discount');
      setCartItems([]);
      setAppliedDiscount(null);
      setFormData({
        fullName: '',
        selectedDate: null,
        phone: '',
        email: '',
        country: 'vietnam',
        province: '',
        district: '',
        ward: '',
        addressDetail: '',
        note: ''
      });
      setDistricts([]);
      setWards([]);
      setOrderSuccess(true);
      setToastMessage('Đặt hàng thành công! Đơn hàng đã được ghi nhận.');
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      console.error('Order error:', error);
      setToastMessage(error.response?.data?.message || 'Có lỗi xảy ra khi đặt hàng.');
      setToastType('error');
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Close toast notification
  const handleToastClose = () => {
    setShowToast(false);
  };

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1), 0);
  const discountAmount = appliedDiscount ? (subtotal * (appliedDiscount.discountPercentage || 0)) / 100 : 0;
  const grandTotal = appliedDiscount ? appliedDiscount.grandTotal : subtotal;

  // Success page rendering
  if (orderSuccess) {
    const billSubtotal = billCart.reduce((sum, item) => sum + (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1), 0);
    const billDiscountAmount = billDiscount ? (billSubtotal * (billDiscount.discountPercentage || 0)) / 100 : 0;
    const billGrandTotal = billSubtotal - billDiscountAmount;

    return (
      <div className={styles.successContainer}>
        <div className={styles.successBox} id="bill-print">
          <h2>ĐẶT HÀNG THÀNH CÔNG</h2>
          <p>Cảm ơn bạn đã đặt hàng tại cửa hàng của chúng tôi.</p>
          <h3>HÓA ĐƠN ĐẶT HÀNG</h3>
          <div className={styles.billInfo}>
            <p><b>Khách hàng:</b> {billInfo?.fullName}</p>
            <p><b>Ngày sinh:</b> {billInfo?.selectedDate ? billInfo.selectedDate.toLocaleDateString('vi-VN') : 'Không có'}</p>
            <p><b>SĐT:</b> {billInfo?.phone}</p>
            <p><b>Email:</b> {billInfo?.email}</p>
            <p>
              <b>Địa chỉ:</b> {billInfo?.addressDetail}
              {billInfo?.wardName && `, ${billInfo.wardName}`}
              {billInfo?.districtName && `, ${billInfo.districtName}`}
              {billInfo?.provinceName && `, ${billInfo.provinceName}`}
            </p>
            {billInfo?.note && <p><b>Ghi chú:</b> {billInfo.note}</p>}
          </div>
          <table className={styles.billTable}>
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Số lượng</th>
                <th>Đơn giá</th>
                <th>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {billCart.map((item, idx) => (
                <tr key={idx}>
                  <td>
                    {item.name}
                    {item.size_name && <span> ({item.size_name})</span>}
                  </td>
                  <td>{item.quantity}</td>
                  <td>{formatPrice(item.price)}</td>
                  <td>{formatPrice((parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1))}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className={styles.billTotal}>
            <p>Thành tiền: <b>{formatPrice(billSubtotal)}</b></p>
            {billDiscount && (
              <p>Giảm giá ({billDiscount.discountPercentage || 0}%): <b>-{formatPrice(billDiscountAmount)}</b></p>
            )}
            <p>Tổng cộng: <b>{formatPrice(billGrandTotal)}</b></p>
            <p>Giao hàng: <b>Miễn phí vận chuyển</b></p>
          </div>
          <p style={{ marginTop: 16 }}>Đơn hàng của bạn đã được ghi nhận. Vui lòng để ý điện thoại, nhân viên sẽ liên hệ xác nhận trong 1-2 ngày tới.</p>
          <div style={{ marginTop: 24 }}>
            <button className={styles.successBtn} onClick={() => navigate('/')}>Về trang chủ</button>
          </div>
        </div>
      </div>
    );
  }

  // Checkout form rendering
  return (
    <div className={styles.container}>
      <h1>Đặt Hàng</h1>
      <div className={styles.formContainer}>
        <div className={styles.customerInfo}>
          <h2>THÔNG TIN KHÁCH HÀNG</h2>
          
          <div className={styles.formGroup}>
            <label htmlFor="full-name">Họ và tên *</label>
            <input
              type="text"
              id="full-name"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Họ tên của bạn"
            />
          </div>
          <div className={styles.formGroup}>
            <div className={styles.datePicker} ref={calendarRef}>
                
              {showCalendar && (
                <div className={styles.calendarPopup}>
                  <div className={styles.calendarHeader}>
                    <select
                      id="month-select"
                      value={currentMonth}
                      onChange={(e) => setCurrentMonth(parseInt(e.target.value))}
                    >
                      {monthNames.map((month, index) => (
                        <option key={index} value={index}>{month}</option>
                      ))}
                    </select>
                    <select
                      id="year-select"
                      value={currentYear}
                      onChange={(e) => setCurrentYear(parseInt(e.target.value))}
                    >
                      {Array.from({ length: new Date().getFullYear() - 1899 }, (_, i) => new Date().getFullYear() - i).map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                    <button onClick={setToday}>Hôm nay</button>
                    <button onClick={() => setShowCalendar(false)}>Đóng</button>
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
              <label htmlFor="phone">Số điện thoại *</label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Số điện thoại của bạn"
              />
            </div>
            <div className={styles.email}>
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Email của bạn"
              />
            </div>
          </div>
          <div className={`${styles.formGroup} ${styles.mergeForms}`}>
            <div className={styles.country}>
              <label htmlFor="country">Quốc gia *</label>
              <select
                id="country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              >
                <option value="vietnam">Việt Nam</option>
              </select>
            </div>
            <div className={styles.province}>
              <label htmlFor="province">Tỉnh/Thành phố *</label>
              <select
                id="province"
                value={formData.province}
                onChange={(e) => setFormData({ ...formData, province: e.target.value })}
              >
                <option value="">Chọn tỉnh/thành phố</option>
                {provinces.map(province => (
                  <option key={province.code} value={province.code}>{province.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className={`${styles.formGroup} ${styles.mergeForms}`}>
            <div className={styles.districtWard}>
              <label htmlFor="district">Quận/Huyện *</label>
              <select
                id="district"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                disabled={!formData.province}
              >
                <option value="">Chọn quận/huyện</option>
                {districts.map(district => (
                  <option key={district.code} value={district.code}>{district.name}</option>
                ))}
              </select>
            </div>
            <div className={styles.ward}>
              <label htmlFor="ward">Xã/Phường *</label>
              <select
                id="ward"
                value={formData.ward}
                onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                disabled={!formData.district}
              >
                <option value="">Chọn xã/phường</option>
                {wards.map(ward => (
                  <option key={ward.code} value={ward.code}>{ward.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="address-detail">Địa chỉ chi tiết *</label>
            <input
              type="text"
              id="address-detail"
              value={formData.addressDetail}
              onChange={(e) => setFormData({ ...formData, addressDetail: e.target.value })}
              placeholder="Ví dụ: Số 20, ngõ 90"
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="note">Ghi chú đặt hàng (không bắt buộc)</label>
            <textarea
              id="note"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="Ghi chú cho đơn hàng của bạn (không bắt buộc)"
            />
          </div>
        </div>
        <div className={styles.orderInfo}>
          <h2>THÔNG TIN ĐƠN HÀNG</h2>
          {cartItems.length > 0 ? (
            <div className={styles.productList}>
              {cartItems.map((item, index) => (
                <div key={index} className={styles.productGroup}>
                  <p className={styles.productName}>
                    {item.name} x {item.quantity} - {formatPrice((parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1))}
                  </p>
                  <p className={styles.productDetails}>
                    Size: {item.size_name || 'N/A'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p>Giỏ hàng trống</p>
          )}
          <div className={styles.order}>
            <div className={`${styles.orderItem} ${styles.total}`}>
              <p>Thành tiền</p>
              <p>{formatPrice(subtotal)}</p>
            </div>
            {appliedDiscount && (
              <div className={styles.orderItem}>
                <p>Giảm giá ({appliedDiscount.discountPercentage || 0}%)</p>
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
              disabled={isLoading}
              className={styles.orderBtn}
            >
              {isLoading ? 'Đang xử lý...' : 'ĐẶT HÀNG'}
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