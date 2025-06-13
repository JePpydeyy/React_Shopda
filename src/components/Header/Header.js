import React, { useState, useEffect } from 'react'; // Added useState and useEffect
import { Link } from 'react-router-dom'; // Added Link import
import styles from './Header.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faCartShopping, faCaretDown } from '@fortawesome/free-solid-svg-icons';

const Header = () => {
  // const [cartCount, setCartCount] = useState(0); // Added state for cartCount

  // useEffect(() => {
  //   // Lấy số lượng sản phẩm trong localStorage
  //   const cart = JSON.parse(localStorage.getItem('cart')) || [];
  //   // Đếm tổng số lượng sản phẩm (tổng quantity)
  //   const total = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  //   setCartCount(total);

  //   // Nếu muốn cập nhật realtime khi có thay đổi cart:
  //   const handleStorage = () => {
  //     const cart = JSON.parse(localStorage.getItem('cart')) || [];
  //     const total = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  //     setCartCount(total);
  //   };
  //   window.addEventListener('storage', handleStorage);
  //   return () => window.removeEventListener('storage', handleStorage);
  // }, []);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <a href="/" className={styles.logo}>
          <div className={styles.logoIcon}>TL</div>
          <div>
            <div className={styles.logoText}>TINH LÂM</div>
            <div className={styles.logoSubtitle}>TRANG SỨC PHONG THỦY</div>
          </div>
        </a>
        <div className={styles.headerRight}>
          <div className={styles.searchCart}>
            <FontAwesomeIcon icon={faMagnifyingGlass} className={styles.searchIcon} />
            <Link to="/cart" className={styles.cartContainer}>
              <FontAwesomeIcon icon={faCartShopping} className={styles.cartIcon} />
              {/* <span className={styles.cartBadge}>{cartCount}</span> */}
            </Link>
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
          <li><a href="/">TRANG CHỦ</a></li>
          <li><a href="/about">GIỚI THIỆU</a></li>
          <li>
            <a href="/product">
              SẢN PHẨM
              <FontAwesomeIcon icon={faCaretDown} className={styles.dropdownArrow} />
            </a>
          </li>
          <li><a href="#">BÀI VIẾT</a></li>
          <li><a href="#">LIÊN HỆ</a></li>
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