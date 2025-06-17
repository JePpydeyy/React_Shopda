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
            <Link to="/admin/news">
              <i className="fa-regular fa-newspaper"></i> Tin Tức
            </Link>
          </li>
          <li>
            <Link to="/admin/jobs">
              <i className="fa-solid fa-briefcase"></i> Quản Lý Công Việc
            </Link>
          </li>
          <li>
            <Link to="/admin/submit-profile">
              <i className="fa-solid fa-address-card"></i> Hồ Sơ Ứng Tuyển
            </Link>
          </li>
          <li>
            <Link to="/admin/contact">
              <i class="fa-solid fa-address-book"></i> Quản Lý Liên Hệ
            </Link>
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
