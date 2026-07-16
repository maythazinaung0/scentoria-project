import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Search, Menu, X, LogOut, UserCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import ScentoriaLogo from './ScentoriaLogo';
import { theme } from '../theme';
import SearchModal from './SearchModal';
const NAV_ITEMS = [
  { label: 'Home', path: '/' },
  { label: 'Fragrances', path: '/products' },
  { label: 'Scent Profiles', path: '/scents' },
  { label: 'About', path: '/about' },
];

export default function Navbar({ searchQuery, onSearchChange }) {
  const { user, signOut } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const navRef = useRef(null);
  const linksRef = useRef([]);
  const prevItemCount = useRef(itemCount);
  const [cartBounce, setCartBounce] = useState(false);

  // Track scroll for background intensity
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Cart bounce animation when item count changes
  useEffect(() => {
    if (itemCount > prevItemCount.current) {
      setCartBounce(true);
      const t = setTimeout(() => setCartBounce(false), 400);
      return () => clearTimeout(t);
    }
    prevItemCount.current = itemCount;
  }, [itemCount]);

  // Sliding indicator position
  useEffect(() => {
    const activeIdx = NAV_ITEMS.findIndex(item => {
      if (item.path === '/') return location.pathname === '/';
      return location.pathname.startsWith(item.path);
    });
    const el = linksRef.current[activeIdx];
    if (el && navRef.current) {
      const navRect = navRef.current.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      setIndicatorStyle({
        left: elRect.left - navRect.left,
        width: elRect.width,
      });
    } else {
      setIndicatorStyle({ left: 0, width: 0 });
    }
  }, [location.pathname]);

  // Re-calculate indicator on resize
  useEffect(() => {
    const onResize = () => {
      const activeIdx = NAV_ITEMS.findIndex(item => {
        if (item.path === '/') return location.pathname === '/';
        return location.pathname.startsWith(item.path);
      });
      const el = linksRef.current[activeIdx];
      if (el && navRef.current) {
        const navRect = navRef.current.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        setIndicatorStyle({
          left: elRect.left - navRect.left,
          width: elRect.width,
        });
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [location.pathname]);

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  return (
    <>
    <nav
      className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-500 ${
        
           'bg-transparent backdrop-blur-md border-nature-border/30'
          
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
              <ScentoriaLogo className="w-5 h-6 text-nature-olive group-hover:text-nature-olive-dark transition-colors duration-300" />
            </div>
            <span className="font-serif text-lg tracking-[0.2em] text-nature-dark group-hover:text-nature-olive transition-colors duration-300">
              {theme.brand.name}
            </span>
          </Link>

          {/* Desktop Nav with sliding indicator */}
          <div ref={navRef} className="hidden md:flex items-center gap-1 relative">
            {NAV_ITEMS.map((item, i) => {
              const isActive = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  ref={el => { linksRef.current[i] = el; }}
                  to={item.path}
                  className={`relative px-3 py-1.5 text-xs tracking-[0.15em] transition-all duration-300 ${
                    isActive
                      ? 'text-nature-olive'
                      : 'text-nature-charcoal hover:text-nature-olive hover:tracking-[0.2em]'
                  }`}
                >
                  {item.label.toUpperCase()}
                </Link>
              );
            })}
            {/* Animated underline */}
            <div
              className="absolute bottom-0 h-[2px] bg-nature-olive transition-all duration-300 ease-out rounded-full"
              style={{
                left: indicatorStyle.left,
                width: indicatorStyle.width,
                opacity: indicatorStyle.width > 0 ? 1 : 0,
              }}
            />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-0.5">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(v => !v)}
              className="p-2 text-nature-olive hover:text-nature-olive transition-all duration-300 hover:scale-110"
            >
              <Search className="w-[18px] h-[18px]" />
            </button>

            {/* Cart */}
            <Link
              to="/cart"
              className={`relative p-2 text-nature-olive hover:text-nature-olive transition-all duration-300 hover:scale-110 ${
                cartBounce ? 'animate-bounce' : ''
              }`}
            >
              <ShoppingCart className="w-[18px] h-[18px]" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-nature-olive text-nature-bg text-[10px] font-semibold rounded-full flex items-center justify-center transition-transform duration-300 scale-100">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>

            {/* User Actions */}
            {user ? (
              <div className="hidden md:flex items-center gap-0.5">
                <Link
                  to="/profile"
                  className="p-2 text-nature-olive hover:text-nature-olive transition-all duration-300 hover:scale-110"
                >
                  <UserCircle className="w-[18px] h-[18px]" />
                </Link>
                <button
                  onClick={handleSignOut}
                  className="p-2 text-nature-olive hover:text-nature-olive transition-all duration-300 hover:scale-110 hover:rotate-12"
                >
                  <LogOut className="w-[18px] h-[18px]" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden md:block text-[11px] text-nature-charcoal hover:text-nature-olive tracking-[0.15em] transition-all duration-300 ml-2 hover:tracking-[0.2em]"
              >
                SIGN IN
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 text-nature-olive hover:text-nature-olive transition-all duration-300 hover:scale-110"
              onClick={() => setMenuOpen(v => !v)}
            >
              <div className="relative w-5 h-5">
                <span
                  className={`absolute left-0 w-5 h-[1.5px] bg-current transition-all duration-300 ${
                    menuOpen ? 'top-2 rotate-45' : 'top-1'
                  }`}
                />
                <span
                  className={`absolute left-0 top-2 w-5 h-[1.5px] bg-current transition-all duration-300 ${
                    menuOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
                  }`}
                />
                <span
                  className={`absolute left-0 w-5 h-[1.5px] bg-current transition-all duration-300 ${
                    menuOpen ? 'top-2 -rotate-45' : 'top-3'
                  }`}
                />
              </div>
            </button>
          </div>
        </div>

       

        {/* Mobile Menu - slide down with staggered items */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-500 ease-out ${
            menuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="border-t border-nature-border py-4 flex flex-col gap-1">
            {NAV_ITEMS.map((item, i) => {
              const isActive = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMenuOpen(false)}
                  className={`px-3 py-2.5 text-sm tracking-wider rounded transition-all duration-300 ${
                    isActive
                      ? 'text-nature-olive bg-nature-olive/10'
                      : 'text-nature-charcoal hover:text-nature-olive hover:bg-nature-olive/5 hover:pl-5'
                  }`}
                  style={{
                    transitionDelay: menuOpen ? `${i * 50}ms` : '0ms',
                    transform: menuOpen ? 'translateX(0)' : 'translateX(-20px)',
                    opacity: menuOpen ? 1 : 0,
                  }}
                >
                  {item.label.toUpperCase()}
                </Link>
              );
            })}
            <div className="border-t border-nature-border/50 mt-3 pt-3 flex flex-col gap-1">
              {user ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="px-3 py-2.5 text-nature-charcoal text-sm tracking-wider hover:text-nature-olive hover:bg-nature-olive/5 rounded transition-all duration-300"
                  >
                    MY PROFILE
                  </Link>
                  <button
                    onClick={() => { handleSignOut(); setMenuOpen(false); }}
                    className="px-3 py-2.5 text-left text-nature-olive text-sm tracking-wider hover:text-nature-olive hover:bg-nature-olive/5 rounded transition-all duration-300"
                  >
                    SIGN OUT
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="px-3 py-2.5 text-nature-charcoal text-sm tracking-wider hover:text-nature-olive hover:bg-nature-olive/5 rounded transition-all duration-300"
                  >
                    SIGN IN
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMenuOpen(false)}
                    className="px-3 py-2.5 text-nature-charcoal text-sm tracking-wider hover:text-nature-olive hover:bg-nature-olive/5 rounded transition-all duration-300"
                  >
                    REGISTER
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
    <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
      />
    </>
  );
}