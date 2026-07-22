import { useEffect, useState, useMemo } from 'react';
import { Search, ShoppingBag } from 'lucide-react';
import api from '../../api';
import Dropdown from '../../components/Admin/Dropdown';
import AdminPagination from '../../components/Admin/AdminPagination';
import { STATUS_OPTIONS } from './orders/constants';
import OrderTable from './orders/OrderTable';
import OrderDetailModal from './orders/OrderDetailModal';
import { useConfirm } from '../../contexts/ConfirmContext';

export default function Orders() {
  const confirm = useConfirm();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating] = useState(null);

  // Filter bar state
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Table sort state — newest orders first by default
  const [sortKey, setSortKey] = useState('id');
  const [sortDir, setSortDir] = useState('desc');

  // Pagination state
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);

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
      await api.patch(`/admin/orders/${orderId}`, { status: newStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      setSelectedOrder(prev => prev && prev.id === orderId ? { ...prev, status: newStatus } : prev);
    } catch (e) {
      console.error('Failed to update status:', e);
      alert('Could not update order status. Please try again.');
    } finally { setUpdating(null); }
  }

  // The only status change an admin can trigger is pending -> processing,
  // and it's a signal to the customer that fulfillment has started — so
  // confirm before firing it, same pattern as deactivating a product.
  function toggleStatus(orderId, newStatus) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    confirm({
      title: 'Start Processing',
      message: `Mark order #${String(orderId).padStart(4, '0')} as processing? This lets the customer know fulfillment has started.`,
      confirmLabel: 'Start Processing',
      onConfirm: () => handleUpdateStatus(orderId, newStatus),
    });
  }

  function handleSort(key) {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
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

  const sorted = useMemo(() => {
    const arr = [...filtered];
    const dir = sortDir === 'asc' ? 1 : -1;
    arr.sort((a, b) => {
      let av, bv;
      switch (sortKey) {
        // IDs can come back from the API as strings — comparing them as
        // strings sorts "11" before "9" lexicographically. Force numeric
        // comparison so newest (highest id) orders sort correctly.
        case 'id': av = Number(a.id); bv = Number(b.id); break;
        case 'fulfillment': av = a.created_at ? new Date(a.created_at).getTime() : 0; bv = b.created_at ? new Date(b.created_at).getTime() : 0; break;
        case 'items': av = a.order_items?.length ?? 0; bv = b.order_items?.length ?? 0; break;
        case 'total': av = Number(a.total_amount) || 0; bv = Number(b.total_amount) || 0; break;
        case 'customer': av = (a.customer_name ?? '').toLowerCase(); bv = (b.customer_name ?? '').toLowerCase(); break;
        case 'status': av = (a.status ?? '').toLowerCase(); bv = (b.status ?? '').toLowerCase(); break;
        default: av = ''; bv = '';
      }
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  // Reset to page 1 whenever filters, sort, or page size change, so the
  // user is never stranded on an out-of-range page.
  useEffect(() => {
    setPage(1);
  }, [search, filterStatus, dateFrom, dateTo, sortKey, sortDir, perPage]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));
  const clampedPage = Math.min(page, totalPages);
  const visible = useMemo(() => {
    const start = (clampedPage - 1) * perPage;
    return sorted.slice(start, start + perPage);
  }, [sorted, clampedPage, perPage]);

  const hasActiveFilters = Boolean(search || filterStatus || dateFrom || dateTo);

  return (
    <div className="min-h-screen relative overflow-hidden selection:bg-nature-olive/10">
      <div className="relative p-6 md:p-10 z-10">
        <div className="text-nature-dark space-y-8 max-w-7xl mx-auto">

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="font-serif text-4xl font-normal tracking-tight text-neutral-800">Orders</h1>
              <p className="text-nature-muted text-xs font-medium tracking-wide uppercase opacity-80">
                {orders.length} {orders.length === 1 ? 'order' : 'orders'} placed
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
           <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-nature-muted" />
            <input type="text" placeholder="Search order ID or customer..." value={search} onChange={e => setSearch(e.target.value)} className="bg-white/70 border border-nature-border/50 focus:border-nature-border rounded-xl pl-9 pr-4 py-2 text-sm outline-none transition-colors w-64 placeholder-nature-muted/70" />
          </div>


            <div className="flex items-center gap-2 bg-white/70 backdrop-blur-md border border-nature-border/80 focus-within:border-nature-olive/60 rounded-xl px-4 py-2.5 transition-colors">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="bg-transparent text-sm outline-none text-nature-dark w-[124px]"
              />
              <span className="text-nature-olive text-xs">to</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="bg-transparent text-sm outline-none text-nature-dark w-[124px]"
              />
            </div>

            <div className="w-40">
              <Dropdown value={filterStatus} onChange={setFilterStatus} placeholder="All Status" options={STATUS_OPTIONS} />
            </div>
          </div>

          {loading ? (
            <div className="bg-white/30 backdrop-blur-xl border border-white/60 rounded-2xl overflow-hidden divide-y divide-nature-border/40">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-14 bg-white/20 animate-pulse" />
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div className="bg-white/70 backdrop-blur-xl border border-nature-border/80 rounded-2xl p-16 text-center">
              <p className="text-nature-muted text-sm">
                {hasActiveFilters ? 'No orders match your filters.' : 'No orders placed yet.'}
              </p>
            </div>
          ) : (
            <div className="bg-white/30 backdrop-blur-xl border border-white/60 rounded-2xl overflow-hidden shadow-[0_2px_16px_-4px_rgba(44,53,39,0.08)]">
              <OrderTable
                filtered={visible}
                onSelectOrder={setSelectedOrder}
                onUpdateStatus={toggleStatus}
                updatingId={updating}
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
                footer={
                  <AdminPagination
                    page={clampedPage}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    perPage={perPage}
                    onPerPageChange={setPerPage}
                    totalItems={sorted.length}
                  />
                }
              />
            </div>
          )}
        </div>
      </div>

      {selectedOrder && (
        <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} onUpdateStatus={toggleStatus} updating={updating} />
      )}
    </div>
  );
}