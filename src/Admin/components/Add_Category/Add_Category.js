import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import styles from './AddCategory.module.css';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const AddCategory = () => {
  const [formData, setFormData] = useState({
    name_categories: '',
    description: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name_categories) newErrors.name_categories = 'Tên danh mục là bắt buộc';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setSuccess('');
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(
        `${API_URL}/category`,
        { category: formData.name_categories, description: formData.description },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setSuccess('Thêm danh mục thành công!');
      setFormData({ name_categories: '', description: '' });
    } catch (err) {
      setErrors({ api: err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Sidebar />
      <div className={styles.content}>
        <h1 className={styles.title}>Thêm Danh Mục</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Tên danh mục</label>
            <input
              type="text"
              name="name_categories"
              value={formData.name_categories}
              onChange={handleChange}
              className={styles.input}
            />
            {errors.name_categories && <span className={styles.error}>{errors.name_categories}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>Mô tả (tùy chọn)</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={styles.textarea}
            />
          </div>

          {errors.api && <div className={styles.error}>{errors.api}</div>}
          {success && <div className={styles.success}>{success}</div>}

          <div className={styles.formActions}>
            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? 'Đang thêm...' : 'Thêm Danh Mục'}
            </button>
            <Link to="/admin/categories" className={styles.cancelButton}>
              Hủy
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCategory;