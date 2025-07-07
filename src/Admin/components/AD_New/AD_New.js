import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import styles from './ad_new.module.css';
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
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE || 'https://api-tuyendung-cty.onrender.com';
  const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/150';
  const PAGE_SIZE = 12;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/new-category`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken') || ''}`,
          },
        });
        const result = await res.json();
        setCategories(Array.isArray(result) ? result : result.data || []);
      } catch {
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/new`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken') || ''}`,
        },
      });

      const result = await res.json();
      const data = result.data || result.news || result || [];

      const transformed = data.map(item => {
        const imageUrl = item.thumbnailUrl?.startsWith('http')
          ? item.thumbnailUrl
          : `${API_BASE_URL}/${item.thumbnailUrl?.replace(/^\/+/, '')}`;

        const categoryOid = item['category-new']?.oid || '';
        const category = categories.find(c => c._id === categoryOid)?.category || 'Chưa phân loại';

        return {
          id: item._id,
          slug: item.slug,
          title: item.title || 'Không có tiêu đề',
          publishedAt: item.publishedAt || item.createdAt,
          views: item.views || 0,
          status: item.status === 'show' ? 'Hiển thị' : 'Ẩn',
          category: categoryOid,
          categoryName: category,
          image: imageUrl || PLACEHOLDER_IMAGE,
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
    if (categories.length > 0) fetchNews();
  }, [categories]);

  const filteredNews = news.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (statusFilter === 'all' || article.status === statusFilter) &&
    (categoryFilter === 'all' || article.category === categoryFilter)
  );

  const paginatedNews = filteredNews.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const totalPages = Math.ceil(filteredNews.length / PAGE_SIZE);

  const handleEdit = (slug) => {
    navigate(`/admin/editnew/${slug}`);
  };

  const handleToggleStatus = async (slug, currentStatus) => {
    const newStatus = currentStatus === 'Hiển thị' ? 'hidden' : 'show';
    const statusLabel = newStatus === 'show' ? 'Hiển thị' : 'Ẩn';

    if (!window.confirm(`Bạn có chắc muốn ${statusLabel.toLowerCase()} bài viết này?`)) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const article = news.find(item => item.slug === slug);
      if (!article) throw new Error('Không tìm thấy bài viết.');

      const formDataToSend = new FormData();
      formDataToSend.append('title', article.title);
      formDataToSend.append('slug', article.slug);
      formDataToSend.append('thumbnailUrl', article.image !== PLACEHOLDER_IMAGE ? article.image : '');
      formDataToSend.append('thumbnailCaption', '');
      formDataToSend.append('status', newStatus);
      formDataToSend.append('publishedAt', article.publishedAt || new Date().toISOString());
      formDataToSend.append('views', article.views.toString());
      formDataToSend.append('contentBlocks', JSON.stringify([]));
      formDataToSend.append('category-new', JSON.stringify({ oid: article.category }));

      const res = await fetch(`${API_BASE_URL}/api/new/${slug}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi không xác định');

      await fetchNews();
      if (selectedArticle?.slug === slug) {
        setSelectedArticle(prev => ({ ...prev, status: statusLabel }));
      }

      alert(`Đã cập nhật trạng thái: ${statusLabel}`);
    } catch (err) {
      alert(`Lỗi cập nhật trạng thái: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteArticle = async (slug) => {
    if (!window.confirm('Bạn có chắc muốn xóa bài viết này không?')) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/new/${slug}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken') || ''}`,
        },
      });

      const result = await res.json();
      if (res.ok) {
        alert('Đã xóa bài viết thành công.');
        fetchNews();
        if (selectedArticle?.slug === slug) setSelectedArticle(null);
      } else {
        alert(`Xóa thất bại: ${result.message || 'Lỗi không xác định'}`);
      }
    } catch (err) {
      alert(`Lỗi khi xóa bài viết: ${err.message}`);
    }
  };

  const handleShowDetail = async (article) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/new/${article.slug}`);
      const result = await res.json();
      if (res.ok) {
        const contentData = result.data || result;
        const contentBlocks = contentData.contentBlocks || [];
        setSelectedArticle({
          ...article,
          contentBlocks,
        });
      } else {
        alert('Không lấy được nội dung bài viết');
      }
    } catch (err) {
      alert('Lỗi khi lấy nội dung chi tiết: ' + err.message);
    }
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
          <select className={styles.filterSelect} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">Tất cả trạng thái</option>
            <option value="Hiển thị">Hiển thị</option>
            <option value="Ẩn">Ẩn</option>
          </select>
          <select className={styles.filterSelect} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="all">Tất cả danh mục</option>
            <option value="">Chưa phân loại</option>
            {categories.map(c => (
              <option key={c._id} value={c._id}>{c.category}</option>
            ))}
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
              {paginatedNews.length > 0 ? paginatedNews.map(article => (
                <tr key={article.slug} className={styles.tableRow} onClick={() => handleShowDetail(article)}>
                  <td>
                    {article.title.split(' ').length > 11
                      ? article.title.split(' ').slice(0, 11).join(' ') + '...'
                      : article.title}
                  </td>
                  <td>{article.categoryName}</td>
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
                    <button className={styles.iconButton} title={article.status === 'Hiển thị' ? 'Ẩn bài viết' : 'Hiển thị bài viết'} onClick={(e) => { e.stopPropagation(); handleToggleStatus(article.slug, article.status); }}>
                      <FontAwesomeIcon icon={article.status === 'Hiển thị' ? faEyeSlash : faEye} />
                    </button>
                    <button className={styles.iconButton} title="Xóa bài viết" onClick={(e) => { e.stopPropagation(); handleDeleteArticle(article.slug); }}>
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

        {totalPages > 1 && (
          <div className={styles.pagination}>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={`${styles.pageButton} ${currentPage === i + 1 ? styles.activePage : ''}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedArticle && (
        <div className={styles.popupOverlay} onClick={() => setSelectedArticle(null)}>
          <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
            <div className={styles.articleHeader}>
              <h3>{selectedArticle.title}</h3>
              <div className={styles.meta}>
                <div>Danh mục: {selectedArticle.categoryName}</div>
                <div>Ngày xuất bản: {new Date(selectedArticle.publishedAt).toLocaleDateString('vi-VN')}</div>
                <div>Lượt xem: {selectedArticle.views}</div>
                <div>Trạng thái: {selectedArticle.status}</div>
              </div>
            </div>
            <div className={styles.postImage}>
              <img src={selectedArticle.image} alt="thumbnail" className={styles.articleImage} />
            </div>
            <div className={styles.articleContent}>
              {selectedArticle.contentBlocks?.length > 0 ? selectedArticle.contentBlocks.map((block, index) => {
                switch (block.type) {
                  case 'heading': return <h2 key={index}>{block.content}</h2>;
                  case 'sub_heading': return <h3 key={index}>{block.content}</h3>;
                  case 'text': return <p key={index}>{block.content}</p>;
                  case 'image': return (
                    <div key={index} className={styles.articleImage}>
                      <img src={block.url?.startsWith('http') ? block.url : `${API_BASE_URL}/${block.url}`} alt="block-img" />
                      {block.caption && <p style={{ fontStyle: 'italic', textAlign: 'center' }}>{block.caption}</p>}
                    </div>
                  );
                  case 'list': return (
                    <ul key={index}>
                      {block.items?.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  );
                  default: return null;
                }
              }) : <p>Không có nội dung để hiển thị.</p>}
            </div>
            <button className={styles.closeButton} onClick={() => setSelectedArticle(null)}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsManagement;
