import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Header.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faCartShopping, faCaretDown, faBars, faTimes } from '@fortawesome/free-solid-svg-icons';

const Header = () => {
  // State for hamburger menu toggle
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

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
          <div className={styles.hamburger} onClick={toggleMenu}>
            <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} />
          </div>
        </div>
      </div>
      <Navbar isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} />
    </header>
  );
};

const Navbar = ({ isMenuOpen, toggleMenu }) => {
  return (
    <nav className={`${styles.navbar} ${isMenuOpen ? styles.active : ''}`}>
      <div className={styles.navContainer}>
        <span className={styles.navHighlight}>CAM KẾT SẢN PHẨM HOÀN TOÀN LÀ ĐÁ TỰ NHIÊN</span>
        <span className={styles.navDivider}>|</span>
        <ul className={styles.navMenu}>
          <li><a href="/" onClick={toggleMenu}>TRANG CHỦ</a></li>
          <li><a href="/about" onClick={toggleMenu}>GIỚI THIỆU</a></li>
          <li>
            <a href="/product" onClick={toggleMenu}>
              SẢN PHẨM
              <FontAwesomeIcon icon={faCaretDown} className={styles.dropdownArrow} />
            </a>
          </li>
          <li><a href="/new" onClick={toggleMenu}>BÀI VIẾT</a></li>
          <li><a href="/contact" onClick={toggleMenu}>LIÊN HỆ</a></li>
        </ul>
      </div>
    </nav>
  );
};

const HeaderAndNav = () => {
  return <Header />;
};

export default HeaderAndNav;