import React from 'react';
import styles from './Header.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faCartShopping, faCaretDown } from '@fortawesome/free-solid-svg-icons';

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <a href="#" className={styles.logo}>
          <div className={styles.logoIcon}>TL</div>
          <div>
            <div className={styles.logoText}>TINH LÂM</div>
            <div className={styles.logoSubtitle}>TRANG SỨC PHONG THỦY</div>
          </div>
        </a>
        <div className={styles.headerRight}>
          <div className={styles.searchCart}>
            <FontAwesomeIcon icon={faMagnifyingGlass} className={styles.searchIcon} />
            <div className={styles.cartContainer}>
              <FontAwesomeIcon icon={faCartShopping} className={styles.cartIcon} />
              <span className={styles.cartBadge}>0</span>
            </div>
          </div>
          <div className={styles.languageSelector}>
            <span>Tiếng Việt</span>
            <FontAwesomeIcon icon={faCaretDown} />
          </div>
        </div>
      </div>
    </header>
  );
};

const Navbar = () => {
  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <span className={styles.navHighlight}>CAM KẾT SẢN PHẨM HOÀN TOÀN LÀ ĐÁ TỰ NHIÊN</span>
        <span className={styles.navDivider}>|</span>
        <ul className={styles.navMenu}>
          <li><a href="#">TRANG CHỦ</a></li>
          <li><a href="#">GIỚI THIỆU</a></li>
          <li>
            <a href="#">
              SẢN PHẨM
              <FontAwesomeIcon icon={faCaretDown} className={styles.dropdownArrow} />
            </a>
          </li>
          <li><a href="#">BÀI VIẾT</a></li>
          <li><a href="/contact">LIÊN HỆ</a></li>
        </ul>
      </div>
    </nav>
  );
};

const HeaderAndNav = () => {
  return (
    <>
      <Header />
      <Navbar />
    </>
  );
};

export default HeaderAndNav;