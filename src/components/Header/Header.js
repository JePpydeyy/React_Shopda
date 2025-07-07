import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Header.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faCartShopping, faCaretDown, faBars, faTimes, faBell } from '@fortawesome/free-solid-svg-icons';

const API_BASE_URL = process.env.REACT_APP_API_URL;

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [hasPendingPayment, setHasPendingPayment] = useState(false);
  const navigate = useNavigate();
  const searchFormRef = useRef(null);

  // Lấy gợi ý khi người dùng nhập
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      fetch(`${API_BASE_URL}/product/show`)
        .then(res => res.json())
        .then(data => {
          const filteredSuggestions = data
            .filter(
              product =>
                product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.category?.name_categories?.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .slice(0, 5); // Giới hạn 5 gợi ý
          setSuggestions(filteredSuggestions);
        })
        .catch(() => setSuggestions([]));
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  // Xử lý click ngoài để tắt suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchFormRef.current && !searchFormRef.current.contains(event.target)) {
        setSuggestions([]);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Xử lý ESC để đóng menu
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Xử lý khi nhấn tìm kiếm
  const handleSearchSubmit = e => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/product?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setSuggestions([]);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleNavLinkClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.container}>
          <Link to="/" className={styles.logo}>
            <div className={styles.logoIcon}>LOGO</div>
            <div>
              <div className={styles.logoText}>Tên công ty</div>
              <div className={styles.logoSubtitle}>TRANG SỨC PHONG THỦY</div>
            </div>
          </Link>

          <div className={styles.headerRight}>
            <div className={styles.searchCart}>
              <form ref={searchFormRef} onSubmit={handleSearchSubmit} className={styles.searchForm}>
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                  autoComplete="off"
                />
                <button type="submit" className={styles.searchButton}>
                  <FontAwesomeIcon icon={faMagnifyingGlass} className={styles.searchIcon} />
                </button>
                {suggestions.length > 0 && (
                  <ul className={styles.suggestionsDropdown}>
                    {suggestions.map(product => {
                      // Lấy giá nhỏ nhất trong option nếu có
                      const minPrice = Array.isArray(product.option) && product.option.length > 0
                        ? Math.min(...product.option.map(opt => opt.price))
                        : product.price;
                      return (
                        <li key={product._id} className={styles.suggestionItem}>
                          <Link
                            to={`/detail/${product.slug}`}
                            onClick={() => {
                              setSearchQuery('');
                              setSuggestions([]);
                            }}
                            className={styles.suggestionLink}
                          >
                            <img
                              src={
                                product.images && product.images.length > 0
                                  ? `${process.env.REACT_APP_API_BASE}/${product.images[0]}`
                                  : 'https://via.placeholder.com/50'
                              }
                              alt={product.name}
                              className={styles.suggestionImage}
                            />
                            <div className={styles.suggestionInfo}>
                              <span className={styles.suggestionName}>{product.name}</span>
                              <span className={styles.suggestionPrice}>
                                {new Intl.NumberFormat('vi-VN').format(minPrice)} VND
                              </span>
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </form>
              <Link to="/cart" className={styles.cartContainer}>
                <FontAwesomeIcon icon={faCartShopping} className={styles.cartIcon} />
              </Link>
            </div>
           
            <div className={styles.hamburger} onClick={toggleMenu}>
              <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} />
            </div>
          </div>
        </div>
        
        {/* Navbar luôn hiển thị */}
        <Navbar />
      </header>

      {/* Mobile Menu Overlay */}
      <MobileMenu isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} handleNavLinkClick={handleNavLinkClick} />
      
      {/* Overlay */}
      {isMenuOpen && (
        <div className={styles.overlay} onClick={toggleMenu} />
      )}
    </>
  );
};

const Navbar = () => {
  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <span className={styles.navHighlight}>CAM KẾT SẢN PHẨM HOÀN TOÀN LÀ ĐÁ TỰ NHIÊN</span>
        <span className={styles.navDivider}>|</span>
        <ul className={styles.navMenu}>
          <li>
            <Link to="/">TRANG CHỦ</Link>
          </li>
          <li>
            <Link to="/about">GIỚI THIỆU</Link>
          </li>
          <li>
            <Link to="/product">SẢN PHẨM</Link>
          </li>
          <li>
            <Link to="/new">BÀI VIẾT</Link>
          </li>
          <li>
            <Link to="/contact">LIÊN HỆ</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

const MobileMenu = ({ isMenuOpen, toggleMenu, handleNavLinkClick }) => {
  return (
    <div className={`${styles.mobileMenu} ${isMenuOpen ? styles.active : ''}`}>
      <div className={styles.mobileMenuContent}>
        <div className={styles.mobileMenuHeader}>
          <span className={styles.menuTitle}>Menu</span>
          <button onClick={toggleMenu} className={styles.closeButton}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        
        <nav className={styles.mobileNav}>
          <Link to="/" className={styles.mobileNavLink} onClick={handleNavLinkClick}>
            TRANG CHỦ
          </Link>
          <Link to="/about" className={styles.mobileNavLink} onClick={handleNavLinkClick}>
            GIỚI THIỆU
          </Link>
          <Link to="/product" className={styles.mobileNavLink} onClick={handleNavLinkClick}>
            SẢN PHẨM
          </Link>
          <Link to="/new" className={styles.mobileNavLink} onClick={handleNavLinkClick}>
            BÀI VIẾT
          </Link>
          <Link to="/contact" className={styles.mobileNavLink} onClick={handleNavLinkClick}>
            LIÊN HỆ
          </Link>
        </nav>
      </div>
    </div>
  );
};

export default Header;