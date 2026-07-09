import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("buyer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [devLink, setDevLink] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [phoneOtpError, setPhoneOtpError] = useState("");
  const [phoneOtpLoading, setPhoneOtpLoading] = useState(false);
  const [devPhoneOtp, setDevPhoneOtp] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("userInfo");
  }, []);

  const checkStatus = async () => {
    try {
      const { data } = await axios.get(
        `http://localhost:5000/api/auth/check-status?email=${encodeURIComponent(email)}`
      );
      if (data.isVerified) {
        setIsEmailVerified(true);
      }
      if (data.isPhoneVerified) {
        setIsPhoneVerified(true);
      }

      // If both are verified, we automatically log in
      if (data.isVerified && data.isPhoneVerified && data.token) {
        localStorage.setItem("userInfo", JSON.stringify(data));
        setTimeout(() => {
          if (data.role === "seller") {
            navigate("/add-property");
          } else {
            navigate("/");
          }
          window.location.reload();
        }, 1500);
      }
    } catch (err) {
      console.error("Error checking verification status:", err);
    }
  };

  useEffect(() => {
    let interval;
    if (isRegistered && (!isEmailVerified || !isPhoneVerified)) {
      setTimeout(() => {
        checkStatus();
      }, 0);

      interval = setInterval(() => {
        checkStatus();
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRegistered, isEmailVerified, isPhoneVerified, email]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!/^[A-Za-z\s]+$/.test(name.trim())) {
      setError("Name can contain only letters and spaces");
      setLoading(false);
      return;
    }

    // Email Validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    // Phone Validation
    if (!/^\d{10}$/.test(phone)) {
      setError("Phone number must be exactly 10 digits");
      setLoading(false);
      return;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) {
      setError("Password must contain uppercase, lowercase and a number");
      setLoading(false);
      return;
    }

    // Password Validation
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }
    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/auth/register",
        { name, email, password, phone, role },
      );

      if (data.devVerificationUrl) {
        setDevLink(data.devVerificationUrl);
      }
      if (data.devPhoneOtp) {
        setDevPhoneOtp(data.devPhoneOtp);
      }
      setIsRegistered(true);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "An error occurred during signup",
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneVerify = async (e) => {
    e.preventDefault();
    setPhoneOtpError("");
    setPhoneOtpLoading(true);

    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/auth/verify-phone",
        { email, otp: phoneOtp },
      );

      setIsPhoneVerified(true);
      if (data.token) {
        localStorage.setItem("userInfo", JSON.stringify(data));
        setTimeout(() => {
          if (data.role === "seller") {
            navigate("/add-property");
          } else {
            navigate("/");
          }
          window.location.reload();
        }, 1500);
      }
    } catch (err) {
      setPhoneOtpError(
        err.response?.data?.message || "Invalid OTP. Please try again.",
      );
    } finally {
      setPhoneOtpLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-[#090f1d] relative px-6 py-12">
      {/* Background Glowing Orbs */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] animate-float-slow"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] animate-float-delayed"></div>

      {isRegistered ? (
        <div className="max-w-xl w-full bg-white/5 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-8 md:p-10 border border-white/10 relative z-10 text-center animate-fade-in">
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30 text-emerald-400 text-4xl">
              ✉️
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-2">Verify Your Account</h1>
          <p className="text-gray-300 text-sm mb-6 leading-relaxed">
            We need to verify both your email and phone number to secure your account.
          </p>

          {/* Email Verification Box */}
          <div className="mb-6 p-5 bg-white/5 border border-white/10 rounded-2xl text-left">
            <h3 className="text-md font-bold text-white mb-2 flex items-center justify-between gap-2">
              <span>📧 Email Verification</span>
              {isEmailVerified ? (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                  VERIFIED ✓
                </span>
              ) : (
                <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-bold animate-pulse">
                  PENDING
                </span>
              )}
            </h3>
            <p className="text-gray-400 text-xs mb-3">
              We've sent a link to <span className="text-emerald-400 font-semibold">{email}</span>. Click the link in that email to verify.
            </p>
            {!isEmailVerified && (
              <button
                type="button"
                onClick={checkStatus}
                className="mb-3 text-xs text-cyan-400 hover:text-cyan-300 font-semibold underline cursor-pointer"
              >
                I clicked the link, check my status
              </button>
            )}
            {devLink && (
              <div className="p-3 bg-cyan-500/5 border border-cyan-500/20 rounded-xl">
                <span className="block text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-1">
                  ⚙️ Dev Link:
                </span>
                <a
                  href={devLink}
                  className="block text-xs font-semibold text-emerald-400 hover:text-emerald-300 break-all underline transition"
                >
                  {devLink}
                </a>
              </div>
            )}
          </div>

          {/* Phone Verification Box */}
          <div className="mb-8 p-5 bg-white/5 border border-white/10 rounded-2xl text-left">
            <h3 className="text-md font-bold text-white mb-2 flex items-center justify-between gap-2">
              <span>📱 Phone Verification</span>
              {isPhoneVerified ? (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                  VERIFIED ✓
                </span>
              ) : (
                <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-bold animate-pulse">
                  PENDING
                </span>
              )}
            </h3>

            {isPhoneVerified ? (
              <p className="text-emerald-400 text-xs font-semibold">
                Phone number verified successfully!
              </p>
            ) : (
              <form onSubmit={handlePhoneVerify} className="space-y-4">
                <p className="text-gray-400 text-xs">
                  We've sent a 6-digit OTP code to <span className="text-white font-semibold">{phone}</span>.
                </p>

                {devPhoneOtp && (
                  <div className="p-3 bg-cyan-500/5 border border-cyan-500/20 rounded-xl text-xs">
                    <span className="font-bold text-cyan-400">⚙️ Dev OTP Code: </span>
                    <span className="font-mono text-emerald-400 font-bold">{devPhoneOtp}</span>
                  </div>
                )}

                {phoneOtpError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-200 rounded-xl text-xs">
                    ⚠️ {phoneOtpError}
                  </div>
                )}

                <div className="flex gap-3">
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={phoneOtp}
                    onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, ""))}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-400 text-center font-mono text-lg tracking-widest"
                    placeholder="123456"
                  />
                  <button
                    type="submit"
                    disabled={phoneOtpLoading}
                    className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-bold transition duration-300 shadow-md hover:shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
                  >
                    {phoneOtpLoading ? "Verifying..." : "Verify OTP"}
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="space-y-4">
            {isPhoneVerified && !isEmailVerified && (
              <p className="text-amber-400 text-xs italic animate-pulse">
                Phone verified. Waiting for email verification to complete setup.
              </p>
            )}
            {isEmailVerified && !isPhoneVerified && (
              <p className="text-amber-400 text-xs italic animate-pulse">
                Email verified. Please verify your phone number via OTP to complete setup.
              </p>
            )}
            {isEmailVerified && isPhoneVerified && (
              <p className="text-emerald-400 text-xs font-semibold animate-pulse">
                Both email and phone verified! Setup complete.
              </p>
            )}
            <Link
              to={isPhoneVerified && isEmailVerified ? "/login" : "#"}
              className={`block w-full py-4 rounded-2xl text-center font-bold transition duration-300 ${
                isPhoneVerified && isEmailVerified
                  ? "bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 cursor-pointer"
                  : "bg-white/5 border border-white/10 text-gray-500 cursor-not-allowed pointer-events-none"
              }`}
            >
              {isPhoneVerified && isEmailVerified ? "Proceed to Dashboard" : "Verify Both to Proceed"}
            </Link>
            <button
              onClick={() => setIsRegistered(false)}
              className="text-sm font-semibold text-gray-400 hover:text-white transition duration-300 cursor-pointer"
            >
              ← Back to Sign Up
            </button>
          </div>

        </div>
      ) : (
        <div className="max-w-xl w-full bg-white/5 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-8 md:p-10 border border-white/10 relative z-10">
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
              Create an Account
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Join the smart network for direct, transparent land deals
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-200 rounded-2xl text-sm flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ROLE SELECTOR */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-3 text-center">
                Register As
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole("buyer")}
                  className={`p-4 rounded-2xl border text-left transition-all duration-300 ${
                    role === "buyer"
                      ? "bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border-emerald-500/50 shadow-lg shadow-emerald-500/5"
                      : "bg-white/5 border-white/5 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xl">🔍</span>
                    {role === "buyer" && (
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                    )}
                  </div>
                  <span className="block font-bold text-white text-sm">
                    Land Buyer
                  </span>
                  <span className="block text-xs text-gray-400 mt-0.5">
                    Explore & purchase plots
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole("seller")}
                  className={`p-4 rounded-2xl border text-left transition-all duration-300 ${
                    role === "seller"
                      ? "bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border-emerald-500/50 shadow-lg shadow-emerald-500/5"
                      : "bg-white/5 border-white/5 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xl">💼</span>
                    {role === "seller" && (
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                    )}
                  </div>
                  <span className="block font-bold text-white text-sm">
                    Land Seller
                  </span>
                  <span className="block text-xs text-gray-400 mt-0.5">
                    List & market land plots
                  </span>
                </button>
              </div>
            </div>

            {/* NAME */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-emerald-400 focus:bg-white/10 transition duration-300"
                placeholder="John Doe"
              />
            </div>

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

            {/* PHONE */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                required
                maxLength={10}
                value={phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setPhone(value);
                }}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-emerald-400 focus:bg-white/10 transition duration-300"
                placeholder="10-digit number"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Password
              </label>
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
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-bold transition duration-300 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5 cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-bold text-emerald-400 hover:text-emerald-300 transition"
            >
              Log in now
            </Link>
          </p>
        </div>
      )}
    </div>
  );
};

export default Signup;
