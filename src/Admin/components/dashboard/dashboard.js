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
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Doanh thu',
        data: [],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.3
      }
    ]
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timePeriod, setTimePeriod] = useState('month'); // Default to month

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

        // Filter delivered orders only
        const deliveredOrders = ordersResponse.data.filter(order => order.status === 'Đã giao');

        // Set recent delivered orders (limit to 5, sorted by createdAt descending)
        const sortedOrders = deliveredOrders
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);
        setOrders(sortedOrders);

        // Calculate total revenue from delivered orders only
        const totalRevenue = deliveredOrders.reduce((sum, order) => sum + (order.grandTotal || 0), 0) / 1000000; // Convert to millions

        // Aggregate revenue based on selected time period
        const today = new Date();
        const labels = [];
        const revenueData = [];

        if (timePeriod === 'week') {
          // Last 6 weeks
          for (let i = 0; i < 6; i++) {
            const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i * 7);
            const weekEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (i - 1) * 7);
            labels.unshift(`Tuần ${weekStart.getDate()}/${weekStart.getMonth() + 1}`);
            const weekRevenue = deliveredOrders
              .filter(order => {
                const orderDate = new Date(order.createdAt);
                return orderDate >= weekStart && orderDate < weekEnd;
              })
              .reduce((sum, order) => sum + (order.grandTotal || 0), 0) / 1000000; // Convert to millions
            revenueData.unshift(weekRevenue.toFixed(2));
          }
        } else if (timePeriod === 'month') {
          // Last 6 months
          for (let i = 0; i < 6; i++) {
            const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
            labels.unshift(`Tháng ${monthDate.getMonth() + 1}`);
            const monthRevenue = deliveredOrders
              .filter(order => {
                const orderDate = new Date(order.createdAt);
                return orderDate.getFullYear() === monthDate.getFullYear() && orderDate.getMonth() === monthDate.getMonth();
              })
              .reduce((sum, order) => sum + (order.grandTotal || 0), 0) / 1000000; // Convert to millions
            revenueData.unshift(monthRevenue.toFixed(2));
          }
        } else if (timePeriod === 'year') {
          // Last 6 years
          for (let i = 0; i < 6; i++) {
            const year = today.getFullYear() - i;
            labels.unshift(`Năm ${year}`);
            const yearRevenue = deliveredOrders
              .filter(order => {
                const orderDate = new Date(order.createdAt);
                return orderDate.getFullYear() === year;
              })
              .reduce((sum, order) => sum + (order.grandTotal || 0), 0) / 1000000; // Convert to millions
            revenueData.unshift(yearRevenue.toFixed(2));
          }
        }

        // Update chart data with fallback for empty data
        setChartData({
          labels: labels.length ? labels : ['Không có dữ liệu'],
          datasets: [
            {
              label: 'Doanh thu',
              data: revenueData.length ? revenueData : [0],
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              tension: 0.3
            }
          ]
        });

        // Update stats with API data
        const newStats = [
          { value: productsResponse.data.length || 0, change: 12, trend: 'up', label: 'Tổng sản phẩm', suffix: '' },
          { value: deliveredOrders.length || 0, change: 5, trend: 'up', label: 'Đơn hàng đã giao', suffix: '' },
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
  }, [timePeriod]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2, // Adjust aspect ratio for better responsiveness
    plugins: {
      legend: { position: 'bottom' },
      title: {
        display: true,
        text: `Báo cáo doanh thu theo ${timePeriod === 'week' ? 'tuần' : timePeriod === 'month' ? 'tháng' : 'năm'}`,
        font: { size: 16 }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Triệu đồng' }
      },
      x: {
        title: { display: true, text: timePeriod === 'week' ? 'Tuần' : timePeriod === 'month' ? 'Tháng' : 'Năm' }
      }
    }
  };

  const handleTimePeriodChange = (e) => {
    setTimePeriod(e.target.value);
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
                    <h2>Đơn hàng đã giao gần đây</h2>
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
                              <span className={`${styles.status} ${styles.completed}`}>
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
                  <div className={styles.chartHeader}>
                    <select value={timePeriod} onChange={handleTimePeriodChange} className={styles.timePeriodSelect}>
                      <option value="week">Theo tuần</option>
                      <option value="month">Theo tháng</option>
                      <option value="year">Theo năm</option>
                    </select>
                  </div>
                  <Line data={chartData} options={chartOptions} />
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