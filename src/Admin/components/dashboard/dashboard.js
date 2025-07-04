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
  const [timePeriod, setTimePeriod] = useState('week'); // Default to week

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
        const totalRevenue = deliveredOrders.reduce((sum, order) => sum + (order.grandTotal || 0), 0);

        // Aggregate revenue based on selected time period
        const today = new Date();
        const labels = [];
        const revenueData = [];

        if (timePeriod === 'week') {
          // Week starts from Monday
          const daysOfWeek = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
          const currentDayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
          const daysSinceMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1; // Days since last Monday
          const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - daysSinceMonday);

          // Loop through all 7 days from Monday to Sunday
          for (let i = 0; i < 7; i++) {
            const day = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
            const dayIndex = day.getDay(); // Get day of the week (0 = Sunday, 1 = Monday, ...)
            labels.push(daysOfWeek[dayIndex === 0 ? 6 : dayIndex - 1]); // Adjust for Monday-first order
            const dayRevenue = deliveredOrders
              .filter(order => {
                const orderDate = new Date(order.createdAt);
                return (
                  orderDate.getFullYear() === day.getFullYear() &&
                  orderDate.getMonth() === day.getMonth() &&
                  orderDate.getDate() === day.getDate()
                );
              })
              .reduce((sum, order) => sum + (order.grandTotal || 0), 0);
            revenueData.push(dayRevenue.toFixed(0));
          }
        } else if (timePeriod === 'month') {
          // Daily revenue for the current month
          const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate(); // Get number of days in current month
          for (let i = 1; i <= daysInMonth; i++) {
            const day = new Date(today.getFullYear(), today.getMonth(), i);
            labels.push(`${i}/${day.getMonth() + 1}`);
            const dayRevenue = deliveredOrders
              .filter(order => {
                const orderDate = new Date(order.createdAt);
                return (
                  orderDate.getFullYear() === day.getFullYear() &&
                  orderDate.getMonth() === day.getMonth() &&
                  orderDate.getDate() === i
                );
              })
              .reduce((sum, order) => sum + (order.grandTotal || 0), 0);
            revenueData.push(dayRevenue.toFixed(0));
          }
        } else if (timePeriod === 'year') {
          // Monthly revenue for the current year
          const monthsOfYear = [
            'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
            'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
          ];
          for (let i = 0; i < 12; i++) {
            const monthStart = new Date(today.getFullYear(), i, 1);
            labels.push(monthsOfYear[i]);
            const monthRevenue = deliveredOrders
              .filter(order => {
                const orderDate = new Date(order.createdAt);
                return (
                  orderDate.getFullYear() === today.getFullYear() &&
                  orderDate.getMonth() === i
                );
              })
              .reduce((sum, order) => sum + (order.grandTotal || 0), 0);
            revenueData.push(monthRevenue.toFixed(0));
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
          { value: formatCurrency(totalRevenue), change: 18, trend: 'up', label: 'Doanh thu', suffix: '' },
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
    aspectRatio: 2,
    plugins: {
      legend: { position: 'bottom' },
      title: {
        display: true,
        text: `Báo cáo doanh thu theo ${timePeriod === 'week' ? 'ngày trong tuần' : timePeriod === 'month' ? 'ngày trong tháng' : 'tháng trong năm'}`,
        font: { size: 16 }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'VND' },
        ticks: {
          callback: function (value) {
            return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
          }
        }
      },
      x: {
        title: { display: true, text: timePeriod === 'week' ? 'Ngày trong tuần' : timePeriod === 'month' ? 'Ngày' : 'Tháng' },
        ticks: {
          maxTicksLimit: timePeriod === 'month' ? 15 : 12
        }
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
                    <a href="/admin/order">Xem tất cả</a>
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