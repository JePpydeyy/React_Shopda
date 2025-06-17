
import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDays } from '@fortawesome/free-solid-svg-icons';
import styles from './index.module.css';

const Index = () => {
  const [products, setProducts] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  // API URLs
  const API_BASE = process.env.REACT_APP_API_BASE || 'https://api-tuyendung-cty.onrender.com';
  const API_URL = process.env.REACT_APP_API_URL || 'https://api-tuyendung-cty.onrender.com/api';

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch products
        const productsResponse = await fetch(`${API_URL}/product`);
        const productsData = await productsResponse.json();
        
        // Fetch news
        const newsResponse = await fetch(`${API_URL}/new`);
        const newsData = await newsResponse.json();
        
        // Get latest 4 products and 3 news
        const latestProducts = productsData.slice(0, 4);
        const latestNews = newsData.slice(0, 3);
        
        setProducts(latestProducts);
        setNews(latestNews);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        // Fallback to dummy data if API fails
        setProducts([
          { id: 1, name: 'Sản phẩm 1', image: '/images/product1.jpg', price: '500000' },
          { id: 2, name: 'Sản phẩm 2', image: '/images/product2.jpg', price: '600000' },
          { id: 3, name: 'Sản phẩm 3', image: '/images/product3.jpg', price: '700000' },
          { id: 4, name: 'Sản phẩm 4', image: '/images/product4.jpg', price: '800000' }
        ]);
        setNews([
          { id: 1, title: 'Tin tức 1', content: 'Nội dung tin tức 1', createdAt: '2025-05-23' },
          { id: 2, title: 'Tin tức 2', content: 'Nội dung tin tức 2', createdAt: '2025-05-22' },
          { id: 3, title: 'Tin tức 3', content: 'Nội dung tin tức 3', createdAt: '2025-05-21' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_URL]);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('vi-VN', options);
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Get full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/images/placeholder.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_BASE}${imagePath}`;
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner}>Đang tải...</div>
      </div>
    );
  }

  return (
    <div className={styles.indexContainer}>
      {/* Banner Section */}
      <div className={styles.banner}>
        <img src="images/Banner-Web-KimLongPhatLoc.png" alt="Banner" className={styles.bannerImage} />
      </div>

 

      {/* New Product Section */}
      <div className={styles.newProductSection}>
        <div className={styles.newProductContainer}>
         
          <div className={styles.newProductRight}>
            <div className={styles.productsGrid}>
              {products.map((product, index) => (
                <div key={product.id} className={styles.productCard}>
                  <div className={styles.productImageWrapper}>
                    <img 
                      src={getImageUrl(product.image)} 
                      alt={product.name}
                      className={styles.productCardImage}
                      onError={(e) => {
                        e.target.src = '/images/placeholder.jpg';
                      }}
                    />
                    <div className={styles.productOverlay}>
                      <button className={styles.quickViewBtn}>Xem Nhanh</button>
                    </div>
                  </div>
                  <div className={styles.productInfo}>
                    <h3 className={styles.productName}>{product.name}</h3>
                    <p className={styles.productPrice}>{formatPrice(product.price)}</p>
                    <div className={styles.productActions}>
                      <button className={styles.addToCartBtn}>Thêm Vào Giỏ</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
           <div className={styles.newProductLeft}>
            <div className={styles.newProductTextContent}>
              <h2 className={styles.newProductTitle}>Sản Phẩm Mới</h2>
              <div className={styles.newProductDescription}>
                <p>
                  Khám phá bộ sưu tập sản phẩm mới nhất từ Tinh Lâm Jewelry. 
                  Những thiết kế độc đáo, tinh tế được chế tác từ những viên đá quý 
                  chất lượng cao, mang đến may mắn và thịnh vượng cho người sở hữu.
                </p>
                <p>
                  Mỗi sản phẩm đều được lựa chọn kỹ lưỡng theo ngũ hành phong thủy, 
                  phù hợp với từng mệnh, giúp gia tăng năng lượng tích cực và 
                  thu hút tài lộc trong cuộc sống.
                </p>
                <button className={styles.viewAllBtn}>Xem Tất Cả Sản Phẩm</button>
              </div>
            </div>
          </div>
        </div>
      </div>
           {/* Collections Section */}
      <div className={styles.collectionsSection}>
        <h2 className={styles.collectionsTitle}>Danh Mục Sản Phẩm</h2>
        <div className={styles.collectionsGrid}>
          <div className={`${styles.collectionCard} ${styles.necklaces}`}>
            <div className={styles.cardBackground}></div>
            <div className={styles.cardOverlay}></div>
            <div className={styles.cardContent}>
              <h3 className={styles.collectionTitle}>Vòng tay phong thủy</h3>
              <a href="#" className={styles.shopNowBtn}>Mua ngay</a>
            </div>
          </div>
          <div className={`${styles.collectionCard} ${styles.rings}`}>
            <div className={styles.cardBackground}></div>
            <div className={styles.cardOverlay}></div>
            <div className={styles.cardContent}>
              <h3 className={styles.collectionTitle}>Vòng đá thời trang</h3>
              <a href="#" className={styles.shopNowBtn}>Mua ngay</a>
            </div>
          </div>
          <div className={`${styles.collectionCard} ${styles.bracelets}`}>
            <div className={styles.cardBackground}></div>
            <div className={styles.cardOverlay}></div>
            <div className={styles.cardContent}>
              <h3 className={styles.collectionTitle}>Sản phẩm hot</h3>
              <a href="#" className={styles.shopNowBtn}>Mua ngay</a>
            </div>
          </div>
        </div>
      </div>

      {/* Ngũ Hành Section */}
      <div className={styles.nguHanhSection}>
        <div className={styles.nguHanhGrid}>
          <div className={`${styles.elementCard} ${styles.mongTho}`}>
            <img src="images/tho.jpg" alt="Mệnh Thổ" className={styles.elementImage} />
            <div className={styles.elementOverlay}></div>
          </div>
          <div className={`${styles.elementCard} ${styles.mongKim}`}>
            <img src="images/kim.jpg" alt="Mệnh Kim" className={styles.elementImage} />
            <div className={styles.elementOverlay}></div>
          </div>
          <div className={`${styles.elementCard} ${styles.mongThuy}`}>
            <img src="images/thuy.jpg" alt="Mệnh Thủy" className={styles.elementImage} />
            <div className={styles.elementOverlay}></div>
          </div>
          <div className={`${styles.elementCard} ${styles.mongMoc}`}>
            <img src="images/moc.jpg" alt="Mệnh Mộc" className={styles.elementImage} />
            <div className={styles.elementOverlay}></div>
          </div>
          <div className={`${styles.elementCard} ${styles.mongHoa}`}>
            <img src="images/hoa.jpg" alt="Mệnh Hỏa" className={styles.elementImage} />
            <div className={styles.elementOverlay}></div>
          </div>
          <div className={`${styles.elementCard} ${styles.thoiThuong}`}>
            <img src="images/thoitrang.jpg" alt="Thời Thượng" className={styles.elementImage} />
            <div className={styles.elementOverlay}></div>
          </div>
        </div>
        <div className={styles.nguHanhDesc}>
          <h2 className={styles.nguHanhTitle}>Ngũ hành</h2>
          <p className={styles.nguHanhText}>
            Vòng đá phong thủy theo ngũ hành (<span className={styles.nguHanhHighlight}>Kim, Thủy, Mộc, Hỏa, Thổ</span>) là những chiếc vòng được làm từ chính những viên đá có ready trong tự nhiên, với những màu sắc khác nhau và được chế tác vô cùng kỹ công. Ngoài ra, nó còn được xem là những vật phẩm có khả năng đem lại những may mắn cho con người. Mang đến tài lộc, thịnh vượng, phù trợ cho con người trong công việc cũng như cuộc sống. Đặc biệt là những người kinh doanh, buôn bán sẽ giúp bạn thuận lợi hơn trong con đường công danh sự nghiệp.
          </p>
        </div>
      </div>

      {/* News Section */}
      <div className={styles.newsSection}>
        <h2 className={styles.newsTitle}>Tin Tức Mới Nhất</h2>
        <div className={styles.news}>
          {news.map((article, index) => (
            <div key={article.id} className={styles.newsPost}>
              <div className={styles.postImage}>
                <img 
                  src={getImageUrl(article.image) || "images/kim.jpg"} 
                  alt={article.title} 
                  className={styles.postImageImg}
                  onError={(e) => {
                    e.target.src = 'images/kim.jpg';
                  }}
                />
              </div>
              <div className={styles.postContent}>
                <p className={styles.postDate}>
                  <FontAwesomeIcon icon={faCalendarDays} className={styles.postDateIcon} /> 
                  {formatDate(article.createdAt)}
                </p>
                <h3 className={styles.postTitle}>{article.title}</h3>
                <p className={styles.postExcerpt}>
                  {article.content ? article.content.substring(0, 100) + '...' : 'Đọc thêm để biết chi tiết...'}
                </p>
                <div className={styles.postLink}>
                  <a href={`/news/${article.id}`} className={styles.postLinkA}>XEM THÊM</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
