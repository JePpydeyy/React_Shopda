import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import styles from './add_news.module.css';

const AddNews = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    thumbnail: null,
    thumbnailPreview: null,
    thumbnailCaption: '',
    contentBlocks: [],
    status: 'show',
    views: 0,
    categoryNew: '',
    createdAt: new Date('2025-07-07T13:54:00+07:00').toISOString(), // Cập nhật theo thời gian hiện tại
    updatedAt: new Date('2025-07-07T13:54:00+07:00').toISOString(),
    __v: 0,
    publishedAt: new Date('2025-07-07T13:54:00+07:00').toISOString(),
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditMode, setIsEditMode] = useState(!!slug);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/new-category`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('adminToken') || ''}`,
          },
        });
        const result = await res.json();
        setCategories((result.data || result || []).filter((cat) => cat.status === 'show'));
      } catch (err) {
        setError(`Lỗi tải danh mục: ${err.message}`);
      }
    };

    const fetchNews = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        const res = await fetch(`${process.env.REACT_APP_API_URL}/new/${slug}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('adminToken') || ''}`,
          },
        });
        if (!res.ok) throw new Error('Không thể tải bài viết');
        const data = await res.json();
        setFormData({
          title: data.title || '',
          thumbnail: null,
          thumbnailPreview: data.thumbnailUrl || null,
          thumbnailCaption: data.thumbnailCaption || '',
          contentBlocks: data.contentBlocks.map((block) => ({
            _id: block._id || `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: block.type,
            content: block.type === 'list'
              ? (block.content || '')
                  .replace(/<\/?ul>/g, '')
                  .replace(/<\/?li>/g, '')
                  .split('\n')
                  .filter((line) => line.trim())
                  .join('\n')
              : block.content,
            url: block.url || undefined,
            caption: block.caption || '',
            preview: block.url || null,
          })),
          status: data.status || 'show',
          views: data.views || 0,
          categoryNew: data.newCategory?._id || '',
          createdAt: data.createdAt || new Date('2025-07-07T13:54:00+07:00').toISOString(),
          updatedAt: data.updatedAt || new Date('2025-07-07T13:54:00+07:00').toISOString(),
          __v: data.__v || 0,
          publishedAt: data.publishedAt || new Date('2025-07-07T13:54:00+07:00').toISOString(),
        });
      } catch (err) {
        setError(`Lỗi tải bài viết: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
    if (slug) fetchNews();
  }, [slug]);

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
    setFormData((prev) => ({ ...prev, [name]: value, updatedAt: new Date().toISOString() }));
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
      updatedAt: new Date().toISOString(),
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
    } else if (field === 'content' && blocks[index].type === 'list') {
      blocks[index] = { ...blocks[index], [field]: value };
    } else {
      blocks[index] = { ...blocks[index], [field]: value };
    }
    setFormData((prev) => ({ ...prev, contentBlocks: blocks, updatedAt: new Date().toISOString() }));
  };

  const handleAddBlock = () => {
    setFormData((prev) => ({
      ...prev,
      contentBlocks: [
        ...prev.contentBlocks,
        {
          _id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
    setFormData((prev) => ({
      ...prev,
      contentBlocks: prev.contentBlocks.filter((_, i) => i !== index),
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    // Kiểm tra các trường bắt buộc
    if (!formData.title.trim()) {
      setError('Tiêu đề là bắt buộc.');
      setLoading(false);
      return;
    }
    if (!formData.categoryNew) {
      setError('Danh mục là bắt buộc.');
      setLoading(false);
      return;
    }
    if (!formData.thumbnail) {
      setError('Hình ảnh thumbnail là bắt buộc.');
      setLoading(false);
      return;
    }
    if (!formData.contentBlocks.length) {
      setError('Vui lòng thêm ít nhất một khối nội dung.');
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
      const processedBlocks = formData.contentBlocks.map((block) => {
        let contentToSave = block.content || '';
        if (block.type === 'list') {
          const listItems = contentToSave
            .split('\n')
            .filter((line) => line.trim())
            .map((line) => `<li>${line.trim()}</li>`)
            .join('');
          contentToSave = `<ul>${listItems}</ul>`;
        }
        return {
          _id: block._id,
          type: block.type,
          content: contentToSave,
          caption: block.caption || '',
          url: block.url instanceof File ? '' : block.url || '',
        };
      });

      const selectedCategory = categories.find((cat) => cat._id === formData.categoryNew);
      if (!selectedCategory) throw new Error('Danh mục không hợp lệ.');

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title.trim());
      formDataToSend.append('slug', generateSlug(formData.title));
      if (formData.thumbnail instanceof File) {
        formDataToSend.append('thumbnail', formData.thumbnail);
      }
      formDataToSend.append('thumbnailCaption', formData.thumbnailCaption);
      formDataToSend.append('publishedAt', formData.publishedAt);
      formDataToSend.append('views', formData.views.toString());
      formDataToSend.append('status', formData.status);
      formDataToSend.append('category-new[oid]', selectedCategory._id); // Điều chỉnh để khớp với Postman
      formDataToSend.append('contentBlocks', JSON.stringify(processedBlocks));

      // Gửi file cho contentImages
      formData.contentBlocks.forEach((block) => {
        if (block.type === 'image' && block.url instanceof File) {
          formDataToSend.append('contentImages', block.url);
        }
      });

      // Debug: Kiểm tra nội dung của formDataToSend
      console.log('FormData entries:', [...formDataToSend.entries()]);

      const url = isEditMode
        ? `${process.env.REACT_APP_API_URL}/new/${slug}`
        : `${process.env.REACT_APP_API_URL}/new/`;
      const method = isEditMode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Lỗi: ${res.statusText}`);

      alert(isEditMode ? 'Cập nhật bài viết thành công!' : 'Thêm bài viết thành công!');
      navigate('/admin/new');
    } catch (err) {
      setError(`Lỗi ${isEditMode ? 'cập nhật' : 'thêm'} bài viết: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Sidebar />
      <div className={styles.content}>
        <h1 className={styles.title}>{isEditMode ? 'Chỉnh sửa bài viết' : 'Thêm bài viết'}</h1>
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
                        <div
                          className={styles.listPreview}
                          dangerouslySetInnerHTML={{ __html: block.content ? `<ul><li>${block.content.split('\n').filter(line => line.trim()).join('</li><li>')}</li></ul>` : '<ul><li>Chưa có nội dung</li></ul>' }}
                        />
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
              {loading ? 'Đang lưu...' : isEditMode ? 'Cập nhật bài viết' : 'Thêm bài viết'}
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