import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-regular-svg-icons';

import styles from './product.module.css';

const initialProducts = [
  {
    name: 'VÒNG GARNET LỰU ĐỎ',
    price: 4010000,
    image: 'https://public.youware.com/users-website-assets/prod/9ad90c6e-7bcc-4cf9-98b3-9b23c289f60f/GARNET-LUU-DO-CHARM-PHUC.png',
  },
  {
    name: 'VÒNG CẨM THẠCH XANH',
    price: 2340000,
    image: 'https://public.youware.com/users-website-assets/prod/9ad90c6e-7bcc-4cf9-98b3-9b23c289f60f/CAM-THACH-XANH-CHARM-LOC.png',
  },
  {
    name: 'VÒNG APATITE BIỂN XANH',
    price: 2740000,
    image: 'https://public.youware.com/users-website-assets/prod/9ad90c6e-7bcc-4cf9-98b3-9b23c289f60f/APATITE-CHARM-THO.png',
  },
  {
    name: 'VÒNG MOONSTONE',
    price: 2240000,
    image: 'https://public.youware.com/users-website-assets/prod/9ad90c6e-7bcc-4cf9-98b3-9b23c289f60f/MOONSTONE-VUONG-MAY-BAC-WEB-TIKTOK.png',
  },
  {
    name: 'VÒNG MẮT HỔ VÀNG NÂU - PHỐI ƯU LINH',
    price: 1254000,
    image: 'https://public.youware.com/users-website-assets/prod/9ad90c6e-7bcc-4cf9-98b3-9b23c289f60f/MH-VANG-VUONG-MAY-BAC-WEB-TIKTOK.png',
  },
  {
    name: 'VÒNG MẮT HỔ ĐỎ - PHỐI DIOPSIDE',
    price: 1540000,
    image: 'https://public.youware.com/users-website-assets/prod/9ad90c6e-7bcc-4cf9-98b3-9b23c289f60f/MH-DO-VUONG-MAY-DIOPSIDE-WEB-TIKTOK.png',
  },
];

const initialCartItems = [
  {
    name: 'VÒNG APATITE BIỂN XANH',
    price: 2740000,
    quantity: 6,
    image: 'https://public.youware.com/users-website-assets/prod/9ad90c6e-7bcc-4cf9-98b3-9b23c289f60f/APATITE-CHARM-THO.png',
    charm: 'Charm Kim Thọ',
    stoneSize: '10 Li (Phù Hợp Size Tay: 15cm-20cm)',
    wristSize: '12 cm',
  },
  {
    name: 'VÒNG MẮT HỔ ĐỎ',
    price: 1540000,
    quantity: 2,
    image: 'https://public.youware.com/users-website-assets/prod/9ad90c6e-7bcc-4cf9-98b3-9b23c289f60f/MH-DO-VUONG-MAY-DIOPSIDE.png',
    charm: 'Charm Diopside',
    stoneSize: '10 Li (Phù Hợp Size Tay: 15cm-18cm)',
    wristSize: '13 cm',
  },
  {
    name: 'VÒNG MẮT DIỀU HÀU',
    price: 3000000,
    quantity: 1,
    image: 'https://public.youware.com/users-website-assets/prod/9ad90c6e-7bcd-4cf9-98b3-9b23c289f60f/MAT-DIEU-HAU.png',
    charm: 'Charm Bạc 925',
    stoneSize: '10 Li (Phù Hợp Size Tay: 15cm-18cm)',
    wristSize: '14 cm',
  },
];

const ProductSite = () => {
  const [search, setSearch] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(6000000);
  const [cartItems, setCartItems] = useState(initialCartItems);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const filteredProducts = initialProducts.filter((p) => {
    return (
      p.name.toLowerCase().includes(search.toLowerCase()) &&
      p.price >= minPrice &&
      p.price <= maxPrice
    );
  });

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price);

  useEffect(() => {
    const minPriceValue = document.getElementById('minPriceValue');
    const maxPriceValue = document.getElementById('maxPriceValue');
    const priceTrack = document.getElementById('priceTrack');
    if (minPriceValue) minPriceValue.textContent = formatPrice(minPrice);
    if (maxPriceValue) maxPriceValue.textContent = formatPrice(maxPrice);
    if (priceTrack) {
      const minPercent = (minPrice / 6000000) * 100;
      const maxPercent = (maxPrice / 6000000) * 100;
      priceTrack.style.left = `${minPercent}%`;
      priceTrack.style.width = `${maxPercent - minPercent}%`;
    }
  }, [minPrice, maxPrice]);

  const handlePriceChange = (e, type) => {
    const value = parseInt(e.target.value);
    if (type === 'min') {
      if (value >= maxPrice) {
        setMinPrice(maxPrice - 100000);
      } else {
        setMinPrice(value);
      }
    } else {
      if (value <= minPrice) {
        setMaxPrice(minPrice + 100000);
      } else {
        setMaxPrice(value);
      }
    }
  };

  const updateQuantity = (index, delta) => {
    setCartItems((prevItems) =>
      prevItems.map((item, i) =>
        i === index
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const removeItem = (index) => {
    setCartItems((prevItems) => prevItems.filter((_, i) => i !== index));
  };

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const openCartPopup = () => setIsCartOpen(true);
  const closeCartPopup = () => setIsCartOpen(false);

  return (
    <>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.container}>
          <a href="#" className={styles.logo}>
            <div className={styles['logo-icon']}>TL</div>
            <div>
              <div className={styles['logo-text']}>TINH LÂM</div>
              <div className={styles['logo-subtitle']}>TRANG SỨC PHONG THỦY</div>
            </div>
          </a>
          <div className={styles['header-right']}>
            <div className={styles['search-cart']}>
              <i className="fa-solid fa-magnifying-glass"></i>
              <div className={styles['cart-container']} onClick={openCartPopup}>
                <i className="fa-solid fa-cart-shopping"></i>
              </div>
            </div>
            <div className={styles['language-selector']}>
              <span>Tiếng Việt</span>
              <i className="fa-solid fa-caret-down"></i>
            </div>
          </div>
        </div>
      </header>

      {/* Shop Section */}
      <section className={styles.shop}>
        <div className={styles.container}>
          <div className={styles.row}>
            <div className={styles.colLg3}>
              <div className={styles.shopSidebar}>
                <div className={styles.shopSidebarSearch}>
                  <form onSubmit={(e) => e.preventDefault()}>
                    <input
                      type="text"
                      placeholder="Tìm kiếm..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    <button type="submit">
                      <i className="fa fa-search"></i>
                    </button>
                  </form>
                </div>
                <div className={styles.filterSection}>
                  <h6>
                    GIÁ SẢN PHẨM <span style={{ float: 'right' }}>–</span>
                  </h6>
                  <div className={styles['price-filter']}>
                    <div className={styles['price-slider-container']}>
                      <div
                        className={styles['price-slider-track']}
                        id="priceTrack"
                      ></div>
                    </div>
                    <input
                      type="range"
                      id="minPrice"
                      min="0"
                      max="6000000"
                      step="100000"
                      value={minPrice}
                      onChange={(e) => handlePriceChange(e, 'min')}
                    />
                    <input
                      type="range"
                      id="maxPrice"
                      min="0"
                      max="6000000"
                      step="100000"
                      value={maxPrice}
                      onChange={(e) => handlePriceChange(e, 'max')}
                    />
                  </div>
                  <div className={styles['price-values']}>
                    Giá: <span id="minPriceValue">{formatPrice(minPrice)}</span>{' '}
                    VND — <span id="maxPriceValue">{formatPrice(maxPrice)}</span>{' '}
                    VND
                  </div>
                </div>
                <div className={styles.filterSection}>
                  <h6>LOẠI SẢN PHẨM</h6>
                  <div>
                    <label>
                      <input type="radio" name="productType" /> Phong thủy
                    </label>
                    <br />
                    <label>
                      <input type="radio" name="productType" /> Thời trang
                    </label>
                  </div>
                </div>
                <div className={styles.filterSection}>
                  <h6>DÒNG SẢN PHẨM</h6>
                  <div>
                    <label>
                      <input type="radio" name="productLine" /> Cao cấp
                    </label>
                    <br />
                    <label>
                      <input type="radio" name="productLine" /> Trung cấp
                    </label>
                    <br />
                    <label>
                      <input type="radio" name="productLine" /> Phổ thông
                    </label>
                  </div>
                </div>
                <div className={styles.filterSection}>
                  <h6>BỘ SƯU TẬP</h6>
                  <div>
                    <label>
                      <input type="checkbox" name="collection" /> BST Charm Phúc - Lộc - Thọ
                    </label>
                    <br />
                    <label>
                      <input type="checkbox" name="collection" /> BST Charm Vân Mây
                    </label>
                    <br />
                    <label>
                      <input type="checkbox" name="collection" /> BST Charm Nơ
                    </label>
                    <br />
                    <label>
                      <input type="checkbox" name="collection" /> BST Charm Kim Long Phát Lộc
                    </label>
                    <br />
                    <label>
                      <input type="checkbox" name="collection" /> BST Charm Cá Chép Hóa Rồng
                    </label>
                    <br />
                    <label>
                      <input type="checkbox" name="collection" /> BST Charm Tỳ Hưu
                    </label>
                    <br />
                    <label>
                      <input type="checkbox" name="collection" /> Pride Month
                    </label>
                    <br />
                    <label>
                      <input type="checkbox" name="collection" /> BST Charm Lồng Đèn
                    </label>
                    <br />
                    <label>
                      <input type="checkbox" name="collection" /> BST Charm Bọc Vàng
                    </label>
                    <br />
                    <label>
                      <input type="checkbox" name="collection" /> BST Charm Yêu Trẻ
                    </label>
                    <br />
                    <label>
                      <input type="checkbox" name="collection" /> BST Vòng Cổ Đá Phong Thủy
                    </label>
                    <br />
                    <label>
                      <input type="checkbox" name="collection" /> BST Vòng Hổ Phách
                    </label>
                    <br />
                    <label>
                      <input type="checkbox" name="collection" /> BST Charm Ống Hồ
                    </label>
                    <br />
                    <label>
                      <input type="checkbox" name="collection" /> BST Charm Sen Việt
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.colLg9}>
              <div className={styles.shopProductOption}>
                <div className={styles.shopProductOptionLeft}>
                  <p>
                    Hiển thị 1–{filteredProducts.length} trong{' '}
                    {initialProducts.length} kết quả
                  </p>
                </div>
                <div className={styles.shopProductOptionRight}>
                  <select>
                    <option value="">Sắp xếp theo sự phổ biến</option>
                    <option value="">Sắp xếp theo mới nhất</option>
                    <option value="">Sắp xếp theo giá: thấp đến cao</option>
                    <option value="">Sắp xếp theo giá: cao đến thấp</option>
                  </select>
                </div>
              </div>
              <div className={styles.products}>
                {filteredProducts.length === 0 && (
                  <p>Không tìm thấy sản phẩm.</p>
                )}
                {filteredProducts.map((product, idx) => (
                  <div className={styles.productItem} key={idx}>
                    <div className={styles.productItemPic}>
                      <span className={styles.newLabel}>NEW</span>
                      <a href="#" className={styles.productImgLink}>
                        <img src={product.image} alt={product.name} />
                      </a>
                    </div>
                    <div className={styles.productItemText}>
                      <h6>{product.name}</h6>
                      <h5>{formatPrice(product.price)} VND</h5>
                      <div className={styles.hoverContent}>
                        <a href="#" className={styles.viewDetailsBtn}>
                          Xem chi tiết
                        </a>
                        <div className={styles.productRating}>
                          <div className={styles.stars}>
                            {[...Array(5)].map((_, i) => (
                              <FontAwesomeIcon icon={faStar} key={i} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.productPagination}>
                <a href="#" className={styles.active}>
                  1
                </a>
                <a href="#">2</a>
                <a href="#">3</a>
                <a href="#">4</a>
                <span>...</span>
                <a href="#">21</a>
                <a href="#">22</a>
                <a href="#">23</a>
                <a href="#">→</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cart Popup Overlay */}
      <div
        id="cartPopupOverlay"
        style={{ display: isCartOpen ? 'block' : 'none' }}
      ></div>

      {/* Cart Popup */}
      <div
        id="cartPopup"
        className={styles['cart-popup']}
        style={{ display: isCartOpen ? 'block' : 'none' }}
      >
        <div className={styles['cart-popup-header']}>
          <span>GIỎ HÀNG CỦA BẠN</span>
          <button className={styles['close-btn']} onClick={closeCartPopup}>
            ×
          </button>
        </div>
        <div className={styles['cart-popup-body']}>
          {cartItems.map((item, index) => (
            <div className={styles['cart-popup-product']} key={index}>
              <img src={item.image} alt={item.name} />
              <div className={styles['cart-popup-info']}>
                <div className={styles['cart-popup-title']}>{item.name}</div>
                <div className={styles['cart-popup-desc']}>
                  <b>Charm:</b> {item.charm}
                  <br />
                  <b>Size Viên Đá:</b> {item.stoneSize}
                  <br />
                  <b>Size Tay:</b> {item.wristSize}
                </div>
                <div className={styles['cart-popup-price']}>
                  Price: {formatPrice(item.price)} VND
                </div>
                <div className={styles['cart-popup-qty']}>
                  <button onClick={() => updateQuantity(index, -1)}>-</button>
                  <input type="text" value={item.quantity} readOnly />
                  <button onClick={() => updateQuantity(index, 1)}>+</button>
                  <span className={styles['cart-popup-total']}>
                    {formatPrice(item.price * item.quantity)} VND
                  </span>
                </div>
              </div>
              <button
                className={styles['cart-popup-remove']}
                onClick={() => removeItem(index)}
              >
                <i className="fa fa-trash"></i>
              </button>
            </div>
          ))}
        </div>
        <div className={styles['cart-popup-footer']}>
          <div className={styles['cart-popup-summary']}>
            <div>
              <b>Tổng Cộng:</b> {formatPrice(totalPrice)} VND
            </div>
            <div>Total: {formatPrice(totalPrice)} VND</div>
          </div>
          <div className={styles['cart-popup-actions']}>
            <button className={styles.outline}>
              <a href="./cart.html">Xem Giỏ Hàng</a>
            </button>
            <button className={styles.primary}>Thanh Toán</button>
          </div>
          <button
            className={`${styles.outline} ${styles.full}`}
            onClick={closeCartPopup}
          >
            Tiếp tục Mua Sắm
          </button>
        </div>
      </div>
    </>
  );
};

export default ProductSite;