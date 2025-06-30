  import React, { useEffect, useState } from 'react';
  import axios from 'axios';
  import styles from './contact.module.css';

  const ContactManagement = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Gọi API để lấy danh sách liên hệ
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
          // Đảm bảo contacts là mảng
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

    return (
      <div className={styles.container}>
        <h2 className={styles.title}>Quản lý liên hệ</h2>
        {loading && <p>Đang tải...</p>}
        {error && <p className={styles.error}>{error}</p>}
        {!loading && !error && (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Nội dung</th>
                <th>Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr key={contact._id}>
                  <td>{contact.fullName || contact.name}</td>
                  <td>{contact.email}</td>
                  <td>{contact.message}</td>
                  <td>{new Date(contact.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  };

  export default ContactManagement;