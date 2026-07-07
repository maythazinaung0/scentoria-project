import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout & Auth
import CustomerLayout from './components/CustomerLayout';
import AdminLayout from './components/Admin/AdminLayout';
import ProtectedAdminRoute from './pages/ProtectedAdminRoute';
import LoginPage from './pages/LoginPage';

// Admin Imports
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/Products';
import AdminOrders from './pages/admin/Orders';
import AdminWallet from './pages/admin/Wallet';
import AdminReports from './pages/admin/Report';

// Customer Imports
import HomePage from './pages/customer/Homepage';
import AboutPage from './pages/customer/About';
import ScentProfilesPage from './pages/customer/ScentProfilesPage';
import ScentDetailPage from './pages/customer/ScentDetailPage';
import ProductDetailPage from './pages/customer/Productdetail';
import ProductsPage from './pages/customer/Productspage';
import './index.css';
import ProfilePage from './pages/customer/ProfilePage';
import CartPage from './pages/customer/CartPage';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [scents, setScents] = useState([]); // Scents State 

  useEffect(() => {
    // Products Fetch
    fetch('http://localhost/api/products', { headers: { 'Accept': 'application/json' } })
      .then(res => res.json())
      .then(data => setProducts(Array.isArray(data) ? data : []))
      .catch(err => console.error("Error fetching products:", err));

    // Scents Fetch
    fetch('http://localhost/api/scents', { headers: { 'Accept': 'application/json' } }) // products အစား scents ကို ပြင်ပါ
      .then(res => res.json())
      .then(data => setScents(Array.isArray(data) ? data : []))
      .catch(err => console.error("Error fetching scents:", err));
  }, []);

  //return <ProfilePage />;

  return (
    <Routes>
      <Route element={<CustomerLayout searchQuery={searchQuery} onSearchChange={setSearchQuery} />}>

        <Route path="/" element={<HomePage searchQuery={searchQuery} products={products} scents={scents} />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/scents" element={<ScentProfilesPage />} />
        <Route path="/scents/:id" element={<ScentDetailPage />} />
        <Route path="/products" element={<ProductsPage products={products} searchQuery={searchQuery} />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
      </Route>

      <Route path="/admin" element={<ProtectedAdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="wallet" element={<AdminWallet />} />
          <Route path="reports" element={<AdminReports />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;