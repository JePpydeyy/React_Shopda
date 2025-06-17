import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { debounce } from 'lodash';
import styles from './CandidateManagement.module.css';

const API_URL = `${process.env.REACT_APP_API_URL}/profile`;

const CandidateManagement = () => {
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [positions, setPositions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const itemsPerPage = 10;

  // Status mappings
  const statusDisplayMap = {
    pending: 'Đang chờ xét duyệt',
    interview: 'Đã phỏng vấn',
    accepted: 'Đã tuyển dụng',
    rejected: 'Đã từ chối',
  };

  const statusBackendMap = {
    'Đang chờ xét duyệt': 'pending',
    'Đã phỏng vấn': 'interview',
    'Đã tuyển dụng': 'accepted',
    'Đã từ chối': 'rejected',
  };

  const showNotification = useCallback((message, type = 'success') => {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`; // Sử dụng class CSS động
    notification.textContent = message;
    document.body.appendChild(notification);

    // Tự động xóa sau 3 giây với hiệu ứng mờ dần
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 500); // Đợi hiệu ứng mờ dần hoàn tất
    }, 3000);
  }, []);

  const normalizeVietnamese = useCallback((str) => {
    if (!str) return '';
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }, []);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '/');
  }, []);

  const sanitizeHTML = useCallback((str) => {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }, []);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      showNotification('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.', 'error');
      navigate('/admin/login');
      return null;
    }
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  }, [navigate, showNotification]);

  const fetchCandidates = useCallback(async () => {
    setIsLoading(true);
    const headers = getAuthHeaders();
    if (!headers) return [];
    try {
      const response = await fetch(API_URL, { headers });
      if (response.status === 401) {
        localStorage.removeItem('adminToken');
        showNotification('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.', 'error');
        navigate('/admin/login');
        return [];
      }
      if (!response.ok) throw new Error(`Không thể tải danh sách ứng viên: ${response.status}`);
      const data = await response.json();
      return data.map(candidate => ({
        ...candidate,
        id: candidate._id || candidate.jobId,
        name: sanitizeHTML(candidate.form?.fullName),
        email: sanitizeHTML(candidate.form?.email),
        phone: sanitizeHTML(candidate.form?.phone),
        position: sanitizeHTML(candidate.jobName),
        workplace: sanitizeHTML(candidate.jobWorkplace),
        desiredWorkplace: sanitizeHTML(candidate.form?.desiredWorkplace),
        date: formatDate(candidate.appliedAt),
        birthdate: formatDate(candidate.form?.dob),
        gender: sanitizeHTML(candidate.form?.gender),
        note: sanitizeHTML(candidate.form?.note),
        resume: candidate.form?.resume,
        status: statusDisplayMap[candidate.status] || candidate.status,
      }));
    } catch (error) {
      console.error('Lỗi khi lấy danh sách ứng viên:', error);
      showNotification(`Lỗi khi tải danh sách ứng viên: ${error.message}`, 'error');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders, showNotification, sanitizeHTML, formatDate, navigate]);

  const displayCandidates = useCallback(
    async (page = 1, candidatesToShow = null) => {
      const data = candidatesToShow || (await fetchCandidates());
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = Math.min(startIndex + itemsPerPage, data.length);
      setCandidates(data);
      setFilteredCandidates(data.slice(startIndex, endIndex));
      setTotalPages(Math.ceil(data.length / itemsPerPage));
      setCurrentPage(page);
      setPositions([...new Set(data.map(c => c.position).filter(Boolean))]);
    },
    [fetchCandidates]
  );

  const handlePageChange = useCallback((page) => {
    displayCandidates(page, candidates);
  }, [displayCandidates, candidates]);

  const viewCandidate = useCallback(
    async (id) => {
      const headers = getAuthHeaders();
      if (!headers) return;
      setIsLoading(true);
      try {
        const response = await fetch(`${API_URL}/${id}`, { headers });
        if (response.status === 401) {
          localStorage.removeItem('adminToken');
          showNotification('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.', 'error');
          navigate('/admin/login');
          return;
        }
        if (!response.ok) throw new Error(`Không tìm thấy ứng viên: ${response.status}`);
        const candidate = await response.json();
        setSelectedCandidate({
          ...candidate,
          id: candidate._id || candidate.jobId,
          name: sanitizeHTML(candidate.form?.fullName),
          email: sanitizeHTML(candidate.form?.email),
          phone: sanitizeHTML(candidate.form?.phone),
          position: sanitizeHTML(candidate.jobName),
          workplace: sanitizeHTML(candidate.jobWorkplace),
          desiredWorkplace: sanitizeHTML(candidate.form?.desiredWorkplace),
          date: formatDate(candidate.appliedAt),
          birthdate: formatDate(candidate.form?.dob),
          gender: sanitizeHTML(candidate.form?.gender),
          note: sanitizeHTML(candidate.form?.note),
          resume: candidate.form?.resume,
          status: statusDisplayMap[candidate.status] || candidate.status,
        });
      } catch (error) {
        console.error('Lỗi khi xem chi tiết ứng viên:', error);
        showNotification(`Lỗi khi tải thông tin ứng viên: ${error.message}`, 'error');
      } finally {
        setIsLoading(false);
      }
    },
    [getAuthHeaders, showNotification, sanitizeHTML, formatDate, navigate]
  );

  const viewCV = useCallback(
    async (candidateId) => {
      const headers = getAuthHeaders();
      if (!headers) return;
      setIsLoading(true);
      try {
        const response = await fetch(`${API_URL}/${candidateId}/cv`, { headers });
        if (response.status === 401) {
          localStorage.removeItem('adminToken');
          showNotification('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.', 'error');
          navigate('/admin/login');
          return;
        }
        if (!response.ok) throw new Error(`Không thể tải CV: ${response.status}`);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 60000);
      } catch (error) {
        console.error('Lỗi khi xem CV:', error);
        showNotification('CV đã bị xóa khỏi sever', 'error');
      } finally {
        setIsLoading(false);
      }
    },
    [getAuthHeaders, showNotification, navigate]
  );

  // Change Status với cập nhật lạc quan
  const changeStatus = useCallback(
    async (id, newStatus) => {
      const backendStatus = statusBackendMap[newStatus];
      if (!backendStatus) {
        showNotification('Trạng thái không hợp lệ', 'error');
        return;
      }

      // Cập nhật lạc quan
      const previousCandidates = [...candidates];
      const previousFiltered = [...filteredCandidates];
      setCandidates(prev => prev.map(c => (c.id === id ? { ...c, status: newStatus } : c)));
      setFilteredCandidates(prev => prev.map(c => (c.id === id ? { ...c, status: newStatus } : c)));
      if (selectedCandidate?.id === id) {
        setSelectedCandidate(prev => ({ ...prev, status: newStatus }));
      }

      const headers = getAuthHeaders();
      if (!headers) return;

      setIsLoading(true);
      try {
        const response = await fetch(`${API_URL}/${id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ status: backendStatus }),
        });
        if (response.status === 401) {
          localStorage.removeItem('adminToken');
          showNotification('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.', 'error');
          navigate('/admin/login');
          setCandidates(previousCandidates);
          setFilteredCandidates(previousFiltered);
          if (selectedCandidate?.id === id) {
            setSelectedCandidate(prev => ({
              ...prev,
              status: previousCandidates.find(c => c.id === id)?.status,
            }));
          }
          return;
        }
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Không thể cập nhật trạng thái: ${response.status}`);
        }
        showNotification(`Đã cập nhật trạng thái thành "${newStatus}"`, 'success');
      } catch (error) {
        console.error('Lỗi khi thay đổi trạng thái:', error);
        showNotification(`Lỗi khi cập nhật trạng thái: ${error.message}`, 'error');
        setCandidates(previousCandidates);
        setFilteredCandidates(previousFiltered);
        if (selectedCandidate?.id === id) {
          setSelectedCandidate(prev => ({
            ...prev,
            status: previousCandidates.find(c => c.id === id)?.status,
          }));
        }
      } finally {
        setIsLoading(false);
      }
    },
    [getAuthHeaders, showNotification, navigate, selectedCandidate, candidates, filteredCandidates]
  );

  // Delete Candidate với reload mượt mà
  const hideCandidate = useCallback(
    async (id) => {
      if (!window.confirm('Bạn có chắc chắn muốn xóa ứng viên này?')) return;

      // Cập nhật lạc quan
      const previousCandidates = [...candidates];
      const previousFiltered = [...filteredCandidates];
      setCandidates(prev => prev.filter(c => c.id !== id));
      setFilteredCandidates(prev => prev.filter(c => c.id !== id));
      if (selectedCandidate?.id === id) {
        setSelectedCandidate(null);
      }

      const headers = getAuthHeaders();
      if (!headers) return;

      setIsLoading(true);
      try {
        const response = await fetch(`${API_URL}/${id}`, {
          method: 'DELETE',
          headers,
        });
        if (response.status === 401) {
          localStorage.removeItem('adminToken');
          showNotification('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.', 'error');
          navigate('/admin/login');
          setCandidates(previousCandidates);
          setFilteredCandidates(previousFiltered);
          if (previousCandidates.find(c => c.id === id)) {
            setSelectedCandidate(previousCandidates.find(c => c.id === id));
          }
          return;
        }
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Không thể ẩn ứng viên: ${response.status}`);
        }
        showNotification('Đã xóa ứng viên thành công', 'success');
        // Reload danh sách ứng viên từ server
        await displayCandidates(currentPage);
      } catch (error) {
        console.error('Lỗi khi xóa ứng viên:', error);
        showNotification(`Lỗi khi ẩn ứng viên: ${error.message}`, 'error');
        setCandidates(previousCandidates);
        setFilteredCandidates(previousFiltered);
        if (previousCandidates.find(c => c.id === id)) {
          setSelectedCandidate(previousCandidates.find(c => c.id === id));
        }
      } finally {
        setIsLoading(false);
      }
    },
    [getAuthHeaders, showNotification, navigate, selectedCandidate, candidates, filteredCandidates, displayCandidates, currentPage]
  );

  // Tìm kiếm mượt mà giống JobManagement
  const handleApplyFilters = useCallback(
    async () => {
      const positionFilter = document.getElementById('positionFilter')?.value;
      const statusFilter = document.getElementById('statusFilter')?.value;
      const searchTerm = document.querySelector('.search-bar')?.value.trim().toLowerCase();
      let candidatesData = await fetchCandidates();

      if (searchTerm) {
        const normalizedSearchTerm = normalizeVietnamese(searchTerm);
        candidatesData = candidatesData.filter(
          candidate =>
            normalizeVietnamese(candidate.name).includes(normalizedSearchTerm) ||
            normalizeVietnamese(candidate.email).includes(normalizedSearchTerm) ||
            normalizeVietnamese(candidate.id).includes(normalizedSearchTerm) ||
            (candidate.position && normalizeVietnamese(candidate.position).includes(normalizedSearchTerm))
        );
      }
      if (positionFilter) {
        candidatesData = candidatesData.filter(c => c.position === positionFilter);
      }
      if (statusFilter) {
        candidatesData = candidatesData.filter(c => c.status === statusFilter);
      }

      setFilteredCandidates(candidatesData.slice(0, itemsPerPage));
      setTotalPages(Math.ceil(candidatesData.length / itemsPerPage));
      setCurrentPage(1);
      if (candidatesData.length === 0) {
        showNotification('Không tìm thấy ứng viên phù hợp', 'info');
      }
    },
    [fetchCandidates, normalizeVietnamese, showNotification]
  );

  const debouncedSearch = useCallback(debounce(() => handleApplyFilters(), 300), [handleApplyFilters]);

  const handleSearchChange = useCallback(() => {
    debouncedSearch();
  }, [debouncedSearch]);

  const handleResetFilters = useCallback(async () => {
    document.getElementById('positionFilter').value = '';
    document.getElementById('statusFilter').value = '';
    document.querySelector('.search-bar').value = '';
    setFilteredCandidates([]);
    await displayCandidates(1);
  }, [displayCandidates]);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      showNotification('Vui lòng đăng nhập để tiếp tục', 'error');
      navigate('/admin/login');
      return;
    }
    displayCandidates();
    return () => debouncedSearch.cancel();
  }, [navigate, showNotification, debouncedSearch, displayCandidates]);

  const uniqueStatuses = [...new Set(candidates.map(candidate => candidate.status))];

  const getStatusClass = useCallback((status) => {
    const statusMap = {
      'Đang chờ xét duyệt': styles.moi,
      'Đã xem xét': styles.daXemXet,
      'Đã phỏng vấn': styles.phongVan,
      'Đã tuyển dụng': styles.duocNhan,
      'Đã từ chối': styles.tuChoi,
    };
    return statusMap[status] || '';
  }, []);

  const getPaginationButtons = useCallback(() => {
    const maxButtons = 5;
    const buttons = [];
    const startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    const endPage = Math.min(totalPages, startPage + maxButtons - 1);

    buttons.push(
      <button key="first" onClick={() => handlePageChange(1)} disabled={currentPage === 1 || isLoading}>
        <i className="fa-solid fa-angles-left"></i>
      </button>
    );
    buttons.push(
      <button key="prev" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1 || isLoading}>
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
          disabled={isLoading}
        >
          {page}
        </button>
      );
    }
    if (endPage < totalPages) buttons.push(<span key="end-ellipsis">...</span>);
    buttons.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages || isLoading}
      >
        <i className="fa-solid fa-angle-right"></i>
      </button>
    );
    buttons.push(
      <button
        key="last"
        onClick={() => handlePageChange(totalPages)}
        disabled={currentPage === totalPages || isLoading}
      >
        <i className="fa-solid fa-angles-right"></i>
      </button>
    );
    return buttons;
  }, [currentPage, totalPages, isLoading, handlePageChange]);

  return (
    <div className={styles.container}>
      {isLoading && (
        <div className={`${styles.loadingOverlay} ${isLoading ? styles.active : ''}`}>
          <i className="fa-solid fa-spinner fa-spin"></i>
        </div>
      )}

      <div className={styles.filters}>
        <input
          type="text"
          className={`${styles.searchBar} search-bar`}
          placeholder="Tìm kiếm ứng viên..."
          onChange={handleSearchChange}
          disabled={isLoading}
        />
        <select id="positionFilter" onChange={handleApplyFilters} disabled={isLoading}>
          <option value="">- Tất cả vị trí -</option>
          {positions.map((pos, index) => (
            <option key={index} value={pos}>{pos}</option>
          ))}
        </select>
        <select id="statusFilter" onChange={handleApplyFilters} disabled={isLoading}>
          <option value="">- Tất cả trạng thái -</option>
          {uniqueStatuses.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
        <button onClick={handleApplyFilters} disabled={isLoading}>
          <i className="fa-solid fa-filter"></i> Áp dụng
        </button>
        <button onClick={handleResetFilters} disabled={isLoading}>
          <i className="fa-solid fa-rotate"></i> Đặt lại
        </button>
      </div>

      <div className={styles.applications}>
        <h3>Danh Sách Hồ Sơ Ứng Tuyển</h3>
        <table>
          <thead>
            <tr>
              <th>STT</th>
              <th>Họ và Tên</th>
              <th>Email</th>
              <th>Số Điện Thoại</th>
              <th>Vị Trí Ứng Tuyển</th>
              <th>Ngày Nộp</th>
              <th>Trạng Thái</th>
              <th>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center' }}>Đang tải...</td>
              </tr>
            ) : filteredCandidates.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center' }}>Không tìm thấy dữ liệu phù hợp</td>
              </tr>
            ) : (
              filteredCandidates.map((candidate, index) => (
                <tr key={candidate.id} className={styles.tableRow}>
                  <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td>{candidate.name}</td>
                  <td>{candidate.email}</td>
                  <td>{candidate.phone}</td>
                  <td>{candidate.position}</td>
                  <td>{candidate.date}</td>
                  <td>
                    <span className={`${styles.status} ${getStatusClass(candidate.status)}`}>
                      {candidate.status}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button className={styles.view} onClick={() => viewCandidate(candidate.id)} disabled={isLoading}>
                        <i className="fa-solid fa-eye"></i>
                      </button>
                      <button className={styles.viewCV} onClick={() => viewCV(candidate.id)} disabled={isLoading}>
                        <i className="fa-solid fa-file-pdf"></i>
                      </button>
                      <button className={styles.delete} onClick={() => hideCandidate(candidate.id)} disabled={isLoading}>
                        <i className="fa-solid fa-trash"></i>
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

      {selectedCandidate && (
        <div className={`${styles.modal} ${styles.active}`} onClick={(e) => {
          if (e.target.className === `${styles.modal} ${styles.active}`) {
            setSelectedCandidate(null);
          }
        }}>
          <div className={styles.modalContent}>
            <span className={styles.close} onClick={() => setSelectedCandidate(null)}>×</span>
            <h3>Thông tin chi tiết: {selectedCandidate.name}</h3>
            <div className={styles.candidateDetails}>
              <div className={styles.detailRow}>
                <div className={styles.detailGroup}>
                  <label>Trạng thái:</label>
                  <p>
                    <span className={`${styles.status} ${getStatusClass(selectedCandidate.status)}`}>
                      {selectedCandidate.status}
                    </span>
                  </p>
                </div>
              </div>
              <div className={styles.detailRow}>
                <div className={styles.detailGroup}>
                  <label>Họ tên:</label>
                  <p>{selectedCandidate.name}</p>
                </div>
                <div className={styles.detailGroup}>
                  <label>Email:</label>
                  <p>{selectedCandidate.email}</p>
                </div>
              </div>
              <div className={styles.detailRow}>
                <div className={styles.detailGroup}>
                  <label>Số điện thoại:</label>
                  <p>{selectedCandidate.phone}</p>
                </div>
                <div className={styles.detailGroup}>
                  <label>Giới tính:</label>
                  <p>{selectedCandidate.gender}</p>
                </div>
              </div>
              <div className={styles.detailRow}>
                <div className={styles.detailGroup}>
                  <label>Ngày sinh:</label>
                  <p>{selectedCandidate.birthdate}</p>
                </div>
                <div className={styles.detailGroup}>
                  <label>Vị trí ứng tuyển:</label>
                  <p>{selectedCandidate.position}</p>
                </div>
              </div>
              <div className={styles.detailRow}>
                <div className={styles.detailGroup}>
                  <label>Nơi làm việc:</label>
                  <p>{selectedCandidate.workplace}</p>
                </div>
                <div className={styles.detailGroup}>
                  <label>Nơi làm việc mong muốn:</label>
                  <p>{selectedCandidate.desiredWorkplace}</p>
                </div>
              </div>
              <div className={`${styles.detailGroup} ${styles.full}`}>
                <label>Ngày nộp hồ sơ:</label>
                <p>{selectedCandidate.date}</p>
              </div>
              <div className={`${styles.detailGroup} ${styles.full}`}>
                <label>Ghi chú:</label>
                <p>{selectedCandidate.note || 'Không có'}</p>
              </div>
              <div className={`${styles.detailGroup} ${styles.full}`}>
                <label>CV:</label>
                <p>
                  <button className={styles.viewCV} onClick={() => viewCV(selectedCandidate.id)} disabled={isLoading}>
                    <i className="fa-solid fa-file-pdf"></i> Xem CV
                  </button>
                </p>
              </div>
              <div className={`${styles.detailGroup} ${styles.full}`}>
                <label>Đổi Trạng thái:</label>
              </div>
              <div className={styles.detailAction}>
                <button
                  className={`${styles.statusBtn} ${styles.moi}`}
                  onClick={() => changeStatus(selectedCandidate.id, 'Đang chờ xét duyệt')}
                  disabled={isLoading}
                >
                  Đang chờ xét duyệt
                </button>
                <button
                  className={`${styles.statusBtn} ${styles.phongVan}`}
                  onClick={() => changeStatus(selectedCandidate.id, 'Đã phỏng vấn')}
                  disabled={isLoading}
                >
                  Đã phỏng vấn
                </button>
                <button
                  className={`${styles.statusBtn} ${styles.duocNhan}`}
                  onClick={() => changeStatus(selectedCandidate.id, 'Đã tuyển dụng')}
                  disabled={isLoading}
                >
                  Đã tuyển dụng
                </button>
                <button
                  className={`${styles.statusBtn} ${styles.tuChoi}`}
                  onClick={() => changeStatus(selectedCandidate.id, 'Đã từ chối')}
                  disabled={isLoading}
                >
                  Đã Từ chối
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(CandidateManagement);