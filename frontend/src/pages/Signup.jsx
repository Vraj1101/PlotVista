import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('buyer');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send the data to our Node.js backend
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        name,
        email,
        password,
        role
      });
      
      // If successful, take the user to the login page
      console.log('Registration successful:', response.data);
      navigate('/login');
    } catch (err) {
      // If the backend sends an error (like "Email already exists")
      setError(err.response?.data?.message || 'An error occurred during signup');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-2">
            Join PlotVista
          </h1>
          <p className="text-gray-300">Create an account to discover or sell lands.</p>
        </div>

        {/* Display errors here if there are any */}
        {error && <div className="mb-4 p-3 bg-red-500/20 border border-red-500 text-red-200 rounded-lg text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
            <input 
              type="text" 
              required 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition duration-200"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition duration-200"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition duration-200"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">I am a...</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole('buyer')}
                className={`py-2 rounded-lg border transition duration-200 ${
                  role === 'buyer' 
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400' 
                  : 'bg-gray-800/50 border-gray-600 text-gray-400 hover:border-gray-400'
                }`}
              >
                Buyer
              </button>
              <button
                type="button"
                onClick={() => setRole('seller')}
                className={`py-2 rounded-lg border transition duration-200 ${
                  role === 'seller' 
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400' 
                  : 'bg-gray-800/50 border-gray-600 text-gray-400 hover:border-gray-400'
                }`}
              >
                Seller
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full py-3 px-4 mt-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-bold rounded-lg shadow-lg hover:shadow-emerald-500/50 transform transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]"
          >
            Create Account
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-emerald-400 hover:text-emerald-300 transition duration-150">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
