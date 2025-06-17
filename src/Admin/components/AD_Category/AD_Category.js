import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar'; // Assuming Sidebar is in the same directory
import styles from './Category.module.css';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Sample data (replace with API call in production)
  const initialCategories = [
    {
      id: "684f9ce9398a8acfc7ee1495",
      name_categories: "Phong Thủy",
    },
    {
      id: "684f9cde398a8acfc7ee1492",
      name_categories: "Thời trang",
    },
  ];

  useEffect(() => {
    // Simulate API call
    setCategories(initialCategories);
  }, []);

  const filteredCategories = categories.filter(category =>
    category.name_categories.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (id) => {
    // Implement edit functionality
    console.log(`Edit category ${id}`);
  };

  const handleDelete = (id) => {
    // Implement delete functionality
    console.log(`Delete category ${id}`);
  };

  return (
    <div className={styles.container}>
      <Sidebar />
      <div className={styles.content}>
        <h1 className={styles.title}>Quản Lý Danh Mục</h1>
        
        {/* Search and Add Button */}
        <div className={styles.searchFilter}>
          <input
            type="text"
            placeholder="Tìm kiếm danh mục..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Link to="/admin/categories/add" className={styles.addButton}>
            Thêm Danh Mục
          </Link>
        </div>

        {/* Category Table */}
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHeader}>
                <th>Mã danh mục</th>
                <th>Tên danh mục</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map(category => (
                <tr key={category.id} className={styles.tableRow}>
                  <td>{category.id}</td>
                  <td>{category.name_categories}</td>
                  <td>
                    <button
                      onClick={() => handleEdit(category.id)}
                      className={styles.actionButton}
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
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

export default CategoryManagement;