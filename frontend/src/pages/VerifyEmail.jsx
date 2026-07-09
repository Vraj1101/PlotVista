import { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState(token ? "loading" : "error"); // loading, success, error
  const [message, setMessage] = useState(token ? "" : "No verification token was provided.");
  const called = useRef(false);

  useEffect(() => {
    if (called.current || !token) return;
    called.current = true;

    const performVerification = async () => {
      try {
        const queryParams = new URLSearchParams(window.location.search);
        const email = queryParams.get("email") || "";
        const { data } = await axios.get(
          `http://localhost:5000/api/auth/verify-email/${token}?email=${encodeURIComponent(email)}`
        );
        setStatus("success");
        setMessage(data.message || "Your email has been verified successfully!");
      } catch (err) {
        setStatus("error");
        setMessage(
          err.response?.data?.message ||
            "The verification link is invalid or has expired."
        );
      }
    };

    performVerification();
  }, [token]);

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-[#090f1d] relative px-6 py-12">
      {/* Background Glowing Orbs */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] animate-float-slow"></div>
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] animate-float-delayed"></div>

      <div className="max-w-md w-full bg-white/5 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-8 md:p-10 border border-white/10 relative z-10 text-center">
        <div className="mb-8">
          <Link
            to="/"
            className="text-2xl font-black tracking-tight text-white inline-block"
          >
            Plot
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Vista
            </span>
          </Link>
        </div>

        {status === "loading" && (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="w-16 h-16 border-4 border-t-emerald-400 border-r-cyan-400 border-b-white/10 border-l-white/10 rounded-full animate-spin mb-6"></div>
            <h2 className="text-xl font-bold text-white mb-2">Verifying Your Email</h2>
            <p className="text-gray-400 text-sm">Please wait while we activate your account...</p>
          </div>
        )}

        {status === "success" && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30 text-emerald-400 text-4xl">
                ✓
              </div>
            </div>
            <h2 className="text-2xl font-black text-white mb-3">Verification Successful</h2>
            <p className="text-gray-300 text-sm mb-8 leading-relaxed">{message}</p>
            <Link
              to="/login"
              className="block w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-bold transition duration-300 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 text-center cursor-pointer"
            >
              Sign In Now
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/30 text-red-400 text-4xl">
                ⚠️
              </div>
            </div>
            <h2 className="text-2xl font-black text-white mb-3">Verification Failed</h2>
            <p className="text-gray-300 text-sm mb-8 leading-relaxed">{message}</p>
            <div className="space-y-4">
              <Link
                to="/signup"
                className="block w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold transition duration-300 hover:bg-white/10 text-center"
              >
                Return to Signup
              </Link>
              <Link
                to="/"
                className="block text-sm font-semibold text-gray-400 hover:text-white transition duration-300"
              >
                Back to Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
