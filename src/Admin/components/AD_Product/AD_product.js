import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../Sidebar/Sidebar';
import styles from './Product.module.css';

// Reusable TooltipButton component
const TooltipButton = React.memo(({ field, children, activeTooltip, setActiveTooltip, guide }) => (
  <div className={styles.fieldWithTooltip}>
    <div className={styles.labelContainer}>
      <label>{children}</label>
      <button
        type="button"
        className={styles.tooltipButton}
        onMouseEnter={() => setActiveTooltip(field)}
        onMouseLeave={() => setActiveTooltip(null)}
        onClick={() => setActiveTooltip(activeTooltip === field ? null : field)}
      >
        ?
      </button>
    </div>
    {activeTooltip === field && (
      <div className={styles.tooltip}>
        <div className={styles.tooltipContent}>
          {guide}
        </div>
      </div>
    )}
  </div>
));

// Tooltip guides
const fieldGuides = {
  name: "Nhập tên sản phẩm rõ ràng, cụ thể. VD: 'Vòng tay Thạch Anh Hồng'",
  category: "Chọn danh mục phù hợp nhất với sản phẩm của bạn",
  price: "Nhập giá bán lẻ tính bằng VNĐ. VD: 150000 (không có dấu phẩy)",
  sizes: "Thêm các kích thước và tồn kho. VD: 12cm (vòng tay) hoặc 50*14*33cm (tượng phong thủy)",
  level: "Phân loại: Cao Cấp, Trung Cấp, Phổ biến",
  element: "Nguyên tố phong thủy: Thổ, Kim, Mộc, Hỏa, Thủy",
  tag: "Sale: Giảm giá | New: Sản phẩm mới",
  short_description: "Mô tả ngắn gọn (100-150 ký tự)",
  description: "Mô tả chi tiết: nguồn gốc, khối lượng, lợi ích, bảo quản...",
  // weight: "Khối lượng sản phẩm (gram hoặc kg)",
  images: "Chọn tối đa 10 ảnh chất lượng cao (JPEG, PNG, GIF)",
  status: "Hiển thị: Hiện trên website | Ẩn: Không hiện | Sale: Đang giảm giá",
  purchases: "Số lượng đã bán (mặc định 0, không âm)",
};

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
  const [editProduct, setEditProduct] = useState(null);
  const [oldImages, setOldImages] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    size: [{ size_name: '', stock: '' }],
    level: '',
    element: '',
    tag: '',
    short_description: '',
    description: '',
    weight: '1', // <-- mặc định là 1
    status: 'show',
    images: [],
  });
  const [formErrors, setFormErrors] = useState({});
  const [activeButtons, setActiveButtons] = useState(new Set());
  const [activeTooltip, setActiveTooltip] = useState(null);
  const editorRef = useRef(null);
  const token = localStorage.getItem('adminToken');
  const productsPerPage = 9;

  // Memoized filtered products
  const filteredProducts = useMemo(() => {
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (categoryFilter === 'all' || product.category.name_categories === categoryFilter) &&
        (statusFilter === 'all' || product.status === statusFilter)
    );
  }, [products, searchTerm, categoryFilter, statusFilter]);

  // Memoized pagination data
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice(
      (currentPage - 1) * productsPerPage,
      currentPage * productsPerPage
    );
  }, [filteredProducts, currentPage]);

  // Fetch products and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `https://api-tuyendung-cty.onrender.com/api/product?limit=1000`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );
        const productList = response.data;
        setProducts(productList);
        const uniqueCategories = [
          ...new Map(productList.map((p) => [p.category.id, p.category])).values(),
        ];
        setCategories(uniqueCategories);
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải dữ liệu sản phẩm');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  // Update toolbar state
  const updateToolbarState = useCallback(() => {
    const newActiveButtons = new Set();
    try {
      const selection = window.getSelection();
      if (selection.rangeCount > 0 && editorRef.current?.contains(selection.anchorNode)) {
        if (document.queryCommandState('bold')) newActiveButtons.add('bold');
        if (document.queryCommandState('italic')) newActiveButtons.add('italic');
        if (document.queryCommandState('underline')) newActiveButtons.add('underline');
        if (document.queryCommandState('strikeThrough')) newActiveButtons.add('strikeThrough');
        if (document.queryCommandState('insertUnorderedList')) newActiveButtons.add('list_ul');
        if (document.queryCommandState('insertOrderedList')) newActiveButtons.add('list_ol');
      }
    } catch (error) {
      console.warn('Error checking command state:', error);
    }
    setActiveButtons(newActiveButtons);
  }, []);

  // Selection change listener
  useEffect(() => {
    const handleSelectionChange = () => {
      if (document.activeElement === editorRef.current) {
        updateToolbarState();
      }
    };
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [updateToolbarState]);

  // Sync editor content ONLY when opening modal (editProduct changes)
  useEffect(() => {
    if (editProduct && editorRef.current) {
      editorRef.current.innerHTML = formData.description || '';
    }
    // eslint-disable-next-line
  }, [editProduct]);

  // Form handling
  const handleFormChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSizeChange = useCallback((index, e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newSizes = [...prev.size];
      newSizes[index] = { ...newSizes[index], [name]: value };
      return { ...prev, size: newSizes };
    });
  }, []);

  const addSize = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      size: [...prev.size, { size_name: '', stock: '' }],
    }));
  }, []);

  const removeSize = useCallback((index) => {
    setFormData((prev) => ({
      ...prev,
      size: prev.size.filter((_, i) => i !== index),
    }));
  }, []);

  const handleImageChange = useCallback((e) => {
    const newImages = Array.from(e.target.files);
    const totalImages = (oldImages?.length || 0) + formData.images.length + newImages.length;
    if (totalImages > 4) {
      alert('Tổng số ảnh không được vượt quá 4.');
      return;
    }
    setFormData((prev) => ({ ...prev, images: [...prev.images, ...newImages] }));
  }, [formData.images, oldImages]);

  const removeImage = useCallback((index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  }, []);

  const deleteExistingImage = useCallback((index) => {
    setOldImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const execCommand = useCallback((command, value = null) => {
    try {
      if (editorRef.current) {
        editorRef.current.focus();
        document.execCommand(command, false, value);
        updateToolbarState();
      }
    } catch (error) {
      console.error('Error executing command:', error);
    }
  }, [updateToolbarState]);

  const handleDescriptionChange = useCallback(() => {
    if (editorRef.current) {
      setFormData((prev) => ({
        ...prev,
        description: editorRef.current.innerHTML,
      }));
    }
  }, []);

  const insertList = useCallback((type) => {
    const command = type === 'ul' ? 'insertUnorderedList' : 'insertOrderedList';
    execCommand(command);
  }, [execCommand]);

  const changeFontSize = useCallback((size) => {
    if (size) execCommand('fontSize', size);
  }, [execCommand]);

  const changeFontFamily = useCallback((font) => {
    if (font) execCommand('fontName', font);
  }, [execCommand]);

  const insertHeading = useCallback((level) => {
    if (level) execCommand('formatBlock', `<h${level}>`);
  }, [execCommand]);

  const handleEditorFocus = useCallback(() => {
    setTimeout(updateToolbarState, 10);
  }, [updateToolbarState]);

  const validateForm = useCallback(() => {
    const errors = {};
    if (!formData.name) errors.name = 'Tên sản phẩm là bắt buộc';
    if (!formData.category) errors.category = 'Danh mục là bắt buộc';
    if (!formData.price || formData.price <= 0) errors.price = 'Giá phải lớn hơn 0';
    if (!formData.stock && formData.stock !== 0) errors.stock = 'Tồn kho không hợp lệ';
    formData.size.forEach((size, index) => {
      if (!size.size_name) errors[`size_name_${index}`] = 'Kích thước là bắt buộc';
      if (!size.stock && size.stock !== 0) errors[`size_stock_${index}`] = 'Tồn kho kích thước không hợp lệ';
    });
    if ((oldImages?.length || 0) + formData.images.length === 0) {
      errors.images = 'Cần ít nhất một hình ảnh';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, oldImages]);

  const handleFormSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      const categoryObj = categories.find((cat) => cat.id === formData.category);
      formDataToSend.append('category', JSON.stringify(categoryObj));
      formDataToSend.append('price', formData.price);
      formDataToSend.append('stock', formData.stock);
      formDataToSend.append('size', JSON.stringify(formData.size));
      formDataToSend.append('level', formData.level);
      formDataToSend.append('element', formData.element);
      formDataToSend.append('tag', formData.tag);
      formDataToSend.append('short_description', formData.short_description);
      formDataToSend.append('weight', formData.weight);
      formDataToSend.append('status', formData.status);
      formDataToSend.append('description', editorRef.current?.innerHTML || '');

      oldImages.forEach((img) => formDataToSend.append('images', img));
      formDataToSend.append('oldImages', JSON.stringify(oldImages)); // Gửi danh sách ảnh cũ còn giữ lại
      formData.images.forEach((image) => formDataToSend.append('images', image)); // Gửi file ảnh mới

      const response = await axios.put(
        `https://api-tuyendung-cty.onrender.com/api/product/${editProduct.slug}`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProducts((prev) =>
        prev.map((p) => (p._id === editProduct._id ? response.data.product : p))
      );
      closeModal();
    } catch (err) {
      setFormErrors({
        api: err.response?.data?.error || err.response?.data?.message || 'Không thể cập nhật sản phẩm',
      });
    }
  }, [formData, editProduct, oldImages, categories, token, validateForm]);

  const handleEdit = useCallback((product) => {
    setEditProduct(product);
    setOldImages(product.images || []);
    setFormData({
      name: product.name || '',
      category: product.category?.id || '',
      price: product.price || '',
      stock: product.stock || 0,
      size:
        product.size?.length > 0
          ? product.size.map((s) => ({
              size_name: s.size_name || '',
              stock: s.stock || 0,
            }))
          : [{ size_name: '', stock: '' }],
      level: product.level || '',
      element: product.element || '',
      tag: product.tag || '',
      short_description: product.short_description || '',
      weight: product.weight || '',
      status: product.status || 'show',
      description: product.description || '',
      images: [], // Initialize with empty array to append new images
    });
  }, []);

  const closeModal = useCallback(() => {
    setEditProduct(null);
    setFormData({
      name: '',
      category: '',
      price: '',
      stock: '',
      size: [{ size_name: '', stock: '' }],
      level: '',
      element: '',
      tag: '',
      short_description: '',
      description: '',
      weight: '1',
      status: 'show',
      images: [],
    });
    setFormErrors({});
    setActiveButtons(new Set());
    setActiveTooltip(null);
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
    }
  }, []);

  const handlePageChange = useCallback((page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setExpandedRow(null);
    }
  }, [totalPages]);

  const getPaginationButtons = useCallback(() => {
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
          className={`${styles.pageButton} ${currentPage === page ? styles.activePage : ''}`}
        >
          {page}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(<span key="endPage-ellipsis" className={styles.ellipsis}>...</span>);
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
  }, [currentPage, totalPages, handlePageChange]);

  const toggleRow = useCallback((id) => {
    setExpandedRow((prev) => (prev === id ? null : id));
  }, []);

  const handleDelete = useCallback(async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      try {
        await axios.delete(
          `https://api-tuyendung-cty.onrender.com/api/product/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setProducts((prev) => prev.filter((p) => p._id !== id));
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể xóa sản phẩm');
      }
    }
  }, [token]);

  const toggleStatus = useCallback(async (product) => {
    const newStatus = product.status === 'show' ? 'hidden' : 'show';
    try {
      await axios.patch(
        `https://api-tuyendung-cty.onrender.com/api/product/${product.slug}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProducts((prev) =>
        prev.map((p) => (p._id === product._id ? { ...p, status: newStatus } : p))
      );
    } catch (err) {
      alert('Không thể đổi trạng thái sản phẩm');
    }
  }, [token]);

  const calculateTotalStock = useCallback((product) => {
    return product.size.reduce((total, size) => total + (size.stock || 0), 0);
  }, []);

  if (loading) return <div className={styles.loading}>Đang tải...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.container}>
      <Sidebar />
      <div className={styles.content}>
        <h1 className={styles.title}>Quản Lý Sản Phẩm</h1>
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
            {[...new Set(products.map((p) => p.status))].map((status) => (
              <option key={status} value={status}>
                {status === 'show' ? 'Hiển thị' : status === 'hidden' ? 'Ẩn' : 'Sale'}
              </option>
            ))}
          </select>
          <Link to="/admin/add_product" className={styles.addButton}>
            Thêm Sản Phẩm
          </Link>
        </div>
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
              {paginatedProducts.map((product) => (
                <React.Fragment key={product._id}>
                  <tr
                    className={styles.tableRow}
                    onClick={() => toggleRow(product._id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      {product.images?.length > 0 ? (
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
                          toggleStatus(product);
                        }}
                        className={`${styles.actionButton} ${styles.deleteButton}`}
                      >
                        {product.status === 'show' ? 'Ẩn' : 'Hiện'}
                      </button>
                    </td>
                  </tr>
                  {expandedRow === product._id && (
                    <tr className={styles.detailRow}>
                      <td colSpan="6">
                        <div className={styles.detailContainer}>
                          <h3>Chi tiết sản phẩm: {product.name}</h3>
                          <p><strong>Giá:</strong> {product.price.toLocaleString()} VNĐ</p>
                          <p><strong>Cấp độ:</strong> {product.level}</p>
                          <p><strong>Nguyên tố:</strong> {product.element}</p>
                          <p><strong>Thẻ:</strong> {product.tag}</p>
                          <p><strong>Mô tả ngắn:</strong> {product.short_description}</p>
                          <p><strong>Mô tả chi tiết:</strong> <div dangerouslySetInnerHTML={{ __html: product.description }} /></p>
                          {/* <p><strong>Khối lượng:</strong> {product.weight}</p> */}
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
                          <p><strong>Ngày tạo:</strong> {new Date(product.createdAt).toLocaleDateString()}</p>
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
        {editProduct && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h2>Sửa Sản Phẩm: {editProduct.name}</h2>
              {formErrors.api && <span className={styles.error}>{formErrors.api}</span>}
              <form onSubmit={handleFormSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                  <TooltipButton
                    field="images"
                    activeTooltip={activeTooltip}
                    setActiveTooltip={setActiveTooltip}
                    guide={fieldGuides.images}
                  >
                    Hình ảnh hiện tại
                  </TooltipButton>
                  <div className={styles.imageContainer}>
                    {oldImages.length > 0 ? (
                      oldImages.map((image, index) => (
                        <div key={index} className={styles.existingImageWrapper}>
                          <img
                            src={`https://api-tuyendung-cty.onrender.com/${image}`}
                            alt={`${editProduct.name} ${index + 1}`}
                            className={styles.productImage}
                          />
                          <button
                            type="button"
                            onClick={() => deleteExistingImage(index)}
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
                  <TooltipButton
                    field="images_new"
                    activeTooltip={activeTooltip}
                    setActiveTooltip={setActiveTooltip}
                    guide="Chọn thêm ảnh mới (tối đa 4 ảnh cho mỗi sản phẩm)"
                  >
                    Thêm hình ảnh mới
                  </TooltipButton>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className={styles.input}
                    disabled={(oldImages?.length || 0) + formData.images.length >= 4}
                  />
                  {(oldImages?.length || 0) + formData.images.length >= 4 && (
                    <span className={styles.warning}>Đã đạt giới hạn 4 ảnh</span>
                  )}
                  {formErrors.images && <span className={styles.error}>{formErrors.images}</span>}
                </div>
                <div className={styles.formGroup}>
                  <TooltipButton
                    field="images_preview"
                    activeTooltip={activeTooltip}
                    setActiveTooltip={setActiveTooltip}
                  >
                    Xem trước ảnh mới
                  </TooltipButton>
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
                  <TooltipButton
                    field="name"
                    activeTooltip={activeTooltip}
                    setActiveTooltip={setActiveTooltip}
                    guide={fieldGuides.name}
                  >
                    Tên sản phẩm
                  </TooltipButton>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    className={styles.input}
                  />
                  {formErrors.name && <span className={styles.error}>{formErrors.name}</span>}
                </div>
                <div className={styles.formGroup}>
                  <TooltipButton
                    field="category"
                    activeTooltip={activeTooltip}
                    setActiveTooltip={setActiveTooltip}
                    guide={fieldGuides.category}
                  >
                    Danh mục
                  </TooltipButton>
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
                  {formErrors.category && <span className={styles.error}>{formErrors.category}</span>}
                </div>
                <div className={styles.formGroup}>
                  <TooltipButton
                    field="price"
                    activeTooltip={activeTooltip}
                    setActiveTooltip={setActiveTooltip}
                    guide={fieldGuides.price}
                  >
                    Giá (VNĐ)
                  </TooltipButton>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleFormChange}
                    className={styles.input}
                  />
                  {formErrors.price && <span className={styles.error}>{formErrors.price}</span>}
                </div>
                <div className={styles.formGroup}>
                  <TooltipButton
                    field="stock"
                    activeTooltip={activeTooltip}
                    setActiveTooltip={setActiveTooltip}
                    guide={fieldGuides.stock}
                  >
                    Tổng số lượng tồn kho
                  </TooltipButton>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleFormChange}
                    className={styles.input}
                  />
                  {formErrors.stock && <span className={styles.error}>{formErrors.stock}</span>}
                </div>
                <div className={styles.formGroup}>
                  <TooltipButton
                    field="sizes"
                    activeTooltip={activeTooltip}
                    setActiveTooltip={setActiveTooltip}
                    guide={fieldGuides.sizes}
                  >
                    Kích thước
                  </TooltipButton>
                  {formData.size.map((size, index) => (
                    <div key={index} className={styles.sizeGroup}>
                      <span>Kích thước:</span>
                      <input
                        type="text"
                        name="size_name"
                        placeholder="Kích thước (ví dụ, 12 cm)"
                        value={size.size_name}
                        onChange={(e) => handleSizeChange(index, e)}
                        className={styles.input}
                      />
                      <span>Tồn kho:</span>
                      <input
                        type="stock"
                        name="number"
                        placeholder="Tồn kho"
                        value={size.stock}
                        onChange={(e) => handleSizeChange(index, e)}
                        className={styles.input}
                      />
                      {formData.size.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSize(index)}
                          className={styles.removeButton}
                        >
                          Xóa
                        </button>
                      )}
                      {formErrors[`size_name_${index}`] && (
                        <span className={styles.error}>{formErrors[`size_name_${index}`]}</span>
                      )}
                      {formErrors[`size_stock_${index}`] && (
                        <span className={styles.error}>{formErrors[`size_stock_${index}`]}</span>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={addSize} className={styles.addSizeButton}>
                    Thêm kích thước
                  </button>
                </div>
                <div className={styles.formGroup}>
                  <TooltipButton
                    field="level"
                    activeTooltip={activeTooltip}
                    setActiveTooltip={setActiveTooltip}
                    guide={fieldGuides.level}
                  >
                    Cấp độ
                  </TooltipButton>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleFormChange}
                    className={styles.select}
                  >
                    <option value="default">Chọn cấp độ</option>
                    <option value="Cao cấp">Cao cấp</option>
                    <option value="Trung cấp">Trung cấp</option>
                    <option value="Phổ biến">Phổ biến</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <TooltipButton
                    field="element"
                    activeTooltip={activeTooltip}
                    setActiveTooltip={setActiveTooltip}
                    guide={fieldGuides.element}
                  >
                    Nguyên tố
                  </TooltipButton>
                  <input
                    type="text"
                    name="element"
                    value={formData.element}
                    onChange={handleFormChange}
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <TooltipButton
                    field="tag"
                    activeTooltip={activeTooltip}
                    setActiveTooltip={setActiveTooltip}
                    guide={fieldGuides.tag}
                  >
                    Thẻ
                  </TooltipButton>
                  <select
                    name="tag"
                    value={formData.tag}
                    onChange={handleFormChange}
                    className={styles.select}
                  >
                    <option value="">Chọn thẻ</option>
                    <option value="new">Mới (new)</option>
                    <option value="sale">Giảm giá (sale)</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <TooltipButton
                    field="short_description"
                    activeTooltip={activeTooltip}
                    setActiveTooltip={setActiveTooltip}
                    guide={fieldGuides.short_description}
                  >
                    Mô tả ngắn
                  </TooltipButton>
                  <textarea
                    name="short_description"
                    value={formData.short_description}
                    onChange={handleFormChange}
                    className={styles.textarea}
                  />
                </div>
                <div className={styles.formGroup}>
                  <TooltipButton
                    field="description"
                    activeTooltip={activeTooltip}
                    setActiveTooltip={setActiveTooltip}
                    guide={fieldGuides.description}
                  >
                    Mô tả chi tiết
                  </TooltipButton>
                  <div className={styles.toolbar}>
                    <div className={styles.toolbarGroup}>
                      <select
                        className={styles.toolbarSelect}
                        onChange={(e) => changeFontFamily(e.target.value)}
                        defaultValue=""
                      >
                        <option value="">Font chữ</option>
                        <option value="Arial">Arial</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Helvetica">Helvetica</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Verdana">Verdana</option>
                      </select>
                      <select
                        className={styles.toolbarSelect}
                        onChange={(e) => changeFontSize(e.target.value)}
                        defaultValue=""
                      >
                        <option value="">Kích cỡ</option>
                        <option value="1">8pt</option>
                        <option value="2">10pt</option>
                        <option value="3">12pt</option>
                        <option value="4">14pt</option>
                        <option value="5">18pt</option>
                        <option value="6">24pt</option>
                        <option value="7">36pt</option>
                      </select>
                      <select
                        className={styles.toolbarSelect}
                        onChange={(e) => insertHeading(e.target.value)}
                        defaultValue=""
                      >
                        <option value="">Tiêu đề</option>
                        <option value="1">H1</option>
                        <option value="2">H2</option>
                        <option value="3">H3</option>
                        <option value="4">H4</option>
                        <option value="5">H5</option>
                        <option value="6">H6</option>
                      </select>
                    </div>
                    <div className={styles.toolbarGroup}>
                      <button
                        type="button"
                        className={`${styles.toolbarBtn} ${activeButtons.has('bold') ? styles.selected : ''}`}
                        onClick={() => execCommand('bold')}
                        title="Đậm"
                      >
                        <strong>B</strong>
                      </button>
                      <button
                        type="button"
                        className={`${styles.toolbarBtn} ${activeButtons.has('italic') ? styles.selected : ''}`}
                        onClick={() => execCommand('italic')}
                        title="Nghiêng"
                      >
                        <em>I</em>
                      </button>
                      <button
                        type="button"
                        className={`${styles.toolbarBtn} ${activeButtons.has('underline') ? styles.selected : ''}`}
                        onClick={() => execCommand('underline')}
                        title="Gạch chân"
                      >
                        <u>U</u>
                      </button>
                      <button
                        type="button"
                        className={`${styles.toolbarBtn} ${activeButtons.has('strikeThrough') ? styles.selected : ''}`}
                        onClick={() => execCommand('strikeThrough')}
                        title="Gạch ngang"
                      >
                        <s>S</s>
                      </button>
                    </div>
                    <div className={styles.toolbarGroup}>
                      <button
                        type="button"
                        className={`${styles.toolbarBtn} ${activeButtons.has('list_ul') ? styles.selected : ''}`}
                        onClick={() => insertList('ul')}
                        title="Danh sách không đánh số"
                      >
                        • List
                      </button>
                      <button
                        type="button"
                        className={`${styles.toolbarBtn} ${activeButtons.has('list_ol') ? styles.selected : ''}`}
                        onClick={() => insertList('ol')}
                        title="Danh sách đánh số"
                      >
                        1. List
                      </button>
                    </div>
                  </div>
                  <div
                    ref={editorRef}
                    className={styles.editor}
                    contentEditable
                    onInput={handleDescriptionChange}
                    onFocus={handleEditorFocus}
                    data-placeholder="Nhập mô tả chi tiết..."
                    suppressContentEditableWarning={true}
                  />
                  {formErrors.description && <span className={styles.error}>{formErrors.description}</span>}
                </div>
                <div className={styles.formGroup}>
                  <TooltipButton
                    field="weight"
                    activeTooltip={activeTooltip}
                    setActiveTooltip={setActiveTooltip}
                    guide={fieldGuides.weight}
                  >
                    Khối lượng
                  </TooltipButton>
                  <input
                    type="text"
                    name="weight"
                    value={formData.weight}
                    onChange={handleFormChange}
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <TooltipButton
                    field="status"
                    activeTooltip={activeTooltip}
                    setActiveTooltip={setActiveTooltip}
                    guide={fieldGuides.status}
                  >
                    Trạng thái
                  </TooltipButton>
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

export default React.memo(ProductManagement);