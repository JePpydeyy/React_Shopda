import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../Sidebar/Sidebar';
import styles from './AddProduct.module.css';

// Tooltip guides
const fieldGuides = {
  name: "Nhập tên sản phẩm rõ ràng, cụ thể. VD: 'Vòng tay Thạch Anh Hồng'",
  category: "Chọn danh mục phù hợp nhất với sản phẩm của bạn",
  price: "Nhập giá bán lẻ tính bằng VNĐ. VD: 150000 (không có dấu phẩy)",
  size: "Thêm các kích thước và tồn kho. VD: 12cm (vòng tay) hoặc 50*14*33cm (tượng phong thủy)",
  level: "Phân loại: Cao Cấp, Trung Cấp, Phổ biến",
  element: "Nguyên tố phong thủy: Thổ, Kim, Mộc, Hỏa, Thủy",
  tag: "Sale: Giảm giá | New: Sản phẩm mới",
  short_description: "Mô tả ngắn gọn (100-150 ký tự)",
  description: "Mô tả chi tiết: nguồn gốc, khối lượng, lợi ích, bảo quản...",
  weight: "Khối lượng sản phẩm (gram hoặc kg)",
  images: "Chọn tối đa 4 ảnh chất lượng cao (JPEG, PNG, GIF)",
  status: "Hiển thị: Hiện trên website | Ẩn: Không hiện | Sale: Đang giảm giá",
};

const TooltipButton = ({ field, children, activeTooltip, setActiveTooltip }) => (
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
        <div className={styles.tooltipContent}>{fieldGuides[field]}</div>
      </div>
    )}
  </div>
);

const AddProduct = () => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    size: [{ size_name: '', stock: '' }],
    level: '',
    element: '',
    tag: 'new',
    short_description: '',
    description: '',
    weight: '',
    status: 'show',
    images: [],
  });

  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [activeButtons, setActiveButtons] = useState(new Set());
  const [activeTooltip, setActiveTooltip] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken');
  const editorRef = useRef(null);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('https://api-tuyendung-cty.onrender.com/api/category', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setCategories(response.data);
        setLoading(false);
      } catch (err) {
        setApiError(err.response?.data?.message || 'Không thể tải danh mục');
        setLoading(false);
      }
    };
    fetchCategories();
  }, [token]);

  // Toolbar state
  const updateToolbarState = useCallback(() => {
    const newActiveButtons = new Set();
    try {
      if (document.queryCommandState('bold')) newActiveButtons.add('bold');
      if (document.queryCommandState('italic')) newActiveButtons.add('italic');
      if (document.queryCommandState('underline')) newActiveButtons.add('underline');
      if (document.queryCommandState('strikeThrough')) newActiveButtons.add('strikeThrough');
      if (document.queryCommandState('insertUnorderedList')) newActiveButtons.add('list_ul');
      if (document.queryCommandState('insertOrderedList')) newActiveButtons.add('list_ol');
    } catch (error) {}
    setActiveButtons(newActiveButtons);
  }, []);

  useEffect(() => {
    const handleSelectionChange = () => {
      if (document.activeElement === editorRef.current) {
        updateToolbarState();
      }
    };
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [updateToolbarState]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSizeChange = (index, e) => {
    const { name, value } = e.target;
    const newSizes = [...formData.size];
    newSizes[index] = { ...newSizes[index], [name]: name === 'stock' ? Number(value) || '' : value };
    setFormData({ ...formData, size: newSizes });
  };

  const addSize = () => {
    setFormData({
      ...formData,
      size: [...formData.size, { size_name: '', stock: '' }],
    });
  };

  const removeSize = (index) => {
    const newSizes = formData.size.filter((_, i) => i !== index);
    setFormData({ ...formData, size: newSizes });
  };

  const handleImageChange = (e) => {
    const newImages = Array.from(e.target.files || []);
    const validImages = newImages.filter((file) =>
      ['image/jpeg', 'image/png', 'image/gif'].includes(file.type)
    );
    const totalImages = (formData.images || []).length + validImages.length;
    if (totalImages > 4) {
      setErrors({ ...errors, images: 'Tổng số ảnh không được vượt quá 4.' });
      return;
    }
    if (validImages.length !== newImages.length) {
      setErrors({ ...errors, images: 'Chỉ chấp nhận file JPEG, PNG hoặc GIF.' });
      return;
    }
    setFormData({ ...formData, images: [...(formData.images || []), ...validImages] });
    setErrors({ ...errors, images: null });
  };

  const removeImage = (index) => {
    const newImages = (formData.images || []).filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
    if (newImages.length === 0) {
      setErrors({ ...errors, images: 'Cần chọn ít nhất một hình ảnh' });
    } else {
      setErrors({ ...errors, images: null });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Tên sản phẩm là bắt buộc';
    if (!formData.category) newErrors.category = 'Danh mục là bắt buộc';
    if (!formData.price || Number(formData.price) <= 0) newErrors.price = 'Giá phải lớn hơn 0';
    if (!formData.level) newErrors.level = 'Cấp độ là bắt buộc';
    if (!(formData.images || []).length) newErrors.images = 'Cần ít nhất một hình ảnh';
    if (!formData.description.trim()) newErrors.description = 'Mô tả chi tiết là bắt buộc';

    const validSizes = formData.size.filter(
      (s) => s.size_name.trim() && s.stock !== '' && !isNaN(Number(s.stock)) && Number(s.stock) >= 0
    );
    if (validSizes.length === 0) {
      newErrors.size = 'Vui lòng chọn ít nhất 1 kích thước hợp lệ';
    }
    formData.size.forEach((size, index) => {
      if (!size.size_name.trim()) newErrors[`size_name_${index}`] = 'Kích thước là bắt buộc';
      if (size.stock === '' || isNaN(Number(size.stock)) || Number(size.stock) < 0)
        newErrors[`size_stock_${index}`] = 'Tồn kho không hợp lệ';
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Toolbar commands
  const execCommand = (command, value = null) => {
    try {
      document.execCommand(command, false, value);
      if (editorRef.current) {
        editorRef.current.focus();
        setTimeout(updateToolbarState, 0);
      }
    } catch (error) {}
  };

  const handleFormatCommand = (command) => {
    execCommand(command);
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

  const changeFontFamily = (family) => {
    if (family) execCommand('fontName', family);
  };

  const insertHeading = (level) => {
    if (level) execCommand('formatBlock', `<h${level}>`);
  };

  const handleEditorFocus = () => {
    setTimeout(updateToolbarState, 0);
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setApiError('Vui lòng đăng nhập lại để tiếp tục.');
      return;
    }
    if (!validateForm()) {
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name.trim());

      // Parse category
      let categoryValue = formData.category;
      if (typeof categoryValue === 'string' && categoryValue) {
        try {
          categoryValue = JSON.parse(categoryValue);
        } catch {
          setErrors({ category: 'Danh mục không hợp lệ' });
          setApiError('Danh mục không hợp lệ');
          return;
        }
      }
      if (!categoryValue?.id || !categoryValue?.name_categories) {
        setErrors({ category: 'Danh mục không hợp lệ' });
        setApiError('Danh mục không hợp lệ');
        return;
      }
      formDataToSend.append('category', JSON.stringify(categoryValue));

      formDataToSend.append('price', Number(formData.price));

      // Filter valid sizes
      const validSizes = formData.size.filter(
        (s) => s.size_name.trim() && s.stock !== '' && !isNaN(Number(s.stock)) && Number(s.stock) >= 0
      );
      if (validSizes.length === 0) {
        setErrors({ size: 'Vui lòng chọn ít nhất 1 kích thước hợp lệ' });
        setApiError('Vui lòng chọn ít nhất 1 kích thước hợp lệ');
        return;
      }
      formDataToSend.append('size', JSON.stringify(validSizes));
      const totalStock = validSizes.reduce((sum, s) => sum + Number(s.stock), 0);
      formDataToSend.append('stock', totalStock);

      formDataToSend.append('level', formData.level);
      formDataToSend.append('element', formData.element.trim());
      formDataToSend.append('tag', formData.tag || 'new');
      formDataToSend.append('short_description', formData.short_description.trim());
      formDataToSend.append('weight', formData.weight.trim());
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('status', formData.status);

      (formData.images || []).forEach((image) => {
        formDataToSend.append('images', image);
      });

      await axios.post(
        'https://api-tuyendung-cty.onrender.com/api/product',
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigate('/admin/products');
    } catch (err) {
      let errorMessage = 'Không thể tạo sản phẩm';
      if (err.response?.status === 400) {
        errorMessage = err.response.data.error || err.response.data.message || 'Dữ liệu không hợp lệ';
        if (errorMessage === 'Tên sản phẩm đã tồn tại, vui lòng chọn tên khác') {
          setErrors({ name: errorMessage });
        } else if (errorMessage.includes('Category')) {
          setErrors({ category: errorMessage });
        } else if (errorMessage.includes('Size')) {
          setErrors({ size: errorMessage });
        } else if (errorMessage.includes('hình ảnh')) {
          setErrors({ images: errorMessage });
        } else if (errorMessage.includes('Lỗi upload')) {
          setErrors({ images: errorMessage });
        }
      } else if (err.response?.status === 401) {
        errorMessage = 'Phiên đăng nhập hết hạn, vui lòng đăng nhập lại';
      }
      setApiError(errorMessage);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Đang tải...</div>;
  }
  if (apiError && !categories.length) {
    return <div className={styles.error}>{apiError}</div>;
  }

  return (
    <div className={styles.container}>
      <Sidebar />
      <div className={styles.content}>
        <h1 className={styles.title}>Thêm Sản Phẩm</h1>
        {apiError && <div className={styles.error}>{apiError}</div>}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <TooltipButton field="images" activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip}>Hình ảnh</TooltipButton>
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/gif"
              onChange={handleImageChange}
              className={styles.input}
              disabled={(formData.images || []).length >= 4}
            />
            {(formData.images || []).length >= 4 && (
              <span className={styles.warning}>Đã đạt giới hạn 4 ảnh</span>
            )}
            {errors.images && <span className={styles.error}>{errors.images}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>Xem trước hình ảnh</label>
            <div className={styles.imageContainer}>
              {(formData.images || []).length > 0 ? (
                (formData.images || []).map((image, index) => (
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
            <TooltipButton field="name" activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip}>Tên sản phẩm</TooltipButton>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={styles.input}
              placeholder="Nhập tên sản phẩm"
            />
            {errors.name && <span className={styles.error}>{errors.name}</span>}
          </div>

          <div className={styles.formGroup}>
            <TooltipButton field="category" activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip}>Danh mục</TooltipButton>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={styles.select}
            >
              <option value="">Chọn danh mục</option>
              {categories.map((cat) => (
                <option
                  key={cat._id}
                  value={JSON.stringify({ id: cat._id, name_categories: cat.category })}
                >
                  {cat.category}
                </option>
              ))}
            </select>
            {errors.category && <span className={styles.error}>{errors.category}</span>}
          </div>

          <div className={styles.formGroup}>
            <TooltipButton field="price" activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip}>Giá (VNĐ)</TooltipButton>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className={styles.input}
              min="0"
              step="1"
              placeholder="Nhập giá sản phẩm"
            />
            {errors.price && <span className={styles.error}>{errors.price}</span>}
          </div>

          <div className={styles.formGroup}>
            <TooltipButton field="size" activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip}>Kích thước</TooltipButton>
            {formData.size.map((size, index) => (
              <div key={index} className={styles.sizeGroup}>
                <span>Kích thước:</span>
                <input
                  type="text"
                  name="size_name"
                  placeholder="VD: 12 cm"
                  value={size.size_name}
                  onChange={(e) => handleSizeChange(index, e)}
                  className={styles.input}
                />
                <span>Tồn kho:</span>
                <input
                  type="number"
                  name="stock"
                  placeholder="Số lượng tồn kho"
                  value={size.stock}
                  onChange={(e) => handleSizeChange(index, e)}
                  className={styles.input}
                  min="0"
                  step="1"
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
                {errors[`size_name_${index}`] && (
                  <span className={styles.error}>{errors[`size_name_${index}`]}</span>
                )}
                {errors[`size_stock_${index}`] && (
                  <span className={styles.error}>{errors[`size_stock_${index}`]}</span>
                )}
              </div>
            ))}
            {errors.size && <span className={styles.error}>{errors.size}</span>}
            <button type="button" onClick={addSize} className={styles.addSizeButton}>
              Thêm kích thước
            </button>
          </div>

          <div className={styles.formGroup}>
            <TooltipButton field="level" activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip}>sản phẩm thuộc dòng sản phẩm</TooltipButton>
            <select
              name="level"
              value={formData.level}
              onChange={handleChange}
              className={styles.select}
            >
              <option value="">Sản Phẩm thuộc dòng sản phẩm</option>
              <option value="Cao Cấp">Cao Cấp</option>
              <option value="Trung Cấp">Trung Cấp</option>
              <option value="Phổ biến">Phổ biến</option>
            </select>
            {errors.level && <span className={styles.error}>{errors.level}</span>}
          </div>

          <div className={styles.formGroup}>
            <TooltipButton field="element" activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip}>Nguyên tố</TooltipButton>
            <input
              type="text"
              name="element"
              value={formData.element}
              onChange={handleChange}
              className={styles.input}
              placeholder="VD: Thổ"
            />
          </div>

          <div className={styles.formGroup}>
            <TooltipButton field="tag" activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip}>Tag</TooltipButton>
            <select
              name="tag"
              value={formData.tag}
              onChange={handleChange}
              className={styles.select}
            >
              <option value="new">Mới (new)</option>
              <option value="sale">Giảm giá (sale)</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <TooltipButton field="short_description" activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip}>Mô tả ngắn</TooltipButton>
            <textarea
              name="short_description"
              value={formData.short_description}
              onChange={handleChange}
              className={styles.textarea}
              placeholder="Mô tả ngắn (100-150 ký tự)"
              maxLength="150"
            />
          </div>

          <div className={styles.formGroup}>
            <TooltipButton field="weight" activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip}>Khối lượng</TooltipButton>
            <input
              type="text"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              className={styles.input}
              placeholder="VD: 150g"
            />
          </div>

          <div className={styles.formGroup}>
            <TooltipButton field="description" activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip}>Mô tả chi tiết</TooltipButton>
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
                  onClick={() => handleFormatCommand('bold')}
                  title="Đậm"
                >
                  <strong>B</strong>
                </button>
                <button
                  type="button"
                  className={`${styles.toolbarBtn} ${activeButtons.has('italic') ? styles.selected : ''}`}
                  onClick={() => handleFormatCommand('italic')}
                  title="Nghiêng"
                >
                  <em>I</em>
                </button>
                <button
                  type="button"
                  className={`${styles.toolbarBtn} ${activeButtons.has('underline') ? styles.selected : ''}`}
                  onClick={() => handleFormatCommand('underline')}
                  title="Gạch dưới"
                >
                  <u>U</u>
                </button>
                <button
                  type="button"
                  className={`${styles.toolbarBtn} ${activeButtons.has('strikeThrough') ? styles.selected : ''}`}
                  onClick={() => handleFormatCommand('strikeThrough')}
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
            {errors.description && <span className={styles.error}>{errors.description}</span>}
          </div>

          <div className={styles.formGroup}>
            <TooltipButton field="status" activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip}>Trạng thái</TooltipButton>
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
              Thêm Sản phẩm
            </button>
            <Link to="/admin/product" className={styles.cancelButton}>
              Hủy
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;