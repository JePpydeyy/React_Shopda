import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import styles from './new.module.css';

// Font Awesome Icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

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

  // Fetch categories
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

  // Fetch news (reusable)
  const fetchNews = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/new`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`,
        },
      });
      const result = await res.json();
      const data = result.data || result.news || result || [];

      const transformed = data.map(item => {
        const imageUrl = item.thumbnailUrl
          ? item.thumbnailUrl.startsWith('http')
            ? item.thumbnailUrl
            : `${API_BASE_URL}/${item.thumbnailUrl.replace(/^\/+/, '')}`
          : '/placeholder-image.jpg';

        const category = categories.find(c => c._id === item.category_new)?.category || 'Chưa phân loại';

        return {
          id: item._id,
          slug: item.slug,
          title: item.title || 'Không có tiêu đề',
          content: item.content,
          publishedAt: item.publishedAt || item.createdAt,
          views: item.views || 0,
          status: item.status === 'show' ? 'Hiển thị' : 'Ẩn',
          category,
          image: imageUrl,
        };
      });

      setNews(transformed);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch when categories loaded
  useEffect(() => {
    if (categories.length > 0) {
      fetchNews();
    }
  }, [categories]);

  // Filtered news
  const filteredNews = news.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (statusFilter === 'all' || article.status === statusFilter) &&
    (categoryFilter === 'all' || article.category === categoryFilter)
  );

  // Edit handler (SPA)
  const handleEdit = (slug) => {
    navigate(`/admin/news/edit/${slug}`);
  };

  // Toggle show/hide
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

      const result = await res.json();

      // ✅ Reload latest data from server
      await fetchNews();

      // ✅ Update selected article if it's open
      if (selectedArticle?.slug === slug) {
        setSelectedArticle(prev => ({ ...prev, status: newStatus }));
      }

      alert(`Đã cập nhật trạng thái: ${newStatus}`);
    } catch (err) {
      alert('Lỗi cập nhật trạng thái');
    }
  };

  // Render HTML safely
  const createMarkup = (html) => {
    const safeHTML = html?.replace(
      /<img\s+[^>]*src=["'](?!https?:\/\/)([^"']+)["']/gi,
      (_, src) => `<img src="${API_BASE_URL}/${src.replace(/^\/+/, '')}"`
    );
    return { __html: safeHTML || '' };
  };

  if (loading) return <div className={styles.container}>Đang tải...</div>;
  if (error) return <div className={styles.container}>Lỗi: {error}</div>;

  return (
    <div className={styles.container}>
      <Sidebar />
      <div className={styles.content}>
        <h1 className={styles.title}>Quản Lý Tin Tức</h1>

        {/* Filter & Search */}
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
              <option key={c._id} value={c.category}>{c.category}</option>
            ))}
          </select>
          <button onClick={() => navigate('/admin/add_news')}>
            + Thêm Tin Tức
            </button>

        </div>

        {/* Table */}
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                <th>Tiêu đề</th>
                <th>Danh mục</th>
                <th>Ngày xuất bản</th>
                <th>Lượt xem</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredNews.length > 0 ? filteredNews.map(article => (
                <tr key={article.slug} className={styles.tableRow} onClick={() => setSelectedArticle(article)}>
                  <td>{article.title}</td>
                  <td>{article.category}</td>
                  <td>{new Date(article.publishedAt).toLocaleDateString('vi-VN')}</td>
                  <td>{article.views}</td>
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
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className={styles.noData}>Không có bài viết để hiển thị.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Detail popup */}
        {selectedArticle && (
          <div className={styles.popupOverlay} onClick={(e) => e.target === e.currentTarget && setSelectedArticle(null)}>
            <div className={styles.popup}>
              <h2 className={styles.popupTitle}>Chi Tiết Bài Viết</h2>
              <div className={styles.popupContent}>
                <div className={styles.articleHeader}>
                  <h3>{selectedArticle.title}</h3>
                  <p className={styles.meta}>
                    Danh mục: {selectedArticle.category} | Ngày: {new Date(selectedArticle.publishedAt).toLocaleDateString('vi-VN')} | 
                    Lượt xem: {selectedArticle.views} | 
                    Trạng thái: <span className={selectedArticle.status === 'Hiển thị' ? styles.statusShow : styles.statusHidden}>
                      {selectedArticle.status}
                    </span>
                  </p>
                </div>
                <div className={styles.postImage}>
                  <img src={selectedArticle.image} alt="" className={styles.articleImage} />
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
