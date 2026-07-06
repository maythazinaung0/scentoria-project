import { Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import CustomerLayout from './components/CustomerLayout';
import AdminLayout from './components/Admin/AdminLayout';
import ProtectedAdminRoute from './pages/ProtectedAdminRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
// Admin Imports
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/Products';
import AdminOrders from './pages/admin/Orders';
import AdminWallet from './pages/admin/Wallet';
import AdminReports from './pages/admin/Report';
import AdminScents from './pages/admin/Scents';
import AdminNotes from './pages/admin/Notes';
// Customer Imports
import HomePage from './pages/customer/HomePage';
import AboutPage from './pages/customer/About';
import ScentDetailPage from './pages/customer/ScentDetailPage';
import ScentProfilesPage from './pages/customer/ScentProfilesPage';
import './App.css';

function App() {
  // Required state for the customer branch's live search filter feature
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <Routes>
      {/* Customer-facing storefront — Protected by CustomerLayout (Navbar & Footer pass state) */}
      <Route element={<CustomerLayout searchQuery={searchQuery} onSearchChange={setSearchQuery} />}>
        <Route path="/" element={<HomePage searchQuery={searchQuery} />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/products/:id" element={<ScentDetailPage />} />
        <Route path="/scents" element={<ScentProfilesPage />} />
        <Route path="/scents/:id" element={<ScentDetailPage />} />
      </Route>

      {/* Admin panel — separate structured layout gated behind role security validation */}
      <Route path="/admin" element={<ProtectedAdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="wallet" element={<AdminWallet />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="scents" element={<AdminScents />} />
          <Route path="notes" element={<AdminNotes />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;