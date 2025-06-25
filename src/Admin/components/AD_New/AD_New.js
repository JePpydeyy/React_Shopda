import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import styles from './new.module.css';

const NewsManagement = () => {
  const [news, setNews] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statuses] = useState(['all', 'Show', 'Hidden']);
  const [selectedArticle, setSelectedArticle] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://api-tuyendung-cty.onrender.com/api/new');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        console.log('API Response:', result);

        const newsData = Array.isArray(result) ? result : result.data || result.news || result.items || [];
        if (Array.isArray(newsData)) {
          const transformedData = newsData.map(item => ({
            id: item._id || item.id,
            slug: item.slug,
            title: item.title || 'No title',
            content: item.htmlContent || 'No content available',
            publishedAt: item.publishedAt || item.createdAt || new Date().toISOString(),
            status: item.status === 'show' ? 'Show' : 'Hidden',
          }));
          setNews(transformedData);
        } else {
          throw new Error('Invalid data format from API');
        }
      } catch (err) {
        setError(err.message);
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const filteredNews = news.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (statusFilter === 'all' || article.status === statusFilter)
  );

  const handleEdit = (slug) => {
    console.log(`Edit news ${slug}`);
    window.location.href = `/admin/news/edit/${slug}`;
  };

  const handleToggleStatus = async (slug, currentStatus) => {
    const newStatus = currentStatus === 'Show' ? 'Hidden' : 'Show';
    const actionText = newStatus === 'Hidden' ? 'ẩn' : 'hiển thị';
    const confirmAction = window.confirm(`Bạn có chắc muốn ${actionText} bài viết này?`);
    if (!confirmAction) return;

    try {
      const response = await fetch(`https://api-tuyendung-cty.onrender.com/api/new/${slug}/toggle-visibility`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // Placeholder for authentication token (replace with actual token logic)
          'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const updatedStatus = result.news.status === 'show' ? 'Show' : 'Hidden';

      setNews(prevNews =>
        prevNews.map(article =>
          article.slug === slug ? { ...article, status: updatedStatus } : article
        )
      );

      if (selectedArticle && selectedArticle.slug === slug) {
        setSelectedArticle(prev => ({ ...prev, status: updatedStatus }));
      }

      alert(`Bài viết đã được ${actionText} thành công!`);
    } catch (err) {
      console.error('Toggle status error:', err);
      alert(`Lỗi khi ${actionText} bài viết: ${err.message}`);
    }
  };

  const handleRowClick = (article) => {
    setSelectedArticle(article);
  };

  const closePopup = () => {
    setSelectedArticle(null);
  };

  const createMarkup = (htmlContent) => {
    return { __html: htmlContent };
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
            type="text"
            placeholder="Tìm kiếm tin tức..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {statuses.map(status => (
              <option key={status} value={status}>{status === 'all' ? 'Tất cả' : status}</option>
            ))}
          </select>
          <Link to="/admin/news/add" className={styles.addButton}>
            Thêm bài mới
          </Link>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHeader}>
                <th>Tiêu đề</th>
                <th>Ngày xuất bản</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredNews.length > 0 ? (
                filteredNews.map(article => (
                  <tr
                    key={article.slug}
                    className={styles.tableRow}
                    onClick={() => handleRowClick(article)}
                  >
                    <td>{article.title}</td>
                    <td>{new Date(article.publishedAt).toLocaleDateString('vi-VN')}</td>
                    <td>
                      <span className={`${styles.status} ${article.status === 'Show' ? styles.statusShow : styles.statusHidden}`}>
                        {article.status}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEdit(article.slug); }}
                        className={styles.actionButton}
                      >
                        Sửa
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleToggleStatus(article.slug, article.status); }}
                        className={`${styles.actionButton} ${article.status === 'Show' ? styles.hideButton : styles.showButton}`}
                      >
                        {article.status === 'Show' ? 'Ẩn' : 'Hiển thị'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className={styles.noData}>Không có bài viết để hiển thị.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {selectedArticle && (
          <div className={styles.popupOverlay}>
            <div className={styles.popup}>
              <h2 className={styles.popupTitle}>Chi Tiết Bài Viết</h2>
              <div className={styles.popupContent}>
                <div className={styles.articleHeader}>
                  <h3>{selectedArticle.title}</h3>
                  <p className={styles.meta}>
                    Ngày xuất bản: {new Date(selectedArticle.publishedAt).toLocaleDateString('vi-VN')} | 
                    Trạng thái: <span className={`${styles.status} ${selectedArticle.status === 'Show' ? styles.statusShow : styles.statusHidden}`}>
                      {selectedArticle.status}
                    </span>
                  </p>
                </div>
                <div 
                  className={styles.articleContent} 
                  dangerouslySetInnerHTML={createMarkup(selectedArticle.content)}
                />
              </div>
              <button className={styles.closeButton} onClick={closePopup}>
                Đóng
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsManagement;