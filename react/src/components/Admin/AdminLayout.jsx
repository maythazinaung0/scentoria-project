import { Outlet } from 'react-router-dom';
import Navbar from './AdminNavbar';
import { HIDE_SCROLLBAR } from '../../utils/ui';

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-nature-bg flex w-full">
      {/* Sidebar - stays fixed in place, doesn't scroll with the page */}
      <Navbar />

      {/* Main content area - locked to viewport height (h-screen) so it
          scrolls internally instead of the whole browser page. The
          scrollbar itself is hidden via HIDE_SCROLLBAR (scroll still works
          with mouse wheel/trackpad, it just isn't drawn on screen). */}
      <main className={`ml-60 flex-1 min-w-0 max-w-full h-screen overflow-y-auto overflow-x-hidden ${HIDE_SCROLLBAR}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}