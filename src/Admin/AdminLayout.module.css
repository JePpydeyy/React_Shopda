.layout {
  display: flex;
  min-height: 100vh;
  flex-direction: row; /* Mặc định là hàng ngang trên desktop */
}

/* Nội dung chính */
.mainContent {
  flex: 1;
  margin-left: 250px; /* Chừa chỗ cho sidebar trên desktop */
  padding: 20px;
}

/* Responsive */
@media (374px <= width <= 768px) {
  .mainContent {
    margin-left: 200px; /* Chừa chỗ cho sidebar trên tablet */
  }
}

@media (max-width: 576px) {
  .layout {
    flex-direction: column; /* Chuyển sang cột trên mobile */
  }

  .mainContent {
    margin-left: 0; /* Không chừa chỗ cho sidebar */
    margin-top: 0; /* Mặc định không có menu */
    transition: margin-top 0.3s ease;
  }

  body.sidebar-open .mainContent {
    margin-top: 200px; /* Đẩy nội dung xuống khi menu mở (điều chỉnh theo chiều cao menu) */
  }
}