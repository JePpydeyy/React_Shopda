import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import styles from './EditNews.module.css';

const EditNew = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    newSlug: '',
    thumbnail: null,
    thumbnailPreview: null,
    thumbnailCaption: '',
    contentBlocks: [],
    status: 'show',
    publishedAt: '',
    views: 0,
    'category-new': '',
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [contentError, setContentError] = useState('');

  const fetchCategories = async () => {
    try {
      const res = await fetch('https://api-tuyendung-cty.onrender.com/api/new-category', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken') || ''}`,
        },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Lỗi tải danh mục');
      }
      const result = await res.json();
      const data = result.data || result || [];
      setCategories(data.filter(category => category.status === 'show'));
      return data.filter(category => category.status === 'show');
    } catch (err) {
      setError(`Lỗi tải danh mục: ${err.message}`);
      return [];
    }
  };

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const res = await fetch(`https://api-tuyendung-cty.onrender.com/api/new/${slug}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken') || ''}`,
        },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Lỗi tải bài viết');
      }

      const data = await res.json();
      const categoryOid = data['category-new']?.oid || '';

      setFormData({
        title: data.title || '',
        newSlug: data.slug || '',
        thumbnail: null,
        thumbnailPreview: data.thumbnailUrl
          ? data.thumbnailUrl.startsWith('http') || data.thumbnailUrl.startsWith('data:')
            ? data.thumbnailUrl
            : `https://api-tuyendung-cty.onrender.com/${data.thumbnailUrl.replace(/^\/+/, '')}`
          : null,
        thumbnailCaption: data.thumbnailCaption || '',
        contentBlocks: (data.contentBlocks || []).map(block => ({
          ...block,
          type: ['heading', 'sub_heading', 'subheading'].includes(block.type) ? 'text' : block.type,
          preview: block.type === 'image' && block.url
            ? block.url.startsWith('http') || block.url.startsWith('data:')
              ? block.url
              : `https://api-tuyendung-cty.onrender.com/${block.url.replace(/^\/+/, '')}`
            : null,
        })),
        status: data.status || 'show',
        publishedAt: data.publishedAt ? new Date(data.publishedAt).toISOString().slice(0, 16) : '',
        views: data.views || 0,
        'category-new': categoryOid,
      });
    } catch (err) {
      console.error('Fetch article error:', err);
      setError(`Lỗi tải bài viết: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchCategories();
      await fetchArticle();
    };
    loadData();

    return () => {
      if (formData.thumbnailPreview && formData.thumbnailPreview.startsWith('blob:')) {
        URL.revokeObjectURL(formData.thumbnailPreview);
      }
      formData.contentBlocks.forEach(block => {
        if (block.preview && block.preview.startsWith('blob:')) {
          URL.revokeObjectURL(block.preview);
        }
      });
    };
  }, [slug]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        setError('Vui lòng chọn tệp JPEG hoặc PNG.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Kích thước tệp vượt quá 5MB.');
        return;
      }
      if (formData.thumbnailPreview && formData.thumbnailPreview.startsWith('blob:')) {
        URL.revokeObjectURL(formData.thumbnailPreview);
      }
      setFormData(prev => ({
        ...prev,
        thumbnail: file,
        thumbnailPreview: URL.createObjectURL(file),
      }));
    }
  };

  const handleBlockChange = (index, field, value) => {
    setContentError('');
    const newBlocks = [...formData.contentBlocks];
    if (field === 'url' && value instanceof File) {
      if (!['image/jpeg', 'image/png'].includes(value.type)) {
        setContentError('Vui lòng chọn tệp JPEG hoặc PNG cho khối hình ảnh.');
        return;
      }
      if (value.size > 5 * 1024 * 1024) {
        setContentError('Kích thước tệp hình ảnh vượt quá 5MB.');
        return;
      }
      if (newBlocks[index].preview && newBlocks[index].preview.startsWith('blob:')) {
        URL.revokeObjectURL(newBlocks[index].preview);
      }
      newBlocks[index] = {
        ...newBlocks[index],
        url: value,
        preview: URL.createObjectURL(value),
        content: '',
      };
    } else if (field === 'url' && !value) {
      if (newBlocks[index].preview && newBlocks[index].preview.startsWith('blob:')) {
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
    if (blockToRemove.preview && blockToRemove.preview.startsWith('blob:')) {
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
    setContentError('');

    const token = localStorage.getItem('adminToken');
    if (!token) {
      setError('Vui lòng đăng nhập lại.');
      setLoading(false);
      return;
    }

    if (!formData.title) {
      setError('Vui lòng nhập tiêu đề.');
      setLoading(false);
      return;
    }

    if (!formData.contentBlocks.length) {
      setContentError('Vui lòng thêm ít nhất một khối nội dung.');
      setLoading(false);
      return;
    }

    if (!formData.thumbnail && !formData.thumbnailPreview) {
      setError('Vui lòng chọn hình ảnh chủ đạo.');
      setLoading(false);
      return;
    }

    if (!formData['category-new']) {
      setError('Vui lòng chọn danh mục hợp lệ.');
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
          preview: undefined,
        };
      });

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('slug', formData.newSlug || slug);
      if (formData.thumbnail) {
        formDataToSend.append('thumbnail', formData.thumbnail);
      }
      formDataToSend.append('thumbnailUrl', formData.thumbnailPreview || '');
      formDataToSend.append('thumbnailCaption', formData.thumbnailCaption);
      formDataToSend.append('status', formData.status);
      formDataToSend.append('publishedAt', formData.publishedAt || new Date().toISOString());
      formDataToSend.append('views', formData.views.toString());
      formDataToSend.append('contentBlocks', JSON.stringify(processedBlocks));
      formDataToSend.append('category-new', JSON.stringify({ oid: formData['category-new'] }));
      console.log('Category-new sent:', JSON.stringify({ oid: formData['category-new'] })); // Debug

      formData.contentBlocks.forEach((block) => {
        if (block.type === 'image' && block.url instanceof File) {
          formDataToSend.append('contentImages', block.url);
        }
      });

      const res = await fetch(`https://api-tuyendung-cty.onrender.com/api/new/${slug}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Cập nhật thất bại: ${data.message || 'Lỗi không xác định'}`);
      }

      alert('Cập nhật thành công');
      navigate('/admin/new');
    } catch (err) {
      console.error('Submit error:', err);
      setContentError(`Lỗi cập nhật bài viết: ${err.message}`);
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
            <input
              className={styles.inputField}
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Nhập tiêu đề bài viết"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Slug</label>
            <input
              className={styles.inputField}
              name="newSlug"
              value={formData.newSlug}
              onChange={handleChange}
              placeholder="Nhập slug (URL thân thiện)"
            />
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
                <img src={formData.thumbnailPreview} alt="Thumbnail preview" className={styles.previewImage} />
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
              placeholder="Nhập chú thích cho hình ảnh"
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
                <option key={category._id} value={category._id}>
                  {category.category}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Ngày xuất bản</label>
            <input
              type="datetime-local"
              className={styles.inputField}
              name="publishedAt"
              value={formData.publishedAt}
              onChange={handleChange}
            />
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
              placeholder="Nhập số lượt xem"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Nội dung bài viết</label>
            <div className={styles.scrollableBlocks}>
              {formData.contentBlocks.map((block, index) => (
                <div key={block._id} className={styles.blockItem}>
                  <div className={styles.blockHeader}>
                    <p className={styles.numberblock}>Khối {index + 1}</p>
                  </div>
                  <select
                    value={block.type}
                    onChange={(e) => handleBlockChange(index, 'type', e.target.value)}
                    className={styles.blockTypeSelect}
                  >
                    <option value="text">Văn bản</option>
                    <option value="image">Hình ảnh</option>
                    <option value="list">Danh sách</option>
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
                        <ul className={styles.listPreview}>
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
                        placeholder="Nhập chú thích ảnh"
                      />
                      {(block.preview || block.url) && (
                        <div className={styles.blockImagePreview}>
                          <img
                            src={
                              block.preview
                                ? block.preview
                                : block.url?.startsWith('http') || block.url?.startsWith('data:')
                                ? block.url
                                : `https://api-tuyendung-cty.onrender.com/${block.url?.replace(/^\/+/, '')}`
                            }
                            alt={`Block ${index + 1}`}
                            className={styles.previewImage}
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
                    Xóa Khối
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={handleAddBlock}
              className={styles.addBlockButton}
            >
              + Thêm Khối
            </button>
            {contentError && <div className={styles.errorMessage}>{contentError}</div>}
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
              {loading ? 'Đang lưu...' : 'Lưu'}
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

export default EditNew;