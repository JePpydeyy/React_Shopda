import React, { useState, useEffect } from 'react';

const initialProducts = [
  {
    name: 'VÒNG GARNET LỰU ĐỎ',
    price: '4,010,000',
    image: 'https://public.youware.com/users-website-assets/prod/9ad90c6e-7bcc-4cf9-98b3-9b23c289f60f/GARNET-LUU-DO-CHARM-PHUC.png'
  },
  {
    name: 'VÒNG CẨM THẠCH XANH',
    price: '2,340,000',
    image: 'https://public.youware.com/users-website-assets/prod/9ad90c6e-7bcc-4cf9-98b3-9b23c289f60f/CAM-THACH-XANH-CHARM-LOC.png'
  },
  {
    name: 'VÒNG APATITE BIỂN XANH',
    price: '2,740,000',
    image: 'https://public.youware.com/users-website-assets/prod/9ad90c6e-7bcc-4cf9-98b3-9b23c289f60f/APATITE-CHARM-THO.png'
  },
  {
    name: 'VÒNG MOONSTONE',
    price: '2,240,000',
    image: 'https://public.youware.com/users-website-assets/prod/9ad90c6e-7bcc-4cf9-98b3-9b23c289f60f/MOONSTONE-VUONG-MAY-BAC-WEB-TIKTOK.png'
  }
];

const ProductSite = () => {
  const [search, setSearch] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(6000000);

  const filteredProducts = initialProducts.filter(p => {
    const price = parseInt(p.price.replace(/,/g, ''));
    return (
      p.name.toLowerCase().includes(search.toLowerCase()) &&
      price >= minPrice &&
      price <= maxPrice
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

  return (
    <section className="productPage shop">
      <div className="container">
        <div className="row">
          <div className="colLg3">
            <div className="shopSidebar">
              <div className="shopSidebarSearch">
                <form onSubmit={e => e.preventDefault()}>
                  <input
                    type="text"
                    placeholder="Tìm kiếm..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                  <button type="submit"><i className="fa fa-search"></i></button>
                </form>
              </div>
              <div className="filterSection">
                <h6>GIÁ SẢN PHẨM <span style={{ float: 'right' }}>–</span></h6>
                <div className="price-filter">
                  <div className="price-slider-container">
                    <div className="price-slider-track" id="priceTrack"></div>
                  </div>
                  <input
                    type="range"
                    id="minPrice"
                    min="0"
                    max="6000000"
                    step="100000"
                    value={minPrice}
                    onChange={e => handlePriceChange(e, 'min')}
                  />
                  <input
                    type="range"
                    id="maxPrice"
                    min="0"
                    max="6000000"
                    step="100000"
                    value={maxPrice}
                    onChange={e => handlePriceChange(e, 'max')}
                  />
                </div>
                <div className="price-values">
                  Giá: <span id="minPriceValue">0</span> VND — <span id="maxPriceValue">6,000,000</span> VND
                </div>
              </div>
              <div className="filterSection">
                <h6>LOẠI SẢN PHẨM</h6>
                <div>
                  <label><input type="radio" name="productType" /> Phong thủy</label><br />
                  <label><input type="radio" name="productType" /> Thời trang</label>
                </div>
              </div>
              <div className="filterSection">
                <h6>DÒNG SẢN PHẨM</h6>
                <div>
                  <label><input type="radio" name="productLine" /> Cao cấp</label><br />
                  <label><input type="radio" name="productLine" /> Trung cấp</label><br />
                  <label><input type="radio" name="productLine" /> Phổ thông</label>
                </div>
              </div>
              <div className="filterSection">
                <h6>BỘ SƯU TẬP</h6>
                <div>
                  <label><input type="checkbox" name="collection" /> BST Charm Phúc - Lộc - Thọ</label><br />
                  <label><input type="checkbox" name="collection" /> BST Charm Vân Mây</label><br />
                  <label><input type="checkbox" name="collection" /> BST Charm Nơ</label><br />
                  <label><input type="checkbox" name="collection" /> BST Charm Kim Long Phát Lộc</label><br />
                  <label><input type="checkbox" name="collection" /> BST Charm Cá Chép Hóa Rồng</label><br />
                  <label><input type="checkbox" name="collection" /> BST Charm Tỳ Hưu</label><br />
                  <label><input type="checkbox" name="collection" /> Pride Month</label><br />
                  <label><input type="checkbox" name="collection" /> BST Charm Lồng Đèn</label><br />
                  <label><input type="checkbox" name="collection" /> BST Charm Bọc Vàng</label><br />
                  <label><input type="checkbox" name="collection" /> BST Charm Yêu Trẻ</label><br />
                  <label><input type="checkbox" name="collection" /> BST Vòng Cổ Đá Phong Thủy</label><br />
                  <label><input type="checkbox" name="collection" /> BST Vòng Hổ Phách</label><br />
                  <label><input type="checkbox" name="collection" /> BST Charm Ống Hồ</label><br />
                  <label><input type="checkbox" name="collection" /> BST Charm Sen Việt</label>
                </div>
              </div>
            </div>
          </div>
          <div className="colLg9">
            <div className="shopProductOption">
              <div className="shopProductOptionLeft">
                <p>Hiển thị {filteredProducts.length} trong {initialProducts.length} kết quả</p>
              </div>
              <div className="shopProductOptionRight">
                <select>
                  <option value="">Sắp xếp theo sự phổ biến</option>
                  <option value="">Sắp xếp theo mới nhất</option>
                  <option value="">Sắp xếp theo giá: thấp đến cao</option>
                  <option value="">Sắp xếp theo giá: cao đến thấp</option>
                </select>
              </div>
            </div>
            <div className="products">
              {filteredProducts.length === 0 && <p>Không tìm thấy sản phẩm.</p>}
              {filteredProducts.map((product, idx) => (
                <div className="productItem" key={idx}>
                  <div className="productItemPic">
                    <span className="newLabel">NEW</span>
                    <a href="#" className="productImgLink">
                      <img src={product.image} alt={product.name} />
                    </a>
                  </div>
                  <div className="productItemText">
                    <h6>{product.name}</h6>
                    <h5>{product.price} VND</h5>
                    <div className="hoverContent">
                      <a href="#" className="viewDetailsBtn">Xem chi tiết</a>
                      <div className="productRating">
                        <div className="stars">
                          {[...Array(5)].map((_, i) => (
                            <i key={i} className="fa-regular fa-star"></i>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="productPagination">
              <a href="#" className="active">1</a>
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
  );
};

export default ProductSite;