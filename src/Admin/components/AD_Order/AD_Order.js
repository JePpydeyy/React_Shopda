import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar'; // Assuming Sidebar is in the same directory
import styles from './Order.module.css';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Sample data (replace with API call in production)
  const initialOrders = [
    {
      _id: 'ORD001',
      customerName: 'Nguyễn Văn A',
      email: 'vana@example.com',
      totalAmount: 7500000,
      status: 'Đang xử lý',
      orderDate: '2025-06-16T10:30:00.000Z',
      items: [
        { productName: 'VÒNG TAY JACK', quantity: 1, price: 5000000 },
        { productName: 'VÒNG MOONSTONE', quantity: 1, price: 2240000 },
      ],
    },
    {
      _id: 'ORD002',
      customerName: 'Trần Thị B',
      email: 'thib@example.com',
      totalAmount: 2340000,
      status: 'Đã giao',
      orderDate: '2025-06-15T14:45:00.000Z',
      items: [
        { productName: 'VÒNG CẨM THẠCH XANH', quantity: 1, price: 2340000 },
      ],
    },
    {
      _id: 'ORD003',
      customerName: 'Lê Văn C',
      email: 'vanc@example.com',
      totalAmount: 4010000,
      status: 'Đã hủy',
      orderDate: '2025-06-14T09:15:00.000Z',
      items: [
        { productName: 'VÒNG GARNET LỰU ĐỎ', quantity: 1, price: 4010000 },
      ],
    },
  ];

  useEffect(() => {
    // Simulate API call
    setOrders(initialOrders);
  }, []);

  const filteredOrders = orders.filter(order => 
    (order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
     order._id.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter === 'all' || order.status === statusFilter)
  );

  const statuses = [...new Set(orders.map(o => o.status))];

  const handleView = (id) => {
    // Implement view details functionality
    console.log(`View order ${id}`);
  };

  const handleUpdateStatus = (id, newStatus) => {
    // Implement status update functionality
    console.log(`Update order ${id} to status ${newStatus}`);
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
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        {/* Order Table */}
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHeader}>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Ngày đặt</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order._id} className={styles.tableRow}>
                  <td>{order._id}</td>
                  <td>{order.customerName}</td>
                  <td>{order.totalAmount.toLocaleString()} VNĐ</td>
                  <td>{order.status}</td>
                  <td>{new Date(order.orderDate).toLocaleDateString('vi-VN')}</td>
                  <td>
                    <Link
                      to={`/admin/orders/${order._id}`}
                      className={styles.actionButton}
                      onClick={() => handleView(order._id)}
                    >
                      Xem
                    </Link>
                    <select
                      className={styles.statusSelect}
                      value={order.status}
                      onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                    >
                      <option value="Đang xử lý">Đang xử lý</option>
                      <option value="Đã giao">Đã giao</option>
                      <option value="Đã hủy">Đã hủy</option>
                    </select>
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

export default OrderManagement;