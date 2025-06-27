import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import styles from './categorynew.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faEye, faEyeSlash, faPlus } from '@fortawesome/free-solid-svg-icons';

// Function to convert name to slug
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters except spaces and hyphens
    .trim()
    .replace(/\s+/g, "-"); // Replace spaces with hyphens
};

const CategoryNewsManagement = () => {
  const [categories, setCategories] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editCategory, setEditCategory] = useState(null); // State cho popup chỉnh sửa/tạo mới
  const navigate = useNavigate();

  const API_BASE_URL = 'https://api-tuyendung-cty.onrender.com';

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
      }

      const res = await fetch(`${API_BASE_URL}/api/new-category`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Lỗi HTTP: ${res.status} ${res.statusText}`);
      }

      const result = await res.json();
      console.log('Dữ liệu từ API:', result);

      const data = Array.isArray(result) ? result : [];
      const transformed = data.map(item => ({
        id: item._id || 'unknown',
        slug: item.slug || 'unknown',
        name: item.category || 'Không có tên',
        status: item.status === 'show' ? 'Hiển thị' : 'Ẩn',
        createdAt: item.createdAt || new Date().toISOString(),
      }));

      setCategories(transformed);
    } catch (err) {
      console.error('Lỗi khi tải danh mục tin tức:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Toggle show/hide
  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Hiển thị' ? 'Ẩn' : 'Hiển thị';
    if (!window.confirm(`Bạn có chắc muốn ${newStatus.toLowerCase()} danh mục tin tức này?`)) return;

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin/login');
        throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
      }

      console.log(`Gửi yêu cầu toggle cho id: ${id}, status: ${newStatus}`);

      const res = await fetch(`${API_BASE_URL}/api/new-category/${id}/toggle-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus === 'Hiển thị' ? 'show' : 'hide' }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('Lỗi API chi tiết:', errorData);
        throw new Error(`Lỗi cập nhật trạng thái: ${errorData.message || res.statusText}`);
      }

      console.log('Cập nhật trạng thái thành công:', await res.json());
      await fetchCategories();
      alert(`Đã cập nhật trạng thái: ${newStatus}`);
    } catch (err) {
      console.error('Lỗi khi toggle trạng thái:', err);
      alert(`Lỗi cập nhật trạng thái: ${err.message}`);
    }
  };

  // Handle edit
  const handleEdit = (category) => {
    setEditCategory({ ...category, status: category.status === 'Hiển thị' ? 'show' : 'hide' });
  };

  // Save edited or new category
  const handleSaveEdit = async () => {
    if (!editCategory || !editCategory.name) return;

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin/login');
        throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
      }

      const slug = generateSlug(editCategory.name);
      const payload = {
        category: editCategory.name,
        slug: editCategory.id ? editCategory.slug : slug, // Giữ slug cũ nếu chỉnh sửa, tạo mới nếu tạo
        status: editCategory.status,
      };

      const url = editCategory.id
        ? `${API_BASE_URL}/api/new-category/${editCategory.id}` // Cập nhật
        : `${API_BASE_URL}/api/new-category`; // Tạo mới (giả định endpoint POST)

      const method = editCategory.id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(`Lỗi ${editCategory.id ? 'cập nhật' : 'tạo'} danh mục: ${errorData.message || res.statusText}`);
      }

      await fetchCategories();
      setEditCategory(null);
      alert(`${editCategory.id ? 'Cập nhật' : 'Tạo'} danh mục thành công!`);
    } catch (err) {
      console.error('Lỗi khi lưu chỉnh sửa/tạo:', err);
      alert(`Lỗi ${editCategory.id ? 'cập nhật' : 'tạo'} danh mục: ${err.message}`);
    }
  };

  // Filtered categories
  const filteredCategories = categories.filter(category =>
    statusFilter === 'all' || category.status === statusFilter
  );

  if (loading) return <div className={styles.container}>Đang tải...</div>;
  if (error) return <div className={styles.container}>Lỗi: {error}</div>;

  return (
    <div className={styles.container}>
      <Sidebar />
      <div className={styles.content}>
        <h1 className={styles.title}>Quản Lý Danh Mục Tin Tức</h1>

        {/* Filter & Create */}
        <div className={styles.searchFilter}>
          <select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Hiển thị">Hiển thị</option>
            <option value="Ẩn">Ẩn</option>
          </select>
          <button className={styles.createButton} onClick={() => setEditCategory({ id: '', name: '', slug: '', status: 'show' })}>
            <FontAwesomeIcon icon={faPlus} /> Tạo Thêm Danh Mục
          </button>
        </div>

        {/* Table */}
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                <th>Tên danh mục tin tức</th>
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
                      onClick={() => handleEdit(category)}
                    >
                      <FontAwesomeIcon icon={faPenToSquare} />
                    </button>
                    <button
                      className={styles.iconButton}
                      title={category.status === 'Hiển thị' ? 'Ẩn danh mục tin tức' : 'Hiển thị danh mục tin tức'}
                      onClick={() => handleToggleStatus(category.id, category.status)}
                    >
                      <FontAwesomeIcon icon={category.status === 'Hiển thị' ? faEyeSlash : faEye} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className={styles.noData}>Không có danh mục tin tức để hiển thị.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Popup Edit/Create Category */}
        {editCategory && (
          <div className={styles.popupOverlay}>
            <div className={styles.popupContent}>
              <h2>{editCategory.id ? 'Chỉnh Sửa Danh Mục' : 'Tạo Danh Mục Mới'}</h2>
              <input
                type="text"
                value={editCategory.name}
                onChange={(e) => setEditCategory({ ...editCategory, name: e.target.value, slug: generateSlug(e.target.value) })}
                placeholder="Tên danh mục"
                className={styles.inputField}
              />
              <input
                type="text"
                value={editCategory.slug}
                readOnly // Slug tự động tạo, không cho chỉnh sửa
                className={styles.inputField}
              />
              <select
                value={editCategory.status}
                onChange={(e) => setEditCategory({ ...editCategory, status: e.target.value })}
                className={styles.inputField}
              >
                <option value="show">Hiển thị</option>
                <option value="hide">Ẩn</option>
              </select>
              <div className={styles.popupButtons}>
                <button onClick={handleSaveEdit} className={styles.saveButton}>Lưu</button>
                <button onClick={() => setEditCategory(null)} className={styles.cancelButton}>Hủy</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryNewsManagement;