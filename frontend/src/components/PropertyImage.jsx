import { useState } from 'react';

const PropertyImage = ({ src, alt, className }) => {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fallback CSS Gradient with a beautiful Map/Land pattern
  const renderFallback = () => {
    return (
      <div className={`${className} bg-gradient-to-br from-[#101c38] to-[#0d1527] flex flex-col items-center justify-center relative overflow-hidden border border-white/5`}>
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
        
        {/* Circular glassmorphic accent */}
        <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-2xl mb-2 relative z-10 shadow-lg shadow-emerald-500/5">
          🗺️
        </div>
        
        <span className="text-xs font-semibold text-gray-400 relative z-10 tracking-wide uppercase px-4 text-center truncate max-w-full">
          {alt || "Plot Details"}
        </span>
        
        <div className="absolute bottom-2 right-3 text-[10px] text-emerald-400 font-bold uppercase tracking-widest opacity-60">
          PlotVista
        </div>
      </div>
    );
  };

  if (isError || !src) {
    return renderFallback();
  }

  // Handle case where URL might be empty or invalid string
  if (typeof src !== 'string' || src.trim() === '') {
    return renderFallback();
  }

  return (
    <div className={`${className} relative overflow-hidden bg-[#0d1527]`}>
      {isLoading && (
        <div className="absolute inset-0 bg-[#0d1527] animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-t-emerald-400 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={() => setIsLoading(false)}
        onError={() => setIsError(true)}
      />
    </div>
  );
};

export default PropertyImage;
