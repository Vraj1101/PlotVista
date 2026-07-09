import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import PropertyImage from "../components/PropertyImage";
import { useCompare } from "../context/CompareContext";
import { toast } from "react-toastify";
const Home = () => {
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [recentProperties, setRecentProperties] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("recentProperties")) || [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("");
  const { addToCompare, compareList } = useCompare();
  const [savedSearches, setSavedSearches] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("savedSearches")) || [];
    } catch {
      return [];
    }
  });
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const fetchFeatured = async (search = "", sort = "") => {
    try {
      const { data } = await axios.get(
        `http://localhost:5000/api/properties?search=${search}&minPrice=${minPrice}&maxPrice=${maxPrice}&sort=${sort}&page=${page}`,
      );
      console.log("Searching for:", search);
      console.log("Results:", data.properties);
      console.log(JSON.stringify(data, null, 2));
      console.log(data.properties);
      setRecentProperties(data.properties || data || []);
      setPages(data.pages || 1);
      // Take up to 3 properties as featured listings
      setFeaturedProperties(data.properties || data || []);
    } catch (error) {
      console.error("Error fetching featured properties:", error);

      // Fallback realistic mock data if the API is offline
      setFeaturedProperties([
        {
          _id: "mock1",
          title: "Premium Corporate Land in Delhi NCR",
          price: 85000000,
          address: "Gurugram, Delhi NCR",
          areaSize: 10000,
          propertyType: "commercial",
          images: [
            "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
          ],
        },
        {
          _id: "mock2",
          title: "Luxury Villa Plot - Sea View",
          price: 45000000,
          address: "Bandra West, Mumbai",
          areaSize: 5000,
          propertyType: "residential",
          images: [
            "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
          ],
        },
        {
          _id: "mock3",
          title: "Fertile Agricultural Farmland",
          price: 15000000,
          address: "Nashik, Maharashtra",
          areaSize: 217800,
          propertyType: "agricultural",
          images: [
            "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80",
          ],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    setTimeout(() => {
      fetchFeatured();
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);
  console.log(featuredProperties);
  console.log(typeof featuredProperties);
  const filteredProperties =
    selectedFilter === "all"
      ? featuredProperties
      : featuredProperties.filter((property) => {
          if (
            selectedFilter === "residential" ||
            selectedFilter === "commercial" ||
            selectedFilter === "agricultural"
          ) {
            return property.propertyType === selectedFilter;
          }

          if (selectedFilter === "under50") {
            return property.price <= 5000000;
          }

          if (selectedFilter === "above1cr") {
            return property.price >= 10000000;
          }

          return true;
        });

  console.log("Selected Filter:", selectedFilter);
  console.log("Filtered Count:", filteredProperties.length);
  console.log(filteredProperties);
  return (
    <div className="bg-[#090f1d] text-white relative overflow-hidden min-h-screen">
      {/* Background Glowing Drifting Orbs */}
      <div className="absolute top-10 left-1/4 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[130px] animate-float-slow"></div>
      <div className="absolute top-40 right-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[130px] animate-float-delayed"></div>

      <div className="max-w-6xl mx-auto px-6 relative z-10 pt-24 pb-24">
        {/* HERO SECTION */}
        <div className="text-center mb-24">
          <span className="px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6 inline-block">
            ✨ Verified Partner Network
          </span>

          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight mb-8">
            Find the Earth <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              Beneath Your Dreams
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-lg md:text-xl text-gray-400 leading-relaxed mb-12 font-medium">
            PlotVista connects verified buyers and land sellers directly. Browse
            plots visually using precise GPS mapping, high-definition
            photography, and verified document access.
          </p>

          {/* HERO BUTTONS */}
          <div className="flex flex-col sm:flex-row justify-center gap-5">
            <Link
              to="/map"
              className="px-10 py-4.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all duration-300"
            >
              Explore Interactive Map
            </Link>
            <Link
              to="/signup"
              className="px-10 py-4.5 bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md text-white font-bold rounded-2xl hover:-translate-y-0.5 transition-all duration-300"
            >
              List Your Property
            </Link>
          </div>
        </div>

        <div className="max-w-4xl mx-auto mb-20 bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-md relative overflow-hidden">
          {/* Decorative subtle gradient background inside the card */}
          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 to-cyan-500/5 pointer-events-none"></div>
          
          <div className="relative z-10 space-y-4">
            {/* Top row: Search input and action buttons */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Search by city, area or property name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      fetchFeatured(searchTerm, sortBy);
                    }
                  }}
                  className="w-full bg-white/5 outline-none pl-12 pr-4 py-4 border border-white/10 rounded-2xl text-white placeholder-gray-400 focus:border-cyan-500/50 transition-colors"
                />
              </div>
              
              <div className="flex gap-3 w-full md:w-auto">
                <button
                  onClick={() => fetchFeatured(searchTerm.trim(), sortBy)}
                  className="flex-1 md:flex-none px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white rounded-2xl font-bold transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20 active:scale-98 cursor-pointer whitespace-nowrap"
                >
                  Search
                </button>
                <button
                  onClick={() => {
                    const saved =
                      JSON.parse(localStorage.getItem("savedSearches")) || [];

                    const newSearch = {
                      searchTerm,
                      sortBy,
                      selectedFilter,
                      minPrice,
                      maxPrice,
                    };

                    saved.unshift(newSearch);
                    const updatedSearches = saved.slice(0, 10);
                    localStorage.setItem(
                      "savedSearches",
                      JSON.stringify(updatedSearches),
                    );
                    setSavedSearches(updatedSearches);
                    toast.success("Search Saved ⭐");
                  }}
                  className="flex-1 md:flex-none px-6 py-4 bg-yellow-500 hover:bg-yellow-400 text-black rounded-2xl font-bold transition-all duration-300 active:scale-98 cursor-pointer whitespace-nowrap"
                >
                  ⭐ Save Search
                </button>
              </div>
            </div>

            {/* Bottom row: Price range filters and sorting */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 pt-2 border-t border-white/5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <span className="text-sm text-gray-400 font-semibold">Price Range</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min Price (₹)"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="flex-1 sm:flex-none bg-white/5 outline-none px-4 py-2.5 border border-white/10 rounded-xl w-full sm:w-36 text-sm placeholder-gray-500 focus:border-cyan-500/30 transition-colors"
                  />
                  <span className="text-gray-500">—</span>
                  <input
                    type="number"
                    placeholder="Max Price (₹)"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="flex-1 sm:flex-none bg-white/5 outline-none px-4 py-2.5 border border-white/10 rounded-xl w-full sm:w-36 text-sm placeholder-gray-500 focus:border-cyan-500/30 transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400 font-semibold whitespace-nowrap">Sort By</span>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    fetchFeatured(searchTerm, e.target.value);
                  }}
                  className="
                    w-full sm:w-auto
                    bg-[#131c2f]
                    border border-white/10
                    rounded-xl
                    px-5 py-2.5
                    text-white
                    text-sm
                    font-medium
                    outline-none
                    cursor-pointer
                    hover:border-cyan-500/40
                    transition-all
                    duration-300
                    min-w-[160px]
                  "
                >
                  <option value="" className="bg-[#131c2f] text-white">
                    Newest
                  </option>

                  <option value="price_asc" className="bg-[#131c2f] text-white">
                    Price: Low to High
                  </option>

                  <option value="price_desc" className="bg-[#131c2f] text-white">
                    Price: High to Low
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-4 mb-16 flex-wrap">
          <button
            onClick={() => setSelectedFilter("residential")}
            className={`px-4 py-2 rounded-full ${
              selectedFilter === "residential" ? "bg-cyan-500" : "bg-white/10"
            }`}
          >
            Residential
          </button>

          <button
            onClick={() => setSelectedFilter("commercial")}
            className={`px-4 py-2 rounded-full ${
              selectedFilter === "commercial" ? "bg-cyan-500" : "bg-white/10"
            }`}
          >
            Commercial
          </button>

          <button
            onClick={() => setSelectedFilter("agricultural")}
            className={`px-4 py-2 rounded-full ${
              selectedFilter === "agricultural" ? "bg-cyan-500" : "bg-white/10"
            }`}
          >
            Agricultural
          </button>

          <button
            onClick={() => setSelectedFilter("under50")}
            className={`px-4 py-2 rounded-full ${
              selectedFilter === "under50" ? "bg-cyan-500" : "bg-white/10"
            }`}
          >
            Under ₹50L
          </button>

          <button
            onClick={() => setSelectedFilter("above1cr")}
            className={`px-4 py-2 rounded-full ${
              selectedFilter === "above1cr" ? "bg-cyan-500" : "bg-white/10"
            }`}
          >
            Above ₹1Cr
          </button>

          <button
            onClick={() => setSelectedFilter("all")}
            className={`px-4 py-2 rounded-full ${
              selectedFilter === "all" ? "bg-cyan-500" : "bg-white/10"
            }`}
          >
            All
          </button>
        </div>
        {/* FEATURES SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
          {/* Feature 1 */}
          <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-md hover:bg-white/10 hover:border-emerald-500/30 transition-all duration-300 shadow-2xl hover-glow group">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
              🌍
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white">
              Interactive Mapping
            </h3>
            <p className="text-gray-450 leading-relaxed text-sm">
              Visually browse plots with exact boundary mappings, localized
              zoning data, and precise GPS overlays directly on our dark-theme
              map.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-md hover:bg-white/10 hover:border-emerald-500/30 transition-all duration-300 shadow-2xl hover-glow group">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
              🛡️
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white">
              100% Verified
            </h3>
            <p className="text-gray-450 leading-relaxed text-sm">
              All plots are rigorously vetted. We verify title deeds, zoning
              permits, environmental clearances, and government records before
              listing.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-md hover:bg-white/10 hover:border-emerald-500/30 transition-all duration-300 shadow-2xl hover-glow group">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
              💬
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white">
              Direct Contact
            </h3>
            <p className="text-gray-450 leading-relaxed text-sm">
              Communicate directly with verified landowners. No broker
              interference, no hidden commission fees, just honest transparent
              agreements.
            </p>
          </div>
        </div>

        {/* Saved Searches */}
        {savedSearches.length > 0 && (
          <div className="mb-20">
            <h2 className="text-3xl font-bold mb-6">⭐ Saved Searches</h2>

            <div className="flex flex-wrap gap-3">
              {savedSearches.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSearchTerm(item.searchTerm);
                    setSortBy(item.sortBy);
                    setSelectedFilter(item.selectedFilter);
                    setMinPrice(item.minPrice || "");
                    setMaxPrice(item.maxPrice || "");

                    setTimeout(() => {
                      fetchFeatured(item.searchTerm, item.sortBy);
                    }, 100);
                  }}
                  className="px-5 py-3 bg-white/5 rounded-2xl border border-white/10"
                >
                  {item.searchTerm || "All Properties"}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* FEATURED PROPERTIES SECTION */}
        <div>
          <div className="text-center mb-16">
            <span className="text-sm font-bold tracking-wider text-emerald-400 uppercase mb-3 block">
              Curated Picks
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
              Featured Properties
            </h2>
            <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto">
              Explore hand-selected prime investment lands vetted by our local
              real estate partners.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-400"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {filteredProperties.map((property) => (
                <div
                  key={property._id}
                  className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden hover:scale-[1.02] hover:border-emerald-500/30 transition-all duration-300 shadow-2xl flex flex-col justify-between group"
                >
                  <div className="relative overflow-hidden">
                    <PropertyImage
                      src={property.images?.[0]}
                      alt={property.title}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#090f1d]/85 text-emerald-400 border border-emerald-500/30 backdrop-blur-md uppercase">
                        Verified
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#090f1d]/85 text-cyan-400 border border-cyan-500/30 backdrop-blur-md capitalize">
                        {property.propertyType}
                      </span>
                      {property.status && (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md uppercase
      ${
        property.status === "available"
          ? "bg-green-500/20 text-green-400 border border-green-500/30"
          : property.status === "reserved"
            ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
            : "bg-red-500/20 text-red-400 border border-red-500/30"
      }
    `}
                        >
                          {property.status?.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-8 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-3xl font-black text-white">
                          ₹
                          {((property.price || 0) / 100000).toLocaleString(
                            "en-IN",
                          )}
                        </span>
                        <span className="text-sm font-semibold text-gray-500">
                          Lakhs
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-white mb-2 leading-snug group-hover:text-emerald-400 transition-colors line-clamp-1">
                        {property.title}
                      </h3>

                      <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                        📍 {property.address}
                      </p>

                      <div className="border-t border-white/5 pt-4 mt-4">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>
                            Area:
                            <strong className="text-gray-300">
                              {" "}
                              {(property.areaSize || 0).toLocaleString()} sq.ft
                            </strong>
                          </span>

                          <span>Direct Deal</span>
                        </div>

                        <div className="flex justify-between mt-3 text-xs">
                          <span className="text-cyan-400">
                            👁 {property.views || 0} Views
                          </span>

                          <span className="text-pink-400">
                            ❤️ {property.favoritesCount || 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Link
                      to={`/property/${property._id}`}
                      className="w-full mt-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 font-bold text-center text-sm hover:opacity-95 transition-opacity"
                    >
                      View Details
                    </Link>

                    <button
                      onClick={() => addToCompare(property)}
                      className="w-full mt-3 py-3 rounded-2xl border border-cyan-500 text-cyan-400"
                    >
                      Compare
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {pages > 1 && (
            <div className="flex justify-center gap-2 mt-12">
              {[...Array(pages).keys()].map((x) => (
                <button
                  key={x + 1}
                  onClick={() => setPage(x + 1)}
                  className={`px-4 py-2 rounded-lg font-bold transition duration-300 ${
                    page === x + 1 ? "bg-emerald-500 text-white" : "bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white"
                  }`}
                >
                  {x + 1}
                </button>
              ))}
            </div>
          )}
        </div>
        {recentProperties.length > 0 && (
          <div className="mt-24">
            <h2 className="text-4xl font-bold mb-8">Recently Viewed</h2>

            <div className="grid md:grid-cols-3 gap-6">
              {recentProperties.map((property) => (
                <Link
                  key={property._id}
                  to={`/property/${property._id}`}
                  className="bg-white/5 p-5 rounded-2xl hover:bg-white/10 transition"
                >
                  <PropertyImage
                    src={property.images?.[0]}
                    alt={property.title}
                    className="h-48 w-full object-cover rounded-xl"
                  />

                  <h3 className="mt-4 font-bold">{property.title}</h3>

                  <p className="text-gray-400">
                    ₹ {property.price?.toLocaleString()}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-24">
          <h2 className="text-4xl font-bold mb-8">Recently Added</h2>

          <div className="grid md:grid-cols-3 gap-6">
            {featuredProperties.slice(0, 6).map((property) => (
              <div key={property._id} className="bg-white/5 p-5 rounded-2xl">
                <PropertyImage
                  src={property.images?.[0]}
                  alt={property.title}
                  className="h-48 w-full object-cover rounded-xl"
                />

                <h3 className="mt-4 font-bold">{property.title}</h3>

                <p
                  className={`text-sm mt-1 font-semibold
    ${
      property.status === "available"
        ? "text-green-400"
        : property.status === "reserved"
          ? "text-yellow-400"
          : "text-red-400"
    }
  `}
                >
                  {property.status?.toUpperCase()}
                </p>
                <p className="text-gray-400">
                  ₹ {property.price.toLocaleString()}
                </p>

                <p className="text-xs text-gray-500 mt-2">
                  Added on {new Date(property.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      {compareList.length > 0 && (
        <div className="fixed bottom-6 right-6 bg-cyan-500 text-white px-6 py-3 rounded-2xl shadow-lg">
          <Link to="/compare">Compare ({compareList.length})</Link>
        </div>
      )}
    </div>
  );
};

export default Home;
