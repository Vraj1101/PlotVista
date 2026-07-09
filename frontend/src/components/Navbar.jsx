import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const [messageCount, setMessageCount] = useState(0);
  const [inquiryCount, setInquiryCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchNotificationCounts = async () => {
    try {
      if (!userInfo) return;

      const endpoint =
        userInfo.role === "seller"
          ? "http://localhost:5000/api/inquiries/seller"
          : "http://localhost:5000/api/inquiries/buyer";

      const { data } = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      });

      if (userInfo.role === "seller") {
        const count = data.reduce((sum, item) => sum + (item.sellerUnreadCount || 0), 0);
        setInquiryCount(count);
      } else {
        const count = data.reduce((sum, item) => sum + (item.buyerUnreadCount || 0), 0);
        setMessageCount(count);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      if (!userInfo) return;

      const { data } = await axios.get(
        "http://localhost:5000/api/notifications",
        {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        },
      );

      setNotificationCount(data.filter((n) => !n.isRead).length);
    } catch (error) {
      console.log(error);
    }
  };

  // Close menus and refresh counts on route change
  useEffect(() => {
    setTimeout(() => {
      setDropdownOpen(false);
      setMobileMenuOpen(false);
      fetchNotificationCounts();
      fetchNotifications();
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/login");
    window.location.reload();
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "Are you absolutely sure you want to delete your account? This will permanently erase your profile, inquiries, favorites, and property listings. This action cannot be undone."
    );

    if (!confirmDelete) return;

    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      if (!userInfo) return;

      await axios.delete("http://localhost:5000/api/users/profile", {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      });

      localStorage.removeItem("userInfo");
      navigate("/login");
      window.location.reload();
    } catch (error) {
      alert(
        error.response?.data?.message || "Failed to delete account"
      );
    }
  };

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Map", path: "/map" },
  ];

  if (userInfo?.role === "seller") {
    navItems.push({
      name: "Sell Property",
      path: "/add-property",
    });
  }

  return (
    <nav className="sticky top-0 z-[9999] bg-[#090f1d]/85 backdrop-blur-xl border-b border-white/5 shadow-2xl shadow-emerald-950/10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* LEFT GROUP: Logo & Desktop Primary Links */}
        <div className="flex items-center gap-10">
          {/* LOGO */}
          <Link
            to="/"
            className="text-2xl font-extrabold tracking-tight flex items-center gap-2 group shrink-0"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:rotate-12 transition-transform duration-300">
              <span className="text-white text-base font-black">PV</span>
            </div>

            <span className="text-white font-black group-hover:text-emerald-400 transition-colors">
              Plot
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Vista
              </span>
            </span>
          </Link>

          {/* DESKTOP NAV LINKS */}
          <div className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`relative px-3 py-2 text-sm font-semibold transition duration-300 ${
                    isActive
                      ? "text-emerald-400"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  {item.name}

                  {isActive && (
                    <motion.div
                      layoutId="activeUnderline"
                      className="absolute -bottom-4 left-0 w-full h-[2.5px] rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 shadow-md shadow-emerald-500/50"
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* RIGHT GROUP: Notifications & User Section */}
        <div className="flex items-center gap-4">
          {userInfo && (
            /* NOTIFICATION BELL */
            <Link
              to="/notifications"
              className="relative p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all duration-300 text-white/80 hover:text-white shrink-0"
              aria-label="Notifications"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black w-5.5 h-5.5 rounded-full flex items-center justify-center border-2 border-[#090f1d] shadow-lg animate-pulse">
                  {notificationCount}
                </span>
              )}
            </Link>
          )}

          {userInfo ? (
            /* LOGGED IN USER */
            <div className="relative shrink-0">
              {/* DESKTOP USER PROFILE BADGE */}
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="hidden lg:flex items-center gap-3 bg-white/5 border border-white/15 px-3.5 py-1.5 rounded-2xl hover:bg-white/10 hover:border-white/25 transition-all duration-300 cursor-pointer text-left"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-emerald-500/10">
                  {userInfo.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-white/50 leading-none">
                    Welcome,
                  </span>
                  <span className="text-xs font-bold text-white/90 leading-tight truncate max-w-[100px]">
                    {userInfo.name}
                  </span>
                </div>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase border shrink-0 ${
                    userInfo.role === "seller"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                  }`}
                >
                  {userInfo.role}
                </span>
                <svg
                  className={`w-3 h-3 text-white/40 transition-transform duration-300 ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* OUTSIDE CLICK CATCHER */}
              {dropdownOpen && (
                <div
                  className="fixed inset-0 z-40 cursor-default"
                  onClick={() => setDropdownOpen(false)}
                />
              )}

              {/* DROPDOWN MENU */}
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2.5 w-60 rounded-2xl bg-[#0d162d]/95 backdrop-blur-2xl border border-white/10 shadow-2xl p-2 z-50 overflow-hidden"
                  >
                    {/* Header */}
                    <div className="px-3 py-2.5 mb-1.5 border-b border-white/5 bg-white/5 rounded-xl">
                      <p className="text-xs font-semibold text-white/80 truncate">{userInfo.name}</p>
                      <p className="text-[10px] text-white/45 truncate mt-0.5">{userInfo.email}</p>
                    </div>

                    {/* Common Links */}
                    <Link
                      to="/profile"
                      className="flex items-center px-3 py-2 text-xs font-semibold text-white/80 hover:text-white hover:bg-white/5 rounded-xl transition duration-200"
                    >
                      👤 View Profile
                    </Link>
                    <Link
                      to="/favorites"
                      className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-white/80 hover:text-white hover:bg-white/5 rounded-xl transition duration-200"
                    >
                      <span>❤️ Favorites</span>
                    </Link>
                    <Link
                      to="/recently-viewed"
                      className="flex items-center px-3 py-2 text-xs font-semibold text-white/80 hover:text-white hover:bg-white/5 rounded-xl transition duration-200"
                    >
                      <span>⏱️ Recently Viewed</span>
                    </Link>

                    {/* Admin Links */}
                    {userInfo.role === "admin" && (
                      <>
                        <Link
                          to="/admin"
                          className="flex items-center px-3 py-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-xl transition duration-200"
                        >
                          🛡️ Admin Panel
                        </Link>
                        <Link
                          to="/messages"
                          className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-white/80 hover:text-white hover:bg-white/5 rounded-xl transition duration-200"
                        >
                          <span>💬 Messages</span>
                          {messageCount > 0 && (
                            <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black">
                              {messageCount}
                            </span>
                          )}
                        </Link>
                      </>
                    )}

                    {/* Seller Links */}
                    {userInfo.role === "seller" && (
                      <>
                        <Link
                          to="/dashboard"
                          className="flex items-center px-3 py-2 text-xs font-semibold text-white/80 hover:text-white hover:bg-white/5 rounded-xl transition duration-200"
                        >
                          📈 Dashboard
                        </Link>
                        <Link
                          to="/my-properties"
                          className="flex items-center px-3 py-2 text-xs font-semibold text-white/80 hover:text-white hover:bg-white/5 rounded-xl transition duration-200"
                        >
                          🏡 My Properties
                        </Link>
                        <Link
                          to="/seller-inquiries"
                          className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-white/80 hover:text-white hover:bg-white/5 rounded-xl transition duration-200"
                        >
                          <span>📩 Inquiries</span>
                          {inquiryCount > 0 && (
                            <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black">
                              {inquiryCount}
                            </span>
                          )}
                        </Link>
                      </>
                    )}

                    {/* Buyer Links */}
                    {userInfo.role === "buyer" && (
                      <>
                        <Link
                          to="/messages"
                          className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-white/80 hover:text-white hover:bg-white/5 rounded-xl transition duration-200"
                        >
                          <span>💬 Messages</span>
                          {messageCount > 0 && (
                            <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black">
                              {messageCount}
                            </span>
                          )}
                        </Link>
                      </>
                    )}

                    <hr className="border-white/5 my-1.5" />

                    {/* Logout */}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition duration-200 cursor-pointer"
                    >
                      🚪 Logout
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-red-500/70 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition duration-200 cursor-pointer"
                    >
                      ⚠️ Delete Account
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            /* DESKTOP LOGGED OUT BUTTONS */
            <div className="hidden lg:flex items-center gap-3 shrink-0">
              <Link
                to="/login"
                className="px-4.5 py-2 rounded-xl text-xs font-semibold border border-white/10 bg-white/5 hover:bg-white/10 text-white transition duration-200"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-4.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white transition duration-200 shadow-md shadow-emerald-500/15"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* HAMBURGER MENU BUTTON (MOBILE / SPLIT VIEW) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex lg:hidden items-center justify-center p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all duration-300 cursor-pointer shrink-0"
            aria-label="Open Menu"
          >
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER (HAMBURGER SLIDEOUT) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />

            {/* Sidebar Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-screen w-80 bg-[#070c19]/95 backdrop-blur-2xl border-l border-white/10 shadow-2xl z-50 p-6 flex flex-col justify-between lg:hidden"
            >
              {/* Top Section */}
              <div className="flex flex-col gap-6 overflow-y-auto max-h-[80vh] pr-1 scrollbar-thin">
                {/* Header with Close */}
                <div className="flex items-center justify-between pb-4 border-b border-white/5">
                  <span className="text-lg font-black text-white">Menu</span>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition cursor-pointer"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* User card on mobile */}
                {userInfo && (
                  <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-3 rounded-2xl">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                      {userInfo.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col flex-1 overflow-hidden">
                      <span className="text-xs font-bold text-white truncate">{userInfo.name}</span>
                      <span className="text-[10px] text-white/50 truncate mt-0.5">{userInfo.email}</span>
                    </div>
                    <span className="text-[8px] px-2 py-0.5 rounded-full font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                      {userInfo.role}
                    </span>
                  </div>
                )}

                {/* Vertical Links List */}
                <div className="flex flex-col gap-2">
                  <p className="text-[10px] font-bold tracking-wider text-white/30 uppercase px-2 mb-1">Navigation</p>
                  {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition ${
                          isActive
                            ? "bg-emerald-500/15 text-emerald-400 border-l-3 border-emerald-400"
                            : "text-white/70 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        {item.name}
                      </Link>
                    );
                  })}

                  {userInfo && (
                    <>
                      <p className="text-[10px] font-bold tracking-wider text-white/30 uppercase px-2 mt-4 mb-1">Account & Actions</p>
                      
                      <Link
                        to="/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center px-4 py-3 text-sm font-semibold text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition"
                      >
                        👤 View Profile
                      </Link>

                      <Link
                        to="/favorites"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between px-4 py-3 text-sm font-semibold text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition"
                      >
                        <span>❤️ My Favorites</span>
                      </Link>

                      <Link
                        to="/recently-viewed"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center px-4 py-3 text-sm font-semibold text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition"
                      >
                        <span>⏱️ Recently Viewed</span>
                      </Link>

                      {userInfo.role === "admin" && (
                        <>
                          <Link
                            to="/admin"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center px-4 py-3 text-sm font-semibold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-xl transition"
                          >
                            🛡️ Admin Panel
                          </Link>
                          <Link
                            to="/messages"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center justify-between px-4 py-3 text-sm font-semibold text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition"
                          >
                            <span>💬 Messages</span>
                            {messageCount > 0 && (
                              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-black">
                                {messageCount}
                              </span>
                            )}
                          </Link>
                        </>
                      )}

                      {userInfo.role === "seller" && (
                        <>
                          <Link
                            to="/dashboard"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center px-4 py-3 text-sm font-semibold text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition"
                          >
                            📈 Dashboard
                          </Link>
                          <Link
                            to="/my-properties"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center px-4 py-3 text-sm font-semibold text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition"
                          >
                            🏡 My Properties
                          </Link>
                          <Link
                            to="/seller-inquiries"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center justify-between px-4 py-3 text-sm font-semibold text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition"
                          >
                            <span>📩 Inquiries</span>
                            {inquiryCount > 0 && (
                              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-black">
                                {inquiryCount}
                              </span>
                            )}
                          </Link>
                        </>
                      )}

                      {userInfo.role === "buyer" && (
                        <>
                          <Link
                            to="/messages"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center justify-between px-4 py-3 text-sm font-semibold text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition"
                          >
                            <span>💬 Messages</span>
                            {messageCount > 0 && (
                              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-black">
                                {messageCount}
                              </span>
                            )}
                          </Link>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Bottom Section */}
              <div className="pt-4 border-t border-white/5 space-y-3">
                {userInfo ? (
                  <>
                    <button
                      onClick={handleLogout}
                      className="w-full py-3.5 px-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white font-bold text-sm transition cursor-pointer"
                    >
                      Logout
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      className="w-full py-3.5 px-4 rounded-xl bg-red-500/5 border border-red-500/10 text-red-500/80 hover:bg-red-500 hover:text-white font-bold text-sm transition cursor-pointer"
                    >
                      Delete Account
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full py-3.5 px-4 text-center rounded-xl border border-white/10 bg-white/5 text-white text-sm font-semibold hover:bg-white/10 transition"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full py-3.5 px-4 text-center rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-sm font-bold shadow-md"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
