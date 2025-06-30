import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './New.module.css';

const New = () => {
  const [newsItems, setNewsItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_BASE;

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
          id: item._id,
          slug: item.slug,
          title: item.title || 'Không có tiêu đề',
          date: new Date(item.publishedAt).toLocaleDateString('vi-VN', {
            year: 'numeric', month: 'long', day: 'numeric',
          }),
          image: item.thumbnailUrl || '/placeholder-image.jpg',
        }));

        setNewsItems(mapped);
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
          <div className={styles.newsGrid}>
            {loadingNews ? (
              <div className={styles.loading}>Đang tải bài viết...</div>
            ) : error ? (
              <div className={styles.error}>Lỗi: {error}</div>
            ) : newsItems.length > 0 ? (
              newsItems.map((item) => (
                <div key={item.id} className={styles.newsPost}>
                  <div className={styles.postImage}>
                    <img
                      src={item.image.startsWith('http') ? item.image : `${API_BASE_URL}/${item.image}`}
                      alt={item.title}
                      onError={(e) => (e.target.src = '/placeholder-image.jpg')}
                    />
                  </div>
                  <div className={styles.postContent}>
                    <p>
                      <i className="fas fa-calendar-alt" style={{ marginRight: 5 }}></i>
                      {item.date}
                    </p>
                    <h3>{item.title}</h3>
                    <div className={styles.postLink}>
                      <Link to={`/newdetail/${item.slug}`}>XEM THÊM</Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.noItems}>Không có bài viết nào.</div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default New;
