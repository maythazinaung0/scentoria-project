import React, { useEffect, useState, useMemo } from 'react';
import { Plus, Trash2, X, Search, Pencil, Tags, Loader2, Package, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import api from '../../api';
import AdminPagination from '../../components/Admin/AdminPagination';
import FieldError from '../../components/FieldError';
import { useConfirm } from '../../contexts/ConfirmContext';

const EMPTY_FORM = { name: '' };

const COLUMNS = [
  { key: 'name', label: 'Brand', sortable: true },
  { key: 'products', label: 'Products', sortable: true },
  { key: 'actions', label: '', sortable: false },
];

function BrandFormModal({ editTarget, form, setForm, error, errors = {}, saving, onSubmit, onCancel }) {
  // Client-side validation, run on submit before the request ever goes
  // out — same pattern as ProductModal/ScentModal. Merged with whatever
  // the server sends back via the `errors` prop (e.g. a duplicate-name
  // 422), so that still surfaces correctly under the field too.
  const [localErrors, setLocalErrors] = useState({});
  const displayErrors = { ...localErrors, ...errors };

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = ['Brand name is required.'];
    return errs;
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    const clientErrors = validate();
    if (Object.keys(clientErrors).length > 0) {
      setLocalErrors(clientErrors);
      return;
    }
    setLocalErrors({});
    onSubmit(e);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-neutral-900/30 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-md bg-white/90 backdrop-blur-xl border border-white/60 rounded-2xl shadow-[0_20px_50px_-10px_rgba(74,104,56,0.35)] p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-2xl text-neutral-800">{editTarget ? 'Edit Brand' : 'New Brand'}</h2>
          <button onClick={onCancel} className="text-nature-muted hover:text-neutral-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-nature-muted text-xs font-semibold tracking-wider uppercase mb-1.5">Brand Name</label>
            <input
              autoFocus
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Chanel"
              maxLength={255}
              className="w-full bg-white/70 border border-nature-border/80 focus:border-nature-olive/60 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
            />
            <FieldError errors={displayErrors} field="name" />
          </div>

          {error && <p className="text-rose-600 text-xs bg-rose-50 border border-rose-200/60 rounded-lg px-3 py-2">{error}</p>}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 text-nature-muted hover:text-neutral-800 text-sm font-medium tracking-wide border border-nature-border/80 rounded-xl py-2.5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-nature-olive hover:bg-nature-olive/90 disabled:opacity-60 text-white text-sm font-medium tracking-wide rounded-xl py-2.5 transition-colors shadow-[0_4px_16px_-4px_rgba(74,104,56,0.5)]"
            >
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {editTarget ? 'Save Changes' : 'Create Brand'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

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

function BrandRow({ brand, productCount, onEdit, onDelete, deleting }) {
  return (
    <tr className="border-b border-nature-border/40 hover:bg-nature-olive/5 transition-colors">
      <td className="py-2.5 pl-4 pr-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg overflow-hidden bg-gradient-to-br from-nature-olive/15 via-nature-sage/25 to-neutral-100 flex-shrink-0 flex items-center justify-center">
            <span className="font-serif text-sm text-nature-olive/50">
              {brand.name?.[0]?.toUpperCase()}
            </span>
          </div>
          <p className="font-medium text-neutral-800 text-sm truncate">{brand.name}</p>
        </div>
      </td>
      <td className="py-2.5 px-3 text-sm text-nature-muted whitespace-nowrap">
        <span className="inline-flex items-center gap-1.5">
          <Package className="w-3.5 h-3.5" strokeWidth={1.5} />
          {productCount} {productCount === 1 ? 'product' : 'products'}
        </span>
      </td>
      <td className="py-2.5 px-3 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onEdit(brand)}
            className="p-1.5 rounded-lg text-nature-muted hover:text-nature-olive hover:bg-nature-olive/10 transition-colors"
            title="Edit"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(brand.id)}
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

export default function Brand() {
  const confirm = useConfirm();

  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [deletingId, setDeletingId] = useState(null);

  // Table view state
  const [sortKey, setSortKey] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  // Pagination state
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);

  async function load(signal) {
    if (!hasLoadedOnce) setLoading(true);
    try {
      const [brandsRes, productsRes] = await Promise.allSettled([
        api.get('/admin/brands', { signal }),
        api.get('/admin/products', { signal }),
      ]);

      if (brandsRes.status === 'fulfilled') setBrands(brandsRes.value.data ?? []);
      else if (brandsRes.reason?.name !== 'CanceledError') console.error('Failed to load brands:', brandsRes.reason);

      if (productsRes.status === 'fulfilled') setProducts(productsRes.value.data ?? []);
      else if (productsRes.reason?.name !== 'CanceledError') console.error('Failed to load products:', productsRes.reason);

      setHasLoadedOnce(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, []);

  const productsForBrand = (brandId) => products.filter(p => (p.brand_id ?? p.brand?.id) === brandId);

  function openAdd() {
    setEditTarget(null);
    setForm({ ...EMPTY_FORM });
    setFormError('');
    setFieldErrors({});
    setModalOpen(true);
  }

  function openEdit(brand) {
    setEditTarget(brand);
    setForm({ name: brand.name });
    setFormError('');
    setFieldErrors({});
    setModalOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setFormError('');
    setFieldErrors({});
    setSaving(true);
    try {
      if (editTarget) await api.put(`/admin/brands/${editTarget.id}`, form);
      else await api.post('/admin/brands', form);
      setModalOpen(false);
      await load();
    } catch (err) {
      if (err.response?.status === 422) {
        setFieldErrors(err.response.data.errors || {});
      } else {
        setFormError(err.response?.data?.message || err.message || 'Error saving brand.');
      }
    } finally {
      setSaving(false);
    }
  }

  function handleDelete(id) {
    confirm({
      title: 'Delete Brand',
      message: 'Delete this brand? This cannot be undone.',
      confirmLabel: 'Delete',
      onConfirm: async () => {
        setDeletingId(id);
        try {
          await api.delete(`/admin/brands/${id}`);
          setBrands((prev) => prev.filter((b) => b.id !== id));
        } catch (err) {
          console.error('Failed to delete brand:', err);
          throw err;
        } finally {
          setDeletingId(null);
        }
      },
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

  const filteredBrands = useMemo(
    () => brands.filter((b) => b.name.toLowerCase().includes(search.toLowerCase())),
    [brands, search]
  );

  const sortedBrands = useMemo(() => {
    const arr = [...filteredBrands];
    const dir = sortDir === 'asc' ? 1 : -1;
    arr.sort((a, b) => {
      let av, bv;
      if (sortKey === 'products') {
        av = productsForBrand(a.id).length;
        bv = productsForBrand(b.id).length;
      } else {
        av = a.name?.toLowerCase() ?? '';
        bv = b.name?.toLowerCase() ?? '';
      }
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
    return arr;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredBrands, sortKey, sortDir, products]);

  useEffect(() => {
    setPage(1);
  }, [search, perPage]);

  const totalPages = Math.max(1, Math.ceil(sortedBrands.length / perPage));
  const clampedPage = Math.min(page, totalPages);
  const visibleBrands = useMemo(() => {
    const start = (clampedPage - 1) * perPage;
    return sortedBrands.slice(start, start + perPage);
  }, [sortedBrands, clampedPage, perPage]);

  return (
    <div className="min-h-screen relative overflow-hidden selection:bg-nature-olive/10">
      <div className="relative p-6 md:p-10 z-10">
        <div className="text-nature-dark space-y-8 max-w-7xl mx-auto">

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="font-serif text-4xl font-normal tracking-tight text-neutral-800">Brands</h1>
              <p className="text-nature-muted text-xs font-medium tracking-wide uppercase opacity-80">
                {brands.length} {brands.length === 1 ? 'brand' : 'brands'} registered
              </p>
            </div>
            <button
              onClick={openAdd}
              className="flex items-center gap-2 bg-nature-olive hover:bg-nature-olive/90 text-white text-xs font-medium tracking-wide transition-colors px-4 py-2.5 rounded-xl shadow-[0_4px_16px_-4px_rgba(74,104,56,0.5)]"
            >
              <Plus className="w-3.5 h-3.5" /> Add Brand
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-nature-muted" />
            <input type="text" placeholder="Search brands..." value={search} onChange={e => setSearch(e.target.value)} className="bg-white/70 border border-nature-border/50 focus:border-nature-border rounded-xl pl-9 pr-4 py-2 text-sm outline-none transition-colors w-64 placeholder-nature-muted/70" />
          </div>

          {loading ? (
            <div className="bg-white/30 backdrop-blur-xl border border-white/60 rounded-2xl overflow-hidden divide-y divide-nature-border/40">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-14 bg-white/20 animate-pulse" />
              ))}
            </div>
          ) : sortedBrands.length === 0 ? (
            <div className="bg-white/70 backdrop-blur-xl border border-nature-border/80 rounded-2xl p-16 text-center">
              <Tags className="w-8 h-8 mx-auto mb-3 text-nature-muted opacity-40" strokeWidth={1.5} />
              <p className="text-nature-muted text-sm">
                {search ? `No brands match "${search}".` : 'No brands yet — add your first one.'}
              </p>
            </div>
          ) : (
            <div className="bg-white/30 backdrop-blur-xl border border-white/60 rounded-2xl overflow-hidden shadow-[0_2px_16px_-4px_rgba(44,53,39,0.08)]">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[480px]">
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
                    {visibleBrands.map((brand) => (
                      <BrandRow
                        key={brand.id}
                        brand={brand}
                        productCount={productsForBrand(brand.id).length}
                        onEdit={openEdit}
                        onDelete={handleDelete}
                        deleting={deletingId === brand.id}
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
                totalItems={sortedBrands.length}
              />
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <BrandFormModal
          editTarget={editTarget}
          form={form}
          setForm={setForm}
          error={formError}
          errors={fieldErrors}
          saving={saving}
          onSubmit={handleSave}
          onCancel={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}