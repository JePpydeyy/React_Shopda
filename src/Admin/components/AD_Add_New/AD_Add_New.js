import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import styles from './add_news.module.css';

const API_URL = process.env.REACT_APP_API_URL;
const API_BASE = process.env.REACT_APP_API_BASE;

const AD_Add_New = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    thumbnail: null,
    thumbnailPreview: null,
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
        const response = await axios.get(`${API_URL}/new-category`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Danh mục đã tải:', response.data);
        const categoryData = Array.isArray(response.data) ? response.data : [];
        if (categoryData.length === 0) {
          console.warn('Không tìm thấy danh mục trong phản hồi API');
          setError('Không có danh mục nào được tải. Vui lòng kiểm tra API.');
        }
        setCategories(categoryData.filter(cat => cat.status === 'show'));
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
        thumbnailPreview: URL.createObjectURL(file),
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

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    if (!formData.title) {
      setError('Tiêu đề không được để trống.');
      setLoading(false);
      return;
    }
    if (!formData.thumbnail) {
      setError('Hình ảnh chủ đạo là bắt buộc.');
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
    formDataToSend.append('thumbnail', formData.thumbnail);
    formDataToSend.append('thumbnailCaption', formData.thumbnailCaption);
    formDataToSend.append('publishedAt', currentDate);
    formDataToSend.append('content', formData.content);
    formDataToSend.append('category_new', formData.category);
    formDataToSend.append('status', formData.status);

    console.log('Dữ liệu gửi đi:');
    for (let pair of formDataToSend.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }

    try {
      const response = await axios.post(`${API_URL}/new/`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Phản hồi từ API:', response.data);
      const imageUrl = response.data.thumbnailUrl || 'Không có URL ảnh';
      alert(`Thêm bài viết thành công! URL ảnh: ${imageUrl}`);
      navigate('/admin/new');
    } catch (err) {
      console.error('Lỗi khi thêm bài viết:', err.response?.data, err.response?.status);
      let errorMessage = 'Thêm bài viết thất bại.';
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
      <div className={styles.content}>
        <header>
          <h1 className={styles.title}>Thêm Bài Viết</h1>
        </header>
        <div className={styles.formContainer}>
          {error && <div style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</div>}
          <div className={styles.inputSection}>
            <label className={styles.formLabel}>Tiêu đề</label>
            <input
              name="title"
              type="text"
              className={styles.formInput}
              value={formData.title}
              onChange={handleChange}
            />
          </div>
          <div className={styles.inputSection}>
            <label className={styles.formLabel}>Hình ảnh chủ đạo của bài viết</label>
            <input
              name="thumbnail"
              type="file"
              accept="image/jpeg,image/png"
              className={styles.mainImageInput}
              onChange={handleImageChange}
            />
            {formData.thumbnailPreview && (
              <div className={styles.imagePreview}>
                <img src={formData.thumbnailPreview} alt="Preview" />
              </div>
            )}
          </div>
          <div className={styles.inputSection}>
            <label className={styles.formLabel}>Chú thích hình ảnh</label>
            <input
              name="thumbnailCaption"
              type="text"
              className={styles.formInput}
              value={formData.thumbnailCaption}
              onChange={handleChange}
            />
          </div>
          <div className={styles.inputSection}>
            <label className={styles.formLabel}>Nội dung</label>
            <div className={styles.wpEditor}>
              <ReactQuill
                value={formData.content}
                onChange={handleQuillChange}
                theme="snow"
                placeholder="Viết nội dung bài viết..."
                modules={AD_Add_New.modules}
                formats={AD_Add_New.formats}
              />
            </div>
          </div>
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
            <button type="button" className={styles.submitButton} disabled={loading} onClick={handleSubmit}>
              {loading ? 'Đang lưu...' : 'Thêm bài viết'}
            </button>
            <button type="button" className={styles.cancelButton} onClick={() => navigate('/admin/new')}>
              Hủy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Toolbar configuration from EditNew
AD_Add_New.modules = {
  toolbar: [
    [{ header: '1' }, { header: '2' },{ header: '3' },{ header: '4' },{ header: '5' }, { font: [] }],
    [{ size: [] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
    ['link', 'image'],
    ['clean'],
  ],
};

AD_Add_New.formats = [
  'header', 'font', 'size',
  'bold', 'italic', 'underline', 'strike', 'blockquote',
  'list', 'bullet', 'indent',
  'link', 'image',
];

export default AD_Add_New;