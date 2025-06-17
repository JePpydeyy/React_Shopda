import React, { useState, useEffect } from 'react';
import styles from './New.module.css';
import { v4 as uuidv4 } from 'uuid';

const API_URL = process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/new` : '/api/new';
const BASE_URL = process.env.REACT_APP_BASE_URL || '';

const getImageUrl = (url) => {
  if (!url || typeof url !== 'string') return 'https://via.placeholder.com/150?text=Hình+ảnh+không+có';
  if (url.startsWith('http') || url.startsWith('blob:')) return url;
  const baseUrl = process.env.REACT_APP_API_URL?.replace(/\/api\/?$/, '');
  return `${baseUrl}/${url.replace(/^\/+/, '')}`;
};

const NewsManagement = () => {
  const [news, setNews] = useState([]);
  const [filteredNews, setFilteredNews] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedNews, setSelectedNews] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    slug: '',
    thumbnailUrl: '',
    thumbnailFile: null,
    thumbnailCaption: '',
    publishedAt: new Date().toISOString().split('T')[0],
    views: 0,
    status: 'Hiển thị',
    contentBlocks: [],
  });
  const [previewUrls, setPreviewUrls] = useState([]);
  const itemsPerPage = 10;

  const statusDisplayMap = {
    show: 'Hiển thị',
    hidden: 'Đã ẩn',
  };

  const statusBackendMap = {
    'Hiển thị': 'show',
    'Đã ẩn': 'hidden',
  };

  const showNotification = (message, type = 'success') => {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  };

  const normalizeVietnamese = (str) => {
    if (!str) return '';
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isNaN(date) ? 'N/A' : date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const sanitizeHTML = (str) => {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  };

  const revokePreviewUrls = () => {
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    setPreviewUrls([]);
  };

  const fetchNews = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error(`Không thể tải danh sách tin tức: ${response.status}`);
      const data = await response.json();
      if (!Array.isArray(data)) {
        console.error('API trả về dữ liệu không phải mảng:', data);
        showNotification('Dữ liệu tin tức không hợp lệ', 'error');
        return [];
      }
      const sanitizedData = data
        .filter(item => item && typeof item === 'object' && item.id)
        .map((item) => ({
          ...item,
          id: sanitizeHTML(item.id.toString()),
          title: sanitizeHTML(item.title || ''),
          slug: sanitizeHTML(item.slug || ''),
          thumbnailUrl: getImageUrl(item.thumbnailUrl),
          thumbnailCaption: sanitizeHTML(item.thumbnailCaption || ''),
          publishedAt: item.publishedAt, // Giữ nguyên định dạng gốc để sắp xếp
          status: statusDisplayMap[item.status] || item.status || 'Hiển thị',
          views: item.views || 0,
          contentBlocks: Array.isArray(item.contentBlocks) ? item.contentBlocks : [],
        }))
        .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)); // Sắp xếp theo ngày mới nhất
      return sanitizedData;
    } catch (error) {
      console.error('Lỗi fetchNews:', error);
      showNotification(`Lỗi khi tải danh sách tin tức: ${error.message}`, 'error');
      return [];
    }
  };

  const displayNews = async (page = 1, data = null) => {
    try {
      const displayData = data || (await fetchNews());
      if (!Array.isArray(displayData)) {
        console.error('displayData không phải mảng:', displayData);
        setNews([]);
        setTotalPages(1);
        showNotification('Không có dữ liệu tin tức để hiển thị', 'error');
        return;
      }
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = Math.min(startIndex + itemsPerPage, displayData.length);
      const paginatedData = displayData.slice(startIndex, endIndex);
      // Định dạng lại publishedAt để hiển thị
      const formattedNews = paginatedData.map(item => ({
        ...item,
        publishedAt: formatDate(item.publishedAt),
      }));
      setNews(formattedNews);
      setTotalPages(Math.ceil(displayData.length / itemsPerPage) || 1);
      setCurrentPage(page);
    } catch (error) {
      console.error('Lỗi displayNews:', error);
      showNotification(`Lỗi khi hiển thị tin tức: ${error.message}`, 'error');
    }
  };

  const handlePageChange = (page) => {
    displayNews(page, filteredNews);
  };

  const viewNews = async (id) => {
    try {
      if (!id) throw new Error('ID tin tức không hợp lệ');
      const token = localStorage.getItem('adminToken');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const response = await fetch(`${API_URL}/${id}`, { headers });
      if (!response.ok) throw new Error(`Không tìm thấy tin tức: ${response.status}`);
      const newsItem = await response.json();
      const formattedNewsItem = {
        ...newsItem,
        id: sanitizeHTML(newsItem.id.toString()),
        title: sanitizeHTML(newsItem.title || ''),
        slug: sanitizeHTML(newsItem.slug || ''),
        thumbnailUrl: getImageUrl(newsItem.thumbnailUrl),
        thumbnailCaption: sanitizeHTML(newsItem.thumbnailCaption || ''),
        publishedAt: formatDate(newsItem.publishedAt),
        status: statusDisplayMap[newsItem.status] || newsItem.status || 'Hiển thị',
        contentBlocks: Array.isArray(newsItem.contentBlocks)
          ? newsItem.contentBlocks.map(block => ({
              ...block,
              content: block.type === 'text' ? sanitizeHTML(block.content || '') : block.content,
              url: block.type === 'image' ? getImageUrl(block.url) : block.url,
              caption: block.caption ? sanitizeHTML(block.caption) : block.caption,
            }))
          : [],
      };
      setSelectedNews(formattedNewsItem);
      setIsEditing(false);
      return formattedNewsItem;
    } catch (error) {
      console.error('Lỗi viewNews:', error);
      showNotification(`Lỗi khi tải thông tin tin tức: ${error.message}`, 'error');
      return null;
    }
  };

  const toggleNewsVisibility = async (id) => {
    if (!id) {
      showNotification('ID tin tức không hợp lệ', 'error');
      return;
    }
    const token = localStorage.getItem('adminToken');
    if (!token) {
      showNotification('Bạn cần đăng nhập với tư cách admin để thực hiện hành động này', 'error');
      return;
    }
    const currentNews = news.find(n => n.id === id);
    const currentStatus = currentNews?.status;
    if (!currentStatus) {
      showNotification('Không thể xác định trạng thái hiện tại', 'error');
      return;
    }
    if (window.confirm(`Bạn có chắc chắn muốn ${currentStatus === 'Hiển thị' ? 'ẩn' : 'khôi phục'} tin tức này?`)) {
      try {
        const response = await fetch(`${API_URL}/${id}/toggle-visibility`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error(`Không thể cập nhật trạng thái tin tức: ${response.status}`);
        const result = await response.json();
        showNotification(result.message || 'Đã cập nhật trạng thái tin tức thành công', 'success');
        const updatedNewsItem = {
          ...result.news,
          id: sanitizeHTML(result.news.id.toString()),
          title: sanitizeHTML(result.news.title || ''),
          slug: sanitizeHTML(result.news.slug || ''),
          thumbnailUrl: getImageUrl(result.news.thumbnailUrl),
          thumbnailCaption: sanitizeHTML(result.news.thumbnailCaption || ''),
          publishedAt: formatDate(result.news.publishedAt),
          status: statusDisplayMap[result.news.status] || result.news.status || 'Hiển thị',
          views: result.news.views || 0,
          contentBlocks: Array.isArray(result.news.contentBlocks)
            ? result.news.contentBlocks.map(block => ({
                ...block,
                url: block.type === 'image' ? getImageUrl(block.url) : block.url,
              }))
            : [],
        };
        const updatedNews = news.map(item => item.id === id ? updatedNewsItem : item);
        setNews(updatedNews);
        if (filteredNews) {
          const updatedFilteredNews = filteredNews.map(item => item.id === id ? updatedNewsItem : item);
          setFilteredNews(updatedFilteredNews);
        }
        if (selectedNews && selectedNews.id === id) {
          setSelectedNews(updatedNewsItem);
        }
      } catch (error) {
        console.error('Lỗi toggleNewsVisibility:', error);
        showNotification(`Lỗi khi cập nhật trạng thái tin tức: ${error.message}`, 'error');
        if (error.message.includes('401')) {
          showNotification('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại', 'error');
        }
      }
    }
  };

  const editNews = (newsItem) => {
    if (!newsItem || !newsItem.id) {
      console.error('newsItem không hợp lệ:', newsItem);
      showNotification('Không thể chỉnh sửa: Tin tức không hợp lệ', 'error');
      return;
    }
    setSelectedNews(newsItem);
    const formattedNewsItem = {
      id: newsItem.id,
      title: newsItem.title || '',
      slug: newsItem.slug || '',
      thumbnailUrl: newsItem.thumbnailUrl || '',
      thumbnailFile: null,
      thumbnailCaption: newsItem.thumbnailCaption || '',
      publishedAt: newsItem.publishedAt ? newsItem.publishedAt.split('/').reverse().join('-') : new Date().toISOString().split('T')[0],
      views: newsItem.views || 0,
      status: newsItem.status || 'Hiển thị',
      contentBlocks: Array.isArray(newsItem.contentBlocks)
        ? newsItem.contentBlocks.map(block => ({
            type: block.type || 'text',
            content: block.content || '',
            url: block.url || '',
            caption: block.caption || '',
            file: null,
          }))
        : [],
    };
    setEditForm(formattedNewsItem);
    setIsEditing(true);
  };

  const handleFormChange = (e, index = null, field = null, formType = 'edit') => {
    const targetForm = formType === 'edit' ? editForm : createForm;
    const setForm = formType === 'edit' ? setEditForm : setCreateForm;
    if (index !== null && field) {
      const updatedBlocks = [...targetForm.contentBlocks];
      updatedBlocks[index] = { ...updatedBlocks[index], [field]: e.target.value };
      setForm({ ...targetForm, contentBlocks: updatedBlocks });
    } else {
      setForm({ ...targetForm, [e.target.name]: e.target.value });
    }
  };

  const handleFileChange = (e, index = null, formType = 'edit') => {
    const file = e.target.files[0];
    if (!file) {
      showNotification('Không có file nào được chọn', 'error');
      return;
    }
    if (!file.type.startsWith('image/')) {
      showNotification('Vui lòng chọn một file hình ảnh', 'error');
      return;
    }
    const targetForm = formType === 'edit' ? editForm : createForm;
    const setForm = formType === 'edit' ? setEditForm : setCreateForm;
    try {
      const newUrl = URL.createObjectURL(file);
      setPreviewUrls(prev => [...prev, newUrl]);
      if (index !== null) {
        const updatedBlocks = [...targetForm.contentBlocks];
        updatedBlocks[index] = {
          ...updatedBlocks[index],
          file,
          url: newUrl,
        };
        setForm({ ...targetForm, contentBlocks: updatedBlocks });
      } else {
        setForm({
          ...targetForm,
          thumbnailFile: file,
          thumbnailUrl: newUrl,
        });
      }
    } catch (error) {
      console.error('Lỗi khi tạo URL blob:', error);
      showNotification('Không thể hiển thị hình ảnh preview', 'error');
    }
  };

  const addContentBlock = (type = 'text', formType = 'edit') => {
    const targetForm = formType === 'edit' ? editForm : createForm;
    const setForm = formType === 'edit' ? setEditForm : setCreateForm;
    setForm({
      ...targetForm,
      contentBlocks: [...targetForm.contentBlocks, { type, content: '', url: '', caption: '', file: null }],
    });
  };

  const removeContentBlock = (index, formType = 'edit') => {
    const targetForm = formType === 'edit' ? editForm : createForm;
    const setForm = formType === 'edit' ? setEditForm : setCreateForm;
    const block = targetForm.contentBlocks[index];
    if (block.url && block.url.startsWith('blob:')) {
      URL.revokeObjectURL(block.url);
      setPreviewUrls(prev => prev.filter(url => url !== block.url));
    }
    setForm({
      ...targetForm,
      contentBlocks: targetForm.contentBlocks.filter((_, i) => i !== index),
    });
  };

  const saveNews = async () => {
    try {
      if (!editForm) throw new Error('Dữ liệu chỉnh sửa không hợp lệ');
      const formData = new FormData();
      formData.append('title', editForm.title);
      formData.append('slug', editForm.slug);
      formData.append('thumbnailUrl', editForm.thumbnailUrl);
      if (editForm.thumbnailFile) {
        formData.append('thumbnail', editForm.thumbnailFile);
      }
      formData.append('thumbnailCaption', editForm.thumbnailCaption);
      formData.append('publishedAt', new Date(editForm.publishedAt).toISOString());
      formData.append('views', editForm.views.toString());
      formData.append('status', statusBackendMap[editForm.status] || editForm.status);
      const contentBlocksForSubmission = editForm.contentBlocks.map(block => ({
        type: block.type,
        content: block.type === 'text' ? block.content : '',
        url: block.url && !block.file ? block.url : '',
        caption: block.type === 'image' ? block.caption : '',
      }));
      formData.append('contentBlocks', JSON.stringify(contentBlocksForSubmission));
      editForm.contentBlocks.forEach((block, index) => {
        if (block.type === 'image' && block.file) {
          formData.append('contentImages', block.file);
        }
      });
      const token = localStorage.getItem('adminToken');
      if (!token) {
        showNotification('Bạn cần đăng nhập với tư cách admin để thực hiện hành động này', 'error');
        return;
      }
      const response = await fetch(`${API_URL}/${editForm.id}`, {
        method: 'PUT',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Không thể cập nhật tin tức: ${response.status}`);
      }
      const result = await response.json();
      showNotification(result.message || 'Đã cập nhật tin tức thành công', 'success');
      revokePreviewUrls();
      setIsEditing(false);
      setSelectedNews(null);
      await displayNews(currentPage, filteredNews);
    } catch (error) {
      console.error('Lỗi saveNews:', error);
      showNotification(`Lỗi khi cập nhật tin tức: ${error.message}`, 'error');
      if (error.message.includes('401')) {
        showNotification('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại', 'error');
      }
    }
  };

  const createNews = async () => {
    try {
      if (!createForm) throw new Error('Dữ liệu tạo mới không hợp lệ');
      const hasMissingImageFile = createForm.contentBlocks.some(
        block => block.type === 'image' && !block.file && !block.url
      );
      if (hasMissingImageFile) {
        showNotification('Vui lòng chọn file cho tất cả block hình ảnh', 'error');
        return;
      }
      const formData = new FormData();
      formData.append('id', uuidv4());
      formData.append('title', createForm.title);
      formData.append('slug', createForm.slug);
      formData.append('thumbnailUrl', createForm.thumbnailUrl);
      if (createForm.thumbnailFile) {
        formData.append('thumbnail', createForm.thumbnailFile);
      }
      formData.append('thumbnailCaption', createForm.thumbnailCaption);
      formData.append('publishedAt', new Date(createForm.publishedAt).toISOString());
      formData.append('views', createForm.views.toString());
      formData.append('status', statusBackendMap[createForm.status] || createForm.status);
      const contentBlocksForSubmission = createForm.contentBlocks.map(block => ({
        type: block.type,
        content: block.type === 'text' ? block.content : '',
        url: block.type === 'image' && block.file ? `placeholder-${Date.now()}.jpg` : (block.url || ''),
        caption: block.type === 'image' ? block.caption : '',
      }));
      formData.append('contentBlocks', JSON.stringify(contentBlocksForSubmission));
      createForm.contentBlocks.forEach((block, index) => {
        if (block.type === 'image' && block.file) {
          formData.append('contentImages', block.file);
        }
      });
      const token = localStorage.getItem('adminToken');
      if (!token) {
        showNotification('Bạn cần đăng nhập với tư cách admin để thực hiện hành động này', 'error');
        return;
      }
      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Không thể tạo tin tức: ${response.status}`);
      }
      const result = await response.json();
      showNotification(result.message || 'Đã tạo tin tức thành công', 'success');
      revokePreviewUrls();
      setIsCreating(false);
      setCreateForm({
        title: '',
        slug: '',
        thumbnailUrl: '',
        thumbnailFile: null,
        thumbnailCaption: '',
        publishedAt: new Date().toISOString().split('T')[0],
        views: 0,
        status: 'Hiển thị',
        contentBlocks: [],
      });
      await displayNews(1, filteredNews);
    } catch (error) {
      console.error('Lỗi createNews:', error);
      showNotification(`Lỗi khi tạo tin tức: ${error.message}`, 'error');
      if (error.message.includes('401')) {
        showNotification('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại', 'error');
      }
    }
  };

  const applyFilters = async () => {
    const statusFilter = document.getElementById('statusFilter').value;
    const searchTerm = document.querySelector('.search-bar')?.value.trim();
    try {
      let newsItems = await fetchNews();
      if (statusFilter) {
        newsItems = newsItems.filter(n => n.status === statusFilter);
      }
      if (searchTerm) {
        const normalizedSearchTerm = normalizeVietnamese(searchTerm);
        newsItems = newsItems.filter(item =>
          normalizeVietnamese(item.title).includes(normalizedSearchTerm) ||
          normalizeVietnamese(item.id).includes(normalizedSearchTerm) ||
          normalizeVietnamese(item.slug).includes(normalizedSearchTerm)
        );
      }
      setFilteredNews(newsItems);
      if (newsItems.length === 0) {
        showNotification('Không tìm thấy tin tức phù hợp', 'info');
      }
      await displayNews(1, newsItems);
    } catch (error) {
      console.error('Lỗi applyFilters:', error);
      showNotification(`Lỗi khi áp dụng bộ lọc/tìm kiếm: ${error.message}`, 'error');
    }
  };

  const resetFilters = async () => {
    document.getElementById('statusFilter').value = '';
    document.querySelector('.search-bar').value = '';
    setFilteredNews(null);
    await displayNews(1);
  };

  useEffect(() => {
    displayNews(1);
    return () => revokePreviewUrls();
  }, []);

  const getStatusClass = (status) => {
    const statusMap = {
      'Hiển thị': styles.hienThi,
      'Đã ẩn': styles.daAn,
    };
    return statusMap[status] || '';
  };

  return (
    <div className={styles.container}>
      <div className={styles.filters}>
        <input type="text" className="search-bar" placeholder="Tìm kiếm tin tức..." onChange={applyFilters} />
        <select id="statusFilter" onChange={applyFilters}>
          <option value="">- Tất cả trạng thái -</option>
          <option value="Hiển thị">Hiển thị</option>
          <option value="Đã ẩn">Đã ẩn</option>
        </select>
        <button onClick={applyFilters}><i className="fa-solid fa-filter"></i> Áp dụng</button>
        <button onClick={resetFilters}><i className="fa-solid fa-rotate"></i> Đặt lại</button>
        <button onClick={() => setIsCreating(true)}><i className="fa-solid fa-plus"></i> Thêm tin tức</button>
      </div>

      <div className={styles.newsList}>
        <h3>Danh Sách Tin Tức</h3>
        <table>
          <thead>
            <tr>
              <th>STT</th>
              <th>Tiêu Đề</th>
              <th>Ngày Đăng</th>
              <th>Lượt Xem</th>
              <th>Trạng Thái</th>
              <th>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {news.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center' }}>Không tìm thấy dữ liệu phù hợp</td></tr>
            ) : (
              news.map((item, index) => (
                <tr key={item.id || `news-${index}`}>
                  <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td>{item.title || 'Không có tiêu đề'}</td>
                  <td>{item.publishedAt || 'N/A'}</td>
                  <td>{item.views || 0}</td>
                  <td><span className={`${styles.status} ${getStatusClass(item.status)}`}>{item.status}</span></td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button className={styles.view} onClick={() => viewNews(item.id)}>
                        <i className="fa-solid fa-eye"></i>
                      </button>
                      <button className={styles.edit} onClick={() => editNews(item)} disabled={!item.id}>
                        <i className="fa-solid fa-edit"></i>
                      </button>
                      <button className={styles.delete} onClick={() => toggleNewsVisibility(item.id)}>
                        {item.status === 'Đã ẩn' ? (
                          <i className="fa-solid fa-play"></i>
                        ) : (
                          <i className="fa-solid fa-pause"></i>
                        )}
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

      {(selectedNews || isCreating) && (
        <div className={styles.modal} onClick={(e) => {
          if (e.target.className === styles.modal) {
            setSelectedNews(null);
            setIsEditing(false);
            setIsCreating(false);
            revokePreviewUrls();
          }
        }}>
          <div className={styles.modalContent}>
            <span className={styles.close} onClick={() => {
              setSelectedNews(null);
              setIsEditing(false);
              setIsCreating(false);
              revokePreviewUrls();
            }}>×</span>
            {isCreating ? (
              <>
                <h3>Thêm Tin Tức Mới</h3>
                <div className={styles.editForm}>
                  <div className={styles.detailGroup}>
                    <label>Tiêu đề:</label>
                    <input
                      type="text"
                      name="title"
                      value={createForm.title}
                      onChange={(e) => handleFormChange(e, null, null, 'create')}
                    />
                  </div>
                  <div className={styles.detailGroup}>
                    <label>Slug:</label>
                    <input
                      type="text"
                      name="slug"
                      value={createForm.slug}
                      onChange={(e) => handleFormChange(e, null, null, 'create')}
                    />
                  </div>
                  <div className={styles.detailGroup}>
                    <label>Thumbnail:</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, null, 'create')}
                    />
                    {createForm.thumbnailUrl && (
                      <div className={styles.thumbnailPreview}>
                        <p>Xem trước:</p>
                        <img
                          src={createForm.thumbnailUrl.startsWith('blob:') ? createForm.thumbnailUrl : getImageUrl(createForm.thumbnailUrl)}
                          alt="Thumbnail Preview"
                          className={styles.imagePreview}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                        <span style={{ display: 'none', color: 'red' }}>Hình ảnh không tải được</span>
                      </div>
                    )}
                  </div>
                  <div className={styles.detailGroup}>
                    <label>Thumbnail Caption:</label>
                    <input
                      type="text"
                      name="thumbnailCaption"
                      value={createForm.thumbnailCaption}
                      onChange={(e) => handleFormChange(e, null, null, 'create')}
                    />
                  </div>
                  <div className={styles.detailGroup}>
                    <label>Ngày đăng:</label>
                    <input
                      type="date"
                      name="publishedAt"
                      value={createForm.publishedAt}
                      onChange={(e) => handleFormChange(e, null, null, 'create')}
                    />
                  </div>
                  <div className={styles.detailGroup}>
                    <label>Lượt xem:</label>
                    <input
                      type="number"
                      name="views"
                      value={createForm.views}
                      onChange={(e) => handleFormChange(e, null, null, 'create')}
                    />
                  </div>
                  <div className={styles.detailGroup}>
                    <label>Trạng thái:</label>
                    <select
                      name="status"
                      value={createForm.status}
                      onChange={(e) => handleFormChange(e, null, null, 'create')}
                    >
                      <option value="Hiển thị">Hiển thị</option>
                      <option value="Đã ẩn">Đã ẩn</option>
                    </select>
                  </div>
                  <div className={`${styles.detailGroup} ${styles.full}`}>
                    <label>Nội dung:</label>
                    {createForm.contentBlocks.map((block, index) => (
                      <div key={index} className={styles.contentBlock}>
                        <select
                          value={block.type}
                          onChange={(e) => handleFormChange({ target: { value: e.target.value } }, index, 'type', 'create')}
                        >
                          <option value="text">Văn bản</option>
                          <option value="image">Hình ảnh</option>
                        </select>
                        {block.type === 'text' ? (
                          <textarea
                            value={block.content}
                            onChange={(e) => handleFormChange(e, index, 'content', 'create')}
                            placeholder="Nội dung văn bản"
                          />
                        ) : (
                          <>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileChange(e, index, 'create')}
                            />
                            {(block.url || block.file) && (
                              <img
                                src={block.url && block.url.startsWith('blob:') ? block.url : getImageUrl(block.url)}
                                alt="Image Preview"
                                className={styles.imagePreview}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'block';
                                }}
                              />
                            )}
                            {(block.url || block.file) && (
                              <span style={{ display: 'none', color: 'red' }}>Hình ảnh không tải được</span>
                            )}
                            <input
                              type="text"
                              value={block.caption}
                              onChange={(e) => handleFormChange(e, index, 'caption', 'create')}
                              placeholder="Chú thích hình ảnh"
                            />
                          </>
                        )}
                        <button
                          className={styles.removeBlock}
                          onClick={() => removeContentBlock(index, 'create')}
                        >
                          Xóa khối
                        </button>
                      </div>
                    ))}
                    <div className={styles.addBlockButtons}>
                      <button onClick={() => addContentBlock('text', 'create')}>Thêm khối văn bản</button>
                      <button onClick={() => addContentBlock('image', 'create')}>Thêm khối hình ảnh</button>
                    </div>
                  </div>
                  <div className={styles.detailAction}>
                    <button className={styles.save} onClick={createNews}>Tạo mới</button>
                    <button className={styles.cancel} onClick={() => {
                      setIsCreating(false);
                      revokePreviewUrls();
                    }}>Hủy</button>
                  </div>
                </div>
              </>
            ) : isEditing && editForm ? (
              <>
                <h3>Chỉnh Sửa Tin Tức: {editForm.title}</h3>
                <div className={styles.editForm}>
                  <div className={styles.detailGroup}>
                    <label>Tiêu đề:</label>
                    <input
                      type="text"
                      name="title"
                      value={editForm.title}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className={styles.detailGroup}>
                    <label>Slug:</label>
                    <input
                      type="text"
                      name="slug"
                      value={editForm.slug}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className={styles.detailGroup}>
                    <label>Thumbnail:</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e)}
                    />
                    {editForm.thumbnailUrl && (
                      <div className={styles.thumbnailPreview}>
                        <p>Xem trước:</p>
                        <img
                          src={editForm.thumbnailUrl.startsWith('blob:') ? editForm.thumbnailUrl : getImageUrl(editForm.thumbnailUrl)}
                          alt="Thumbnail Preview"
                          className={styles.imagePreview}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                        <span style={{ display: 'none', color: 'red' }}>Hình ảnh không tải được</span>
                      </div>
                    )}
                  </div>
                  <div className={styles.detailGroup}>
                    <label>Thumbnail Caption:</label>
                    <input
                      type="text"
                      name="thumbnailCaption"
                      value={editForm.thumbnailCaption}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className={styles.detailGroup}>
                    <label>Ngày đăng:</label>
                    <input
                      type="date"
                      name="publishedAt"
                      value={editForm.publishedAt}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className={styles.detailGroup}>
                    <label>Lượt xem:</label>
                    <input
                      type="number"
                      name="views"
                      value={editForm.views}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className={styles.detailGroup}>
                    <label>Trạng thái:</label>
                    <select
                      name="status"
                      value={editForm.status}
                      onChange={handleFormChange}
                    >
                      <option value="Hiển thị">Hiển thị</option>
                      <option value="Đã ẩn">Đã ẩn</option>
                    </select>
                  </div>
                  <div className={`${styles.detailGroup} ${styles.full}`}>
                    <label>Nội dung:</label>
                    {editForm.contentBlocks.map((block, index) => (
                      <div key={index} className={styles.contentBlock}>
                        <select
                          value={block.type}
                          onChange={(e) => handleFormChange({ target: { value: e.target.value } }, index, 'type')}
                        >
                          <option value="text">Văn bản</option>
                          <option value="image">Hình ảnh</option>
                        </select>
                        {block.type === 'text' ? (
                          <textarea
                            value={block.content}
                            onChange={(e) => handleFormChange(e, index, 'content')}
                            placeholder="Nội dung văn bản"
                          />
                        ) : (
                          <>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileChange(e, index)}
                            />
                            {(block.url || block.file) && (
                              <img
                                src={block.url && block.url.startsWith('blob:') ? block.url : getImageUrl(block.url)}
                                alt="Image Preview"
                                className={styles.imagePreview}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'block';
                                }}
                              />
                            )}
                            {(block.url || block.file) && (
                              <span style={{ display: 'none', color: 'red' }}>Hình ảnh không tải được</span>
                            )}
                            <input
                              type="text"
                              value={block.caption}
                              onChange={(e) => handleFormChange(e, index, 'caption')}
                              placeholder="Chú thích hình ảnh"
                            />
                          </>
                        )}
                        <button
                          className={styles.removeBlock}
                          onClick={() => removeContentBlock(index)}
                        >
                          Xóa khối
                        </button>
                      </div>
                    ))}
                    <div className={styles.addBlockButtons}>
                      <button onClick={() => addContentBlock('text')}>Thêm khối văn bản</button>
                      <button onClick={() => addContentBlock('image')}>Thêm khối hình ảnh</button>
                    </div>
                  </div>
                  <div className={styles.detailAction}>
                    <button className={styles.save} onClick={saveNews}>Lưu</button>
                    <button className={styles.cancel} onClick={() => {
                      setIsEditing(false);
                      revokePreviewUrls();
                    }}>Hủy</button>
                  </div>
                </div>
              </>
            ) : (
              selectedNews && (
                <>
                  <h3>{selectedNews.title}</h3>
                  <div className={styles.newsDetails}>
                    <div className={styles.detailRow}>
                      <div className={styles.detailGroup}>
                        <label>Trạng thái:</label>
                        <p>
                          <span className={`${styles.status} ${getStatusClass(selectedNews.status)}`}>
                            {selectedNews.status}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className={styles.detailRow}>
                      <div className={styles.detailGroup}>
                        <label>Ngày đăng:</label>
                        <p>{selectedNews.publishedAt}</p>
                      </div>
                      <div className={styles.detailGroup}>
                        <label>Lượt xem:</label>
                        <p>{selectedNews.views}</p>
                      </div>
                    </div>
                    <div className={styles.detailRow}>
                      <div className={styles.detailGroup}>
                        <label>Slug:</label>
                        <p>{selectedNews.slug}</p>
                      </div>
                    </div>
                    <div className={`${styles.detailGroup} ${styles.full}`}>
                      <label>Thumbnail:</label>
                      <p>
                        {selectedNews.thumbnailUrl ? (
                          <>
                            <img
                              src={getImageUrl(selectedNews.thumbnailUrl)}
                              alt={selectedNews.thumbnailCaption || 'Thumbnail'}
                              className={styles.imagePreview}
                              loading="lazy"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                              }}
                            />
                            <span style={{ display: 'none', color: 'red' }}>Hình ảnh không tải được</span>
                          </>
                        ) : (
                          <span>Hình ảnh không có sẵn</span>
                        )}
                        {selectedNews.thumbnailCaption && (
                          <div className={styles.imageCaption}>{selectedNews.thumbnailCaption}</div>
                        )}
                      </p>
                    </div>
                    <div className={`${styles.detailGroup} ${styles.full}`}>
                      <label>Nội dung:</label>
                      {selectedNews.contentBlocks.map((block, index) => (
                        <div key={index} className={styles.contentBlock}>
                          {block.type === 'text' ? (
                            <div className={styles.contentText}>{block.content}</div>
                          ) : (
                            <div>
                              {block.url ? (
                                <>
                                  <img
                                    src={getImageUrl(block.url)}
                                    alt={block.caption || 'Content Image'}
                                    className={styles.imagePreview}
                                    loading="lazy"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.nextSibling.style.display = 'block';
                                    }}
                                  />
                                  <span style={{ display: 'none', color: 'red' }}>Hình ảnh không tải được</span>
                                </>
                              ) : (
                                <span>Hình ảnh không có sẵn</span>
                              )}
                              {block.caption && (
                                <div className={styles.imageCaption}>{block.caption}</div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
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

export default NewsManagement;