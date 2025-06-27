import styles from './contact.module.css';
import React, { useState } from 'react';

function Contact() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' }); // Clear error on change
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Vui lòng nhập tên';
    if (!formData.email.match(/^\S+@\S+\.\S+$/)) newErrors.email = 'Vui lòng nhập email hợp lệ';
    if (!formData.message.trim()) newErrors.message = 'Vui lòng nhập tin nhắn';
    // Phone is optional, but if provided, validate format (basic check)
    if (formData.phone && !formData.phone.match(/^\d{10,11}$/)) {
      newErrors.phone = 'Số điện thoại phải có 10-11 chữ số';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const response = await fetch('https://api-tuyendung-cty.onrender.com/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ fullName: '', email: '', phone: '', message: '' });
        setErrors({});
      } else {
        const errorData = await response.json();
        setSubmitStatus('error');
        setErrors({ api: errorData.error || 'Đã có lỗi xảy ra khi gửi tin nhắn' });
      }
    } catch (error) {
      setSubmitStatus('error');
      setErrors({ api: 'Không thể kết nối đến server' });
    }
  };

  return (
    <div>
      <section className={styles.section} role="region" aria-labelledby="map-heading">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.465093304467!2d106.73537451474915!3d10.775686692317305!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752606b7a4f885%3A0x1e2b0b63b7b4f885!2s280%20L%C6%B0%C6%A1ng%20%C4%90%E1%BB%8Bnh%20C%E1%BB%A7a%2C%20An%20Ph%C3%BA%2C%20Qu%E1%BA%ADn%202%2C%20H%E1%BB%93%20Ch%C3%AD%20Minh%2C%20Vietnam!5e0!3m2!1sen!2sus!4v1634567890123!5m2!1sen!2sus"
          allowFullScreen
          loading="lazy"
          title="Bản đồ Showroom Tình Lâm"
          className={styles.mapIframe}
        ></iframe>
      </section>
      <section className={styles.container}>
        <section className={styles.contentSection} role="region" aria-labelledby="contact-heading">
          <h3 className={styles.sectionHeader} id="contact-heading">Thông Tin</h3>
          <h1 className={styles.mainTitle}>Liên hệ</h1>
          <p className={styles.subtitle}>Đến showroom Tình Lâm để được tư vấn và xem sản phẩm trực tiếp</p>
          
          <h3 className={styles.companyTitle}>Tình Lâm</h3>
          <p className={styles.companyInfo}>
            © 2021 Bản quyền thuộc Công ty TNHH Phong Thủy Tình Lâm. Giấy chứng nhận đăng ký doanh nghiệp: 0316845318 do Sở Kế hoạch và Đầu tư Thành phố Hồ Chí Minh cấp ngày 17/12/2020. Địa chỉ: 280 E10 Lương Định Của, P. An Phú, Q. 2, TP. Hồ Chí Minh.<br />
            ĐT: 028 77799917
          </p>

          <div className={styles.showroomList}>
            <div className={styles.showroomItem}>
              <i className={`fas fa-map-marker-alt ${styles.locationIcon}`} aria-hidden="true"></i>
              <span>Showroom 1: 280 E10 Lương Định Của, P. An Phú, Q.2, TP HCM (có chỗ đậu ô tô)</span>
            </div>
            <div className={styles.showroomItem}>
              <i className={`fas fa-map-marker-alt ${styles.locationIcon}`} aria-hidden="true"></i>
              <span>Showroom 2: 61C Phan Đình Phùng, P. 17, Q.Phú Nhuận, TP HCM (có chỗ đậu ô tô theo khung giờ 9 am - 2pm và sau 8 pm)</span>
            </div>
            <div className={styles.showroomItem}>
              <i className={`fas fa-map-marker-alt ${styles.locationIcon}`} aria-hidden="true"></i>
              <span>Showroom 3: Tầng 2, chung cư 42 Nguyễn Huệ, P. Bến Nghé, Q.1, TP HCM (có chỗ đậu ô tô trên đường Mạc ThịISBN Bưởi)</span>
            </div>
            <div className={styles.showroomItem}>
              <i className={`fas fa-map-marker-alt ${styles.locationIcon}`} aria-hidden="true"></i>
              <span>Showroom 4: 91 Xuân Thủy, P. Thảo Điền, Q. 2, TP HCM (khuôn viên cà phê Cộng - có chỗ đậu ô tô)</span>
            </div>
            <div className={styles.showroomItem}>
              <i className={`fas fa-map-marker-alt ${styles.locationIcon}`} aria-hidden="true"></i>
              <span>Showroom 5: 47 Hải Bà Trưng, P. Mỹ Long, Tp. Long Xuyên, Tỉnh An Giang</span>
            </div>
          </div>

          <div className={styles.contactInfo}>
            <div className={styles.contactItem}>
              <i className={`fas fa-phone ${styles.contactIcon}`} aria-hidden="true"></i>
              <span>1900 29 29 17</span>
            </div>
            <div className={styles.contactItem}>
              <i className={`fas fa-envelope ${styles.contactIcon}`} aria-hidden="true"></i>
              <span>tinhlamjw@gmail.com</span>
            </div>
          </div>
        </section>

        <section className={styles.formSection} role="region" aria-labelledby="form-heading">
          <h1 className={styles.sectionHeader} id="form-heading">Gửi Tin Nhắn</h1>
          {submitStatus === 'success' && (
            <div className={styles.successMessage}>
              Cảm ơn bạn đã gửi thông tin! Chúng tôi sẽ liên hệ lại sớm.
            </div>
          )}
          {submitStatus === 'error' && (
            <div className={styles.errorMessage}>{errors.api || 'Đã có lỗi xảy ra'}</div>
          )}
          <form onSubmit={handleSubmit}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  placeholder="Nhập tên của bạn"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  aria-describedby="name-error"
                  className={styles.input}
                />
                {errors.fullName && (
                  <div className={styles.errorMessage} id="name-error">{errors.fullName}</div>
                )}
              </div>
              <div className={styles.formGroup}>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Nhập email của bạn"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  aria-describedby="email-error"
                  className={styles.input}
                />
                {errors.email && (
                  <div className={styles.errorMessage} id="email-error">{errors.email}</div>
                )}
              </div>
            </div>
            <div className={styles.formGroup}>
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="Nhập số điện thoại của bạn"
                value={formData.phone}
                onChange={handleChange}
                aria-describedby="phone-error"
                className={styles.input}
              />
              {errors.phone && (
                <div className={styles.errorMessage} id="phone-error">{errors.phone}</div>
              )}
            </div>
            <div className={styles.formGroup}>
              <textarea
                id="message"
                name="message"
                placeholder="Nhập tin nhắn của bạn"
                value={formData.message}
                onChange={handleChange}
                required
                aria-describedby="message-error"
                className={styles.textarea}
              ></textarea>
              {errors.message && (
                <div className={styles.errorMessage} id="message-error">{errors.message}</div>
              )}
            </div>
            <button type="submit" className={styles.sendButton}>Gửi Tin Nhắn</button>
          </form>
        </section>
      </section>
    </div>
  );
}

export default Contact;