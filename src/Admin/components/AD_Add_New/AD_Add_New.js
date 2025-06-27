import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Sidebar from '../Sidebar/Sidebar';
import styles from './add_news.module.css';

const AD_Add_New = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    mainImage: '',
    detailedDescription: '',
    status: 'Hiển thị',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const { name, files } = e.target;
    setFormData(prev => ({ ...prev, [name]: files[0] }));
  };

  const handleQuillChange = (value) => {
    setFormData(prev => ({ ...prev, detailedDescription: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('mainImage', formData.mainImage);
    formDataToSend.append('detailedDescription', formData.detailedDescription);
    formDataToSend.append('status', formData.status);

    try {
      await axios.post('https://api-tuyendung-cty.onrender.com/api/product', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });
      alert('🟢 Thêm sản phẩm thành công!');
      navigate('/admin/product');
    } catch (err) {
      console.error(err);
      setError('❌ Thêm sản phẩm thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <a href="#dashboard">Dashboard</a>
        <a href="#danh-muc">Danh mục</a>
        <a href="#san-pham">Sản phẩm</a>
        <a href="#don-hang">Đơn hàng</a>
        <a href="#dich-vu">Dịch vụ</a>
        <a href="#lien-he">Liên hệ</a>
        <a href="#dang-xuat">Đăng xuất</a>
      </div>
      <div className={styles.content}>
        <header>
          <h1 className={styles.title}>Thêm Sản Phẩm</h1>
        </header>
        <div>
          {error && <div className={styles.noData}>{error}</div>}
          <form className={styles.formGroup} onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="title" className={styles.formLabel}>Tiêu đề</label>
              <input
                id="title"
                name="title"
                type="text"
                className={styles.formInput}
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.mainImageSection}>
              <label htmlFor="mainImage" className={styles.mainImageLabel}>Hình ảnh chủ đạo của bài viết</label>
              <input
                id="mainImage"
                name="mainImage"
                type="file"
                className={styles.mainImageInput}
                onChange={handleImageChange}
              />
            </div>
            <div className={styles.detailSection}>
              <label htmlFor="detailedDescription" className={styles.detailLabel}>Mô tả chi tiết</label>
              <div className={styles.wpEditor}>
                <div className={styles.wpEditorContainer}>
                  <ReactQuill
                    value={formData.detailedDescription}
                    onChange={handleQuillChange}
                    theme="snow"
                  />
                </div>
              </div>
              <div className={styles.imageUpload}>
                <label htmlFor="imageUpload" className={styles.imageUploadLabel}>Thêm hình ảnh vào mô tả</label>
                <input
                  id="imageUpload"
                  name="imageUpload"
                  type="file"
                  className={styles.imageUploadInput}
                  onChange={handleImageChange}
                />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="status" className={styles.formLabel}>Trạng thái</label>
              <select
                id="status"
                name="status"
                className={styles.formSelect}
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Hiển thị">Hiển thị</option>
                <option value="Ẩn">Ẩn</option>
              </select>
            </div>
            <div className={styles.formButtons}>
              <button type="submit" className={styles.submitButton} disabled={loading}>
                {loading ? 'Đang lưu...' : 'Thêm sản phẩm'}
              </button>
              <button type="button" className={styles.cancelButton} onClick={() => navigate('/admin/product')}>
                Hủy
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AD_Add_New;