import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';


export default function CustomerLayout({ searchQuery, onSearchChange }) {
  return (
    <>

      <Navbar searchQuery={searchQuery} onSearchChange={onSearchChange} />
      <main>

        <Outlet context={{ searchQuery }} />
      </main>
      <Footer />
    </>
  );
}