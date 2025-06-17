import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar'; // Assuming Sidebar is in the same directory
import styles from './AddCategory.module.css';

const AddCategory = () => {
  const [formData, setFormData] = useState({
    name_categories: '',
    description: '',
  });

  const [errors, setErrors] = useState({});

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Simulate API call
      console.log('Form data:', formData);
      // Reset form or redirect after successful submission
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

          <div className={styles.formActions}>
            <button type="submit" className={styles.submitButton}>
              Thêm Danh Mục
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