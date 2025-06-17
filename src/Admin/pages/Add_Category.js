import React from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import AddCategory from '../components/AD_Category/AD_Category'; // Đổi tên import này

const AddCategorySite = () => {
  return (
    <>
      <Sidebar />
      <AddCategory />
    </>
  );
};

export default AddCategorySite;