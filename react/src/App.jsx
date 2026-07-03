import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/customer/HomePage';
import AboutPage from './pages/customer/About';
import ScentDetailPage from './pages/customer/ScentDetailPage';
import ScentProfilesPage from './pages/customer/ScentProfilesPage';
import './App.css';

function App() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <>
      <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <main>
        <Routes>
          <Route path="/" element={<HomePage searchQuery={searchQuery} />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/products/:id" element={<ScentDetailPage />} />
          <Route path="/scents" element={<ScentProfilesPage />} />

          {/* အသစ်ထည့်ရမည့် Route: Scent တစ်ခုချင်းစီအတွက် */}
          <Route path="/scents/:id" element={<ScentDetailPage />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;