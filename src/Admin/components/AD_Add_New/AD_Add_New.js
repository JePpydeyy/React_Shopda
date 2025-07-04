import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import styles from './add_news.module.css';

const AddNews = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    thumbnail: null,
    thumbnailPreview: null,
    thumbnailCaption: '',
    contentBlocks: [],
    status: 'show',
    views: 0,
    'category-new': '', // Thay category bằng category-new
  });
  const [categories, setCategories] = useState([]); // State cho danh mục
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Lấy danh sách danh mục
  const fetchCategories = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE}/api/new-category`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`,
        },
      });
      const result = await res.json();
      const data = result.data || result || [];
      setCategories(data.filter(category => category.status === 'show')); // Chỉ lấy danh mục hiển thị
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchCategories();
    return () => {
      if (formData.thumbnailPreview) {
        URL.revokeObjectURL(formData.thumbnailPreview);
      }
      formData.contentBlocks.forEach(block => {
        if (block.preview) {
          URL.revokeObjectURL(block.preview);
        }
      });
    };
  }, [formData.thumbnailPreview, formData.contentBlocks]);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setError('');
    const files = e.target.files;
    if (!files || files.length === 0) {
      setError('Không có tệp hình ảnh nào được chọn.');
      return;
    }
    const file = files[0];
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setError('Vui lòng chọn tệp JPEG hoặc PNG.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Kích thước tệp vượt quá 5MB.');
      return;
    }
    if (formData.thumbnailPreview) {
      URL.revokeObjectURL(formData.thumbnailPreview);
    }
    console.log('Thumbnail file selected:', file.name);
    try {
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        thumbnail: file,
        thumbnailPreview: previewUrl,
      }));
    } catch (err) {
      setError('Không thể tạo URL xem trước cho hình ảnh chủ đạo.');
      console.error('Error creating thumbnail preview:', err);
    }
  };

  const handleBlockChange = (index, field, value) => {
    setError('');
    const newBlocks = [...formData.contentBlocks];
    if (field === 'url' && value instanceof File) {
      if (!['image/jpeg', 'image/png'].includes(value.type)) {
        setError('Vui lòng chọn tệp JPEG hoặc PNG cho khối hình ảnh.');
        return;
      }
      if (value.size > 5 * 1024 * 1024) {
        setError('Kích thước tệp hình ảnh vượt quá 5MB.');
        return;
      }
      if (newBlocks[index].preview) {
        URL.revokeObjectURL(newBlocks[index].preview);
      }
      console.log('Block image file selected:', value.name);
      try {
        const previewUrl = URL.createObjectURL(value);
        newBlocks[index] = {
          ...newBlocks[index],
          url: value,
          preview: previewUrl,
          content: '',
        };
      } catch (err) {
        setError(`Không thể tạo URL xem trước cho hình ảnh khối ${index + 1}.`);
        console.error(`Error creating block preview for index ${index}:`, err);
        return;
      }
    } else if (field === 'url' && !value) {
      if (newBlocks[index].preview) {
        URL.revokeObjectURL(newBlocks[index].preview);
      }
      newBlocks[index] = {
        ...newBlocks[index],
        url: undefined,
        preview: null,
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
    const blockToRemove = formData.contentBlocks[index];
    if (blockToRemove.preview) {
      URL.revokeObjectURL(blockToRemove.preview);
    }
    setFormData(prev => ({
      ...prev,
      contentBlocks: prev.contentBlocks.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    if (!formData.title.trim()) {
      setError('Vui lòng nhập tiêu đề.');
      setLoading(false);
      return;
    }

    if (!formData.thumbnail) {
      setError('Vui lòng chọn hình ảnh chủ đạo.');
      setLoading(false);
      return;
    }

    if (!formData.contentBlocks.length) {
      setError('Vui lòng thêm ít nhất một khối nội dung.');
      setLoading(false);
      return;
    }

    if (!formData['category-new']) {
      setError('Vui lòng chọn danh mục.');
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('adminToken');
    if (!token) {
      setError('Vui lòng đăng nhập lại.');
      setLoading(false);
      return;
    }

    try {
      const processedBlocks = formData.contentBlocks.map((block, index) => {
        if (block.type === 'image' && !block.url && !block.preview) {
          throw new Error(`Khối hình ảnh tại vị trí ${index + 1} thiếu tệp hoặc URL.`);
        }
        if (block.type !== 'image' && (!block.content || typeof block.content !== 'string')) {
          throw new Error(`Khối ${block.type} tại vị trí ${index + 1} có nội dung không hợp lệ.`);
        }
        return {
          type: block.type,
          content: block.content || '',
          caption: block.caption || '',
          url: block.url instanceof File ? '' : block.url || '',
        };
      });

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title.trim());
      formDataToSend.append('slug', generateSlug(formData.title));
      formDataToSend.append('thumbnail', formData.thumbnail);
      formDataToSend.append('thumbnailCaption', formData.thumbnailCaption);
      formDataToSend.append('status', formData.status);
      formDataToSend.append('publishedAt', new Date().toISOString());
      formDataToSend.append('views', formData.views.toString());
      formDataToSend.append('contentBlocks', JSON.stringify(processedBlocks));
      formDataToSend.append('category-new', formData['category-new']); // Gửi category-new với tên danh mục

      console.log('FormData contents:');
      for (const [key, value] of formDataToSend.entries()) {
        console.log(`${key}:`, value instanceof File ? value.name : value);
      }

      formData.contentBlocks.forEach((block, index) => {
        if (block.type === 'image' && block.url instanceof File) {
          formDataToSend.append(`contentImages`, block.url);
        }
      });

      const res = await fetch(`${process.env.REACT_APP_API_URL}/new/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const data = await res.json();
      console.log('API response:', data);
      if (!res.ok) {
        throw new Error(data.error || `Lỗi từ server: ${res.status} ${res.statusText}`);
      }

      alert('Thêm bài viết thành công');
      navigate('/admin/new');
    } catch (err) {
      setError(`Lỗi thêm bài viết: ${err.message}`);
      console.error('Submit error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className={styles.container}>
      <Sidebar />
      <div className={styles.loadingSpinner}>Đang tải...</div>
    </div>
  );

  return (
    <div className={styles.container}>
      <Sidebar />
      <div className={styles.content}>
        <h1 className={styles.title}>Thêm bài viết</h1>
        <div className={styles.form}>
          <div className={styles.formGroup}>
            <label>Tiêu đề</label>
            <input
              className={styles.inputField}
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Nhập tiêu đề"
            />
            {formData.title && (
              <div className={styles.slugPreview}>
                Slug dự kiến: <strong>{generateSlug(formData.title)}</strong>
              </div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>Hình ảnh chủ đạo</label>
            <input
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleImageChange}
              className={styles.inputField}
            />
            {formData.thumbnailPreview && (
              <div className={styles.imagePreview}>
                <img
                  src={formData.thumbnailPreview}
                  alt="Thumbnail preview"
                  className={styles.previewImage}
                  onError={() => setError('Không thể tải hình ảnh chủ đạo.')}
                />
              </div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>Chú thích hình ảnh</label>
            <input
              className={styles.inputField}
              name="thumbnailCaption"
              value={formData.thumbnailCaption}
              onChange={handleChange}
              placeholder="Nhập chú thích hình ảnh"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Danh mục</label>
            <select
              name="category-new"
              className={styles.formSelectCategory}
              value={formData['category-new']}
              onChange={handleChange}
            >
              <option value="">Chọn danh mục</option>
              {categories.map(category => (
                <option key={category._id} value={category.category}>
                  {category.category}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Lượt xem</label>
            <input
              type="number"
              className={styles.inputField}
              name="views"
              value={formData.views}
              onChange={handleChange}
              min="0"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Nội dung bài viết</label>
            <div className={styles.scrollableBlocks}>
              {formData.contentBlocks.map((block, index) => (
                <div key={block._id} className={styles.blockItem}>
                  <div className={styles.blockHeader}>
                    <p className={styles.numberblock}>{index + 1}</p>
                  </div>
                  <select
                    value={block.type}
                    onChange={(e) => handleBlockChange(index, 'type', e.target.value)}
                    className={styles.blockTypeSelect}
                  >
                    <option value="text">Text</option>
                    <option value="image">Image</option>
                    <option value="list">List</option>
                  </select>

                  {block.type !== 'image' ? (
                    block.type === 'list' ? (
                      <>
                        <textarea
                          className={styles.blockInput}
                          value={block.content || ''}
                          onChange={(e) => handleBlockChange(index, 'content', e.target.value)}
                          placeholder="Mỗi dòng là một mục danh sách"
                          rows={4}
                        />
                        <ul>
                          {(block.content || '').split('\n').filter(item => item.trim()).map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </>
                    ) : (
                      <textarea
                        className={styles.blockInput}
                        value={block.content || ''}
                        onChange={(e) => handleBlockChange(index, 'content', e.target.value)}
                        placeholder="Nhập nội dung văn bản"
                        rows={3}
                      />
                    )
                  ) : (
                    <>
                      <input
                        type="file"
                        accept="image/jpeg,image/png"
                        onChange={(e) => {
                          const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
                          handleBlockChange(index, 'url', file);
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
                      {block.preview && (
                        <div className={styles.blockImagePreview}>
                          <img
                            src={block.preview}
                            alt={`Block ${index + 1}`}
                            className={styles.previewImage}
                            onError={() => setError(`Không thể tải hình ảnh khối ${index + 1}.`)}
                          />
                        </div>
                      )}
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveBlock(index)}
                    className={styles.removeBlockButton}
                  >
                    Xóa Block
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={handleAddBlock}
              className={styles.addBlockButton}
            >
              + Thêm Block
            </button>
            {error && <div className={styles.errorMessage}>{error}</div>}
          </div>

          <div className={styles.formGroup}>
            <label>Trạng thái</label>
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

          <div className={styles.formGroup}>
            <button onClick={handleSubmit} className={styles.saveButton} disabled={loading}>
              {loading ? 'Đang lưu...' : 'Thêm bài viết'}
            </button>
            <button
              onClick={() => navigate('/admin/new')}
              className={styles.cancelButton}
            >
              Hủy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddNews;