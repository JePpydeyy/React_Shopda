import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About'
import ProductSite from './pages/product';
import Cart from './pages/Cart';
import ProductDetail from './pages/ProductDetail';

import './App.css';
// import { AuthProvider } from './Admin/components/AuthContext/AuthContext';

function App() {
  return (
    // <AuthProvider>
      <Router>  
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/product" element={<ProductSite />} />
            <Route path="/About" element={<About />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/detail/:id" element={<ProductDetail />} />
          </Routes>
        </div>
      </Router>
    // </AuthProvider>
  );
}

export default App;