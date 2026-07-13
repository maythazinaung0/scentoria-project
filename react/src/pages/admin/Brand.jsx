import React, { useEffect, useState } from 'react';
import { Plus, Trash2, X, Search, Pencil, Tags, Loader2, Package } from 'lucide-react';
import api from '../../api';

const EMPTY_FORM = { name: '' };

function BrandFormModal({ editTarget, form, setForm, error, saving, onSubmit, onCancel }) {
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

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-nature-muted text-xs font-semibold tracking-wider uppercase mb-1.5">Brand Name</label>
            <input
              required
              autoFocus
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Chanel"
              className="w-full bg-white/70 border border-nature-border/80 focus:border-nature-olive/60 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
            />
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

function BrandCard({ brand, productCount, onEdit, onDelete, deleting }) {
  return (
    <div className="bg-white/30 backdrop-blur-xl border border-white/60 rounded-2xl overflow-hidden shadow-[0_2px_16px_-4px_rgba(44,53,39,0.08)] hover:shadow-[0_16px_40px_-8px_rgba(74,104,56,0.25)] hover:-translate-y-1 transition-all duration-300 group">
      <div className="h-40 w-full flex items-center justify-center bg-gradient-to-br from-nature-olive/15 via-nature-sage/25 to-neutral-100">
        <span className="font-serif text-4xl text-nature-olive/35">
          {brand.name?.[0]?.toUpperCase()}
        </span>
      </div>

      <div className="p-5">
        <p className="text-nature-olive text-[10px] font-semibold tracking-[0.15em] uppercase mb-1">
          Brand
        </p>
        <h3 className="font-serif text-xl text-neutral-800 mb-1.5">{brand.name}</h3>
        <p className="text-nature-muted text-xs leading-relaxed flex items-center gap-1.5">
          <Package className="w-3.5 h-3.5" strokeWidth={1.5} />
          {productCount} {productCount === 1 ? 'product' : 'products'}
        </p>

        <div className="flex items-center justify-end gap-1 mt-4 pt-3 border-t border-nature-border/50">
          <button
            onClick={() => onEdit(brand)}
            className="flex items-center gap-1.5 text-nature-muted hover:text-nature-olive hover:bg-nature-olive/10 transition-colors text-xs font-medium px-2.5 py-1.5 rounded-lg"
          >
            <Pencil className="w-3.5 h-3.5" /> Edit
          </button>
          <button
            onClick={() => onDelete(brand.id)}
            disabled={deleting}
            className="flex items-center gap-1.5 text-nature-muted hover:text-rose-600 hover:bg-rose-50 transition-colors text-xs font-medium px-2.5 py-1.5 rounded-lg disabled:opacity-50"
          >
            {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Brand() {
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
  const [deletingId, setDeletingId] = useState(null);

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
    setModalOpen(true);
  }

  function openEdit(brand) {
    setEditTarget(brand);
    setForm({ name: brand.name });
    setFormError('');
    setModalOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name.trim()) return setFormError('Brand name is required.');
    setFormError('');
    setSaving(true);
    try {
      if (editTarget) await api.put(`/admin/brands/${editTarget.id}`, form);
      else await api.post('/admin/brands', form);
      setModalOpen(false);
      await load();
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Error saving brand.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this brand? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await api.delete(`/admin/brands/${id}`);
      setBrands((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting brand. It may still be linked to products.');
    } finally {
      setDeletingId(null);
    }
  }

  const filteredBrands = brands.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

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
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-nature-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search brands..."
              className="w-full max-w-sm bg-white/70 backdrop-blur-md border border-nature-border/80 focus:border-nature-olive/60 rounded-xl pl-11 pr-4 py-2.5 text-sm outline-none transition-colors placeholder-nature-muted/70"
            />
          </div>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-64 bg-white/20 border border-white/50 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filteredBrands.length === 0 ? (
            <div className="bg-white/70 backdrop-blur-xl border border-nature-border/80 rounded-2xl p-16 text-center">
              <Tags className="w-8 h-8 mx-auto mb-3 text-nature-muted opacity-40" strokeWidth={1.5} />
              <p className="text-nature-muted text-sm">
                {search ? `No brands match "${search}".` : 'No brands yet — add your first one.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredBrands.map((brand) => (
                <BrandCard
                  key={brand.id}
                  brand={brand}
                  productCount={productsForBrand(brand.id).length}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                  deleting={deletingId === brand.id}
                />
              ))}
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
          saving={saving}
          onSubmit={handleSave}
          onCancel={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}