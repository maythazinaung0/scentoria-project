import React, { useEffect, useState } from 'react';
import { Plus, Trash2, X, Search, Edit2, Tags } from 'lucide-react';
import api from '../../api';

const EMPTY_FORM = { name: '' };

export default function Brand() {
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleting, setDeleting] = useState(null);

  const [search, setSearch] = useState('');

  async function load() {
    try {
      setLoading(true);
      const [brandsRes, productsRes] = await Promise.all([
        api.get('/brands'), api.get('/products')
      ]);
      setBrands(brandsRes.data ?? []);
      setProducts(productsRes.data ?? []);
    } catch (e) {
      console.error('Failed to load brands:', e);
    } finally { setLoading(false); }
  }

  useEffect(() => {
    load();
  }, []);

  const productsForBrand = (brandId) => products.filter(p => (p.brand_id ?? p.brand?.id) === brandId);

  function openAdd() {
    setEditTarget(null);
    setForm({ ...EMPTY_FORM });
    setFormError('');
    setShowForm(true);
  }

  function openEdit(b, e) {
    if (e) e.stopPropagation();
    setEditTarget(b);
    setForm({ name: b.name });
    setFormError('');
    setShowForm(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name.trim()) return setFormError('Brand name is required.');
    setFormError(''); setSaving(true);
    try {
      if (editTarget) { await api.put(`/brands/${editTarget.id}`, form); }
      else { await api.post('/brands', form); }
      setShowForm(false);
      await load();
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Error saving brand');
    } finally { setSaving(false); }
  }

  async function handleDelete(id, e) {
    if (e) e.stopPropagation();
    if (!confirm('Permanently delete this brand?')) return;
    setDeleting(id);
    try {
      await api.delete(`/brands/${id}`);
      setBrands(b => b.filter(x => x.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting brand. It may still be linked to products.');
    } finally { setDeleting(null); }
  }

  const filtered = brands.filter(b => !search || b.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="text-nature-dark space-y-6 relative">
      {/* Page header + Add Brand action (mirrors the Products page header) */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl">Brands</h1>
          <p className="text-nature-muted text-sm mt-0.5">{brands.length} brands registered</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-nature-olive hover:bg-nature-olive-dark text-white font-semibold px-4 py-2.5 rounded-xl text-sm tracking-wider transition-colors">
          <Plus className="w-4 h-4" /> ADD BRAND
        </button>
      </div>

      {/* Search bar */}
      <div className="relative w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-nature-muted" />
        <input
          type="text"
          placeholder="Search brands..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-nature-card border border-nature-border rounded-xl pl-9 pr-4 py-2 text-sm outline-none transition-colors w-full"
        />
      </div>

      {/* Add/Edit Brand modal */}
      {showForm && (
        <BrandFormModal
          editTarget={editTarget}
          form={form}
          setForm={setForm}
          error={formError}
          saving={saving}
          onSubmit={handleSave}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Brand list: loading skeleton -> empty state -> table */}
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="bg-nature-card rounded-xl h-16 animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-nature-muted">
          <Tags className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No brands match your search.</p>
        </div>
      ) : (
        // ---------------------------------------------------------------
        // Table styled to match ProductTable.jsx exactly:
        // - same card/border/rounded-2xl wrapper
        // - plain (unshaded) header with px-5 py-4 cells
        // - px-5 py-3 body cells, same row border/hover treatment
        // - same icon-avatar + name/subtext layout as the product rows
        //   (a rounded icon box stands in for the product photo)
        // ---------------------------------------------------------------
        <div className="bg-nature-card border border-nature-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left text-nature-muted text-xs px-5 py-4">BRAND</th>
                <th className="text-center text-nature-muted text-xs px-5 py-4">PRODUCTS</th>
                <th className="px-5 py-4 w-20" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => {
                const linked = productsForBrand(b.id);
                return (
                  <tr key={b.id} className="border-b border-nature-sand/30 last:border-0 hover:bg-nature-sage/10 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {/* Icon avatar in place of a product photo, same size/shape as ProductTable's image
                        <div className="w-11 h-11 rounded-xl bg-nature-sage/30 border border-nature-border flex items-center justify-center flex-shrink-0">
                          <Tags className="w-5 h-5 text-nature-olive" />
                        </div> */}
                        <div className="min-w-0">
                          <p className="font-medium truncate">{b.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-center text-xs text-nature-muted">{linked.length}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={e => openEdit(b, e)} className="text-nature-muted hover:text-nature-olive p-2" title="Edit"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={e => handleDelete(b.id, e)} disabled={deleting === b.id} className="text-nature-subtle hover:text-red-500 p-2 disabled:opacity-40" title="Delete"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function BrandFormModal({ editTarget, form, setForm, error, saving, onSubmit, onCancel }) {
  return (
    <div className="fixed inset-0 bg-nature-dark/85 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="bg-nature-card border border-nature-border rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif text-xl">{editTarget ? 'Edit Brand' : 'Add New Brand'}</h2>
          <button onClick={onCancel} className="text-nature-muted hover:text-nature-dark"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-nature-muted mb-1">Brand Name *</label>
            <input
              required
              autoFocus
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Chanel"
              className="w-full bg-nature-bg border border-nature-border rounded-lg px-3 py-2 text-sm outline-none"
            />
          </div>
          {error && <p className="text-red-600 text-sm bg-red-50 border rounded px-3 py-2">{error}</p>}
          <div className="flex gap-3">
            <button type="button" onClick={onCancel} className="flex-1 border text-nature-muted py-2 rounded-xl text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 bg-nature-olive text-white py-2 rounded-xl text-sm font-semibold">{saving ? 'SAVING...' : 'SAVE BRAND'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}