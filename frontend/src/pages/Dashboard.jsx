import React from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  // Get the logged in user's info from local storage
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {userInfo ? (
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-semibold mb-2">Welcome, {userInfo.name}! 👋</h2>
            <p className="text-gray-400 mb-6">You are logged in as a <span className="text-emerald-400 font-medium capitalize">{userInfo.role}</span>.</p>

            {/* Seller Section */}
            {userInfo.role === 'seller' && (
              <div className="mt-4 border-t border-white/10 pt-8">
                <h3 className="text-xl font-medium mb-4">Seller Tools</h3>
                <button 
                  onClick={() => navigate('/seller-dashboard')}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-bold rounded-lg shadow-lg hover:shadow-emerald-500/50 transition-all duration-300"
                >
                  Upload New Property
                </button>
              </div>
            )}

            {/* Buyer Section */}
            {userInfo.role === 'buyer' && (
              <div className="mt-4 border-t border-white/10 pt-8">
                <h3 className="text-xl font-medium mb-4 text-emerald-400">Ready to find your dream plot?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <div className="text-3xl mb-4">🗺️</div>
                    <h4 className="text-lg font-bold mb-2">Explore the Map</h4>
                    <p className="text-gray-400 text-sm">Browse all available plots visually. Filter by residential, commercial, or agricultural.</p>
                  </div>
                  <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <div className="text-3xl mb-4">🤝</div>
                    <h4 className="text-lg font-bold mb-2">Contact Sellers</h4>
                    <p className="text-gray-400 text-sm">Found a plot you like? Click "View Details" to get the seller's direct contact information.</p>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/map')}
                  className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold rounded-lg shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 text-lg"
                >
                  Start Exploring Properties
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center p-8 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-gray-400 mb-4">You are not logged in.</p>
            <button onClick={() => navigate('/login')} className="px-6 py-2 bg-emerald-500 rounded-lg font-medium text-white hover:bg-emerald-600 transition">
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
