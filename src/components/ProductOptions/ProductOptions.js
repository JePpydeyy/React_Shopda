import React from 'react';
import styles from '../ProductDetail/ProductDetail.module.css';

const ProductOptions = ({ 
  quantity,
  wristSize,
  onIncreaseQuantity,
  onDecreaseQuantity,
  onIncreaseWristSize,
  onDecreaseWristSize,
  weight,
  size
}) => {
  // Lấy kích thước viên đá
  const stoneSize = weight ? `${weight}` : '10,5 Li';

  // Lấy danh sách kích thước có sẵn từ prop size (là mảng size_name đã lọc stock > 0)
  const availableSizes = size || [];
  const currentIndex = availableSizes.indexOf(wristSize);

  return (
    <div className={styles.options}>
      <div className={styles.stoneSize}>
        <label>KÍCH THƯỚC VIÊN ĐÁ: {stoneSize}</label>
      </div>
      <div className={styles.wristSize}>
        <label>KÍCH THƯỚC CỔ TAY</label>
        <button 
          onClick={onDecreaseWristSize} 
          disabled={currentIndex <= 0}
          aria-label="Giảm kích thước cổ tay"
        >
          -
        </button>
        <span id="wrist-size" className={styles.wristSizeSpan}>{wristSize}</span> {/* Loại bỏ toFixed */}
        <button 
          onClick={onIncreaseWristSize} 
          disabled={currentIndex >= availableSizes.length - 1}
          aria-label="Tăng kích thước cổ tay"
        >
          +
        </button>
      </div>
      <div className={styles.quantity}>
        <label>SỐ LƯỢNG</label>
        <button 
          onClick={onDecreaseQuantity} 
          disabled={quantity <= 1}
          aria-label="Giảm số lượng"
        >
          -
        </button>
        <span id="quantity" className={styles.quantitySpan}>{quantity}</span>
        <button 
          onClick={onIncreaseQuantity} 
          aria-label="Tăng số lượng"
        >
          +
        </button>
      </div>
    </div>
  );
};

export default ProductOptions;