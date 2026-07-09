import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState("");
  const [phoneOtpError, setPhoneOtpError] = useState("");
  const [phoneOtpLoading, setPhoneOtpLoading] = useState(false);
  const [devPhoneOtp, setDevPhoneOtp] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password },
      );

      localStorage.setItem("userInfo", JSON.stringify(response.data));

      if (response.data.role === "seller") {
        navigate("/add-property");
      } else {
        navigate("/");
      }
      window.location.reload();
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.requiresPhoneVerification) {
        setUserEmail(err.response.data.email);
        setUserPhone(err.response.data.phone);
        if (err.response.data.devPhoneOtp) {
          setDevPhoneOtp(err.response.data.devPhoneOtp);
        }
        setShowOtpScreen(true);
      } else {
        setError(err.response?.data?.message || "Invalid email or password");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setPhoneOtpError("");
    setPhoneOtpLoading(true);

    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/auth/verify-phone",
        { email: userEmail, otp: phoneOtp }
      );

      if (data.token) {
        localStorage.setItem("userInfo", JSON.stringify(data));
        if (data.role === "seller") {
          navigate("/add-property");
        } else {
          navigate("/");
        }
        window.location.reload();
      } else {
        setError("Phone number verified! However, please verify your email address to log in.");
        setShowOtpScreen(false);
      }
    } catch (otpErr) {
      setPhoneOtpError(
        otpErr.response?.data?.message || "Invalid OTP code. Please try again."
      );
    } finally {
      setPhoneOtpLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-[#090f1d] relative px-6 py-12">
      {/* Background Glowing Orbs */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] animate-float-slow"></div>
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] animate-float-delayed"></div>

      {showOtpScreen ? (
        <div className="max-w-md w-full bg-white/5 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-8 md:p-10 border border-white/10 relative z-10 text-center animate-fade-in">
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30 text-emerald-400 text-4xl">
              📱
            </div>
          </div>
          
          <h1 className="text-3xl font-extrabold text-white mt-2 mb-2">
            Verify Phone OTP
          </h1>
          <p className="text-gray-300 text-sm mb-6 leading-relaxed">
            Please enter the 6-digit OTP code sent to your registered phone number: <span className="font-semibold text-white">{userPhone}</span>.
          </p>

          {devPhoneOtp && (
            <div className="mb-6 p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-2xl text-left animate-fade-in">
              <span className="block text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">
                ⚙️ Local Testing Mode
              </span>
              <p className="text-gray-400 text-xs mb-2">
                Use the direct OTP below to verify immediately:
              </p>
              <span className="font-mono text-emerald-400 font-bold text-lg">{devPhoneOtp}</span>
            </div>
          )}

          {phoneOtpError && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-200 rounded-2xl text-sm">
              ⚠️ {phoneOtpError}
            </div>
          )}

          <form onSubmit={handleOtpSubmit} className="space-y-6">
            <input
              type="text"
              maxLength={6}
              required
              value={phoneOtp}
              onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, ""))}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-emerald-400 focus:bg-white/10 text-center font-mono text-xl tracking-widest transition duration-300"
              placeholder="123456"
            />

            <button
              type="submit"
              disabled={phoneOtpLoading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-bold transition duration-300 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5 cursor-pointer disabled:opacity-55"
            >
              {phoneOtpLoading ? "Verifying..." : "Verify OTP & Sign In"}
            </button>
          </form>

          <button
            onClick={() => setShowOtpScreen(false)}
            className="mt-6 text-sm font-semibold text-gray-400 hover:text-white transition duration-300 cursor-pointer"
          >
            ← Back to Login
          </button>
        </div>
      ) : (
        <div className="max-w-md w-full bg-white/5 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-8 md:p-10 border border-white/10 relative z-10">
          <div className="text-center mb-8">
            <Link
              to="/"
              className="text-2xl font-black tracking-tight text-white mb-2 inline-block"
            >
              Plot
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Vista
              </span>
            </Link>
            <h1 className="text-3xl font-extrabold text-white mt-2">
              Welcome Back
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Please log in to manage your lands or purchases
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-200 rounded-2xl text-sm flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* EMAIL */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-emerald-400 focus:bg-white/10 transition duration-300"
                placeholder="you@example.com"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                  Password
                </label>

                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
                >
                  Forgot Password?
                </Link>
              </div>

              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-emerald-400 focus:bg-white/10 transition duration-300"
                placeholder="••••••••"
              />
            </div>
      

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-bold transition duration-300 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5 cursor-pointer disabled:opacity-55"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-400">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-bold text-emerald-400 hover:text-emerald-300 transition"
            >
              Sign up now
            </Link>
          </p>
        </div>
      )}
    </div>
  );
};

export default Login;
