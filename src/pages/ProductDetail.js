import React from 'react';
import ProductDetail from '../components/ProductDetail/ProductDetail';
import Footer from '../components/Footer/Footer';
import Header from '../components/Header/Header';


const productDetail = () => {
  return (
    <div> 
      <Header />
      <ProductDetail />
      <Footer />
    </div>
  );
};

export default productDetail;