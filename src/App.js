import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './Admin/components/AuthContext/AuthContext';
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
import AD_Contact from './Admin/pages/AD_Contact';
import EditNews from './Admin/components/EditNews/EditNews'; // Sửa import để sử dụng EditNews
import ProtectedRoute from './Admin/components/ProtectedRoute/ProtectedRoute';

import './App.css';

function App() {
  return (
    <AuthProvider>
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
            <Route path="/admin/login" element={<AdminLogin />} />

            <Route path="/admin" element={
              <ProtectedRoute>
                <Adminpage />
              </ProtectedRoute>
            } />
            <Route path="/admin/product" element={
              <ProtectedRoute>
                <AD_Product />
              </ProtectedRoute>
            } />
            <Route path="/admin/order" element={
              <ProtectedRoute>
                <AD_Order />
              </ProtectedRoute>
            } />
            <Route path="/admin/category" element={
              <ProtectedRoute>
                <AD_Category />
              </ProtectedRoute>
            } />
            <Route path="/admin/new" element={
              <ProtectedRoute>
                <AD_New />
              </ProtectedRoute>
            } />
            <Route path="/admin/add_product" element={
              <ProtectedRoute>
                <AddProductSite />
              </ProtectedRoute>
            } />
            <Route path="/admin/add_category" element={
              <ProtectedRoute>
                <AddCategorySite />
              </ProtectedRoute>
            } />
            <Route path="/admin/categorynew" element={
              <ProtectedRoute>
                <AD_CategoryNew />
              </ProtectedRoute>
            } />
            <Route path="/admin/add_news" element={
              <ProtectedRoute>
                <AD_Add_New />
              </ProtectedRoute>
            } />
            <Route path="/admin/contact" element={
              <ProtectedRoute>
                <AD_Contact />
              </ProtectedRoute>
            } />
            <Route path="/admin/discout" element={
              <ProtectedRoute>
                <DiscoutPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/editnew/:slug" element={
              <ProtectedRoute>
                <EditNews />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;