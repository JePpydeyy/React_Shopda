import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import Home from './pages/Home';np
import ProductSite from './pages/product';
import './App.css';
// import { AuthProvider } from './Admin/components/AuthContext/AuthContext';

function App() {
  return (
    // <AuthProvider>
      <Router>  
        <div className="App">
          <Routes>
            {/* Public routes */}
            {/* <Route path="/" element={<Home />} /> */}
            <Route path="/product" element={<ProductSite />} />
            
          </Routes>
        </div>
      </Router>
    // </AuthProvider>
  );
}

export default App;