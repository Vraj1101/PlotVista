import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const SellerDashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("userInfo"));
        if (!storedUser) return;

        const { data } = await axios.get(
          "http://localhost:5000/api/dashboard/seller",
          {
            headers: {
              Authorization: `Bearer ${storedUser.token}`,
            },
          }
        );

        setStats(data);
      } catch (error) {
        console.error("Error fetching seller dashboard stats:", error);
      }
    };

    fetchStats();
  }, []);

  if (!stats) {
    return (
      <div className="min-h-screen bg-[#090f1d] text-white flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-t-emerald-500 border-r-cyan-500 border-white/10 animate-spin"></div>
        <p className="text-gray-400 text-sm font-semibold animate-pulse">Loading Seller Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090f1d] text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10 pb-6 border-b border-white/5">
          <div>
            <span className="text-xs font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-1.5 rounded-full uppercase tracking-wider mb-3 inline-block">
              Seller Hub
            </span>
            <h1 className="text-4xl font-black">Seller Dashboard</h1>
          </div>
          <Link
            to="/seller-inquiries"
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-bold px-6 py-3.5 rounded-2xl shadow-lg shadow-emerald-500/15 hover:shadow-emerald-500/30 transition-all cursor-pointer"
          >
            <span>📩</span> View Inquiries
          </Link>
        </div>

        {/* STATS CARDS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6 mb-10">
          {[
            { title: "Total Properties", count: stats.totalProperties, color: "text-white" },
            { title: "Available", count: stats.availableProperties, color: "text-emerald-400" },
            { title: "Sold", count: stats.soldProperties, color: "text-red-400" },
            { title: "Inquiries", count: stats.totalInquiries, color: "text-cyan-400" },
            { title: "Total Views", count: stats.totalViews, color: "text-yellow-400" },
            { title: "Total Favorites", count: stats.totalFavorites || 0, color: "text-pink-400" },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="bg-white/5 border border-white/10 p-5 rounded-3xl hover:border-white/20 transition-all duration-300"
            >
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">{stat.title}</h3>
              <p className={`text-4xl font-black tracking-tight mt-3 ${stat.color}`}>
                {stat.count}
              </p>
            </div>
          ))}
        </div>

        {/* DETAILED WIDGETS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* TOP PERFORMING PROPERTY */}
          <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 md:p-8 backdrop-blur-xl">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
              <span>🏆</span> Top Performing Property
            </h2>

            {stats.topProperty ? (
              <div className="bg-[#0b1325] border border-white/5 rounded-2xl p-6 space-y-4">
                <h3 className="text-xl font-bold text-white">{stats.topProperty.title}</h3>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="bg-white/5 p-4 rounded-xl">
                    <span className="block text-[10px] uppercase font-bold text-gray-500 tracking-wider">Views</span>
                    <span className="text-xl font-bold text-yellow-400">👁️ {stats.topProperty.views || 0}</span>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl">
                    <span className="block text-[10px] uppercase font-bold text-gray-500 tracking-wider">Price</span>
                    <span className="text-xl font-mono font-bold text-emerald-400">₹{stats.topProperty.price.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-gray-500">
                No properties uploaded yet.
              </div>
            )}
          </div>

          {/* RECENT INQUIRIES */}
          <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 md:p-8 backdrop-blur-xl">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
              <span>📩</span> Recent Inquiries
            </h2>

            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
              {stats.recentInquiries && stats.recentInquiries.length > 0 ? (
                stats.recentInquiries.map((inquiry) => (
                  <div
                    key={inquiry._id}
                    className="bg-[#0b1325] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all duration-300"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-white text-sm">{inquiry.buyer?.name || "Interested Buyer"}</span>
                      <span className="text-[10px] text-gray-500">{new Date(inquiry.createdAt).toLocaleDateString()}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full inline-block mb-3">
                      Plot: {inquiry.property?.title || "Deleted Property"}
                    </span>
                    <p className="text-xs text-gray-400 leading-relaxed italic bg-white/5 p-3 rounded-xl">
                      "{inquiry.message}"
                    </p>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-gray-500">
                  No inquiries received yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
