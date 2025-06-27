import React from 'react';
import Sidebar from '../components/Sidebar/Sidebar'; // ✅ Đúng
import AddNewsComponent from '../components/AD_Add_New/AD_Add_New';

const AD_Add_New = () => {
  return (
    <>
      <Sidebar />
      <AddNewsComponent />
    </>
  );
};

export default AD_Add_New;
