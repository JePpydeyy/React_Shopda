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
import AD_Product from './Admin/pages/Product'; 
import AD_Order from './Admin/pages/Order'; 
import AD_Category from './Admin/pages/Category'; 
import AD_New from './Admin/pages/New';
import AddProductSite from './Admin/pages/Add_Product'; 
import AddCategorySite from './Admin/pages/Add_Category'; 
import DiscoutPage from './Admin/pages/Discout'; 
import AD_CategoryNew from './Admin/pages/Categorynew';
import AD_Add_New from './Admin/pages/AD_Add_New';
import AD_Contact from './Admin/pages/AD_Contact'; // Thêm dòng này


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
            <Route path="/detail/:slug" element={<ProductDetail />} />
            <Route path="/About" element={<About />} />
            <Route path="/Contact" element={<Contactus />} />
            <Route path="/New" element={<Newsite />} />
            <Route path="/newdetail/:slug" element={<PostDetail />} />
            <Route path="/Cart" element={<Cart />} />
            <Route path="/Checkout" element={<Checkout />} />

            {/* Admin routes */}
            <Route path="/admin" element={<Adminpage />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/product" element={<AD_Product />} />
            <Route path="/admin/order" element={<AD_Order />} />
            <Route path="/admin/category" element={<AD_Category />} />
            <Route path="/admin/new" element={<AD_New />} />
            <Route path="/admin/add_product" element={<AddProductSite />} />
            <Route path="/admin/add_category" element={<AddCategorySite />} />
            <Route path="/admin/categorynew" element={<AD_CategoryNew />} />
            <Route path="/admin/add_news" element={<AD_Add_New />} />
            <Route path="/admin/contact" element={<AD_Contact />} />
            <Route path="/admin/discout" element={<DiscoutPage />} />


            {/* Redirect to home for any unmatched routes */}
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;