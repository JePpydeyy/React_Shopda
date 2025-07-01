import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import styles from './add_news.module.css';

const AD_Add_New = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    thumbnail: null,
    thumbnailPreview: null,
    thumbnailCaption: '',
    contentBlocks: [],
    status: 'show',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewSlug, setPreviewSlug] = useState('');
  const [previewUrls, setPreviewUrls] = useState([]);

  const API_URL = 'https://api-tuyendung-cty.onrender.com/api';
  const API_BASE = 'https://api-tuyendung-cty.onrender.com';

  // Kiểm tra chế độ chỉnh sửa
  useEffect(() => {
    const newsItem = location.state?.newsItem;
    if (newsItem) {
      setIsEditing(true);
      setEditForm({
        id: newsItem.id,
        title: newsItem.title || '',
        slug: newsItem.slug || '',
        thumbnailUrl: newsItem.thumbnailUrl || '',
        thumbnailFile: null,
        thumbnailCaption: newsItem.thumbnailCaption || '',
        publishedAt: newsItem.publishedAt
          ? new Date(newsItem.publishedAt).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        views: newsItem.views || 0,
        status: newsItem.status === 'show' ? 'Hiển thị' : 'Ẩn',
        contentBlocks: Array.isArray(newsItem.contentBlocks)
          ? newsItem.contentBlocks.map(block => ({
              type: block.type || 'text',
              content: block.content || '',
              url: block.url || '',
              caption: block.caption || '',
              file: null,
              listItems: block.type === 'list' ? (block.content ? block.content.split('\n').filter(item => item.trim()) : []) : [],
            }))
          : [],
      });
      setPreviewSlug(newsItem.slug || generateSlug(newsItem.title));
    }
  }, [location.state]);

  useEffect(() => {
    if (!isEditing && formData.title) {
      setPreviewSlug(generateSlug(formData.title));
    } else if (!isEditing) {
      setPreviewSlug('');
    }
  }, [formData.title, isEditing]);

  const handleChange = (e, index = null, field = null, formType = 'create') => {
    if (isEditing && formType === 'edit') {
      if (index !== null && field) {
        const updatedBlocks = [...editForm.contentBlocks];
        updatedBlocks[index] = {
          ...updatedBlocks[index],
          [field]: field === 'listItems' ? e.target.value.split('\n').filter(item => item.trim()) : e.target.value,
        };
        setEditForm({ ...editForm, contentBlocks: updatedBlocks });
      } else {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
      }
    } else {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e, index = null, formType = 'create') => {
    const file = e.target.files[0];
    if (!file) {
      setError('Không có file nào được chọn.');
      return;
    }
    const allowedTypes = ['image/jpeg', 'image/png'];
    const maxSize = 5 * 1024 * 1024;
    if (!allowedTypes.includes(file.type)) {
      setError('Vui lòng chọn tệp JPEG hoặc PNG.');
      return;
    }
    if (file.size > maxSize) {
      setError('Kích thước tệp vượt quá 5MB.');
      return;
    }
    const newUrl = URL.createObjectURL(file);
    setPreviewUrls(prev => [...prev, newUrl]);
    if (isEditing && formType === 'edit') {
      if (index !== null) {
        const updatedBlocks = [...editForm.contentBlocks];
        updatedBlocks[index] = {
          ...updatedBlocks[index],
          file,
          url: newUrl,
        };
        setEditForm({ ...editForm, contentBlocks: updatedBlocks });
      } else {
        setEditForm({
          ...editForm,
          thumbnailFile: file,
          thumbnailUrl: newUrl,
        });
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        thumbnail: file,
        thumbnailPreview: newUrl,
      }));
    }
  };

  const handleBlockChange = (index, field, value) => {
    setFormData((prev) => {
      const newBlocks = [...prev.contentBlocks];
      if (field === 'url' && value instanceof File) {
        const allowedTypes = ['image/jpeg', 'image/png'];
        const maxSize = 5 * 1024 * 1024;
        if (!allowedTypes.includes(value.type)) {
          setError(`Block ${index + 1}: Vui lòng chọn tệp JPEG hoặc PNG.`);
          return prev;
        }
        if (value.size > maxSize) {
          setError(`Block ${index + 1}: Kích thước tệp vượt quá 5MB.`);
          return prev;
        }
        newBlocks[index] = {
          ...newBlocks[index],
          [field]: value,
          preview: URL.createObjectURL(value),
          content: '',
          caption: newBlocks[index].caption || '',
        };
      } else if (field === 'listItems') {
        const items = value.split('\n').map((item) => item.trim()).filter((item) => item);
        newBlocks[index] = { ...newBlocks[index], [field]: items, content: items.join('\n') };
      } else {
        newBlocks[index] = { ...newBlocks[index], [field]: value };
      }
      return { ...prev, contentBlocks: newBlocks };
    });
  };

  const handleAddBlock = (type = 'text', formType = 'create') => {
    if (isEditing && formType === 'edit') {
      setEditForm({
        ...editForm,
        contentBlocks: [
          ...editForm.contentBlocks,
          { type, content: '', url: '', caption: '', file: null, listItems: type === 'list' ? [] : [] },
        ],
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        contentBlocks: [
          ...prev.contentBlocks,
          {
            _id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type,
            content: '',
            url: '',
            caption: '',
            preview: null,
            listItems: type === 'list' ? [] : [],
          },
        ],
      }));
    }
  };

  const handleRemoveBlock = (index, formType = 'create') => {
    if (isEditing && formType === 'edit') {
      const block = editForm.contentBlocks[index];
      if (block.url && block.url.startsWith('blob:')) {
        URL.revokeObjectURL(block.url);
        setPreviewUrls(prev => prev.filter(url => url !== block.url));
      }
      setEditForm({
        ...editForm,
        contentBlocks: editForm.contentBlocks.filter((_, i) => i !== index),
      });
    } else {
      const block = formData.contentBlocks[index];
      if (block.preview) {
        URL.revokeObjectURL(block.preview);
        setPreviewUrls(prev => prev.filter(url => url !== block.preview));
      }
      setFormData((prev) => ({
        ...prev,
        contentBlocks: prev.contentBlocks.filter((_, i) => i !== index),
      }));
    }
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const checkSlugAvailability = async (slug) => {
    try {
      await axios.get(`${API_URL}/new/${slug}`);
      return false; // Slug đã tồn tại
    } catch (err) {
      if (err.response?.status === 404) return true; // Slug khả dụng
      setError(`Lỗi kiểm tra slug: ${err.message}`);
      throw err;
    }
  };

  const revokePreviewUrls = () => {
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    setPreviewUrls([]);
  };

  const getImageUrl = (url) => {
    if (!url || typeof url !== 'string') return 'https://via.placeholder.com/150?text=Hình+ảnh+không+có';
    if (url.startsWith('http') || url.startsWith('blob:')) return url;
    return `${API_BASE}/${url.replace(/^\/+/, '')}`;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    // Kiểm tra dữ liệu đầu vào
    if (!formData.title.trim()) {
      setError('Tiêu đề không được để trống.');
      setLoading(false);
      return;
    }
    if (!formData.thumbnail) {
      setError('Hình ảnh chủ đạo là bắt buộc.');
      setLoading(false);
      return;
    }
    if (formData.contentBlocks.length === 0 || formData.contentBlocks.every(block => !block.content && !block.url && !block.listItems?.length)) {
      setError('Vui lòng thêm ít nhất một khối nội dung hợp lệ.');
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('adminToken');
    if (!token) {
      setError('Không tìm thấy token. Vui lòng đăng nhập lại.');
      setLoading(false);
      return;
    }

    const currentDate = new Date().toISOString();
    let slug = generateSlug(formData.title);

    // Kiểm tra slug
    try {
      const isSlugAvailable = await checkSlugAvailability(slug);
      if (!isSlugAvailable) {
        slug = `${slug}-${Date.now()}`;
        const isNewSlugAvailable = await checkSlugAvailability(slug);
        if (!isNewSlugAvailable) {
          setError('Không thể tạo slug duy nhất. Vui lòng thử lại.');
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      setLoading(false);
      return;
    }

    // Tạo FormData
    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title.trim());
    formDataToSend.append('slug', slug);
    formDataToSend.append('thumbnail', formData.thumbnail);
    
    formDataToSend.append('thumbnailCaption', formData.thumbnailCaption || '');
    formDataToSend.append('publishedAt', currentDate);
    formDataToSend.append('status', formData.status);

    const processedBlocks = formData.contentBlocks.map((block, index) => {
      const blockData = {
        type: block.type,
        content: block.type === 'list' ? (block.listItems || []).join('\n') : block.content || '',
        url: block.url instanceof File ? '' : block.url || '',
        caption: block.caption || '',
        listItems: block.type === 'list' ? block.listItems || [] : [],
      };
      if (block.url instanceof File) {
        formDataToSend.append(`contentImages[${index}]`, block.url);
      }
      return blockData;
    });

    formDataToSend.append('contentBlocks', JSON.stringify(processedBlocks));

    // Ghi log dữ liệu gửi đi
    console.log('FormData gửi đi:');
    for (let [key, value] of formDataToSend.entries()) {
      console.log(`${key}: ${value instanceof File ? value.name : value}`);
    }

    try {
      const response = await axios.post(`${API_URL}/new`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status >= 200 && response.status < 300) {
        alert('Thêm bài viết thành công!');
        navigate('/admin/new');
      }
    } catch (err) {
      console.error('Lỗi từ server:', err.response?.data);
      setError(`Thêm bài viết thất bại. ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const saveNews = async () => {
    setLoading(true);
    setError('');

    // Kiểm tra dữ liệu đầu vào
    if (!editForm.title.trim()) {
      setError('Tiêu đề không được để trống.');
      setLoading(false);
      return;
    }
    if (!editForm.thumbnailUrl && !editForm.thumbnailFile) {
      setError('Hình ảnh chủ đạo là bắt buộc.');
      setLoading(false);
      return;
    }
    if (editForm.contentBlocks.length === 0 || editForm.contentBlocks.every(block => !block.content && !block.url && !block.listItems?.length)) {
      setError('Vui lòng thêm ít nhất một khối nội dung hợp lệ.');
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('adminToken');
    if (!token) {
      setError('Không tìm thấy token. Vui lòng đăng nhập lại.');
      setLoading(false);
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('title', editForm.title.trim());
    formDataToSend.append('slug', editForm.slug);
    formDataToSend.append('thumbnailUrl', editForm.thumbnailUrl || '');
    if (editForm.thumbnailFile) {
      formDataToSend.append('thumbnail', editForm.thumbnailFile);
    }
    formDataToSend.append('thumbnailCaption', editForm.thumbnailCaption || '');
    formDataToSend.append('publishedAt', new Date(editForm.publishedAt).toISOString());
    formDataToSend.append('views', editForm.views.toString());
    formDataToSend.append('status', editForm.status === 'Hiển thị' ? 'show' : 'hidden');

    const contentBlocksForSubmission = editForm.contentBlocks.map((block, index) => {
      const blockData = {
        type: block.type,
        content: block.type === 'list' ? (block.listItems || []).join('\n') : block.content || '',
        url: block.file ? '' : block.url || '',
        caption: block.caption || '',
        listItems: block.type === 'list' ? block.listItems || [] : [],
      };
      if (block.file) {
        formDataToSend.append(`contentImages[${index}]`, block.file);
      }
      return blockData;
    });
    formDataToSend.append('contentBlocks', JSON.stringify(contentBlocksForSubmission));

    // Ghi log dữ liệu gửi đi
    console.log('FormData chỉnh sửa gửi đi:');
    for (let [key, value] of formDataToSend.entries()) {
      console.log(`${key}: ${value instanceof File ? value.name : value}`);
    }

    try {
      const response = await axios.put(`${API_URL}/new/${editForm.id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status >= 200 && response.status < 300) {
        alert('Cập nhật bài viết thành công!');
        revokePreviewUrls();
        setIsEditing(false);
        navigate('/admin/new');
      }
    } catch (err) {
      console.error('Lỗi từ server:', err.response?.data);
      setError(`Cập nhật bài viết thất bại. ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {isEditing && editForm ? (
        <div className={styles.modal} onClick={(e) => {
          if (e.target.className === styles.modal) {
            setIsEditing(false);
            revokePreviewUrls();
            navigate('/admin/new');
          }
        }}>
          <div className={styles.modalContent}>
            <span className={styles.close} onClick={() => {
              setIsEditing(false);
              revokePreviewUrls();
              navigate('/admin/new');
            }}>×</span>
            <h3>Chỉnh Sửa Tin Tức: {editForm.title}</h3>
            {error && <div className={styles.error}>{error}</div>}
            <div className={styles.editForm}>
              <div className={styles.detailGroup}>
                <label>Tiêu đề:</label>
                <input
                  type="text"
                  name="title"
                  value={editForm.title}
                  onChange={(e) => handleChange(e, null, null, 'edit')}
                />
                {previewSlug && (
                  <div className={styles.slugPreview}>
                    Slug: <strong>{previewSlug}</strong>
                  </div>
                )}
              </div>
              <div className={styles.detailGroup}>
                <label>Slug:</label>
                <input
                  type="text"
                  name="slug"
                  value={editForm.slug}
                  onChange={(e) => handleChange(e, null, null, 'edit')}
                />
              </div>
              <div className={styles.detailGroup}>
                <label>Thumbnail:</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={(e) => handleImageChange(e, null, 'edit')}
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
                  onChange={(e) => handleChange(e, null, null, 'edit')}
                />
              </div>
              <div className={styles.detailGroup}>
                <label>Ngày đăng:</label>
                <input
                  type="date"
                  name="publishedAt"
                  value={editForm.publishedAt}
                  onChange={(e) => handleChange(e, null, null, 'edit')}
                />
              </div>
              <div className={styles.detailGroup}>
                <label>Lượt xem:</label>
                <input
                  type="number"
                  name="views"
                  value={editForm.views}
                  onChange={(e) => handleChange(e, null, null, 'edit')}
                />
              </div>
              <div className={styles.detailGroup}>
                <label>Trạng thái:</label>
                <select
                  name="status"
                  value={editForm.status}
                  onChange={(e) => handleChange(e, null, null, 'edit')}
                >
                  <option value="Hiển thị">Hiển thị</option>
                  <option value="Ẩn">Ẩn</option>
                </select>
              </div>
              <div className={`${styles.detailGroup} ${styles.full}`}>
                <label>Nội dung:</label>
                {editForm.contentBlocks.map((block, index) => (
                  <div key={index} className={styles.contentBlock}>
                    <select
                      value={block.type}
                      onChange={(e) => handleChange({ target: { value: e.target.value } }, index, 'type', 'edit')}
                    >
                      <option value="text">Text</option>
                      <option value="heading">Heading</option>
                      <option value="sub_heading">Sub Heading</option>
                      <option value="image">Image</option>
                      <option value="list">List</option>
                    </select>
                    {block.type === 'text' || block.type === 'heading' || block.type === 'sub_heading' ? (
                      <input
                        type="text"
                        value={block.content}
                        onChange={(e) => handleChange(e, index, 'content', 'edit')}
                        className={styles.blockInput}
                      />
                    ) : block.type === 'image' ? (
                      <>
                        <input
                          type="file"
                          accept="image/jpeg,image/png"
                          onChange={(e) => handleImageChange(e, index, 'edit')}
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
                          onChange={(e) => handleChange(e, index, 'caption', 'edit')}
                          placeholder="Chú thích hình ảnh"
                        />
                      </>
                    ) : block.type === 'list' ? (
                      <>
                        <textarea
                          value={block.listItems ? block.listItems.join('\n') : ''}
                          onChange={(e) => handleChange(e, index, 'listItems', 'edit')}
                          className={styles.blockInput}
                          rows={4}
                          placeholder="Mỗi dòng là một mục danh sách"
                        />
                        <ul>
                          {block.listItems.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </>
                    ) : null}
                    <button
                      className={styles.removeBlock}
                      onClick={() => handleRemoveBlock(index, 'edit')}
                    >
                      Xóa khối
                    </button>
                  </div>
                ))}
                <div className={styles.addBlockButtons}>
                  <button onClick={() => handleAddBlock('text', 'edit')}>Thêm khối văn bản</button>
                  <button onClick={() => handleAddBlock('heading', 'edit')}>Thêm tiêu đề</button>
                  <button onClick={() => handleAddBlock('sub_heading', 'edit')}>Thêm tiêu đề phụ</button>
                  <button onClick={() => handleAddBlock('image', 'edit')}>Thêm khối hình ảnh</button>
                  <button onClick={() => handleAddBlock('list', 'edit')}>Thêm danh sách</button>
                </div>
              </div>
              <div className={styles.detailAction}>
                <button className={styles.save} onClick={saveNews} disabled={loading}>
                  {loading ? 'Đang lưu...' : 'Lưu'}
                </button>
                <button className={styles.cancel} onClick={() => {
                  setIsEditing(false);
                  revokePreviewUrls();
                  navigate('/admin/new');
                }}>Hủy</button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.content}>
          <h1 className={styles.title}>Thêm Bài Viết</h1>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.inputSection}>
            <label className={styles.formLabel}>Tiêu đề</label>
            <input name="title" type="text" className={styles.formInput} value={formData.title} onChange={handleChange} />
            {previewSlug && (
              <div className={styles.slugPreview}>
                Slug dự kiến: <strong>{previewSlug}</strong>
              </div>
            )}
          </div>

          <div className={styles.inputSection}>
            <label className={styles.formLabel}>Hình ảnh chủ đạo của bài viết</label>
            <input
              name="thumbnail"
              type="file"
              accept="image/jpeg,image/png"
              className={styles.mainImageInput}
              onChange={handleImageChange}
            />
            {formData.thumbnailPreview && (
              <div className={styles.imagePreview}>
                <img src={formData.thumbnailPreview} alt="Preview" />
              </div>
            )}
          </div>

          <div className={styles.inputSection}>
            <label className={styles.formLabel}>Chú thích hình ảnh</label>
            <input
              name="thumbnailCaption"
              type="text"
              className={styles.formInput}
              value={formData.thumbnailCaption}
              onChange={handleChange}
            />
          </div>

          <div className={styles.inputSection}>
            <label className={styles.formLabel}>Nội dung</label>
            {formData.contentBlocks.map((block, index) => (
              <div key={block._id} className={styles.blockItem}>
                <select
                  value={block.type}
                  onChange={(e) => handleBlockChange(index, 'type', e.target.value)}
                  className={styles.blockTypeSelect}
                >
                  <option value="text">Text</option>
                  <option value="heading">Heading</option>
                  <option value="sub_heading">Sub Heading</option>
                  <option value="image">Image</option>
                  <option value="list">List</option>
                </select>
                {block.type === 'text' || block.type === 'heading' || block.type === 'sub_heading' ? (
                  <input
                    type="text"
                    value={block.content}
                    onChange={(e) => handleBlockChange(index, 'content', e.target.value)}
                    className={styles.blockInput}
                  />
                ) : block.type === 'image' ? (
                  <>
                    <input
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={(e) => handleBlockChange(index, 'url', e.target.files[0])}
                      className={styles.blockInput}
                    />
                    <input
                      type="text"
                      value={block.caption}
                      onChange={(e) => handleBlockChange(index, 'caption', e.target.value)}
                      className={styles.blockInput}
                      placeholder="Chú thích ảnh"
                    />
                    {block.preview && (
                      <div className={styles.blockImagePreview}>
                        <img src={block.preview} alt="Block Preview" />
                      </div>
                    )}
                  </>
                ) : block.type === 'list' ? (
                  <>
                    <textarea
                      value={block.listItems ? block.listItems.join('\n') : ''}
                      onChange={(e) => handleBlockChange(index, 'listItems', e.target.value)}
                      className={styles.blockInput}
                      rows={4}
                      placeholder="Mỗi dòng là một mục danh sách"
                    />
                    <ul>
                      {block.listItems.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </>
                ) : null}
                <button onClick={() => handleRemoveBlock(index)} className={styles.removeBlockButton}>
                  Xóa
                </button>
              </div>
            ))}
            <div className={styles.addBlockButtons}>
              <button onClick={() => handleAddBlock('text')}>Thêm khối văn bản</button>
              <button onClick={() => handleAddBlock('heading')}>Thêm tiêu đề</button>
              <button onClick={() => handleAddBlock('sub_heading')}>Thêm tiêu đề phụ</button>
              <button onClick={() => handleAddBlock('image')}>Thêm khối hình ảnh</button>
              <button onClick={() => handleAddBlock('list')}>Thêm danh sách</button>
            </div>
          </div>

          <div className={styles.inputSection}>
            <label className={styles.formLabel}>Trạng thái</label>
            <select
              name="status"
              className={styles.formSelect}
              value={formData.status}
              onChange={handleChange}
            >
              <option value="show">Hiển thị</option>
              <option value="hidden">Ẩn</option>
            </select>
          </div>

          <div className={styles.formButtons}>
            <button onClick={handleSubmit} disabled={loading} className={styles.submitButton}>
              {loading ? 'Đang lưu...' : 'Thêm bài viết'}
            </button>
            <button onClick={() => navigate('/admin/new')} className={styles.cancelButton}>
              Hủy
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AD_Add_New;