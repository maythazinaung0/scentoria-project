import { Outlet } from 'react-router-dom';
import Navbar from './AdminNavbar';

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-nature-bg flex w-full">
      {/* Sidebar Component */}
      <Navbar />
      
      {/* Main Structural Content Viewport Container */}
      <main className="ml-60 flex-1 min-w-0 max-w-full overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}