import React from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import NewsManagement from '../components/AD_New/AD_New'; // Đổi tên import này

const AD_New = () => {
  return (
    <>
      <Sidebar />
      <NewsManagement />
    </>
  );
};

export default AD_New;