import { useEffect, useState, useMemo } from 'react';
import { Search, ShoppingBag } from 'lucide-react';
import api from '../../api';
import Dropdown from '../../components/Admin/Dropdown';
import AdminPagination from '../../components/Admin/AdminPagination';
import { STATUS_OPTIONS } from './orders/constants';
import OrderTable from './orders/OrderTable';
import OrderDetailModal from './orders/OrderDetailModal';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating] = useState(null);

  // Filter bar state
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Pagination state
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(8);

  async function load() {
    try {
      setLoading(true);
      const res = await api.get('/admin/orders');
      const data = res.data;
      if (Array.isArray(data)) setOrders(data);
      else if (Array.isArray(data?.orders)) setOrders(data.orders);
      else if (Array.isArray(data?.data)) setOrders(data.data);
      else setOrders([]);
    } catch (e) {
      console.error('Failed to load orders:', e);
      setOrders([]);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

 async function handleUpdateStatus(orderId, newStatus) {
  setUpdating(orderId);
  try {
    await api.patch(`/admin/orders/${orderId}`, { status: newStatus }); // put -> patch
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    setSelectedOrder(prev => prev && prev.id === orderId ? { ...prev, status: newStatus } : prev);
  } catch (e) {
    console.error('Failed to update status:', e);
    alert('Could not update order status. Please try again.');
  } finally { setUpdating(null); }
}

  const filtered = useMemo(() => orders.filter(o => {
    const matchesSearch = !search
      || String(o.id).includes(search)
      || o.customer_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !filterStatus || o.status === filterStatus;
    const orderDate = o.created_at ? new Date(o.created_at) : null;
    const matchesFrom = !dateFrom || (orderDate && orderDate >= new Date(dateFrom));
    const matchesTo = !dateTo || (orderDate && orderDate <= new Date(new Date(dateTo).setHours(23, 59, 59, 999)));
    return matchesSearch && matchesStatus && matchesFrom && matchesTo;
  }), [orders, search, filterStatus, dateFrom, dateTo]);

  // Reset to page 1 whenever filters or page size change, so the user
  // is never stranded on an out-of-range page.
  useEffect(() => {
    setPage(1);
  }, [search, filterStatus, dateFrom, dateTo, perPage]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const clampedPage = Math.min(page, totalPages);
  const visible = useMemo(() => {
    const start = (clampedPage - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, clampedPage, perPage]);

  return (
    <div className="text-nature-dark space-y-6 relative">
      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl">Orders</h1>
          <p className="text-nature-muted text-sm mt-0.5">{orders.length} orders placed</p>
        </div>
      </div>

      {/* Search + Date filter + Status filter bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-nature-muted" />
            <input type="text" placeholder="Search order ID or customer..." value={search} onChange={e => setSearch(e.target.value)} className="bg-nature-card border border-nature-olive/20 focus:border-nature-olive/60 rounded-xl pl-9 pr-4 py-2 text-sm outline-none transition-colors w-64" />
          </div>

          <div className="flex items-center gap-2 bg-nature-card border border-nature-olive/20 rounded-xl px-3 py-2">
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="bg-transparent text-sm outline-none text-nature-dark w-[124px]" />
            <span className="text-nature-olive text-xs">to</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="bg-transparent text-sm outline-none text-nature-dark w-[124px]" />
          </div>

          <div className="w-40">
            <Dropdown value={filterStatus} onChange={setFilterStatus} placeholder="All Status" options={STATUS_OPTIONS} />
          </div>
        </div>
      </div>

      {selectedOrder && (
        <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} onUpdateStatus={handleUpdateStatus} updating={updating} />
      )}

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="bg-nature-card rounded-xl h-16 animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-nature-muted"><ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>No orders match your filters.</p></div>
      ) : (
        <>
          <div className="[&>div]:rounded-b-none">
<OrderTable
  filtered={visible}
  onSelectOrder={setSelectedOrder}
  onUpdateStatus={handleUpdateStatus}
  updatingId={updating}
/>          </div>

          <AdminPagination
            page={clampedPage}
            totalPages={totalPages}
            onPageChange={setPage}
            perPage={perPage}
            onPerPageChange={setPerPage}
            totalItems={filtered.length}
          />
        </>
      )}
    </div>
  );
}