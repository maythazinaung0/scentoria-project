import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout & Auth
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
import AdminBrands from './pages/admin/Brand';

// Customer Imports
import HomePage from './pages/customer/Homepage';
import AboutPage from './pages/customer/About';
import ScentProfilesPage from './pages/customer/ScentProfilesPage';
import ProfilePage from './pages/customer/ProfilePage';
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import OrderConfirmPage from './pages/customer/OrderConfirmPage';
import ScentDetailPage from './pages/customer/ScentDetailPage';
import ProductsPage from './pages/customer/Productspage';
import ProductDetailPage from './pages/customer/ProductDetailPage';
import './App.css';

function App() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <Routes>
      <Route element={<CustomerLayout searchQuery={searchQuery} onSearchChange={setSearchQuery} />}>
        <Route path="/" element={<HomePage searchQuery={searchQuery} />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/scents" element={<ScentProfilesPage />} />
        <Route path="/scents/:id" element={<ScentDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/orders/:id" element={<OrderConfirmPage />} />
        <Route path="/products" element={<ProductsPage searchQuery={searchQuery} />} />
        <Route path="/products/:slug" element={<ProductDetailPage />} />
      </Route>

      <Route path="/admin" element={<ProtectedAdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="wallet" element={<AdminWallet />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="scents" element={<AdminScents />} />
          <Route path="notes" element={<AdminNotes />} />
          <Route path="brands" element={<AdminBrands />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;