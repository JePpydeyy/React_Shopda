
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
    slug: '',
    thumbnailUrl: '',
    thumbnailCaption: '',
    categoryNew: '',
    status: 'show',
    contentBlocks: [],
  });
  const [quillContent, setQuillContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const fullForm = {
      ...formData,
      contentBlocks: [{ type: 'text', content: quillContent }],
    };

    try {
      await axios.post('https://api-tuyendung-cty.onrender.com/api/new', fullForm, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });
      alert('🟢 Thêm tin tức thành công!');
      navigate('/admin/new');
    } catch (err) {
      console.error(err);
      setError('❌ Thêm tin thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wpContainer}>
      <Sidebar />
      <div className={styles.wpMain}>
        <header className={styles.wpHeader}>
          <h1>Thêm Tin Tức Mới</h1>
        </header>
        <div className={styles.wpContent}>
          {error && <div className={styles.wpError}>{error}</div>}
          <form className={styles.wpForm} onSubmit={handleSubmit}>
            <div className={styles.wpFormGroup}>
              <label htmlFor="title">Tiêu đề</label>
              <input
                id="title"
                name="title"
                type="text"
                placeholder="Tiêu đề"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.wpFormGroup}>
              <label htmlFor="slug">Slug (URL)</label>
              <input
                id="slug"
                name="slug"
                type="text"
                placeholder="Slug (URL)"
                value={formData.slug}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.wpFormGroup}>
              <label htmlFor="thumbnailUrl">URL ảnh đại diện</label>
              <input
                id="thumbnailUrl"
                name="thumbnailUrl"
                type="text"
                placeholder="URL ảnh đại diện"
                value={formData.thumbnailUrl}
                onChange={handleChange}
              />
            </div>
            <div className={styles.wpFormGroup}>
              <label htmlFor="thumbnailCaption">Chú thích ảnh</label>
              <input
                id="thumbnailCaption"
                name="thumbnailCaption"
                type="text"
                placeholder="Chú thích ảnh"
                value={formData.thumbnailCaption}
                onChange={handleChange}
              />
            </div>
            <div className={styles.wpFormGroup}>
              <label htmlFor="categoryNew">Danh mục tin tức</label>
              <input
                id="categoryNew"
                name="categoryNew"
                type="text"
                placeholder="Danh mục tin tức"
                value={formData.categoryNew}
                onChange={handleChange}
              />
            </div>
            <div className={styles.wpFormGroup}>
              <label htmlFor="status">Trạng thái</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="show">Hiển thị</option>
                <option value="hidden">Ẩn</option>
              </select>
            </div>
            <div className={styles.wpFormGroup}>
              <label htmlFor="content">Nội dung chi tiết</label>
              <ReactQuill
                value={quillContent}
                onChange={setQuillContent}
                theme="snow"
                className={styles.wpQuill}
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Đang lưu...' : 'Thêm Tin Tức'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AD_Add_New;