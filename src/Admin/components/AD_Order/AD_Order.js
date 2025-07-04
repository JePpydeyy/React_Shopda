import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import styles from './Order.module.css';
import axios from 'axios';

const ORDERS_PER_PAGE = 10;
const API_URL = process.env.REACT_APP_API_URL;

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('adminToken');
        const res = await axios.get(`${API_URL}/order`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const sortedOrders = res.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setOrders(sortedOrders);
      } catch (err) {
        setError('Không thể tải danh sách đơn hàng');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Filter orders by search term and status
  const filteredOrders = orders.filter(
    (order) =>
      (order.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order._id?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter === 'all' || order.status === statusFilter)
  );

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ORDERS_PER_PAGE,
    currentPage * ORDERS_PER_PAGE
  );

  // List of all statuses
  const statuses = [
    'Chờ xử lý',
    'Đang giao',
    'Đã giao',
    'Đã hủy',
    'Đang hoàn',
    'Đã hoàn',
  ];

  // Determine valid next statuses
  const getStatusOptions = (currentStatus) => {
    const validNextStatuses = (() => {
      switch (currentStatus) {
        case 'Chờ xử lý':
          return ['Đang giao', 'Đã hủy'];
        case 'Đang giao':
          return ['Đã giao'];
        case 'Đã giao':
          return ['Đang hoàn'];
        case 'Đang hoàn':
          return ['Đã hoàn'];
        default:
          return [];
      }
    })();
    return statuses.map((status) => ({
      value: status,
      disabled: status !== currentStatus && !validNextStatuses.includes(status),
    }));
  };

  // Update order status
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(
        `${API_URL}/order/${id}/toggle-status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders((prev) =>
        prev.map((o) => (o._id === id ? { ...o, status: newStatus } : o))
      );
      if (selectedOrder && selectedOrder._id === id) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch {
      alert('Không thể cập nhật trạng thái đơn hàng');
    }
  };

  // View order details
  const handleView = async (id) => {
    setDetailLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.get(`${API_URL}/order/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedOrder(res.data);
    } catch {
      alert('Không thể tải chi tiết đơn hàng');
    } finally {
      setDetailLoading(false);
    }
  };

  // Close popup
  const closePopup = () => {
    setSelectedOrder(null);
  };

  // Handle click outside popup
  const handleOverlayClick = (e) => {
    if (e.target.className.includes(styles.popupOverlay)) {
      closePopup();
    }
  };

  // Print order
  const handlePrint = (order) => {
    const printContent = `
      <div>
        <h2>Chi tiết đơn hàng</h2>
        <p><strong>Khách hàng:</strong> ${order.fullName}</p>
        <p><strong>SĐT:</strong> ${order.phoneNumber}</p>
        <p><strong>Email:</strong> ${order.email}</p>
        <p><strong>Địa chỉ:</strong> ${order.address}, ${order.ward}, ${order.district}, ${order.city}, ${order.country}</p>
        <p><strong>Ghi chú:</strong> ${order.orderNote || 'Không có'}</p>
        <p><strong>Ngày đặt:</strong> ${new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
        <h3>Sản phẩm:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="border-bottom: 1px solid #ccc;">
              <th style="text-align: left; padding: 8px;">Tên sản phẩm</th>
              <th style="text-align: left; padding: 8px;">Kích thước</th>
              <th style="text-align: left; padding: 8px;">Số lượng</th>
              <th style="text-align: left; padding: 8px;">Đơn giá</th>
              <th style="text-align: left; padding: 8px;">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            ${order.products
              .map(
                (item) => `
              <tr style="border-bottom: 1px solid #ccc;">
                <td style="padding: 8px;">${item.productName}</td>
                <td style="padding: 8px;">${item.size_name}</td>
                <td style="padding: 8px;">${item.quantity}</td>
                <td style="padding: 8px;">${item.price.toLocaleString()} VNĐ</td>
                <td style="padding: 8px;">${(item.price * item.quantity).toLocaleString()} VNĐ</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
        <p><strong>Tổng tiền:</strong> ${order.totalAmount.toLocaleString()} VNĐ</p>
        <p><strong>Thành tiền cuối:</strong> ${order.grandTotal.toLocaleString()} VNĐ</p>
      </div>
    `;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>In đơn hàng - ${order._id}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 20px; }
            h2 { color: #1a1a3d; }
            p { margin: 10px 0; font-size: 16px; }
            strong { color: #1a1a3d; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ccc; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          ${printContent}
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSelectedOrder(null);
  };

  return (
    <div className={styles.container}>
      <Sidebar />
      <div className={styles.content}>
        <h1 className={styles.title}>Quản Lý Đơn Hàng</h1>

        {/* Search and Filters */}
        <div className={styles.searchFilter}>
          <input
            type="text"
            placeholder="Tìm kiếm theo mã đơn hoặc tên khách..."
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
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* Order Table */}
        <div className={styles.tableContainer}>
          {loading ? (
            <div className={styles.loading}>Đang tải...</div>
          ) : error ? (
            <div className={styles.error}>{error}</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr className={styles.tableHeader}>
                  <th>STT</th>
                  <th>Khách hàng</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Ngày đặt</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map((order, idx) => (
                  <tr
                    key={order._id}
                    className={styles.tableRow}
                    onClick={() => handleView(order._id)}
                  >
                    <td>{(currentPage - 1) * ORDERS_PER_PAGE + idx + 1}</td>
                    <td>{order.fullName}</td>
                    <td>{order.grandTotal?.toLocaleString() || order.totalAmount?.toLocaleString()} VNĐ</td>
                    <td>{order.status}</td>
                    <td>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <select
                        className={styles.statusSelect}
                        value={order.status}
                        onChange={(e) => {
                          handleUpdateStatus(order._id, e.target.value);
                        }}
                      >
                        {getStatusOptions(order.status).map((option) => (
                          <option
                            key={option.value}
                            value={option.value}
                            disabled={option.disabled}
                            style={option.disabled ? { color: '#999', backgroundColor: '#f0f0f0' } : {}}
                          >
                            {option.value}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Order Detail Popup */}
        {selectedOrder && (
          <div className={styles.popupOverlay} onClick={handleOverlayClick}>
            <div className={styles.popup}>
              <button className={styles.closeButton} onClick={closePopup}>
                ×
              </button>
              {detailLoading ? (
                <div className={styles.loading}>Đang tải chi tiết...</div>
              ) : (
                <div className={styles.detailContainer}>
                  <h2>Chi tiết đơn hàng</h2>
                  <p><strong>Khách hàng:</strong> {selectedOrder.fullName}</p>
                  <p><strong>Ngày sinh:</strong> {new Date(selectedOrder.dateOfBirth).toLocaleDateString('vi-VN')}</p>
                  <p><strong>SĐT:</strong> {selectedOrder.phoneNumber}</p>
                  <p><strong>Email:</strong> {selectedOrder.email}</p>
                  <p><strong>Địa chỉ:</strong> {`${selectedOrder.address}, ${selectedOrder.ward}, ${selectedOrder.district}, ${selectedOrder.city}, ${selectedOrder.country}`}</p>
                  <p><strong>Ghi chú:</strong> {selectedOrder.orderNote || 'Không có'}</p>
                  <p><strong>Trạng thái:</strong> {selectedOrder.status}</p>
                  <p><strong>Ngày đặt:</strong> {new Date(selectedOrder.createdAt).toLocaleDateString('vi-VN')}</p>
                  <h3>Sản phẩm:</h3>
                  <table className={styles.detailTable}>
                    <thead>
                      <tr>
                        <th>Tên sản phẩm</th>
                        <th>Kích thước</th>
                        <th>Số lượng</th>
                        <th>Đơn giá</th>
                        <th>Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.products.map((item, idx) => (
                        <tr key={idx}>
                          <td>{item.productName}</td>
                          <td>{item.size_name}</td>
                          <td>{item.quantity}</td>
                          <td>{item.price.toLocaleString()} VNĐ</td>
                          <td>{(item.price * item.quantity).toLocaleString()} VNĐ</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p><strong>Tổng tiền:</strong> {selectedOrder.totalAmount.toLocaleString()} VNĐ</p>
                  <p><strong>Thành tiền cuối:</strong> {selectedOrder.grandTotal.toLocaleString()} VNĐ</p>
                  <button
                    className={styles.printButton}
                    onClick={() => handlePrint(selectedOrder)}
                  >
                    In đơn hàng
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`${styles.pageButton} ${currentPage === page ? styles.activePage : ''}`}
                onClick={() => handlePageChange(page)}
                disabled={currentPage === page}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderManagement;