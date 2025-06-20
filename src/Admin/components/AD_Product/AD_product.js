import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../Sidebar/Sidebar';
import styles from './Product.module.css';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editProduct, setEditProduct] = useState(null);
  const productsPerPage = 5;

  // Form state for editing
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    material: '',
    sizes: [{ size_name: '', stock: '' }],
    level: '',
    Collection: '',
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
  const [formErrors, setFormErrors] = useState({});

  // Assume token is stored in localStorage
  const token = localStorage.getItem('token');

  // Fetch products with pagination
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `https://api-tuyendung-cty.onrender.com/api/product?page=${currentPage}&limit=${productsPerPage}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );
        const productList = response.data;
        setProducts(productList);
        setTotalPages(Math.ceil(100 / productsPerPage));

        const uniqueCategories = [
          ...new Map(
            productList.map((product) => [product.category.id, product.category])
          ).values(),
        ];
        setCategories(uniqueCategories);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.message || 'Không thể tải dữ liệu sản phẩm');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentPage, token]);

  // Filter products
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (categoryFilter === 'all' ||
        product.category.name_categories === categoryFilter) &&
      (statusFilter === 'all' || product.status === statusFilter)
  );

  const statuses = [...new Set(products.map((p) => p.status))];

  // Pagination controls
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setExpandedRow(null);
    }
  };

  // Generate pagination buttons (show 3 pages at a time)
  const getPaginationButtons = () => {
    const buttons = [];
    const maxButtons = 3;

    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage < maxButtons - 1) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    if (startPage > 1) {
      buttons.push(
        <button
          key="first"
          onClick={() => handlePageChange(1)}
          className={styles.pageButton}
        >
          1
        </button>
      );
      if (startPage > 2) {
        buttons.push(<span key="start-ellipsis" className={styles.ellipsis}>...</span>);
      }
    }

    for (let page = startPage; page <= endPage; page++) {
      buttons.push(
        <button
          key={page}
          onClick={() => handlePageChange(page)}
          className={`${styles.pageButton} ${
            currentPage === page ? styles.activePage : ''
          }`}
        >
          {page}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(<span key="end-ellipsis" className={styles.ellipsis}>...</span>);
      }
      buttons.push(
        <button
          key="last"
          onClick={() => handlePageChange(totalPages)}
          className={styles.pageButton}
        >
          {totalPages}
        </button>
      );
    }

    return buttons;
  };

  // Toggle row for details
  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  // Open edit modal
  const handleEdit = (product) => {
    setEditProduct(product);
    setFormData({
      name: product.name,
      category: product.category.id,
      price: product.price || '',
      stock: product.stock || 0,
      material: product.material || '',
      sizes:
        product.size && product.size.length > 0
          ? product.size.map((s) => ({
              size_name: s.size_name,
              stock: s.stock || 0,
            }))
          : [{ size_name: '', stock: '' }],
      level: product.level || '',
      Collection: product.Collection || '',
      element: product.element || '',
      tag: product.tag || '',
      short_description: product.short_description || '',
      description: product.description || '',
      weight: product.weight || '',
      origin: product.origin || '',
      hardness: product.hardness || '',
      spiritual_benefits: product.spiritual_benefits?.join('\n') || '',
      health_benefits: product.health_benefits?.join('\n') || '',
      care_instructions: product.care_instructions?.join('\n') || '',
      status: product.status || 'show',
      images: [],
    });
  };

  // Close edit modal
  const closeModal = () => {
    setEditProduct(null);
    setFormData({
      name: '',
      category: '',
      price: '',
      stock: '',
      material: '',
      sizes: [{ size_name: '', stock: '' }],
      level: '',
      Collection: '',
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
    setFormErrors({});
  };

  // Handle form changes
  const handleFormChange = (e) => {
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

  // Delete existing image
  const deleteExistingImage = async (imagePath, index) => {
    if (!window.confirm('Bạn có chắc muốn xóa ảnh này?')) return;

    try {
      await axios.delete(
        `https://api-tuyendung-cty.onrender.com/api/product/${editProduct._id}/image`,
        {
          headers: { Authorization: `Bearer ${token}` },
          data: { imagePath },
        }
      );

      const updatedImages = editProduct.images.filter((_, i) => i !== index);
      setEditProduct({ ...editProduct, images: updatedImages });
      setProducts(
        products.map((p) =>
          p._id === editProduct._id ? { ...p, images: updatedImages } : p
        )
      );
    } catch (err) {
      console.error('Error deleting image:', err);
      setFormErrors({
        api: err.response?.data?.message || 'Không thể xóa ảnh',
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!formData.name) errors.name = 'Tên sản phẩm là bắt buộc';
    if (!formData.category) errors.category = 'Danh mục là bắt buộc';
    if (!formData.price || formData.price <= 0) errors.price = 'Giá phải lớn hơn 0';
    if (!formData.stock || formData.stock < 0) errors.stock = 'Tồn kho không hợp lệ';
    if (!formData.material) errors.material = 'Chất liệu là bắt buộc';
    if (!formData.level) errors.level = 'Cấp độ là bắt buộc';
    formData.sizes.forEach((size, index) => {
      if (!size.size_name)
        errors[`size_name_${index}`] = 'Kích thước là bắt buộc';
      if (!size.stock || size.stock < 0)
        errors[`size_stock_${index}`] = 'Tồn kho kích thước không hợp lệ';
    });
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append(
        'category',
        JSON.stringify({
          id: formData.category,
          name_categories: categories.find((c) => c.id === formData.category)
            ?.name_categories,
        })
      );
      formDataToSend.append('price', formData.price);
      formDataToSend.append('stock', formData.stock);
      formDataToSend.append('material', formData.material);
      formDataToSend.append('size', JSON.stringify(formData.sizes));
      formDataToSend.append('level', formData.level);
      formDataToSend.append('Collection', formData.Collection);
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
      formData.images.forEach((image, index) => {
        formDataToSend.append('images', image);
      });

      const response = await axios.put(
        `https://api-tuyendung-cty.onrender.com/api/product/${editProduct._id}`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProducts(
        products.map((p) =>
          p._id === editProduct._id ? response.data.product : p
        )
      );
      closeModal();
    } catch (err) {
      console.error('Error updating product:', err);
      setFormErrors({
        api: err.response?.data?.message || 'Không thể cập nhật sản phẩm',
      });
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      try {
        await axios.delete(
          `https://api-tuyendung-cty.onrender.com/api/product/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setProducts(products.filter((product) => product._id !== id));
      } catch (err) {
        console.error('Error deleting product:', err);
        setError(err.response?.data?.message || 'Không thể xóa sản phẩm');
      }
    }
  };

  // Calculate total stock
  const calculateTotalStock = (product) => {
    const sizeStock = product.size.reduce(
      (total, size) => total + (size.stock || 0),
      0
    );
    return (product.stock || 0) + sizeStock;
  };

  if (loading) return <div className={styles.loading}>Đang tải...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.container}>
      <Sidebar />
      <div className={styles.content}>
        <h1 className={styles.title}>Quản Lý Sản Phẩm</h1>

        {/* Search and Filters */}
        <div className={styles.searchFilter}>
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className={styles.filterSelect}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">Tất cả danh mục</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name_categories}>
                {cat.name_categories}
              </option>
            ))}
          </select>
          <select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status === 'show' ? 'Hiển thị' : status === 'hidden' ? 'Ẩn' : 'Sale'}
              </option>
            ))}
          </select>
          <Link to="/admin/add_product" className={styles.addButton}>
            Thêm Sản Phẩm
          </Link>
        </div>

        {/* Product Table */}
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHeader}>
                <th>Hình ảnh</th>
                <th>Tên</th>
                <th>Danh mục</th>
                <th>Tổng tồn kho</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <React.Fragment key={product._id}>
                  <tr
                    className={styles.tableRow}
                    onClick={() => toggleRow(product._id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={`https://api-tuyendung-cty.onrender.com/${product.images[0]}`}
                          alt={product.name}
                          className={styles.tableImage}
                        />
                      ) : (
                        'Không có ảnh'
                      )}
                    </td>
                    <td>{product.name}</td>
                    <td>{product.category.name_categories}</td>
                    <td>{calculateTotalStock(product)}</td>
                    <td>
                      {product.status === 'show'
                        ? 'Hiển thị'
                        : product.status === 'hidden'
                        ? 'Ẩn'
                        : 'Sale'}
                    </td>
                    <td>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(product);
                        }}
                        className={styles.actionButton}
                      >
                        Sửa
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(product._id);
                        }}
                        className={`${styles.actionButton} ${styles.deleteButton}`}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                  {expandedRow === product._id && (
                    <tr className={styles.detailRow}>
                      <td colSpan="6">
                        <div className={styles.detailContainer}>
                          <h3>Chi tiết sản phẩm: {product.name}</h3>
                          <p><strong>Giá:</strong> {product.price.toLocaleString()} VNĐ</p>
                          <p><strong>Chất liệu:</strong> {product.material}</p>
                          <p><strong>Cấp độ:</strong> {product.level}</p>
                          <p><strong>Bộ sưu tập:</strong> {product.Collection}</p>
                          <p><strong>Nguyên tố:</strong> {product.element}</p>
                          <p><strong>Thẻ:</strong> {product.tag}</p>
                          <p><strong>Mô tả ngắn:</strong> {product.short_description}</p>
                          <p><strong>Mô tả chi tiết:</strong> {product.description}</p>
                          <p><strong>Khối lượng:</strong> {product.weight}</p>
                          <p><strong>Nguồn gốc:</strong> {product.origin}</p>
                          <p><strong>Độ cứng:</strong> {product.hardness}</p>
                          <p><strong>Lợi ích tâm linh:</strong></p>
                          <ul>
                            {product.spiritual_benefits.map((benefit, index) => (
                              <li key={index}>{benefit}</li>
                            ))}
                          </ul>
                          <p><strong>Lợi ích sức khỏe:</strong></p>
                          <ul>
                            {product.health_benefits.map((benefit, index) => (
                              <li key={index}>{benefit}</li>
                            ))}
                          </ul>
                          <p><strong>Hướng dẫn bảo quản:</strong></p>
                          <ul>
                            {product.care_instructions.map((instruction, index) => (
                              <li key={index}>{instruction}</li>
                            ))}
                          </ul>
                          <p><strong>Tồn kho theo kích thước:</strong></p>
                          <ul>
                            {product.size.map((size, index) => (
                              <li key={size._id}>
                                {size.size_name}: {size.stock || 0} đơn vị
                              </li>
                            ))}
                          </ul>
                          <p><strong>Lượt xem:</strong> {product.views}</p>
                          <p><strong>Lượt mua:</strong> {product.purchases}</p>
                          <p>
                            <strong>Ngày tạo:</strong>{' '}
                            {new Date(product.createdAt).toLocaleDateString()}
                          </p>
                          <p><strong>Hình ảnh:</strong></p>
                          <div className={styles.imageContainer}>
                            {product.images.map((image, index) => (
                              <img
                                key={index}
                                src={`https://api-tuyendung-cty.onrender.com/${image}`}
                                alt={`${product.name} ${index + 1}`}
                                className={styles.productImage}
                              />
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className={styles.pagination}>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={styles.pageButton}
          >
            Trước
          </button>
          {getPaginationButtons()}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={styles.pageButton}
          >
            Sau
          </button>
        </div>

        {/* Edit Modal */}
        {editProduct && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h2>Sửa Sản Phẩm: {editProduct.name}</h2>
              {formErrors.api && <span className={styles.error}>{formErrors.api}</span>}
              <form onSubmit={handleFormSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                  <label>Hình ảnh hiện tại</label>
                  <div className={styles.imageContainer}>
                    {editProduct.images && editProduct.images.length > 0 ? (
                      editProduct.images.map((image, index) => (
                        <div key={index} className={styles.existingImageWrapper}>
                          <img
                            src={`https://api-tuyendung-cty.onrender.com/${image}`}
                            alt={`${editProduct.name} ${index + 1}`}
                            className={styles.productImage}
                          />
                          <button
                            type="button"
                            onClick={() => deleteExistingImage(image, index)}
                            className={styles.deleteExistingImageButton}
                          >
                            Xóa
                          </button>
                        </div>
                      ))
                    ) : (
                      <span>Không có ảnh</span>
                    )}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Thêm/Thay thế hình ảnh</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Xem trước hình ảnh mới</label>
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
                      <span>Chưa chọn ảnh mới</span>
                    )}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Tên sản phẩm</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    className={styles.input}
                  />
                  {formErrors.name && (
                    <span className={styles.error}>{formErrors.name}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label>Danh mục</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleFormChange}
                    className={styles.select}
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name_categories}
                      </option>
                    ))}
                  </select>
                  {formErrors.category && (
                    <span className={styles.error}>{formErrors.category}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label>Giá (VNĐ)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleFormChange}
                    className={styles.input}
                  />
                  {formErrors.price && (
                    <span className={styles.error}>{formErrors.price}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label>Tồn kho tổng</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleFormChange}
                    className={styles.input}
                  />
                  {formErrors.stock && (
                    <span className={styles.error}>{formErrors.stock}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label>Chất liệu</label>
                  <input
                    type="text"
                    name="material"
                    value={formData.material}
                    onChange={handleFormChange}
                    className={styles.input}
                  />
                  {formErrors.material && (
                    <span className={styles.error}>{formErrors.material}</span>
                  )}
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
                      {formErrors[`size_name_${index}`] && (
                        <span className={styles.error}>
                          {formErrors[`size_name_${index}`]}
                        </span>
                      )}
                      {formErrors[`size_stock_${index}`] && (
                        <span className={styles.error}>
                          {formErrors[`size_stock_${index}`]}
                        </span>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addSize}
                    className={styles.addSizeButton}
                  >
                    Thêm kích thước
                  </button>
                </div>

                <div className={styles.formGroup}>
                  <label>Cấp độ</label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleFormChange}
                    className={styles.select}
                  >
                    <option value="">Chọn cấp độ</option>
                    <option value="Cao Cấp">Cao Cấp</option>
                    <option value="Trung Cấp">Trung Cấp</option>
                    <option value="Phổ Thông">Phổ Thông</option>
                  </select>
                  {formErrors.level && (
                    <span className={styles.error}>{formErrors.level}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label>Bộ sưu tập</label>
                  <input
                    type="text"
                    name="Collection"
                    value={formData.Collection}
                    onChange={handleFormChange}
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Nguyên tố</label>
                  <input
                    type="text"
                    name="element"
                    value={formData.element}
                    onChange={handleFormChange}
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Thẻ</label>
                  <input
                    type="text"
                    name="tag"
                    value={formData.tag}
                    onChange={handleFormChange}
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Mô tả ngắn</label>
                  <textarea
                    name="short_description"
                    value={formData.short_description}
                    onChange={handleFormChange}
                    className={styles.textarea}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Mô tả chi tiết</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    className={styles.textarea}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Khối lượng</label>
                  <input
                    type="text"
                    name="weight"
                    value={formData.weight}
                    onChange={handleFormChange}
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Nguồn gốc</label>
                  <input
                    type="text"
                    name="origin"
                    value={formData.origin}
                    onChange={handleFormChange}
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Độ cứng</label>
                  <input
                    type="text"
                    name="hardness"
                    value={formData.hardness}
                    onChange={handleFormChange}
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Lợi ích tâm linh (mỗi dòng một lợi ích)</label>
                  <textarea
                    name="spiritual_benefits"
                    value={formData.spiritual_benefits}
                    onChange={handleFormChange}
                    className={styles.textarea}
                    placeholder="Nhập mỗi lợi ích trên một dòng"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Lợi ích sức khỏe (mỗi dòng một lợi ích)</label>
                  <textarea
                    name="health_benefits"
                    value={formData.health_benefits}
                    onChange={handleFormChange}
                    className={styles.textarea}
                    placeholder="Nhập mỗi lợi ích trên một dòng"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Hướng dẫn bảo quản (mỗi dòng một hướng dẫn)</label>
                  <textarea
                    name="care_instructions"
                    value={formData.care_instructions}
                    onChange={handleFormChange}
                    className={styles.textarea}
                    placeholder="Nhập mỗi hướng dẫn trên một dòng"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Trạng thái</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    className={styles.select}
                  >
                    <option value="show">Hiển thị</option>
                    <option value="hidden">Ẩn</option>
                    <option value="sale">Sale</option>
                  </select>
                </div>

                <div className={styles.formActions}>
                  <button type="submit" className={styles.submitButton}>
                    Cập nhật
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className={styles.cancelButton}
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductManagement;