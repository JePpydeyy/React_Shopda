import React from 'react';
import './postdetails.module.css'; // Tách CSS nếu muốn, hoặc dùng styled-components

const PostDetail = () => {
  return (
    <div className="container">
      {/* Social Share Icons */}
      <div className="social-share">
        <a
          href="https://www.facebook.com/share.php?u=https%3A%2F%2Ftinhlamjw.com%2Fcac-vong-da-cho-nam-nang-luong-so-9%2F"
          target="_blank"
          rel="noopener noreferrer"
          className="facebook"
          title="Chia sẻ lên Facebook"
        >
          <i className="fab fa-facebook-f"></i>
        </a>
        <a
          href="https://twitter.com/intent/tweet?text=C%C3%81C%20V%C3%92NG%20%C4%90%C3%81%20CHO%20N%C4%82M%20N%C4%82NG%20L%C6%AF%E1%BB%A2NG%20S%E1%BB%90%209%20-%20https%3A%2F%2Ftinhlamjw.com%2Fcac-vong-da-cho-nam-nang-luong-so-9%2F%20"
          target="_blank"
          rel="noopener noreferrer"
          className="twitter"
          title="Chia sẻ lên Twitter"
        >
          <i className="fab fa-twitter"></i>
        </a>
        <a
          href="https://www.pinterest.com/pin/create/button/?url=https%3A%2F%2Ftinhlamjw.com%2Fcac-vong-da-cho-nam-nang-luong-so-9%2F&media=https://tinhlamjw.com/wp-content/uploads/2025/05/banner-website.jpg&description=N%C4%83ng%20l%C6%B0%E1%BB%A3ng%20n%C4%83m%20s%E1%BB%91%209%20..."
          target="_blank"
          rel="noopener noreferrer"
          className="pinterest"
          title="Chia sẻ lên Pinterest"
        >
          <i className="fab fa-pinterest"></i>
        </a>
        <a
          href="https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Ftinhlamjw.com%2Fcac-vong-da-cho-nam-nang-luong-so-9%2F"
          target="_blank"
          rel="noopener noreferrer"
          className="linkedin"
          title="Chia sẻ lên LinkedIn"
        >
          <i className="fab fa-linkedin-in"></i>
        </a>
      </div>

      {/* Post Content */}
      <div className="post-content">
        <h1 className="post-title">Các Vòng Đá Cho Năm Năng Lượng Số 9</h1>

        <p><em>Năng lượng năm số 9 mang tần số mạnh mẽ...</em></p>

        <h2 id="section1">Tần số năng lượng năm số 9 ảnh hưởng đến con người ra sao?</h2>
        <p>Tần số năng lượng cao không chỉ là khái niệm trừu tượng...</p>
        <p><strong>Lợi ích của tần số năng lượng cao</strong></p>
        <ul>
          <li><strong>Kích thích sự sáng tạo:</strong> Những ai làm trong lĩnh vực nghệ thuật...</li>
          <li><strong>Thúc đẩy động lực...</strong></li>
          <li><strong>Tăng cường trực giác...</strong></li>
        </ul>
        <p><strong>Ảnh hưởng tiêu cực...</strong></p>
        <ul>
          <li><strong>Mệt mỏi...</strong></li>
          <li><strong>Tâm trạng thất thường...</strong></li>
          <li><strong>Mất tập trung...</strong></li>
        </ul>

        <h2 id="section2">Giữa năm là thời điểm vàng để tái tạo năng lượng</h2>
        <p>Sau nửa đầu năm đầy biến động...</p>
        <ul>
          <li>Ổn định năng lượng cá nhân</li>
          <li>Giữ sự tỉnh táo...</li>
          <li>Kết nối trực giác...</li>
          <li>Định hướng rõ ràng...</li>
        </ul>

        <h2 id="section3">Gợi ý vòng đá phong thuỷ giúp cân bằng năng lượng năm số 9</h2>

        {/* Moonstone */}
        <h4 id="moonstone">Moonstone – Viên đá của cảm xúc và chữa lành</h4>
        <ul>
          <li>Hỗ trợ thiền định...</li>
          <li>Giải tỏa cảm xúc tiêu cực...</li>
          <li>Tác động đến luân xa vương miện...</li>
        </ul>
        <img src="https://tinhlamjw.com/wp-content/uploads/2025/05/moonstone-250x250.jpg" alt="Moonstone" width="250" height="250" />
        <p style={{ textAlign: 'center' }}>
          <a href="https://tinhlamjw.com/shop/?bo-suu-tap=bst-charm-kim-long-phat-loc">
            <em>Vòng đá Moonstone phối BST charm Kim Long Phát Lộc.</em>
          </a>
        </p>

        {/* Các mục tương tự khác: Apatite, Thạch Anh Tím, Gỗ hoá thạch, Dâu Tây Xanh, Fluorite */}
        {/* Lặp cấu trúc tương tự cho các phần tiếp theo, có thể tách thành component riêng nếu cần */}

        <p>Năm số 9 là năm của sự kết thúc, thanh lọc...</p>
      </div>

      {/* Navigation */}
      <div className="navigation">
        <button onClick={() => window.history.back()}>Quay lại</button>
      </div>
    </div>
  );
};

export default PostDetail;
