import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar'; // Assuming Sidebar is in the same directory
import styles from './new.module.css';

const NewsManagement = () => {
  const [news, setNews] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Sample data (replace with API call in production)
  const initialNews = [
    {
      id: "NEWS001",
      title: "Top 5 Mẫu Vòng Tay Phong Thủy Hợp Mệnh Hỏa",
      author: "Nguyễn Thị An",
      publishDate: "2025-06-15T08:00:00.000Z",
      status: "Đã xuất bản",
    },
    {
      id: "NEWS002",
      title: "Đá Moonstone: Bí Mật Tinh Hoa Của Mặt Trăng",
      author: "Trần Văn Bình",
      publishDate: "2025-06-14T10:30:00.000Z",
      status: "Bản nháp",
    },
    {
      id: "NEWS003",
      title: "Cách Chọn Trang Sức Thời Trang Cho Mùa Hè",
      author: "Lê Thị Cẩm",
      publishDate: "2025-06-13T14:15:00.000Z",
      status: "Đã xuất bản",
    },
  ];

  useEffect(() => {
    // Simulate API call
    setNews(initialNews);
  }, []);

  const filteredNews = news.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (statusFilter === 'all' || article.status === statusFilter)
  );

  const statuses = [...new Set(news.map(article => article.status))];

  const handleEdit = (id) => {
    // Implement edit functionality
    console.log(`Edit news ${id}`);
  };

  const handleDelete = (id) => {
    // Implement delete functionality
    console.log(`Delete news ${id}`);
  };

  return (
    <div className={styles.container}>
      <Sidebar />
      <div className={styles.content}>
        <h1 className={styles.title}>Quản Lý Tin Tức</h1>
        
        {/* Search and Filters */}
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
            <option value="all">Tất cả trạng thái</option>
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <Link to="/admin/news/add" className={styles.addButton}>
            Thêm Tin Tức
          </Link>
        </div>

        {/* News Table */}
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHeader}>
                <th>Tiêu đề</th>
                <th>Tác giả</th>
                <th>Ngày xuất bản</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredNews.map(article => (
                <tr key={article.id} className={styles.tableRow}>
                  <td>{article.title}</td>
                  <td>{article.author}</td>
                  <td>{new Date(article.publishDate).toLocaleDateString('vi-VN')}</td>
                  <td>{article.status}</td>
                  <td>
                    <button
                      onClick={() => handleEdit(article.id)}
                      className={styles.actionButton}
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(article.id)}
                      className={`${styles.actionButton} ${styles.deleteButton}`}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default NewsManagement;