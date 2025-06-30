import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import styles from './EditNews.module.css';

const EditNew = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState({
    title: '',
    content: '',
    category_new: '',
    thumbnailUrl: '',
    status: 'show',
    views: 0,
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_BASE || 'https://api-tuyendung-cty.onrender.com';

  const preprocessContent = (html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const images = doc.getElementsByTagName('img');
    for (let img of images) {
      let src = img.getAttribute('src') || '';
      if (!src.startsWith('http') && !src.startsWith('/')) {
        img.setAttribute('src', `${API_BASE_URL}/${src}`);
      } else if (src.startsWith('/')) {
        img.setAttribute('src', `${API_BASE_URL}${src}`);
      }
    }
    return doc.body.innerHTML;
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/new-category`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`,
          },
        });
        const result = await res.json();
        setCategories(Array.isArray(result) ? result.filter(c => c.status === 'show') : []);
      } catch (err) {
        console.error('Lỗi tải danh mục:', err);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/new/${slug}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`,
          },
        });
        if (!res.ok) throw new Error(`Lỗi HTTP: ${res.status} ${res.statusText}`);
        const result = await res.json();
        const processedContent = preprocessContent(result.content || '');
        setArticle({
          title: result.title || '',
          content: processedContent,
          category_new: result.category_new?._id || result.category_new || '',
          thumbnailUrl: result.thumbnailUrl || '',
          status: result.status || 'show',
          views: result.views || 0,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [slug]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setArticle((prev) => ({ ...prev, [name]: value }));
  };

  const handleContentChange = (value) => {
    setArticle((prev) => ({ ...prev, content: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const previewUrl = URL.createObjectURL(file);
      setArticle((prev) => ({ ...prev, thumbnailUrl: previewUrl }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin/login');
        throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
      }

      const processedContent = preprocessContent(article.content);

      let options = {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      };

      if (selectedFile) {
        const formData = new FormData();
        formData.append('title', article.title);
        formData.append('content', processedContent);
        formData.append('category_new', article.category_new);
        formData.append('views', article.views);
        formData.append('status', article.status);
        formData.append('thumbnail', selectedFile);
        options.body = formData;
      } else {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify({
          title: article.title,
          content: processedContent,
          category_new: article.category_new,
          views: article.views,
          status: article.status,
          thumbnailUrl: article.thumbnailUrl.replace(`${API_BASE_URL}/`, ''),
        });
      }

      const res = await fetch(`${API_BASE_URL}/api/new/${slug}`, options);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(`Lỗi cập nhật bài viết: ${errorData.message || res.statusText}`);
      }

      alert('Cập nhật bài viết thành công');
      navigate('/admin/new');
    } catch (err) {
      alert(`Lỗi khi cập nhật bài viết: ${err.message}`);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm('Bạn có chắc chắn muốn xoá bài viết này?');
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin/login');
        throw new Error('Vui lòng đăng nhập để xoá bài viết');
      }

      const res = await fetch(`${API_BASE_URL}/api/new/${slug}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Xoá bài viết thất bại');
      }

      alert('Bài viết đã được xoá thành công.');
      navigate('/admin/new');
    } catch (err) {
      alert(`Lỗi khi xoá bài viết: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <Sidebar />
        <div className={styles.loadingSpinner}>Đang tải...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <Sidebar />
        <div className={styles.errorMessage}>Lỗi: {error}</div>
      </div>
    );
  }

  const fullThumbnailUrl = article.thumbnailUrl.startsWith('http')
    ? article.thumbnailUrl
    : `${API_BASE_URL}/${article.thumbnailUrl}`;

  return (
    <div className={styles.container}>
      <Sidebar />
      <div className={styles.content}>
        <h1 className={styles.title}>Chỉnh sửa bài viết</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="title">Tên miền</label>
            <input
              type="text"
              id="title"
              name="title"
              value={article.title}
              onChange={handleChange}
              className={styles.inputField}
              placeholder="Nhập tên miền (ví dụ: example.com)"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="category">Danh mục</label>
            <select
              id="category"
              name="category_new"
              value={article.category_new}
              onChange={handleChange}
              className={styles.inputField}
            >
              <option value="">Chọn danh mục</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.category}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="thumbnail">Chọn hình ảnh chủ đạo</label>
            <input
              type="file"
              id="thumbnail"
              name="thumbnail"
              accept="image/*"
              onChange={handleFileChange}
              className={styles.inputField}
            />
            {article.thumbnailUrl && (
              <div className={styles.imagePreview}>
                <img src={fullThumbnailUrl} alt="Thumbnail Preview" className={styles.previewImage} />
              </div>
            )}
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="content">Nội dung</label>
            <ReactQuill
              value={article.content}
              onChange={handleContentChange}
              className={styles.quillEditor}
              placeholder="Nhập mô tả tên miền..."
              modules={EditNew.modules}
              formats={EditNew.formats}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="views">Lượt xem</label>
            <input
              type="number"
              id="views"
              name="views"
              value={article.views}
              onChange={handleChange}
              className={styles.inputField}
              min={0}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="status">Trạng thái</label>
            <select
              id="status"
              name="status"
              value={article.status}
              onChange={handleChange}
              className={styles.inputField}
            >
              <option value="show">Hiển thị</option>
              <option value="hide">Ẩn</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <button type="submit" className={styles.saveButton}>
              Lưu thay đổi
            </button>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={() => navigate('/admin/new')}
            >
              Hủy
            </button>
            <button
              type="button"
              className={styles.deleteButton}
              onClick={handleDelete}
            >
              <i className="fa-solid fa-trash"></i> Xoá bài viết
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

EditNew.modules = {
  toolbar: [
    [{ header: '1' }, { header: '2' }, { font: [] }],
    [{ size: [] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
    ['link', 'image'],
    ['clean'],
  ],
};

EditNew.formats = [
  'header', 'font', 'size',
  'bold', 'italic', 'underline', 'strike', 'blockquote',
  'list', 'bullet', 'indent',
  'link', 'image',
];

export default EditNew;

