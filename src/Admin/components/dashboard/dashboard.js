import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import Sidebar from '../Sidebar/Sidebar';
import styles from './dashboard.module.css';

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);

// Utility function to format currency in VND
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const Dashboard = () => {
  const [stats, setStats] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Base API URL
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api-tuyendung-cty.onrender.com/api';

  // Check if user is authenticated
  const isAuthenticated = () => !!localStorage.getItem('adminToken');

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated()) {
        setError('Vui lòng đăng nhập với quyền admin.');
        setTimeout(() => (window.location.href = '/admin/login'), 2000);
        return;
      }
      setIsLoading(true);
      try {
        // Fetch data from all APIs
        const [ordersResponse, categoriesResponse, productsResponse, discountsResponse, newsCategoriesResponse, newsResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/order`, { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } }),
          axios.get(`${API_BASE_URL}/category`, { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } }),
          axios.get(`${API_BASE_URL}/product`, { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } }),
          axios.get(`${API_BASE_URL}/discount`, { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } }),
          axios.get(`${API_BASE_URL}/new-category`, { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } }),
          axios.get(`${API_BASE_URL}/new`, { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } })
        ]);

        // Set recent orders (limit to 5, sorted by createdAt descending)
        const sortedOrders = ordersResponse.data
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);
        setOrders(sortedOrders);

        // Calculate total revenue from orders
        const totalRevenue = ordersResponse.data.reduce((sum, order) => sum + (order.grandTotal || 0), 0) / 1000000; // Convert to millions

        // Update stats with API data
        const newStats = [
          { value: productsResponse.data.length || 0, change: 12, trend: 'up', label: 'Tổng sản phẩm', suffix: '' },
          { value: ordersResponse.data.length || 0, change: 5, trend: 'up', label: 'Đơn hàng', suffix: '' },
          { value: totalRevenue.toFixed(2), change: 18, trend: 'up', label: 'Doanh thu', suffix: ' triệu' },
          { value: categoriesResponse.data.length || 0, change: 8, trend: 'up', label: 'Danh mục sản phẩm', suffix: '' },
          { value: discountsResponse.data.length || 0, change: 3, trend: 'down', label: 'Mã giảm giá', suffix: '' },
          { value: newsCategoriesResponse.data.length || 0, change: 6, trend: 'up', label: 'Danh mục tin tức', suffix: '' },
          { value: newsResponse.data.length || 0, change: 4, trend: 'up', label: 'Tin tức', suffix: '' }
        ];

        setStats(newStats);
      } catch (err) {
        setError('Không thể tải dữ liệu. Vui lòng thử lại.');
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const chartData = {
    labels: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6'],
    datasets: [
      {
        label: 'Doanh thu',
        data: [1000, 1170, 660, 1030, 2000, 1500],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.3
      },
      {
        label: 'Chi phí',
        data: [400, 460, 1120, 540, 800, 600],
        borderColor: '#dc2626',
        backgroundColor: 'rgba(220, 38, 38, 0.1)',
        tension: 0.3
      },
      {
        label: 'Lợi nhuận',
        data: [600, 710, -460, 490, 1200, 900],
        borderColor: '#28a745',
        backgroundColor: 'rgba(40, 167, 69, 0.1)',
        tension: 0.3
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' },
      title: {
        display: true,
        text: 'Báo cáo doanh thu 6 tháng',
        font: { size: 16 }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        title: { display: true, text: 'Triệu đồng' }
      }
    }
  };

  return (
    <div className={styles.container}>
      <Sidebar />
      <div className={styles.content}>
        <h1 className={styles.title}>Tổng Quan Hệ Thống</h1>

        {error && <div className={styles.error}>{error}</div>}
        {isLoading && <div className={styles.loading}>Đang tải...</div>}

        {!isLoading && (
          <>
            <div className={styles.statsGrid}>
              {stats.map((stat, index) => (
                <div key={index} className={styles.statCard}>
                  <div
                    className={styles.statIcon}
                    style={{
                      backgroundColor: ['#3b82f6', '#28a745', '#10b981', '#dc2626', '#f59e0b', '#8b5cf6', '#ec4899'][index % 7]
                    }}
                  >
                    <i
                      className={`fas fa-${
                        index === 0 ? 'gem' :
                        index === 1 ? 'shopping-cart' :
                        index === 2 ? 'dollar-sign' :
                        index === 3 ? 'list' :
                        index === 4 ? 'tags' :
                        index === 5 ? 'newspaper' :
                        'file-alt'
                      }`}
                    ></i>
                  </div>
                  <h3>{stat.label}</h3>
                  <div className={styles.value}>{stat.value}{stat.suffix}</div>
                  <div className={`${styles.change} ${styles[stat.trend]}`}>
                    <i className={`fas fa-arrow-${stat.trend}`}></i> {stat.change}% so với tháng trước
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.dashboardGrid}>
              <div className={styles.leftColumn}>
                <div className={styles.recentOrders}>
                  <div className={styles.sectionHeader}>
                    <h2>Đơn hàng gần đây</h2>
                    <a href="/admin/product">Xem tất cả</a>
                  </div>
                  <div className={styles.tableContainer}>
                    <table className={styles.table}>
                      <thead>
                        <tr className={styles.tableHeader}>
                          <th>Mã đơn</th>
                          <th>Khách hàng</th>
                          <th>Tổng tiền</th>
                          <th>Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr key={order._id} className={styles.tableRow}>
                            <td>{order._id.slice(-6)}</td>
                            <td>{order.fullName}</td>
                            <td>{formatCurrency(order.grandTotal)}</td>
                            <td>
                              <span className={`${styles.status} ${styles[order.status === 'Chờ xử lý' ? 'pending' : 'completed']}`}>
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className={styles.chartContainer}>
                  <Line data={chartData} options={chartOptions} />
                </div>
              </div>

              <div className={styles.rightColumn}>
                <div className={styles.quickStats}>
                  <div className={styles.sectionHeader}>
                    <h2>Thống kê nhanh</h2>
                  </div>
                  <div className={styles.statsGridSmall}>
                    {[
                      { icon: 'eye', value: '1.2K', label: 'Lượt xem' },
                      { icon: 'comment', value: '56', label: 'Đánh giá' },
                      { icon: 'heart', value: '324', label: 'Yêu thích' },
                      { icon: 'share-alt', value: '78', label: 'Chia sẻ' }
                    ].map((stat, index) => (
                      <div key={index} className={styles.statItem}>
                        <i className={`fas fa-${stat.icon}`}></i>
                        <div className={styles.statValue}>{stat.value}</div>
                        <div className={styles.statLabel}>{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;