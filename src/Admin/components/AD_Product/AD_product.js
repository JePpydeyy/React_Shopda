import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import styles from './Product.module.css';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Sample data (replace with API call in production)
  const initialProducts = [
    {
      category: { id: "684f9ce9398a8acfc7ee1495", name_categories: "Phong Thủy" },
      _id: "684fc71b54407189685968be",
      level: "Cao cấp",
      stock: 10,
      purchases: 2,
      Collection: "Kim Phúc",
      element: "Hỏa - Thổ",
      name: "VÒNG TAY JACK",
      slug: "vong-tay-jack",
      images: ["images/1750058779801-522854424.jpeg"],
      price: 5000000,
      status: "show",
      tag: "sale",
      short_description: "Vòng tay của jack cực kì múp",
      weight: "10,5 Li",
      size: [
        { stock: 10, size_name: "12 cm", _id: "684fc7d554407189685968cf" },
        { stock: 12, size_name: "12.5 cm", _id: "684fc7d554407189685968d0" }
      ],
      material: "ĐÁ MOONSTONE",
      description: "Đá mặt trăng (Moonstone) là loại đá quý thuộc nhóm Fenspat Kali...",
      origin: "Srilanka, Ấn Độ, Brazil, Myanmar, Madagascar, Mexico, Na Uy, Thụy Sĩ, Tanzania, Hoa Kỳ",
      hardness: "6.0 - 6.5/10",
      spiritual_benefits: ["Giúp phá tan tiêu cực"],
      health_benefits: ["Cân bằng sức khỏe"],
      care_instructions: ["Lau nhẹ"],
      views: 58,
      createdAt: "2025-06-16T07:26:19.803Z"
    },
    // Add other products from the provided data similarly
  ];

  useEffect(() => {
    // Simulate API call
    setProducts(initialProducts);
  }, []);

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (categoryFilter === 'all' || product.category.name_categories === categoryFilter) &&
    (statusFilter === 'all' || product.status === statusFilter)
  );

  const categories = [...new Set(products.map(p => p.category.name_categories))];
  const statuses = [...new Set(products.map(p => p.status))];

  const handleEdit = (id) => {
    console.log(`Edit product ${id}`);
  };

  const handleDelete = (id) => {
    console.log(`Delete product ${id}`);
  };

  // Function to calculate total stock including sizes
  const calculateTotalStock = (product) => {
    const sizeStock = product.size.reduce((total, size) => total + size.stock, 0);
    return product.stock + sizeStock;
  };

  return (
    <div className={styles.container}>
      <Sidebar />
      <div className={styles.content}>
        <h1 className={styles.title}>Quản Lý Sản Phẩm</h1>
        
        {/* Search and Filters */}
        <div className={styles.searchFilter}>
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className={styles.filterSelect}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">Tất cả danh mục</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <Link to="/admin/add_product" className={styles.addButton}>
            Thêm Sản Phẩm
          </Link>
        </div>

        {/* Product Table */}
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHeader}>
                <th>Tên</th>
                <th>Danh mục</th>
                <th>Giá</th>
                <th>Tồn kho</th>
                <th>Tổng tồn kho</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <tr key={product._id} className={styles.tableRow}>
                  <td>{product.name}</td>
                  <td>{product.category.name_categories}</td>
                  <td>{product.price.toLocaleString()} VNĐ</td>
                  <td>{product.stock}</td>
                  <td>{calculateTotalStock(product)}</td>
                  <td>{product.status}</td>
                  <td>
                    <button
                      onClick={() => handleEdit(product._id)}
                      className={styles.actionButton}
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className={`${styles.actionButton} ${styles.deleteButton}`}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductManagement;