import React from 'react';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.decorativeElement}></div>
      
      <div className={styles.footerContainer}>
        <div className={styles.footerSection}>
          <div className={styles.footerLogo}>
            <div className={styles.logoIcon}>LOGO</div>
            <div>
              <div className={styles.logoText}>Tên công ty</div>
              <div className={styles.logoSubtext}>TRANG SỨC PHONG THỦY</div>
            </div>
          </div>
        </div>

        <div className={styles.footerSection}>
          <h3>Sản Phẩm</h3>
          <ul>
            <li><a href="#">Vòng Đá Phong Thủy</a></li>
            <li><a href="#">Vòng Đá Thời Trang</a></li>
          </ul>
        </div>

        <div className={styles.footerSection}>
          <h3>Hỗ Trợ</h3>
          <ul>
            <li><a href="#">Hướng dẫn mua hàng</a></li>
            <li><a href="#">Chính sách bán hàng</a></li>
            <li><a href="#">Chính sách bảo hành và đổi trả</a></li>
            <li><a href="#">Giao nhận và Thanh toán</a></li>
            <li><a href="#">Chính sách bảo mật</a></li>
          </ul>
        </div>

        <div className={styles.companyInfo}>
          <p>
            <strong>Công Ty TNHH Phong Thủy Tinh Lâm</strong>
            Giấy chứng nhận đăng ký doanh nghiệp: 0316045318 Do Sở Kế Hoạch và Đầu Tư Thành Phố Hồ Chí Minh - Cấp ngày 17/12/2020
            Địa chỉ: 280 E10 Lương Định Của, P. An Phú, Q.2, TP. Hồ Chí Minh.
          </p>
          
          <div className={styles.contactInfo}>
            <div className={`${styles.contactItem} ${styles.phone}`}>DT: 028 777 99917</div>
            <div className={styles.contactItem}>Showroom 1: 280 E10 Lương Định Của, P. An Phú, Q.2, TP HCM (có chỗ đậu ô tô)</div>
            <div className={`${styles.contactItem} ${styles.phone}`}>1900 29 29 17</div>
            <div className={`${styles.contactItem} ${styles.email}`}>tinhlamjw@gmail.com</div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;