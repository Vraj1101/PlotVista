import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-[#070c19] border-t border-white/5 py-12 text-gray-400">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
        <div className="space-y-4">
          <Link to="/" className="text-2xl font-black tracking-tight text-white">
            Plot<span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Vista</span>
          </Link>
          <p className="text-sm text-gray-500 leading-relaxed">
            The smart land & plot discovery platform. Connect directly with owners, browse verified listings, and secure your investment.
          </p>
        </div>
        <div>
          <h4 className="text-white font-bold text-sm mb-4 tracking-wider uppercase">Platform</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-emerald-400 transition-colors">Home</Link></li>
            <li><Link to="/map" className="hover:text-emerald-400 transition-colors">Interactive Map</Link></li>
            <li><Link to="/login" className="hover:text-emerald-400 transition-colors">List Your Property</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold text-sm mb-4 tracking-wider uppercase">Trust & Legal</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-emerald-400 transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-emerald-400 transition-colors">Terms of Service</a></li>
            <li><a href="#" className="hover:text-emerald-400 transition-colors">Partner Network</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold text-sm mb-4 tracking-wider uppercase">Contact</h4>
          <p className="text-sm text-gray-500 mb-2 leading-relaxed">Have questions or need assistance?</p>
          <p className="text-sm font-semibold text-emerald-400">support@plotvista.com</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-600">
        <div>
          &copy; {new Date().getFullYear()} PlotVista. All rights reserved.
        </div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-gray-400 transition">Facebook</a>
          <a href="#" className="hover:text-gray-400 transition">Twitter</a>
          <a href="#" className="hover:text-gray-400 transition">LinkedIn</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
