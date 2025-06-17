import React, { useState, useEffect } from 'react';
import styles from './contact.module.css';

const API_URL = `${process.env.REACT_APP_API_URL}/contact`;

const ContactManagement = () => {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedContact, setSelectedContact] = useState(null);
  const [isEditingStatus, setIsEditingStatus] = useState(false); // Chỉnh sửa trạng thái
  const itemsPerPage = 10;

  const statusDisplayMap = {
    'Chưa xử lý': 'Chưa xử lý',
    'Đã xử lý': 'Đã xử lý',
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
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const sanitizeHTML = (str) => {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  };

  const fetchContacts = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        showNotification('Bạn cần đăng nhập với tư cách admin để xem danh sách liên hệ', 'error');
        return [];
      }

      const response = await fetch(`${API_URL}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`Không thể tải danh sách liên hệ: ${response.status}`);
      const data = await response.json();
      if (!Array.isArray(data.contacts)) {
        console.error('API trả về dữ liệu không phải mảng:', data);
        showNotification('Dữ liệu liên hệ không hợp lệ', 'error');
        return [];
      }
      const sanitizedData = data.contacts.map((item) => ({
        ...item,
        _id: sanitizeHTML(item._id.toString()),
        fullName: sanitizeHTML(item.fullName || ''),
        email: sanitizeHTML(item.email || ''),
        phone: sanitizeHTML(item.phone || ''),
        message: sanitizeHTML(item.message || ''),
        status: item.status || 'Chưa xử lý',
        createdAt: formatDate(item.createdAt),
      }));
      setTotalPages(data.totalPages || 1);
      return sanitizedData;
    } catch (error) {
      console.error('Lỗi fetchContacts:', error);
      showNotification(`Lỗi khi tải danh sách liên hệ: ${error.message}`, 'error');
      if (error.message.includes('401')) {
        showNotification('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại', 'error');
      }
      return [];
    }
  };

  const displayContacts = async (page = 1, data = null) => {
    try {
      const displayData = data || (await fetchContacts());
      if (!Array.isArray(displayData)) {
        console.error('displayData không phải mảng:', displayData);
        setContacts([]);
        setTotalPages(1);
        showNotification('Không có dữ liệu liên hệ để hiển thị', 'error');
        return;
      }
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = Math.min(startIndex + itemsPerPage, displayData.length);
      const paginatedData = displayData.slice(startIndex, endIndex);
      setContacts(paginatedData);
      setCurrentPage(page);
    } catch (error) {
      console.error('Lỗi displayContacts:', error);
      showNotification(`Lỗi khi hiển thị danh sách liên hệ: ${error.message}`, 'error');
    }
  };

  const handlePageChange = (page) => {
    displayContacts(page, filteredContacts);
  };

  const viewContact = async (id) => {
    try {
      if (!id) throw new Error('ID liên hệ không hợp lệ');
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`Không tìm thấy liên hệ: ${response.status}`);
      const contactItem = await response.json();
      const formattedContactItem = {
        ...contactItem,
        _id: sanitizeHTML(contactItem._id.toString()),
        fullName: sanitizeHTML(contactItem.fullName || ''),
        email: sanitizeHTML(contactItem.email || ''),
        phone: sanitizeHTML(contactItem.phone || ''),
        message: sanitizeHTML(contactItem.message || ''),
        status: contactItem.status || 'Chưa xử lý',
        createdAt: formatDate(contactItem.createdAt),
      };
      setSelectedContact(formattedContactItem);
      setIsEditingStatus(false);
      return formattedContactItem;
    } catch (error) {
      console.error('Lỗi viewContact:', error);
      showNotification(`Lỗi khi tải thông tin liên hệ: ${error.message}`, 'error');
      return null;
    }
  };

  const deleteContact = async (id) => {
    if (!id) {
      showNotification('ID liên hệ không hợp lệ', 'error');
      return;
    }

    if (window.confirm('Bạn có chắc chắn muốn xóa liên hệ này?')) {
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
          showNotification('Bạn cần đăng nhập với tư cách admin để thực hiện hành động này', 'error');
          return;
        }

        const response = await fetch(`${API_URL}/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error(`Không thể xóa liên hệ: ${response.status}`);
        const result = await response.json();
        showNotification(result.message || 'Đã xóa liên hệ thành công', 'success');

        const updatedContacts = contacts.filter(contact => contact._id !== id);
        setContacts(updatedContacts);
        if (filteredContacts) {
          const updatedFilteredContacts = filteredContacts.filter(contact => contact._id !== id);
          setFilteredContacts(updatedFilteredContacts);
        }
        setSelectedContact(null);
        await displayContacts(currentPage, filteredContacts);
      } catch (error) {
        console.error('Lỗi deleteContact:', error);
        showNotification(`Lỗi khi xóa liên hệ: ${error.message}`, 'error');
        if (error.message.includes('401')) {
          showNotification('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại', 'error');
        }
      }
    }
  };

  const updateContactStatus = async (id) => {
    try {
      if (!id) throw new Error('ID liên hệ không hợp lệ');

      const token = localStorage.getItem('adminToken');
      if (!token) {
        showNotification('Bạn cần đăng nhập với tư cách admin để thực hiện hành động này', 'error');
        return;
      }

      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'Đã xử lý' }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Không thể cập nhật trạng thái: ${response.status}`);
      }
      const result = await response.json();
      showNotification(result.message || 'Đã cập nhật trạng thái thành công', 'success');
      setIsEditingStatus(false);

      const updatedContacts = contacts.map(contact =>
        contact._id === id ? { ...contact, status: 'Đã xử lý' } : contact
      );
      setContacts(updatedContacts);
      if (filteredContacts) {
        const updatedFilteredContacts = filteredContacts.map(contact =>
          contact._id === id ? { ...contact, status: 'Đã xử lý' } : contact
        );
        setFilteredContacts(updatedFilteredContacts);
      }
      setSelectedContact({ ...selectedContact, status: 'Đã xử lý' });
    } catch (error) {
      console.error('Lỗi updateContactStatus:', error);
      showNotification(`Lỗi khi cập nhật trạng thái: ${error.message}`, 'error');
      if (error.message.includes('401')) {
        showNotification('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại', 'error');
      }
    }
  };

  const applyFilters = async () => {
    const statusFilter = document.getElementById('statusFilter').value;
    const searchTerm = document.querySelector('.search-bar')?.value.trim();

    try {
      let contactItems = await fetchContacts();
      if (statusFilter) {
        contactItems = contactItems.filter(c => c.status === statusFilter);
      }
      if (searchTerm) {
        const normalizedSearchTerm = searchTerm.toLowerCase();
        contactItems = contactItems.filter(item =>
          item.fullName.toLowerCase().includes(normalizedSearchTerm) ||
          item.email.toLowerCase().includes(normalizedSearchTerm) ||
          item.phone.includes(normalizedSearchTerm)
        );
      }
      setFilteredContacts(contactItems);
      if (contactItems.length === 0) {
        showNotification('Không tìm thấy liên hệ phù hợp', 'info');
      }
      await displayContacts(1, contactItems);
    } catch (error) {
      console.error('Lỗi applyFilters:', error);
      showNotification(`Lỗi khi áp dụng bộ lọc/tìm kiếm: ${error.message}`, 'error');
    }
  };

  const resetFilters = async () => {
    document.getElementById('statusFilter').value = '';
    document.querySelector('.search-bar').value = '';
    setFilteredContacts(null);
    await displayContacts(1);
  };

  useEffect(() => {
    displayContacts(1);
  }, []);

  const getStatusClass = (status) => {
    const statusMap = {
      'Chưa xử lý': styles.chuaXuLy,
      'Đã xử lý': styles.daXuLy,
    };
    return statusMap[status] || '';
  };

  return (
    <div className={styles.container}>
      {/* Filters */}
      <div className={styles.filters}>
        <input type="text" className="search-bar" placeholder="Tìm kiếm liên hệ..." onChange={applyFilters} />
        <select id="statusFilter" onChange={applyFilters}>
          <option value="">- Tất cả trạng thái -</option>
          <option value="Chưa xử lý">Chưa xử lý</option>
          <option value="Đã xử lý">Đã xử lý</option>
        </select>
        <button onClick={applyFilters}><i className="fa-solid fa-filter"></i> Áp dụng</button>
        <button onClick={resetFilters}><i className="fa-solid fa-rotate"></i> Đặt lại</button>
      </div>

      {/* Contact list */}
      <div className={styles.contactList}>
        <h3>Danh Sách Liên Hệ</h3>
        <table>
          <thead>
            <tr>
              <th>STT</th>
              <th>Họ và tên</th>
              <th>Email</th>
              <th>Điện thoại</th>
              <th>Thời gian</th>
              <th>Trạng thái</th>
              <th>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {contacts.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center' }}>Không tìm thấy dữ liệu phù hợp</td></tr>
            ) : (
              contacts.map((item, index) => (
                <tr key={item._id || `contact-${index}`}>
                  <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td>{item.fullName || 'Không có thông tin'}</td>
                  <td>{item.email || 'N/A'}</td>
                  <td>{item.phone || 'N/A'}</td>
                  <td>{item.createdAt || 'N/A'}</td>
                  <td><span className={`${styles.status} ${getStatusClass(item.status)}`}>{item.status}</span></td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button className={styles.view} onClick={() => viewContact(item._id)}>
                        <i className="fa-solid fa-eye"></i>
                      </button>
                      <button
                        className={styles.edit}
                        onClick={() => {
                          setSelectedContact(item);
                          setIsEditingStatus(true);
                        }}
                        disabled={item.status === 'Đã xử lý' || !item._id}
                      >
                        <i className="fa-solid fa-edit"></i>
                      </button>
                      <button className={styles.delete} onClick={() => deleteContact(item._id)}>
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className={styles.pagination}>
          <button onClick={() => handlePageChange(1)}><i className="fa-solid fa-angles-left"></i></button>
          <button onClick={() => handlePageChange(Math.max(1, currentPage - 1))}><i className="fa-solid fa-angle-left"></i></button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              className={page === currentPage ? styles.active : ''}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          ))}
          <button onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}><i className="fa-solid fa-angle-right"></i></button>
          <button onClick={() => handlePageChange(totalPages)}><i className="fa-solid fa-angles-right"></i></button>
        </div>
      </div>

      {/* Modal for viewing or editing status */}
      {(selectedContact || isEditingStatus) && (
        <div className={styles.modal} onClick={(e) => {
          if (e.target.className === styles.modal) {
            setSelectedContact(null);
            setIsEditingStatus(false);
          }
        }}>
          <div className={styles.modalContent}>
            <span className={styles.close} onClick={() => { setSelectedContact(null); setIsEditingStatus(false); }}>×</span>
            {isEditingStatus && selectedContact ? (
              <>
                <h3>Cập Nhật Trạng Thái: {selectedContact.fullName}</h3>
                <div className={styles.editForm}>
                  <div className={styles.detailGroup}>
                    <p>Chuyển trạng thái từ "Chưa xử lý" thành "Đã xử lý"?</p>
                  </div>
                  <div className={styles.detailAction}>
                    <button className={styles.save} onClick={() => updateContactStatus(selectedContact._id)}>Xác nhận</button>
                    <button className={styles.cancel} onClick={() => setIsEditingStatus(false)}>Hủy</button>
                  </div>
                </div>
              </>
            ) : (
              selectedContact && (
                <>
                  <h3>Chi Tiết Liên Hệ: {selectedContact.fullName}</h3>
                  <div className={styles.contactDetails}>
                    <div className={styles.detailRow}>
                      <div className={styles.detailGroup}>
                        <label>Trạng thái:</label>
                        <p><span className={`${styles.status} ${getStatusClass(selectedContact.status)}`}>{selectedContact.status}</span></p>
                      </div>
                    </div>
                    <div className={styles.detailRow}>
                      <div className={styles.detailGroup}>
                        <label>Họ và tên:</label>
                        <p>{selectedContact.fullName}</p>
                      </div>
                      <div className={styles.detailGroup}>
                        <label>Email:</label>
                        <p>{selectedContact.email}</p>
                      </div>
                    </div>
                    <div className={styles.detailRow}>
                      <div className={styles.detailGroup}>
                        <label>Điện thoại:</label>
                        <p>{selectedContact.phone}</p>
                      </div>
                      <div className={styles.detailGroup}>
                        <label>Thời gian:</label>
                        <p>{selectedContact.createdAt}</p>
                      </div>
                    </div>
                    <div className={`${styles.detailGroup} ${styles.full}`}>
                      <label>Nội dung:</label>
                      <p>{selectedContact.message}</p>
                    </div>
                    <div className={styles.detailAction}>
                      {selectedContact.status === 'Chưa xử lý' && (
                        <button
                          className={styles.edit}
                          onClick={() => setIsEditingStatus(true)}
                        >
                          Cập nhật trạng thái
                        </button>
                      )}
                      <button
                        className={styles.delete}
                        onClick={() => deleteContact(selectedContact._id)}
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactManagement;