import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Checkout.module.css';
import ToastNotification from '../ToastNotification/ToastNotification';

const API_BASE_URL = 'http://localhost:10000/api';

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
    note: '',
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
  const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
  const calendarRef = useRef(null);
  const navigate = useNavigate();

  // Fetch provinces on component mount
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await fetch('https://provinces.open-api.vn/api/p/');
        const data = await response.json();
        setProvinces(data);
      } catch (error) {
        console.error('Error fetching provinces:', error);
        setToastMessage('Không thể tải danh sách tỉnh/thành phố.');
        setToastType('error');
        setShowToast(true);
      }
    };
    fetchProvinces();

    const cart = JSON.parse(localStorage.getItem('cart_da')) || [];
    const discount = JSON.parse(localStorage.getItem('applied_discount')) || null;
    setCartItems(cart);
    setAppliedDiscount(discount);
  }, []);

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
          console.error('Error fetching districts:', error);
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
          console.error('Error fetching wards:', error);
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
    if (!sizeName || !productId || !quantity) {
      console.warn(`Invalid stock update parameters: productId=${productId}, sizeName=${sizeName}, quantity=${quantity}`);
      return;
    }
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
    // Validate required fields
    if (!formData.fullName || !formData.selectedDate || !formData.phone || !formData.email || !formData.country || !formData.province || !formData.district || !formData.ward || !formData.addressDetail) {
      setToastMessage('Mời bạn nhập đầy đủ thông tin.');
      setToastType('error');
      setShowToast(true);
      return;
    }

    // Validate phone and email
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

    if (cartItems.length === 0) {
      setToastMessage('Giỏ hàng trống! Vui lòng thêm sản phẩm trước khi đặt hàng.');
      setToastType('error');
      setShowToast(true);
      return;
    }

    // Construct order data (KHÔNG gửi paymentMethod)
 // ...existing code...
const orderData = {
  fullName: formData.fullName.trim(),
  dateOfBirth: formData.selectedDate ? formData.selectedDate.toISOString() : null, // Sửa dòng này
  phoneNumber: formData.phone.trim(),
  email: formData.email.trim(),
  country: 'Việt Nam',
  city: provinces.find(p => p.code === parseInt(formData.province))?.name || formData.province,
  district: districts.find(d => d.code === parseInt(formData.district))?.name || formData.district,
  ward: wards.find(w => w.code === parseInt(formData.ward))?.name || formData.ward,
  address: formData.addressDetail.trim(),
  orderNote: formData.note ? formData.note.trim() : '',
  products: cartItems.map(item => ({
    productId: item._id || item.productId || '',
    productName: item.name || 'Unknown Product',
    quantity: parseInt(item.quantity) || 1,
    price: parseFloat(item.price) || 0,
    ...(item.size_name && item.size_name.trim() !== '' ? { size_name: item.size_name } : {})
  })),
  totalAmount: cartItems.reduce((sum, item) => sum + (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1), 0),
  grandTotal: appliedDiscount
    ? cartItems.reduce((sum, item) => sum + (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1), 0) -
      (cartItems.reduce((sum, item) => sum + (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1), 0) * (appliedDiscount.discountPercentage || 0)) / 100
    : cartItems.reduce((sum, item) => sum + (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1), 0),
  status: 'Chờ xử lý'
};
// ...existing code...

    try {
      console.log('Sending order data:', JSON.stringify(orderData, null, 2));

      // Send order to API
      const orderResponse = await fetch(`${API_BASE_URL}/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json().catch(() => ({ message: 'Không nhận được phản hồi từ server' }));
        throw new Error(errorData.message || `Lỗi gửi đơn hàng: ${orderResponse.status} ${orderResponse.statusText}`);
      }

      const orderResult = await orderResponse.json();
      console.log('Order response:', orderResult);

      // Update stock for each product
      for (const item of cartItems) {
        const productId = item._id || item.productId;
        const sizeName = item.size_name;
        const quantity = parseInt(item.quantity) || 1;
        if (productId && sizeName && quantity > 0) {
          await updateProductStock(productId, sizeName, quantity);
        } else {
          console.warn(`Skipping stock update for product: productId=${productId}, sizeName=${sizeName}, quantity=${quantity}`);
        }
      }

      // Apply discount if present
      if (appliedDiscount && appliedDiscount.code) {
        try {
          const discountResponse = await fetch(`${API_BASE_URL}/discount/apply`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: appliedDiscount.code }),
          });
          if (!discountResponse.ok) {
            const discountError = await discountResponse.json();
            console.warn('Discount application failed:', discountError.message);
            setToastMessage('Đặt hàng thành công nhưng có vấn đề với mã giảm giá. Vui lòng thanh toán khi nhận hàng.');
            setToastType('warning');
          } else {
            const discountData = await discountResponse.json();
            console.log('Discount applied:', discountData);
            setToastMessage('Đặt hàng thành công! Vui lòng thanh toán khi nhận hàng.');
            setToastType('success');
          }
        } catch (discountError) {
          console.warn('Discount application error:', discountError.message);
          setToastMessage('Đặt hàng thành công nhưng có vấn đề với mã giảm giá. Vui lòng thanh toán khi nhận hàng.');
          setToastType('warning');
        }
      } else {
        setToastMessage('Đặt hàng thành công! Vui lòng thanh toán khi nhận hàng.');
        setToastType('success');
      }
      setShowToast(true);

      // Navigate to homepage after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);

      // Clear localStorage and reset state
      localStorage.removeItem('cart_da');
      localStorage.removeItem('applied_discount');
      localStorage.removeItem('checkoutFormData');
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
        note: '',
      });
      setDistricts([]);
      setWards([]);
    } catch (error) {
      console.error('Order placement error:', error.message);
      setToastMessage(`Không thể đặt hàng: ${error.message}`);
      setToastType('error');
      setShowToast(true);
    }
  };

  const handleToastClose = () => {
    setShowToast(false);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1), 0);
  const discountAmount = appliedDiscount ? (subtotal * (appliedDiscount.discountPercentage || 0)) / 100 : 0;
  const grandTotal = subtotal - discountAmount;

  return (
    <div className={styles.container}>
      <h1 className={`${styles.container} h1`}>Đặt Hàng</h1>
      <div className={styles.formContainer}>
        <div className={styles.customerInfo}>
          <h2 className={`${styles.customerInfo} h2`}>THÔNG TIN KHÁCH HÀNG</h2>
          <p className={styles.error} style={{ display: !formData.fullName || !formData.selectedDate || !formData.phone || !formData.email || !formData.country || !formData.province || !formData.district || !formData.ward || !formData.addressDetail ? 'block' : 'none' }}>
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
              <select
                id="country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className={`${styles.formGroup} select`}
              >
                <option value="vietnam">Việt Nam</option>
              </select>
            </div>
            <div className={styles.province}>
              <label htmlFor="province" className={`${styles.formGroup} label`}>Tỉnh/Thành phố *</label>
              <select
                id="province"
                value={formData.province}
                onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                className={`${styles.formGroup} select`}
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
              <label htmlFor="district" className={`${styles.formGroup} label`}>Quận/Huyện *</label>
              <select
                id="district"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className={`${styles.formGroup} select`}
                disabled={!formData.province}
              >
                <option value="">Chọn quận/huyện</option>
                {districts.map(district => (
                  <option key={district.code} value={district.code}>{district.name}</option>
                ))}
              </select>
            </div>
            <div className={styles.ward}>
              <label htmlFor="ward" className={`${styles.formGroup} label`}>Xã/Phường *</label>
              <select
                id="ward"
                value={formData.ward}
                onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                className={`${styles.formGroup} select`}
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
        </div>
        <div className={styles.orderInfo}>
          <h2 className={`${styles.orderInfo} h2`}>THÔNG TIN ĐƠN HÀNG</h2>
          {cartItems.length > 0 && (
            <div className={styles.productList}>
              {cartItems.map((item, index) => (
                <div key={index} className={styles.productGroup}>
                  <p className={styles.productName}>{item.name} x {item.quantity} - {formatPrice((parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1))}</p>
                  <p className={styles.productDetails}>
                    Chất: {item.charm || 'N/A'}, Size Viên Đá: {item.stoneSize || 'N/A'}, Size Tay: {item.wristSize || 'N/A'}
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