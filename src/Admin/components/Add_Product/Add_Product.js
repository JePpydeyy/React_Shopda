import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../Sidebar/Sidebar';
import styles from './AddProduct.module.css';

const AddProduct = () => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    material: '',
    sizes: [{ size_name: '', stock: '' }],
    level: '',
    collection: '',
    element: '',
    tag: '',
    short_description: '',
    description: '',
    weight: '',
    origin: '',
    hardness: '',
    spiritual_benefits: '',
    health_benefits: '',
    care_instructions: '',
    status: 'show',
    images: [],
  });

  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('https://api-tuyendung-cty.onrender.com/api/category', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setCategories(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setApiError(err.response?.data?.message || 'Không thể tải danh mục');
        setLoading(false);
      }
    };
    fetchCategories();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSizeChange = (index, e) => {
    const { name, value } = e.target;
    const newSizes = [...formData.sizes];
    newSizes[index] = { ...newSizes[index], [name]: value };
    setFormData({ ...formData, sizes: newSizes });
  };

  const addSize = () => {
    setFormData({
      ...formData,
      sizes: [...formData.sizes, { size_name: '', stock: '' }],
    });
  };

  const removeSize = (index) => {
    const newSizes = formData.sizes.filter((_, i) => i !== index);
    setFormData({ ...formData, sizes: newSizes });
  };

  const handleImageChange = (e) => {
    const newImages = Array.from(e.target.files);
    setFormData({ ...formData, images: [...formData.images, ...newImages] });
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Tên sản phẩm là bắt buộc';
    if (!formData.category) newErrors.category = 'Danh mục là bắt buộc';
    if (!formData.price || formData.price <= 0) newErrors.price = 'Giá phải lớn hơn 0';
    if (!formData.stock || formData.stock < 0) newErrors.stock = 'Tồn kho không hợp lệ';
    if (!formData.material) newErrors.material = 'Chất liệu là bắt buộc';
    if (!formData.level) newErrors.level = 'Cấp độ là bắt buộc';
    if (!formData.images.length) newErrors.images = 'Cần ít nhất một hình ảnh';
    formData.sizes.forEach((size, index) => {
      if (!size.size_name) newErrors[`size_name_${index}`] = 'Kích thước là bắt buộc';
      if (!size.stock || size.stock < 0) newErrors[`size_stock_${index}`] = 'Tồn kho kích thước không hợp lệ';
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('slug', generateSlug(formData.name));
      formDataToSend.append(
        'category',
        JSON.stringify({
          id: formData.category,
          name_categories: categories.find((c) => c._id === formData.category)?.category,
        })
      );
      formDataToSend.append('price', formData.price);
      formDataToSend.append('stock', formData.stock);
      formDataToSend.append('material', formData.material);
      formDataToSend.append('size', JSON.stringify(formData.sizes));
      formDataToSend.append('level', formData.level);
      formDataToSend.append('Collection', formData.collection);
      formDataToSend.append('element', formData.element);
      formDataToSend.append('tag', formData.tag);
      formDataToSend.append('short_description', formData.short_description);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('weight', formData.weight);
      formDataToSend.append('origin', formData.origin);
      formDataToSend.append('hardness', formData.hardness);
      formDataToSend.append(
        'spiritual_benefits',
        JSON.stringify(
          formData.spiritual_benefits
            .split('\n')
            .map((s) => s.trim())
            .filter((s) => s)
        )
      );
      formDataToSend.append(
        'health_benefits',
        JSON.stringify(
          formData.health_benefits
            .split('\n')
            .map((s) => s.trim())
            .filter((s) => s)
        )
      );
      formDataToSend.append(
        'care_instructions',
        JSON.stringify(
          formData.care_instructions
            .split('\n')
            .map((s) => s.trim())
            .filter((s) => s)
        )
      );
      formDataToSend.append('status', formData.status);
      formData.images.forEach((image) => {
        formDataToSend.append('images', image);
      });

      const response = await axios.post(
        'https://api-tuyendung-cty.onrender.com/api/product',
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Product created:', response.data);
      navigate('/admin/products');
    } catch (err) {
      console.error('Error creating product:', err);
      setApiError(err.response?.data?.error || 'Không thể tạo sản phẩm');
    }
  };

  if (loading) return <div className={styles.loading}>Đang tải...</div>;
  if (apiError) return <div className={styles.error}>{apiError}</div>;

  return (
    <div className={styles.container}>
      <Sidebar />
      <div className={styles.content}>
        <h1 className={styles.title}>Thêm Sản Phẩm</h1>
        {apiError && <div className={styles.error}>{apiError}</div>}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Hình ảnh</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className={styles.input}
            />
            {errors.images && <span className={styles.error}>{errors.images}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>Xem trước hình ảnh</label>
            <div className={styles.imageContainer}>
              {formData.images.length > 0 ? (
                formData.images.map((image, index) => (
                  <div key={index} className={styles.imagePreviewWrapper}>
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Preview ${index + 1}`}
                      className={styles.productImage}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className={styles.removeImageButton}
                    >
                      Xóa
                    </button>
                  </div>
                ))
              ) : (
                <span>Chưa chọn ảnh</span>
              )}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Tên sản phẩm</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={styles.input}
            />
            {errors.name && <span className={styles.error}>{errors.name}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>Danh mục</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={styles.select}
            >
              <option value="">Chọn danh mục</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.category}
                </option>
              ))}
            </select>
            {errors.category && <span className={styles.error}>{errors.category}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>Giá (VNĐ)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className={styles.input}
            />
            {errors.price && <p className={styles.error}>{errors.price}</p>}
          </div>

          <div className={styles.formGroup}>
            <label>Tồn kho</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              className={styles.input}
            />
            {errors.stock && <p className={styles.error}>{errors.stock}</p>}
          </div>

          <div className={styles.formGroup}>
            <label>Chất liệu</label>
            <input
              type="text"
              name="material"
              value={formData.material}
              onChange={handleChange}
              className={styles.input}
            />
            {errors.material && <p className={styles.error}>{errors.material}</p>}
          </div>

          <div className={styles.formGroup}>
            <label>Kích thước</label>
            {formData.sizes.map((size, index) => (
              <div key={index} className={styles.sizeGroup}>
                <input
                  type="text"
                  name="size_name"
                  placeholder="Kích thước (e.g., 12 cm)"
                  value={size.size_name}
                  onChange={(e) => handleSizeChange(index, e)}
                  className={styles.input}
                />
                <input
                  type="number"
                  name="stock"
                  placeholder="Tồn kho"
                  value={size.stock}
                  onChange={(e) => handleSizeChange(index, e)}
                  className={styles.input}
                />
                {formData.sizes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSize(index)}
                    className={styles.removeButton}
                  >
                    Xóa
                  </button>
                )}
                {errors[`size_name_${index}`] && (
                  <p className={styles.error}>{errors[`size_name_${index}`]}</p>
                )}
                {errors[`size_stock_${index}`] && (
                  <p className={styles.error}>{errors[`size_stock_${index}`]}</p>
                )}
              </div>
            ))}
            <button type="button" onClick={addSize} className={styles.addSizeButton}>
              Thêm kích thước
            </button>
          </div>

          <div className={styles.formGroup}>
            <label>Cấp độ</label>
            <select
              name="level"
              value={formData.level}
              onChange={handleChange}
              className={styles.select}
            >
              <option value="">Chọn cấp độ</option>
              <option value="Cao Cấp">Cao Cấp</option>
              <option value="Trung Cấp">Trung Cấp</option>
              <option value="Phổ Thông">Phổ Thông</option>
            </select>
            {errors.level && <p className={styles.error}>{errors.level}</p>}
          </div>

          <div className={styles.formGroup}>
            <label>Bộ sưu tập</label>
            <input
              type="text"
              name="collection"
              value={formData.collection}
              onChange={handleChange}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Nguyên tố</label>
            <input
              type="text"
              name="element"
              value={formData.element}
              onChange={handleChange}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Thẻ</label>
            <input
              name="tag"
              value={formData.tag}
              onChange={handleChange}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Mô tả ngắn</label>
            <textarea
              name="short_description"
              value={formData.short_description}
              onChange={handleChange}
              className={styles.textarea}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Mô tả chi tiết</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={styles.textarea}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Khối lượng</label>
            <input
              type="text"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Nguồn gốc</label>
            <input
              type="text"
              name="origin"
              value={formData.origin}
              onChange={handleChange}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Độ cứng nhắc</label>
            <input
              type="text"
              name="hardness"
              value={formData.hardness}
              onChange={handleChange}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Lợi ích tâm linh (mỗi dòng một lợi ích)</label>
            <textarea
              name="spiritual_benefits"
              value={formData.spiritual_benefits}
              onChange={handleChange}
              placeholder="Nhập từng lợi ích trên một dòng"
              className={styles.textarea}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Lợi ích sức khỏe (mỗi dòng một lợi ích)</label>
            <textarea
              name="health_benefits"
              value={formData.health_benefits}
              onChange={handleChange}
              placeholder="Nhập từng lợi ích trên một dòng"
              className={styles.textarea}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Hướng dẫn bảo quản (mỗi dòng một hướng dẫn)</label>
            <textarea
              name="care_instructions"
              value={formData.care_instructions}
              onChange={handleChange}
              placeholder="Nhập từng hướng dẫn trên một dòng"
              className={styles.text_area}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Trạng thái</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={styles.select}
            >
              <option value="show">Hiển thị</option>
              <option value="hidden">Ẩn</option>
              <option value="sale">Sale</option>
            </select>
          </div>

          <div className={styles.formActions}>
            <button type="submit" className={styles.submitButton}>
              Thêm Sản Phẩm
            </button>
            <Link to="/admin/products" className={styles.cancelButton}>
              Hủy
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;