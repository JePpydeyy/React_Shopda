import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import styles from './EditNews.module.css';

const EditNew = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    thumbnail: null,
    thumbnailPreview: null,
    thumbnailCaption: '',
    contentBlocks: [],
    status: 'show',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const API_BASE_URL = process.env.REACT_APP_API_BASE || 'https://api-tuyendung-cty.onrender.com';
  const baseImageURL = `${API_BASE_URL}/`;

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/new/${slug}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`,
          },
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Lỗi tải bài viết.');
        }

        setFormData({
          title: data.title || '',
          thumbnail: null,
          thumbnailPreview: data.thumbnailUrl
            ? data.thumbnailUrl.startsWith('http')
              ? data.thumbnailUrl
              : baseImageURL + data.thumbnailUrl.replace(/^\/+/, '')
            : null,
          thumbnailCaption: data.thumbnailCaption || '',
          contentBlocks: (data.contentBlocks || []).map(block => ({
            ...block,
            preview: block.type === 'image'
              ? block.url?.startsWith('http')
                ? block.url
                : baseImageURL + block.url?.replace(/^\/+/, '')
              : null,
          })),
          status: data.status || 'show',
        });
      } catch (err) {
        console.error(err);
        setError(err.message || 'Lỗi không xác định');
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [slug]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        thumbnail: file,
        thumbnailPreview: URL.createObjectURL(file),
      }));
    }
  };

  const handleBlockChange = (index, field, value) => {
    const newBlocks = [...formData.contentBlocks];
    if (field === 'url' && value instanceof File) {
      newBlocks[index] = {
        ...newBlocks[index],
        [field]: value,
        preview: URL.createObjectURL(value),
        content: '',
      };
    } else {
      newBlocks[index] = { ...newBlocks[index], [field]: value };
    }
    setFormData(prev => ({ ...prev, contentBlocks: newBlocks }));
  };

  const handleAddBlock = () => {
    setFormData(prev => ({
      ...prev,
      contentBlocks: [
        ...prev.contentBlocks,
        {
          _id: `temp_${Date.now()}`,
          type: 'text',
          content: '',
          url: undefined,
          caption: '',
          preview: null,
        },
      ],
    }));
  };

  const handleRemoveBlock = (index) => {
    setFormData(prev => ({
      ...prev,
      contentBlocks: prev.contentBlocks.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    const token = localStorage.getItem('adminToken');
    if (!token) return alert('Vui lòng đăng nhập lại.');

    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    if (formData.thumbnail) {
      formDataToSend.append('thumbnail', formData.thumbnail);
    }
    formDataToSend.append('thumbnailCaption', formData.thumbnailCaption);
    formDataToSend.append('status', formData.status);

    const processedBlocks = formData.contentBlocks.map(block => ({
      ...block,
      preview: undefined,
    }));

    formDataToSend.append('contentBlocks', JSON.stringify(processedBlocks));

    try {
      const res = await fetch(`${API_BASE_URL}/api/new/${slug}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Cập nhật thất bại');
      }

      alert('Cập nhật thành công');
      navigate('/admin/new');
    } catch (err) {
      alert(`Lỗi cập nhật: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className={styles.container}><Sidebar /><div className={styles.loadingSpinner}>Đang tải...</div></div>;
  if (error) return <div className={styles.container}><Sidebar /><div className={styles.errorMessage}>Lỗi: {error}</div></div>;

  return (
    <div className={styles.container}>
      <Sidebar />
      <div className={styles.content}>
        <h1 className={styles.title}>Chỉnh sửa bài viết</h1>
        <div className={styles.form}>
          <div className={styles.formGroup}>
            <label>Tiêu đề</label>
            <input className={styles.inputField} name="title" value={formData.title} onChange={handleChange} />
          </div>

          <div className={styles.formGroup}>
            <label>Hình ảnh chủ đạo</label>
            <input type="file" accept="image/*" onChange={handleImageChange} className={styles.inputField} />
            {formData.thumbnailPreview && (
              <div className={styles.imagePreview}>
                <img src={formData.thumbnailPreview} alt="preview" className={styles.previewImage} />
              </div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>Chú thích hình ảnh</label>
            <input className={styles.inputField} name="thumbnailCaption" value={formData.thumbnailCaption} onChange={handleChange} />
          </div>

          <div className={styles.formGroup}>
            <label>Nội dung bài viết</label>
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

                {block.type !== 'image' && (
                  <textarea
                    className={styles.blockInput}
                    value={block.content || ''}
                    onChange={(e) => handleBlockChange(index, 'content', e.target.value)}
                    placeholder={`Nhập nội dung ${block.type}`}
                    rows={3}
                  />
                )}

                {block.type === 'image' && (
                  <>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) handleBlockChange(index, 'url', file);
                      }}
                      className={styles.blockInput}
                    />
                    <input
                      type="text"
                      value={block.caption || ''}
                      onChange={(e) => handleBlockChange(index, 'caption', e.target.value)}
                      className={styles.blockInput}
                      placeholder="Chú thích ảnh"
                    />
                    {(block.preview || block.url) && (
                      <div className={styles.blockImagePreview}>
                        <img
                          src={
                            block.preview
                              ? block.preview
                              : block.url?.startsWith('http')
                                ? block.url
                                : `${baseImageURL}${block.url?.replace(/^\/+/, '')}`
                          }
                          alt="Block"
                        />
                      </div>
                    )}
                  </>
                )}
                <button type="button" onClick={() => handleRemoveBlock(index)} className={styles.removeBlockButton}>Xoá Block</button>
              </div>
            ))}
            <button type="button" onClick={handleAddBlock} className={styles.addBlockButton}>+ Thêm Block</button>
          </div>

          <div className={styles.formGroup}>
            <label>Trạng thái</label>
            <select name="status" className={styles.inputField} value={formData.status} onChange={handleChange}>
              <option value="show">Hiển thị</option>
              <option value="hidden">Ẩn</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <button onClick={handleSubmit} className={styles.saveButton}>Lưu</button>
            <button onClick={() => navigate('/admin/new')} className={styles.cancelButton}>Huỷ</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditNew;
