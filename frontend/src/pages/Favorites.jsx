import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import PropertyImage from "../components/PropertyImage";

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        if (!userInfo) {
          setLoading(false);
          return;
        }

        const { data } = await axios.get(
          "http://localhost:5000/api/favorites/my",
          {
            headers: {
              Authorization: `Bearer ${userInfo.token}`,
            },
          },
        );

        setFavorites(data);
      } catch (error) {
        console.error("Error fetching favorites:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const removeFavorite = async (favoriteId) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));

      await axios.delete(`http://localhost:5000/api/favorites/${favoriteId}`, {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      });

      setFavorites(favorites.filter((fav) => fav._id !== favoriteId));
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 25 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 22,
      },
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 text-white min-h-[75vh] flex flex-col">
      {/* HEADER PAGE SECTION */}
      <div className="mb-10 text-left border-b border-white/5 pb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold flex items-center gap-3">
          <span className="bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
            My Favorites
          </span>
          <span className="text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]">❤️</span>
        </h1>
        <p className="text-white/50 text-sm mt-2">
          Keep track of the plots and lands that catch your eye. Compare prices, check details, or delete listings.
        </p>
      </div>

      {loading ? (
        /* LOADING PLACEHOLDER */
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin mb-4" />
          <p className="text-white/40 text-sm font-semibold">Loading your favorites...</p>
        </div>
      ) : favorites.length > 0 ? (
        /* FAVORITES GRID LIST */
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {favorites.map((item) => {
              if (!item.property) return null;
              return (
                <motion.div
                  key={item._id}
                  variants={cardVariants}
                  layout
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  className="bg-gradient-to-b from-[#131b2e] to-[#0d162d] border border-white/5 rounded-2xl p-4 hover:border-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/5 transition-all duration-300 relative overflow-hidden group flex flex-col justify-between"
                >
                  {/* Floating Action heart button */}
                  <button
                    onClick={() => removeFavorite(item._id)}
                    className="absolute top-6 right-6 bg-red-500/20 backdrop-blur-md border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white p-2 rounded-full shadow-lg z-10 transition duration-300 cursor-pointer"
                    title="Remove from favorites"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </button>

                  <Link to={`/property/${item.property._id}`} className="block flex-1 group">
                    {/* Card Image */}
                    <div className="relative overflow-hidden rounded-xl bg-white/5">
                      <PropertyImage
                        src={item.property.images?.[0]}
                        alt={item.property.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                        <span className="text-[10px] bg-emerald-500 text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          View details
                        </span>
                      </div>
                    </div>

                    {/* Metadata tags */}
                    <div className="flex gap-2 mt-4 items-center">
                      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 border border-white/5 text-white/50">
                        {item.property.propertyType || "Plot"}
                      </span>
                      <span className="text-[9px] font-semibold text-emerald-400">
                        Verified
                      </span>
                    </div>

                    {/* Card Title */}
                    <h2 className="mt-2 text-base font-extrabold text-white/90 group-hover:text-emerald-400 transition-colors line-clamp-1">
                      {item.property.title}
                    </h2>

                    {/* Card Location */}
                    <p className="text-xs text-white/40 mt-1 line-clamp-1 flex items-center gap-1">
                      📍 {item.property.address || "Location not specified"}
                    </p>

                    {/* Price details */}
                    <p className="mt-3 text-lg font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                      ₹ {item.property.price?.toLocaleString()}
                    </p>
                  </Link>

                  {/* Remove Button Action */}
                  <button
                    onClick={() => removeFavorite(item._id)}
                    className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-500/10 bg-red-950/10 hover:bg-red-500 text-red-400 hover:text-white text-xs font-bold transition-all duration-300 cursor-pointer"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Remove Favorite
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      ) : (
        /* BEAUTIFUL EMPTY STATE */
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
          <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-xl relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500/10 to-pink-500/10 blur-xl animate-pulse" />
            <span className="text-3xl relative z-10">❤️</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No Favorites Saved</h2>
          <p className="text-white/50 text-sm mb-8">
            Explore land listings on our map or homepage, and save your favorite plots to view them later.
          </p>
          <Link
            to="/map"
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-bold text-sm transition shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:-translate-y-0.5"
          >
            Explore Land Map
          </Link>
        </div>
      )}
    </div>
  );
};

export default Favorites;
