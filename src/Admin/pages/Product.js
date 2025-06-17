import React from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import ProductManagement from '../components/AD_Product/AD_product'; // Đổi tên import này

const AD_Product = () => {
  return (
    <>
      <Sidebar />
      <ProductManagement />
    </>
  );
};

export default AD_Product;