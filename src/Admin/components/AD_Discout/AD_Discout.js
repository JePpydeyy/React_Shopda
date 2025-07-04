import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../Sidebar/Sidebar';
import ToastNotification from '../../../components/ToastNotification/ToastNotification';
import styles from './Discount.module.css';

const API_URL = `${process.env.REACT_APP_API_URL}/discount`;

const defaultForm = {
  code: '',
  discountPercentage: '',
  expirationDate: '',
  usageLimit: 1,
  isActive: true,
};

const AD_Discount = () => {
  const [discounts, setDiscounts] = useState([]);
  const [filteredDiscounts, setFilteredDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [form, setForm] = useState(defaultForm);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [orderDetails, setOrderDetails] = useState([]);
  const discountsPerPage = 10;

  // Generate short order code from MongoDB _id (first 8 characters)
  const generateShortOrderCode = (_id) => {
    return _id ? _id.substring(0, 8) : 'N/A';
  };

  // Fetch all discounts with orders
  useEffect(() => {
    const fetchDiscounts = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('adminToken');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get(`${API_URL}/with-orders`, config);
        setDiscounts(res.data);
        setFilteredDiscounts(res.data);
      } catch (err) {
        setError('Không thể tải danh sách mã giảm giá');
        setErrorMessage('Không thể tải danh sách mã giảm giá');
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
    setSuccessMessage(null);
    setErrorMessage(null);
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
    setSuccessMessage(null);
    setErrorMessage(null);
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
        setSuccessMessage('Thêm mã giảm giá thành công');
      } else {
        const res = await axios.put(`${API_URL}/${editId}`, form, config);
        setDiscounts((prev) =>
          prev.map((d) => (d._id === editId ? res.data : d))
        );
        setSuccessMessage('Cập nhật mã giảm giá thành công');
      }
      setModalOpen(false);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          'Có lỗi xảy ra'
      );
      setErrorMessage(
        err.response?.data?.message ||
          err.response?.data?.error ||
          'Có lỗi xảy ra khi lưu mã giảm giá'
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  // Delete discount
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa mã này?')) return;
    setSuccessMessage(null);
    setErrorMessage(null);
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDiscounts((prev) => prev.filter((d) => d._id !== id));
      setSuccessMessage('Xóa mã giảm giá thành công');
    } catch {
      setErrorMessage('Không thể xóa mã giảm giá');
    }
  };

  // Toggle active
  const handleToggleActive = async (discount) => {
    setSuccessMessage(null);
    setErrorMessage(null);
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
      setSuccessMessage(
        `Mã giảm giá đã được ${res.data.isActive ? 'kích hoạt' : 'vô hiệu'}`
      );
    } catch {
      setErrorMessage('Không thể thay đổi trạng thái mã giảm giá');
    }
  };

  // Fetch order details
  const fetchOrderDetails = async (discountId) => {
    setSuccessMessage(null);
    setErrorMessage(null);
    try {
      const discount = discounts.find((d) => d._id === discountId);
      if (discount && discount.orderIds) {
        setOrderDetails(discount.orderIds);
        setDetailsModalOpen(true);
        setSuccessMessage('Tải thông tin đơn hàng thành công');
      } else {
        setOrderDetails([]);
        setError('Không có đơn hàng nào sử dụng mã này.');
        setErrorMessage('Không có đơn hàng nào sử dụng mã này.');
        setDetailsModalOpen(true);
      }
    } catch (err) {
      setError('Không thể tải thông tin đơn hàng');
      setErrorMessage('Không thể tải thông tin đơn hàng');
      setDetailsModalOpen(false);
    }
  };

  // Close toast notification
  const handleCloseToast = () => {
    setSuccessMessage(null);
    setErrorMessage(null);
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
                    <th>Số lượt có thể dùng</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {currentDiscounts.map((d, idx) => (
                    <React.Fragment key={d._id}>
                      <tr className={styles.tableRow}>
                        <td>{indexOfFirstDiscount + idx + 1}</td>
                        <td>{d.code}</td>
                        <td>{d.discountPercentage}</td>
                        <td>{new Date(d.expirationDate).toLocaleDateString('vi-VN')}</td>
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
                          <button
                            className={styles.actionButton}
                            onClick={() => fetchOrderDetails(d._id)}
                          >
                            Xem chi tiết
                          </button>
                        </td>
                      </tr>
                    </React.Fragment>
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

        {/* Modal for add/edit discount */}
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
                  <label>Số lượt dùng:</label>
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

        {/* Modal for order details */}
        {detailsModalOpen && (
          <div className={styles.modalOverlay}>
            <div className={`${styles.modal} ${styles.detailsModal}`}>
              <h2>Thông tin đơn hàng sử dụng mã</h2>
              {error && <div className={styles.error}>{error}</div>}
              <div className={styles.orderDetailsContainer}>
                {orderDetails.length > 0 ? (
                  orderDetails.map((order, i) => (
                    <div key={i} className={styles.orderDetail}>
                      <h3>Đơn hàng #{i + 1}</h3>
                      <p><strong>Mã đơn hàng:</strong> {generateShortOrderCode(order._id)}</p>
                      <p><strong>Tên người dùng:</strong> {order.fullName}</p>
                      <p><strong>Số điện thoại:</strong> {order.phoneNumber}</p>
                      <p><strong>Email:</strong> {order.email}</p>
                      <p><strong>Tổng tiền:</strong> {order.totalAmount.toLocaleString('vi-VN')} VNĐ</p>
                      <p><strong>Tiền sau giảm giá:</strong> {order.grandTotal.toLocaleString('vi-VN')} VNĐ</p>
                      <p><strong>Trạng thái:</strong> {order.status}</p>
                      <p><strong>Ngày tạo:</strong> {new Date(order.createdAt).toLocaleString('vi-VN')}</p>
                      <p><strong>Sản phẩm:</strong></p>
                      <ul className={styles.productList}>
                        {order.products && order.products.length > 0 ? (
                          order.products.map((product, j) => (
                            <li key={j}>
                              {product.productName} (Kích thước: {product.size_name}, Số lượng: {product.quantity}, Giá: {product.price.toLocaleString('vi-VN')} VNĐ)
                            </li>
                          ))
                        ) : (
                          <li>Không có thông tin sản phẩm.</li>
                        )}
                      </ul>
                    </div>
                  ))
                ) : (
                  <p>Không có đơn hàng nào sử dụng mã này.</p>
                )}
              </div>
              <div className={styles.formActions}>
                <button
                  className={styles.closeButton}
                  onClick={() => setDetailsModalOpen(false)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notifications */}
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

export default AD_Discount;