import React from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import MainContent from '../components/dashboard/dashboard';

const Dashboard = () => (
  <>
    <Sidebar />
    <div>
      <MainContent />
    </div>
  </>
);

export default Dashboard;