import React from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import CategoryManagement from '../components/AD_Category/AD_Category'; // Đổi tên import này

const AD_Category = () => {
  return (
    <>
      <Sidebar />
      <CategoryManagement />
    </>
  );
};

export default AD_Category;