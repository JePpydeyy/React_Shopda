import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Product.module.css';

const API_BASE_URL = 'https://api-tuyendung-cty.onrender.com/api';
const PRODUCTS_PER_PAGE = 9;

const Product = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000000);
  const [maxPriceLimit, setMaxPriceLimit] = useState(10000000);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [sortType, setSortType] = useState('newest');
  
  const location = useLocation();

  const getURLParams = () => {
    const params = new URLSearchParams(location.search);
    return {
      category: params.get('category'),
      tag: params.get('tag'),
      search: params.get('search'),
    };
  };

  useEffect(() => {
    fetch(`${API_BASE_URL}/product`)
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        const max = data.reduce((acc, cur) => (cur.price > acc ? cur.price : acc), 0);
        const roundedMax = Math.ceil(max / 1000000) * 1000000;
        setMaxPriceLimit(roundedMax);
        setMaxPrice(roundedMax);
      })
      .catch(() => setProducts([]));
  }, []);

  useEffect(() => {
    fetch(`${API_BASE_URL}/category`)
      .then(res => res.json())
      .then(data => {
        const showCategories = data.filter(cat => cat.status === 'show');
        setCategories(showCategories);
      })
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const params = getURLParams();
    setSearch(params.search || '');
    setSelectedCategories(params.category ? [params.category] : []);
  }, [location.search]);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.name_categories?.toLowerCase().includes(search.toLowerCase());
    const matchesPrice = p.price >= minPrice && p.price <= maxPrice;
    const matchesLevel = selectedLevels.length === 0 || selectedLevels.map(l => l.toLowerCase()).includes(p.level.toLowerCase());
    const matchesCategory = selectedCategories.length === 0 || 
      selectedCategories.some(selectedCat => 
        p.category?.name_categories?.toLowerCase().includes(selectedCat.toLowerCase()) ||
        p.category?.category?.toLowerCase().includes(selectedCat.toLowerCase())
      );
    const params = getURLParams();
    const matchesTag = !params.tag || 
      (params.tag === 'hot' && p.tag === 'sale') || 
      (params.tag === 'hot' && p.isHot === true);

    return matchesSearch && matchesPrice && matchesLevel && matchesCategory && matchesTag;
  });

  let sortedProducts = filteredProducts;
  if (sortType === 'price-asc') {
    sortedProducts = [...filteredProducts].sort((a, b) => a.price - b.price);
  } else if (sortType === 'price-desc') {
    sortedProducts = [...filteredProducts].sort((a, b) => b.price - a.price);
  } else if (sortType === 'newest') {
    sortedProducts = [...filteredProducts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  const totalPages = Math.ceil(sortedProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  const formatPrice = price => new Intl.NumberFormat('vi-VN').format(price);

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
      setMinPrice(value >= maxPrice ? maxPrice - 100000 : value);
    } else {
      setMaxPrice(value <= minPrice ? minPrice + 100000 : value);
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    let start = Math.max(1, currentPage - 1);
    let end = Math.min(totalPages, start + 2);
    if (end - start < 2) start = Math.max(1, end - 2);

    const pageNumbers = [];
    for (let i = start; i <= end; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className={styles.productPagination}>
        <a
          href="#"
          onClick={e => {
            e.preventDefault();
            if (currentPage > 1) setCurrentPage(currentPage - 1);
          }}
          className={currentPage === 1 ? styles.disabled : ''}
          aria-label="Previous Page"
        >
          &lt;
        </a>
        {pageNumbers.map(num => (
          <a
            href="#"
            key={num}
            className={currentPage === num ? styles.active : ''}
            onClick={e => {
              e.preventDefault();
              setCurrentPage(num);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            {num}
          </a>
        ))}
        <a
          href="#"
          onClick={e => {
            e.preventDefault();
            if (currentPage < totalPages) setCurrentPage(currentPage + 1);
          }}
          className={currentPage === totalPages ? styles.disabled : ''}
          aria-label="Next Page"
        >
          &gt;
        </a>
      </div>
    );
  };

  const handleLevelChange = level => {
    setSelectedLevels(prev =>
      prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
    );
  };

  const handleCategoryChange = category => {
    setSelectedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  return (
    <section className={`${styles.productPage} ${styles.shop}`}>
      <div className={styles.container}>
        <div className={styles.row}>
          <div className={styles.colLg3}>
            <div className={styles.shopSidebar}>
              <div className={styles.shopSidebarSearch}>
                <form onSubmit={e => e.preventDefault()}>
                  <input
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                  <button type="submit">
                    <i className="fa fa-search"></i>
                  </button>
                </form>
              </div>
              <div className={styles.filterSection}>
                <h6>
                  Giá sản phẩm <span style={{ float: 'right' }}>–</span>
                </h6>
                <div className={styles['price-filter']}>
                  <div className={styles['price-slider-container']}>
                    <div className={styles['price-slider-track']} id="priceTrack"></div>
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
                  Giá <span id="minPriceValue">{formatPrice(minPrice)}</span> VND —{' '}
                  <span id="maxPriceValue">{formatPrice(maxPrice)}</span> VND
                </div>
              </div>
              <div className={styles.filterSection}>
                <h6>PDanh mục sản phẩm</h6>
                <div className={styles.categoryCheckboxGroup}>
                  <label className={styles.categoryCheckboxLabel}>
                    <input
                      type="checkbox"
                      checked={selectedCategories.length === 0}
                      onChange={() => setSelectedCategories([])}
                    />{' '}
                    Tất cả
                  </label>
                  {categories.map(cat => (
                    <label key={cat._id} className={styles.categoryCheckboxLabel}>
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat.category)}
                        onChange={() => handleCategoryChange(cat.category)}
                      />{' '}
                      {cat.category}
                    </label>
                  ))}
                </div>
              </div>
              <div className={styles.filterSection}>
                <h6>Dòng sản phẩm</h6>
                <div className={styles.levelCheckboxGroup}>
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedLevels.length === 0}
                      onChange={() => setSelectedLevels([])}
                    />{' '}
                    Tất cả
                  </label>
                  {['Cao Cấp ', 'Trung Cấp', 'Phổ Thông'].map(level => (
                    <label key={level}>
                      <input
                        type="checkbox"
                        checked={selectedLevels.includes(level)}
                        onChange={() => handleLevelChange(level)}
                      />{' '}
                      {level}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className={styles.colLg9}>
            <div className={styles.shopProductOption}>
              <div className={styles.shopProductOptionLeft}>
                <p>
                  Showing {paginatedProducts.length} of {sortedProducts.length} results
                  {search && ` for "${search}"`}
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
                  <option value="newest">Lọc theo mới nhất </option>
                  <option value="price-asc">Lọc từ thấp tới cao </option>
                  <option value="price-desc">Lọc từ cao tới thấp </option>
                </select>
              </div>
            </div>
            <div className={styles.products}>
              {paginatedProducts.length === 0 && <p>Không tìm thấy sản phẩm </p>}
              {paginatedProducts.map(product => (
                <div className={styles.productItem} key={product._id}>
                  <div className={styles.productItemPic}>
                    {product.tag === 'sale' && <span className={styles.newLabel}>SALE</span>}
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
                  </div>
                </div>
              ))}
            </div>
            {renderPagination()}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Product;