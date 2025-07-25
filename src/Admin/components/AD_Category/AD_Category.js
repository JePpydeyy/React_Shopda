import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../Sidebar/Sidebar';
import ToastNotification from '../../../components/ToastNotification/ToastNotification';
import styles from './Category.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPenToSquare, faTrash, faEye, faEyeSlash, faTimes } from '@fortawesome/free-solid-svg-icons';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [currentCategory, setCurrentCategory] = useState({ id: '', name_categories: '', status: 'show' });
  const [modalError, setModalError] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });
  // Thêm state mới cho xác nhận toggle trạng thái
  const [toggleConfirm, setToggleConfirm] = useState({ open: false, id: null, currentStatus: '' });

  const API_URL = process.env.REACT_APP_API_URL;

  const isAuthenticated = () => !!localStorage.getItem('adminToken');

  // Đóng các modal khi nhấn phím Esc
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && (isModalOpen || deleteConfirm.open || toggleConfirm.open)) {
        setIsModalOpen(false);
        setDeleteConfirm({ open: false, id: null });
        setToggleConfirm({ open: false, id: null, currentStatus: '' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, deleteConfirm.open, toggleConfirm.open]);

  // Fetch danh mục từ API (giữ nguyên)
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      setError(null);
      setErrorMessage(null);
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
        setErrorMessage('Không thể tải danh mục. Vui lòng thử lại.');
        console.error('Error fetching categories:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setSuccessMessage(null);
    setErrorMessage(null);
    if (!isAuthenticated()) {
      setErrorMessage('Vui lòng đăng nhập với quyền admin để thêm danh mục.');
      setTimeout(() => window.location.href = '/admin/login', 2000);
      return;
    }
    setModalMode('add');
    setCurrentCategory({ id: '', name_categories: '', status: 'show' });
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = async (id) => {
    setSuccessMessage(null);
    setErrorMessage(null);
    if (!isAuthenticated()) {
      setErrorMessage('Vui lòng đăng nhập với quyền admin để sửa danh mục.');
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
      setSuccessMessage('Tải thông tin danh mục thành công');
    } catch (err) {
      setModalError('Không thể tải danh mục. Vui lòng thử lại.');
      setErrorMessage('Không thể tải danh mục. Vui lòng thử lại.');
      console.error('Error fetching category:', err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);
    if (!isAuthenticated()) {
      setErrorMessage('Vui lòng đăng nhập với quyền admin.');
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
        setSuccessMessage('Cập nhật danh mục thành công');
      } else {
        response = await axios.post(`${API_URL}/category`, data, config);
        const newCategory = {
          id: response.data._id,
          name_categories: response.data.category,
          status: response.data.status,
        };
        setCategories([...categories, newCategory]);
        setSuccessMessage('Thêm danh mục thành công');
      }
      setIsModalOpen(false);
    } catch (err) {
      if (err.response?.status === 401) {
        setModalError('Phiên đăng nhập hết hạn hoặc không có quyền admin. Đang chuyển hướng đến trang đăng nhập...');
        setErrorMessage('Phiên đăng nhập hết hạn hoặc không có quyền admin.');
        setTimeout(() => window.location.href = '/admin/login', 2000);
      } else {
        setModalError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
        setErrorMessage(err.response?.data?.message || 'Có lỗi xảy ra khi lưu danh mục.');
      }
      console.error('Error saving category:', err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setSuccessMessage(null);
    setErrorMessage(null);
    if (!isAuthenticated()) {
      setErrorMessage('Vui lòng đăng nhập với quyền admin để xóa danh mục.');
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
      setSuccessMessage('Xóa danh mục thành công');
      setDeleteConfirm({ open: false, id: null });
    } catch (err) {
      setDeleteConfirm({ open: false, id: null });
      if (err.response?.status === 401) {
        setErrorMessage('Phiên đăng nhập hết hạn hoặc không có quyền admin.');
        setTimeout(() => window.location.href = '/admin/login', 2000);
      } else {
        setErrorMessage(err.response?.data?.message || 'Không thể xóa danh mục.');
        console.error('Error deleting category:', err);
      }
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    setSuccessMessage(null);
    setErrorMessage(null);
    if (!isAuthenticated()) {
      setErrorMessage('Vui lòng đăng nhập với quyền admin để thay đổi trạng thái.');
      setTimeout(() => window.location.href = '/admin/login', 2000);
      return;
    }
    // Nếu đang chuyển từ 'show' sang 'hidden', hiển thị popup xác nhận
    if (currentStatus === 'show') {
      setToggleConfirm({ open: true, id, currentStatus });
      return;
    }
    // Nếu chuyển từ 'hidden' sang 'show', thực hiện ngay không cần xác nhận
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
      setSuccessMessage(`Đã thay đổi trạng thái danh mục thành ${response.data.status === 'show' ? 'Hiển thị' : 'Ẩn'}`);
    } catch (err) {
      if (err.response?.status === 401) {
        setErrorMessage('Phiên đăng nhập hết hạn hoặc không có quyền admin.');
        setTimeout(() => window.location.href = '/admin/login', 2000);
      } else {
        setErrorMessage('Không thể thay đổi trạng thái danh mục. Vui lòng thử lại.');
        console.error('Error toggling status:', err);
      }
    }
  };

  const confirmToggleStatus = async () => {
    try {
      const response = await axios.put(
        `${API_URL}/category/${toggleConfirm.id}/toggle-status`,
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
        category.id === toggleConfirm.id ? updatedCategory : category
      ));
      setSuccessMessage(`Đã thay đổi trạng thái danh mục thành ${response.data.status === 'show' ? 'Hiển thị' : 'Ẩn'}`);
      setToggleConfirm({ open: false, id: null, currentStatus: '' });
    } catch (err) {
      setToggleConfirm({ open: false, id: null, currentStatus: '' });
      if (err.response?.status === 401) {
        setErrorMessage('Phiên đăng nhập hết hạn hoặc không có quyền admin.');
        setTimeout(() => window.location.href = '/admin/login', 2000);
      } else {
        setErrorMessage('Không thể thay đổi trạng thái danh mục. Vui lòng thử lại.');
        console.error('Error toggling status:', err);
      }
    }
  };

  const handleCloseToast = () => {
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const filteredCategories = categories.filter(category =>
    category.name_categories.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <Sidebar />
      <div className={styles.content}>
        <h1 className={styles.title}>Quản Lý Danh Mục</h1>
        <div className={styles.searchFilter}>
          <input
            type="text"
            placeholder="Tìm kiếm danh mục..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button onClick={openAddModal} className={styles.addButton} title="Thêm danh mục">
            <FontAwesomeIcon icon={faPlus} /> Thêm Danh Mục
          </button>
        </div>

        {error && <div className={styles.error}>{error}</div>}
        {isLoading && <div className={styles.loading}>Đang tải...</div>}

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
                        title="Sửa danh mục"
                      >
                        <FontAwesomeIcon icon={faPenToSquare} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ open: true, id: category.id })}
                        className={`${styles.actionButton} ${styles.deleteButton}`}
                        title="Xóa danh mục"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(category.id, category.status)}
                        className={styles.actionButton}
                        title={category.status === 'show' ? 'Ẩn danh mục' : 'Hiển thị danh mục'}
                      >
                        <FontAwesomeIcon icon={category.status === 'show' ? faEyeSlash : faEye} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {isModalOpen && (
          <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
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
                    <button type="submit" className={styles.submitButton} title={modalMode === 'edit' ? 'Cập nhật danh mục' : 'Thêm danh mục'}>
                      <FontAwesomeIcon icon={faPlus} /> {modalMode === 'edit' ? 'Cập nhật' : 'Thêm'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className={styles.cancelButton}
                      title="Hủy"
                    >
                      <FontAwesomeIcon icon={faTimes} /> Hủy
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {deleteConfirm.open && (
          <div className={styles.modalOverlay} onClick={() => setDeleteConfirm({ open: false, id: null })}>
            <div className={styles.modal} style={{ maxWidth: 400, textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
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
                  title="Xóa danh mục"
                >
                  <FontAwesomeIcon icon={faTrash} /> Xóa
                </button>
                <button
                  className={styles.cancelButton}
                  onClick={() => setDeleteConfirm({ open: false, id: null })}
                  title="Hủy"
                >
                  <FontAwesomeIcon icon={faTimes} /> Hủy
                </button>
              </div>
            </div>
          </div>
        )}

        {toggleConfirm.open && (
          <div className={styles.modalOverlay} onClick={() => setToggleConfirm({ open: false, id: null, currentStatus: '' })}>
            <div className={styles.modal} style={{ maxWidth: 400, textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
              <div style={{ marginBottom: 16 }}>
                <svg width="48" height="48" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="12" fill="#fdecea"/>
                  <path d="M15 9l-6 6M9 9l6 6" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 style={{ color: '#e74c3c', marginBottom: 12, fontWeight: 600 }}>Xác nhận ẩn danh mục</h3>
              <p style={{ marginBottom: 24, color: '#333' }}>
                <strong>Tất cả sản phẩm trong danh mục này sẽ bị ẩn đi.</strong><br />
              </p>
              <div className={styles.formActions}>
                <button
                  className={styles.submitButton}
                  style={{ background: '#e74c3c' }}
                  onClick={confirmToggleStatus}
                  title="Ẩn danh mục"
                >
                  <FontAwesomeIcon icon={faEyeSlash} /> Ẩn
                </button>
                <button
                  className={styles.cancelButton}
                  onClick={() => setToggleConfirm({ open: false, id: null, currentStatus: '' })}
                  title="Hủy"
                >
                  <FontAwesomeIcon icon={faTimes} /> Hủy
                </button>
              </div>
            </div>
          </div>
        )}

        {successMessage && (
          <ToastNotification
            message={successMessage}
            type="success"
            onClose={handleCloseToast}
          />
        )}
        {errorMessage && (
          <ToastNotification
            message={errorMessage}
            type="error"
            onClose={handleCloseToast}
          />
        )}
      </div>
    </div>
  );
};

export default CategoryManagement;