import { FaInstagram, FaFacebook } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import ScentoriaLogo from './ScentoriaLogo';
import { theme } from '../theme';

export default function Footer() {
  return (
    <footer className="bg-nature-bg dark:bg-night-bg border-t border-nature-border dark:border-night-border transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <ScentoriaLogo className="w-5 h-6 text-nature-olive dark:text-nature-sage" />
              <span className="font-serif text-lg tracking-[0.2em] text-nature-dark dark:text-night-text">{theme.brand.name}</span>
            </div>
            <p className="text-nature-olive dark:text-night-muted text-sm leading-relaxed max-w-xs">
              {theme.brand.footerDesc}
            </p>
            <div className="flex gap-4 mt-6">
              <a href="https://instagram.com/scentoria.mm" target="_blank" rel="noopener noreferrer"
                className="text-nature-subtle dark:text-night-muted hover:text-nature-olive dark:hover:text-nature-sage transition-colors">
                <FaInstagram className="w-4 h-4" />
              </a>
              <a href="https://facebook.com/scentoria" target="_blank" rel="noopener noreferrer"
                className="text-nature-subtle dark:text-night-muted hover:text-nature-olive dark:hover:text-nature-sage transition-colors">
                <FaFacebook className="w-4 h-4" />
              </a>
            </div>
          </div>
          <div>
            <h4 className="text-nature-olive/60 dark:text-nature-sage/60 text-[10px] tracking-[0.2em] mb-4 uppercase">Explore</h4>
            <ul className="space-y-2.5">
              <li><Link to="/scents" className="text-nature-olive dark:text-night-text hover:text-nature-olive dark:hover:text-nature-sage text-sm transition-colors">Scent Profiles</Link></li>
              <li><Link to="/products" className="text-nature-olive dark:text-night-text hover:text-nature-olive dark:hover:text-nature-sage text-sm transition-colors">All Fragrances</Link></li>
              <li><Link to="/about" className="text-nature-olive dark:text-night-text hover:text-nature-olive dark:hover:text-nature-sage text-sm transition-colors">About Us</Link></li>
              <li><Link to="/cart" className="text-nature-olive dark:text-night-text hover:text-nature-olive dark:hover:text-nature-sage text-sm transition-colors">Shopping Cart</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-nature-olive/60 dark:text-nature-sage/60 text-[10px] tracking-[0.2em] mb-4 uppercase">Account</h4>
            <ul className="space-y-2.5">
              <li><Link to="/login" className="text-nature-olive dark:text-night-text hover:text-nature-olive dark:hover:text-nature-sage text-sm transition-colors">Sign In</Link></li>
              <li><Link to="/register" className="text-nature-olive dark:text-night-text hover:text-nature-olive dark:hover:text-nature-sage text-sm transition-colors">Register</Link></li>
              <li><Link to="/profile" className="text-nature-olive dark:text-night-text hover:text-nature-olive dark:hover:text-nature-sage text-sm transition-colors">My Profile</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-nature-border/50 dark:border-night-border/50 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-nature-subtle dark:text-night-muted text-xs">© 2026 {theme.brand.name}. All rights reserved.</p>
          <p className="text-nature-subtle dark:text-night-muted text-xs">All prices in MMK (Myanmar Kyats)</p>
        </div>
      </div>
    </footer>
  );
}