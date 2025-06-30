import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import styles from './new.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faEye, faEyeSlash, faTrash } from '@fortawesome/free-solid-svg-icons';

const NewsManagement = () => {
  const [news, setNews] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const navigate = useNavigate();

  const API_BASE_URL = process.env.REACT_APP_API_BASE || 'https://api-tuyendung-cty.onrender.com';
  const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/150'; // Placeholder công khai

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
        setCategories(Array.isArray(result) ? result : []);
      } catch (err) {
        console.error('Lỗi tải danh mục:', err);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      console.log('API_BASE_URL:', API_BASE_URL); // Kiểm tra API_BASE_URL
      const res = await fetch(`${API_BASE_URL}/api/new`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`,
        },
      });

      if (!res.ok) throw new Error(`Lỗi HTTP: ${res.status} ${res.statusText}`);
      const result = await res.json();
      console.log('API Response:', result); // Kiểm tra dữ liệu API
      const data = result.data || result.news || result || [];

      const transformed = data.map(item => {
        console.log('Raw thumbnailUrl:', item.thumbnailUrl); // Kiểm tra thumbnailUrl
        const imageUrl = item.thumbnailUrl && typeof item.thumbnailUrl === 'string' && item.thumbnailUrl !== '+image'
          ? item.thumbnailUrl.startsWith('http') || item.thumbnailUrl.startsWith('data:')
            ? item.thumbnailUrl
            : `${API_BASE_URL}/${item.thumbnailUrl.replace(/^\/+/, '')}`
          : PLACEHOLDER_IMAGE;

        const category = categories.find(c => c._id === item.category_new)?._id || 'Chưa phân loại';

        return {
          id: item._id,
          slug: item.slug,
          title: item.title || 'Không có tiêu đề',
          content: item.content,
          publishedAt: item.publishedAt || item.createdAt,
          views: item.views || 0,
          reviews: item.reviews || 0,
          status: item.status === 'show' ? 'Hiển thị' : 'Ẩn',
          category,
          image: imageUrl,
        };
      });

      console.log('Transformed News:', transformed); // Kiểm tra dữ liệu đã biến đổi
      setNews(transformed);
    } catch (err) {
      console.error('Lỗi fetchNews:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (categories.length > 0) {
      fetchNews();
    }
  }, [categories]);

  const filteredNews = news.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (statusFilter === 'all' || article.status === statusFilter) &&
    (categoryFilter === 'all' || article.category === categoryFilter)
  );

  const handleEdit = (slug) => {
    navigate(`/admin/editnew/${slug}`);
  };

  const handleToggleStatus = async (slug, currentStatus) => {
    const newStatus = currentStatus === 'Hiển thị' ? 'Ẩn' : 'Hiển thị';
    if (!window.confirm(`Bạn có chắc muốn ${newStatus.toLowerCase()} bài viết này?`)) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/new/${slug}/toggle-visibility`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`,
        },
        body: JSON.stringify({ status: newStatus === 'Hiển thị' ? 'show' : 'hide' }),
      });

     

      if (!res.ok) throw new Error('Lỗi cập nhật trạng thái');
      await res.json();
      await fetchNews();

      if (selectedArticle?.slug === slug) {
        setSelectedArticle(prev => ({ ...prev, status: newStatus }));
      }

      alert(`Đã cập nhật trạng thái: ${newStatus}`);
    } catch (err) {
      alert(`Lỗi cập nhật trạng thái: ${err.message}`);
    }
  };

  const handleDeleteArticle = async (slug) => {
    if (!window.confirm('Bạn có chắc muốn xóa bài viết này không?')) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/new/${slug}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`,
        },
      });

      const result = await res.json();
      if (res.ok) {
        alert('Đã xóa bài viết thành công.');
        fetchNews();
        if (selectedArticle?.slug === slug) {
          setSelectedArticle(null);
        }
      } else {
        alert(`Xóa thất bại: ${result.message || 'Lỗi không xác định'}`);
      }
    } catch (err) {
      alert(`Lỗi khi xóa bài viết: ${err.message}`);
    }
  };

  const createMarkup = (html) => {
    const safeHTML = html?.replace(
      /<img\s+[^>]*src=["']([^"']+)["']/gi,
      (_, src) => {
        if (!src || src === '+image') {
          return `<img src="${PLACEHOLDER_IMAGE}"`;
        }
        return `<img src="${
          src.startsWith('http') || src.startsWith('data:') 
            ? src 
            : `${API_BASE_URL}/${src.replace(/^\/+/, '')}`
        }"`;
      }
    );
    console.log('Processed HTML:', safeHTML); // Kiểm tra HTML đã xử lý
    return { __html: safeHTML || '' };
  };

  if (loading) return <div className={styles.container}>Đang tải...</div>;
  if (error) return <div className={styles.container}>Lỗi: {error}</div>;

  return (
    <div className={styles.container}>
      <Sidebar />
      <div className={styles.content}>
        <h1 className={styles.title}>Quản Lý Tin Tức</h1>

        <div className={styles.searchFilter}>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Tìm kiếm tin tức..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Hiển thị">Hiển thị</option>
            <option value="Ẩn">Ẩn</option>
          </select>
          <select
            className={styles.filterSelect}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">Tất cả danh mục</option>
            <option value="Chưa phân loại">Chưa phân loại</option>
            {categories.map(c => (
              <option key={c._id} value={c._id}>{c.category}</option>
            ))}
          </select>
          <button className={styles.addbutton} onClick={() => navigate('/admin/add_news')}>+ Thêm Tin Tức</button>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                <th>Tiêu đề</th>
                <th>Danh mục</th>
                <th>Ngày xuất bản</th>
                <th>Lượt xem</th>
                <th>Lượt đánh giá</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredNews.length > 0 ? filteredNews.map(article => (
                <tr key={article.slug} className={styles.tableRow} onClick={() => setSelectedArticle(article)}>
                  <td>{article.title}</td>
                  <td>{categories.find(c => c._id === article.category)?.category || 'Chưa phân loại'}</td>
                  <td>{new Date(article.publishedAt).toLocaleDateString('vi-VN')}</td>
                  <td>{article.views}</td>
                  <td>{article.reviews}</td>
                  <td>
                    <span className={`${styles.status} ${article.status === 'Hiển thị' ? styles.statusShow : styles.statusHidden}`}>
                      {article.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className={styles.iconButton}
                      title="Chỉnh sửa"
                      onClick={(e) => { e.stopPropagation(); handleEdit(article.slug); }}
                    >
                      <FontAwesomeIcon icon={faPenToSquare} />
                    </button>
                    <button
                      className={styles.iconButton}
                      title={article.status === 'Hiển thị' ? 'Ẩn bài viết' : 'Hiển thị bài viết'}
                      onClick={(e) => { e.stopPropagation(); handleToggleStatus(article.slug, article.status); }}
                    >
                      <FontAwesomeIcon icon={article.status === 'Hiển thị' ? faEyeSlash : faEye} />
                    </button>
                    <button
                      className={styles.iconButton}
                      title="Xóa bài viết"
                      onClick={(e) => { e.stopPropagation(); handleDeleteArticle(article.slug); }}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" className={styles.noData}>Không có bài viết để hiển thị.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {selectedArticle && (
          <div className={styles.popupOverlay} onClick={(e) => e.target === e.currentTarget && setSelectedArticle(null)}>
            <div className={styles.popup}>
              <h2 className={styles.popupTitle}>Chi Tiết Bài Viết</h2>
              <div className={styles.popupContent}>
                <div className={styles.articleHeader}>
                  <h3>{selectedArticle.title}</h3>
                  <p className={styles.meta}>
                    Danh mục: {categories.find(c => c._id === selectedArticle.category)?.category || 'Chưa phân loại'} | 
                    Ngày: {new Date(selectedArticle.publishedAt).toLocaleDateString('vi-VN')} |
                    Lượt xem: {selectedArticle.views} | Lượt đánh giá: {selectedArticle.reviews} |
                    Trạng thái: <span className={selectedArticle.status === 'Hiển thị' ? styles.statusShow : styles.statusHidden}>
                      {selectedArticle.status}
                    </span>
                  </p>
                </div>
                <div className={styles.postImage}>
                  <img src={selectedArticle.image} alt={selectedArticle.title} className={styles.articleImage} onError={(e) => e.target.src = PLACEHOLDER_IMAGE} />
                </div>
                <div className={styles.articleContent} dangerouslySetInnerHTML={createMarkup(selectedArticle.content)} />
              </div>
              <button className={styles.closeButton} onClick={() => setSelectedArticle(null)}>Đóng</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsManagement;