import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import styles from './categorynew.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faTrash, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const API_BASE_URL = 'https://api-tuyendung-cty.onrender.com';

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/new-category`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`,
        },
      });
      const result = await res.json();
      const data = Array.isArray(result) ? result : [];

      const transformed = data.map(item => ({
        id: item._id,
        slug: item.slug,
        name: item.category || 'Không có tên',
        status: item.status === 'show' ? 'Hiển thị' : 'Ẩn',
        createdAt: item.createdAt,
      }));

      setCategories(transformed);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle delete category
  const handleDelete = async (slug) => {
    if (!window.confirm('Bạn có chắc muốn xóa danh mục này?')) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/new-category/${slug}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`,
        },
      });

      if (res.ok) {
        await fetchCategories();
        alert('Đã xóa danh mục thành công');
      } else {
        alert('Lỗi xóa danh mục');
      }
    } catch (err) {
      alert('Lỗi xóa danh mục');
    }
  };

  // Handle edit
  const handleEdit = (slug) => {
    navigate(`/admin/categories/edit/${slug}`);
  };

  // Toggle show/hide
  const handleToggleStatus = async (slug, currentStatus) => {
    const newStatus = currentStatus === 'Hiển thị' ? 'Ẩn' : 'Hiển thị';
    if (!window.confirm(`Bạn có chắc muốn ${newStatus.toLowerCase()} danh mục này?`)) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/new-category/${slug}/toggle-visibility`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`,
        },
        body: JSON.stringify({ status: newStatus === 'Hiển thị' ? 'show' : 'hide' }),
      });

      if (res.ok) {
        await fetchCategories();
        alert(`Đã cập nhật trạng thái: ${newStatus}`);
      } else {
        alert('Lỗi cập nhật trạng thái');
      }
    } catch (err) {
      alert('Lỗi cập nhật trạng thái');
    }
  };

  // Filtered categories
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (statusFilter === 'all' || category.status === statusFilter)
  );

  if (loading) return <div className={styles.container}>Đang tải...</div>;
  if (error) return <div className={styles.container}>Lỗi: {error}</div>;

  return (
    <div className={styles.container}>
      <Sidebar />
      <div className={styles.content}>
        <h1 className={styles.title}>Quản Lý Danh Mục Tin Tức</h1>

        {/* Search & Filter */}
        <div className={styles.searchFilter}>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Tìm kiếm danh mục..."
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
          <Link to="/admin/categories/add" className={styles.addButton}>Thêm danh mục mới</Link>
        </div>

        {/* Table */}
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                <th>Tên danh mục</th>
                <th>Ngày tạo</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.length > 0 ? filteredCategories.map(category => (
                <tr key={category.slug} className={styles.tableRow}>
                  <td>{category.name}</td>
                  <td>{new Date(category.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td>
                    <span className={`${styles.status} ${category.status === 'Hiển thị' ? styles.statusShow : styles.statusHidden}`}>
                      {category.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className={styles.iconButton}
                      title="Chỉnh sửa"
                      onClick={() => handleEdit(category.slug)}
                    >
                      <FontAwesomeIcon icon={faPenToSquare} />
                    </button>
                    <button
                      className={styles.iconButton}
                      title={category.status === 'Hiển thị' ? 'Ẩn danh mục' : 'Hiển thị danh mục'}
                      onClick={() => handleToggleStatus(category.slug, category.status)}
                    >
                      <FontAwesomeIcon icon={category.status === 'Hiển thị' ? faEyeSlash : faEye} />
                    </button>
                    <button
                      className={styles.iconButton}
                      title="Xóa"
                      onClick={() => handleDelete(category.slug)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className={styles.noData}>Không có danh mục để hiển thị.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CategoryManagement;