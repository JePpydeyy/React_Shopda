import React from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import NewsList from '../components/News/News'; // Đổi tên import này

const AdminNews = () => {
  return (
    <>
      <Sidebar />
      <NewsList />
    </>
  );
};

export default AdminNews;