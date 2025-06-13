import React from 'react';
import ImageGallery from '../ImageGallery/ImageGallery';
import ProductOptions from '../ProductOptions/ProductOptions';
import styles from './ProductDetail.module.css';

const ProductDetail = () => {
  const [quantity, setQuantity] = React.useState(1);
  const [wristSize, setWristSize] = React.useState(15);
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const images = [
    "https://tinhlamjw.com/wp-content/uploads/2025/02/GARNET-LUU-DO-CHARM-PHUC.png",
    "https://tinhlamjw.com/wp-content/uploads/2024/01/DO-SIZE-TAY.jpg",
    "https://tinhlamjw.com/wp-content/uploads/2024/01/BAO-QUAN.jpg",
    "https://tinhlamjw.com/wp-content/uploads/2024/01/NIEN-MENH.jpg",
    "https://tinhlamjw.com/wp-content/uploads/2023/10/dung-2.jpeg"
  ];

  const handleIncreaseQuantity = () => setQuantity(quantity + 1);
  const handleDecreaseQuantity = () => quantity > 1 && setQuantity(quantity - 1);

  const handleIncreaseWristSize = () => setWristSize(wristSize + 1);
  const handleDecreaseWristSize = () => wristSize > 1 && setWristSize(wristSize - 1);

  const handleNextImage = () => setCurrentImageIndex((currentImageIndex + 1) % images.length);
  const handlePrevImage = () => setCurrentImageIndex((currentImageIndex - 1 + images.length) % images.length);
  const handleThumbnailClick = (index) => setCurrentImageIndex(index);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.nameProduct}>VÒNG GARNET LƯU ĐỎ</h1>
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
          <p><strong>Mã sản phẩm: TL00192-KIMPHUC</strong></p>
          <span className={styles.sale}><strong>Trạng thái:</strong> SALE</span>
          <p><strong>NỘI DUNG SẢN PHẨM:</strong></p>
          <p>Đá Garnet hay Granat là 1 loại đá quý có lịch sử lâu đời trong khoáng sản học, thường được biết đến với cái tên Ngọc hồng lựu bởi màu đỏ của nó giống như quả lựu. Có khoảng 20 loại khác nhau như: Almandine, Rhodolite, Spessartine, Hessonite, Tsavorite, Demantoid,…mà ở Việt Nam người ta hay gọi dân dã là đá Garnet đỏ, Garnet nâu, Garnet xanh, Garnet vàng, Garnet đen hay Garnet sao. Khi gọi đá Garnet chung chung hay Ngọc hồng lựu, ý mọi người nói đến đá Garnet đỏ (đỏ sậm) – loại đá phổ biến nhất.</p>
          <p><strong>MẠNG PHÙ HỢP: HỎA - THỔ</strong></p>
          <hr />
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
      <div className={styles.contact}>
        LIÊN HỆ HOTLINE: 1900 29 29 17
      </div>
    </div>
  );
};

export default ProductDetail;