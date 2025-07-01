import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './contact.module.css';

const ContactManagement = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
          setError('Không tìm thấy token. Vui lòng đăng nhập lại.');
          setLoading(false);
          return;
        }
        const response = await axios.get('https://api-tuyendung-cty.onrender.com/api/contact', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setContacts(Array.isArray(response.data.contacts) ? response.data.contacts : []);
      } catch (err) {
        setError('Không thể tải danh sách liên hệ.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchContacts();
  }, []);

  const toggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Quản lý liên hệ</h2>
      {loading && <p>Đang tải...</p>}
      {error && <p className={styles.error}>{error}</p>}
      {!loading && !error && (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <React.Fragment key={contact._id}>
                  <tr className={styles.tableRow} onClick={() => toggleExpand(contact._id)}>
                    <td>{contact.fullName || contact.name}</td>
                    <td>{contact.email}</td>
                    <td>{new Date(contact.createdAt).toLocaleString()}</td>
                  </tr>
                  {expandedId === contact._id && (
                    <tr className={styles.messageRow}>
                      <td colSpan="3">
                        <div className={styles.messageContent}>
                          <strong>Nội dung:</strong> {contact.message}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ContactManagement;
