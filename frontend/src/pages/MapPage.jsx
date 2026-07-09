import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import axios from "axios";
import * as L from "leaflet";
import { Link } from "react-router-dom";
import PropertyImage from "../components/PropertyImage";

// Premium Glowing Pulsing Leaflet Marker Icon
const customIcon = new L.DivIcon({
  className: "custom-div-icon",
  html: '<div class="glowing-pin"><div class="glowing-pin-inner"></div></div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -16],
});

/* MAP FLY COMPONENT */
const FlyToProperty = ({ property }) => {
  const map = useMap();
  useEffect(() => {
    if (property) {
      map.flyTo([property.location.lat, property.location.lng], 13, {
        duration: 1.5,
      });
    }
  }, [property, map]);
  return null;
};

const MapPage = () => {
  const [properties, setProperties] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [sortType, setSortType] = useState("default");

  const defaultCenter = [20.5937, 78.9629];

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const { data } = await axios.get("http://localhost:5000/api/properties");
        setProperties(data.properties);
      } catch (error) {
        console.error("Error fetching properties for map:", error);
        // Fallback data if API is offline
        setProperties([
          {
            _id: "mock1",
            title: "Premium Corporate Land in Delhi NCR",
            description: "An exceptional commercial plot located in the heart of Delhi NCR.",
            price: 85000000,
            areaSize: 10000,
            address: "Gurugram, Delhi NCR",
            location: { lat: 28.4595, lng: 77.0266 },
            propertyType: "commercial",
            images: ["https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80"]
          },
          {
            _id: "mock2",
            title: "Luxury Villa Plot - Sea View",
            description: "Build your dream home on this exclusive residential plot overlooking the Arabian Sea.",
            price: 45000000,
            areaSize: 5000,
            address: "Bandra West, Mumbai",
            location: { lat: 19.0596, lng: 72.8295 },
            propertyType: "residential",
            images: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80"]
          },
          {
            _id: "mock3",
            title: "Fertile Agricultural Farmland",
            description: "Over 5 acres of highly fertile agricultural land with excellent irrigation access.",
            price: 15000000,
            areaSize: 217800,
            address: "Nashik, Maharashtra",
            location: { lat: 19.9975, lng: 73.7898 },
            propertyType: "agricultural",
            images: ["https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80"]
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  /* FILTERING */
  let filteredProperties = properties.filter((property) => {
    const matchesType =
      filterType === "all" || property.propertyType === filterType;
    const matchesSearch =
      property.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.address?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  /* SORTING */
  if (sortType === "low-high") {
    filteredProperties.sort((a, b) => a.price - b.price);
  } else if (sortType === "high-low") {
    filteredProperties.sort((a, b) => b.price - a.price);
  }

  return (
    <div className="h-[calc(100vh-80px)] bg-[#090f1d] flex overflow-hidden relative">
      {/* SIDEBAR TOGGLE BUTTON */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute top-5 left-5 z-[2000] bg-[#0d162d]/90 border border-white/10 text-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl hover:bg-emerald-500 hover:text-white transition duration-300 backdrop-blur-md cursor-pointer"
      >
        {sidebarOpen ? "←" : "→"}
      </button>

      {/* SIDEBAR */}
      <div
        className={`${
          sidebarOpen ? "w-[400px]" : "w-0"
        } transition-all duration-500 bg-[#0c1325]/95 border-r border-white/5 overflow-hidden flex flex-col justify-between`}
      >
        <div className="flex-1 p-6 overflow-y-auto scrollbar-thin">
          <div className="mt-14">
            <h2 className="text-2xl font-black text-white leading-tight">Explore Lands</h2>
            <p className="text-xs text-gray-500 mt-1 mb-6">
              Browse, filter, and discover verified property plots.
            </p>
          </div>

          {/* SEARCH BAR */}
          <div className="relative mb-4">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Search area or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-5 py-3.5 text-sm text-white placeholder:text-gray-500 outline-none focus:border-emerald-400 focus:bg-white/10 transition duration-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {/* TYPE FILTER */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-xs text-white outline-none focus:border-emerald-400 cursor-pointer"
            >
              <option className="bg-[#0c1325] text-white" value="all">All Types</option>
              <option className="bg-[#0c1325] text-white" value="residential">Residential</option>
              <option className="bg-[#0c1325] text-white" value="commercial">Commercial</option>
              <option className="bg-[#0c1325] text-white" value="agricultural">Agricultural</option>
            </select>

            {/* SORTING SELECT */}
            <select
              value={sortType}
              onChange={(e) => setSortType(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-xs text-white outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option className="bg-[#0c1325] text-white" value="default">Default Sort</option>
              <option className="bg-[#0c1325] text-white" value="low-high">Price: Low-High</option>
              <option className="bg-[#0c1325] text-white" value="high-low">Price: High-Low</option>
            </select>
          </div>

          <div className="text-xs text-gray-500 mb-4 flex items-center justify-between">
            <span>Results: {filteredProperties.length} found</span>
            <span>Direct Vetted</span>
          </div>

          {/* LISTINGS CONTAINER */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-400"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProperties.map((property) => (
                <div
                  key={property._id}
                  onClick={() => setSelectedProperty(property)}
                  className={`group rounded-2xl overflow-hidden cursor-pointer border transition-all duration-300 ${
                    selectedProperty?._id === property._id
                      ? "border-emerald-400 bg-white/10 shadow-2xl shadow-emerald-500/10"
                      : "border-white/5 bg-white/5 hover:bg-white/10 hover:-translate-y-1"
                  }`}
                >
                  <div className="relative h-32 overflow-hidden">
                    <PropertyImage
                      src={property.images?.[0]}
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#090f1d]/85 text-emerald-400 border border-emerald-500/20 backdrop-blur-md">
                        Vetted
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-lg font-black text-white">
                        ₹{(property.price / 100000).toLocaleString("en-IN")} L
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 capitalize">
                        {property.propertyType}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white line-clamp-1 group-hover:text-emerald-400 transition-colors">
                      {property.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                      📍 {property.address}
                    </p>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <span className="text-[11px] text-gray-400">{property.areaSize.toLocaleString()} sq.ft</span>
                      <Link
                        to={`/property/${property._id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-xs font-bold text-white shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 transition"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* INTERACTIVE MAP CONTAINER */}
      <div className="flex-1 relative h-full w-full">
        {/* FLOATING ACTION OVERLAYS */}
        <div className="absolute top-5 right-5 z-[2000] flex flex-col gap-2">
          <button 
            onClick={() => {
              if (properties.length > 0) {
                setSelectedProperty(properties[0]);
              }
            }}
            className="bg-[#0d162d]/90 border border-white/10 text-white w-10 h-10 rounded-2xl flex items-center justify-center shadow-xl hover:bg-emerald-500 transition backdrop-blur-md cursor-pointer"
            title="Recenter"
          >
            ⌖
          </button>
          <button 
            onClick={() => {
              if (document.fullscreenElement) {
                document.exitFullscreen();
              } else {
                document.documentElement.requestFullscreen();
              }
            }}
            className="bg-[#0d162d]/90 border border-white/10 text-white w-10 h-10 rounded-2xl flex items-center justify-center shadow-xl hover:bg-emerald-500 transition backdrop-blur-md cursor-pointer"
            title="Fullscreen"
          >
            ⛶
          </button>
        </div>

        <MapContainer
          center={defaultCenter}
          zoom={5}
          className="h-full w-full"
          zoomControl={false}
        >
          {/* FLY TO CONTROLLER */}
          <FlyToProperty property={selectedProperty} />

          {/* Map Layer */}
          <TileLayer
            url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
            attribution="&copy; Stadia Maps"
          />

          {/* PROPERTIES MARKERS */}
          {filteredProperties.map((property) => (
            <Marker
              key={property._id}
              icon={customIcon}
              position={[property.location.lat, property.location.lng]}
            >
              <Popup className="premium-popup">
                <div className="w-80 overflow-hidden text-white flex flex-col">
                  <div className="relative h-40">
                    <PropertyImage
                      src={property.images?.[0]}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#090f1d]/85 text-emerald-400 border border-emerald-500/20 backdrop-blur-md">
                      Verified
                    </span>
                  </div>

                  <div className="p-5 bg-[#0d162d]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xl font-black text-white">
                        ₹{(property.price / 100000).toLocaleString("en-IN")} Lakhs
                      </span>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 capitalize">
                        {property.propertyType}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white mb-1 truncate">
                      {property.title}
                    </h3>
                    <p className="text-xs text-gray-400 mb-4 truncate">
                      📍 {property.address}
                    </p>

                    <Link
                      to={`/property/${property._id}`}
                      className="block w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-center text-xs font-bold text-white shadow-lg transition"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default MapPage;