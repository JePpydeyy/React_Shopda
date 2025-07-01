import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../Sidebar/Sidebar';
import styles from './Discount.module.css';

// const API_URL = 'https://api-tuyendung-cty.onrender.com/api/discount';
const API_URL = `${process.env.REACT_APP_API_URL}/discount`;

const defaultForm = {
  code: '',
  discountPercentage: '',
  expirationDate: '',
  usageLimit: 1,
  isActive: true,
};

const AD_Discout = () => {
  const [discounts, setDiscounts] = useState([]);
  const [filteredDiscounts, setFilteredDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [form, setForm] = useState(defaultForm);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const discountsPerPage = 10;

  // Fetch all discounts
  useEffect(() => {
    const fetchDiscounts = async () => {
      setLoading(true);
      try {
        const res = await axios.get(API_URL);
        setDiscounts(res.data);
        setFilteredDiscounts(res.data);
      } catch (err) {
        setError('Không thể tải danh sách mã giảm giá');
      } finally {
        setLoading(false);
      }
    };
    fetchDiscounts();
  }, []);

  // Filter discounts based on search term and status
  useEffect(() => {
    let filtered = discounts;
    if (searchTerm) {
      filtered = filtered.filter((d) =>
        d.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter((d) => d.isActive === (statusFilter === 'active'));
    }
    setFilteredDiscounts(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, discounts]);

  // Pagination
  const indexOfLastDiscount = currentPage * discountsPerPage;
  const indexOfFirstDiscount = indexOfLastDiscount - discountsPerPage;
  const currentDiscounts = filteredDiscounts.slice(indexOfFirstDiscount, indexOfLastDiscount);
  const totalPages = Math.ceil(filteredDiscounts.length / discountsPerPage);

  // Open modal for add/edit
  const openModal = (mode, discount = null) => {
    setModalMode(mode);
    setError('');
    if (mode === 'edit' && discount) {
      setForm({
        code: discount.code,
        discountPercentage: discount.discountPercentage,
        expirationDate: discount.expirationDate.slice(0, 10),
        usageLimit: discount.usageLimit,
        isActive: discount.isActive,
      });
      setEditId(discount._id);
    } else {
      setForm(defaultForm);
      setEditId(null);
    }
    setModalOpen(true);
  };

  // Handle form change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Add or update discount
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('adminToken');
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };
      if (modalMode === 'add') {
        const res = await axios.post(API_URL, form, config);
        setDiscounts((prev) => [...prev, res.data]);
      } else {
        const res = await axios.put(`${API_URL}/${editId}`, form, config);
        setDiscounts((prev) =>
          prev.map((d) => (d._id === editId ? res.data : d))
        );
      }
      setModalOpen(false);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          'Có lỗi xảy ra'
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  // Delete discount
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa mã này?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDiscounts((prev) => prev.filter((d) => d._id !== id));
    } catch {
      alert('Không thể xóa mã giảm giá');
    }
  };

  // Toggle active
  const handleToggleActive = async (discount) => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.put(
        `${API_URL}/${discount._id}`,
        { ...discount, isActive: !discount.isActive },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDiscounts((prev) =>
        prev.map((d) =>
          d._id === discount._id ? { ...d, isActive: res.data.isActive } : d
        )
      );
    } catch {
      alert('Không thể thay đổi trạng thái');
    }
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className={styles.container}>
      <Sidebar />
      <div className={styles.content}>
        <h1 className={styles.title}>Quản lý mã giảm giá</h1>
        <div className={styles.searchFilter}>
          <input
            type="text"
            placeholder="Tìm kiếm mã giảm giá..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Kích hoạt</option>
            <option value="inactive">Vô hiệu</option>
          </select>
          <button className={styles.addButton} onClick={() => openModal('add')}>
            Thêm mã giảm giá
          </button>
        </div>
        {loading ? (
          <div className={styles.loading}>Đang tải...</div>
        ) : error ? (
          <div className={styles.error}>{error}</div>
        ) : (
          <>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead className={styles.tableHeader}>
                  <tr>
                    <th>STT</th>
                    <th>Mã</th>
                    <th>Phần trăm (%)</th>
                    <th>Ngày hết hạn</th>
                    <th>Đã dùng</th>
                    <th>số lượt có thể dùng</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {currentDiscounts.map((d, idx) => (
                    <tr key={d._id} className={styles.tableRow}>
                      <td>{indexOfFirstDiscount + idx + 1}</td>
                      <td>{d.code}</td>
                      <td>{d.discountPercentage}</td>
                      <td>{new Date(d.expirationDate).toLocaleDateString()}</td>
                      <td>{d.usedCount}</td>
                      <td>{d.usageLimit}</td>
                      <td>
                        <span
                          className={
                            d.isActive ? styles.statusActive : styles.statusInactive
                          }
                        >
                          {d.isActive ? 'Kích hoạt' : 'Vô hiệu'}
                        </span>
                      </td>
                      <td>
                        <button
                          className={styles.actionButton}
                          onClick={() => openModal('edit', d)}
                        >
                          Sửa
                        </button>
                        <button
                          className={`${styles.actionButton} ${styles.deleteButton}`}
                          onClick={() => handleDelete(d._id)}
                        >
                          Xóa
                        </button>
                        <button
                          className={`${styles.actionButton} ${styles.toggleButton}`}
                          onClick={() => handleToggleActive(d)}
                        >
                          {d.isActive ? 'Vô hiệu' : 'Kích hoạt'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className={styles.pagination}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    className={`${styles.pageButton} ${currentPage === page ? styles.activePage : ''}`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* Modal */}
        {modalOpen && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h2>
                {modalMode === 'add' ? 'Thêm mã giảm giá' : 'Sửa mã giảm giá'}
              </h2>
              {error && <div className={styles.error}>{error}</div>}
              <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                  <label>Mã giảm giá:</label>
                  <input
                    type="text"
                    name="code"
                    value={form.code}
                    onChange={handleChange}
                    required
                    disabled={modalMode === 'edit'}
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Phần trăm giảm (%):</label>
                  <input
                    type="number"
                    name="discountPercentage"
                    value={form.discountPercentage}
                    onChange={handleChange}
                    min={0}
                    max={100}
                    required
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Ngày hết hạn:</label>
                  <input
                    type="date"
                    name="expirationDate"
                    value={form.expirationDate}
                    onChange={handleChange}
                    required
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>số lượt dùng:</label>
                  <input
                    type="number"
                    name="usageLimit"
                    value={form.usageLimit}
                    onChange={handleChange}
                    min={1}
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>
                    Kích hoạt:
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={form.isActive}
                      onChange={handleChange}
                      className={styles.checkbox}
                    />
                  </label>
                </div>
                <div className={styles.formActions}>
                  <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={submitLoading}
                  >
                    {submitLoading ? 'Đang lưu...' : 'Lưu'}
                  </button>
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={() => setModalOpen(false)}
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AD_Discout;