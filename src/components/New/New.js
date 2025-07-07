import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './New.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDays, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

const New = () => {
  const [newsItems, setNewsItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const API_BASE_URL = process.env.REACT_APP_API_BASE;

  const truncateTitle = (title) => {
    const words = title.split(' ');
    if (words.length > 10) {
      return words.slice(0, 10).join(' ') + '...';
    }
    return title;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('vi-VN', options);
  };

  const getImageUrl = (image) => {
    if (!image) return '/images/placeholder.jpg';
    if (image.startsWith('http')) return image;
    return `${API_BASE_URL}/${image}`;
  };

  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/new-category`);
        if (!response.ok) throw new Error(`Lỗi tải danh mục: ${response.statusText}`);
        const data = await response.json();

        const categoryData = Array.isArray(data) ? data : data.data || [];
        const filtered = categoryData
          .filter((cat) => cat?.status === 'show')
          .map((cat) => ({
            _id: cat._id,
            name: cat.category,
          }));

        setCategories(filtered);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchNews = async () => {
      setLoadingNews(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/new`);
        if (!response.ok) throw new Error(`Lỗi tải bài viết: ${response.statusText}`);
        const data = await response.json();

        let items = Array.isArray(data) ? data : data.data || [];
        items = items.filter((item) => item?.status === 'show');

        if (selectedCategoryId) {
          items = items.filter((item) => item.category_new === selectedCategoryId);
        }

        const mapped = items.map((item) => ({
          _id: item._id,
          slug: item.slug,
          title: item.title || 'Không có tiêu đề',
          createdAt: item.publishedAt,
          thumbnailUrl: item.thumbnailUrl || '/images/kim.jpg',
        }));

        setNewsItems(mapped);
        setCurrentPage(1); // Reset to first page when data changes
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingNews(false);
      }
    };
    fetchNews();
  }, [selectedCategoryId]);

  const handleCategorySelect = (id) => {
    setSelectedCategoryId(id === selectedCategoryId ? null : id);
  };

  // Pagination logic
  const totalPages = Math.ceil(newsItems.length / itemsPerPage);
  const paginatedItems = newsItems
    .filter((article) => article.slug)
    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <main className={styles.newsContainer}>
      <div className={styles.newsLayout}>
        <nav className={styles.categoryMenu}>
          <h1 className={styles.categoryTitle}>Bài viết</h1>
          <ul className={styles.categoryList}>
            {loadingCategories ? (
              <li>Đang tải danh mục...</li>
            ) : error ? (
              <li>Lỗi: {error}</li>
            ) : (
              [{ _id: null, name: 'Tất cả' }, ...categories].map((cat) => (
                <li key={cat._id || 'all'}>
                  <a
                    href="#"
                    className={`${styles.categoryItem} ${selectedCategoryId === cat._id ? styles.active : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleCategorySelect(cat._id);
                    }}
                  >
                    {cat.name}
                  </a>
                </li>
              ))
            )}
          </ul>
        </nav>

        <div className={styles.newsSection}>
          <h2 className={styles.newsTitle}>Tin Tức Mới Nhất</h2>
          <div className={styles.newsGrid}>
            {loadingNews ? (
              <div className={styles.loading}>Đang tải bài viết...</div>
            ) : error ? (
              <div className={styles.error}>Lỗi: {error}</div>
            ) : paginatedItems.length > 0 ? (
              paginatedItems.map((article) => (
                <div key={article._id} className={styles.newsPost}>
                  <div className={styles.postImage}>
                    <img
                      src={getImageUrl(article.thumbnailUrl)}
                      alt={article.title}
                      className={styles.postImageImg}
                      onError={(e) => {
                        e.target.src = '/images/kim.jpg';
                      }}
                    />
                  </div>
                  <div className={styles.postContent}>
                    <p className={styles.postDate}>
                      <FontAwesomeIcon icon={faCalendarDays} className={styles.postDateIcon} />
                      {formatDate(article.createdAt)}
                    </p>
                    <h3 className={styles.postTitle}>{truncateTitle(article.title)}</h3>
                    <div className={styles.postLink}>
                      <Link to={`/newdetail/${article.slug}`} className={styles.postLinkA}>
                        XEM THÊM
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.noItems}>Không có bài viết nào.</div>
            )}
          </div>
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={`${styles.paginationItem} ${currentPage === 1 ? styles.disabled : ''}`}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index + 1}
                  className={`${styles.paginationItem} ${currentPage === index + 1 ? styles.active : ''}`}
                  onClick={() => handlePageChange(index + 1)}
                >
                  {index + 1}
                </button>
              ))}
              <button
                className={`${styles.paginationItem} ${currentPage === totalPages ? styles.disabled : ''}`}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default New;