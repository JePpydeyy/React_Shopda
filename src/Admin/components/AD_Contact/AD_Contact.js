import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../Sidebar/Sidebar';
import styles from './contact.module.css';

const ContactManagement = () => {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [filterStatus, setFilterStatus] = useState('Tất cả');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const CONTACTS_PER_PAGE = 5;
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
          setError('Không tìm thấy token. Vui lòng đăng nhập lại.');
          setLoading(false);
          return;
        }
        const response = await axios.get(`${API_URL}/contact`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = Array.isArray(response.data.contacts) ? response.data.contacts : [];
        setContacts(data);
        applyFilter(filterStatus, searchKeyword, data);
      } catch (err) {
        setError('Không thể tải danh sách liên hệ.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchContacts();
  }, [API_URL]);

  const handleStatusChange = async (contactId, newStatus) => {
    const token = localStorage.getItem('adminToken');
    const url = `${API_URL}/contact/${contactId}`;
    try {
      await axios.put(
        url,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const updated = contacts.map((c) =>
        c._id === contactId ? { ...c, status: newStatus } : c
      );
      setContacts(updated);
      applyFilter(filterStatus, searchKeyword, updated);
    } catch (err) {
      console.error('Lỗi khi cập nhật trạng thái:', err);
      alert(err.response?.data?.message || 'Lỗi khi cập nhật trạng thái.');
    }
  };

  const applyFilter = (status, keyword, data = contacts) => {
    let result = [...data];
    if (status !== 'Tất cả') {
      result = result.filter((c) => c.status === status);
    }
    if (keyword.trim() !== '') {
      const lower = keyword.toLowerCase();
      result = result.filter(
        (c) =>
          (c.fullName && c.fullName.toLowerCase().includes(lower)) ||
          (c.email && c.email.toLowerCase().includes(lower))
      );
    }
    setFilteredContacts(result);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    const keyword = e.target.value;
    setSearchKeyword(keyword);
    applyFilter(filterStatus, keyword);
  };

  const handleStatusFilter = (e) => {
    const status = e.target.value;
    setFilterStatus(status);
    applyFilter(status, searchKeyword);
  };

  const totalPages = Math.ceil(filteredContacts.length / CONTACTS_PER_PAGE);
  const paginatedContacts = filteredContacts.slice(
    (currentPage - 1) * CONTACTS_PER_PAGE,
    currentPage * CONTACTS_PER_PAGE
  );

  return (
    <div className={styles.container}>
      <Sidebar />
      <div className={styles.content}>
        <h2 className={styles.title}>Quản Lý Liên Hệ</h2>

        <div className={styles.searchFilter}>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Tìm theo tên hoặc email..."
            value={searchKeyword}
            onChange={handleSearchChange}
          />
          <select
            className={styles.select}
            value={filterStatus}
            onChange={handleStatusFilter}
          >
            <option value="Tất cả">Tất cả</option>
            <option value="Chưa xử lý">Chưa xử lý</option>
            <option value="Đã xử lý">Đã xử lý</option>
          </select>
        </div>

        {loading && <p className={styles.loading}>Đang tải...</p>}
        {error && <p className={styles.error}>{error}</p>}

        {!loading && !error && (
          <>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead className={styles.tableHeader}>
                  <tr>
                    <th>Họ tên</th>
                    <th>Email</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                    <th>Thời gian</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedContacts.map((contact) => (
                    <tr
                      key={contact._id}
                      className={styles.tableRow}
                      onClick={() => setExpandedId(contact._id)}
                    >
                      <td>{contact.fullName}</td>
                      <td>{contact.email}</td>
                      <td>
                        <span
                          className={`${styles.status} ${
                            contact.status === 'Đã xử lý'
                              ? styles.statusProcessed
                              : styles.statusNotProcessed
                          }`}
                        >
                          {contact.status}
                        </span>
                      </td>
                      <td>
                        <select
                          className={styles.selectAction}
                          value={contact.status}
                          disabled={contact.status === 'Đã xử lý'}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) =>
                            handleStatusChange(contact._id, e.target.value)
                          }
                        >
                          {contact.status === 'Chưa xử lý' ? (
                            <>
                              <option value="Chưa xử lý">Chưa xử lý</option>
                              <option value="Đã xử lý">Đã xử lý</option>
                            </>
                          ) : (
                            <option value="Đã xử lý">Đã xử lý</option>
                          )}
                        </select>
                      </td>
                      <td>{new Date(contact.createdAt).toLocaleString('vi-VN')}</td>
                    </tr>
                  ))}
                  {paginatedContacts.length === 0 && (
                    <tr>
                      <td colSpan="5">Không có liên hệ nào.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  className={styles.pageButton}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  &laquo;
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    className={`${styles.pageButton} ${
                      currentPage === i + 1 ? styles.activePage : ''
                    }`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  className={styles.pageButton}
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                >
                  &raquo;
                </button>
              </div>
            )}
          </>
        )}

        {expandedId && (
          <div className={styles.modalOverlay} onClick={() => setExpandedId(null)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <h3 className={styles.modalTitle}>Nội dung liên hệ</h3>
              <p className={styles.modalText}>
                {contacts.find((c) => c._id === expandedId)?.message}
              </p>
              <button className={styles.closeButton} onClick={() => setExpandedId(null)}>
                Đóng
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactManagement;
