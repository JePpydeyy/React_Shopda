import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ImageGallery from '../ImageGallery/ImageGallery';
import ProductOptions from '../ProductOptions/ProductOptions';
import styles from './ProductDetail.module.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const DeliveryTab = () => (
  <div className="tab-pane">
    <h5>THÔNG TIN VẬN CHUYỂN VÀ HOÀN TRẢ</h5>
    <div className="tab-grid">
      <div className="tab-column">
        <p><strong>Giao hàng</strong><br />
          – Nội thành: Giao từ 1 – 3 ngày; Miễn phí giao hàng trong bán kính 10km<br />
          – Tỉnh khác: Giao từ 5 – 7 ngày; 30.000 VNĐ / đơn<br />
          ** Lưu ý: Thời gian nhận hàng có thể thay đổi sớm hoặc muộn hơn tùy theo địa chỉ cụ thể của khách hàng.<br />
          *** Trong trường hợp sản phẩm tạm hết hàng, nhân viên CSKH sẽ liên hệ trực tiếp với quý khách để thông báo về thời gian giao hàng.<br />
          Nếu khách hàng có yêu cầu về Giấy Kiểm Định Đá, đơn hàng sẽ cộng thêm 20 ngày để hoàn thành thủ tục.
        </p>
      </div>
      <div className="tab-column">
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
  <div className="tab-pane">
    <p><b>{product.material}</b></p>
    <p><b>Sơ lược:</b> {product.short_description}</p>
    <p><b>Khu vực được khai thác:</b> {product.origin}</p>
    <p><b>Thành phần:</b> {product.material}</p>
    <p><b>Độ cứng thang Mohs:</b> {product.hardness}</p>
    <p><b>Mạng phù hợp:</b> {product.element}</p>
    <p><b>Tác dụng tinh thần:</b></p>
    <ul>
      {product.spiritual_benefits.map((benefit, index) => (
        <li key={index}>{benefit}</li>
      ))}
    </ul>
    <p><b>Tác dụng sức khỏe:</b></p>
    <ul>
      {product.health_benefits.map((benefit, index) => (
        <li key={index}>{benefit}</li>
      ))}
    </ul>
    <p><b>Cách bảo quản:</b></p>
    <ul>
      {product.care_instructions.map((instruction, index) => (
        <li key={index}>{instruction}</li>
      ))}
    </ul>
  </div>
);

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [wristSize, setWristSize] = useState(15);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('delivery');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/product/${id}`);
        if (!response.ok) {
          throw new Error('Không thể lấy dữ liệu sản phẩm');
        }
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        setError(err.message);
        setProduct(null);
      }
    };
    fetchProduct();
  }, [id]);

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
  const handleIncreaseWristSize = () => setWristSize(wristSize + 1);
  const handleDecreaseWristSize = () => wristSize > 1 && setWristSize(wristSize - 1);
  const handleNextImage = () => setCurrentImageIndex((currentImageIndex + 1) % images.length);
  const handlePrevImage = () => setCurrentImageIndex((currentImageIndex - 1 + images.length) % images.length);
  const handleThumbnailClick = (index) => setCurrentImageIndex(index);
  const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.nameProduct}>{product.name}</h1>
        <div className={styles.contact}>Liên hệ: 0909 123 456</div>
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
          <p><strong>Mã sản phẩm: {product._id}</strong></p>
          {product.status === 'Sale' && (
            <span className={styles.sale}><strong>Trạng thái:</strong> SALE</span>
          )}
          <p><strong>NỘI DUNG SẢN PHẨM:</strong></p>
          <p>{product.description || 'Không có mô tả'}</p>
          <p><strong>MẠNG PHÙ HỢP: {product.element || 'Hỏa - Thổ'}</strong></p>
          <hr />
          <p><strong>Giá: {formatPrice(product.price)} VND</strong></p>
          <ProductOptions
            quantity={quantity}
            wristSize={wristSize}
            onIncreaseQuantity={handleIncreaseQuantity}
            onDecreaseQuantity={handleDecreaseQuantity}
            onIncreaseWristSize={handleIncreaseWristSize}
            onDecreaseWristSize={handleDecreaseWristSize}
          />
        </div>
      </div>
      <div className="product-content">
        <ul className="nav nav-tabs" role="tablist">
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link tab1 ${activeTab === 'delivery' ? 'active' : ''}`}
              onClick={() => setActiveTab('delivery')}
              role="tab"
              aria-selected={activeTab === 'delivery'}
            >
              Thông tin giao hàng
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link tab1 ${activeTab === 'description' ? 'active' : ''}`}
              onClick={() => setActiveTab('description')}
              role="tab"
              aria-selected={activeTab === 'description'}
            >
              Chi tiết sản phẩm
            </button>
          </li>
        </ul>
        <div className="tab-content">
          <div className={`tab-pane ${activeTab === 'delivery' ? 'active' : ''}`} role="tabpanel">
            <DeliveryTab />
          </div>
          <div className={`tab-pane ${activeTab === 'description' ? 'active' : ''}`} role="tabpanel">
            <DescriptionTab product={product} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;