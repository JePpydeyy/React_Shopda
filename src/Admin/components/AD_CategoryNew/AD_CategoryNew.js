import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import styles from './categorynew.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faEye, faEyeSlash, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import ToastNotification from '../../../components/ToastNotification/ToastNotification';

const generateSlug = (name) => {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
};

const CategoryNewsManagement = () => {
  const [categories, setCategories] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('none');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editCategory, setEditCategory] = useState(null);
  const [toast, setToast] = useState({ message: '', type: '', show: false });
  const navigate = useNavigate();

  const API_BASE_URL = process.env.REACT_APP_API_BASE || 'https://api-tuyendung-cty.onrender.com';

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('adminToken');
      if (!token) throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');

      // Lấy danh sách danh mục
      const categoryRes = await fetch(`${API_BASE_URL}/api/new-category`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!categoryRes.ok) throw new Error(`Lỗi HTTP: ${categoryRes.status} ${categoryRes.statusText}`);

      const categoryResult = await categoryRes.json();
      const categoryData = Array.isArray(categoryResult) ? categoryResult : [];

      // Lấy danh sách bài viết
      const newsRes = await fetch(`${API_BASE_URL}/api/new`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!newsRes.ok) throw new Error('Không thể lấy danh sách bài viết');

      const newsResult = await newsRes.json();
      const newsData = Array.isArray(newsResult) ? newsResult : newsResult.data || newsResult.news || [];

      // Đếm số bài viết cho mỗi danh mục
      const transformed = categoryData.map(item => {
        const newsCount = newsData.filter(news => 
          (news.newCategory?._id || news.newCategory) === item._id
        ).length;

        return {
          id: item._id || 'unknown',
          slug: item.slug || 'unknown',
          name: item.category || 'Không có tên',
          status: item.status === 'show' ? 'Hiển thị' : 'Ẩn',
          createdAt: item.createdAt || new Date().toISOString(),
          newsCount,
        };
      });

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

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Hiển thị' ? 'hidden' : 'show';
    const statusLabel = newStatus === 'show' ? 'Hiển thị' : 'Ẩn';

    if (!window.confirm(`Bạn có chắc muốn ${statusLabel.toLowerCase()} danh mục này? Tất cả bài viết liên quan cũng sẽ được ${statusLabel.toLowerCase()}.`)) return;

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin/login');
        throw new Error('Không tìm thấy token xác thực.');
      }

      // Bước 1: Cập nhật trạng thái danh mục
      const categoryRes = await fetch(`${API_BASE_URL}/api/new-category/${id}/toggle-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!categoryRes.ok) {
        const errorData = await categoryRes.json().catch(() => ({}));
        throw new Error(`Lỗi cập nhật trạng thái danh mục: ${errorData.message || categoryRes.statusText}`);
      }

      // Bước 2: Lấy danh sách bài viết liên quan đến danh mục
      const newsRes = await fetch(`${API_BASE_URL}/api/new`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!newsRes.ok) throw new Error('Không thể lấy danh sách bài viết');

      const newsResult = await newsRes.json();
      const newsData = Array.isArray(newsResult) ? newsResult : newsResult.data || newsResult.news || [];

      // Lọc các bài viết thuộc danh mục hiện tại
      const relatedNews = newsData.filter(item => 
        (item.newCategory?._id || item.newCategory) === id
      );

      // Bước 3: Cập nhật trạng thái cho từng bài viết liên quan
      for (const news of relatedNews) {
        const formData = new FormData();
        formData.append('status', newStatus);
        formData.append('category-new', id);
        formData.append('title', news.title || '');
        formData.append('publishedAt', news.publishedAt || new Date().toISOString());
        formData.append('views', news.views?.toString() || '0');

        const updateNewsRes = await fetch(`${API_BASE_URL}/api/new/${news.slug}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (!updateNewsRes.ok) {
          const errorData = await updateNewsRes.json().catch(() => ({}));
          console.error(`Lỗi cập nhật bài viết ${news.slug}: ${errorData.message || updateNewsRes.statusText}`);
        }
      }

      // Làm mới danh sách danh mục
      await fetchCategories();
      setToast({ message: `Đã cập nhật trạng thái danh mục và các bài viết liên quan thành: ${statusLabel}`, type: 'success', show: true });
    } catch (err) {
      setToast({ message: `Lỗi: ${err.message}`, type: 'error', show: true });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa danh mục tin tức này?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin/login');
        throw new Error('Không tìm thấy token xác thực.');
      }

      const res = await fetch(`${API_BASE_URL}/api/new-category/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(`Lỗi xóa danh mục: ${errorData.message || res.statusText}`);
      }

      await fetchCategories();
      setToast({ message: 'Đã xóa danh mục thành công!', type: 'success', show: true });
    } catch (err) {
      setToast({ message: `Lỗi xóa danh mục: ${err.message}`, type: 'error', show: true });
    }
  };

  const handleEdit = (category) => {
    setEditCategory({ ...category, status: category.status === 'Hiển thị' ? 'show' : 'hide' });
  };

  const handleSaveEdit = async () => {
    if (!editCategory || !editCategory.name) {
      setToast({ message: 'Tên danh mục không được để trống!', type: 'error', show: true });
      return;
    }

    // Kiểm tra tên danh mục trùng lặp
    const trimmedName = editCategory.name.trim();
    const isDuplicate = categories.some(
      category => 
        category.name.toLowerCase() === trimmedName.toLowerCase() &&
        category.id !== editCategory.id // Bỏ qua danh mục hiện tại khi chỉnh sửa
    );

    if (isDuplicate) {
      setToast({ message: 'Tên danh mục đã tồn tại! Vui lòng chọn tên khác.', type: 'error', show: true });
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) throw new Error('Không tìm thấy token xác thực.');

      const slug = generateSlug(trimmedName);
      const payload = {
        category: trimmedName,
        slug: editCategory.id ? editCategory.slug : slug,
        status: editCategory.status,
      };

      const url = editCategory.id
        ? `${API_BASE_URL}/api/new-category/${editCategory.id}`
        : `${API_BASE_URL}/api/new-category`;
      const method = editCategory.id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
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
      setToast({ message: `${editCategory.id ? 'Cập nhật' : 'Tạo'} danh mục thành công!`, type: 'success', show: true });
    } catch (err) {
      setToast({ message: `Lỗi: ${err.message}`, type: 'error', show: true });
    }
  };

  const closeToast = () => {
    setToast({ ...toast, show: false });
  };

  // Lọc và sắp xếp danh mục
  const filteredCategories = categories
    .filter(category =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (statusFilter === 'all' || category.status === statusFilter)
    )
    .sort((a, b) => {
      if (sortOrder === 'most') return b.newsCount - a.newsCount; // Nhiều nhất
      if (sortOrder === 'least') return a.newsCount - b.newsCount; // Ít nhất
      return 0; // Không sắp xếp
    });

  if (loading) return <div className={styles.container}>Đang tải...</div>;
  if (error) return <div className={styles.container}>Lỗi: {error}</div>;

  return (
    <div className={styles.container}>
      <Sidebar />
      <div className={styles.content}>
        <h1 className={styles.title}>Quản Lý Danh Mục Tin Tức</h1>

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
          <select
            className={styles.filterSelect}
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="none">Không sắp xếp</option>
            <option value="most">Số bài viết: Nhiều nhất</option>
            <option value="least">Số bài viết: Ít nhất</option>
          </select>
          <button className={styles.createButton} onClick={() => setEditCategory({ id: '', name: '', status: 'show' })}>
            <FontAwesomeIcon icon={faPlus} /> Tạo Thêm Danh Mục
          </button>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                <th>Tên danh mục tin tức</th>
                <th>Số bài viết</th>
                <th>Ngày tạo</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.length > 0 ? filteredCategories.map(category => (
                <tr key={category.slug} className={styles.tableRow}>
                  <td>{category.name}</td>
                  <td>{category.newsCount}</td>
                  <td>{new Date(category.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td>
                    <span className={`${styles.status} ${category.status === 'Hiển thị' ? styles.statusShow : styles.statusHidden}`}>
                      {category.status}
                    </span>
                  </td>
                  <td>
                    <button className={styles.iconButton} onClick={() => handleEdit(category)} title="Chỉnh sửa">
                      <FontAwesomeIcon icon={faPenToSquare} />
                    </button>
                    <button className={styles.iconButton} onClick={() => handleToggleStatus(category.id, category.status)} title="Ẩn/Hiện">
                      <FontAwesomeIcon icon={category.status === 'Hiển thị' ? faEyeSlash : faEye} />
                    </button>
                    <button className={styles.iconButton} onClick={() => handleDelete(category.id)} title="Xóa">
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className={styles.noData}>Không có danh mục để hiển thị.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {editCategory && (
          <div className={styles.popupOverlay}>
            <div className={styles.popupContent}>
              <h2>{editCategory.id ? 'Chỉnh Sửa Danh Mục' : 'Tạo Danh Mục Mới'}</h2>
              <input
                type="text"
                value={editCategory.name}
                onChange={(e) => setEditCategory({ ...editCategory, name: e.target.value })}
                placeholder="Tên danh mục"
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

        {toast.show && (
          <ToastNotification
            message={toast.message}
            type={toast.type}
            onClose={closeToast}
          />
        )}
      </div>
    </div>
  );
};

export default CategoryNewsManagement;