import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ImageGallery from '../ImageGallery/ImageGallery';
import ProductOptions from '../ProductOptions/ProductOptions';
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
  const [wristSize, setWristSize] = useState(null);
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
        const availableSizes = data.size?.filter(item => item.stock > 0) || [];
        const defaultSize = availableSizes.length > 0
          ? availableSizes.reduce((min, current) => {
              const minSize = parseFloat(min.size_name.replace(/[^0-9.]/g, ''));
              const currentSize = parseFloat(current.size_name.replace(/[^0-9.]/g, ''));
              return minSize < currentSize ? min : current;
            }).size_name
          : null;
        setWristSize(defaultSize);
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

  const availableSizes = product.size?.filter(item => item.stock > 0).map(item => item.size_name) || [];
  const currentSizeStock = product.size?.find(item => item.size_name === wristSize)?.stock || 0;
  const handleIncreaseWristSize = () => {
    const currentIndex = availableSizes.indexOf(wristSize);
    if (currentIndex < availableSizes.length - 1) {
      setWristSize(availableSizes[currentIndex + 1]);
    }
  };
  const handleDecreaseWristSize = () => {
    const currentIndex = availableSizes.indexOf(wristSize);
    if (currentIndex > 0) {
      setWristSize(availableSizes[currentIndex - 1]);
    }
  };

  const handleNextImage = () => setCurrentImageIndex((currentImageIndex + 1) % images.length);
  const handlePrevImage = () => setCurrentImageIndex((currentImageIndex - 1 + images.length) % images.length);
  const handleThumbnailClick = (index) => setCurrentImageIndex(index);
  const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price);

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  const handleAddToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart_da') || '[]');
    const cartItem = {
      _id: product._id,
      name: product.name,
      price: product.price,
      quantity,
      charm: product.Collection || 'Phong thủy',
      stoneSize: product.weight || '10,5 Li',
      wristSize: wristSize || '12',
      image: product.images && product.images.length > 0
        ? `${process.env.REACT_APP_API_BASE}/${product.images[0]}`
        : 'https://via.placeholder.com/300',
      stock: currentSizeStock,
    };
    const existIndex = cart.findIndex(item => item._id === cartItem._id && item.wristSize === cartItem.wristSize);
    let totalQuantity = quantity;
    if (existIndex !== -1) {
      totalQuantity += cart[existIndex].quantity;
    }
    if (totalQuantity > currentSizeStock) {
      showToast(`Số lượng vượt quá tồn kho (${currentSizeStock})!`, 'error');
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
          onNext={handleNextImage}
          onPrev={handlePrevImage}
          onThumbnailClick={handleThumbnailClick}
        />
        <div className={styles.rightColumn}>
          {product.tag === 'sale' && (
            <span className={styles.sale}><strong>Trạng thái:</strong> SALE</span>
          )}
          <p><strong>NỘI DUNG SẢN PHẨM:</strong></p>
          <p>{product.short_description || 'Không có mô tả'}</p>
          <p><strong>MẠNG PHÙ HỢP: {product.element || 'Hỏa - Thổ'}</strong></p>
          <div>
            <b>số lượng sản phẩm còn trong kho:</b> {currentSizeStock}
          </div>
          <hr />
          <p><strong>Giá: {formatPrice(product.price)} VND</strong></p>
          <ProductOptions
            quantity={quantity}
            wristSize={wristSize}
            onIncreaseQuantity={handleIncreaseQuantity}
            onDecreaseQuantity={handleDecreaseQuantity}
            onIncreaseWristSize={handleIncreaseWristSize}
            onDecreaseWristSize={handleDecreaseWristSize}
            weight={product.weight}
            size={availableSizes}
          />
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