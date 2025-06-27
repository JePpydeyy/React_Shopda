import React, { useState, useEffect } from 'react';
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
    mainImage: null,
    mainImagePreview: null,
    thumbnailCaption: '',
    content: '',
    category: '',
    status: 'show',
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
          setError('Không tìm thấy token. Vui lòng đăng nhập lại.');
          return;
        }
        const response = await axios.get('https://api-tuyendung-cty.onrender.com/api/new-category', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Danh mục đã tải:', response.data);
        const categoryData = Array.isArray(response.data) ? response.data : [];
        if (categoryData.length === 0) {
          console.warn('Không tìm thấy danh mục trong phản hồi API');
          setError('Không có danh mục nào được tải. Vui lòng kiểm tra API.');
        }
        setCategories(categoryData);
      } catch (err) {
        console.error('Lỗi khi tải danh mục:', err.response?.data, err.response?.status);
        setError(`Không thể tải danh mục: ${err.response?.data?.message || err.message}`);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (!allowedTypes.includes(file.type)) {
        setError('Vui lòng chọn tệp JPEG hoặc PNG.');
        return;
      }
      if (file.size > maxSize) {
        setError('Kích thước tệp vượt quá 5MB.');
        return;
      }
      setFormData((prev) => ({
        ...prev,
        [name]: file,
        mainImagePreview: URL.createObjectURL(file),
      }));
    }
  };

  const handleQuillChange = (value) => {
    setFormData((prev) => ({ ...prev, content: value }));
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.title) {
      setError('Tiêu đề không được để trống.');
      setLoading(false);
      return;
    }
    if (!formData.category) {
      setError('Vui lòng chọn danh mục.');
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('adminToken');
    if (!token) {
      setError('Không tìm thấy token. Vui lòng đăng nhập lại.');
      setLoading(false);
      return;
    }

    const currentDate = new Date().toISOString();
    const slug = generateSlug(formData.title);

    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('slug', slug);
    if (formData.mainImage) {
      formDataToSend.append('mainImage', formData.mainImage, formData.mainImage.name);
    }
    formDataToSend.append('thumbnailCaption', formData.thumbnailCaption);
    formDataToSend.append('publishedAt', currentDate);
    formDataToSend.append('content', formData.content);
    formDataToSend.append('category', formData.category);
    formDataToSend.append('status', formData.status);

    for (let pair of formDataToSend.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }

    try {
      const response = await axios.post('https://api-tuyendung-cty.onrender.com/api/new/', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Phản hồi từ API:', response.data);
      const imageUrl = response.data.imageUrl || response.data.mainImage || 'Không có URL ảnh';
      alert(`🟢 Thêm bài viết thành công! URL ảnh: ${imageUrl}`);
      navigate('/admin/post');
    } catch (err) {
      console.error('Lỗi khi thêm bài viết:', err.response?.data, err.response?.status);
      let errorMessage = '❌ Thêm bài viết thất bại.';
      if (err.response) {
        errorMessage += ` Mã lỗi: ${err.response.status}. Chi tiết: ${err.response.data?.message || err.message}`;
      } else {
        errorMessage += ` ${err.message}`;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <a href="#dashboard">Dashboard</a>
        <a href="#danh-muc">Danh mục</a>
        <a href="#bai-viet">Bài viết</a>
        <a href="#don-hang">Đơn hàng</a>
        <a href="#dich-vu">Dịch vụ</a>
        <a href="#lien-he">Liên hệ</a>
        <a href="#dang-xuat">Đăng xuất</a>
      </div>
      <div className={styles.content}>
        <header>
          <h1 className={styles.title}>Thêm Bài Viết</h1>
        </header>
        <div className={styles.formContainer}>
          {error && <div style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</div>}
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
            <div className={styles.formGroup}>
              <label htmlFor="mainImage" className={styles.formLabel}>Hình ảnh chủ đạo của bài viết</label>
              <input
                id="mainImage"
                name="mainImage"
                type="file"
                accept="image/jpeg,image/png"
                className={styles.mainImageInput}
                onChange={handleImageChange}
              />
              {formData.mainImagePreview && (
                <div className={styles.imagePreview}>
                  <img src={formData.mainImagePreview} alt="Preview" style={{ maxWidth: '200px' }} />
                </div>
              )}
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="thumbnailCaption" className={styles.formLabel}>Chú thích hình ảnh</label>
              <input
                id="thumbnailCaption"
                name="thumbnailCaption"
                type="text"
                className={styles.formInput}
                value={formData.thumbnailCaption}
                onChange={handleChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="content" className={styles.formLabel}>Nội dung</label>
              <div className={styles.wpEditor}>
                <ReactQuill
                  value={formData.content}
                  onChange={handleQuillChange}
                  theme="snow"
                  placeholder="Viết nội dung bài viết..."
                  modules={{
                    toolbar: [
                      [{ header: [1, 2, false] }],
                      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                      [{ list: 'ordered' }, { list: 'bullet' }],
                      ['link', 'image'],
                      ['clean'],
                    ],
                  }}
                  formats={[
                    'header',
                    'bold', 'italic', 'underline', 'strike', 'blockquote',
                    'list', 'bullet',
                    'link', 'image',
                  ]}
                />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="category" className={styles.formLabel}>Danh mục bài viết</label>
              <select
                id="category"
                name="category"
                className={styles.formSelect}
                value={formData.category}
                onChange={handleChange}
                required
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
                <option value="show">Hiển thị</option>
                <option value="hide">Ẩn</option>
              </select>
            </div>
            <div className={styles.formButtons}>
              <button type="submit" className={styles.submitButton} disabled={loading}>
                {loading ? 'Đang lưu...' : 'Thêm bài viết'}
              </button>
              <button type="button" className={styles.cancelButton} onClick={() => navigate('/admin/post')}>
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