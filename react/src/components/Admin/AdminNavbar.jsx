import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, BarChart2, Wallet, LogOut, Store, ChevronRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ScentoriaLogo from '../../components/ScentoriaLogo';
import { theme } from '../../theme';

const NAV = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/admin/products', icon: Package, label: 'Products' },
  { to: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
  { to: '/admin/wallet', icon: Wallet, label: 'Wallets' },
  { to: '/admin/reports', icon: BarChart2, label: 'Sales Report' },
];

export default function Navbar() {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  function isActive(to, exact) {
    return exact ? location.pathname === to : location.pathname.startsWith(to);
  }

  return (
    <aside className="w-60 bg-nature-bg shadow-[1px_0_12px_rgba(44,53,39,0.06)] flex flex-col fixed inset-y-0 left-0 z-40">
      <div className="px-5 py-5 border-b border-nature-border/40">
        <div className="flex items-center gap-2 mb-0.5">
          <ScentoriaLogo className="w-5 h-6 text-nature-olive" />
          <span className="font-serif text-base tracking-widest text-nature-dark">{theme.brand.name}</span>
        </div>
        <span className="text-nature-muted text-[10px] tracking-widest uppercase ml-8">Admin Panel</span>
      </div>

      {user && (
        <div className="px-4 py-3 border-b border-nature-border/40">
          <div className="flex items-center gap-2.5 px-2">
            <div className="w-7 h-7 bg-nature-sage/40 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-nature-olive text-xs font-semibold">{user.email?.[0]?.toUpperCase()}</span>
            </div>
            <div className="min-w-0">
              <p className="text-nature-dark text-xs font-medium truncate">{user.email}</p>
              <p className="text-nature-olive text-[10px] tracking-wider">Administrator</p>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="text-nature-muted text-[10px] tracking-widest uppercase px-3 mb-2">Navigation</p>
        {NAV.map(({ to, icon: Icon, label, exact }) => {
          const active = isActive(to, exact);
          return (
            <Link
              key={to}
              to={to}
              className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                active
                  ? 'bg-nature-sage/40 text-nature-olive border border-nature-olive/20'
                  : 'text-nature-muted hover:text-nature-dark hover:bg-nature-sage/20 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-nature-olive' : 'text-nature-subtle group-hover:text-nature-olive'}`} />
                <span className="font-medium">{label}</span>
              </div>
              {active && <ChevronRight className="w-3 h-3 text-nature-olive" />}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-4 space-y-0.5 border-t border-nature-border/40 pt-3">
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-nature-muted hover:text-nature-dark hover:bg-nature-sage/20 transition-all border border-transparent"
        >
          <Store className="w-4 h-4" />
          View Store
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-nature-muted hover:text-red-600 hover:bg-red-50 transition-all border border-transparent"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}