import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import styles from './Sidebar.module.css';
import { useAuth } from '../AuthContext/AuthContext';

const Sidebar = ({ isAlwaysVisible = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('user');
    checkAuth();
    navigate('/');
  };

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('sidebar-open');
    } else {
      document.body.classList.remove('sidebar-open');
    }
    return () => {
      document.body.classList.remove('sidebar-open');
    };
  }, [isOpen]);

  return (
    <>
      {/* Nút toggle luôn hiển thị trên mobile */}
      <button className={`${styles.toggleButton} ${styles.mobileToggle}`} onClick={toggleSidebar}>
        <i className={`fa-solid ${isOpen ? 'fa-times' : 'fa-bars'}`}></i>
      </button>

      {/* Sidebar hoặc Menu */}
      <div className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <Link to="/admin">
              <img src="/assets/images/logo.png" alt="Logo" />
            </Link>
          </div>
          {/* Nút toggle trong sidebar, chỉ hiển thị trên desktop */}
          <button className={styles.toggleButton} onClick={toggleSidebar}>
            <i className={`fa-solid ${isOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </button>
        </div>
        <ul className={styles.menu}>
          <li>
            <Link to="/admin">
              <i className="fa-solid fa-chart-line"></i> Dashboard
            </Link>
          </li>
        
          <li>
            <Link to="/admin/category">
              <i className="fa-regular fa-newspaper"></i> danh mục
            </Link>
          </li>
            <li>
            <Link to="/admin/product">
              <i className="fa-regular fa-newspaper"></i> Sản Phẩm
            </Link>
          </li>
            <li>
            <Link to="/admin/order">
              <i className="fa-regular fa-newspaper"></i> đơn hàng
            </Link>
          </li>
          <li>
            <Link to="/admin/new">
              <i className="fa-regular fa-newspaper"></i> tin tức
            </Link>
          </li>
        <li>
            <Link to="/admin/categorynew">
              <i className="fa-regular fa-newspaper"></i> danh mục tin tức
            </Link>
          </li>
        <li>
          <Link to="/admin/contact">Liên hệ</Link>
        </li>

          <li>
            <button onClick={handleLogout} className={styles.logoutBtn}>
              <i className="fa-solid fa-right-from-bracket"></i> Đăng Xuất
            </button>
          </li>
        </ul>
      </div>

      {/* Overlay khi menu mở trên di động */}
      {isOpen && (
        <div className={styles.overlay} onClick={toggleSidebar}></div>
      )}
    </>
  );
};

export default Sidebar;
