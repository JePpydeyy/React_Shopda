import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './New.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDays } from '@fortawesome/free-solid-svg-icons';

const New = () => {
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const API_URL = process.env.REACT_APP_API_URL;
  const API_BASE = process.env.REACT_APP_API_BASE;

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/new`);
        if (!response.ok) throw new Error(`Lỗi tải bài viết: ${response.statusText}`);
        const data = await response.json();

        let items = Array.isArray(data) ? data : data.data || [];
        items = items.filter((item) => item?.status === 'show');

        const mapped = items.map((item) => ({
          id: item._id,
          slug: item.slug,
          title: item.title || 'Không có tiêu đề',
          createdAt: item.createdAt,
          thumbnailUrl: item.thumbnailUrl || '/images/kim.jpg',
        }));

        setNewsItems(mapped);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('vi-VN', options);
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/images/kim.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_BASE}/${imagePath.replace(/^\/+/, '')}`;
  };

  const totalPages = Math.ceil(newsItems.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = newsItems.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className={styles.newsContainer}>
      <div className={styles.newsLayout}>
        <h1 className={styles.categoryTitle}>Tin Tức Mới Nhất</h1>

        <div className={styles.newsSection}>
          <div className={styles.newsGrid}>
            {loading ? (
              <div className={styles.loading}>Đang tải bài viết...</div>
            ) : error ? (
              <div className={styles.error}>Lỗi: {error}</div>
            ) : currentItems.length > 0 ? (
              currentItems
                .filter((article) => article.slug)
                .map((item) => (
                  <div key={item.id} className={styles.newsPost}>
                    <div className={styles.postImage}>
                      <img
                        src={getImageUrl(item.thumbnailUrl)}
                        alt={item.title}
                        className={styles.postImageImg}
                        onError={(e) => (e.target.src = '/images/kim.jpg')}
                      />
                    </div>
                    <div className={styles.postContent}>
                      <p className={styles.postDate}>
                        <FontAwesomeIcon icon={faCalendarDays} className={styles.postDateIcon} />
                        {formatDate(item.createdAt)}
                      </p>
                      <h3 className={styles.postTitle}>{item.title}</h3>
                      <div className={styles.postLink}>
                        <Link to={`/newdetail/${item.slug}`} className={styles.postLinkA}>
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
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index + 1}
                  className={`${styles.pageButton} ${currentPage === index + 1 ? styles.activePage : ''}`}
                  onClick={() => handlePageChange(index + 1)}
                  disabled={currentPage === index + 1}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default New;
