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
    categoryNew: '',
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_BASE}/api/new-category`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('adminToken') || ''}`,
          },
        });
        const result = await res.json();
        setCategories((result.data || result || []).filter((cat) => cat.status === 'show'));
      } catch (err) {
        setError(err.message);
      }
    };

    fetchCategories();
  }, []);

  const generateSlug = (title) =>
    title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'title' && value.length > 120) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return setError('Không có tệp hình ảnh nào được chọn.');
    if (!['image/jpeg', 'image/png'].includes(file.type)) return setError('Chỉ chấp nhận JPEG hoặc PNG.');
    if (file.size > 5 * 1024 * 1024) return setError('Tệp vượt quá 5MB.');

    const previewUrl = URL.createObjectURL(file);
    setFormData((prev) => ({
      ...prev,
      thumbnail: file,
      thumbnailPreview: previewUrl,
    }));
  };

  const handleBlockChange = (index, field, value) => {
    const blocks = [...formData.contentBlocks];
    if (field === 'url' && value instanceof File) {
      if (!['image/jpeg', 'image/png'].includes(value.type)) {
        return setError('Chỉ chấp nhận JPEG hoặc PNG cho ảnh nội dung.');
      }
      if (value.size > 5 * 1024 * 1024) {
        return setError('Ảnh nội dung vượt quá 5MB.');
      }
      const preview = URL.createObjectURL(value);
      blocks[index] = { ...blocks[index], url: value, preview, content: '' };
    } else if (field === 'url' && !value) {
      blocks[index] = { ...blocks[index], url: undefined, preview: null, content: '' };
    } else {
      blocks[index] = { ...blocks[index], [field]: value };
    }
    setFormData((prev) => ({ ...prev, contentBlocks: blocks }));
  };

  const handleAddBlock = () => {
    setFormData((prev) => ({
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
    setFormData((prev) => ({
      ...prev,
      contentBlocks: prev.contentBlocks.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    if (!formData.title.trim()) return setError('Vui lòng nhập tiêu đề.') || setLoading(false);
    if (!formData.thumbnail) return setError('Vui lòng chọn hình ảnh chủ đạo.') || setLoading(false);
    if (!formData.contentBlocks.length) return setError('Vui lòng thêm ít nhất một khối nội dung.') || setLoading(false);
    if (!formData.categoryNew) return setError('Vui lòng chọn danh mục.') || setLoading(false);

    const token = localStorage.getItem('adminToken');
    if (!token) return setError('Vui lòng đăng nhập lại.') || setLoading(false);

    try {
      const processedBlocks = formData.contentBlocks.map((block, index) => {
        if (block.type === 'image' && !block.url && !block.preview) {
          throw new Error(`Khối hình ảnh thứ ${index + 1} thiếu ảnh.`);
        }
        if (block.type !== 'image' && (!block.content || typeof block.content !== 'string')) {
          throw new Error(`Khối ${block.type} thứ ${index + 1} có nội dung không hợp lệ.`);
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
      formDataToSend.append('category-new', JSON.stringify({ oid: formData.categoryNew }));
      formDataToSend.append('contentBlocks', JSON.stringify(processedBlocks));

      formData.contentBlocks.forEach((block) => {
        if (block.type === 'image' && block.url instanceof File) {
          formDataToSend.append('contentImages', block.url);
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
      if (!res.ok) throw new Error(data.error || `Lỗi: ${res.statusText}`);

      alert('Thêm bài viết thành công!');
      navigate('/admin/new');
    } catch (err) {
      setError(`Lỗi thêm bài viết: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Sidebar />
      <div className={styles.content}>
        <h1 className={styles.title}>Thêm bài viết</h1>
        <div className={styles.form}>
          <div className={styles.formGroup}>
            <label>Tiêu đề</label>
            <input
              name="title"
              className={styles.inputField}
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
                <img src={formData.thumbnailPreview} alt="Preview" className={styles.previewImage} />
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
              placeholder="Nhập chú thích"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Danh mục</label>
            <select
              name="categoryNew"
              className={styles.formSelectCategory}
              value={formData.categoryNew}
              onChange={handleChange}
            >
              <option value="">Chọn danh mục</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.category}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Lượt xem</label>
            <input
              type="number"
              name="views"
              value={formData.views}
              onChange={handleChange}
              className={styles.inputField}
              min={0}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Nội dung bài viết</label>
            <div className={styles.scrollableBlocks}>
              {formData.contentBlocks.map((block, index) => (
                <div key={block._id} className={styles.blockItem}>
                  <select
                    value={block.type}
                    onChange={(e) => handleBlockChange(index, 'type', e.target.value)}
                    className={styles.blockTypeSelect}
                  >
                    <option value="text">Text</option>
                    <option value="image">Image</option>
                    <option value="list">List</option>
                  </select>

                  {block.type === 'image' ? (
                    <>
                      <input
                        type="file"
                        accept="image/jpeg,image/png"
                        onChange={(e) => handleBlockChange(index, 'url', e.target.files?.[0])}
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
                          <img src={block.preview} className={styles.previewImage} />
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <textarea
                        className={styles.blockInput}
                        value={block.content || ''}
                        onChange={(e) => handleBlockChange(index, 'content', e.target.value)}
                        placeholder={block.type === 'list' ? 'Mỗi dòng là một mục danh sách' : 'Nhập nội dung'}
                        rows={block.type === 'list' ? 4 : 3}
                      />
                      {block.type === 'list' && (
                        <ul>
                          {block.content
                            .split('\n')
                            .filter((line) => line.trim())
                            .map((line, idx) => (
                              <li key={idx}>{line}</li>
                            ))}
                        </ul>
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
            <button onClick={handleAddBlock} className={styles.addBlockButton}>
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
            <button onClick={() => navigate('/admin/new')} className={styles.cancelButton}>
              Hủy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddNews;
