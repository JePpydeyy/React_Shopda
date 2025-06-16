// src/pages/Newdetail.js
import React from 'react';
import Header from '../components/Header/Header';
import PostDetail from '../components/Newdetail/Newdetails'; // Đã sửa chỗ này
import Footer from '../components/Footer/Footer';

const Newdetails = () => {
  return (
    <div>
      <Header />
      <PostDetail />
      <Footer />
    </div>
  );
};

export default Newdetails;
