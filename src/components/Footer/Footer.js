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
            <strong>© 2021 Bản quyền thuộc Công Ty TNHH Phong Thủy Tinh Lâm</strong>
            Giấy chứng nhận đăng ký doanh nghiệp: 0316045318 Do Sở Kế Hoạch và Đầu Tư Thành Phố Hồ Chí Minh - Cấp ngày 17/12/2020
            Địa chỉ: 280 E10 Lương Định Của, P. An Phú, Q.2, TP. Hồ Chí Minh.
          </p>
          
          <div className={styles.contactInfo}>
            <div className={`${styles.contactItem} ${styles.phone}`}>DT: 028 777 99917</div>
            <div className={styles.contactItem}>Showroom 1: 280 E10 Lương Định Của, P. An Phú, Q.2, TP HCM (có chỗ đậu ô tô)</div>
            <div className={styles.contactItem}>Showroom 2: 61C Phan Đình Phùng, P. 17, Q.Phú Nhuận, TP HCM (có chỗ đậu ô tô theo khung giờ 9 am - 2pm và sau 8 pm)</div>
            <div className={styles.contactItem}>Showroom 3: Tầng 2, chung cư 42 Nguyễn Huệ, P. Bến Nghé, Q.1, TP HCM (có chỗ đậu ô tô trên đường Mạc Thị Bưởi)</div>
            <div className={styles.contactItem}>Showroom 4: 91 Xuân Thủy, P. Thảo Điền, Q. 2, TP HCM (khuôn viên cà phế Cộng - có chỗ đậu ô tô)</div>
            <div className={styles.contactItem}>Showroom 5: 147 Quang Trung, P.10, Q. Gò Vấp, TP HCM.</div>
            <div className={`${styles.contactItem} ${styles.phone}`}>1900 29 29 17</div>
            <div className={`${styles.contactItem} ${styles.email}`}>tinhlamjw@gmail.com</div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;