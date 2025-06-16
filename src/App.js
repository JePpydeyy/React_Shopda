import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Contactus from './pages/Contact';
import ProductSite from './pages/product';
import Newsite from './pages/New';
import PostDetail from './pages/Newdetail'; 
import Checkout from './pages/Checkout';
import Cart from './pages/Cart';
import Newdetails from './pages/Newdetail';
import ProductDetail from './pages/ProductDetail';

import './App.css';


// import { AuthProvider } from './Admin/components/AuthContext/AuthContext';

function App() {
  return (
    // <AuthProvide>
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
            <Route path="/Newdetail" element={<PostDetail />} />
            <Route path="/Cart" element={<Cart />} />
            <Route path="/Checkout" element={<Checkout />} />
          </Routes>
        </div>
      </Router>
    // </AuthProvide
  );
}

export default App;  