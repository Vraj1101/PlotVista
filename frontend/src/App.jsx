import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import SellerDashboard from './pages/SellerDashboard';
import MapPage from './pages/MapPage';
import PropertyDetail from './pages/PropertyDetail';

function App() {
  return (
    <BrowserRouter>
      {/* The Navbar will now show up at the top of every page! */}
      <Navbar />
      
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/seller-dashboard" element={<SellerDashboard />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/property/:id" element={<PropertyDetail />} />
          </Routes>
        </main>
        
        {/* The Footer will now show up at the bottom of every page! */}
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
