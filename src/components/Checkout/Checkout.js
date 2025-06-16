import React, { useState, useEffect, useRef } from 'react';
import styles from './Checkout.module.css';
import ToastNotification from '../ToastNotification/ToastNotification';


const Checkout = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    selectedDate: null,
    phone: '',
    email: '',
    country: 'vietnam',
    province: 'hanoi',
    district: 'quan1',
    ward: 'phuong1',
    addressDetail: '',
    note: '',
  });
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
  const calendarRef = useRef(null);

  useEffect(() => {
    console.log('showCalendar changed to:', showCalendar); // Debug trạng thái
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

  const handleOrder = () => {
    if (!formData.fullName || !formData.selectedDate || !formData.phone || !formData.email || !formData.province || !formData.district || !formData.ward || !formData.addressDetail) {
      setToastMessage('Mời bạn nhập đầy đủ thông tin.');
      setToastType('error');
      setShowToast(true);
    } else {
      setToastMessage('Đặt hàng thành công!');
      setToastType('success');
      setShowToast(true);
      setFormData({
        fullName: '',
        selectedDate: null,
        phone: '',
        email: '',
        country: 'vietnam',
        province: 'hanoi',
        district: 'quan1',
        ward: 'phuong1',
        addressDetail: '',
        note: '',
      });
    }
  };

  const handleToastClose = () => {
    setShowToast(false);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.container + ' h1'}>Đặt Hàng</h1>
      <div className={styles.formContainer}>
        <div className={styles.customerInfo}>
          <h2 className={styles.customerInfo + ' h2'}>THÔNG TIN KHÁCH HÀNG</h2>
          <p className={styles.error} style={{ display: !formData.fullName || !formData.selectedDate || !formData.phone || !formData.email || !formData.province || !formData.district || !formData.ward || !formData.addressDetail ? 'block' : 'none' }}>
            Mời bạn nhập đầy đủ thông tin.
          </p>
          <div className={styles.formGroup}>
            <label htmlFor="full-name" className={styles.formGroup + ' label'}>Họ và tên *</label>
            <input
              type="text"
              id="full-name"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Họ tên của bạn"
              className={styles.formGroup + ' input'}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="birth-date" className={styles.formGroup + ' label'}>Ngày sinh *</label>
            <div className={styles.datePicker} ref={calendarRef}>
              <input
                type="text"
                id="selected-date"
                value={formData.selectedDate ? `${formData.selectedDate.getDate()} ${monthNames[formData.selectedDate.getMonth()]} ${formData.selectedDate.getFullYear()}` : ''}
                placeholder="Chọn ngày sinh"
                readOnly
                className={styles.datePicker + ' #selectedDate'}
              />
              <button
                className={styles.calendarBtn}
                onClick={() => {
                  console.log('Button clicked, setting showCalendar to:', !showCalendar); // Debug
                  setShowCalendar(!showCalendar);
                }}
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
                      className={styles.calendarHeader + ' select'}
                    >
                      {monthNames.map((month, index) => (
                        <option key={index} value={index}>{month}</option>
                      ))}
                    </select>
                    <select
                      id="year-select"
                      value={currentYear}
                      onChange={(e) => setCurrentYear(parseInt(e.target.value))}
                      className={styles.calendarHeader + ' select'}
                    >
                      {Array.from({ length: new Date().getFullYear() - 1899 }, (_, i) => new Date().getFullYear() - i).map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                    <button onClick={setToday} className={styles.calendarHeader + ' button'}>Hôm nay</button>
                    <button onClick={() => setShowCalendar(false)} className={styles.calendarHeader + ' button'}>Đóng</button>
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
          <div className={styles.formGroup + ' ' + styles.mergeForms}>
            <div className={styles.sdt}>
              <label htmlFor="phone" className={styles.formGroup + ' label'}>Số điện thoại *</label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Số điện thoại của bạn"
                className={styles.formGroup + ' input'}
              />
            </div>
            <div className={styles.email}>
              <label htmlFor="email" className={styles.formGroup + ' label'}>Email *</label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Email của bạn"
                className={styles.formGroup + ' input'}
              />
            </div>
          </div>
          <div className={styles.formGroup + ' ' + styles.mergeForms}>
            <div className={styles.country}>
              <label htmlFor="country" className={styles.formGroup + ' label'}>Quốc gia *</label>
              <select
                id="country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className={styles.formGroup + ' select'}
              >
                <option value="vietnam">Việt Nam</option>
              </select>
            </div>
            <div className={styles.province}>
              <label htmlFor="province" className={styles.formGroup + ' label'}>Tỉnh/Thành phố *</label>
              <select
                id="province"
                value={formData.province}
                onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                className={styles.formGroup + ' select'}
              >
                <option value="hanoi">Hà Nội</option>
                <option value="hcm">TP. Hồ Chí Minh</option>
              </select>
            </div>
          </div>
          <div className={styles.formGroup + ' ' + styles.mergeForms}>
            <div className={styles.districtWard}>
              <label htmlFor="district" className={styles.formGroup + ' label'}>Quận/Huyện *</label>
              <select
                id="district"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className={styles.formGroup + ' select'}
              >
                <option value="quan1">Quận 1</option>
                <option value="quan2">Quận 2</option>
              </select>
            </div>
            <div className={styles.ward}>
              <label htmlFor="ward" className={styles.formGroup + ' label'}>Xã/Phường *</label>
              <select
                id="ward"
                value={formData.ward}
                onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                className={styles.formGroup + ' select'}
              >
                <option value="phuong1">Phường 1</option>
                <option value="phuong2">Phường 2</option>
              </select>
            </div>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="address-detail" className={styles.formGroup + ' label'}>Địa chỉ *</label>
            <input
              type="text"
              id="address-detail"
              value={formData.addressDetail}
              onChange={(e) => setFormData({ ...formData, addressDetail: e.target.value })}
              placeholder="Ví dụ: Số 20, ngõ 90"
              className={styles.formGroup + ' input'}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="note" className={styles.formGroup + ' label'}>Ghi chú đặt hàng</label>
            <textarea
              id="note"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="Ghi chú cho đơn hàng của bạn"
              className={styles.formGroup + ' textarea'}
            />
          </div>
        </div>
        <div className={styles.orderInfo}>
          <h2 className={styles.orderInfo + ' h2'}>THÔNG TIN ĐƠN HÀNG</h2>
          <div className={styles.order}>
            <div className={styles.orderItem}>
              <p>Sản phẩm</p>
              <p>Tổng tiền</p>
            </div>
            <div className={styles.orderItem}>
              <p>Vòng GARNET LƯU ĐỎ x 3</p>
              <p>6,510,000 VND</p>
            </div>
            <div className={styles.orderItem}>
              <p>Chất: Kim Long Bọc Vàng</p>
              <p></p>
            </div>
            <div className={styles.orderItem}>
              <p>Size Viên Đá: 8 Li (Size tay từ 13cm - dưới 16cm)</p>
              <p>6,510,000 VND</p>
            </div>
            <div className={styles.orderItem}>
              <p>Size Tay: 12 cm</p>
              <p></p>
            </div>
            <div className={styles.orderItem + ' ' + styles.total}>
              <p>Thành tiền</p>
              <p>6,510,000 VND</p>
            </div>
            <div className={styles.orderItem}>
              <p>Giao Hàng</p>
              <p>Miễn phí vận chuyển</p>
            </div>
            <div className={styles.orderItem + ' ' + styles.total}>
              <p>Tổng tiền</p>
              <p>6,510,000 VND</p>
            </div>
          </div>
          <div className={styles.orderBtn}>
            <button
              onClick={handleOrder}
              className={styles.orderBtn + ' button'}
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