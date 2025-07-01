
import React from 'react';
import styles from './About.module.css';

function About() {
  return (
    <div>
      {/* Hero Section */}
      <div className={styles.mainContainer}>
        <div className={styles.heroImage}>
          <img src="images/about-us-1.jpg" alt="About Us" />
        </div>

        {/* About Us Section */}
        <div className={styles.contentSection}>
          <div className={styles.column}>
            <h2 className={styles.columnTitle}>Về chúng tôi?</h2>
            <p>
              Tịnh Lâm là đứa con tinh thần mà Huỳnh Lập tâm huyết nhất. Sở dĩ đặt tên thương hiệu là Tịnh Lâm bởi đây là một nhân vật rất quen thuộc với những ai là fan của Huỳnh Lập trong các tác phẩm như "Pháp Sư Mù", "Ai Chết Giơ Tay". Nhiều người khi theo dõi các series này quan tâm đến những phụ kiện độc đáo của nhân vật Tịnh Lâm, và vì thế Tịnh Lâm - Trang Sức Phong Thủy ra đời.
            </p>
          </div>

          <div className={styles.divider}></div>

          <div className={styles.column}>
            <h2 className={styles.columnTitle}>Chúng tôi làm gì?</h2>
            <p>
              Thiên nhiên luôn ẩn chứa vẻ đẹp lung linh, huyền ảo và bí ẩn, hòa hợp từ năm yếu tố ngũ hành trong vũ trụ: vĩnh cửu như Kim, sắc sảo như Mộc, dịu dàng như Thủy, mê hoặc như Hỏa, huyền bí như Thổ. Đúng như cái tên, chúng tôi tập trung vào Trang Sức Phong Thủy, mang đến những giá trị cốt lõi và tinh thần quý giá, giúp mỗi người tìm thấy sự cân bằng trong công việc và cuộc sống. Không chỉ mang lại vẻ đẹp bề ngoài, chúng tôi còn cung cấp các yếu tố ngũ hành phù hợp với từng cá nhân để con đường phát triển của họ thăng hoa hơn.
            </p>
          </div>

          <div className={styles.divider}></div>

          <div className={styles.column}>
            <h2 className={styles.columnTitle}>Tại sao nên chọn?</h2>
            <p>
              Một thương hiệu thành công được xây dựng bởi lòng tin và sự hài lòng của khách hàng. Tịnh Lâm ra đời từ sự chân thành, lòng tin và sự đầu tư thời gian để nghiên cứu, mang đến những sản phẩm chất lượng nhất đến người tiêu dùng.
            </p>
          </div>
        </div>
      </div>

      {/* Testimonial Section */}
      <div className={styles.testimonialContainer}>
        <div className={styles.testimonialContent}>
          <div className={styles.quoteText}>
            "Một thương hiệu thành công được xây dựng bởi lòng tin và sự hài lòng của khách hàng. Tịnh Lâm được ra đời bởi điều đó: sự chân thành, lòng tin và hơn hết nữa chúng tôi dành rất nhiều thời gian, tìm hiểu để mang đến những sản phẩm chất lượng nhất đến người tiêu dùng."
          </div>
          <div className={styles.authorSection}>
            <div className={styles.authorAvatar}>HL</div>
            <div className={styles.authorInfo}>
              <h4>Huỳnh Lập</h4>
              <p>TinhLam JW</p>
            </div>
          </div>
        </div>
        <div className={styles.restaurantImage}>
          <img src="images/testimonial-pic.jpg" alt="Restaurant Interior" />
          <div className={styles.lantern}></div>
          <div className={`${styles.lantern} ${styles.lantern2}`}></div>
          <div className={`${styles.lantern} ${styles.lantern3}`}></div>
        </div>
      </div>

      {/* Intro Section */}
      <div className={styles.newWrapper}>
        <div className={styles.title}>TINH LÂM</div>
        <div className={styles.subtitle}>Về Chúng Tôi</div>
        <div className={styles.content}>
          Tịnh Lâm là đứa con tinh thần mà Huỳnh Lập tâm huyết nhất. Sở dĩ đặt tên thương hiệu là Tịnh Lâm bởi đây là một nhân vật rất quen thuộc với những ai là fan của Huỳnh Lập trong các tác phẩm như “Pháp Sư Mù”, “Ai Chết Giơ Tay”. Nhiều người khi theo dõi các series này quan tâm đến những phụ kiện đi kèm của nhân vật Tịnh Lâm, và vì thế Tịnh Lâm – Trang Sức Phong Thủy ra đời.
        </div>
      </div>
    </div>
  );
}

export default About;