import { useEffect, useState } from "react";
import axios from "axios";

const AdminDashboard = () => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [reports, setReports] = useState([]);

  // UI state variables
  const [activeTab, setActiveTab] = useState("overview"); // overview, users, properties, reports
  const [userSearch, setUserSearch] = useState("");
  const [propertySearch, setPropertySearch] = useState("");
  const [propertyFilter, setPropertyFilter] = useState("all"); // all, pending, approved

  const fetchStats = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("userInfo"));
      if (!storedUser) return;

      const usersRes = await axios.get("http://localhost:5000/api/admin/users", {
        headers: {
          Authorization: `Bearer ${storedUser.token}`,
        },
      });
      setUsers(usersRes.data);

      const statsRes = await axios.get("http://localhost:5000/api/admin/stats", {
        headers: {
          Authorization: `Bearer ${storedUser.token}`,
        },
      });
      setStats(statsRes.data);

      const propertiesRes = await axios.get("http://localhost:5000/api/admin/properties", {
        headers: {
          Authorization: `Bearer ${storedUser.token}`,
        },
      });
      setProperties(propertiesRes.data);

      const reportsRes = await axios.get("http://localhost:5000/api/reports", {
        headers: {
          Authorization: `Bearer ${storedUser.token}`,
        },
      });
      setReports(reportsRes.data);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      fetchStats();
    }, 0);
  }, []);

  const deleteProperty = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this property listing?")) return;
    try {
      const storedUser = JSON.parse(localStorage.getItem("userInfo"));
      await axios.delete(`http://localhost:5000/api/admin/properties/${id}`, {
        headers: {
          Authorization: `Bearer ${storedUser.token}`,
        },
      });
      setProperties(properties.filter((p) => p._id !== id));
      fetchStats();
    } catch (error) {
      console.error("Error deleting property:", error);
    }
  };

  const deleteUser = async (id) => {
    if (id === userInfo._id) {
      alert("You cannot delete your own admin account.");
      return;
    }
    if (!window.confirm("Are you sure you want to permanently delete this user account?")) return;
    try {
      const storedUser = JSON.parse(localStorage.getItem("userInfo"));
      await axios.delete(`http://localhost:5000/api/admin/users/${id}`, {
        headers: {
          Authorization: `Bearer ${storedUser.token}`,
        },
      });
      setUsers(users.filter((u) => u._id !== id));
      fetchStats();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const updateRole = async (userId, role) => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("userInfo"));
      await axios.put(
        `http://localhost:5000/api/admin/users/${userId}/role`,
        { role },
        {
          headers: {
            Authorization: `Bearer ${storedUser.token}`,
          },
        }
      );
      fetchStats();
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  const approveProperty = async (id) => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("userInfo"));
      await axios.put(
        `http://localhost:5000/api/admin/properties/${id}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${storedUser.token}`,
          },
        }
      );
      fetchStats();
    } catch (error) {
      console.error("Error approving property:", error);
    }
  };

  const resolveReport = async (id) => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("userInfo"));
      await axios.put(
        `http://localhost:5000/api/reports/${id}/resolve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${storedUser.token}`,
          },
        }
      );
      fetchStats();
    } catch (error) {
      console.error("Error resolving report:", error);
    }
  };

  const verifySeller = async (id) => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("userInfo"));
      await axios.put(
        `http://localhost:5000/api/admin/users/${id}/verify`,
        {},
        {
          headers: {
            Authorization: `Bearer ${storedUser.token}`,
          },
        }
      );
      fetchStats();
    } catch (error) {
      console.error("Error verifying seller:", error);
    }
  };

  if (!stats) {
    return (
      <div className="min-h-screen bg-[#090f1d] text-white flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-t-emerald-500 border-r-cyan-500 border-white/10 animate-spin"></div>
        <p className="text-gray-400 text-sm font-semibold animate-pulse">Loading Admin Panel...</p>
      </div>
    );
  }

  // Filter lists based on searches
  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredProperties = properties.filter((p) => {
    const matchesSearch =
      p.title?.toLowerCase().includes(propertySearch.toLowerCase()) ||
      p.address?.toLowerCase().includes(propertySearch.toLowerCase());
    
    const matchesFilter =
      propertyFilter === "all" ||
      (propertyFilter === "pending" && p.approvalStatus === "pending") ||
      (propertyFilter === "approved" && p.approvalStatus === "approved");

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-[#090f1d] text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 pb-6 border-b border-white/5">
          <div>
            <span className="text-xs font-bold bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 px-4 py-1.5 rounded-full uppercase tracking-wider mb-3 inline-block">
              System Administration
            </span>
            <h1 className="text-4xl font-black flex items-center gap-3">
              <span>🛡️</span> Admin Console
            </h1>
          </div>
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center font-bold text-xs">
              {userInfo.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xs font-bold leading-tight">{userInfo.name}</p>
              <p className="text-[10px] text-gray-500 leading-none mt-0.5">Logged in as Administrator</p>
            </div>
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white/5 border border-white/10 p-1.5 rounded-2xl">
          {[
            { id: "overview", label: "📊 Overview" },
            { id: "users", label: "👥 Manage Users" },
            { id: "properties", label: "🏡 Properties" },
            { id: "reports", label: `🚩 Reports (${reports.filter((r) => r.status === "pending").length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[120px] text-center py-3 px-4 rounded-xl text-xs font-bold tracking-wide transition duration-300 cursor-pointer ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-md shadow-emerald-500/15"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB CONTENTS */}
        {activeTab === "overview" && (
          <div className="space-y-10 animate-fade-in">
            {/* STATS CARDS */}
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { title: "Total Registered Users", count: stats.totalUsers, color: "from-cyan-500/20 to-cyan-500/5", textColor: "text-cyan-400" },
                { title: "Active Properties", count: stats.totalProperties, color: "from-emerald-500/20 to-emerald-500/5", textColor: "text-emerald-400" },
                { title: "Total Inquiries", count: stats.totalInquiries, color: "from-purple-500/20 to-purple-500/5", textColor: "text-purple-400" },
              ].map((stat, idx) => (
                <div
                  key={idx}
                  className="relative overflow-hidden bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-3xl p-6 shadow-xl hover:-translate-y-1 hover:border-white/20 transition-all duration-300 group"
                >
                  <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} rounded-full blur-2xl group-hover:scale-125 transition-transform duration-300`}></div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 relative z-10">{stat.title}</h3>
                  <p className={`text-5xl font-black tracking-tight mt-3 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent relative z-10`}>
                    {stat.count}
                  </p>
                </div>
              ))}
            </div>

            {/* QUICK OVERVIEW / ACTIVITY PANEL */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8">
              <h2 className="text-xl font-bold mb-4">Quick Insights</h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                PlotVista Console status is <span className="text-emerald-400 font-bold">online and secure</span>. 
                Use the navigation tabs above to review seller verifications, manage uploaded land plots, or investigate user-flagged listings.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/5 p-5 rounded-2xl">
                  <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Pending Approvals</span>
                  <p className="text-2xl font-black text-amber-400 mt-1">
                    {properties.filter((p) => p.approvalStatus === "pending").length} Properties
                  </p>
                </div>
                <div className="bg-white/5 border border-white/5 p-5 rounded-2xl">
                  <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Open Disputes</span>
                  <p className="text-2xl font-black text-red-400 mt-1">
                    {reports.filter((r) => r.status === "pending").length} Flagged Reports
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="space-y-6 animate-fade-in">
            {/* SEARCH */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <h2 className="text-2xl font-black self-start">👥 User Database</h2>
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="🔍 Search users by name or email..."
                className="w-full sm:max-w-md bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-cyan-400 focus:bg-white/10 transition"
              />
            </div>

            {/* LIST */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {filteredUsers.length === 0 ? (
                <div className="col-span-full py-20 text-center text-gray-500 bg-white/5 border border-white/10 rounded-3xl">
                  No users found matching your search.
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <div
                    key={user._id}
                    className="bg-white/5 border border-white/10 p-6 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-white/20 transition-all duration-300"
                  >
                    <div className="space-y-2">
                      <div>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase border mr-2 ${
                          user.role === "admin"
                            ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                            : user.role === "seller"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                        }`}>
                          {user.role}
                        </span>
                        {user.isVerifiedSeller && (
                          <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mr-2">
                            ✓ Verified Seller
                          </span>
                        )}
                        {!user.isVerified && (
                          <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase bg-red-500/10 text-red-400 border border-red-500/20 mr-2">
                            ⚠️ Email Unverified
                          </span>
                        )}
                        {!user.isPhoneVerified && (
                          <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase bg-red-500/10 text-red-400 border border-red-500/20">
                            ⚠️ Phone Unverified
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold">{user.name}</h3>
                      <p className="text-xs text-gray-400">{user.email}</p>
                      {user.phone && <p className="text-[11px] text-gray-500 font-mono">{user.phone}</p>}

                      {/* ROLE TOGGLE */}
                      <div className="pt-2">
                        <select
                          value={user.role}
                          onChange={(e) => updateRole(user._id, e.target.value)}
                          className="bg-[#090f1d] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white outline-none cursor-pointer hover:border-white/20"
                        >
                          <option value="buyer">Change Role: Buyer</option>
                          <option value="seller">Change Role: Seller</option>
                          <option value="admin">Change Role: Admin</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col sm:items-end gap-2.5 w-full sm:w-auto">
                      {/* DELETE USER (DISABLED ON ONESELF) */}
                      {user._id === userInfo._id ? (
                        <span className="px-4 py-2 text-xs font-bold text-cyan-400 border border-cyan-500/20 bg-cyan-500/10 rounded-xl text-center self-stretch sm:self-auto">
                          🛡️ Logged In (You)
                        </span>
                      ) : (
                        <button
                          onClick={() => deleteUser(user._id)}
                          className="bg-red-500/15 hover:bg-red-500 border border-red-500/20 text-red-400 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition duration-300 cursor-pointer text-center"
                        >
                          Delete Account
                        </button>
                      )}

                      {/* VERIFY SELLER BUTTON */}
                      {user.role === "seller" && !user.isVerifiedSeller && (
                        <button
                          onClick={() => verifySeller(user._id)}
                          className="bg-emerald-500 text-white hover:bg-emerald-400 px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/20 transition cursor-pointer text-center"
                        >
                          Verify Seller
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "properties" && (
          <div className="space-y-6 animate-fade-in">
            {/* HEAD & SEARCH */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <h2 className="text-2xl font-black self-start">🏡 Property Listings</h2>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:max-w-xl">
                <input
                  type="text"
                  value={propertySearch}
                  onChange={(e) => setPropertySearch(e.target.value)}
                  placeholder="🔍 Search properties by name/address..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-cyan-400 focus:bg-white/10 transition"
                />
                <select
                  value={propertyFilter}
                  onChange={(e) => setPropertyFilter(e.target.value)}
                  className="bg-[#090f1d] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none cursor-pointer hover:border-white/20"
                >
                  <option value="all">Filter: All Properties</option>
                  <option value="pending">Filter: Pending Approval</option>
                  <option value="approved">Filter: Approved Only</option>
                </select>
              </div>
            </div>

            {/* LIST */}
            <div className="grid grid-cols-1 gap-6">
              {filteredProperties.length === 0 ? (
                <div className="py-20 text-center text-gray-500 bg-white/5 border border-white/10 rounded-3xl">
                  No properties found matching your selection.
                </div>
              ) : (
                filteredProperties.map((property) => (
                  <div
                    key={property._id}
                    className="bg-white/5 border border-white/10 p-5 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-white/20 transition-all duration-300"
                  >
                    <div className="flex items-start gap-4">
                      {/* Thumbnail Image */}
                      {property.images && property.images.length > 0 ? (
                        <img
                          src={property.images[0]}
                          alt={property.title}
                          className="w-20 h-20 md:w-28 md:h-28 rounded-2xl object-cover border border-white/10 shrink-0 bg-white/5"
                        />
                      ) : (
                        <div className="w-20 h-20 md:w-28 md:h-28 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-3xl shrink-0">
                          🗺️
                        </div>
                      )}

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {property.approvalStatus === "pending" ? (
                            <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></span>
                              Pending Approval
                            </span>
                          ) : (
                            <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                              Approved
                            </span>
                          )}
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-white/5 border border-white/5 text-gray-400 uppercase">
                            {property.propertyType}
                          </span>
                        </div>
                        <h3 className="text-lg font-black pt-1">{property.title}</h3>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          📍 {property.address}
                        </p>
                        <p className="text-emerald-400 font-bold text-sm font-mono pt-1">
                          ₹{property.price.toLocaleString("en-IN")}
                        </p>
                        <div className="pt-2 text-[10px] text-gray-500">
                          Uploaded by: <span className="text-gray-400 font-semibold">{property.seller?.name || "Unknown Seller"}</span> ({property.seller?.email || "N/A"})
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-row md:flex-col gap-2.5 w-full md:w-auto self-stretch md:self-auto justify-end">
                      {/* Approve Button */}
                      {property.approvalStatus === "pending" && (
                        <button
                          onClick={() => approveProperty(property._id)}
                          className="flex-1 md:flex-initial bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/15 transition cursor-pointer text-center"
                        >
                          Approve Plot
                        </button>
                      )}

                      {/* Delete Button */}
                      <button
                        onClick={() => deleteProperty(property._id)}
                        className="flex-1 md:flex-initial bg-red-500/15 hover:bg-red-500 border border-red-500/20 text-red-400 hover:text-white px-5 py-2.5 rounded-xl text-xs font-bold transition duration-300 cursor-pointer text-center"
                      >
                        Delete Listing
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "reports" && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-black">🚩 Flagged Property Reports</h2>

            <div className="grid grid-cols-1 gap-6">
              {reports.length === 0 ? (
                <div className="py-20 text-center text-gray-500 bg-white/5 border border-white/10 rounded-3xl">
                  No flagged listings reported. Everything is clear!
                </div>
              ) : (
                reports.map((report) => (
                  <div
                    key={report._id}
                    className="bg-white/5 border border-white/10 p-6 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-white/20 transition duration-300"
                  >
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-2">
                        {report.status === "pending" ? (
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                            Active Dispute
                          </span>
                        ) : (
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Resolved
                          </span>
                        )}
                      </div>

                      <div>
                        <h3 className="text-lg font-black">{report.property?.title || "Deleted Property"}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Reported By: <span className="text-gray-400 font-semibold">{report.reportedBy?.name || "Anonymous User"}</span>
                        </p>
                      </div>

                      <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-4 text-xs max-w-2xl">
                        <span className="block font-bold text-red-400 uppercase tracking-wider text-[10px] mb-1">Reason for Flag:</span>
                        <p className="text-gray-300 leading-relaxed font-medium mb-2">{report.reason}</p>
                        {report.description && (
                          <>
                            <span className="block font-bold text-red-400 uppercase tracking-wider text-[10px] mt-3 mb-1">Additional details:</span>
                            <p className="text-gray-300 leading-relaxed font-medium">{report.description}</p>
                          </>
                        )}
                      </div>
                    </div>

                    {report.status === "pending" && (
                      <button
                        onClick={() => resolveReport(report._id)}
                        className="w-full md:w-auto bg-emerald-500 text-white hover:bg-emerald-400 px-5 py-3 rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/20 transition cursor-pointer text-center"
                      >
                        Resolve Dispute
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
