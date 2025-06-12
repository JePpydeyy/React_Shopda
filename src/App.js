import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Contactus from './pages/Contact';
import ProductSite from './pages/product';
import Newsite from './pages/New';
import PostDetail from './pages/Newdetail'; 


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
            <Route path="/Contact" element={<Contactus />} />
            <Route path="/New" element={<Newsite />} />
            <Route path="/Newdetail" element={<PostDetail />} />
          </Routes>
        </div>
      </Router>
    // </AuthProvide
  );
}

export default App;