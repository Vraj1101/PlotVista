import { useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { toast } from "react-toastify";

// Custom Glowing Pin for the selector map
const selectorIcon = new L.DivIcon({
  className: "custom-div-icon",
  html: '<div class="glowing-pin"><div class="glowing-pin-inner"></div></div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// Map click event listener component
const MapClickHandler = ({ onLocationSelected }) => {
  useMapEvents({
    click(e) {
      onLocationSelected(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const AddProperty = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchingLocation, setSearchingLocation] = useState(false);
  const mapRef = useRef(null);
  const [isDraftSubmit, setIsDraftSubmit] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    areaSize: "",
    address: "",
    propertyType: "residential",
    lat: "20.5937",
    lng: "78.9629",
  });

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const imagePreviews = files.map((file) => URL.createObjectURL(file));
    setImages(imagePreviews);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLocationSelected = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      );

      const data = await response.json();

      setFormData((prev) => ({
        ...prev,
        lat: lat.toFixed(6),
        lng: lng.toFixed(6),
        address: data.display_name || prev.address,
      }));
    } catch (error) {
      console.log(error);

      setFormData((prev) => ({
        ...prev,
        lat: lat.toFixed(6),
        lng: lng.toFixed(6),
      }));
    }
  };
  const findAddressLocation = async () => {
    setSearchingLocation(true);
    if (!formData.address.trim()) {
      toast.error("Please enter address first");
      setSearchingLocation(false);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
          formData.address,
        )}`,
      );

      const data = await response.json();

      console.log("Search Result:", data);

      if (!data || data.length === 0) {
        const addressParts = formData.address
          .split(",")
          .map((part) => part.trim());

        if (addressParts.length > 2) {
          const fallbackAddress = addressParts.slice(-3).join(", ");

          const fallbackResponse = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
              fallbackAddress,
            )}`,
          );

          const fallbackData = await fallbackResponse.json();

          if (fallbackData && fallbackData.length > 0) {
            const bestMatch = fallbackData[0];

            const lat = parseFloat(bestMatch.lat);
            const lng = parseFloat(bestMatch.lon);

            setFormData((prev) => ({
              ...prev,
              lat: lat.toFixed(6),
              lng: lng.toFixed(6),
              address: bestMatch.display_name,
            }));

            if (mapRef.current) {
              mapRef.current.setView([lat, lng], 16);
            }

            return;
          }
        }

        toast.error("Location not found");
        return;
      }

      const bestMatch = data[0];

      const lat = parseFloat(bestMatch.lat);
      const lng = parseFloat(bestMatch.lon);

      setFormData((prev) => ({
        ...prev,
        lat: lat.toFixed(6),
        lng: lng.toFixed(6),
        address: bestMatch.display_name,
      }));

      if (mapRef.current) {
        mapRef.current.setView([lat, lng], 16);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch location");
    } finally {
      setSearchingLocation(false);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const lat = Number(formData.lat);
    const lng = Number(formData.lng);

    if (lat < -90 || lat > 90) {
      toast.error("Latitude must be between -90 and 90");
      setLoading(false);
      return;
    }

    if (lng < -180 || lng > 180) {
      toast.error("Longitude must be between -180 and 180");
      setLoading(false);
      return;
    }

    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      if (!userInfo) {
        toast.error("Please login first");
        setLoading(false);
        return;
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        areaSize: Number(formData.areaSize),
        address: formData.address,
        propertyType: formData.propertyType.toLowerCase(),
        lat: Number(formData.lat),
        lng: Number(formData.lng),
        images: images,
        approvalStatus: isDraftSubmit ? "draft" : "pending",
      };

      const response = await fetch("http://localhost:5000/api/properties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Upload failed");
      }

      toast.success(isDraftSubmit ? "Draft Saved Successfully" : "Property Added Successfully");
      setFormData({
        title: "",
        description: "",
        price: "",
        areaSize: "",
        address: "",
        propertyType: "residential",
        lat: "20.5937",
        lng: "78.9629",
      });
      setImages([]);
      console.log(data);
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090f1d] text-white px-6 py-12">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-12 text-center md:text-left">
          <span className="text-xs font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-full uppercase tracking-wider mb-4 inline-block">
            Seller Dashboard
          </span>
          <h1 className="text-4xl md:text-5xl font-black mb-3">
            List Your Property
          </h1>
          <p className="text-gray-400 text-sm md:text-base">
            Publish your land details, choose GPS boundaries, and connect with
            direct buyers.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* LEFT COLUMN: Basic info + map selection */}
            <div className="lg:col-span-2 space-y-8">
              {/* BASIC DETAILS */}
              <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 backdrop-blur-xl">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <span>📝</span> Basic Information
                </h2>
                <div className="space-y-5">
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Listing Title (e.g., Gated Commercial Plot on Mumbai Highway)"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-emerald-400 focus:bg-white/10 transition"
                  />
                  <textarea
                    rows="5"
                    name="description"
                    required
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your land details, dimensions, accessibility, surrounding landmarks, and zoning clearances..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-emerald-400 focus:bg-white/10 transition resize-none"
                  />
                </div>
              </div>

              {/* SPECIFICATION CARD */}
              <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <span>📐</span> Dimensions & Type
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <input
                    type="number"
                    name="price"
                    required
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="Total Price (in ₹)"
                    className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-emerald-400 focus:bg-white/10 transition"
                  />
                  <input
                    type="number"
                    name="areaSize"
                    required
                    value={formData.areaSize}
                    onChange={handleChange}
                    placeholder="Total Area Size (sq ft)"
                    className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-emerald-400 focus:bg-white/10 transition"
                  />
                  <input
                    type="text"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Full Address / Location landmark"
                    className="md:col-span-2 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-emerald-400 focus:bg-white/10 transition"
                  />
                  <button
                    type="button"
                    onClick={findAddressLocation}
                    disabled={searchingLocation}
                    className="bg-cyan-500 text-white px-4 py-2 rounded-xl mt-3 disabled:opacity-50"
                  >
                    {searchingLocation ? "Searching..." : "📍 Find Location"}
                  </button>
                  <select
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={handleChange}
                    className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-emerald-400 cursor-pointer"
                  >
                    <option className="bg-[#090f1d]" value="residential">
                      Residential
                    </option>
                    <option className="bg-[#090f1d]" value="commercial">
                      Commercial
                    </option>
                    <option className="bg-[#090f1d]" value="agricultural">
                      Agricultural
                    </option>
                  </select>
                </div>
              </div>

              {/* MAP GPS PICKER */}
              <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <span>📍</span> Map Coordinates
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                      Click directly on the interactive map to auto-fill
                      latitude and longitude coordinates.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-xs">
                      Lat:{" "}
                      <span className="text-emerald-400 font-bold">
                        {formData.lat}
                      </span>
                    </div>
                    <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-xs">
                      Lng:{" "}
                      <span className="text-cyan-400 font-bold">
                        {formData.lng}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="h-80 w-full rounded-3xl overflow-hidden border border-white/10 relative z-10">
                  <MapContainer
                    center={[20.5937, 78.9629]}
                    zoom={5}
                    className="h-full w-full"
                    whenCreated={(map) => (mapRef.current = map)}
                  >
                    <TileLayer
                      url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
                      attribution="&copy; Stadia Maps"
                    />
                    <MapClickHandler
                      onLocationSelected={handleLocationSelected}
                    />
                    <Marker
                      icon={selectorIcon}
                      position={[Number(formData.lat), Number(formData.lng)]}
                    />
                  </MapContainer>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Image Upload + Publish Actions */}
            <div className="space-y-8">
              {/* IMAGE LOADER CARD */}
              <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <span>📸</span> Media & Photography
                </h2>

                <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-2xl p-8 cursor-pointer hover:border-emerald-500/50 hover:bg-white/5 transition-all">
                  <span className="text-4xl mb-3">📁</span>
                  <span className="font-bold text-sm text-white">
                    Upload Images
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    PNG, JPG up to 10MB
                  </span>
                  <input
                    type="file"
                    multiple
                    hidden
                    onChange={handleImageChange}
                  />
                </label>

                {images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-6">
                    {images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt="Preview"
                        className="w-full h-20 object-cover rounded-xl border border-white/10"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* PUBLISH ACTION */}
              <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 sticky top-24 backdrop-blur-xl">
                <h3 className="text-xl font-bold mb-4">Publish Properties</h3>
                <p className="text-xs text-gray-500 leading-relaxed mb-6">
                  Review specifications before listing. Your verified plot
                  details will become instantly discoverable on the interactive
                  map for buyers.
                </p>

                <div className="space-y-3">
                  <button
                    type="submit"
                    onClick={() => setIsDraftSubmit(false)}
                    disabled={loading}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-bold transition shadow-lg shadow-emerald-500/20 disabled:opacity-55 cursor-pointer"
                  >
                    {loading && !isDraftSubmit ? "Publishing Listing..." : "Publish Plot Now"}
                  </button>
                  <button
                    type="submit"
                    onClick={() => setIsDraftSubmit(true)}
                    disabled={loading}
                    className="w-full py-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition text-sm font-semibold cursor-pointer"
                  >
                    {loading && isDraftSubmit ? "Saving Draft..." : "Save Draft"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProperty;
