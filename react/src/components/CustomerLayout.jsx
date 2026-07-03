import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export default function CustomerLayout() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <>
      <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}