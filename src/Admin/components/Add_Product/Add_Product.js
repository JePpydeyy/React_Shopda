import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar'; // Assuming Sidebar is in the same directory
import styles from './Add_Product.module.css';

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

  // Sample categories (replace with API call)
  const categories = [
    { id: '684f9ce9398a8acfc7ee1495', name_categories: 'Phong Thủy' },
    { id: '684f9cde398a8acfc7ee1492', name_categories: 'Thời trang' },
  ];

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
    setFormData({ ...formData, images: Array.from(e.target.files) });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Tên sản phẩm là bắt buộc';
    if (!formData.category) newErrors.category = 'Danh mục là bắt buộc';
    if (!formData.price || formData.price <= 0) newErrors.price = 'Giá phải lớn hơn 0';
    if (!formData.stock || formData.stock < 0) newErrors.stock = 'Tồn kho không hợp lệ';
    if (!formData.material) newErrors.material = 'Chất liệu là bắt buộc';
    formData.sizes.forEach((size, index) => {
      if (!size.size_name) newErrors[`size_name_${index}`] = 'Kích thước là bắt buộc';
      if (!size.stock || size.stock < 0) newErrors[`size_stock_${index}`] = 'Tồn kho kích thước không hợp lệ';
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Simulate API call
      console.log('Form data:', formData);
      // Reset form or redirect after successful submission
    }
  };

  return (
    <div className={styles.container}>
      <Sidebar />
      <div className={styles.content}>
        <h1 className={styles.title}>Thêm Sản Phẩm</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
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
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name_categories}</option>
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
            {errors.price && <span className={styles.error}>{errors.price}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>Tồn kho tổng</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              className={styles.input}
            />
            {errors.stock && <span className={styles.error}>{errors.stock}</span>}
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
            {errors.material && <span className={styles.error}>{errors.material}</span>}
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
                  <span className={styles.error}>{errors[`size_name_${index}`]}</span>
                )}
                {errors[`size_stock_${index}`] && (
                  <span className={styles.error}>{errors[`size_stock_${index}`]}</span>
                )}
              </div>
            ))}
            <button type="button" onClick={addSize} className={styles.addSizeButton}>
              Thêm kích thước
            </button>
          </div>

          <div className={styles.formGroup}>
            <label>Cấp độ</label>
            <input
              type="text"
              name="level"
              value={formData.level}
              onChange={handleChange}
              className={styles.input}
            />
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
              type="text"
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
            <label>Độ cứng</label>
            <input
              type="text"
              name="hardness"
              value={formData.hardness}
              onChange={handleChange}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Lợi ích tâm linh</label>
            <textarea
              name="spiritual_benefits"
              value={formData.spiritual_benefits}
              onChange={handleChange}
              className={styles.textarea}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Lợi ích sức khỏe</label>
            <textarea
              name="health_benefits"
              value={formData.health_benefits}
              onChange={handleChange}
              className={styles.textarea}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Hướng dẫn bảo quản</label>
            <textarea
              name="care_instructions"
              value={formData.care_instructions}
              onChange={handleChange}
              className={styles.textarea}
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
              <option value="hide">Ẩn</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Hình ảnh</label>
            <input
              type="file"
              multiple
              onChange={handleImageChange}
              className={styles.input}
            />
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