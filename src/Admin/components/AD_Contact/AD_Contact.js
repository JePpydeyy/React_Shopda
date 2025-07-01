import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './contact.module.css';

const AD_Contact = () => {
  const [formData, setFormData] = useState({
    category: '',
    status: 'show',
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Lấy API_BASE_URL từ env, chỉ dùng env, không hardcode
  const API_BASE_URL = process.env.REACT_APP_API_BASE;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('adminToken');
        const response = await axios.get(`${API_BASE_URL}/api/new-category`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCategories(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        setError('Không thể tải danh mục');
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [API_BASE_URL]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Xử lý submit ở đây
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit}>
        <div className={styles.inputSection}>
          <label className={styles.formLabel}>Danh mục bài viết</label>
          <select
            name="category"
            className={styles.formSelect}
            value={formData.category}
            onChange={handleChange}
          >
            <option value="" disabled>Chọn danh mục</option>
            {categories.length > 0 ? (
              categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.category}
                </option>
              ))
            ) : (
              <option value="" disabled>Không có danh mục</option>
            )}
          </select>
          <small style={{ color: '#666', fontSize: '12px' }}>
            Danh mục hiện tại: {formData.category || 'Chưa chọn'} | 
            Số danh mục: {categories.length}
          </small>
        </div>
        <div className={styles.inputSection}>
          <label className={styles.formLabel}>Trạng thái</label>
          <select
            name="status"
            className={styles.formSelect}
            value={formData.status}
            onChange={handleChange}
          >
            <option value="show">Hiển thị</option>
            <option value="hide">Ẩn</option>
          </select>
        </div>
        <div className={styles.formButtons}>
          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? 'Đang lưu...' : 'Thêm bài viết'}
          </button>
        </div>
        {error && <div style={{ color: '#ef4444', marginTop: '1rem' }}>{error}</div>}
      </form>
    </div>
  );
};

export default AD_Contact;