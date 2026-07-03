import { Routes, Route } from 'react-router-dom';
import CustomerLayout from './components/CustomerLayout';
import AdminLayout from './components/Admin/AdminLayout';
import ProtectedAdminRoute from './pages/ProtectedAdminRoute';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/Products';
import AdminOrders from './pages/admin/Orders';
import AdminWallet from './pages/admin/Wallet';
import AdminReports from './pages/admin/Report';
import './App.css';

function App() {
  return (
    <Routes>
      {/* Customer-facing storefront — Navbar + Footer */}
      <Route element={<CustomerLayout />}>
        <Route path="/login" element={<LoginPage />} />
        {/* add /, /fragrances, /cart, etc. here as you build them */}
      </Route>

      {/* Admin panel — separate layout, gated behind auth + role check */}
      <Route path="/admin" element={<ProtectedAdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/wallet" element={<AdminWallet />} />
          <Route path="/admin/reports" element={<AdminReports />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;