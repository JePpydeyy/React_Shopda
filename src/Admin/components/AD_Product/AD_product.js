import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  const [formErrors, setFormErrors] = useState({});
  const [activeButtons, setActiveButtons] = useState(new Set());
  const [activeTooltip, setActiveTooltip] = useState(null);
  const editorRef = useRef(null);
  const token = localStorage.getItem('token');

  // Field guidance for tooltips
  const fieldGuides = {
    name: "Nhập tên sản phẩm rõ ràng, cụ thể. VD: 'Vòng tay Thạch Anh Hồng 8mm'",
    category: "Chọn danh mục phù hợp nhất với sản phẩm của bạn",
    price: "Nhập giá bán lẻ tính bằng VNĐ. VD: 150000 (không có dấu phẩy)",
    stock: "Nhập tổng số lượng tồn kho của sản phẩm",
    material: "Chất liệu chính của sản phẩm. VD: 'Thạch anh hồng tự nhiên, dây cao su'",
    sizes: "Thêm các kích thước khác nhau của sản phẩm và tồn kho cho từng size",
    level: "Phân loại chất lượng: Cao Cấp, Trung Cấp, Phổ Thông",
    collection: "Tên bộ sưu tập nếu có. VD: 'Bộ sưu tập Xuân 2024'",
    element: "Nguyên tố phong thủy. VD: 'Thổ', 'Kim', 'Mộc', 'Hỏa', 'Thủy'",
    tag: "Sale: Hiện trên website với giá giảm | new: Sản phẩm mới",
    short_description: "Mô tả ngắn gọn về sản phẩm (100-200 ký tự)",
    description: "Mô tả chi tiết bao gồm thông tin chung, khối lượng, nguồn gốc, độ cứng, lợi ích tâm linh, lợi ích sức khỏe, hướng dẫn bảo quản",
    weight: "Khối lượng sản phẩm. VD: '20g'",
    origin: "Nguồn gốc xuất xứ. VD: 'Brazil, Madagascar'",
    hardness: "Độ cứng theo thang Mohs. VD: '7/10'",
    spiritual_benefits: "Lợi ích tâm linh, mỗi dòng một lợi ích",
    health_benefits: "Lợi ích sức khỏe, mỗi dòng một lợi ích",
    care_instructions: "Hướng dẫn bảo quản, mỗi dòng một hướng dẫn",
    status: "Hiển thị: Hiện trên website | Ẩn: Không hiện trên website | Sale: Đang giảm giá",
    images: "Chọn tối đa 4 ảnh chất lượng cao, góc chụp khác nhau",
  };

  // TooltipButton component
  const TooltipButton = ({ field, children }) => (
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
            {fieldGuides[field]}
          </div>
        </div>
      )}
    </div>
  );

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

  // Update toolbar state
  const updateToolbarState = useCallback(() => {
    const newActiveButtons = new Set();
    try {
      if (document.queryCommandState('bold')) newActiveButtons.add('bold');
      if (document.queryCommandState('italic')) newActiveButtons.add('italic');
      if (document.queryCommandState('underline')) newActiveButtons.add('underline');
      if (document.queryCommandState('strikeThrough')) newActiveButtons.add('strikeThrough');
      if (document.queryCommandState('insertUnorderedList')) newActiveButtons.add('list_ul');
      if (document.queryCommandState('insertOrderedList')) newActiveButtons.add('list_ol');
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

  // Form handling
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
    const totalImages = (editProduct?.images?.length || 0) + formData.images.length + newImages.length;
    if (totalImages > 4) {
      alert('Tổng số ảnh không được vượt quá 4.');
      return;
    }
    setFormData({ ...formData, images: [...formData.images, ...newImages] });
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  };

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

  const execCommand = (command, value = false) => {
    try {
      document.execCommand(command, false, value);
      if (editorRef.current) {
        editorRef.current.focus();
        setTimeout(updateToolbarState, 10);
      }
    } catch (error) {
      console.error('Error executing command:', error);
    }
  };

  const handleDescriptionChange = () => {
    if (editorRef.current) {
      setFormData((prevState) => ({
        ...prevState,
        description: editorRef.current.innerHTML,
      }));
    }
  };

  const insertList = (type) => {
    const command = type === 'ul' ? 'insertUnorderedList' : 'insertOrderedList';
    execCommand(command);
  };

  const changeFontSize = (size) => {
    if (size) execCommand('fontSize', size);
  };

  const changeFontFamily = (font) => {
    if (font) execCommand('fontName', font);
  };

  const insertHeading = (level) => {
    if (level) execCommand('formatBlock', `<h${level}>`);
  };

  const handleEditorFocus = () => {
    setTimeout(updateToolbarState, 10);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name) errors.name = 'Tên sản phẩm là bắt buộc';
    if (!formData.category) errors.category = 'Danh mục là bắt buộc';
    if (!formData.price || formData.price <= 0) errors.price = 'Giá phải lớn hơn 0';
    if (!formData.stock || formData.stock < 0) errors.stock = 'Tồn kho không hợp lệ';
    if (!formData.material) errors.material = 'Chất liệu là bắt buộc';
    if (!formData.level) errors.level = 'Cấp độ là bắt buộc';
    if (!formData.description) errors.description = 'Mô tả chi tiết là bắt buộc';
    if ((editProduct?.images?.length || 0) + formData.images.length === 0) {
      errors.images = 'Cần ít nhất một hình ảnh';
    }
    formData.sizes.forEach((size, index) => {
      if (!size.size_name) errors[`size_name_${index}`] = 'Kích thước là bắt buộc';
      if (!size.stock || size.stock < 0) errors[`size_stock_${index}`] = 'Tồn kho kích thước không hợp lệ';
    });
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('slug', generateSlug(formData.name));
      formDataToSend.append('category', formData.category);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('stock', formData.stock);
      formDataToSend.append('material', formData.material);
      formDataToSend.append('size', JSON.stringify(formData.sizes));
      formDataToSend.append('level', formData.level);
      formDataToSend.append('collection', formData.collection);
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
          formData.spiritual_benefits.split('\n').map((s) => s.trim()).filter((s) => s)
        )
      );
      formDataToSend.append(
        'health_benefits',
        JSON.stringify(
          formData.health_benefits.split('\n').map((s) => s.trim()).filter((s) => s)
        )
      );
      formDataToSend.append(
        'care_instructions',
        JSON.stringify(
          formData.care_instructions.split('\n').map((s) => s.trim()).filter((s) => s)
        )
      );
      formDataToSend.append('status', formData.status);
      formData.images.forEach((image) => {
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
      collection: product.Collection || '',
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
    setFormErrors({});
    setActiveButtons(new Set());
    setActiveTooltip(null);
  };

  // Other functions (pagination, delete, etc.) remain unchanged
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (categoryFilter === 'all' ||
        product.category.name_categories === categoryFilter) &&
      (statusFilter === 'all' || product.status === statusFilter)
  );

  const statuses = [...new Set(products.map((p) => p.status))];

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setExpandedRow(null);
    }
  };

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

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

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
                          <p><strong>Bộ sưu tập:</strong> {product.collection}</p>
                          <p><strong>Nguyên tố:</strong> {product.element}</p>
                          <p><strong>Thẻ:</strong> {product.tag}</p>
                          <p><strong>Mô tả ngắn:</strong> {product.short_description}</p>
                          <p><strong>Mô tả chi tiết:</strong> <div dangerouslySetInnerHTML={{ __html: product.description }} /></p>
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
                  <TooltipButton field="images">Hình ảnh hiện tại</TooltipButton>
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
                
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className={styles.input}
                    disabled={(editProduct.images?.length || 0) + formData.images.length >= 4}
                  />
                  {(editProduct.images?.length || 0) + formData.images.length >= 4 && (
                    <span className={styles.warning}>Đã đạt giới hạn 4 ảnh</span>
                  )}
                  {formErrors.images && <span className={styles.error}>{formErrors.images}</span>}
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
                  <TooltipButton field="name">Tên sản phẩm</TooltipButton>
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
                  <TooltipButton field="category">Danh mục</TooltipButton>
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
                  <TooltipButton field="price">Giá (VNĐ)</TooltipButton>
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
                  <TooltipButton field="stock">Tồn kho tổng</TooltipButton>
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
                  <TooltipButton field="material">Chất liệu</TooltipButton>
                  <input
                    type="text"
                    name="material"
                    value={formData.material}
                    onChange={handleFormChange}
                    className={styles.input}
                  />
                  {formErrors.material && <span className={styles.error}>{formErrors.material}</span>}
                </div>
                <div className={styles.formGroup}>
                  <TooltipButton field="sizes">Kích thước</TooltipButton>
                  {formData.sizes.map((size, index) => (
                    <div key={index} className={styles.sizeGroup}>
                      <span>Kích thước:</span>
                      <input
                        type="text"
                        name="size_name"
                        placeholder="Kích thước (e.g., 12 cm)"
                        value={size.size_name}
                        onChange={(e) => handleSizeChange(index, e)}
                        className={styles.input}
                      />
                       <span>Tồn kho:</span>
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
                  <TooltipButton field="level">Cấp độ</TooltipButton>
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
                  {formErrors.level && <span className={styles.error}>{formErrors.level}</span>}
                </div>
                <div className={styles.formGroup}>
                  <TooltipButton field="collection">Bộ sưu tập</TooltipButton>
                  <input
                    type="text"
                    name="collection"
                    value={formData.collection}
                    onChange={handleFormChange}
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <TooltipButton field="element">Nguyên tố</TooltipButton>
                  <input
                    type="text"
                    name="element"
                    value={formData.element}
                    onChange={handleFormChange}
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <TooltipButton field="tag">Thẻ</TooltipButton>
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
                  <TooltipButton field="short_description">Mô tả ngắn</TooltipButton>
                  <textarea
                    name="short_description"
                    value={formData.short_description}
                    onChange={handleFormChange}
                    className={styles.textarea}
                  />
                </div>
                <div className={styles.formGroup}>
                  <TooltipButton field="description">Mô tả chi tiết</TooltipButton>
                  <div className={styles.toolbar}>
                    <div className={styles.toolbarGroup}>
                      <select
                        className={styles.toolbarSelect}
                        onChange={(e) => changeFontFamily(e.target.value)}
                        defaultValue=""
                      >
                        <option value="">Font</option>
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
                        <option value="">Size</option>
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
                        <option value="">Heading</option>
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
                    dangerouslySetInnerHTML={{ __html: formData.description }}
                    data-placeholder="Nhập mô tả chi tiết..."
                  />
                  {formErrors.description && <span className={styles.error}>{formErrors.description}</span>}
                </div>
                <div className={styles.formGroup}>
                  <TooltipButton field="weight">Khối lượng</TooltipButton>
                  <input
                    type="text"
                    name="weight"
                    value={formData.weight}
                    onChange={handleFormChange}
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <TooltipButton field="origin">Nguồn gốc</TooltipButton>
                  <input
                    type="text"
                    name="origin"
                    value={formData.origin}
                    onChange={handleFormChange}
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <TooltipButton field="hardness">Độ cứng</TooltipButton>
                  <input
                    type="text"
                    name="hardness"
                    value={formData.hardness}
                    onChange={handleFormChange}
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <TooltipButton field="spiritual_benefits">Lợi ích tâm linh</TooltipButton>
                  <textarea
                    name="spiritual_benefits"
                    value={formData.spiritual_benefits}
                    onChange={handleFormChange}
                    className={styles.textarea}
                    placeholder="Nhập mỗi lợi ích trên một dòng"
                  />
                </div>
                <div className={styles.formGroup}>
                  <TooltipButton field="health_benefits">Lợi ích sức khỏe</TooltipButton>
                  <textarea
                    name="health_benefits"
                    value={formData.health_benefits}
                    onChange={handleFormChange}
                    className={styles.textarea}
                    placeholder="Nhập mỗi lợi ích trên một dòng"
                  />
                </div>
                <div className={styles.formGroup}>
                  <TooltipButton field="care_instructions">Hướng dẫn bảo quản</TooltipButton>
                  <textarea
                    name="care_instructions"
                    value={formData.care_instructions}
                    onChange={handleFormChange}
                    className={styles.textarea}
                    placeholder="Nhập mỗi hướng dẫn trên một dòng"
                  />
                </div>
                <div className={styles.formGroup}>
                  <TooltipButton field="status">Trạng thái</TooltipButton>
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