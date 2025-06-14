import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Contactus from './pages/Contact';
import ProductSite from './pages/product';
import Newsite from './pages/New';
import PostDetail from './pages/Newdetail'; 

import Cart from './pages/Cart';

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
            <Route path="/About" element={<About />} />
<<<<<<< HEAD
            <Route path="/Contact" element={<Contactus />} />
            <Route path="/New" element={<Newsite />} />
            <Route path="/Newdetail" element={<PostDetail />} />
=======
            <Route path="/cart" element={<Cart />} />
            
>>>>>>> 5816c20f9a80065b1135f8699734a501ede6dfc5
          </Routes>
        </div>
      </Router>
    // </AuthProvide
  );
}

export default App;