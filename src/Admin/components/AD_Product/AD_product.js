import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import axios from 'axios';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import Sidebar from '../Sidebar/Sidebar';
import ToastNotification from '../../../components/ToastNotification/ToastNotification';
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

// Reusable ErrorPopup component
const ErrorPopup = ({ errors, onClose }) => (
  <div className={styles.errorPopupOverlay}>
    <div className={styles.errorPopup}>
      <h3>Lỗi nhập liệu</h3>
      <ul>
        {Object.entries(errors).map(([key, message]) => (
          <li key={key}>{message}</li>
        ))}
      </ul>
      <button onClick={onClose} className={styles.errorPopupCloseButton}>
        Đóng
      </button>
    </div>
  </div>
);

// Reusable ConfirmPopup component
const ConfirmPopup = ({ message, onConfirm, onCancel }) => (
  <div className={styles.errorPopupOverlay}>
    <div className={styles.confirmPopup}>
      <h3>Xác nhận xóa</h3>
      <p>{message}</p>
      <div className={styles.confirmPopupActions}>
        <button onClick={onConfirm} className={styles.confirmButton}>
          Xác nhận
        </button>
        <button onClick={onCancel} className={styles.cancelButton}>
          Hủy
        </button>
      </div>
    </div>
  </div>
);

// Tooltip guides
const fieldGuides = {
  name: "Nhập tên sản phẩm rõ ràng, cụ thể. VD: 'Vòng tay Thạch Anh Hồng'",
  category: "Chọn danh mục phù hợp nhất với sản phẩm của bạn",
  option: "Thêm các kích thước, tồn kho và giá. VD: 12cm, 10 tồn kho, 150000 VNĐ",
  level: "Phân loại: Cao Cấp, Trung Cấp, Phổ biến",
  element: "Nguyên tố phong thủy: Thổ, Kim, Mộc, Hỏa, Thủy",
  tag: "Sale: Giảm giá | New: Sản phẩm mới",
  short_description: "Mô tả ngắn gọn (100-150 ký tự)",
  description: "Mô tả chi tiết: nguồn gốc, khối lượng, lợi ích, bảo quản...",
  images: "Chọn tối đa 10 ảnh chất lượng cao (JPEG, PNG, GIF)",
  status: "Hiển thị: Hiện trên website | Ẩn: Không hiện",
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
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [editProduct, setEditProduct] = useState(null);
  const [addProduct, setAddProduct] = useState(false);
  const [showDetailProduct, setShowDetailProduct] = useState(null);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [pendingDeleteSlug, setPendingDeleteSlug] = useState(null);
  const [oldImages, setOldImages] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    option: [{ size_name: '', stock: '', price: '' }],
    level: '',
    element: '',
    tag: 'new',
    short_description: '',
    description: '',
    status: 'show',
    images: [],
    purchases: '0',
  });
  const [formErrors, setFormErrors] = useState({});
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const editorRef = useRef(null);
  const modalRef = useRef(null);
  const quillRef = useRef(null);
  const token = localStorage.getItem('adminToken');
  const productsPerPage = 9;
  const API_URL = process.env.REACT_APP_API_URL || 'https://api-tuyendung-cty.onrender.com/api';
  const API_BASE = process.env.REACT_APP_API_BASE || 'https://api-tuyendung-cty.onrender.com';
  const MAX_IMAGES = 10;

  // Memoized filtered products
  const filteredProducts = useMemo(() => {
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (categoryFilter === 'all' || product.category?.name_categories === categoryFilter) &&
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

  // Initialize Quill editor
  useEffect(() => {
    if (editorRef.current && !quillRef.current && (editProduct || addProduct)) {
      console.log('Initializing Quill editor');
      try {
        const quill = new Quill(editorRef.current, {
          theme: 'snow',
          modules: {
            toolbar: [
              [{ font: [] }],
              [{ size: ['small', false, 'large', 'huge'] }],
              ['bold', 'italic', 'underline', 'strike'],
              [{ list: 'ordered' }, { list: 'bullet' }],
              [{ header: [1, 2, 3, 4, 5, 6, false] }],
            ],
          },
          placeholder: 'Nhập mô tả chi tiết...',
        });

        // Set initial content
        if (formData.description) {
          console.log('Setting initial description:', formData.description);
          quill.root.innerHTML = formData.description;
        }

        // Sync Quill content with formData
        quill.on('text-change', () => {
          const content = quill.root.innerHTML;
          console.log('Quill text changed:', content);
          setFormData((prev) => {
            if (prev.description !== content) {
              return { ...prev, description: content };
            }
            return prev;
          });
        });

        quillRef.current = quill;
      } catch (err) {
        console.error('Failed to initialize Quill:', err);
      }
    }

    // Cleanup Quill instance
    return () => {
      console.log('Cleaning up Quill instance');
      if (quillRef.current) {
        quillRef.current = null;
      }
    };
  }, [editProduct, addProduct]);

  // Fetch products
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        setErrorMessage(null);
        const endpoint = statusFilter === 'show' ? `${API_URL}/product/show` : `${API_URL}/product`;
        const response = await axios.get(`${endpoint}?limit=1000`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setProducts(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải dữ liệu sản phẩm');
        setErrorMessage(err.response?.data?.message || 'Không thể tải dữ liệu sản phẩm');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, statusFilter]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setError(null);
        setErrorMessage(null);
        const res = await axios.get(`${API_URL}/category`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setCategories(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải dữ liệu danh mục');
        setErrorMessage(err.response?.data?.message || 'Không thể tải dữ liệu danh mục');
      }
    };
    fetchCategories();
  }, [token]);

  // Handle close toast
  const handleCloseToast = () => {
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  // Form handling
  const handleFormChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleOptionChange = useCallback((index, e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newOptions = [...prev.option];
      newOptions[index] = { ...newOptions[index], [name]: value };
      return { ...prev, option: newOptions };
    });
  }, []);

  const addOption = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      option: [...prev.option, { size_name: '', stock: '', price: '' }],
    }));
  }, []);

  const removeOption = useCallback((index) => {
    setFormData((prev) => ({
      ...prev,
      option: prev.option.filter((_, i) => i !== index)
    }));
  }, []);

  const handleImageChange = useCallback((e) => {
    const newImages = Array.from(e.target.files);
    const totalImages = (oldImages?.length || 0) + formData.images.length + newImages.length;
    if (totalImages > MAX_IMAGES) {
      setFormErrors({ images: `Tổng số ảnh không được vượt quá ${MAX_IMAGES}.` });
      setShowErrorPopup(true);
      return;
    }
    setFormData((prev) => ({ ...prev, images: [...prev.images, ...newImages] }));
  }, [formData.images, oldImages]);

  const removeImage = useCallback((index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  }, []);

  const deleteExistingImage = useCallback((index) => {
    setOldImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const validateForm = useCallback(() => {
    const errors = {};
    if (!formData.name) errors.name = 'Tên sản phẩm là bắt buộc';
    if (!formData.category) errors.category = 'Danh mục là bắt buộc';
    if (formData.option.length === 0) errors.option = 'Cần ít nhất một tùy chọn kích thước';
    formData.option.forEach((opt, index) => {
      if (!opt.size_name) errors[`option_size_name_${index}`] = 'Kích thước là bắt buộc';
      if (!opt.stock && opt.stock !== '0') errors[`option_stock_${index}`] = 'Tồn kho không hợp lệ';
      if (!opt.price || parseFloat(opt.price) <= 0) errors[`option_price_${index}`] = 'Giá tùy chọn phải lớn hơn 0';
    });
    if ((oldImages?.length || 0) + formData.images.length === 0) {
      errors.images = 'Cần ít nhất một hình ảnh';
    }
    if (formData.purchases < 0) errors.purchases = 'Số lượng mua không được âm';
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      setShowErrorPopup(true);
    }
    return Object.keys(errors).length === 0;
  }, [formData, oldImages]);

  const handleFormSubmit = useCallback(async (e) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);
    if (!token) {
      setErrorMessage('Vui lòng đăng nhập với quyền admin để lưu sản phẩm.');
      setTimeout(() => window.location.href = '/admin/login', 2000);
      return;
    }
    if (!validateForm()) return;

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      const categoryObj = categories.find((cat) => cat._id === formData.category);
      if (!categoryObj) {
        setFormErrors({ category: 'Danh mục không hợp lệ' });
        setShowErrorPopup(true);
        return;
      }
      formDataToSend.append('category', JSON.stringify({
        id: categoryObj._id,
        name_categories: categoryObj.category
      }));
      const derivedPrice = formData.option.length > 0 ? parseFloat(formData.option[0].price) : 0;
      formDataToSend.append('price', derivedPrice);
      formDataToSend.append('level', formData.level || '');
      formDataToSend.append('element', formData.element || '');
      formDataToSend.append('tag', formData.tag || 'new');
      formDataToSend.append('short_description', formData.short_description || '');
      formDataToSend.append('status', formData.status || 'show');
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('purchases', parseInt(formData.purchases) || 0);
      const options = formData.option.map(opt => ({
        size_name: opt.size_name,
        stock: parseInt(opt.stock) || 0,
        price: parseFloat(opt.price)
      }));
      formDataToSend.append('option', JSON.stringify(options));
      formData.images.forEach((image) => formDataToSend.append('images', image));
      if (editProduct && oldImages.length > 0) {
        formDataToSend.append('oldImages', JSON.stringify(oldImages));
      }

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      };

      let response;
      if (editProduct) {
        response = await axios.put(
          `${API_URL}/product/${editProduct.slug}`,
          formDataToSend,
          config
        );
        setProducts((prev) =>
          prev.map((p) => (p._id === editProduct._id ? response.data.product : p))
        );
        setSuccessMessage('Cập nhật sản phẩm thành công');
      } else {
        response = await axios.post(
          `${API_URL}/product`,
          formDataToSend,
          config
        );
        setProducts((prev) => [...prev, response.data.product]);
        setSuccessMessage('Thêm sản phẩm thành công');
      }

      closeModal();
    } catch (err) {
      if (err.response?.status === 401) {
        setErrorMessage('Phiên đăng nhập hết hạn hoặc không có quyền admin.');
        setTimeout(() => window.location.href = '/admin/login', 2000);
      } else {
        setErrorMessage(err.response?.data?.error || err.response?.data?.message || 'Không thể lưu sản phẩm');
      }
    }
  }, [formData, editProduct, oldImages, categories, token, validateForm]);

  const handleEdit = useCallback((product) => {
    setSuccessMessage(null);
    setErrorMessage(null);
    const categoryId = product.category?._id || product.category?.id || '';
    setEditProduct(product);
    setAddProduct(false);
    setOldImages(product.images || []);
    setFormData({
      name: product.name || '',
      category: categoryId,
      option:
        product.option?.length > 0
          ? product.option.map((opt) => ({
              size_name: opt.size_name || '',
              stock: (opt.stock || 0).toString(),
              price: (opt.price || 0).toString(),
            }))
          : [{ size_name: '', stock: '0', price: '0' }],
      level: product.level || '',
      element: product.element || '',
      tag: product.tag || 'new',
      short_description: product.short_description || '',
      status: product.status || 'show',
      description: product.description || '',
      images: [],
      purchases: (product.purchases || 0).toString(),
    });
    setSuccessMessage('Tải thông tin sản phẩm để chỉnh sửa thành công');
  }, []);

  const handleAddProduct = useCallback(() => {
    setSuccessMessage(null);
    setErrorMessage(null);
    setAddProduct(true);
    setEditProduct(null);
    setOldImages([]);
    setFormData({
      name: '',
      category: '',
      option: [{ size_name: '', stock: '0', price: '' }],
      level: '',
      element: '',
      tag: 'new',
      short_description: '',
      description: '',
      status: 'show',
      images: [],
      purchases: '0',
    });
  }, []);

  const closeModal = useCallback(() => {
    setSuccessMessage(null);
    setErrorMessage(null);
    setEditProduct(null);
    setAddProduct(false);
    setShowDetailProduct(null);
    setFormData({
      name: '',
      category: '',
      option: [{ size_name: '', stock: '0', price: '' }],
      level: '',
      element: '',
      tag: 'new',
      short_description: '',
      description: '',
      status: 'show',
      images: [],
      purchases: '0',
    });
    setFormErrors({});
    setShowErrorPopup(false);
    setActiveTooltip(null);
    if (quillRef.current) {
      quillRef.current.root.innerHTML = '';
    }
  }, []);

  const closeErrorPopup = useCallback(() => {
    setShowErrorPopup(false);
  }, []);

  const handlePageChange = useCallback((page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
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
  }, [currentPage, totalPages, handlePageChange]);

  const handleShowDetails = useCallback((product, e) => {
    setSuccessMessage(null);
    setErrorMessage(null);
    if (e.target.tagName === 'BUTTON') return;
    setShowDetailProduct(product);
    setSuccessMessage('Đã tải chi tiết sản phẩm thành công');
  }, []);

  const handleDelete = useCallback((slug) => {
    setSuccessMessage(null);
    setErrorMessage(null);
    setPendingDeleteSlug(slug);
    setShowConfirmPopup(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!token) {
      setErrorMessage('Vui lòng đăng nhập với quyền admin để xóa sản phẩm.');
      setShowConfirmPopup(false);
      setPendingDeleteSlug(null);
      setTimeout(() => window.location.href = '/admin/login', 2000);
      return;
    }
    try {
      await axios.delete(`${API_URL}/product/${pendingDeleteSlug}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts((prev) => prev.filter((p) => p.slug !== pendingDeleteSlug));
      setError(null);
      setSuccessMessage('Xóa sản phẩm thành công');
      setShowConfirmPopup(false);
      setPendingDeleteSlug(null);
    } catch (err) {
      setShowConfirmPopup(false);
      setPendingDeleteSlug(null);
      if (err.response?.status === 401) {
        setErrorMessage('Phiên đăng nhập hết hạn hoặc không có quyền admin.');
        setTimeout(() => window.location.href = '/admin/login', 2000);
      } else {
        setError(err.response?.data?.message || 'Không thể xóa sản phẩm');
        setErrorMessage(err.response?.data?.message || 'Không thể xóa sản phẩm');
      }
    }
  }, [token, pendingDeleteSlug]);

  const handleCancelDelete = useCallback(() => {
    setShowConfirmPopup(false);
    setPendingDeleteSlug(null);
  }, []);

  const toggleStatus = useCallback(async (product) => {
    setSuccessMessage(null);
    setErrorMessage(null);
    if (!token) {
      setErrorMessage('Vui lòng đăng nhập với quyền admin để thay đổi trạng thái.');
      setTimeout(() => window.location.href = '/admin/login', 2000);
      return;
    }
    const validStatuses = ['show', 'hidden'];
    const currentStatus = product.status || 'show';
    const newStatus = currentStatus === 'show' ? 'hidden' : 'show';
    try {
      const response = await axios.patch(
        `${API_URL}/product/${product.slug}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProducts((prev) =>
        prev.map((p) => (p._id === product._id ? response.data.product : p))
      );
      setError(null);
      setSuccessMessage(`Đã đổi trạng thái sản phẩm thành ${newStatus === 'show' ? 'Hiển thị' : 'Ẩn'}`);
    } catch (err) {
      if (err.response?.status === 401) {
        setErrorMessage('Phiên đăng nhập hết hạn hoặc không có quyền admin.');
        setTimeout(() => window.location.href = '/admin/login', 2000);
      } else {
        setError(err.response?.data?.message || 'Không thể đổi trạng thái sản phẩm');
        setErrorMessage(err.response?.data?.message || 'Không thể đổi trạng thái sản phẩm');
      }
    }
  }, [token]);

  const calculateTotalStock = useCallback((product) => {
    return product.option?.reduce((total, opt) => total + (parseInt(opt.stock) || 0), 0) || 0;
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
              <option key={cat._id} value={cat.category}>
                {cat.category}
              </option>
            ))}
          </select>
          <select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="show">Hiển thị</option>
            <option value="hidden">Ẩn</option>
          </select>
          <button onClick={handleAddProduct} className={styles.addButton}>
            Thêm Sản Phẩm
          </button>
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
                <tr
                  key={product._id}
                  className={styles.tableRow}
                  onClick={(e) => handleShowDetails(product, e)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>
                    {product.images?.length > 0 ? (
                      <img
                        src={`${API_BASE}/${product.images[0]}`}
                        alt={product.name}
                        className={styles.tableImage}
                      />
                    ) : (
                      'Không có ảnh'
                    )}
                  </td>
                  <td>{product.name}</td>
                  <td>{product.category?.name_categories || 'Chưa xác định'}</td>
                  <td>{calculateTotalStock(product)}</td>
                  <td>{product.status === 'show' ? 'Hiển thị' : 'Ẩn'}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleEdit(product)}
                      className={styles.actionButton}
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => toggleStatus(product)}
                      className={`${styles.actionButton} ${styles.toggleButton}`}
                    >
                      {product.status === 'show' ? 'Ẩn' : 'Hiện'}
                    </button>
                    <button
                      onClick={() => handleDelete(product.slug)}
                      className={`${styles.actionButton} ${styles.deleteButton}`}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
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
        {(editProduct || addProduct) && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal} ref={modalRef}>
              <h2>{addProduct ? 'Thêm Sản Phẩm' : `Sửa Sản Phẩm: ${editProduct?.name}`}</h2>
              <form onSubmit={handleFormSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                  <TooltipButton
                    field="images"
                    activeTooltip={activeTooltip}
                    setActiveTooltip={setActiveTooltip}
                    guide={fieldGuides.images}
                  >
                    {addProduct ? 'Hình ảnh' : 'Hình ảnh hiện tại'}
                  </TooltipButton>
                  {!addProduct && (
                    <div className={styles.imageContainer}>
                      {oldImages.length > 0 ? (
                        oldImages.map((image, index) => (
                          <div key={index} className={styles.existingImageWrapper}>
                            <img
                              src={`${API_BASE}/${image}`}
                              alt={`${editProduct?.name} ${index + 1}`}
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
                  )}
                </div>
                <div className={styles.formGroup}>
                  <TooltipButton
                    field="images_new"
                    activeTooltip={activeTooltip}
                    setActiveTooltip={setActiveTooltip}
                    guide={`Chọn thêm ảnh mới (tối đa ${MAX_IMAGES} ảnh cho mỗi sản phẩm)`}
                  >
                    Thêm hình ảnh mới
                  </TooltipButton>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className={styles.input}
                    disabled={(oldImages?.length || 0) + formData.images.length >= MAX_IMAGES}
                  />
                  {(oldImages?.length || 0) + formData.images.length >= MAX_IMAGES && (
                    <span className={styles.warning}>Đã đạt giới hạn {MAX_IMAGES} ảnh</span>
                  )}
                </div>
                <div className={styles.formGroup}>
                  <TooltipButton
                    field="images_preview"
                    activeTooltip={activeTooltip}
                    setActiveTooltip={setActiveTooltip}
                    guide="Xem trước các ảnh mới được chọn"
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
                    required
                  />
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
                    required
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
                  <TooltipButton
                    field="option"
                    activeTooltip={activeTooltip}
                    setActiveTooltip={setActiveTooltip}
                    guide={fieldGuides.option}
                  >
                    Tùy chọn kích thước
                  </TooltipButton>
                  {formData.option.map((opt, index) => (
                    <div key={index} className={styles.sizeGroup}>
                      <span>Kích thước:</span>
                      <input
                        type="text"
                        name="size_name"
                        placeholder="Kích thước (ví dụ, 12 cm)"
                        value={opt.size_name}
                        onChange={(e) => handleOptionChange(index, e)}
                        className={styles.input}
                        required
                      />
                      <span>Tồn kho:</span>
                      <input
                        type="number"
                        name="stock"
                        placeholder="Tồn kho"
                        value={opt.stock}
                        onChange={(e) => handleOptionChange(index, e)}
                        className={styles.input}
                        min="0"
                        required
                      />
                      <span>Giá (VNĐ):</span>
                      <input
                        type="number"
                        name="price"
                        placeholder="Giá tùy chọn"
                        value={opt.price}
                        onChange={(e) => handleOptionChange(index, e)}
                        className={styles.input}
                        min="0.01"
                        step="0.01"
                        required
                      />
                      {formData.option.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className={styles.removeButton}
                        >
                          Xóa
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={addOption} className={styles.addSizeButton}>
                    Thêm tùy chọn
                  </button>
                </div>
                <div className={styles.formGroup}>
                  <TooltipButton
                    field="level"
                    activeTooltip={activeTooltip}
                    setActiveTooltip={setActiveTooltip}
                    guide={fieldGuides.level}
                  >
                    Phân khúc sản phẩm
                  </TooltipButton>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleFormChange}
                    className={styles.select}
                  >
                    <option value="">Chọn phân khúc sản phẩm</option>
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
                  <div ref={editorRef} className={styles.editor} />
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
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <TooltipButton
                    field="purchases"
                    activeTooltip={activeTooltip}
                    setActiveTooltip={setActiveTooltip}
                    guide={fieldGuides.purchases}
                  >
                    Số lượng đã bán
                  </TooltipButton>
                  <input
                    type="number"
                    name="purchases"
                    value={formData.purchases}
                    onChange={handleFormChange}
                    className={styles.input}
                    min="0"
                  />
                </div>
                <div className={styles.formActions}>
                  <button type="submit" className={styles.submitButton}>
                    {addProduct ? 'Thêm' : 'Cập nhật'}
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
        {showDetailProduct && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h3>Chi tiết sản phẩm: {showDetailProduct.name}</h3>
              <div className={styles.detailContainer}>
                <p><strong>Cấp độ:</strong> {showDetailProduct.level || 'Chưa xác định'}</p>
                <p><strong>Nguyên tố:</strong> {showDetailProduct.element || 'Chưa xác định'}</p>
                <p><strong>Thẻ:</strong> {showDetailProduct.tag || 'Chưa xác định'}</p>
                <p><strong>Mô tả ngắn:</strong> {showDetailProduct.short_description || 'Chưa có'}</p>
                <p><strong>Mô tả chi tiết:</strong> <div dangerouslySetInnerHTML={{ __html: showDetailProduct.description || 'Chưa có' }} /></p>
                <p><strong>Các size còn trong kho:</strong></p>
                <ul>
                  {(showDetailProduct.option || []).map((opt, index) => (
                    <li key={opt._id || index}>
                      {opt.size_name || 'Chưa xác định'}, {opt.stock || 0} tồn kho, Giá: {(opt.price || 0).toLocaleString('vi-VN')} VNĐ
                    </li>
                  ))}
                </ul>
                <p><strong>Lượt xem:</strong> {showDetailProduct.views || 0}</p>
                <p><strong>Lượt mua:</strong> {showDetailProduct.purchases || 0}</p>
                <p><strong>Ngày tạo:</strong> {new Date(showDetailProduct.createdAt).toLocaleDateString('vi-VN')}</p>
                <p><strong>Hình ảnh:</strong></p>
                <div className={styles.imageContainer}>
                  {(showDetailProduct.images || []).map((image, index) => (
                    <img
                      key={index}
                      src={`${API_BASE}/${image}`}
                      alt={`${showDetailProduct.name} ${index + 1}`}
                      className={styles.productImage}
                    />
                  ))}
                </div>
              </div>
              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={closeModal}
                  className={styles.cancelButton}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
        {showErrorPopup && (
          <ErrorPopup errors={formErrors} onClose={closeErrorPopup} />
        )}
        {showConfirmPopup && (
          <ConfirmPopup
            message="Bạn có chắc muốn xóa sản phẩm này?"
            onConfirm={handleConfirmDelete}
            onCancel={handleCancelDelete}
          />
        )}
        {successMessage && (
          <ToastNotification
            message={successMessage}
            type="success"
            onClose={handleCloseToast}
          />
        )}
        {errorMessage && (
          <ToastNotification
            message={errorMessage}
            type="error"
            onClose={handleCloseToast}
          />
        )}
      </div>
    </div>
  );
};

export default React.memo(ProductManagement);