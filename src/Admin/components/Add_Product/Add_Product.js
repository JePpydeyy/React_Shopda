import React, { useState, useEffect, useRef, useCallback } from 'react';
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
    status: 'show',
    images: [],
  });

  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [activeButtons, setActiveButtons] = useState(new Set());
  const [activeTooltip, setActiveTooltip] = useState(null); // State cho tooltip
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const editorRef = useRef(null);

  // Hướng dẫn cho từng trường
  const fieldGuides = {
    name: "Nhập tên sản phẩm rõ ràng, cụ thể. VD: 'Vòng tay Thạch Anh Hồng'",
    category: "Chọn danh mục phù hợp nhất với sản phẩm của bạn",
    price: "Nhập giá bán lẻ tính bằng VNĐ. VD: 150000 (không có dấu phẩy)",
    material: "Chất liệu chính của sản phẩm. VD: 'Thạch anh hồng tự nhiên, dây cao su'",
    sizes: `Thêm các kích thước khác nhau của sản phẩm và tồn kho cho từng size VD: 23cm (size vòng tay) hoặc 50*14*33cm (kích thước tượng, đồ phong thủy)`,
    level: "Phân loại chất lượng: Cao Cấp, Trung Cấp, Phổ Thông",
    collection: "Tên bộ sưu tập nếu có. VD: 'Bộ sưu tập Xuân 2024'",
    element: "Nguyên tố phong thủy. VD: 'Thổ', 'Kim', 'Mộc', 'Hỏa', 'Thủy'",
    tag: " Sale: Hiện trên website với giá giảm | new: Sản phẩm mới",
    short_description: `Mô tả ngắn gọn về sản phẩm (100-200 ký tự) 
    VD:
    Đá mặt trăng (Moonstone) là loại đá quý thuộc nhóm Fenspat Kali. Moonstone phát ánh sáng trắng xanh mờ ảo giống như vầng trăng. Hiện tượng quang học lung linh của đá mặt trăng được các nhà khoa học đặt tên là “Adulares Age” – Ánh xà cừ. Moonstone là viên đá thiêng liêng của người Ấn Độ. Người La Mã cổ đại thì tin mỗi viên đá Moonstone tượng trưng cho 1 hình ảnh của Nữ thần mặt trăng – Diana.`,
    description: `Mô tả chi tiết có thể gồm:
- Thông tin chung về sản phẩm
- Khối lượng và kích thước
- Nguồn gốc xuất xứ  
- Độ cứng và tính chất vật lý
- Lợi ích tâm linh (mỗi dòng một lợi ích)
- Lợi ích sức khỏe (mỗi dòng một lợi ích)  
- Hướng dẫn bảo quản (mỗi dòng một hướng dẫn)

  VD:
  ĐÁ MOONSTONE

Sơ lược: Đá mặt trăng (Moonstone) là loại đá quý thuộc nhóm Fenspat Kali, phát ánh sáng trắng xanh mờ ảo giống như vầng trăng.

Khu vực được khai thác: Srilanka, Ấn Độ, Brazil, Myanmar, Madagascar, Mexico, Na Uy, Thụy Sĩ, Tanzania, Hoa Kỳ

Thành phần: ĐÁ MOONSTONE

Độ cứng thang Mohs: 6.0 - 6.5/10

Mạng phù hợp: Kim - Thủy

Tác dụng tinh thần:

Giúp phá tan đi tiêu cực, cởi mở tâm trí.
Giúp 2 người hiểu nhau hơn, để tình cảm càng thêm hòa hợp, đằm thắm hạnh phúc.

Tác dụng sức khỏe:

Có lợi cho sức khỏe sinh sản của nữ giới, giảm các vấn đề về chu kỳ kinh nguyệt, giúp cân bằng nội tiết tố. Cực kì hiệu quả và phù hợp với phụ nữ đang mang thai và mới sinh nở.

`,
  images: "Chọn tối đa 4 ảnh chất lượng cao, góc chụp khác nhau để khách hàng thấy rõ sản phẩm",
  status: "Hiển thị: Hiện trên website | Ẩn: Không hiện trên website ",
  };

  // Component Tooltip
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

  // Function để kiểm tra trạng thái formatting hiện tại
  const updateToolbarState = useCallback(() => {
    const newActiveButtons = new Set();
    
    try {
      // Kiểm tra các command formatting
      if (document.queryCommandState('bold')) newActiveButtons.add('bold');
      if (document.queryCommandState('italic')) newActiveButtons.add('italic');
      if (document.queryCommandState('underline')) newActiveButtons.add('underline');
      if (document.queryCommandState('strikeThrough')) newActiveButtons.add('strikeThrough');
      
      // Kiểm tra alignment
      if (document.queryCommandState('justifyLeft')) newActiveButtons.add('justifyLeft');
      if (document.queryCommandState('justifyCenter')) newActiveButtons.add('justifyCenter');
      if (document.queryCommandState('justifyRight')) newActiveButtons.add('justifyRight');
      if (document.queryCommandState('justifyFull')) newActiveButtons.add('justifyFull');
      
      // Kiểm tra lists
      if (document.queryCommandState('insertUnorderedList')) newActiveButtons.add('list_ul');
      if (document.queryCommandState('insertOrderedList')) newActiveButtons.add('list_ol');
      
    } catch (error) {
      console.warn('Error checking command state:', error);
    }

    setActiveButtons(newActiveButtons);
  }, []);

  // Event listener cho selection change
  useEffect(() => {
    const handleSelectionChange = () => {
      // Chỉ update khi focus đang ở trong editor
      if (document.activeElement === editorRef.current) {
        updateToolbarState();
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [updateToolbarState]);

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
    const totalImages = formData.images.length + newImages.length;
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

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Tên sản phẩm là bắt buộc';
    if (!formData.category) newErrors.category = 'Danh mục là bắt buộc';
    if (!formData.price || formData.price <= 0) newErrors.price = 'Giá phải lớn hơn 0';
    if (!formData.stock || formData.stock < 0) newErrors.stock = 'Tồn kho không hợp lệ';
    if (!formData.material) newErrors.material = 'Chất liệu là bắt buộc';
    if (!formData.level) newErrors.level = 'Cấp độ là bắt buộc';
    if (!formData.images.length) newErrors.images = 'Cần ít nhất một hình ảnh';
    if (!formData.description) newErrors.description = 'Mô tả chi tiết là bắt buộc';
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

  const execCommand = (command, value = false) => {
    try {
      document.execCommand(command, false, value);
      if (editorRef.current) {
        editorRef.current.focus();
        // Update toolbar state sau khi execute command
        setTimeout(updateToolbarState, 10);
      }
    } catch (error) {
      console.error('Error executing command:', error);
    }
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
    if (size) {
      execCommand('fontSize', size);
    }
  };

  const changeFontFamily = (font) => {
    if (font) {
      execCommand('fontName', font);
    }
  };

  const insertHeading = (level) => {
    if (level) {
      execCommand('formatBlock', `<h${level}>`);
    }
  };

  const changeTextAlign = (align) => {
    const command = `justify${align}`;
    execCommand(command);
  };

  // Handle editor focus để update toolbar state
  const handleEditorFocus = () => {
    setTimeout(updateToolbarState, 10);
  };

  // Handle editor blur để clear active states nếu cần
  const handleEditorBlur = () => {
    // Có thể clear active states hoặc giữ nguyên tùy UX mong muốn
  };

  const handleSubmit = async (e) => {
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
      formDataToSend.append('Collection', formData.collection);
      formDataToSend.append('element', formData.element);
      formDataToSend.append('tag', formData.tag);
      formDataToSend.append('short_description', formData.short_description);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('status', formData.status);
      formData.images.forEach((image) => {
        formDataToSend.append('images', image);
      });

      const response = await axios.post(
        'https://api-zeal.onrender.com/api/products',
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
            <TooltipButton field="images">Hình ảnh</TooltipButton>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className={styles.input}
              disabled={formData.images.length >= 4}
            />
            {formData.images.length >= 4 && (
              <span className={styles.warning}>Đã đạt giới hạn 4 ảnh</span>
            )}
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
            <TooltipButton field="name">Tên sản phẩm</TooltipButton>
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
            <TooltipButton field="category">Danh mục</TooltipButton>
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
            <TooltipButton field="price">Giá (VNĐ)</TooltipButton>
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
            <TooltipButton field="material">Chất liệu</TooltipButton>
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
            <TooltipButton field="sizes">Kích thước</TooltipButton>
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
            <TooltipButton field="level">Cấp độ</TooltipButton>
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
            {errors.level && <span className={styles.error}>{errors.level}</span>}
          </div>

          <div className={styles.formGroup}>
            <TooltipButton field="collection">Bộ sưu tập</TooltipButton>
            <input
              type="text"
              name="collection"
              value={formData.collection}
              onChange={handleChange}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <TooltipButton field="element">Nguyên tố</TooltipButton>
            <input
              type="text"
              name="element"
              value={formData.element}
              onChange={handleChange}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
                <TooltipButton field="tag">Tag</TooltipButton>
                <select
                  name="tag"
                  value={formData.tag}
                  onChange={handleChange}
                  className={styles.select}
                >
                  <option value="">Chọn tag</option>
                  <option value="new">Mới (new)</option>
                  <option value="sale">Giảm giá (sale)</option>
                </select>
              </div>

          <div className={styles.formGroup}>
            <TooltipButton field="short_description">Mô tả ngắn</TooltipButton>
            <textarea
              name="short_description"
              value={formData.short_description}
              onChange={handleChange}
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
                  title="Gạch chân"
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
              onBlur={handleEditorBlur}
              data-placeholder="Nhập mô tả chi tiết, khối lượng, nguồn gốc, độ cứng nhắc, lợi ích tâm linh (mỗi dòng một lợi ích), lợi ích sức khỏe (mỗi dòng một lợi ích), hướng dẫn bảo quản (mỗi dòng một hướng dẫn)..."
            />
            {errors.description && <span className={styles.error}>{errors.description}</span>}
          </div>

          <div className={styles.formGroup}>
            <TooltipButton field="status">Trạng thái</TooltipButton>
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