import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import PropertyImage from "../components/PropertyImage";
import { toast } from "react-toastify";

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [nearbyProperties, setNearbyProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [lightboxImage, setLightboxImage] = useState(null);
  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProperty = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        const headers = {};
        if (userInfo && userInfo.token) {
          headers.Authorization = `Bearer ${userInfo.token}`;
        }

        const { data } = await axios.get(
          `http://localhost:5000/api/properties/${id}`,
          { headers }
        );
        setProperty(data.property);

        // Update recently viewed synchronously right after getting the property data
        // to prevent race conditions during concurrent/double mounts.
        if (data.property) {
          const viewedProperties =
            JSON.parse(localStorage.getItem("recentProperties")) || [];
          const filtered = viewedProperties.filter(
            (item) => item && item._id !== data.property._id,
          );
          filtered.unshift(data.property);
          localStorage.setItem(
            "recentProperties",
            JSON.stringify(filtered.slice(0, 6)),
          );
        }

        const reviewsRes = await axios.get(
          `http://localhost:5000/api/reviews/${id}`,
        );

        setReviews(reviewsRes.data);

        setNearbyProperties(data.nearbyProperties);
        console.log("Nearby:", data.nearbyProperties);
      } catch (error) {
        console.error("Error fetching property details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  const saveProperty = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));

      console.log("UserInfo:", userInfo);

      if (!userInfo) {
        toast.error("Please  login first");
        return;
      }
      await axios.post(
        "http://localhost:5000/api/favorites",
        {
          propertyId: property._id,
        },
        {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        },
      );

      toast.success("Property Saved ❤️");
    } catch (error) {
      console.error(error);

      toast.error(error.response?.data?.message || "Failed to save property");
    }
  };

  const submitReview = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      if (!userInfo) {
        toast.error("Please login first");
        return;
      }
      await axios.post(
        "http://localhost:5000/api/reviews",
        {
          propertyId: property._id,
          rating,
          comment: comment || "",
        },
        {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        },
      );

      toast.success("Review Added");

      const reviewsRes = await axios.get(
        `http://localhost:5000/api/reviews/${property._id}`,
      );

      setReviews(reviewsRes.data);

      setComment("");
      setRating(5);
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Review failed");
    }
  };
  const reportProperty = async () => {
    try {
      if (!reportReason) {
        toast.error("Please select a reason");
        return;
      }

      const userInfo = JSON.parse(localStorage.getItem("userInfo"));

      if (!userInfo) {
        toast.error("Please login first");
        return;
      }

      await axios.post(
        "http://localhost:5000/api/reports",
        {
          propertyId: property._id,
          reason: reportReason,
          description: reportDescription || "",
        },
        {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        },
      );

      toast.success("Report submitted");

      setReportReason("");
      setReportDescription("");
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to submit report");
    }
  };

  const sendInquiry = async () => {
    try {
      setSending(true);

      const userInfo = JSON.parse(localStorage.getItem("userInfo"));

      await axios.post(
        "http://localhost:5000/api/inquiries",
        {
          propertyId: property._id,
          message,
        },
        {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        },
      );

      toast.success("Inquiry sent successfully!");

      setMessage("");
    } catch (error) {
      console.error(error);

      toast.error(error.response?.data?.message || "Failed to send inquiry");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090f1d] text-white flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-400"></div>
        <p className="text-sm text-gray-400 font-semibold">
          Retrieving Vetted Plot Details...
        </p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-[#090f1d] text-white flex flex-col items-center justify-center gap-6">
        <span className="text-6xl">🗺️</span>
        <h2 className="text-2xl font-black">Plot Not Found</h2>
        <button
          onClick={() => navigate("/map")}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 font-bold"
        >
          Return to Exploration Map
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090f1d] text-white pb-24">
      {/* HERO IMAGE CONTAINER */}
      <div className="relative h-[480px] overflow-hidden">
        <PropertyImage
          src={property.images?.[selectedImage]}
          alt={property.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090f1d] via-[#090f1d]/30 to-transparent"></div>

        {/* BACK ACTION */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-8 left-8 z-20 px-5 py-3 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 text-white font-bold hover:bg-black/60 transition cursor-pointer"
        >
          ← Back to Map
        </button>

        {/* TITLE OVERLAY */}
        <div className="absolute bottom-8 left-6 md:left-12 z-20 right-6 max-w-4xl">
          <div className="flex gap-2 mb-4 flex-wrap">
            <span className="px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/20 uppercase tracking-wider">
              Verified Partner Listing
            </span>

            <span className="px-4 py-1.5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold border border-cyan-500/20 capitalize tracking-wider">
              {property.propertyType}
            </span>

            <span
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider
      ${
        property.status === "available"
          ? "bg-green-500/20 text-green-400 border border-green-500/20"
          : property.status === "reserved"
            ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/20"
            : "bg-red-500/20 text-red-400 border border-red-500/20"
      }
    `}
            >
              {property.status?.toUpperCase()}
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black mb-3 leading-tight tracking-tight">
            {property.title}
          </h1>
          <p className="text-sm md:text-base text-gray-300 flex items-center gap-1">
            📍 {property.address}
          </p>
        </div>
      </div>

      {/* GALLERY SELECTOR */}
      {property.images && property.images.length > 1 && (
        <div className="max-w-7xl mx-auto px-6 md:px-12 mt-6 flex gap-4 overflow-x-auto pb-3">
          {property.images.map((img, index) => (
            <div
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`w-32 h-20 rounded-xl cursor-pointer overflow-hidden border-2 transition flex-shrink-0 ${
                selectedImage === index
                  ? "border-emerald-400 scale-105 shadow-lg shadow-emerald-500/20"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <PropertyImage
                src={img}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
      <div className="grid grid-cols-3 gap-4">
        {property.images?.map((img) => (
          <img
            key={img}
            src={img}
            alt=""
            onClick={() => setLightboxImage(img)}
            className="
      h-32
      w-full
      object-cover
      cursor-pointer
      rounded-xl
      "
          />
        ))}
      </div>

      {lightboxImage && (
        <div
          className="
    fixed inset-0
    bg-black/90
    flex items-center justify-center
    z-50
    "
          onClick={() => setLightboxImage(null)}
        >
          <img src={lightboxImage} alt="" className="max-h-[90%] max-w-[90%]" />
        </div>
      )}

      {/* CORE SPECIFICATIONS SPLIT */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 mt-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* LEFT COLUMN: Pricing details, descriptions, specifications */}
        <div className="lg:col-span-2 space-y-8">
          {/* PRICING BLOCK */}
          <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 backdrop-blur-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <p className="text-xs font-bold tracking-wider text-gray-500 uppercase mb-1">
                  Vetted Vetting Valuations
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl md:text-5xl font-black text-emerald-400">
                    ₹{(property.price / 100000).toLocaleString("en-IN")}
                  </span>
                  <span className="text-base text-gray-400 font-semibold">
                    Lakhs
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(window.location.href);
                      toast.success("Property link copied to clipboard!");
                    } catch (error) {
                      console.log(error);
                    }
                  }}
                  className="px-6 py-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition text-sm font-semibold"
                >
                  Share
                </button>
              </div>
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>📖</span> Plot Description
            </h3>
            <p className="text-gray-300 leading-relaxed text-sm md:text-base whitespace-pre-line">
              {property.description}
            </p>
          </div>

          {/* PARAMETERS LIST */}
          <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span>📊</span> Technical Parameters
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-[#0c1325] border border-white/5 rounded-2xl p-5">
                <span className="block text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">
                  Area Size
                </span>
                <span className="text-base font-black text-white">
                  {property.areaSize.toLocaleString()} sq.ft
                </span>
              </div>
              <div className="bg-[#0c1325] border border-white/5 rounded-2xl p-5">
                <span className="block text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">
                  Zoning Type
                </span>
                <span className="text-base font-black text-white capitalize">
                  {property.propertyType}
                </span>
              </div>
              <div className="bg-[#0c1325] border border-white/5 rounded-2xl p-5">
                <span className="block text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">
                  Latitude
                </span>
                <span className="text-base font-black text-white">
                  {property.location?.lat != null
                    ? property.location.lat.toFixed(5)
                    : "N/A"}
                </span>
              </div>
              <div className="bg-[#0c1325] border border-white/5 rounded-2xl p-5">
                <span className="block text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">
                  Longitude
                </span>
                <span className="text-base font-black text-white">
                  {property.location?.lng != null
                    ? property.location.lng.toFixed(5)
                    : "N/A"}
                </span>
              </div>
              <div className="bg-[#0c1325] border border-white/5 rounded-2xl p-5">
                <span className="block text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">
                  Views
                </span>

                <span className="text-base font-black text-white">
                  👁️ {property.views || 0}
                </span>
              </div>
              <div className="bg-[#0c1325] border border-white/5 rounded-2xl p-5">
                <span className="block text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">
                  Saved
                </span>

                <span className="text-base font-black text-white">
                  ❤️ {property.favoritesCount || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Contact verification dashboards */}
        <div className="space-y-8">
          {/* SELLER DISCLOSURE */}
          <div className="sticky top-24 bg-white/5 border border-white/10 rounded-[2rem] p-8 backdrop-blur-xl">
            <h3 className="text-sm font-bold tracking-wider text-gray-500 uppercase mb-6">
              Owner Profile
            </h3>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center text-xl font-black text-white shadow-md shadow-emerald-500/15">
                {property.seller?.name?.charAt(0).toUpperCase() || "O"}
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">
                  {property.seller?.name || "Verified Landowner"}
                </h4>
                <p className="text-sm text-gray-400 mt-1">
                  {property.seller?.email}
                </p>

                {property.seller?.phone && (
                  <p className="text-sm text-gray-400">
                    📞 {property.seller.phone}
                  </p>
                )}
                {property.seller?.isVerifiedSeller && (
                  <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                    Verified Seller ✓
                  </span>
                )}
              </div>
            </div>

            {property.seller && (
              <div className="space-y-3 mb-6">
                {property.seller.phone ? (
                  <a
                    href={`https://wa.me/${property.seller.phone}`}
                    target="_blank"
                    rel="noreferrer"
                    className="block w-full text-center bg-green-600 hover:bg-green-500 px-6 py-3.5 rounded-2xl font-bold transition duration-300"
                  >
                    💬 WhatsApp Seller
                  </a>
                ) : null}
                {property.seller.email ? (
                  <a
                    href={`mailto:${property.seller.email}`}
                    className="block w-full text-center bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-3.5 rounded-2xl font-bold transition duration-300"
                  >
                    ✉️ Email Seller
                  </a>
                ) : null}
              </div>
            )}

            <div className="space-y-4">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="I'm interested in this property. Please contact me."
                className="
  w-full
  h-32
  rounded-2xl
  bg-[#0c1325]
  border border-white/10
  p-4
  text-sm
  text-white
  resize-none
  focus:border-cyan-400
  outline-none
"
              />

              <button
                onClick={sendInquiry}
                disabled={sending}
                className="
  w-full
  py-4
  rounded-2xl
  bg-gradient-to-r
  from-emerald-500
  to-cyan-500
  font-bold
  text-white
  hover:scale-[1.02]
  transition-all
"
              >
                {sending ? "Sending..." : "Send Inquiry"}
              </button>
              <button
                onClick={saveProperty}
                className="
  w-full
  py-4
  rounded-2xl
  bg-pink-500
  text-white
  font-bold
  hover:bg-pink-400
  transition-all
"
              >
                ❤️ Save Property
              </button>
            </div>
            <div className="mt-8 border-t border-white/10 pt-6">
              <h3 className="text-xl font-bold mb-3">🚩 Report Property</h3>

              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="
      bg-[#131d35]
      border border-white/10
      rounded-xl
      px-4 py-3
      w-full
    "
              >
                <option value="">Select Reason</option>

                <option value="Fake Listing">Fake Listing</option>

                <option value="Wrong Location">Wrong Location</option>

                <option value="Spam">Spam</option>

                <option value="Duplicate">Duplicate</option>
              </select>

              <textarea
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Additional details (optional)..."
                className="
                  mt-3
                  w-full
                  h-24
                  rounded-xl
                  bg-[#0c1325]
                  border border-white/10
                  p-4
                  text-sm
                  text-white
                  resize-none
                  focus:border-cyan-400
                  outline-none
                "
              />

              <button
                onClick={reportProperty}
                className="
      mt-4
      bg-red-600
      px-6
      py-3
      rounded-xl
      font-bold
      cursor-pointer
    "
              >
                Submit Report
              </button>
            </div>
            <div className="mt-10 bg-white/5 rounded-3xl p-6">
              <h2 className="text-2xl font-bold mb-6">⭐ Reviews</h2>

              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="
      w-full
      mb-4
      bg-[#0c1325]
      border
      border-white/10
      rounded-xl
      px-4
      py-3
      text-white
    "
              >
                <option value={5}>⭐⭐⭐⭐⭐</option>
                <option value={4}>⭐⭐⭐⭐</option>
                <option value={3}>⭐⭐⭐</option>
                <option value={2}>⭐⭐</option>
                <option value={1}>⭐</option>
              </select>

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write your review..."
                className="
      w-full
      h-28
      mb-4
      bg-[#0c1325]
      border
      border-white/10
      rounded-xl
      px-4
      py-3
      text-white
    "
              />

              <button
                onClick={submitReview}
                className="
      bg-yellow-500
      px-6
      py-3
      rounded-xl
      font-bold
      text-black
    "
              >
                Submit Review
              </button>
            </div>
            <div className="mt-6 space-y-4">
              {reviews.length === 0 && (
                <p className="text-gray-400">
                  No reviews yet. Be the first reviewer.
                </p>
              )}
              {reviews.map((review) => (
                <div
                  key={review._id}
                  className="
        bg-white/5
        p-4
        rounded-2xl
      "
                >
                  <h3 className="font-bold">{review.user?.name}</h3>

                  <p className="text-yellow-400">
                    {"⭐".repeat(review.rating)}
                  </p>

                  <p className="text-gray-300 mt-2">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>

          {/* VERIFICATION HIGHLIGHTS */}
          <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8">
            <h3 className="text-base font-bold mb-4">Vetting Highlights</h3>
            <ul className="space-y-3 text-xs text-gray-400">
              <li className="flex items-center justify-between">
                <span>Land Registry Title Deeds</span>
                <span className="text-emerald-400 font-bold">100% Vetted</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Environmental Zoning Approval</span>
                <span className="text-emerald-400 font-bold">Approved</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Direct Legal Direct Deal</span>
                <span className="text-emerald-400 font-bold">No Brokerage</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Zoning Code Clearance</span>
                <span className="text-emerald-400 font-bold">Clear</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Nearby Properties */}

      <div className="max-w-7xl mx-auto px-6 md:px-12 mt-16">
        <h2 className="text-3xl font-bold mb-6">📍 Nearby Properties</h2>

        <div className="grid md:grid-cols-3 gap-8">
          {nearbyProperties.map((item) => (
            <div
              key={item._id}
              className="
        bg-white/5
        border border-white/10
        rounded-[2rem]
        overflow-hidden
        hover:border-emerald-500/30
        hover:scale-[1.02]
        transition-all
        duration-300
      "
            >
              <div className="relative">
                <PropertyImage
                  src={item.images?.[0]}
                  alt={item.title}
                  className="w-full h-52 object-cover"
                />

                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 capitalize">
                    {item.propertyType}
                  </span>

                  {item.status && (
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold
                ${
                  item.status === "available"
                    ? "bg-green-500/20 text-green-400 border border-green-500/20"
                    : item.status === "reserved"
                      ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/20"
                      : "bg-red-500/20 text-red-400 border border-red-500/20"
                }
              `}
                    >
                      {item.status?.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-lg font-bold text-white mb-2">
                  {item.title}
                </h3>

                <p className="text-gray-400 text-sm mb-4">📍 {item.address}</p>

                <div className="flex justify-between text-sm mb-4">
                  <span className="text-emerald-400 font-bold">
                    ₹ {item.price?.toLocaleString("en-IN")}
                  </span>

                  <span className="text-gray-400">
                    {(item.areaSize || 0).toLocaleString()} sq.ft
                  </span>
                </div>

                <div className="flex justify-between text-xs text-gray-400 mb-4">
                  <span>👁 {item.views || 0}</span>
                  <span>❤️ {item.favoritesCount || 0}</span>
                </div>

                <button
                  onClick={() => navigate(`/property/${item._id}`)}
                  className="
            w-full
            py-3
            rounded-xl
            bg-gradient-to-r
            from-emerald-500
            to-cyan-500
            font-bold
            text-white
          "
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
