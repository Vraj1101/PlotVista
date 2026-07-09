import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts";
const MyProperties = () => {
  const [properties, setProperties] = useState([]);
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalViews: 0,
    totalFavorites: 0,
  });

  const [topProperty, setTopProperty] = useState(null);
  const [mostSavedProperty, setMostSavedProperty] = useState(null);

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const navigate = useNavigate();

  const fetchProperties = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:5000/api/properties/my",
        {
          headers: {
            Authorization: `Bearer ${userInfo?.token}`,
          },
        },
      );

      setProperties(data);

      const totalViews = data.reduce(
        (sum, property) => sum + (property.views || 0),
        0,
      );

      const totalFavorites = data.reduce(
        (sum, property) => sum + (property.favoritesCount || 0),
        0,
      );

      setStats({
        totalProperties: data.length,
        totalViews,
        totalFavorites,
      });

      if (data.length > 0) {
        const bestProperty = data.reduce((best, current) =>
          (current.views || 0) > (best.views || 0) ? current : best,
        );

        setTopProperty(bestProperty);
      }

      if (data.length > 0) {
        const mostSavedProperty = data.reduce((mostSaved, current) =>
          (current.favoritesCount || 0) > (mostSaved.favoritesCount || 0)
            ? current
            : mostSaved,
        );

        setMostSavedProperty(mostSavedProperty);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!userInfo) {
      navigate("/login");
    } else {
      setTimeout(() => {
        fetchProperties();
      }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const deleteHandler = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/properties/${id}`, {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      });

      fetchProperties();
    } catch (error) {
      console.log(error);
    }
  };

  const updateStatus = async (propertyId, status) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));

      await axios.put(
        `http://localhost:5000/api/properties/${propertyId}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        },
      );

      fetchProperties();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">My Properties</h1>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white/5 p-6 rounded-2xl">
          <h3 className="text-gray-400">Total Properties</h3>

          <p className="text-3xl font-bold mt-2">{stats.totalProperties}</p>
        </div>

        <div className="bg-white/5 p-6 rounded-2xl">
          <h3 className="text-gray-400">Total Views</h3>

          <p className="text-3xl font-bold mt-2">{stats.totalViews}</p>
        </div>

        <div className="bg-white/5 p-6 rounded-2xl">
          <h3 className="text-gray-400">Total Favorites</h3>

          <p className="text-3xl font-bold mt-2">{stats.totalFavorites}</p>
        </div>
      </div>

      <div className="bg-white/5 p-6 rounded-2xl mb-8">
        <h2 className="text-2xl font-bold mb-4">🏆 Top Performing Property</h2>
        {topProperty ? (
          <>
            <h3 className="text-xl font-semibold">{topProperty.title}</h3>

            <p className="text-gray-400 mt-2">Views: {topProperty.views}</p>

            <p className="text-gray-400">
              Favorites:
              {topProperty.favoritesCount}
            </p>

            <p className="text-gray-400">₹ {topProperty.price}</p>
          </>
        ) : (
          <p>No properties available</p>
        )}
      </div>

      <div className="bg-white/5 p-6 rounded-2xl mb-8">
        <h2 className="text-2xl font-bold mb-4">❤️ Most Saved Property</h2>

        {mostSavedProperty ? (
          <>
            <h3 className="text-xl font-semibold">{mostSavedProperty.title}</h3>

            <p className="text-gray-400 mt-2">
              Favorites:
              {mostSavedProperty.favoritesCount}
            </p>

            <p className="text-gray-400">
              Views:
              {mostSavedProperty.views}
            </p>
          </>
        ) : (
          <p>No properties available</p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {properties.map((property) => (
          <div
            key={property._id}
            className="
    bg-white/5
    backdrop-blur-xl
    border border-white/10
    rounded-3xl
    p-6
    hover:border-cyan-500/30
    hover:scale-[1.02]
    transition-all
    duration-300
  "
          >
            <h2 className="text-2xl font-bold">{property.title}</h2>

            <p className="text-gray-400 mt-2">₹ {property.price}</p>

            <p className="text-gray-400">Views: {property.views}</p>

            <span
              className={`inline-flex px-4 py-2 rounded-full text-sm font-bold mt-3 ${
                property.status === "available"
                  ? "bg-green-500/10 text-green-400 border border-green-500/30"
                  : property.status === "reserved"
                    ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30"
                    : "bg-red-500/10 text-red-400 border border-red-500/30"
              }`}
            >
              {property.status === "available"
                ? "🟢 Available"
                : property.status === "reserved"
                  ? "🟡 Reserved"
                  : "🔴 Sold"}
            </span>
            <p className="text-sm mt-2">
              Approval:
              {property.approvalStatus === "approved"
                ? " ✅ Approved"
                : property.approvalStatus === "rejected"
                  ? " ❌ Rejected"
                  : property.approvalStatus === "draft"
                    ? " 📝 Draft"
                    : " ⏳ Pending"}
            </p>

            <p className="text-gray-400">
              Favorites: {property.favoritesCount}
            </p>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => navigate(`/property/${property._id}`)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold transition cursor-pointer"
              >
                View
              </button>

              <button
                onClick={() => navigate(`/edit-property/${property._id}`)}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold transition cursor-pointer"
              >
                Edit
              </button>

              <button
                onClick={() => deleteHandler(property._id)}
                className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-bold transition cursor-pointer"
              >
                Delete
              </button>
            </div>
            <select
              value={property.status}
              onChange={(e) => updateStatus(property._id, e.target.value)}
              className="
    mt-4
    w-full
    bg-[#131d35]
    border border-white/10
    rounded-xl
    px-4
    py-3
    text-white
    font-semibold
    outline-none
    focus:border-cyan-400
    transition-all
  "
            >
              <option value="available">🟢 Available</option>
              <option value="reserved">🟡 Reserved</option>
              <option value="sold">🔴 Sold</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyProperties;
