import { FaInstagram, FaFacebook } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import ScentoriaLogo from './ScentoriaLogo';
import { theme } from '../theme';

export default function Footer() {
  return (
    <footer className="bg-nature-bg border-t border-nature-border mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <ScentoriaLogo className="w-5 h-6 text-nature-olive" />
              <span className="font-serif text-lg tracking-[0.2em] text-nature-dark">{theme.brand.name}</span>
            </div>
            <p className="text-nature-olive text-sm leading-relaxed max-w-xs">
              {theme.brand.footerDesc}
            </p>
            <div className="flex gap-4 mt-6">
              <a href="https://instagram.com/scentoria.mm" target="_blank" rel="noopener noreferrer"
                className="text-nature-subtle hover:text-nature-olive transition-colors">
                <FaInstagram className="w-4 h-4" />
              </a>
              <a href="https://facebook.com/scentoria" target="_blank" rel="noopener noreferrer"
                className="text-nature-subtle hover:text-nature-olive transition-colors">
                <FaFacebook className="w-4 h-4" />
              </a>
            </div>
          </div>
          <div>
            <h4 className="text-nature-olive/60 text-[10px] tracking-[0.2em] mb-4 uppercase">Explore</h4>
            <ul className="space-y-2.5">
              <li><Link to="/scents" className="text-nature-olive hover:text-nature-olive text-sm transition-colors">Scent Profiles</Link></li>
              <li><Link to="/products" className="text-nature-olive hover:text-nature-olive text-sm transition-colors">All Fragrances</Link></li>
              <li><Link to="/about" className="text-nature-olive hover:text-nature-olive text-sm transition-colors">About Us</Link></li>
              <li><Link to="/cart" className="text-nature-olive hover:text-nature-olive text-sm transition-colors">Shopping Cart</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-nature-olive/60 text-[10px] tracking-[0.2em] mb-4 uppercase">Account</h4>
            <ul className="space-y-2.5">
              <li><Link to="/login" className="text-nature-olive hover:text-nature-olive text-sm transition-colors">Sign In</Link></li>
              <li><Link to="/register" className="text-nature-olive hover:text-nature-olive text-sm transition-colors">Register</Link></li>
              <li><Link to="/profile" className="text-nature-olive hover:text-nature-olive text-sm transition-colors">My Profile</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-nature-border/50 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-nature-subtle text-xs">© 2026 {theme.brand.name}. All rights reserved.</p>
          <p className="text-nature-subtle text-xs">All prices in MMK (Myanmar Kyats)</p>
        </div>
      </div>
    </footer>
  );
}
