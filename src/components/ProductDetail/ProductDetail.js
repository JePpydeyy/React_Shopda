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

const DescriptionTab = () => (
  <div className="tab-pane">
    <p><b>ĐÁ CẨM THẠCH XANH</b></p>
    <p><b>(JADEITE)</b></p>
    <p><b>Sơ lược:</b> Đá cẩm thạch là loại đá quý rất được ưa chuộng ở khu vực châu Á, được hình thành từ trong lòng đất, những phiến đá tự nhiên nằm sâu trong lớp vỏ trái đất được tôi luyện dưới sức ép và nhiệt độ. Được chắt lọc từ những gì tinh túy nhất của tự nhiên, chính vì thế đá cẩm thạch mới có được độ bền cao.</p>
    <p>Từ thời xa xưa, cẩm thạch (hay còn được gọi là đá Trời) đã là loại đá quý vốn chỉ dành cho giới vua chúa, quý tộc trong văn hóa Á Đông.</p>
    <p><b>Khu vực được khai thác:</b> Myanmar (Miến Điện), Trung Quốc, Ý, Nhật, Nga, Mỹ, Guatemala,… Việt Nam (Sơn La)</p>
    <p><b>Thành phần:</b> NaAlSi2O6 – Jadeite, Ca2(Mg,Fe)5(Si4O11)2(OH)2 – Nephrite</p>
    <p><b>Độ cứng thang Mohs:</b> 6.0 – 7.0 /10</p>
    <p><b>Mạng phù hợp: Mộc – Hỏa</b></p>
    <p><b>Tác dụng tinh thần:</b>
      – Tiếp thêm nguồn động lực, mạnh mẽ, lạc quan trong cuộc sống.<br />
      – Giúp xua tan sự phiền muộn.<br />
      – Thúc đẩy khả năng sinh sản.<br />
      – Mang đến cho bạn một cuộc sống hạnh phúc, may mắn trong công việc, học tập, thăng quan, phát tài.<br />
      – Có thể xóa đi sự hiểu lầm, xua tan bế tắc trong những mối quan hệ tình cảm, tăng khả năng tập trung cho người đeo.
    </p>
    <p><b>Tác dụng sức khỏe:</b>
      – Đá cẩm thạch có tác dụng trải rộng toàn thân con người. Hỗ trợ gan, thận loại bỏ độc tố, chất dư thừa, cân bằng lượng nước, muối và nồng độ pH của cơ thể.<br />
      – Các vấn đề liên quan tới xương khớp cũng được cải thiện, giảm tỷ lệ các bệnh đau hông và co cơ, chuột rút.<br />
      – Giúp cân bằng năng lượng, rất có lợi cho những người gặp vấn đề về sinh sản.
    </p>
    <p><b>Cách bảo quản đá Cẩm Thạch:</b>
      – Tránh xịt nước hoa hoặc keo cứng tóc lên vòng tay.<br />
      – Luôn cởi vòng tay khi tập thể thao hoặc làm việc nặng nhọc.<br />
      – Bảo quản riêng, không chung đụng với các loại trang sức đá quý khác.<br />
      – Bọc bằng vải mềm, và cho vào hộp.<br />
      – Khi làm sạch đá cẩm thạch, bạn chỉ cần ngâm trong nước ấm, rồi lau khô bằng vải mềm sạch.
    </p>
  </div>
);

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [wristSize, setWristSize] = useState(15);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('delivery');

  useEffect(() => {
    fetch(`https://api-tuyendung-cty.onrender.com/api/product/${id}`)
      .then(res => res.json())
      .then(data => setProduct(data))
      .catch(() => setProduct(null));
  }, [id]);

  if (!product) {
    return <div className={styles.loading}>Đang tải...</div>;
  }

  const images = product.images && product.images.length > 0
    ? product.images.map(img => `https://api-tuyendung-cty.onrender.com/${img}`)
    : ["https://via.placeholder.com/300"];

  const handleIncreaseQuantity = () => setQuantity(quantity + 1);
  const handleDecreaseQuantity = () => quantity > 1 && setQuantity(quantity - 1);
  const handleIncreaseWristSize = () => setWristSize(wristSize + 1);
  const handleDecreaseWristSize = () => wristSize > 1 && setWristSize(wristSize - 1);
  const handleNextImage = () => setCurrentImageIndex((currentImageIndex + 1) % images.length);
  const handlePrevImage = () => setCurrentImageIndex((currentImageIndex - 1 + images.length) % images.length);
  const handleThumbnailClick = (index) => setCurrentImageIndex(index);
  const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted');
  };

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
          <p><strong>MẠNG PHÙ HỢP: {product.suitableNetwork || 'Hỏa - Thổ'}</strong></p>
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
              className={`nav-link ${activeTab === 'delivery' ? 'active' : ''}`}
              onClick={() => { setActiveTab('delivery'); console.log('Switched to delivery'); }}
              role="tab"
              aria-selected={activeTab === 'delivery'}
            >
              Thông tin giao hàng
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'description' ? 'active' : ''}`}
              onClick={() => { setActiveTab('description'); console.log('Switched to description'); }}
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
            <DescriptionTab />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;