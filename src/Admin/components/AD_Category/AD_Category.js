import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../Sidebar/Sidebar';
import styles from './Category.module.css';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [currentCategory, setCurrentCategory] = useState({ id: '', name_categories: '', status: 'show' });
  const [modalError, setModalError] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });

  // Base API URL (use proxy in development)
  const API_URL = process.env.REACT_APP_API_URL;

  // Check if user is authenticated
  const isAuthenticated = () => !!localStorage.getItem('adminToken');

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${API_URL}/category`);
        const transformedCategories = response.data.map(cat => ({
          id: cat._id,
          name_categories: cat.category,
          status: cat.status,
        }));
        setCategories(transformedCategories);
      } catch (err) {
        setError('Không thể tải danh mục. Vui lòng thử lại.');
        console.error('Error fetching categories:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Open modal for adding
  const openAddModal = () => {
    if (!isAuthenticated()) {
      setError('Vui lòng đăng nhập với quyền admin để thêm danh mục.');
      setTimeout(() => window.location.href = '/admin/login', 2000);
      return;
    }
    setModalMode('add');
    setCurrentCategory({ id: '', name_categories: '', status: 'show' });
    setModalError(null);
    setIsModalOpen(true);
  };

  // Open modal for editing
  const openEditModal = async (id) => {
    if (!isAuthenticated()) {
      setError('Vui lòng đăng nhập với quyền admin để sửa danh mục.');
      setTimeout(() => window.location.href = '/admin/login', 2000);
      return;
    }
    setModalMode('edit');
    setModalError(null);
    setModalLoading(true);
    try {
      const response = await axios.get(`${API_URL}/category/${id}`);
      setCurrentCategory({
        id: response.data._id,
        name_categories: response.data.category,
        status: response.data.status,
      });
      setIsModalOpen(true);
    } catch (err) {
      setModalError('Không thể tải danh mục. Vui lòng thử lại.');
      console.error('Error fetching category:', err);
    } finally {
      setModalLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated()) {
      setModalError('Vui lòng đăng nhập với quyền admin.');
      setTimeout(() => window.location.href = '/admin/login', 2000);
      return;
    }
    setModalError(null);
    setModalLoading(true);

    try {
      const data = { category: currentCategory.name_categories, status: currentCategory.status };
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      };

      let response;
      if (modalMode === 'edit') {
        response = await axios.put(`${API_URL}/category/${currentCategory.id}`, data, config);
        const updatedCategory = {
          id: response.data._id,
          name_categories: response.data.category,
          status: response.data.status,
        };
        setCategories(categories.map(cat => (cat.id === currentCategory.id ? updatedCategory : cat)));
      } else {
        response = await axios.post(`${API_URL}/category`, data, config);
        const newCategory = {
          id: response.data._id,
          name_categories: response.data.category,
          status: response.data.status,
        };
        setCategories([...categories, newCategory]);
      }
      setIsModalOpen(false);
    } catch (err) {
      if (err.response?.status === 401) {
        setModalError('Phiên đăng nhập hết hạn hoặc không có quyền admin. Đang chuyển hướng đến trang đăng nhập...');
        setTimeout(() => window.location.href = '/admin/login', 2000);
      } else {
        setModalError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
      }
      console.error('Error saving category:', err);
    } finally {
      setModalLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!isAuthenticated()) {
      setError('Vui lòng đăng nhập với quyền admin để xóa danh mục.');
      setTimeout(() => window.location.href = '/admin/login', 2000);
      return;
    }
    try {
      await axios.delete(`${API_URL}/category/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });
      setCategories(categories.filter(category => category.id !== id));
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Phiên đăng nhập hết hạn hoặc không có quyền admin. Đang chuyển hướng đến trang đăng nhập...');
        setTimeout(() => window.location.href = '/admin/login', 2000);
      } else {
        setError('Không thể xóa danh mục. Vui lòng thử lại.');
      }
      console.error('Error deleting category:', err);
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (id) => {
    if (!isAuthenticated()) {
      setError('Vui lòng đăng nhập với quyền admin để thay đổi trạng thái.');
      setTimeout(() => window.location.href = '/admin/login', 2000

      );
      return;
    }
    try {
      const response = await axios.put(
        `${API_URL}/category/${id}/toggle-status`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
        }
      );
      const updatedCategory = {
        id: response.data._id,
        name_categories: response.data.category,
        status: response.data.status,
      };
      setCategories(categories.map(category =>
        category.id === id ? updatedCategory : category
      ));
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Phiên đăng nhập hết hạn hoặc không có quyền admin. Đang chuyển hướng đến trang đăng nhập...');
        setTimeout(() => window.location.href = '/admin/login', 2000);
      } else {
        setError('Không thể thay đổi trạng thái danh mục. Vui lòng thử lại.');
      }
      console.error('Error toggling status:', err);
    }
  };

  // Filter categories based on search term
  const filteredCategories = categories.filter(category =>
    category.name_categories.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <button onClick={openAddModal} className={styles.addButton}>
            Thêm Danh Mục
          </button>
        </div>

        {/* Error and Loading States */}
        {error && <div className={styles.error}>{error}</div>}
        {isLoading && <div className={styles.loading}>Đang tải...</div>}

        {/* Category Table */}
        {!isLoading && (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr className={styles.tableHeader}>
                  <th>STT</th>
                  <th>Tên danh mục</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((category, index) => (
                  <tr key={category.id} className={styles.tableRow}>
                    <td>{index + 1}</td>
                    <td>{category.name_categories}</td>
                    <td>{category.status === 'show' ? 'Hiển thị' : 'Ẩn'}</td>
                    <td>
                      <button
                        onClick={() => openEditModal(category.id)}
                        className={styles.actionButton}
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ open: true, id: category.id })}
                        className={`${styles.actionButton} ${styles.deleteButton}`}
                      >
                        Xóa
                      </button>
                      <button
                        onClick={() => handleToggleStatus(category.id)}
                        className={styles.actionButton}
                      >
                        {category.status === 'show' ? 'Ẩn' : 'Hiển thị'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal for Add/Edit */}
        {isModalOpen && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h2>{modalMode === 'edit' ? 'Sửa Danh Mục' : 'Thêm Danh Mục'}</h2>
              {modalError && <div className={styles.error}>{modalError}</div>}
              {modalLoading && <div className={styles.loading}>Đang xử lý...</div>}
              {!modalLoading && (
                <form onSubmit={handleSubmit} className={styles.form}>
                  <div className={styles.formGroup}>
                    <label htmlFor="categoryName">Tên danh mục</label>
                    <input
                      type="text"
                      id="categoryName"
                      value={currentCategory.name_categories}
                      onChange={(e) =>
                        setCurrentCategory({ ...currentCategory, name_categories: e.target.value })
                      }
                      required
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="status">Trạng thái</label>
                    <select
                      id="status"
                      value={currentCategory.status}
                      onChange={(e) =>
                        setCurrentCategory({ ...currentCategory, status: e.target.value })
                      }
                      className={styles.input}
                    >
                      <option value="show">Hiển thị</option>
                      <option value="hidden">Ẩn</option>
                    </select>
                  </div>
                  <div className={styles.formActions}>
                    <button type="submit" className={styles.submitButton}>
                      {modalMode === 'edit' ? 'Cập nhật' : 'Thêm'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className={styles.cancelButton}
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm.open && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal} style={{ maxWidth: 400, textAlign: 'center' }}>
              <div style={{ marginBottom: 16 }}>
                <svg width="48" height="48" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="12" fill="#fdecea"/>
                  <path d="M15 9l-6 6M9 9l6 6" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 style={{ color: '#e74c3c', marginBottom: 12, fontWeight: 600 }}>Xác nhận xóa danh mục</h3>
              <p style={{ marginBottom: 24, color: '#333' }}>
                <strong>Tất cả sản phẩm trong danh mục này sẽ bị ẩn đi.</strong><br />
                
              </p>
              <div className={styles.formActions}>
                <button
                  className={styles.submitButton}
                  style={{ background: '#e74c3c' }}
                  onClick={async () => {
                    await handleDelete(deleteConfirm.id);
                    setDeleteConfirm({ open: false, id: null });
                  }}
                >
                  Xóa
                </button>
                <button
                  className={styles.cancelButton}
                  onClick={() => setDeleteConfirm({ open: false, id: null })}
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryManagement;