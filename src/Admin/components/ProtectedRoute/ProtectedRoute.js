import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../AuthContext/AuthContext'; // Import context

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { authChecked, checkAuth } = useAuth(); // Sử dụng context

  useEffect(() => {
    const checkAuthInternal = () => {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        console.log('Không tìm thấy token trong localStorage, chuyển hướng về /admin/login');
        setIsAuthenticated(false);
        return;
      }

      try {
        console.log('Đang kiểm tra token:', token);
        const decoded = jwtDecode(token);

        if (decoded.exp * 1000 < Date.now()) {
          console.log('Token đã hết hạn, chuyển hướng về /admin/login');
          localStorage.removeItem('adminToken');
          setIsAuthenticated(false);
          return;
        }

        if (decoded.role !== 'admin') {
          console.log('Người dùng không có quyền admin, role:', decoded.role);
          localStorage.removeItem('adminToken');
          setIsAuthenticated(false);
          return;
        }

        console.log('Xác thực thành công, role:', decoded.role);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Lỗi khi giải mã token:', error);
        localStorage.removeItem('adminToken');
        setIsAuthenticated(false);
      }
    };

    checkAuthInternal();
  }, [navigate, location, authChecked]);

  if (isAuthenticated === null) {
    return <div>Đang kiểm tra quyền truy cập...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;