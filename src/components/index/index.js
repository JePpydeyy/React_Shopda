
import React, { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faCalendarDays } from '@fortawesome/free-solid-svg-icons';
import styles from './index.module.css';

const Index = () => {
  const scrollWrapperRef = useRef(null);
  const leftBtnRef = useRef(null);
  const rightBtnRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(3); // Start at index 3
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startTranslate, setStartTranslate] = useState(0);
  const PRODUCT_WIDTH = 287.5; // 277.5px + 10px gap
  const VISIBLE_PRODUCTS = 3;
  const TOTAL_PRODUCTS = 10;

  // Product data
  const products = [
    'https://tinhlamjw.com/wp-content/uploads/2024/01/z5058266514556_867e50e8106010032c3bcdb3337bf5e7.jpg',
    'https://tinhlamjw.com/wp-content/uploads/2024/01/z5058265207049_a26e39eec124c4561326e44d1e859505.jpg',
    'https://tinhlamjw.com/wp-content/uploads/2024/01/z5058266519758_4c205caaace0ce22de0eb9df57fd4260.jpg',
    'https://tinhlamjw.com/wp-content/uploads/2024/01/z5058265213422_27be2f47ee8685098b2a3a4f56828b91.jpg',
    'https://tinhlamjw.com/wp-content/uploads/2024/01/z5058266514556_867e50e8106010032c3bcdb3337bf5e7.jpg',
    'https://tinhlamjw.com/wp-content/uploads/2024/01/z5058265207049_a26e39eec124c4561326e44d1e859505.jpg',
    'https://tinhlamjw.com/wp-content/uploads/2024/01/z5058266519758_4c205caaace0ce22de0eb9df57fd4260.jpg',
    'https://tinhlamjw.com/wp-content/uploads/2024/01/z5058265213422_27be2f47ee8685098b2a3a4f56828b91.jpg',
    'https://tinhlamjw.com/wp-content/uploads/2024/01/z5058266514556_867e50e8106010032c3bcdb3337bf5e7.jpg',
    'https://tinhlamjw.com/wp-content/uploads/2024/01/z5058265207049_a26e39eec124c4561326e44d1e859505.jpg',
  ];

  // Move to specific index
  const moveToIndex = (index, smooth = true) => {
    if (isDragging) return;

    setCurrentIndex(index);
    const scrollWrapper = scrollWrapperRef.current;
    scrollWrapper.style.transition = smooth ? 'transform 0.5s ease' : 'none';
    const newTranslate = -index * PRODUCT_WIDTH;
    setStartTranslate(newTranslate);
    scrollWrapper.style.transform = `translate3d(${newTranslate}px, 0, 0)`;

    // Infinite reset
    if (index <= -VISIBLE_PRODUCTS) {
      setTimeout(() => {
        setCurrentIndex(TOTAL_PRODUCTS);
        moveToIndex(TOTAL_PRODUCTS, false);
      }, 50);
    } else if (index >= TOTAL_PRODUCTS + VISIBLE_PRODUCTS) {
      setTimeout(() => {
        setCurrentIndex(0);
        moveToIndex(0, false);
      }, 50);
    }
  };

  // Handle mouse drag
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setStartX(e.pageX);
    setStartTranslate(-currentIndex * PRODUCT_WIDTH);
    scrollWrapperRef.current.style.transition = 'none';
    scrollWrapperRef.current.style.cursor = 'grabbing';
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const deltaX = e.pageX - startX;
    const newTranslate = startTranslate + deltaX;
    scrollWrapperRef.current.style.transform = `translate3d(${newTranslate}px, 0, 0)`;
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    scrollWrapperRef.current.style.cursor = 'grab';

    const currentTranslate = startTranslate + (scrollWrapperRef.current.getBoundingClientRect().left - startX);
    let newIndex = Math.round(-currentTranslate / PRODUCT_WIDTH);
    newIndex = Math.max(-VISIBLE_PRODUCTS, Math.min(newIndex, TOTAL_PRODUCTS + VISIBLE_PRODUCTS));
    moveToIndex(newIndex);
  };

  // Handle touch drag
  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX);
    setStartTranslate(-currentIndex * PRODUCT_WIDTH);
    scrollWrapperRef.current.style.transition = 'none';
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const deltaX = e.touches[0].pageX - startX;
    const newTranslate = startTranslate + deltaX;
    scrollWrapperRef.current.style.transform = `translate3d(${newTranslate}px, 0, 0)`;
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const currentTranslate = startTranslate + (scrollWrapperRef.current.getBoundingClientRect().left - startX);
    let newIndex = Math.round(-currentTranslate / PRODUCT_WIDTH);
    newIndex = Math.max(-VISIBLE_PRODUCTS, Math.min(newIndex, TOTAL_PRODUCTS + VISIBLE_PRODUCTS));
    moveToIndex(newIndex);
  };

  // Initialize carousel
  useEffect(() => {
    const scrollWrapper = scrollWrapperRef.current;
    scrollWrapper.style.width = `${(TOTAL_PRODUCTS + 2 * VISIBLE_PRODUCTS) * PRODUCT_WIDTH}px`;
    scrollWrapper.style.cursor = 'grab';
    moveToIndex(VISIBLE_PRODUCTS);

    const leftBtn = leftBtnRef.current;
    const rightBtn = rightBtnRef.current;

    const handleLeftClick = () => moveToIndex(currentIndex - 1);
    const handleRightClick = () => moveToIndex(currentIndex + 1);

    leftBtn.addEventListener('click', handleLeftClick);
    rightBtn.addEventListener('click', handleRightClick);

    return () => {
      leftBtn.removeEventListener('click', handleLeftClick);
      rightBtn.removeEventListener('click', handleRightClick);
    };
  }, [currentIndex]);

  return (
    <div className={styles.indexContainer}>
      {/* Banner Section */}
      <div className={styles.banner}>
        <img src="images/Banner-Web-KimLongPhatLoc.png" alt="Banner" className={styles.bannerImage} />
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

      {/* New Product Section */}
      <div className={styles.newProduct}>
        <div className={styles.newProductSection}>
          <div className={styles.productTextColumn}>
            <h2 className={styles.newProductTitle}>Bộ Sưu Tập<br />“Kim Long<br />Phát Lộc”</h2>
          </div>
          <div className={styles.imageColumn}>
            <div className={styles.productImageContainer}>
              <img src="images/newsproducts.png" alt="Kim Long Phát Lộc" className={styles.productImage} />
            </div>
          </div>
          <div className={styles.newProductDesc}>
            <div className={styles.productCategory}>Sản Phẩm Phong Thủy</div>
            <h3 className={styles.productName}>Kim Long Phát Lộc</h3>
            <p className={styles.productDescription}>
              Trang Sức Phong Thủy Tinh Lâm cho ra mắt BST mang tên KIM LONG PHÁT LỘC nhằm đáp ứng nhu cầu mong muốn mang đến sự may mắn, nâng tương tích cực, nhằm thúc đẩy năm tài cả nhân, từ đó giúp người đeo có thêm động lực, sự tự tin, bản lĩnh để tiến bước thành công trên con đường phát triển công danh, tích lũy nhiều tài lộc và khẳng định quyền lực cá nhân... cho một năm Thìn Thịnh Vượng.
            </p>
            <button className={styles.ctaButton}>Mua Ngay</button>
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
            Vòng đá phong thủy theo ngũ hành (<span className={styles.nguHanhHighlight}>Kim, Thủy, Mộc, Hỏa, Thổ</span>) là những chiếc vòng được làm từ chính những viên đá có sẵn trong tự nhiên, với những màu sắc khác nhau và được chế tác vô cùng kỹ công. Ngoài ra, nó còn được xem là những vật phẩm có khả năng đem lại những may mắn cho con người. Mang đến tài lộc, thịnh vượng, phù trợ cho con người trong công việc cũng như cuộc sống. Đặc biệt là những người kinh doanh, buôn bán sẽ giúp bạn thuận lợi hơn trong con đường công danh sự nghiệp.
          </p>
        </div>
      </div>

      {/* Product Slider Section */}
      <div className={styles.containerProduct}>
        <button ref={leftBtnRef} className={`${styles.btn} ${styles.btnLeft}`}>
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <button ref={rightBtnRef} className={`${styles.btn} ${styles.btnRight}`}>
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
        <div
          className={styles.scrollWrapper}
          ref={scrollWrapperRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Prepend clones of last VISIBLE_PRODUCTS items */}
          {products.slice(-VISIBLE_PRODUCTS).map((src, index) => (
            <div key={`clone-start-${index}`} className={styles.product}>
              <img src={src} alt={`Sản phẩm clone ${index + 1}`} className={styles.productImage} />
            </div>
          ))}
          {/* Original products */}
          {products.map((src, index) => (
            <div key={`original-${index}`} className={styles.product}>
              <img src={src} alt={`Sản phẩm ${index + 1}`} className={styles.productImage} />
            </div>
          ))}
          {/* Append clones of first VISIBLE_PRODUCTS items */}
          {products.slice(0, VISIBLE_PRODUCTS).map((src, index) => (
            <div key={`clone-end-${index}`} className={styles.product}>
              <img src={src} alt={`Sản phẩm clone ${index + 1}`} className={styles.productImage} />
            </div>
          ))}
        </div>
      </div>

      {/* News Section */}
      <div className={styles.news}>
        {Array(3).fill().map((_, index) => (
          <div key={index} className={styles.newsPost}>
            <div className={styles.postImage}>
              <img src="images/kim.jpg" alt="News Post" className={styles.postImageImg} />
            </div>
            <div className={styles.postContent}>
              <p className={styles.postDate}>
                <FontAwesomeIcon icon={faCalendarDays} className={styles.postDateIcon} /> Tháng Năm 23, 2025
              </p>
              <h3 className={styles.postTitle}>CÁC VÒNG ĐÁ CHO NĂM NĂNG LƯỢNG SỐ 9</h3>
              <div className={styles.postLink}>
                <a href="#" className={styles.postLinkA}>XEM THÊM</a>
              </div>
            </div>
          </div>
        ))}
      </div>

    
    </div>
  );
};

export default Index;
