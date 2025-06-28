import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext/AuthContext';
import styles from './Sidebar.module.css';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { checkAuth } = useAuth();

  const toggleSidebar = () => {
    setIsOpen(prev => !prev);
  };

  const closeSidebar = () => {
    if (window.innerWidth <= 992) {
      setIsOpen(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('user');
    checkAuth();
    navigate('/');
    closeSidebar();
  };

  useEffect(() => {
    const handleResize = () => {
      setIsOpen(window.innerWidth > 992);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      document.body.style.overflow = 'auto';
    };
  }, []);

  useEffect(() => {
    if (window.innerWidth <= 992) {
      document.body.style.overflow = isOpen ? 'hidden' : 'auto';
    }
  }, [isOpen]);

  const menuItems = [
    { path: '/admin', icon: 'fa-chart-line', label: 'Dashboard' },
    { path: '/admin/category', icon: 'fa-list', label: 'Danh mục' },
    { path: '/admin/product', icon: 'fa-gem', label: 'Sản phẩm' },
    { path: '/admin/order', icon: 'fa-shopping-cart', label: 'Đơn hàng' },
    { path: '/admin/new', icon: 'fa-newspaper', label: 'Tin tức' },
    { path: '/admin/categorynew', icon: 'fa-list-ol', label: 'Danh mục tin' },
    { path: '/admin/contact', icon: 'fa-envelope', label: 'Liên hệ' }
  ];

  return (
    <>
      <button 
        className={`${styles.mobileToggle} ${isOpen ? styles.open : ''}`}
        onClick={toggleSidebar}
        aria-label="Toggle menu"
      >
        <i className={`fa-solid ${isOpen ? 'fa-times' : 'fa-bars'}`}></i>
      </button>

      <div className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <Link to="/admin" onClick={closeSidebar}>
              <a href="/" className={styles.logo}>
          <div className={styles.logoIcon}>LOGO</div>
          <div>
            <div className={styles.logoText}>Tên công ty </div>
            <div className={styles.logoSubtitle}>TRANG SỨC PHONG THỦY</div>
          </div>
        </a>
            </Link>
          </div>
        </div>

        <nav className={styles.nav}>
          <ul className={styles.menu}>
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`${styles.menuLink} ${
                    location.pathname === item.path ? styles.active : ''
                  }`}
                  onClick={closeSidebar}
                >
                  <i className={`fa-solid ${item.icon} ${styles.menuIcon}`}></i>
                  <span className={styles.menuText}>{item.label}</span>
                  {location.pathname === item.path && (
                    <div className={styles.activeIndicator}></div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.footer}>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <i className="fa-solid fa-right-from-bracket"></i>
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>

      <div 
        className={`${styles.overlay} ${isOpen ? styles.show : ''}`} 
        onClick={closeSidebar}
      />
    </>
  );
};

export default Sidebar;