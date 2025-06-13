// src/pages/Newdetail.js
import React from 'react';
import Header from '../components/Header/Header';
import New from '../components/New/New'; // Đã sửa chỗ này
import Footer from '../components/Footer/Footer';

const News = () => {
  return (
    <div>
      <Header />
      <New />
      <Footer />
    </div>
  );
};

export default News;