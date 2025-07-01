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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const navigate = useNavigate();

  const API_BASE_URL = process.env.REACT_APP_API_BASE;
  const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/150';

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
          ? item.thumbnailUrl.startsWith('http') || item.thumbnailUrl.startsWith('data:')
            ? item.thumbnailUrl
            : `${API_BASE_URL}/${item.thumbnailUrl.replace(/^\/+/, '')}`
          : PLACEHOLDER_IMAGE;

        return {
          id: item._id,
          slug: item.slug,
          title: item.title || 'Không có tiêu đề',
          contentBlocks: item.contentBlocks || [],
          publishedAt: item.publishedAt || item.createdAt,
          views: item.views || 0,
          status: item.status === 'show' ? 'Hiển thị' : 'Ẩn',
          category: item['category-new'] || 'Chưa phân loại',
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

  useEffect(() => {
    fetchNews();
  }, []);

  const filteredNews = news.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (statusFilter === 'all' || article.status === statusFilter)
  );

  const handleEdit = (slug) => navigate(`/admin/editnew/${slug}`);

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

  const renderContentBlocks = (blocks) => {
    return blocks.map((block, index) => {
      switch (block.type) {
        case 'heading':
          return <h3 key={index}>{block.content}</h3>;
        case 'sub_heading':
          return <h4 key={index}>{block.content}</h4>;
        case 'text':
          return <p key={index} dangerouslySetInnerHTML={{ __html: block.content }} />;
        case 'list':
          return <ul key={index}><li>• (Danh sách cần cập nhật nội dung từ backend)</li></ul>;
        case 'image':
          const imageUrl = block.url
            ? block.url.startsWith('http') || block.url.startsWith('data:')
              ? block.url
              : `${API_BASE_URL}/${block.url.replace(/^\/+/, '')}`
            : PLACEHOLDER_IMAGE;
          return (
            <div key={index} className={styles.articleImageWrapper}>
              <img src={imageUrl} alt={block.caption || ''} onError={(e) => (e.target.src = PLACEHOLDER_IMAGE)} />
              {block.caption && <p className={styles.imageCaption}>{block.caption}</p>}
            </div>
          );
        default:
          return null;
      }
    });
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
          <button className={styles.addButton} onClick={() => navigate('/admin/add_news')}>+ Thêm Tin Tức</button>
        </div>

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
                    <button className={styles.iconButton} title="Chỉnh sửa" onClick={(e) => { e.stopPropagation(); handleEdit(article.slug); }}>
                      <FontAwesomeIcon icon={faPenToSquare} />
                    </button>
                    <button className={styles.iconButton} title={article.status === 'Hiển thị' ? 'Ẩn' : 'Hiển thị'} onClick={(e) => { e.stopPropagation(); handleToggleStatus(article.slug, article.status); }}>
                      <FontAwesomeIcon icon={article.status === 'Hiển thị' ? faEyeSlash : faEye} />
                    </button>
                    <button className={styles.iconButton} title="Xoá" onClick={(e) => { e.stopPropagation(); handleDeleteArticle(article.slug); }}>
                      <FontAwesomeIcon icon={faTrash} />
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

        {selectedArticle && (
          <div className={styles.popupOverlay} onClick={(e) => e.target === e.currentTarget && setSelectedArticle(null)}>
            <div className={styles.popup}>
              <h2 className={styles.popupTitle}>Chi Tiết Bài Viết</h2>
              <div className={styles.popupContent}>
                <h3>{selectedArticle.title}</h3>
                <p className={styles.meta}>
                  Danh mục: {selectedArticle.category} | Ngày: {new Date(selectedArticle.publishedAt).toLocaleDateString('vi-VN')} |
                  Lượt xem: {selectedArticle.views} | Trạng thái: <span className={selectedArticle.status === 'Hiển thị' ? styles.statusShow : styles.statusHidden}>{selectedArticle.status}</span>
                </p>
                <img src={selectedArticle.image} alt={selectedArticle.title} className={styles.articleImage} onError={(e) => (e.target.src = PLACEHOLDER_IMAGE)} />
                <div className={styles.articleContent}>{renderContentBlocks(selectedArticle.contentBlocks)}</div>
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
