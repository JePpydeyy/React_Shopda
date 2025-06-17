import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LoginForm.module.css';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Đăng nhập thất bại');
      }

      localStorage.setItem('adminToken', data.token);
      console.log('Đăng nhập thành công, token đã lưu:', data.token);
      navigate('/admin');
    } catch (err) {
      setError(err.message);
      console.error('Lỗi đăng nhập:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <form className={styles.loginForm} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="username">
            <i className="fa-solid fa-user"></i> Tên Đăng Nhập
          </label>
          <input
            type="text"
            id="username"
            name="username"
            placeholder="Nhập tên đăng nhập"
            value={username}
            onChange={(e) => setUsername(e.target.value.trim())}
            required
            disabled={isLoading}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="password">
            <i className="fa-solid fa-lock"></i> Mật Khẩu
          </label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Nhập mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value.trim())}
            required
            disabled={isLoading}
          />
        </div>
        <div className={styles.formGroup}>
          <button type="submit" disabled={isLoading}>
            {isLoading ? (
              <i className="fa-solid fa-spinner fa-spin"></i>
            ) : (
              <>
                <i className="fa-solid fa-right-to-bracket"></i> Đăng Nhập
              </>
            )}
          </button>
        </div>
        {error && <div className={styles.error}>{error}</div>}
      </form>
    </div>
  );
};

export default LoginForm;