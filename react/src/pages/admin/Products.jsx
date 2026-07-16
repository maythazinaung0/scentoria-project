import { useEffect, useState, useMemo } from 'react';
import { Plus, Search, Package, Pencil, Trash2, Loader2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import api from '../../api';
import Dropdown from '../../components/Admin/Dropdown';
import AdminPagination from '../../components/Admin/AdminPagination';
import { EMPTY_FORM } from './products/constants';
import ProductModal from './products/ProductModal';
import ProductDetailModal from './products/ProductDetailModal';
import { useConfirm } from '../../contexts/ConfirmContext';

const COLUMNS = [
  { key: 'name', label: 'Product', sortable: true },
  { key: 'type', label: 'Type', sortable: true },
  { key: 'gender', label: 'Gender', sortable: true },
  { key: 'variants', label: 'Variants', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'actions', label: '', sortable: false },
];

function SortHeader({ col, sortKey, sortDir, onSort }) {
  if (!col.sortable) {
    return <th className="py-2.5 px-3 text-right">{col.label}</th>;
  }
  const active = sortKey === col.key;
  return (
    <th
      onClick={() => onSort(col.key)}
      className="py-2.5 px-3 font-medium cursor-pointer select-none group whitespace-nowrap"
    >
      <span className={`inline-flex items-center gap-1 ${active ? 'text-nature-olive' : 'group-hover:text-neutral-700'}`}>
        {col.label}
        {active ? (
          sortDir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
        ) : (
          <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-40 transition-opacity" />
        )}
      </span>
    </th>
  );
}

function ProductRow({ product, openEdit, handleDelete, toggleStatus, deleting, togglingStatus, onSelect }) {
  const [imgError, setImgError] = useState(false);
  const status = product.status === 'inactive' ? 'inactive' : 'active';
  const showImage = product.image_url && !imgError;

  return (
    <tr
      onClick={() => onSelect(product)}
      className="border-b border-nature-border/40 hover:bg-nature-olive/5 cursor-pointer transition-colors"
    >
      <td className="py-2.5 pl-4 pr-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg overflow-hidden bg-gradient-to-br from-nature-olive/15 via-nature-sage/25 to-neutral-100 flex-shrink-0 flex items-center justify-center">
            {showImage ? (
              <img
                src={product.image_url}
                alt={product.name}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <Package className="w-3.5 h-3.5 text-nature-olive/40" strokeWidth={1.5} />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-neutral-800 text-sm truncate">{product.name}</p>
            <p className="text-nature-olive text-[10px] font-semibold tracking-[0.1em] uppercase truncate">
              {product.brand?.name ?? 'Unknown Brand'}
            </p>
          </div>
        </div>
      </td>
      <td className="py-2.5 px-3 text-sm text-nature-muted capitalize whitespace-nowrap">{product.type}</td>
      <td className="py-2.5 px-3 text-sm text-nature-muted capitalize whitespace-nowrap">{product.gender}</td>
      <td className="py-2.5 px-3 text-sm text-nature-muted whitespace-nowrap">
        {product.variants?.length || 0}
      </td>
      <td className="py-2.5 px-3 whitespace-nowrap">
        <button
          onClick={(e) => toggleStatus(product, e)}
          disabled={togglingStatus}
          title={status === 'active' ? 'Click to deactivate' : 'Click to activate'}
          className={`inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-full font-medium capitalize transition-opacity hover:opacity-75 disabled:opacity-50 disabled:cursor-wait ${
            status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'
          }`}
        >
          {togglingStatus ? (
            <Loader2 className="w-2.5 h-2.5 animate-spin" />
          ) : (
            <span className={`w-1.5 h-1.5 rounded-full ${status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
          )}
          {status}
        </button>
      </td>
      <td className="py-2.5 px-3 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={(e) => openEdit(product, e)}
            className="p-1.5 rounded-lg text-nature-muted hover:text-nature-olive hover:bg-nature-olive/10 transition-colors"
            title="Edit"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => handleDelete(product.id, e)}
            disabled={deleting}
            className="p-1.5 rounded-lg text-nature-muted hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
            title="Delete"
          >
            {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function Products() {
  const confirm = useConfirm();

  // Core data loaded from the API
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [scents, setScents] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add/Edit form modal state
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [deleting, setDeleting] = useState(null);
  const [togglingStatusId, setTogglingStatusId] = useState(null);

  // Filter/search bar state
  const [search, setSearch] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterGender, setFilterGender] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Table view state
  const [sortKey, setSortKey] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  // Pagination state
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(8);

  async function load() {
    setLoading(true);
    const [productsRes, brandsRes, scentsRes, notesRes] = await Promise.allSettled([
      api.get('/admin/products'), api.get('/admin/brands'), api.get('/admin/scents'), api.get('/admin/notes')
    ]);

    if (productsRes.status === 'fulfilled') setProducts(productsRes.value.data ?? []);
    else console.error('Failed to load products:', productsRes.reason);

    if (brandsRes.status === 'fulfilled') setBrands(brandsRes.value.data ?? []);
    else console.error('Failed to load brands:', brandsRes.reason);

    if (scentsRes.status === 'fulfilled') setScents(scentsRes.value.data ?? []);
    else console.error('Failed to load scents:', scentsRes.reason);

    if (notesRes.status === 'fulfilled') setNotes(notesRes.value.data ?? []);
    else console.error('Failed to load notes:', notesRes.reason);

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleNameChange = (name) => setForm(f => ({
    ...f, name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
  }));

  const addVariant = (size) => {
    if (!size || form.variants.some(v => v.size === size)) return;
    setForm(f => ({
      ...f, variants: [...f.variants, { size, original_price: '', sale_price: '', stock_quantity: '', sku: '' }]
    }));
  };

  const removeVariant = (idx) => setForm(f => ({ ...f, variants: f.variants.filter((_, i) => i !== idx) }));

  const updateVariant = (idx, field, value) => setForm(f => {
    const v = [...f.variants]; v[idx] = { ...v[idx], [field]: value }; return { ...f, variants: v };
  });

  const addNoteId = (typeKey, id) => {
    if (!id) return;
    const numId = Number(id);
    if (form[typeKey].includes(numId)) return;
    setForm(f => ({ ...f, [typeKey]: [...f[typeKey], numId] }));
  };

  const removeNoteId = (typeKey, id) => {
    setForm(f => ({ ...f, [typeKey]: f[typeKey].filter(item => item !== id) }));
  };

  function openEdit(p, e) {
    if (e) e.stopPropagation();
    setEditTarget(p);

    const top_notes = (p.notes ?? []).filter ? p.notes.filter(n => n.pivot?.type === 'top').map(n => n.id) : [];
    const heart_notes = (p.notes ?? []).filter ? p.notes.filter(n => n.pivot?.type === 'heart').map(n => n.id) : [];
    const base_notes = (p.notes ?? []).filter ? p.notes.filter(n => n.pivot?.type === 'base').map(n => n.id) : [];

    setForm({
      ...p,
      top_notes, heart_notes, base_notes,
      variants: (p.variants ?? []).map(v => ({ ...v, original_price: String(v.original_price), sale_price: String(v.sale_price), stock_quantity: String(v.stock_quantity) }))
    });
    setFormError(''); setFieldErrors({}); setShowForm(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setFormError(''); setFieldErrors({});

    const clientErrors = {};
    if (!form.brand_id) clientErrors.brand_id = ['Please select a brand.'];
    if (!form.scent_id) clientErrors.scent_id = ['Please select a scent family.'];
    if (form.variants.length === 0) clientErrors.variants = ['Please add at least one product size variant.'];

    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      setFormError('Please fix the errors below.');
      return;
    }

    setSaving(true);
    try {
      if (editTarget) { await api.put(`/admin/products/${editTarget.id}`, form); }
      else { await api.post('/admin/products', form); }
      setShowForm(false); setSelectedProduct(null); await load();
    } catch (err) {
      if (err.response?.status === 422) {
        setFieldErrors(err.response.data.errors || {});
        setFormError(err.response.data.message || 'Please fix the errors below.');
      } else {
        setFormError(err.response?.data?.message || err.message || 'Error saving product');
      }
    } finally { setSaving(false); }
  }

  function handleDelete(id, e) {
    if (e) e.stopPropagation();
    confirm({
      title: 'Delete Product',
      message: 'Permanently delete this product? This cannot be undone.',
      confirmLabel: 'Delete',
      onConfirm: async () => {
        setDeleting(id);
        try {
          await api.delete(`/admin/products/${id}`);
          setProducts(p => p.filter(x => x.id !== id));
          if (selectedProduct?.id === id) setSelectedProduct(null);
        } catch (err) {
          console.error('Error deleting product:', err);
          throw err;
        } finally {
          setDeleting(null);
        }
      },
    });
  }

  async function applyStatusChange(product, newStatus) {
    setTogglingStatusId(product.id);
    try {
      const { data } = await api.patch(`/admin/products/${product.id}/status`, { status: newStatus });
      setProducts(prev => prev.map(p => (p.id === product.id ? data : p)));
      setSelectedProduct(prev => (prev?.id === product.id ? data : prev));
    } catch (err) {
      console.error('Failed to update product status:', err);
    } finally {
      setTogglingStatusId(null);
    }
  }

  function toggleStatus(product, e) {
    if (e) e.stopPropagation();
    const isActive = product.status !== 'inactive';

    // Deactivating hides the product storefront-wide, so confirm first.
    // Reactivating is low-risk and applies immediately.
    if (isActive) {
      confirm({
        title: 'Deactivate Product',
        message: `Hide "${product.name}" from the storefront? Existing orders won't be affected, and you can reactivate it anytime.`,
        confirmLabel: 'Deactivate',
        onConfirm: () => applyStatusChange(product, 'inactive'),
      });
    } else {
      applyStatusChange(product, 'active');
    }
  }

  function handleSort(key) {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const filtered = useMemo(() => products.filter(p => {
    const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.brand?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesBrand = !filterBrand || String(p.brand_id) === filterBrand;
    const matchesGender = !filterGender || p.gender === filterGender;
    const matchesStatus = !filterStatus || (p.status ?? 'active') === filterStatus;
    return matchesSearch && matchesBrand && matchesGender && matchesStatus;
  }), [products, search, filterBrand, filterGender, filterStatus]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    const dir = sortDir === 'asc' ? 1 : -1;
    arr.sort((a, b) => {
      let av, bv;
      switch (sortKey) {
        case 'name': av = a.name?.toLowerCase() ?? ''; bv = b.name?.toLowerCase() ?? ''; break;
        case 'type': av = a.type?.toLowerCase() ?? ''; bv = b.type?.toLowerCase() ?? ''; break;
        case 'gender': av = a.gender?.toLowerCase() ?? ''; bv = b.gender?.toLowerCase() ?? ''; break;
        case 'variants': av = a.variants?.length || 0; bv = b.variants?.length || 0; break;
        case 'status': av = a.status === 'inactive' ? 0 : 1; bv = b.status === 'inactive' ? 0 : 1; break;
        default: av = ''; bv = '';
      }
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  useEffect(() => {
    setPage(1);
  }, [search, filterBrand, filterGender, filterStatus, perPage]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));
  const clampedPage = Math.min(page, totalPages);
  const visible = useMemo(() => {
    const start = (clampedPage - 1) * perPage;
    return sorted.slice(start, start + perPage);
  }, [sorted, clampedPage, perPage]);

  return (
    <div className="text-nature-dark space-y-6 relative">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl">Products</h1>
          <p className="text-nature-muted text-sm mt-0.5">{products.length} fragrances in catalogue</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { setEditTarget(null); setForm({ ...EMPTY_FORM }); setFormError(''); setFieldErrors({}); setShowForm(true); }} className="flex items-center gap-2 bg-nature-olive hover:bg-nature-olive-dark text-white font-semibold px-4 py-2.5 rounded-xl text-sm tracking-wider transition-colors"><Plus className="w-4 h-4" /> ADD PRODUCT</button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-nature-muted" />
            <input type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="bg-nature-card border border-nature-border rounded-xl pl-9 pr-4 py-2 text-sm outline-none transition-colors w-56" />
          </div>

          <div className="w-40">
            <Dropdown
              value={filterBrand}
              onChange={setFilterBrand}
              placeholder="All Brands"
              options={[{ value: '', label: 'All Brands' }, ...brands.map(b => ({ value: b.id, label: b.name }))]}
            />
          </div>

          <div className="w-40">
            <Dropdown
              value={filterGender}
              onChange={setFilterGender}
              placeholder="All Genders"
              options={[
                { value: '', label: 'All Genders' },
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
                { value: 'unisex', label: 'Unisex' },
              ]}
            />
          </div>

          <div className="w-40">
            <Dropdown
              value={filterStatus}
              onChange={setFilterStatus}
              placeholder="All Statuses"
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ]}
            />
          </div>
        </div>
      </div>

      {showForm && (
        <ProductModal editTarget={editTarget} form={form} update={update} handleNameChange={handleNameChange} brands={brands} scents={scents} notes={notes} addNoteId={addNoteId} removeNoteId={removeNoteId} addVariant={addVariant} removeVariant={removeVariant} updateVariant={updateVariant} error={formError} errors={fieldErrors} saving={saving} onSubmit={handleSave} onCancel={() => setShowForm(false)} />
      )}

      {selectedProduct && (
        <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onEdit={(p) => { setSelectedProduct(null); openEdit(p); }} deleting={deleting} />
      )}

      {loading ? (
        <div className="bg-white/30 backdrop-blur-xl border border-white/60 rounded-2xl overflow-hidden divide-y divide-nature-border/40">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 bg-white/20 animate-pulse" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-20 text-nature-muted"><Package className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>No products match your filters.</p></div>
      ) : (
        <>
          <div className="bg-white/30 backdrop-blur-xl border border-white/60 rounded-2xl overflow-hidden shadow-[0_2px_16px_-4px_rgba(44,53,39,0.08)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[720px]">
                <thead>
                  <tr className="border-b border-nature-border text-[11px] uppercase tracking-wide text-nature-muted bg-white/20">
                    {COLUMNS.map((col, i) =>
                      i === 0 ? (
                        <th key={col.key} onClick={() => handleSort(col.key)} className="py-2.5 pl-4 pr-3 font-medium cursor-pointer select-none group whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 ${sortKey === col.key ? 'text-nature-olive' : 'group-hover:text-neutral-700'}`}>
                            {col.label}
                            {sortKey === col.key ? (
                              sortDir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                            ) : (
                              <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-40 transition-opacity" />
                            )}
                          </span>
                        </th>
                      ) : (
                        <SortHeader key={col.key} col={col} sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {visible.map((p) => (
                    <ProductRow
                      key={p.id}
                      product={p}
                      openEdit={openEdit}
                      handleDelete={handleDelete}
                      toggleStatus={toggleStatus}
                      deleting={deleting === p.id}
                      togglingStatus={togglingStatusId === p.id}
                      onSelect={setSelectedProduct}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <AdminPagination
              page={clampedPage}
              totalPages={totalPages}
              onPageChange={setPage}
              perPage={perPage}
              onPerPageChange={setPerPage}
              totalItems={sorted.length}
            />
          </div>
        </>
      )}
    </div>
  );
}