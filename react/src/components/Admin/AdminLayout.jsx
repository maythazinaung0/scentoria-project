import { Outlet } from 'react-router-dom';
import Navbar from './AdminNavbar';

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-nature-bg flex">
      <Navbar />
      <main className="ml-60 flex-1 min-h-screen">
        <div className="max-w-screen-2xl mx-auto px-6 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}