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
    publishedAt: '',
    views: 0,
    'category-new': '',
    createdAt: new Date('2025-07-07T14:57:00+07:00').toISOString(), // Cập nhật theo thời gian hiện tại
    updatedAt: new Date('2025-07-07T14:57:00+07:00').toISOString(),
    __v: 0,
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [contentError, setContentError] = useState('');

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/new-category`, {
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
      const filteredCategories = data.filter(category => category.status === 'show');
      console.log('Fetched categories:', filteredCategories); // Debug
      setCategories(filteredCategories);
      return filteredCategories;
    } catch (err) {
      setError(`Lỗi tải danh mục: ${err.message}`);
      return [];
    }
  };

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.REACT_APP_API_URL}/new/${slug}`, {
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
      const categoryId = data.newCategory?._id || '';
      console.log('Fetched article data:', data); // Debug

      setFormData({
        title: data.title || '',
        thumbnail: null,
        thumbnailPreview: data.thumbnailUrl
          ? data.thumbnailUrl.startsWith('http') || data.thumbnailUrl.startsWith('data:')
            ? data.thumbnailUrl
            : `${process.env.REACT_APP_API_BASE}/${data.thumbnailUrl.replace(/^\/+/, '')}`
          : null,
        thumbnailCaption: data.thumbnailCaption || '',
        contentBlocks: (data.contentBlocks || []).map(block => {
          if (block.type === 'list' && block.content) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(block.content, 'text/html');
            const items = Array.from(doc.querySelectorAll('li')).map(li => `- ${li.textContent.trim()}`);
            return {
              ...block,
              type: ['heading', 'sub_heading', 'subheading'].includes(block.type) ? 'text' : block.type,
              content: items.join('\n'), // Chuyển HTML thành các dòng bullet points
              preview: block.type === 'image' && block.url
                ? block.url.startsWith('http') || block.url.startsWith('data:')
                  ? block.url
                  : `${process.env.REACT_APP_API_BASE}/${block.url.replace(/^\/+/, '')}`
                : null,
            };
          }
          return {
            ...block,
            type: ['heading', 'sub_heading', 'subheading'].includes(block.type) ? 'text' : block.type,
            preview: block.type === 'image' && block.url
              ? block.url.startsWith('http') || block.url.startsWith('data:')
                ? block.url
                : `${process.env.REACT_APP_API_BASE}/${block.url.replace(/^\/+/, '')}`
              : null,
          };
        }),
        status: data.status || 'show',
        publishedAt: data.publishedAt ? new Date(data.publishedAt).toISOString().slice(0, 16) : new Date('2025-07-07T14:57:00+07:00').toISOString().slice(0, 16),
        views: data.views || 0,
        'category-new': categoryId,
        createdAt: data.createdAt || new Date('2025-07-07T14:57:00+07:00').toISOString(),
        updatedAt: data.updatedAt || new Date('2025-07-07T14:57:00+07:00').toISOString(),
        __v: data.__v || 0,
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
    setFormData(prev => ({
      ...prev,
      [name]: value,
      updatedAt: new Date().toISOString(),
    }));
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
        updatedAt: new Date().toISOString(),
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
    setFormData(prev => ({
      ...prev,
      contentBlocks: newBlocks,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleAddBlock = () => {
    setFormData(prev => ({
      ...prev,
      contentBlocks: [
        ...prev.contentBlocks,
        {
          type: 'text',
          content: '',
          url: undefined,
          caption: '',
          preview: null,
        },
      ],
      updatedAt: new Date().toISOString(),
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
      updatedAt: new Date().toISOString(),
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
      const processedBlocks = formData.contentBlocks.map((block) => {
        if (block.type === 'image' && !block.url && !block.preview) {
          throw new Error(`Khối hình ảnh thiếu tệp hoặc URL.`);
        }
        if (block.type !== 'image' && (!block.content || typeof block.content !== 'string')) {
          throw new Error(`Khối ${block.type} có nội dung không hợp lệ.`);
        }
        if (block.type === 'list') {
          const items = (block.content || '').split('\n').filter(item => item.trim()).map(item => `<li>${item.replace(/^-\s*/, '').trim()}</li>`);
          return {
            type: block.type,
            content: `<ul>${items.join('')}</ul>`,
            caption: block.caption || '',
            url: block.url instanceof File ? '' : block.url || '',
          };
        }
        return {
          type: block.type,
          content: block.content || '',
          caption: block.caption || '',
          url: block.url instanceof File ? '' : block.url || '',
        };
      });

      console.log('Data to send:', {
        title: formData.title,
        thumbnail: formData.thumbnail,
        thumbnailUrl: formData.thumbnailPreview,
        thumbnailCaption: formData.thumbnailCaption,
        status: formData.status,
        publishedAt: formData.publishedAt,
        views: formData.views,
        contentBlocks: processedBlocks,
        'category-new': formData['category-new'],
        createdAt: formData.createdAt,
        updatedAt: formData.updatedAt,
        __v: formData.__v,
      }); // Debug dữ liệu gửi đi

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
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
      formDataToSend.append('createdAt', formData.createdAt);
      formDataToSend.append('updatedAt', formData.updatedAt);
      formDataToSend.append('__v', formData.__v.toString());

      // Thêm hình ảnh khối nội dung dưới dạng mảng đơn giản
      formData.contentBlocks.forEach((block) => {
        if (block.type === 'image' && block.url instanceof File) {
          formDataToSend.append('contentImages', block.url); // Sử dụng key 'contentImages' đơn giản
        }
      });

      const res = await fetch(`${process.env.REACT_APP_API_URL}/new/${slug}`, {
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
                          placeholder="Nhập danh sách (mỗi dòng bắt đầu bằng -)"
                          rows={4}
                        />
                        <div className={styles.listPreview} dangerouslySetInnerHTML={{ __html: block.content ? `<ul>${block.content.split('\n').filter(item => item.trim()).map(item => `<li>${item.replace(/^-\s*/, '').trim()}</li>`).join('')}</ul>` : '' }} />
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
                                : `${process.env.REACT_APP_API_BASE}/${block.url?.replace(/^\/+/, '')}`
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