// src/pages/Home.js
import React from 'react';
import Header from '../components/Header/Header';
import Product from '../components/Cart/Cart'; // ✅ đúng với tên thư mục và file
import Footer from '../components/Footer/Footer';

const cart = () => {
  return (
    <div>
      <Header />
      <Product />
      <Footer />
    </div>
  );
};

export default cart;
