import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';

// Temporary dummy pages
const ProductDetail = () => <div>Product Detail</div>;
const MyEnquiries = () => <div>My Enquiries</div>;
const AdminDashboard = () => <div>Admin Dashboard</div>;

function App() {
  return (
    <Router>
      <Navbar />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route path="/myenquiries" element={
            <ProtectedRoute>
              <MyEnquiries />
            </ProtectedRoute>
          } />

          <Route path="/admin/*" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
        </Routes>
      </div>
      <Footer />
    </Router>
  );
}

export default App;
