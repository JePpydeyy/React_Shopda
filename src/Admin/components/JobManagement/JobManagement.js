import React, { useState, useEffect } from 'react';
import { debounce } from 'lodash';
import styles from './JobManagement.module.css';

const JobManagement = () => {
  const API_JOBS_URL = `${process.env.REACT_APP_API_URL}/job`;
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    JobType: '',
    Name: '',
    Brands: '',
    Position: '',
    Workplace: '',
    Salary: '',
    Slot: '',
    'Post-date': new Date().toISOString().split('T')[0],
    'Due date': '',
    'Job Description': [''],
    'Work Experience': '',
    Welfare: [''],
    status: 'show',
    Degree: '',
    'Job Requirements': [''],
  });

  const [formErrors, setFormErrors] = useState({});
  const [token, setToken] = useState(localStorage.getItem('adminToken') || '');

  const statusDisplayMap = {
    show: 'Đang tuyển',
    hidden: 'Tạm dừng',
  };

  const showNotification = (message, type = 'success') => {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`; // Sử dụng class CSS động
    notification.textContent = message;
    document.body.appendChild(notification);

    // Tự động xóa sau 3 giây với hiệu ứng mờ dần
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 500); // Đợi hiệu ứng mờ dần hoàn tất
    }, 3000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    if (dateString.includes('/')) return dateString;
    const date = new Date(dateString);
    if (isNaN(date)) return '';
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '/');
  };

  const toBackendDate = (dateString) => {
    if (!dateString) return '';
    const [y, m, d] = dateString.split('-');
    return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
  };

  const toFormDate = (dateString) => {
    if (!dateString) return '';
    if (dateString.includes('/')) {
      const [d, m, y] = dateString.split('/');
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
    return dateString;
  };

  const fetchJobs = async () => {
    if (!token) return [];
    setIsLoading(true);
    try {
      const response = await fetch(`${API_JOBS_URL}?status=all`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const data = await response.json();
      const jobsData = data.map(job => ({
        id: job._id,
        title: String(job.Name || ''),
        brand: String(job.Brands || ''),
        jobType: job.JobType,
        salary: job.Salary,
        location: String(job.Workplace || ''),
        deadline: formatDate(job['Due date']),
        status: statusDisplayMap[job.status] || job.status,
        description: Array.isArray(job['Job Description']) ? job['Job Description'] : [''],
        workExperience: job['Work Experience'],
        benefits: Array.isArray(job.Welfare) ? job.Welfare : [''],
        slot: job.Slot,
        postDate: job['Post-date'], // Giữ nguyên giá trị gốc để sắp xếp
        degree: job.Degree,
        requirements: Array.isArray(job['Job Requirements']) ? job['Job Requirements'] : [''],
        position: job.Position,
      }));
      // Sắp xếp theo postDate từ mới nhất đến cũ nhất
      return jobsData.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));
    } catch (error) {
      console.error('Lỗi khi lấy danh sách công việc:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const displayJobs = async (page = 1, jobsToShow = null) => {
    const data = jobsToShow || (await fetchJobs());
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, data.length);
    // Định dạng lại postDate để hiển thị
    const formattedData = data.map(job => ({
      ...job,
      postDate: formatDate(job.postDate),
    }));
    setJobs(formattedData);
    setFilteredJobs(formattedData.slice(startIndex, endIndex));
    setTotalPages(Math.ceil(formattedData.length / itemsPerPage));
    setCurrentPage(page);
  };

  const handlePageChange = (page) => displayJobs(page, jobs);

  const handleViewJob = async (jobId) => {
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_JOBS_URL}/${jobId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const job = await response.json();
      setSelectedJob({
        id: job._id,
        title: String(job.Name || ''),
        brand: String(job.Brands || ''),
        jobType: job.JobType,
        salary: job.Salary,
        location: String(job.Workplace || ''),
        deadline: formatDate(job['Due date']),
        status: statusDisplayMap[job.status] || job.status,
        description: Array.isArray(job['Job Description']) ? job['Job Description'] : [''],
        workExperience: job['Work Experience'],
        benefits: Array.isArray(job.Welfare) ? job.Welfare : [''],
        slot: job.Slot,
        postDate: formatDate(job['Post-date']),
        degree: job.Degree,
        requirements: Array.isArray(job['Job Requirements']) ? job['Job Requirements'] : [''],
        position: job.Position,
      });
    } catch (error) {
      console.error('Lỗi khi xem chi tiết công việc:', error);
      showNotification('Có lỗi xảy ra khi xem chi tiết công việc.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setModalMode('add');
    setFormData({
      JobType: '',
      Name: '',
      Brands: '',
      Position: '',
      Workplace: '',
      Salary: '',
      Slot: '',
      'Post-date': new Date().toISOString().split('T')[0],
      'Due date': '',
      'Job Description': [''],
      'Work Experience': '',
      Welfare: [''],
      status: 'show',
      Degree: '',
      'Job Requirements': [''],
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleOpenEditModal = (jobId) => {
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      const reverseStatusMap = { 'Đang tuyển': 'show', 'Tạm dừng': 'hidden' };
      setModalMode('edit');
      setFormData({
        _id: job.id,
        JobType: job.jobType || '',
        Name: job.title || '',
        Brands: job.brand || '',
        Position: job.position || '',
        Workplace: job.location || '',
        Salary: job.salary || '',
        Slot: job.slot || '',
        'Post-date': toFormDate(job.postDate) || '',
        'Due date': toFormDate(job.deadline) || '',
        'Job Description': job.description.length > 0 ? job.description : [''],
        'Work Experience': job.workExperience || '',
        Welfare: job.benefits.length > 0 ? job.benefits : [''],
        status: reverseStatusMap[job.status] || job.status || 'show',
        Degree: job.degree || '',
        'Job Requirements': job.requirements.length > 0 ? job.requirements : [''],
      });
      setFormErrors({});
      setShowModal(true);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!token) return;
    if (window.confirm('Bạn có chắc chắn muốn tạm dừng công việc này?')) {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_JOBS_URL}/${jobId}/toggle-visibility`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: 'hidden' }),
        });
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        await displayJobs(currentPage);
        window.location.reload();
      } catch (error) {
        console.error('Lỗi khi tạm dừng công việc:', error);
        showNotification('Có lỗi xảy ra khi tạm dừng công việc.', 'error');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleToggleVisibility = async (jobId) => {
    await displayJobs(1);
      showNotification('Đổi trạng thái thành công!', 'success');
      setShowModal(false);
    if (!token) return;
    setIsLoading(true);
    try {
      const jobResponse = await fetch(`${API_JOBS_URL}/${jobId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!jobResponse.ok) throw new Error(`Không thể lấy thông tin công việc: HTTP error ${jobResponse.status}`);
      const job = await jobResponse.json();
      const newStatus = job.status === 'show' ? 'hidden' : 'show';

      const response = await fetch(`${API_JOBS_URL}/${jobId}/toggle-visibility`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Không thể thay đổi trạng thái: HTTP error ${response.status} - ${JSON.stringify(errorData)}`);
      }

      await displayJobs(currentPage);
      setSelectedJob(null);
    } catch (error) {
      console.error('Lỗi khi thay đổi trạng thái:', error.message);
      showNotification(`Có lỗi xảy ra khi thay đổi trạng thái công việc: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'Slot') {
      setFormData(prev => ({ ...prev, [name]: value ? parseInt(value) : '' }));
    } else if (name === 'Job Description' || name === 'Job Requirements' || name === 'Welfare') {
      const newValue = value.split('\n').filter(item => item.trim() !== '');
      setFormData(prev => ({
        ...prev,
        [name]: newValue.length > 0 ? newValue : [''],
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleTextareaKeyDown = (e, fieldName) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setFormData(prev => ({
        ...prev,
        [fieldName]: [...prev[fieldName], ''],
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.JobType?.trim()) errors.JobType = 'Loại công việc là bắt buộc';
    if (!formData.Name?.trim()) errors.Name = 'Tên công việc là bắt buộc';
    if (!formData.Position?.trim()) errors.Position = 'Vị trí là bắt buộc';
    if (!formData.Workplace?.trim()) errors.Workplace = 'Địa điểm là bắt buộc';
    if (!formData.Salary?.trim()) errors.Salary = 'Mức lương là bắt buộc';
    if (!formData.Slot || formData.Slot <= 0) errors.Slot = 'Số lượng tuyển phải lớn hơn 0';
    if (!formData['Post-date']) errors['Post-date'] = 'Ngày đăng là bắt buộc';
    if (!formData['Due date']) errors['Due date'] = 'Hạn nộp là bắt buộc';
    if (!formData.Degree?.trim()) errors.Degree = 'Trình độ là bắt buộc';
    if (!formData['Work Experience']?.trim()) errors['Work Experience'] = 'Kinh nghiệm làm việc là bắt buộc';
    if (!formData['Job Requirements']?.length || formData['Job Requirements'][0] === '') errors['Job Requirements'] = 'Yêu cầu công việc là bắt buộc';
    if (!formData.Welfare?.length || formData.Welfare[0] === '') errors.Welfare = 'Quyền lợi là bắt buộc';

    if (formData['Post-date'] && formData['Due date']) {
      const postDateObj = new Date(formData['Post-date']);
      const dueDateObj = new Date(formData['Due date']);
      if (isNaN(postDateObj.getTime()) || isNaN(dueDateObj.getTime())) {
        errors['Post-date'] = errors['Post-date'] || 'Ngày đăng không hợp lệ';
        errors['Due date'] = errors['Due date'] || 'Hạn nộp không hợp lệ';
      } else if (dueDateObj <= postDateObj) {
        errors['Due date'] = 'Hạn nộp phải sau ngày đăng';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const payload = {
        JobType: formData.JobType,
        Name: formData.Name,
        Brands: formData.Brands,
        Position: formData.Position,
        Workplace: formData.Workplace,
        Salary: formData.Salary,
        Slot: parseInt(formData.Slot),
        'Post-date': toBackendDate(formData['Post-date']),
        'Due date': toBackendDate(formData['Due date']),
        Degree: formData.Degree,
        'Work Experience': formData['Work Experience'],
        'Job Description': formData['Job Description'].filter(item => item.trim() !== ''),
        'Job Requirements': formData['Job Requirements'].filter(item => item.trim() !== ''),
        Welfare: formData.Welfare.filter(item => item.trim() !== ''),
        status: formData.status,
      };

      const url = modalMode === 'add' ? API_JOBS_URL : `${API_JOBS_URL}/${formData._id}`;
      const method = modalMode === 'add' ? 'POST' : 'PUT';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error ${response.status}: ${JSON.stringify(errorData)}`);
      }

      await displayJobs(1);
      showNotification('Lưu công việc thành công!', 'success');
      setShowModal(false);
      setFormData({
        JobType: '',
        Name: '',
        Brands: '',
        Position: '',
        Workplace: '',
        Salary: '',
        Slot: '',
        'Post-date': new Date().toISOString().split('T')[0],
        'Due date': '',
        'Job Description': [''],
        'Work Experience': '',
        Welfare: [''],
        status: 'show',
        Degree: '',
        'Job Requirements': [''],
      });
      setFormErrors({});
    } catch (error) {
      console.error('Lỗi khi lưu công việc:', error.message);
      showNotification(`Có lỗi xảy ra khi lưu công việc: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyFilters = () => {
    const search = document.querySelector('.search-bar')?.value.trim().toLowerCase();
    const status = document.getElementById('statusFilter').value;
    const jobType = document.getElementById('levelFilter').value;
    let filtered = jobs;

    if (search) {
      filtered = filtered.filter(
        j =>
          (String(j.title || '').toLowerCase().includes(search)) ||
          (String(j.brand || '').toLowerCase().includes(search)) ||
          (String(j.location || '').toLowerCase().includes(search))
      );
    }
    if (status) filtered = filtered.filter(j => j.status === status);
    if (jobType) filtered = filtered.filter(j => String(j.jobType || '').toLowerCase() === jobType.toLowerCase());

    setFilteredJobs(filtered.slice(0, itemsPerPage));
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setCurrentPage(1);
  };

  const debouncedSearch = debounce(() => handleApplyFilters(), 300);
  const handleSearchChange = () => debouncedSearch();
  const handleResetFilters = () => {
    document.querySelector('.search-bar').value = '';
    document.getElementById('statusFilter').value = '';
    document.getElementById('levelFilter').value = '';
    displayJobs(1);
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('adminToken');
    setToken(storedToken || '');
    if (storedToken) {
      displayJobs();
    } else {
      setJobs([]);
      setFilteredJobs([]);
    }
  }, []);

  const uniqueJobTypes = [...new Set(jobs.map(job => job.jobType))].filter(type => type);
  const uniqueStatuses = [...new Set(jobs.map(job => job.status))].filter(status => status);

  const getPaginationButtons = () => {
    const maxButtons = 5;
    const buttons = [];
    const startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    const endPage = Math.min(totalPages, startPage + maxButtons - 1);

    buttons.push(
      <button key="first" onClick={() => handlePageChange(1)} disabled={currentPage === 1}>
        <i className="fa-solid fa-angles-left"></i>
      </button>
    );
    buttons.push(
      <button key="prev" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
        <i className="fa-solid fa-angle-left"></i>
      </button>
    );
    if (startPage > 1) buttons.push(<span key="start-ellipsis">...</span>);
    for (let page = startPage; page <= endPage; page++) {
      buttons.push(
        <button
          key={page}
          className={page === currentPage ? styles.active : ''}
          onClick={() => handlePageChange(page)}
        >
          {page}
        </button>
      );
    }
    if (endPage < totalPages) buttons.push(<span key="end-ellipsis">...</span>);
    buttons.push(
      <button key="next" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
        <i className="fa-solid fa-angle-right"></i>
      </button>
    );
    buttons.push(
      <button key="last" onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages}>
        <i className="fa-solid fa-angles-right"></i>
      </button>
    );
    return buttons;
  };

  return (
    <div className={styles.container}>
      {!token && <p>Vui lòng đăng nhập để quản lý công việc.</p>}
      <div className={styles.filters}>
        <input
          type="text"
          className={`${styles.searchBar} search-bar`}
          placeholder="Tìm kiếm công việc..."
          onChange={handleSearchChange}
          disabled={!token}
        />
        <select id="statusFilter" onChange={handleApplyFilters} disabled={!token}>
          <option value="">- Tất cả trạng thái -</option>
          {uniqueStatuses.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
        <select id="levelFilter" onChange={handleApplyFilters} disabled={!token}>
          <option value="">- Tất cả loại công việc -</option>
          {uniqueJobTypes.map(jobType => (
            <option key={jobType} value={jobType}>{jobType}</option>
          ))}
        </select>
        <button onClick={handleApplyFilters} disabled={!token}>
          <i className="fa-solid fa-filter"></i> Áp dụng
        </button>
        <button onClick={handleResetFilters} disabled={!token}>
          <i className="fa-solid fa-rotate"></i> Đặt lại
        </button>
        <button onClick={handleOpenAddModal} disabled={!token}>
          <i className="fa-solid fa-plus"></i> Thêm Công Việc
        </button>
      </div>

      <div className={styles.jobs}>
        <h3>Danh Sách Công Việc</h3>
        <table>
          <thead>
            <tr>
              <th scope="col">STT</th>
              <th scope="col">Tên Công Việc</th>
              <th scope="col">Thương Hiệu</th>
              <th scope="col">Loại Công Việc</th>
              <th scope="col">Mức Lương</th>
              <th scope="col">Địa Điểm</th>
              <th scope="col">Hạn Nộp</th>
              <th scope="col">Trạng Thái</th>
              <th scope="col">Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center' }}>Đang tải...</td>
              </tr>
            ) : filteredJobs.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center' }}>Không tìm thấy công việc nào</td>
              </tr>
            ) : (
              filteredJobs.map((job, index) => (
                <tr key={job.id}>
                  <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td>{job.title}</td>
                  <td>{job.brand}</td>
                  <td>{job.jobType}</td>
                  <td>{job.salary}</td>
                  <td>{job.location}</td>
                  <td>{job.deadline}</td>
                  <td>
                    <span
                      className={`${styles.status} ${job.status === 'Đang tuyển' ? styles.active : styles.inactive}`}
                    >
                      {job.status}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button className={styles.view} onClick={() => handleViewJob(job.id)} aria-label="Xem chi tiết">
                        <i className="fa-solid fa-eye"></i>
                      </button>
                      <button className={styles.edit} onClick={() => handleOpenEditModal(job.id)} aria-label="Chỉnh sửa">
                        <i className="fa-solid fa-edit"></i>
                      </button>
                      <button
                        className={styles.delete}
                        onClick={() => handleToggleVisibility(job.id)}
                        aria-label={job.status === 'Đang tuyển' ? 'Tạm dừng' : 'Kích hoạt'}
                      >
                        <i className={job.status === 'Đang tuyển' ? 'fa-solid fa-pause' : 'fa-solid fa-play'}></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className={styles.pagination}>{getPaginationButtons()}</div>
      </div>

      {selectedJob && (
        <div className={styles.modal} onClick={(e) => {
          if (e.target.className === styles.modal) {
            setSelectedJob(null);
          }
        }}>
          <div className={styles.modalContent}>
            <span className={styles.close} onClick={() => setSelectedJob(null)}>×</span>
            <h3>Chi Tiết Công Việc: {selectedJob.title}</h3>
            <div className={styles.jobDetails}>
              <div className={styles.detailRow}>
                <div className={styles.detailGroup}><label>ID:</label><p>{selectedJob.id}</p></div>
                <div className={styles.detailGroup}>
                  <label>Trạng thái:</label>
                  <p>
                    <span className={`${styles.status} ${selectedJob.status === 'Đang tuyển' ? styles.active : styles.inactive}`}>
                      {selectedJob.status}
                    </span>
                  </p>
                </div>
              </div>
              <div className={styles.detailRow}>
                <div className={styles.detailGroup}><label>Tên công việc:</label><p>{selectedJob.title}</p></div>
                <div className={styles.detailGroup}><label>Thương hiệu:</label><p>{selectedJob.brand}</p></div>
              </div>
              <div className={styles.detailRow}>
                <div className={styles.detailGroup}><label>Loại công việc:</label><p>{selectedJob.jobType}</p></div>
                <div className={styles.detailGroup}><label>Mức lương:</label><p>{selectedJob.salary}</p></div>
              </div>
              <div className={styles.detailRow}>
                <div className={styles.detailGroup}><label>Địa điểm:</label><p>{selectedJob.location}</p></div>
                <div className={styles.detailGroup}><label>Hạn nộp:</label><p>{selectedJob.deadline}</p></div>
              </div>
              <div className={styles.detailRow}>
                <div className={styles.detailGroup}><label>Ngày đăng:</label><p>{selectedJob.postDate}</p></div>
                <div className={styles.detailGroup}><label>Số lượng tuyển:</label><p>{selectedJob.slot}</p></div>
              </div>
              <div className={styles.detailRow}>
                <div className={styles.detailGroup}><label>Trình độ:</label><p>{selectedJob.degree}</p></div>
                <div className={styles.detailGroup}><label>Vị trí:</label><p>{selectedJob.position}</p></div>
              </div>
              <div className={`${styles.detailGroup} ${styles.full}`}>
                <label>Kinh nghiệm làm việc:</label>
                <p>{selectedJob.workExperience}</p>
              </div>
              <div className={`${styles.detailGroup} ${styles.full}`}>
                <label>Mô tả công việc:</label>
                <ul>
                  {selectedJob.description.map((desc, index) => (
                    <li key={index}>{desc}</li>
                  ))}
                </ul>
              </div>
              <div className={`${styles.detailGroup} ${styles.full}`}>
                <label>Yêu cầu công việc:</label>
                <ul>
                  {selectedJob.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>
              <div className={`${styles.detailGroup} ${styles.full}`}>
                <label>Quyền lợi:</label>
                <ul>
                  {selectedJob.benefits.map((welfare, index) => (
                    <li key={index}>{welfare}</li>
                  ))}
                </ul>
              </div>
              <div className={`${styles.detailGroup} ${styles.full}`}>
                <label>Đổi trạng thái:</label>
                <button
                  className={`${styles.statusBtn} ${selectedJob.status === 'Đang tuyển' ? styles.inactive : styles.active}`}
                  onClick={() => handleToggleVisibility(selectedJob.id)}
                >
                  {selectedJob.status === 'Đang tuyển' ? 'Tạm dừng' : 'Đang tuyển'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className={styles.modal} onClick={(e) => {
          if (e.target.className === styles.modal) {
            setShowModal(false);
          }
        }}>
          <div className={styles.modalContent}>
            <span className={styles.close} onClick={() => setShowModal(false)}>×</span>
            <h3>{modalMode === 'add' ? 'Thêm Công Việc Mới' : 'Chỉnh Sửa Công Việc'}</h3>
            <form onSubmit={handleFormSubmit}>
              <div className={styles.detailRow}>
                <div className={styles.detailGroup}>
                  <label>Loại công việc: <span style={{ color: 'red' }}>*</span></label>
                  <input
                    type="text"
                    name="JobType"
                    value={formData.JobType}
                    onChange={handleInputChange}
                    required
                  />
                  {formErrors.JobType && <p style={{ color: 'red' }}>{formErrors.JobType}</p>}
                </div>
                <div className={styles.detailGroup}>
                  <label>Tên công việc: <span style={{ color: 'red' }}>*</span></label>
                  <input
                    type="text"
                    name="Name"
                    value={formData.Name}
                    onChange={handleInputChange}
                    required
                  />
                  {formErrors.Name && <p style={{ color: 'red' }}>{formErrors.Name}</p>}
                </div>
              </div>
              <div className={styles.detailRow}>
                <div className={styles.detailGroup}>
                  <label>Thương hiệu:</label>
                  <input
                    type="text"
                    name="Brands"
                    value={formData.Brands}
                    onChange={handleInputChange}
                    placeholder="Nhập các thương hiệu, cách nhau bằng dấu phẩy"
                  />
                  {formErrors.Brands && <p style={{ color: 'red' }}>{formErrors.Brands}</p>}
                </div>
                <div className={styles.detailGroup}>
                  <label>Vị trí: <span style={{ color: 'red' }}>*</span></label>
                  <input
                    type="text"
                    name="Position"
                    value={formData.Position}
                    onChange={handleInputChange}
                    required
                  />
                  {formErrors.Position && <p style={{ color: 'red' }}>{formErrors.Position}</p>}
                </div>
              </div>
              <div className={styles.detailRow}>
                <div className={styles.detailGroup}>
                  <label>Địa điểm: <span style={{ color: 'red' }}>*</span></label>
                  <input
                    type="text"
                    name="Workplace"
                    value={formData.Workplace}
                    onChange={handleInputChange}
                    required
                  />
                  {formErrors.Workplace && <p style={{ color: 'red' }}>{formErrors.Workplace}</p>}
                </div>
                <div className={styles.detailGroup}>
                  <label>Mức lương: <span style={{ color: 'red' }}>*</span></label>
                  <input
                    type="text"
                    name="Salary"
                    value={formData.Salary}
                    onChange={handleInputChange}
                    required
                  />
                  {formErrors.Salary && <p style={{ color: 'red' }}>{formErrors.Salary}</p>}
                </div>
              </div>
              <div className={styles.detailRow}>
                <div className={styles.detailGroup}>
                  <label>Số lượng tuyển: <span style={{ color: 'red' }}>*</span></label>
                  <input
                    type="number"
                    name="Slot"
                    value={formData.Slot}
                    onChange={handleInputChange}
                    min="1"
                    required
                  />
                  {formErrors.Slot && <p style={{ color: 'red' }}>{formErrors.Slot}</p>}
                </div>
                <div className={styles.detailGroup}>
                  <label>Ngày đăng: <span style={{ color: 'red' }}>*</span></label>
                  <input
                    type="date"
                    name="Post-date"
                    value={formData['Post-date']}
                    onChange={handleInputChange}
                    required
                  />
                  {formErrors['Post-date'] && <p style={{ color: 'red' }}>{formErrors['Post-date']}</p>}
                </div>
              </div>
              <div className={styles.detailRow}>
                <div className={styles.detailGroup}>
                  <label>Hạn nộp: <span style={{ color: 'red' }}>*</span></label>
                 <input
                    type="date"
                    name="Due date"
                    value={formData['Due date']}
                    onChange={handleInputChange}
                    required
                  />
                  
                  {formErrors['Due date'] && <p style={{ color: 'red' }}>{formErrors['Due date']}</p>}
                </div>
                <div className={styles.detailGroup}>
                  <label>Trình độ: <span style={{ color: 'red' }}>*</span></label>
                  <input
                    type="text"
                    name="Degree"
                    value={formData.Degree}
                    onChange={handleInputChange}
                    required
                  />
                  {formErrors.Degree && <p style={{ color: 'red' }}>{formErrors.Degree}</p>}
                </div>
              </div>
              <div className={styles.detailRow}>
                <div className={`${styles.detailGroup} ${styles.full}`}>
                  <label>Kinh nghiệm làm việc: <span style={{ color: 'red' }}>*</span></label>
                  <input
                    type="text"
                    name="Work Experience"
                    value={formData['Work Experience']}
                    onChange={handleInputChange}
                    required
                  />
                  {formErrors['Work Experience'] && <p style={{ color: 'red' }}>{formErrors['Work Experience']}</p>}
                </div>
              </div>
              <div className={`${styles.detailGroup} ${styles.full}`}>
                <label>Mô tả công việc:</label>
                <textarea
                  name="Job Description"
                  value={formData['Job Description'].join('\n')}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleTextareaKeyDown(e, 'Job Description')}
                  rows="4"
                  className={styles.textareaWithLineBreaks}
                  style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}
                  wrap="soft"
                />
              </div>
              <div className={`${styles.detailGroup} ${styles.full}`}>
                <label>Yêu cầu công việc: <span style={{ color: 'red' }}>*</span></label>
                <textarea
                  name="Job Requirements"
                  value={formData['Job Requirements'].join('\n')}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleTextareaKeyDown(e, 'Job Requirements')}
                  rows="4"
                  placeholder="Nhập các yêu cầu, mỗi yêu cầu trên một dòng"
                  className={styles.textareaWithLineBreaks}
                  style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}
                  wrap="soft"
                />
                {formErrors['Job Requirements'] && <p style={{ color: 'red' }}>{formErrors['Job Requirements']}</p>}
              </div>
              <div className={`${styles.detailGroup} ${styles.full}`}>
                <label>Quyền lợi: <span style={{ color: 'red' }}>*</span></label>
                <textarea
                  name="Welfare"
                  value={formData.Welfare.join('\n')}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleTextareaKeyDown(e, 'Welfare')}
                  rows="4"
                  placeholder="Nhập các quyền lợi, mỗi quyền lợi trên một dòng"
                  className={styles.textareaWithLineBreaks}
                  style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}
                  wrap="soft"
                />
                {formErrors.Welfare && <p style={{ color: 'red' }}>{formErrors.Welfare}</p>}
              </div>
              <div className={styles.detailRow}>
                <div className={styles.detailGroup}>
                  <label>Trạng thái:</label>
                  <select name="status" value={formData.status} onChange={handleInputChange}>
                    <option value="show">Đang tuyển</option>
                    <option value="hidden">Tạm dừng</option>
                  </select>
                </div>
              </div>
              <div className={styles.formActions}>
                <button type="submit" disabled={isLoading}>
                  {isLoading ? 'Đang lưu...' : modalMode === 'add' ? 'Lưu' : 'Cập nhật'}
                </button>
                <button type="button" onClick={() => setShowModal(false)}>
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobManagement;