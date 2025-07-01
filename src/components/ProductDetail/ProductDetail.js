import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ImageGallery from '../ImageGallery/ImageGallery';
import ToastNotification from '../ToastNotification/ToastNotification';
import styles from './ProductDetail.module.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const DeliveryTab = () => (
  <div className="tab-pane fade show active" id="delivery-tab" role="tabpanel">
    <div className={styles.tabGrid}>
      <div className={styles.tabColumn}>
        <p><strong>Giao hàng</strong><br />
          – Nội thành: Giao từ 1 – 3 ngày; Miễn phí giao hàng trong bán kính 10km<br />
          – Tỉnh khác: Giao từ 5 – 7 ngày; 30.000 VNĐ / đơn<br />
          ** Lưu ý: Thời gian nhận hàng có thể thay đổi sớm hoặc muộn hơn tùy theo địa chỉ cụ thể của khách hàng.<br />
          *** Trong trường hợp sản phẩm tạm hết hàng, nhân viên CSKH sẽ liên hệ trực tiếp với quý khách để thông báo về thời gian giao hàng.<br />
          Nếu khách hàng có yêu cầu về Giấy Kiểm Định Đá, đơn hàng sẽ cộng thêm 20 ngày để hoàn thành thủ tục.
        </p>
      </div>
      <div className={styles.tabColumn}>
        <p><strong>Chính sách hoàn trả</strong><br />
          – Chúng tôi chấp nhận đổi / trả sản phẩm ngay lúc khách kiểm tra và xác nhận hàng hóa. Chúng tôi cam kết sẽ hỗ trợ và áp dụng chính sách bảo hành tốt nhất tới Quý khách, đảm bảo mọi quyền lợi Quý khách được đầy đủ.<br />
          – Những trình trạng bể, vỡ do quá trình quý khách sử dụng chúng tôi xin từ chối đổi hàng.<br />
          – Tùy vào tình hình thực tế của sản phẩm, chúng tôi sẽ cân nhắc hỗ trợ đổi / trả nếu sản phẩm lỗi hoặc các vấn đề liên quan khác.<br />
          – Chúng tôi nhận bảo hành dây đeo vĩnh viễn dành cho khách hàng nếu tình trạng dây lâu ngày bị giãn nở, cọ xát với đá gây đứt dây trong quá trình sử dụng, chi phí vận chuyển xin quý khách vui lòng tự thanh toán.
        </p>
      </div>
    </div>
  </div>
);

const DescriptionTab = ({ product }) => (
  <div className="tab-pane fade" id="description-tab" role="tabpanel">
    <p dangerouslySetInnerHTML={{ __html: product.description }} />
  </div>
);

const ProductDetail = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptionId, setSelectedOptionId] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('delivery');
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/product/show/slug/${slug}`);
        if (!response.ok) {
          throw new Error('Không thể lấy dữ liệu sản phẩm');
        }
        const data = await response.json();
        setProduct(data);
        // Chọn option đầu tiên còn hàng mặc định
        if (data.option && data.option.length > 0) {
          const firstAvailable = data.option.find(opt => opt.stock > 0);
          setSelectedOptionId(firstAvailable ? firstAvailable._id : data.option[0]._id);
        }
      } catch (err) {
        setError(err.message);
        setProduct(null);
        setToast({ message: 'Lỗi khi tải dữ liệu sản phẩm!', type: 'error' });
      }
    };
    fetchProduct();
  }, [slug]);

  if (error) {
    return <div className={styles.error}>Lỗi: {error}</div>;
  }

  if (!product) {
    return <div className={styles.loading}>Đang tải...</div>;
  }

  const images = product.images && product.images.length > 0
    ? product.images.map(img => `${process.env.REACT_APP_API_BASE}/${img}`)
    : ["https://via.placeholder.com/300"];

  const handleIncreaseQuantity = () => setQuantity(quantity + 1);
  const handleDecreaseQuantity = () => quantity > 1 && setQuantity(quantity - 1);

  // Lấy option đang chọn
  const selectedOption = product.option?.find(opt => opt._id === selectedOptionId);

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price);

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  const handleAddToCart = () => {
    if (!selectedOption) {
      showToast('Vui lòng chọn size!', 'error');
      return;
    }
    const cart = JSON.parse(localStorage.getItem('cart_da') || '[]');
    const cartItem = {
      _id: product._id,
      name: product.name,
      price: selectedOption.price,
      quantity,
      size_name: selectedOption.size_name,
      image: product.images && product.images.length > 0
        ? `${process.env.REACT_APP_API_BASE}/${product.images[0]}`
        : 'https://via.placeholder.com/300',
      stock: selectedOption.stock,
    };
    const existIndex = cart.findIndex(
      item => item._id === cartItem._id && item.size_name === cartItem.size_name
    );
    let totalQuantity = quantity;
    if (existIndex !== -1) {
      totalQuantity += cart[existIndex].quantity;
    }
    if (totalQuantity > selectedOption.stock) {
      showToast(`Số lượng vượt quá tồn kho (${selectedOption.stock})!`, 'error');
      return;
    }
    if (existIndex !== -1) {
      cart[existIndex].quantity += quantity;
    } else {
      cart.push(cartItem);
    }
    localStorage.setItem('cart_da', JSON.stringify(cart));
    showToast('Đã thêm vào giỏ hàng!', 'success');
  };

  return (
    <div className={styles.container}>
      {toast && (
        <ToastNotification
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className={styles.header}>
        <h1 className={styles.nameProduct}>{product.name}</h1>
      </div>
      <div className={styles.content}>
        <ImageGallery
          images={images}
          currentImageIndex={currentImageIndex}
          onNext={() => setCurrentImageIndex((currentImageIndex + 1) % images.length)}
          onPrev={() => setCurrentImageIndex((currentImageIndex - 1 + images.length) % images.length)}
          onThumbnailClick={index => setCurrentImageIndex(index)}
        />
        <div className={styles.rightColumn}>
          {product.tag === 'sale' && (
            <span className={styles.sale}><strong>Trạng thái:</strong> SALE</span>
          )}
          <p><strong>NỘI DUNG SẢN PHẨM:</strong></p>
          <p>{product.short_description || 'Không có mô tả'}</p>
     
        <p className={styles.compatibleElement}>
          <strong>MẠNG PHÙ HỢP: {product.element || 'Hỏa - Thổ'}</strong>
        </p>
        <div>
          <b>Số lượng sản phẩm còn trong kho:</b> {selectedOption ? selectedOption.stock : 0}
        </div>
        <hr />
        <p className={styles.priceHighlight}>
          <strong>Giá: {selectedOption ? formatPrice(selectedOption.price) : 0} VND</strong>
        </p>


          <div style={{ marginBottom: 12 }}>
            <label>
              <b>Chọn size:</b>
              <select
                className={styles.select}
                value={selectedOptionId}
                onChange={e => setSelectedOptionId(e.target.value)}
              >
                {product.option && product.option.length > 0 ? (
                  product.option.map(opt => (
                    <option key={opt._id} value={opt._id} disabled={opt.stock === 0}>
                      {opt.size_name} {opt.stock === 0 ? '(Hết hàng)' : ''}
                    </option>
                  ))
                ) : (
                  <option value="">Không có size</option>
                )}
              </select>
            </label>
          </div>
          <div className={styles.quantity}>
            <button type="button" onClick={handleDecreaseQuantity}>-</button>
            <span className={styles.quantitySpan}>{quantity}</span>
            <button type="button" onClick={handleIncreaseQuantity}>+</button>
          </div>
          <button className={styles.addToCart} onClick={handleAddToCart}>
            Thêm vào giỏ hàng
          </button>
        </div>
      </div>
      <div className={styles.productContent}>
        <ul className={`${styles.navTabs} nav nav-tabs`} role="tablist">
          <li className={styles.navItem} role="presentation">
            <button
              className={`${styles.navLink1} nav-link ${activeTab === 'delivery' ? 'active' : ''}`}
              data-bs-toggle="tab"
              data-bs-target="#delivery-tab"
              onClick={() => setActiveTab('delivery')}
              role="tab"
              aria-selected={activeTab === 'delivery'}
            >
              Thông tin giao hàng
            </button>
          </li>
          <li className={styles.navItem} role="presentation">
            <button
              className={`${styles.navLink1} nav-link ${activeTab === 'description' ? 'active' : ''}`}
              data-bs-toggle="tab"
              data-bs-target="#description-tab"
              onClick={() => setActiveTab('description')}
              role="tab"
              aria-selected={activeTab === 'description'}
            >
              Chi tiết sản phẩm
            </button>
          </li>
        </ul>
        <div className={`${styles.tabContent} tab-content`}>
          <DeliveryTab />
          <DescriptionTab product={product} />
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;