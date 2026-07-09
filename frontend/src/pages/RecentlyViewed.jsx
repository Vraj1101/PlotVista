import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PropertyImage from "../components/PropertyImage";

const RecentlyViewed = () => {
  const [properties] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("recentProperties")) || [];
    } catch {
      return [];
    }
  });
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#090f1d] text-white p-8">
      <h1 className="text-4xl font-black mb-10">🕒 Recently Viewed</h1>
      {properties.length === 0 && (
        <div className="text-center mt-20">
          <h2 className="text-2xl font-bold">No Recently Viewed Properties</h2>

          <p className="text-gray-400 mt-2">Start exploring properties.</p>
        </div>
      )}
      <div className="grid md:grid-cols-3 gap-8">
        {properties.map((property) => (
          <div
            key={property._id}
            className="
              bg-white/5
              rounded-3xl
              overflow-hidden
              cursor-pointer
            "
            onClick={() => navigate(`/property/${property._id}`)}
          >
            <PropertyImage
              src={property.images?.[0]}
              alt={property.title}
              className="w-full h-52 object-cover"
            />

            <div className="p-5">
              <h2 className="font-bold text-xl">{property.title}</h2>

              <p className="text-gray-400 mt-2">{property.address}</p>

              <p className="text-emerald-400 font-bold mt-3">
                ₹ {property.price?.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentlyViewed;
