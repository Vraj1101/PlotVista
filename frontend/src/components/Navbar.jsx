import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation(); // This forces Navbar to re-render when route changes
  
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  return (
    <nav className="bg-gray-900 border-b border-white/10 sticky top-0 z-50 backdrop-blur-lg bg-opacity-80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo */}
          <Link to="/map" className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
            PlotVista
          </Link>

          {/* Links */}
          <div className="flex items-center space-x-6">
            <Link to="/map" className="text-gray-300 hover:text-emerald-400 font-medium transition duration-200">
              Map Explorer
            </Link>
            
            {userInfo ? (
              <>
                <Link to="/dashboard" className="text-gray-300 hover:text-emerald-400 font-medium transition duration-200">
                  Dashboard
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="px-4 py-2 text-sm font-medium text-red-400 border border-red-500/50 rounded-lg hover:bg-red-500/10 transition duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-300 hover:text-emerald-400 font-medium transition duration-200">
                  Log in
                </Link>
                <Link to="/signup" className="px-5 py-2 text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg hover:from-emerald-400 hover:to-cyan-400 shadow-lg shadow-emerald-500/30 transition duration-200 transform hover:-translate-y-0.5">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
