import React from 'react';
import styles from './New.module.css';

const New = () => {
  const newsItems = [
    { id: 1, date: 'Tháng Năm 23, 2025', title: 'CÁC VÒNG ĐÁ CHO NĂM NĂNG LƯỢNG SỐ 9', image: 'img1.jpg' },
    { id: 2, date: 'Tháng Hai 7, 2025', title: 'CHỌN VÒNG ĐÁ PHONG THỦY ĐÚNG CÁCH', image: 'img2.jpg' },
    { id: 3, date: 'Tháng Hai 7, 2025', title: 'CHỌN VÒNG ĐÁ PHONG THỦY ĐÚNG CÁCH', image: 'img2.jpg' },
    { id: 4, date: 'Tháng Hai 7, 2025', title: 'CHỌN VÒNG ĐÁ PHONG THỦY ĐÚNG CÁCH', image: 'img2.jpg' },
    { id: 5, date: 'Tháng Hai 7, 2025', title: 'CHỌN VÒNG ĐÁ PHONG THỦY ĐÚNG CÁCH', image: 'img2.jpg' },
    { id: 6, date: 'Tháng Hai 7, 2025', title: 'CHỌN VÒNG ĐÁ PHONG THỦY ĐÚNG CÁCH', image: 'img2.jpg' },
    { id: 7, date: 'Tháng Hai 7, 2025', title: 'CHỌN VÒNG ĐÁ PHONG THỦY ĐÚNG CÁCH', image: 'img2.jpg' },
    { id: 8, date: 'Tháng Hai 7, 2025', title: 'CHỌN VÒNG ĐÁ PHONG THỦY ĐÚNG CÁCH', image: 'img2.jpg' },
    { id: 9, date: 'Tháng Hai 7, 2025', title: 'CHỌN VÒNG ĐÁ PHONG THỦY ĐÚNG CÁCH', image: 'img2.jpg' },
    { id: 10, date: 'Tháng Hai 7, 2025', title: 'CHỌN VÒNG ĐÁ PHONG THỦY ĐÚNG CÁCH', image: 'img2.jpg' },
    { id: 11, date: 'Tháng Hai 7, 2025', title: 'CHỌN VÒNG ĐÁ PHONG THỦY ĐÚNG CÁCH', image: 'img2.jpg' },
    { id: 12, date: 'Tháng Hai 7, 2025', title: 'CHỌN VÒNG ĐÁ PHONG THỦY ĐÚNG CÁCH', image: 'img2.jpg' },
    { id: 13, date: 'Tháng Hai 7, 2025', title: 'CHỌN VÒNG ĐÁ PHONG THỦY ĐÚNG CÁCH', image: 'img2.jpg' },
    { id: 14, date: 'Tháng Hai 7, 2025', title: 'CHỌN VÒNG ĐÁ PHONG THỦY ĐÚNG CÁCH', image: 'img2.jpg' },
    { id: 15, date: 'Tháng Hai 7, 2025', title: 'CHỌN VÒNG ĐÁ PHONG THỦY ĐÚNG CÁCH', image: 'img2.jpg' },
  ];

  const categories = [
    { name: 'Phong Thủy', href: 'phong-thuy.html' },
    { name: 'Thông Tin Đá', href: 'thong-tin-da.html' },
    { name: 'Tin Khuyến Mãi', href: 'tin-khuyen-mai.html' },
    { name: 'Giải Trí', href: 'giai-tri.html' },
  ];

  return (
    <main className={styles.newsContainer}>
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
                <img src={item.image} alt={item.title} />
              </div>
              <div className={styles.postContent}>
                <p>
                  <i className="fa-regular fa-calendar-days"></i> {item.date}
                </p>
                <h3>{item.title}</h3>
                <div className={styles.postLink}>
                  <a href="newdetail.html">XEM THÊM</a>
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
    </main>
  );
};

export default New;