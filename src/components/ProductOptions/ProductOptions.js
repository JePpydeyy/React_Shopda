import React from 'react';
import styles from './ProductOptions.module.css';

const ProductOptions = ({ quantity, wristSize, onIncreaseQuantity, onDecreaseQuantity, onIncreaseWristSize, onDecreaseWristSize }) => {
  return (
    <div className={styles.options}>
      <select id="charm" className={styles.select}>
        <option>Charm</option>
        <option>Charm 1</option>
        <option>Charm 2</option>
      </select>
      <select id="size" className={styles.select}>
        <option>Size Viên Đá</option>
        <option>Size 1</option>
        <option>Size 2</option>
      </select>
      <div className={styles.wristSize}>
        <label>KÍCH THƯỚC CỔ TAY</label>
        <button onClick={onDecreaseWristSize}>-</button>
        <span id="wrist-size" className={styles.wristSizeSpan}>{wristSize}</span> cm
        <button onClick={onIncreaseWristSize}>+</button>
      </div>
      <p><a href="#" className={styles.link}>Xem cách đo cổ tay</a></p>
      <div className={styles.quantity}>
        <label>SỐ LƯỢNG</label>
        <button onClick={onDecreaseQuantity}>-</button>
        <span id="quantity" className={styles.quantitySpan}>{quantity}</span>
        <button onClick={onIncreaseQuantity}>+</button>
      </div>
      <button className={styles.addToCart}>THÊM VÀO GIỎ HÀNG</button>
    </div>
  );
};

export default ProductOptions;