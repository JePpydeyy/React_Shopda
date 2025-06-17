import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './Admin/components/AuthContext/AuthContext'; // Sửa lỗi chính tả
import Home from './pages/Home';
import About from './pages/About';
import Contactus from './pages/Contact';
import ProductSite from './pages/product';
import Newsite from './pages/New';
import PostDetail from './pages/Newdetail';
import Checkout from './pages/Checkout';
import Cart from './pages/Cart';
import ProductDetail from './pages/ProductDetail';
import Adminpage from './Admin/pages/Dashboard';
import AdminLogin from './Admin/pages/Login';
import NewAdmin from './Admin/pages/News'; 
import './App.css';

function App() {
  return (
    <AuthProvider> {/* Thêm AuthProvider */}
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/product" element={<ProductSite />} />
            <Route path="/detail/:id" element={<ProductDetail />} />
            <Route path="/About" element={<About />} />
            <Route path="/Contact" element={<Contactus />} />
            <Route path="/New" element={<Newsite />} />
            <Route path="/Newdetail/:id" element={<PostDetail />} />
            <Route path="/Cart" element={<Cart />} />
            <Route path="/Checkout" element={<Checkout />} />

            {/* Admin routes */}
            <Route path="/admin" element={<Adminpage />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/news" element={<NewAdmin />} />

            {/* Redirect to home for any unmatched routes */}
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;