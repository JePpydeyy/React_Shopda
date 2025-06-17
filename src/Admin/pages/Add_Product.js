import React from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import AddProduct from '../components/Add_Product/Add_Product'; // Đổi tên import này

const AddProductSite = () => {
  return (
    <>
      <Sidebar />
      <AddProduct />
    </>
  );
};

export default AddProductSite;