import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './New.module.css';

const New = () => {
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = [
    { name: 'Phong Thủy', href: 'phong-thuy.html' },
    { name: 'Thông Tin Đá', href: 'thong-tin-da.html' },
    { name: 'Tin Khuyến Mãi', href: 'tin-khuyen-mai.html' },
    { name: 'Giải Trí', href: 'giai-tri.html' },
  ];

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('https://api-tuyendung-cty.onrender.com/api/new');
        if (!response.ok) {
          throw new Error('Failed to fetch news');
        }
        const data = await response.json();
        const formattedNews = data.map(item => ({
          id: item._id,
          date: new Date(item.publishedAt).toLocaleDateString('vi-VN', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          }),
          title: item.title,
          image: item.thumbnailUrl,
        }));
        setNewsItems(formattedNews);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const API_BASE_URL = process.env.REACT_APP_API_BASE;

  return (
    <main className={styles.newsContainer}>
      <div className={styles.newsLayout}>
        <nav className={styles.categoryMenu}>
          <h1 className={styles.categoryTitle}>Bài viết</h1>
          <ul className={styles.categoryList}>
            {categories.map((category, index) => (
              <li key={index}>
                <a href={category.href} className={styles.categoryItem}>
                  {category.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className={styles.newsSection}>
          <div className={styles.newsGrid}>
            {newsItems.map((item) => (
              <div key={item.id} className={styles.newsPost}>
                <div className={styles.postImage}>
                  <img src={`${API_BASE_URL}/${item.image}`} alt={item.title} />
                </div>
                <div className={styles.postContent}>
                  <p>
                    <i className="fa-regular fa-calendar-days"></i> {item.date}
                  </p>
                  <h3>{item.title}</h3>
                  <div className={styles.postLink}>
                    <Link to={`/newdetail/${item.id}`}>XEM THÊM</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.pagination}>
            <a href="#" className={styles.paginationItem}>
              <i className="fa-solid fa-arrow-left"></i>
            </a>
            <a href="#" className={`${styles.paginationItem} ${styles.active}`}>1</a>
            <a href="#" className={styles.paginationItem}>2</a>
            <a href="#" className={styles.paginationItem}>3</a>
            <a href="#" className={styles.paginationItem}>
              <i className="fa-solid fa-arrow-right"></i>
            </a>
          </div>
        </div>
      </div>
    </main>
  );
};

export default New;