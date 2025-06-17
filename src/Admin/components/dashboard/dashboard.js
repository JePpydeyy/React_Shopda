import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

import styles from './dashboard.module.css';

// Hàm ánh xạ trạng thái từ tiếng Anh sang tiếng Việt và gán class CSS
const getStatusInfo = (status) => {
  switch (status) {
    case 'pending':
      return { text: 'Đang chờ xét duyệt', class: styles.statusDangChoXetDuyet };
    case 'interview':
      return { text: 'Đã phỏng vấn', class: styles.statusDaPhongVan };
    case 'accepted':
      return { text: 'Đã tuyển dụng', class: styles.statusDaTuyenDung };
    case 'rejected':
      return { text: 'Đã từ chối', class: styles.statusTuChoi };
    case 'Đang chờ xét duyệt':
      return { text: status, class: styles.statusDangChoXetDuyet };
    case 'Đã phỏng vấn':
      return { text: status, class: styles.statusDaPhongVan };
    case 'Đã tuyển dụng':
      return { text: status, class: styles.statusDaTuyenDung };
    case 'Đã từ chối':
      return { text: status, class: styles.statusTuChoi };
    default:
      return { text: status || 'Không xác định', class: '' };
  }
};

// Hàm chuyển đổi chuỗi ngày thành đối tượng Date
const parseDate = (dateStr) => {
  if (!dateStr) return null;
  // Thử parse định dạng ISO (YYYY-MM-DDTHH:mm:ssZ)
  const isoDate = new Date(dateStr);
  if (!isNaN(isoDate.getTime())) return isoDate;
  // Thử parse định dạng DD/MM/YYYY
  const [day, month, year] = dateStr.split('/');
  if (!day || !month || !year) return null;
  const customDate = new Date(`${year}-${month}-${day}`);
  return isNaN(customDate.getTime()) ? null : customDate;
};

// Component cho biểu đồ cột (Column Chart)
const ColumnChart = ({ allProfiles }) => {
  const [chartError, setChartError] = useState(null);
  const [chartInstance, setChartInstance] = useState(null);
  const [tooltipData, setTooltipData] = useState(null);

  useEffect(() => {
    const loadGoogleCharts = () => {
      if (window.google && window.google.charts) {
        drawChart();
      } else {
        const script = document.createElement('script');
        script.src = 'https://www.gstatic.com/charts/loader.js';
        script.onload = () => {
          window.google.charts.load('current', { packages: ['corechart'] });
          window.google.charts.setOnLoadCallback(drawChart);
        };
        script.onerror = () => setChartError('Không thể tải Google Charts');
        document.body.appendChild(script);
      }
    };

    const drawChart = () => {
      try {
        const data = new window.google.visualization.DataTable();
        data.addColumn('string', 'Ngày');
        data.addColumn('number', 'Số lượng');

        const totalProfiles = allProfiles.length;
        if (totalProfiles === 0) {
          setChartError('Không có dữ liệu hồ sơ để hiển thị biểu đồ.');
          return;
        }

        const now = new Date();
        const currentWeekStart = new Date(now);
        currentWeekStart.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));

        const profilesInCurrentWeek = allProfiles.filter(profile => {
          const profileDate = new Date(profile.appliedAt);
          if (isNaN(profileDate.getTime())) return false;
          const profileWeekStart = new Date(profileDate);
          profileWeekStart.setDate(profileDate.getDate() - profileDate.getDay() + (profileDate.getDay() === 0 ? -6 : 1));
          return profileWeekStart.toDateString() === currentWeekStart.toDateString();
        });

        const profilesByDay = profilesInCurrentWeek.reduce((acc, profile) => {
          const date = new Date(profile.appliedAt);
          if (isNaN(date.getTime())) return acc;

          const dayOfWeek = date.getDay();
          let dayName;
          switch (dayOfWeek) {
            case 0: dayName = 'Chủ Nhật'; break;
            case 1: dayName = 'Thứ Hai'; break;
            case 2: dayName = 'Thứ Ba'; break;
            case 3: dayName = 'Thứ Tư'; break;
            case 4: dayName = 'Thứ Năm'; break;
            case 5: dayName = 'Thứ Sáu'; break;
            case 6: dayName = 'Thứ Bảy'; break;
            default: dayName = ''; break;
          }
          acc[dayName] = (acc[dayName] || 0) + 1;
          return acc;
        }, {});

        const daysOfWeek = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];
        const chartData = daysOfWeek.map(day => {
          const count = profilesByDay[day] || 0;
          return [day, count];
        });

        data.addRows(chartData);

        const options = {
          title: `Số lượng hồ sơ ứng tuyển theo ngày trong tuần (Tuần bắt đầu ${currentWeekStart.toLocaleDateString('vi-VN')})`,
          colors: ['#4A90E2'],
          chartArea: { width: '80%', height: '70%' },
          legend: { position: 'none' },
          vAxis: { 
            title: 'Số lượng',
            minValue: 0,
            format: '0',
            gridlines: { count: 6 },
            scaleType: 'linear',
            textPosition: 'out'
          },
          hAxis: { 
            title: 'Ngày trong tuần',
            textStyle: { fontSize: 12 },
            slantedText: false
          },
          bar: { groupWidth: '20%' },
          tooltip: { trigger: 'none' },
          animation: {
            startup: true,
            duration: 500,
            easing: 'out'
          }
        };

        const chartElement = document.getElementById('columnchart');
        if (!chartElement) {
          setChartError('Không tìm thấy phần tử để hiển thị biểu đồ cột');
          return;
        }

        if (chartInstance) {
          chartInstance.clearChart();
        }

        const chart = new window.google.visualization.ColumnChart(chartElement);
        chart.draw(data, options);
        setChartInstance(chart);

        window.google.visualization.events.addListener(chart, 'onmouseover', (event) => {
          if (event.row !== null) {
            const day = data.getValue(event.row, 0);
            const count = data.getValue(event.row, 1);
            setTooltipData({ day, count });
          }
        });

        window.google.visualization.events.addListener(chart, 'onmouseout', () => {
          setTooltipData(null);
        });
      } catch (err) {
        setChartError(`Lỗi khi vẽ biểu đồ cột: ${err.message}`);
      }
    };

    if (allProfiles.length > 0) {
      loadGoogleCharts();
    }

    return () => {
      if (chartInstance) {
        chartInstance.clearChart();
      }
      setTooltipData(null);
    };
  }, [allProfiles]);

  return (
    <div className={styles.chartWrapper}>
      <div className={styles.chartContainer}>
        {chartError ? (
          <div style={{ color: 'red', marginTop: '20px' }}>{chartError}</div>
        ) : (
          <div id="columnchart" style={{ width: '100%', height: '400px', marginTop: '20px' }}></div>
        )}
      </div>
      {tooltipData && (
        <div className={styles.customTooltip}>
          <strong>{tooltipData.day}</strong>: {tooltipData.count} hồ sơ
        </div>
      )}
    </div>
  );
};

// Component cho biểu đồ tròn (Pie Chart)
const StatusChart = ({ allProfiles }) => {
  const [chartError, setChartError] = useState(null);
  const [chartInstance, setChartInstance] = useState(null);
  const [tooltipData, setTooltipData] = useState(null);

  useEffect(() => {
    const loadGoogleCharts = () => {
      if (window.google && window.google.charts) {
        drawChart();
      } else {
        const script = document.createElement('script');
        script.src = 'https://www.gstatic.com/charts/loader.js';
        script.onload = () => {
          window.google.charts.load('current', { packages: ['corechart'] });
          window.google.charts.setOnLoadCallback(drawChart);
        };
        script.onerror = () => setChartError('Không thể tải Google Charts');
        document.body.appendChild(script);
      }
    };

    const drawChart = () => {
      try {
        const data = new window.google.visualization.DataTable();
        data.addColumn('string', 'Trạng Thái');
        data.addColumn('number', 'Số Lượng');

        const statusCounts = {
          'Đang chờ xét duyệt': 0,
          'Đã phỏng vấn': 0,
          'Đã tuyển dụng': 0,
          'Đã từ chối': 0,
        };

        allProfiles.forEach(profile => {
          const status = getStatusInfo(profile.status).text;
          if (statusCounts[status] !== undefined) {
            statusCounts[status] = (statusCounts[status] || 0) + 1;
          }
        });

        const chartData = Object.entries(statusCounts)
          .filter(([_, value]) => value > 0)
          .map(([key, value]) => [key, value]);

        if (chartData.length === 0) {
          setChartError('Không có dữ liệu trạng thái để hiển thị biểu đồ.');
          return;
        }

        data.addRows(chartData);

        const options = {
          title: 'Thống kê trạng thái hồ sơ',
          pieHole: 0,
          colors: ['#4A90E2', '#F5A623', '#50C878', '#E94E77'],
          chartArea: { 
            width: '70%',
            height: '60%',
            top: 40,
            left: 0,
            right: 0
          },
          legend: { position: 'bottom' },
          tooltip: { trigger: 'none' },
          animation: {
            startup: true,
            duration: 500,
            easing: 'out'
          },
          titleTextStyle: {
            color: '#333',
            fontSize: 16,
            bold: true,
            italic: false,
            align: 'center'
          }
        };

        const chartElement = document.getElementById('piechart');
        if (!chartElement) {
          setChartError('Không tìm thấy phần tử để hiển thị biểu đồ');
          return;
        }

        if (chartInstance) {
          chartInstance.clearChart();
        }

        const chart = new window.google.visualization.PieChart(chartElement);
        chart.draw(data, options);
        setChartInstance(chart);

        window.google.visualization.events.addListener(chart, 'onmouseover', (event) => {
          if (event.row !== null) {
            const status = data.getValue(event.row, 0);
            const count = data.getValue(event.row, 1);
            setTooltipData({ status, count });
          }
        });

        window.google.visualization.events.addListener(chart, 'onmouseout', () => {
          setTooltipData(null);
        });
      } catch (err) {
        setChartError(`Lỗi khi vẽ biểu đồ: ${err.message}`);
      }
    };

    if (allProfiles.length > 0) {
      loadGoogleCharts();
    }

    return () => {
      if (chartInstance) {
        chartInstance.clearChart();
      }
      setTooltipData(null);
    };
  }, [allProfiles]);

  return (
    <div className={styles.chartWrapper}>
      <div className={styles.chartContainer}>
        {chartError ? (
          <div style={{ color: 'red', marginTop: '20px' }}>{chartError}</div>
        ) : (
          <div id="piechart" style={{ width: '100%', height: '400px', marginTop: '20px' }}></div>
        )}
      </div>
      {tooltipData && (
        <div className={styles.customTooltip}>
          <strong>{tooltipData.status}</strong>: {tooltipData.count} hồ sơ
        </div>
      )}
    </div>
  );
};

const MainContent = () => {
  const [allProfiles, setAllProfiles] = useState([]);
  const [displayProfiles, setDisplayProfiles] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const memoizedProfiles = useMemo(() => allProfiles, [allProfiles]);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const decodedToken = jwtDecode(token);
      if (decodedToken.role !== 'admin' || decodedToken.exp * 1000 < Date.now()) {
        navigate('/login');
        return;
      }
    } catch (err) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const headers = {
          'Authorization': `Bearer ${token}`,
        };

        const profileResponse = await fetch(`${process.env.REACT_APP_API_URL}/profile`, { headers });
        if (!profileResponse.ok) {
          throw new Error(`Lỗi API: ${profileResponse.status} - ${await profileResponse.text()}`);
        }
        const profileData = await profileResponse.json();
        console.log('Profile Data:', profileData); // Kiểm tra định dạng appliedAt

        // Lọc và sắp xếp hồ sơ
        const validProfiles = profileData.filter(profile => {
          const date = new Date(profile.appliedAt); // Thử parse trực tiếp
          return !isNaN(date.getTime()); // Chỉ giữ các hồ sơ có ngày hợp lệ
        });

        setAllProfiles(validProfiles);

        // Sắp xếp theo ngày và giờ mới nhất, lấy 5 hồ sơ đầu
        const sortedProfiles = [...validProfiles]
          .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt)) // Sử dụng Date trực tiếp
          .slice(0, 5);

        setDisplayProfiles(sortedProfiles);

        const jobResponse = await fetch(`${process.env.REACT_APP_API_URL}/job`, { headers });
        if (!jobResponse.ok) {
          throw new Error(`Lỗi API: ${jobResponse.status} - ${await jobResponse.text()}`);
        }
        const jobData = await jobResponse.json();
        setAllJobs(jobData);

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  if (loading) return <div className={styles.mainContent}>Đang tải...</div>;
  if (error) return <div className={styles.mainContent}>Lỗi: {error}</div>;

  return (
    <div className={styles.mainContent}>
      <h1 className={styles.heading}>Chào mừng quản trị viên<br /></h1>
      <div className={styles.metrics}>
        <div className={styles.card}>
          <h3>Tổng bài đăng tin tức <i className="fa-solid fa-newspaper"></i></h3>
          <div className={styles.value}>{allJobs.length}</div>
        </div>
        <div className={styles.card}>
          <h3>Tổng hồ sơ ứng tuyển <i className="fa-solid fa-file-pen" style={{ color: '#FFFF00' }}></i></h3>
          <div className={styles.value}>{allProfiles.length}</div>
        </div>
        <div className={styles.card}>
          <h3>Tổng hồ sơ đã tuyển dụng <i className="fa-regular fa-paste" style={{ color: '#008000' }}></i></h3>
          <div className={styles.value}>
            {allProfiles.filter(p => getStatusInfo(p.status).text === 'Đã tuyển dụng').length}
          </div>
        </div>
        <div className={styles.card}>
          <h3>Tổng hồ sơ đang chờ xét duyệt <i className="fa-solid fa-clock" style={{ color: '#3895ff' }}></i></h3>
          <div className={styles.value}>
            {allProfiles.filter(p => getStatusInfo(p.status).text === 'Đang chờ xét duyệt').length}
          </div>
        </div>
        <div className={styles.card}>
          <h3>Tổng hồ sơ đã phỏng vấn <i className="fa-solid fa-user-check" style={{ color: '#FFA500' }}></i></h3>
          <div className={styles.value}>
            {allProfiles.filter(p => getStatusInfo(p.status).text === 'Đã phỏng vấn').length}
          </div>
        </div>
        <div className={styles.card}>
          <h3>Tổng hồ sơ đã từ chối <i className="fa-solid fa-ban" style={{ color: '#FF0000' }}></i></h3>
          <div className={styles.value}>
            {allProfiles.filter(p => getStatusInfo(p.status).text === 'Đã từ chối').length}
          </div>
        </div>
      </div>
      <div className={styles.recentOrders}>
        <h3>Hồ sơ ứng tuyển gần đây</h3>
        {displayProfiles.length === 0 ? (
          <p>Không có hồ sơ nào để hiển thị.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Họ Và Tên</th>
                <th>Email</th>
                <th>Số Điện Thoại</th>
                <th>Vị Trí Ứng Tuyển</th>
                <th>Ngày Nộp</th>
                <th>Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              {displayProfiles.map((profile, index) => {
                const statusInfo = getStatusInfo(profile.status);
                return (
                  <tr key={profile._id}>
                    <td>{index + 1}</td>
                    <td>{profile.form?.fullName || 'Không có dữ liệu'}</td>
                    <td>{profile.form?.email || 'Không có dữ liệu'}</td>
                    <td>{profile.form?.phone || 'Không có dữ liệu'}</td>
                    <td>{profile.jobName || 'Không có dữ liệu'}</td>
                    <td>
                      {profile.appliedAt
                        ? new Date(profile.appliedAt).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })
                        : 'Không có dữ liệu'}
                    </td>
                    <td>
                      <span className={`${styles.status} ${statusInfo.class}`}>
                        {statusInfo.text}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
          <div style={{ width: '48%' }}>
            <ColumnChart allProfiles={memoizedProfiles} />
          </div>
          <div style={{ width: '48%' }}>
            <StatusChart allProfiles={memoizedProfiles} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainContent;