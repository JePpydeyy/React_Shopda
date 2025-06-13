import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './Product.module.css';

const API_URL = process.env.REACT_APP_API_URL;
const PRODUCTS_PER_PAGE = 9;

const Product = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000000);
  const [maxPriceLimit, setMaxPriceLimit] = useState(10000000); // Giá trị max thực tế
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLevel, setSelectedLevel] = useState('');
  const [sortType, setSortType] = useState('newest');

  // Fetch products from API
  useEffect(() => {
    fetch(`${API_URL}/product`)
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        // Tìm giá lớn nhất và làm tròn lên hàng triệu
        const max = data.reduce((acc, cur) => cur.price > acc ? cur.price : acc, 0);
        const roundedMax = Math.ceil(max / 1000000) * 1000000;
        setMaxPriceLimit(roundedMax);
        setMaxPrice(roundedMax);
      })
      .catch(() => setProducts([]));
  }, []);

  // Filtered products
  let filteredProducts = products.filter((p) => {
    return (
      p.name.toLowerCase().includes(search.toLowerCase()) &&
      p.price >= minPrice &&
      p.price <= maxPrice &&
      (selectedLevel === '' || p.level === selectedLevel)
    );
  });

  // Sort products
  if (sortType === 'price-asc') {
    filteredProducts = filteredProducts.slice().sort((a, b) => a.price - b.price);
  } else if (sortType === 'price-desc') {
    filteredProducts = filteredProducts.slice().sort((a, b) => b.price - a.price);
  } else if (sortType === 'newest') {
    filteredProducts = filteredProducts.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price);

  useEffect(() => {
    const minPriceValue = document.getElementById('minPriceValue');
    const maxPriceValue = document.getElementById('maxPriceValue');
    const priceTrack = document.getElementById('priceTrack');
    if (minPriceValue) minPriceValue.textContent = formatPrice(minPrice);
    if (maxPriceValue) maxPriceValue.textContent = formatPrice(maxPrice);
    if (priceTrack) {
      const minPercent = (minPrice / maxPriceLimit) * 100;
      const maxPercent = (maxPrice / maxPriceLimit) * 100;
      priceTrack.style.left = `${minPercent}%`;
      priceTrack.style.width = `${maxPercent - minPercent}%`;
    }
  }, [minPrice, maxPrice, maxPriceLimit]);

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

  // Pagination controls
  const renderPagination = () => (
    <div className={styles.productPagination}>
      {Array.from({ length: totalPages }, (_, i) => (
        <a
          href="#"
          key={i + 1}
          className={currentPage === i + 1 ? styles.active : ''}
          onClick={(e) => {
            e.preventDefault();
            setCurrentPage(i + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          {i + 1}
        </a>
      ))}
    </div>
  );

  return (
    <section className={`${styles.productPage} ${styles.shop}`}>
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
                    max={maxPriceLimit}
                    step="100000"
                    value={minPrice}
                    onChange={e => handlePriceChange(e, 'min')}
                  />
                  <input
                    type="range"
                    id="maxPrice"
                    min="0"
                    max={maxPriceLimit}
                    step="100000"
                    value={maxPrice}
                    onChange={e => handlePriceChange(e, 'max')}
                  />
                </div>
                <div className={styles['price-values']}>
                  Giá: <span id="minPriceValue">{formatPrice(minPrice)}</span> VND — <span id="maxPriceValue">{formatPrice(maxPrice)}</span> VND
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
                    <input
                      type="radio"
                      name="productLine"
                      value=""
                      checked={selectedLevel === ''}
                      onChange={() => setSelectedLevel('')}
                    /> Tất cả
                  </label>
                  <br />
                  <label>
                    <input
                      type="radio"
                      name="productLine"
                      value="Cao cấp"
                      checked={selectedLevel === 'Cao cấp'}
                      onChange={() => setSelectedLevel('Cao cấp')}
                    /> Cao cấp
                  </label>
                  <br />
                  <label>
                    <input
                      type="radio"
                      name="productLine"
                      value="Trung Cấp"
                      checked={selectedLevel === 'Trung Cấp'}
                      onChange={() => setSelectedLevel('Trung Cấp')}
                    /> Trung Cấp
                  </label>
                  <br />
                  <label>
                    <input
                      type="radio"
                      name="productLine"
                      value="Phổ thông"
                      checked={selectedLevel === 'Phổ thông'}
                      onChange={() => setSelectedLevel('Phổ thông')}
                    /> Phổ thông
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.colLg9}>
            <div className={styles.shopProductOption}>
              <div className={styles.shopProductOptionLeft}>
                <p>
                  Hiển thị {paginatedProducts.length} trong{' '}
                  {filteredProducts.length} kết quả
                </p>
              </div>
              <div className={styles.shopProductOptionRight}>
                <select
                  value={sortType}
                  onChange={e => {
                    setSortType(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="newest">Sắp xếp theo mới nhất</option>
                  <option value="price-asc">Sắp xếp theo giá: thấp đến cao</option>
                  <option value="price-desc">Sắp xếp theo giá: cao đến thấp</option>
                </select>
              </div>
            </div>
            <div className={styles.products}>
              {paginatedProducts.length === 0 && (
                <p>Không tìm thấy sản phẩm.</p>
              )}
              {paginatedProducts.map((product, idx) => (
                <div className={styles.productItem} key={product._id || idx}>
                  <div className={styles.productItemPic}>
                    {product.status === 'Sale' && (
                      <span className={styles.newLabel}>SALE</span>
                    )}
                    <Link to={`/detail/${product._id}`} className={styles.productImgLink}>
                      <img
                        src={
                          product.images && product.images.length > 0
                            ? `${process.env.REACT_APP_API_BASE}/${product.images[0]}`
                            : 'https://via.placeholder.com/300'
                        }
                        alt={product.name}
                      />
                    </Link>
                  </div>
                  <div className={styles.productItemText}>
                    <h6>{product.name}</h6>
                    <h5>{formatPrice(product.price)} VND</h5>
                    {/* <div className={styles.hoverContent}>
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
                    </div> */}
                  </div>
                </div>
              ))}
            </div>
            {/* Pagination luôn ở dưới */}
            {renderPagination()}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Product;