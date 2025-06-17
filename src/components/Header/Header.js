import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Header.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faCartShopping, faCaretDown, faBars, faTimes } from '@fortawesome/free-solid-svg-icons';

const API_BASE_URL = 'https://api-tuyendung-cty.onrender.com/api';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();

  // Lấy gợi ý khi người dùng nhập
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      fetch(`${API_BASE_URL}/product`)
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
            <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
              <button type="submit" className={styles.searchButton}>
                <FontAwesomeIcon icon={faMagnifyingGlass} className={styles.searchIcon} />
              </button>
              {suggestions.length > 0 && (
                <ul className={styles.suggestionsDropdown}>
                  {suggestions.map(product => (
                    <li key={product._id} className={styles.suggestionItem}>
                      <Link
                        to={`/detail/${product._id}`}
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
                            {new Intl.NumberFormat('vi-VN').format(product.price)} VND
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </form>
            <Link to="/cart" className={styles.cartContainer}>
              <FontAwesomeIcon icon={faCartShopping} className={styles.cartIcon} />
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
          <li>
            <a href="/" onClick={toggleMenu}>
              TRANG CHỦ
            </a>
          </li>
          <li>
            <a href="/about" onClick={toggleMenu}>
              GIỚI THIỆU
            </a>
          </li>
          <li>
            <a href="/product" onClick={toggleMenu}>
              SẢN PHẨM
              <FontAwesomeIcon icon={faCaretDown} className={styles.dropdownArrow} />
            </a>
          </li>
          <li>
            <a href="/new" onClick={toggleMenu}>
              BÀI VIẾT
            </a>
          </li>
          <li>
            <a href="/contact" onClick={toggleMenu}>
              LIÊN HỆ
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Header;