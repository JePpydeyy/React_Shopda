import React from 'react';
import styles from './ProductOptions.module.css';

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

  // Lấy khoảng kích thước từ size, mặc định [12, 16] nếu không có
  const sizeRange = size && size.length === 2 ? [size[0], size[1]] : [12, 22];

  return (
    <div className={styles.options}>
      <div className={styles.stoneSize}>
        <label>KÍCH THƯỚC VIÊN ĐÁ</label>
        <span className={styles.stoneSizeSpan}>{stoneSize}</span>
      </div>
      <div className={styles.wristSize}>
        <label>KÍCH THƯỚC CỔ TAY</label>
        <button 
          onClick={onDecreaseWristSize} 
          disabled={wristSize <= sizeRange[0]}
          aria-label="Giảm kích thước cổ tay"
        >
          -
        </button>
        <span id="wrist-size" className={styles.wristSizeSpan}>{wristSize.toFixed(1)} cm</span>
        <button 
          onClick={onIncreaseWristSize} 
          disabled={wristSize >= sizeRange[1]}
          aria-label="Tăng kích thước cổ tay"
        >
          +
        </button>
      </div>
      <p><a href="#" className={styles.link}>Xem cách đo cổ tay</a></p>
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