import React, { useEffect, useState } from 'react';
import { Plus, Trash2, X, Search, Edit2, Package, FolderPlus, Settings } from 'lucide-react';
import api from '../../api';

const formatMMK = (amount) => new Intl.NumberFormat('en-MM', { style: 'currency', currency: 'MMK', minimumFractionDigits: 0 }).format(amount);

const EMPTY_FORM = {
  name: '', slug: '', brand_id: '', scent_id: '', description: '', type: 'perfume', gender: 'unisex', season: 'spring', image_url: '',
  variants: [], top_notes: [], heart_notes: [], base_notes: []
};

const AVAILABLE_SIZES = ['30ml', '50ml', '100ml'];

export default function Products() {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [scents, setScents] = useState([]);
  const [notes, setNotes] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleting, setDeleting] = useState(null);

  const [showBrandForm, setShowBrandForm] = useState(false);
  const [brandFormName, setBrandFormName] = useState('');
  const [brandEditTarget, setBrandEditTarget] = useState(null);
  const [brandSaving, setBrandSaving] = useState(false);
  const [brandError, setBrandError] = useState('');
  const [contextMenu, setContextMenu] = useState(null);

  // Filter States
  const [search, setSearch] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterGender, setFilterGender] = useState(''); // Added gender filtering state
  const [selectedProduct, setSelectedProduct] = useState(null);

  async function load() {
    try {
      setLoading(true);
      const [productsRes, brandsRes, scentsRes, notesRes] = await Promise.all([
        api.get('/products'), api.get('/brands'), api.get('/scents'), api.get('/notes')
      ]);
      setProducts(productsRes.data ?? []);
      setBrands(brandsRes.data ?? []);
      setScents(scentsRes.data ?? []);
      setNotes(notesRes.data ?? []);
    } catch (e) { 
      console.error("Failed to load admin resources:", e); 
    } finally { setLoading(false); }
  }

  useEffect(() => {
    load();
    const closeMenu = () => setContextMenu(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
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
    setFormError(''); setShowForm(true);
  }

  async function handleSave(e) {
    e.preventDefault(); 
    if (form.variants.length === 0) return setFormError('Please add at least one product size variant.');
    setFormError(''); setSaving(true);
    try {
      if (editTarget) { await api.put(`/products/${editTarget.id}`, form); } 
      else { await api.post('/products', form); }
      setShowForm(false); setSelectedProduct(null); await load();
    } catch (err) { setFormError(err.response?.data?.message || err.message || 'Error saving product'); } finally { setSaving(false); }
  }

  async function handleDelete(id, e) {
    if (e) e.stopPropagation();
    if (!confirm('Permanently delete this product?')) return;
    setDeleting(id);
    try { 
      await api.delete(`/products/${id}`); 
      setProducts(p => p.filter(x => x.id !== id));
      if (selectedProduct?.id === id) setSelectedProduct(null);
    } catch (err) { console.error("Error deleting product:", err); } finally { setDeleting(null); }
  }

  async function handleBrandSave(e) {
    e.preventDefault(); setBrandError(''); setBrandSaving(true);
    try {
      if (brandEditTarget) { await api.put(`/brands/${brandEditTarget.id}`, { name: brandFormName }); } 
      else { await api.post('/brands', { name: brandFormName }); }
      setShowBrandForm(false); setBrandFormName(''); await load();
    } catch (err) { setBrandError(err.response?.data?.message || 'Error saving brand'); } finally { setBrandSaving(false); }
  }

  // Updated filter computing logical check to parse search query, filterBrand, and filterGender checks simultaneously
  const filtered = products.filter(p => {
    const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.brand?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesBrand = !filterBrand || String(p.brand_id) === filterBrand;
    const matchesGender = !filterGender || p.gender === filterGender;
    return matchesSearch && matchesBrand && matchesGender;
  });

  return (
    <div className="text-nature-dark space-y-6 relative">
      {contextMenu && (
        <div className="fixed bg-nature-card border border-nature-border shadow-xl rounded-xl z-[100] py-1.5 min-w-[140px]" style={{ top: contextMenu.y, left: contextMenu.x }} onClick={e => e.stopPropagation()}>
          <button onClick={() => { setBrandEditTarget({ id: contextMenu.brandId, name: contextMenu.brandName }); setBrandFormName(contextMenu.brandName); setShowBrandForm(true); setContextMenu(null); }} className="w-full text-left px-4 py-2 text-xs hover:bg-nature-sage/20 transition-colors">Update Brand</button>
          <button onClick={() => { if(confirm('Delete brand?')) api.delete(`/brands/${contextMenu.brandId}`).then(load); setContextMenu(null); }} className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors">Delete Brand</button>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl">Products</h1>
          <p className="text-nature-muted text-sm mt-0.5">{products.length} fragrances in catalogue</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { setBrandEditTarget(null); setBrandFormName(''); setBrandError(''); setShowBrandForm(true); }} className="flex items-center gap-2 bg-nature-olive hover:bg-nature-olive-dark text-white font-semibold px-4 py-2.5 rounded-xl text-sm tracking-wider transition-colors"><FolderPlus className="w-4 h-4" /> ADD BRAND</button>
          <button onClick={() => { setEditTarget(null); setForm({ ...EMPTY_FORM }); setFormError(''); setShowForm(true); }} className="flex items-center gap-2 bg-nature-olive hover:bg-nature-olive-dark text-white font-semibold px-4 py-2.5 rounded-xl text-sm tracking-wider transition-colors"><Plus className="w-4 h-4" /> ADD PRODUCT</button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-nature-muted" />
            <input type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="bg-nature-card border border-nature-border rounded-xl pl-9 pr-4 py-2 text-sm outline-none transition-colors w-56" />
          </div>
          
          {/* Brand Filter */}
          <select value={filterBrand} onChange={e => setFilterBrand(e.target.value)} className="bg-nature-card border border-nature-border rounded-xl px-4 py-2 text-sm outline-none transition-colors cursor-pointer appearance-none pr-8">
            <option value="">All Brands</option>
            {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>

          {/* New Gender Selector Filter */}
          <select value={filterGender} onChange={e => setFilterGender(e.target.value)} className="bg-nature-card border border-nature-border rounded-xl px-4 py-2 text-sm outline-none transition-colors cursor-pointer appearance-none pr-8">
            <option value="">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="unisex">Unisex</option>
          </select>
        </div>
        
        <div className="text-xs bg-nature-sage/20 border border-nature-border rounded-xl px-3 py-1.5 flex items-center gap-1.5 text-nature-olive"><Settings className="w-3.5 h-3.5" /> <span>Tip: Right-click brands to modify them.</span></div>
      </div>

      <div className="flex flex-wrap gap-1.5 items-center bg-nature-bg p-2 rounded-xl border border-nature-border">
        <span className="text-xs font-bold text-nature-muted px-2">Brands:</span>
        {brands.map(b => <span key={b.id} onContextMenu={e => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, brandId: b.id, brandName: b.name }); }} className="text-xs bg-nature-card border border-nature-border px-2.5 py-1 rounded-lg select-none cursor-context-menu hover:border-nature-olive/50 transition-colors">{b.name}</span>)}
      </div>

      {showBrandForm && (
        <BrandModal title={brandEditTarget ? 'Update Brand' : 'Create New Brand'} onSubmit={handleBrandSave} value={brandFormName} onChange={setBrandFormName} error={brandError} saving={brandSaving} onCancel={() => setShowBrandForm(false)} />
      )}

      {showForm && (
        <ProductModal editTarget={editTarget} form={form} update={update} handleNameChange={handleNameChange} brands={brands} scents={scents} notes={notes} addNoteId={addNoteId} removeNoteId={removeNoteId} addVariant={addVariant} removeVariant={removeVariant} updateVariant={updateVariant} error={formError} saving={saving} onSubmit={handleSave} onCancel={() => setShowForm(false)} />
      )}

      {selectedProduct && (
        <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onEdit={(p) => { setSelectedProduct(null); openEdit(p); }} onDelete={(id) => { handleDelete(id); }} deleting={deleting} />
      )}

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="bg-nature-card rounded-xl h-16 animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-nature-muted"><Package className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>No products match your filters.</p></div>
      ) : (
        <ProductTable filtered={filtered} openEdit={openEdit} handleDelete={handleDelete} deleting={deleting} onSelectProduct={setSelectedProduct} />
      )}
    </div>
  );
}

function BrandModal({ title, onSubmit, value, onChange, error, saving, onCancel }) {
  return (
    <div className="fixed inset-0 bg-nature-dark/85 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={onCancel}>
      <div className="bg-nature-card border border-nature-border rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4"><h2 className="font-serif text-xl">{title}</h2><button onClick={onCancel} className="text-nature-muted hover:text-nature-dark"><X className="w-5 h-5" /></button></div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div><label className="block text-nature-muted text-xs mb-1">Brand Name *</label><input required value={value} onChange={e => onChange(e.target.value)} placeholder="e.g. Chanel" className="w-full bg-nature-bg border border-nature-border rounded-lg px-3 py-2 text-sm outline-none" /></div>
          {error && <p className="text-red-600 text-sm bg-red-50 border rounded px-3 py-2">{error}</p>}
          <div className="flex gap-3"><button type="button" onClick={onCancel} className="flex-1 border text-nature-muted py-2 rounded-xl text-sm">Cancel</button><button type="submit" disabled={saving} className="flex-1 bg-nature-olive text-white py-2 rounded-xl text-sm font-semibold">{saving ? 'SAVING...' : 'SAVE BRAND'}</button></div>
        </form>
      </div>
    </div>
  );
}

function ProductModal({ editTarget, form, update, handleNameChange, brands, scents, notes, addNoteId, removeNoteId, addVariant, removeVariant, updateVariant, error, saving, onSubmit, onCancel }) {
  const activeSizes = form.variants.map(v => v.size);
  const remainingSizes = AVAILABLE_SIZES.filter(s => !activeSizes.includes(s));

  const renderNoteSelector = (label, typeKey) => {
    return (
      <div className="bg-nature-bg border rounded-xl p-3 space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-[11px] font-bold text-nature-muted uppercase tracking-wider">{label}</label>
          <select value="" onChange={e => { addNoteId(typeKey, e.target.value); e.target.value = ''; }} className="bg-nature-card border rounded-lg px-2 py-0.5 text-xs font-medium cursor-pointer outline-none max-w-[120px]">
            <option value="">+ Add Note</option>
            {notes.filter(n => !(form[typeKey] ?? []).includes(n.id)).map(n => (
              <option key={n.id} value={n.id}>{n.name}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-1">
          {(form[typeKey] ?? []).map(id => {
            const match = notes.find(n => n.id === id);
            return (
              <span key={id} className="inline-flex items-center gap-1 bg-nature-card border border-nature-olive/20 text-nature-olive px-2 py-0.5 rounded-md text-xs">
                {match ? match.name : `Note #${id}`}
                <button type="button" onClick={() => removeNoteId(typeKey, id)} className="text-nature-muted hover:text-red-600 ml-0.5"><X className="w-3 h-3" /></button>
              </span>
            );
          })}
          {(form[typeKey] ?? []).length === 0 && (
            <p className="text-[11px] text-nature-muted italic">No items allocated</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-nature-dark/85 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="bg-nature-card border border-nature-border rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5"><h2 className="font-serif text-xl">{editTarget ? 'Edit Product' : 'Add New Product'}</h2><button onClick={onCancel} className="text-nature-muted hover:text-nature-dark"><X className="w-5 h-5" /></button></div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs text-nature-muted mb-1">Name *</label><input required value={form.name} onChange={e => handleNameChange(e.target.value)} className="w-full bg-nature-bg border rounded-lg px-3 py-2 text-sm outline-none" /></div>
            <div><label className="block text-xs text-nature-muted mb-1">Slug *</label><input required value={form.slug} onChange={e => update('slug', e.target.value)} className="w-full bg-nature-bg border rounded-lg px-3 py-2 text-sm outline-none" /></div>
            <div><label className="block text-xs text-nature-muted mb-1">Brand *</label><select required value={form.brand_id} onChange={e => update('brand_id', e.target.value)} className="w-full bg-nature-bg border rounded-lg px-3 py-2 text-sm outline-none"><option value="">Select Brand</option>{brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
            <div><label className="block text-xs text-nature-muted mb-1">Scent Family *</label><select required value={form.scent_id} onChange={e => update('scent_id', e.target.value)} className="w-full bg-nature-bg border rounded-lg px-3 py-2 text-sm outline-none"><option value="">Select Scent</option>{scents.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="block text-xs text-nature-muted mb-1">Type</label><select value={form.type} onChange={e => update('type', e.target.value)} className="w-full bg-nature-bg border rounded-lg px-3 py-2 text-sm outline-none"><option value="perfume">Perfume</option><option value="cologne">Cologne</option><option value="body spray">Body Spray</option></select></div>
            <div><label className="block text-xs text-nature-muted mb-1">Gender *</label><select value={form.gender} onChange={e => update('gender', e.target.value)} className="w-full bg-nature-bg border rounded-lg px-3 py-2 text-sm outline-none"><option value="men">Men</option><option value="women">Women</option><option value="unisex">Unisex</option></select></div>
            <div><label className="block text-xs text-nature-muted mb-1">Season</label><select value={form.season} onChange={e => update('season', e.target.value)} className="w-full bg-nature-bg border rounded-lg px-3 py-2 text-sm outline-none"><option value="spring">Spring</option><option value="summer">Summer</option><option value="fall">Fall</option><option value="winter">Winter</option></select></div>
          </div>

          <div className="border-t pt-3 space-y-2">
            <h3 className="text-sm font-semibold text-nature-dark">Scent Notes Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {renderNoteSelector("Top Notes", "top_notes")}
              {renderNoteSelector("Heart Notes", "heart_notes")}
              {renderNoteSelector("Base Notes", "base_notes")}
            </div>
          </div>

          <div><label className="block text-xs text-nature-muted mb-1">Image URL</label><input value={form.image_url} onChange={e => update('image_url', e.target.value)} className="w-full bg-nature-bg border rounded-lg px-3 py-2 text-sm outline-none" /></div>
          <div><label className="block text-xs text-nature-muted mb-1">Description</label><textarea rows={2} value={form.description} onChange={e => update('description', e.target.value)} className="w-full bg-nature-bg border rounded-lg px-3 py-2 text-sm outline-none resize-none" /></div>
          
          <div className="border-t pt-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold">Variants</h3>
              {remainingSizes.length > 0 && (
                <select value="" onChange={e => addVariant(e.target.value)} className="bg-nature-bg border rounded-lg px-2 py-1 text-xs outline-none cursor-pointer">
                  <option value="" disabled>+ Add Variant Size</option>
                  {remainingSizes.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              )}
            </div>
            <div className="space-y-2">
              {form.variants.map((v, i) => (
                <div key={v.size} className="grid grid-cols-12 gap-2 items-center bg-nature-bg p-2 rounded-lg border">
                  <div className="col-span-1 text-xs font-bold text-nature-olive">{v.size}</div>
                  <div className="col-span-2"><input type="number" placeholder="Cost" required value={v.original_price} onChange={e => updateVariant(i, 'original_price', e.target.value)} className="bg-nature-card border rounded px-2 py-1 text-xs outline-none w-full" /></div>
                  <div className="col-span-2"><input type="number" placeholder="Sale" required value={v.sale_price} onChange={e => updateVariant(i, 'sale_price', e.target.value)} className="bg-nature-card border rounded px-2 py-1 text-xs outline-none w-full" /></div>
                  <div className="col-span-2"><input type="number" placeholder="Stock" required value={v.stock_quantity} onChange={e => updateVariant(i, 'stock_quantity', e.target.value)} className="bg-nature-card border rounded px-2 py-1 text-xs outline-none w-full" /></div>
                  <div className="col-span-4"><input type="text" placeholder="SKU" value={v.sku || ''} onChange={e => updateVariant(i, 'sku', e.target.value)} className="bg-nature-card border rounded px-2 py-1 text-xs outline-none w-full" /></div>
                  <div className="col-span-1 text-center"><button type="button" onClick={() => removeVariant(i)} className="text-red-500 hover:text-red-700"><Trash2 className="w-3.5 h-3.5 mx-auto" /></button></div>
                </div>
              ))}
              {form.variants.length === 0 && <p className="text-xs text-nature-muted italic py-2 text-center">No sizes selected yet. Use dropdown above to add one.</p>}
            </div>
          </div>
          {error && <p className="text-red-600 text-sm bg-red-50 border rounded px-3 py-2">{error}</p>}
          <div className="flex gap-3"><button type="button" onClick={onCancel} className="flex-1 border py-2 rounded-xl text-sm">Cancel</button><button type="submit" disabled={saving} className="flex-1 bg-nature-olive text-white py-2 rounded-xl text-sm font-semibold">{saving ? 'SAVING...' : 'SAVE PRODUCT'}</button></div>
        </form>
      </div>
    </div>
  );
}

function ProductTable({ filtered, openEdit, handleDelete, deleting, onSelectProduct }) {
  return (
    <div className="bg-nature-card border border-nature-border rounded-2xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left text-nature-muted text-xs px-5 py-4">PRODUCT</th>
            <th className="text-left text-nature-muted text-xs px-5 py-4 hidden lg:table-cell">SCENT</th>
            <th className="text-left text-nature-muted text-xs px-5 py-4">TYPE / GENDER</th>
            <th className="text-center text-nature-muted text-xs px-5 py-4">VARIANTS</th>
            <th className="px-5 py-4 w-20" />
          </tr>
        </thead>
        <tbody>
          {filtered.map(p => (
            <tr key={p.id} onClick={() => onSelectProduct(p)} className="border-b border-nature-sand/30 last:border-0 hover:bg-nature-sage/10 cursor-pointer transition-colors">
              <td className="px-5 py-3">
                <div className="flex items-center gap-3">
                  <img src={p.image_url ?? 'https://images.pexels.com/photos/3018845/pexels-photo-3018845.jpeg?auto=compress&cs=tinysrgb&w=80'} alt={p.name} className="w-11 h-11 rounded-xl object-cover border" />
                  <div className="min-w-0">
                    <p className="font-medium truncate">{p.name}</p>
                    <p className="text-nature-muted text-xs">{p.brand?.name ?? 'Unknown Brand'}</p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-3 hidden lg:table-cell">{p.scent?.name ? <span className="bg-nature-sage/30 text-nature-olive px-2 py-0.5 rounded-full text-xs">{p.scent.name}</span> : '—'}</td>
              <td className="px-5 py-3 text-xs capitalize">{p.type} <span className="text-nature-muted">({p.gender})</span></td>
              <td className="px-5 py-3 text-center text-xs text-nature-muted">{p.variants?.length || 0} sizes</td>
              <td className="px-5 py-3">
                <div className="flex items-center justify-end gap-2">
                  <button onClick={e => openEdit(p, e)} className="text-nature-muted hover:text-nature-olive p-1"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={e => handleDelete(p.id, e)} disabled={deleting === p.id} className="text-nature-subtle hover:text-red-500 p-1 disabled:opacity-40"><Trash2 className="w-4 h-4" /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProductDetailModal({ product, onClose, onEdit, onDelete, deleting }) {
  const topList = (product.notes ?? []).filter(n => n.pivot?.type === 'top').map(n => n.name).join(', ') || '—';
  const heartList = (product.notes ?? []).filter(n => n.pivot?.type === 'heart').map(n => n.name).join(', ') || '—';
  const baseList = (product.notes ?? []).filter(n => n.pivot?.type === 'base').map(n => n.name).join(', ') || '—';

  return (
    <div className="fixed inset-0 bg-nature-dark/85 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-nature-card border border-nature-border rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden space-y-5 animate-fadeIn" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between pb-3 border-b">
          <h2 className="font-serif text-xl">Product Details</h2>
          <button onClick={onClose} className="text-nature-muted hover:text-nature-dark"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex gap-4 items-center bg-nature-bg p-3 rounded-xl border">
          <img src={product.image_url ?? 'https://images.pexels.com/photos/3018845/pexels-photo-3018845.jpeg?auto=compress&cs=tinysrgb&w=80'} alt={product.name} className="w-24 h-24 rounded-xl object-cover border" />
          <div>
            <h3 className="font-serif text-xl font-medium">{product.name}</h3>
            <p className="text-nature-olive font-semibold">{product.brand?.name ?? 'Unknown Brand'}</p>
            <p className="text-xs text-nature-muted mt-1 capitalize">{product.type} &bull; {product.gender}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-nature-bg p-2.5 rounded-lg border"><span className="text-nature-muted block">Scent Family</span><span className="font-medium text-sm">{product.scent?.name ?? '—'}</span></div>
          <div className="bg-nature-bg p-2.5 rounded-lg border"><span className="text-nature-muted block">Season Focus</span><span className="font-medium text-sm capitalize">{product.season}</span></div>
          <div className="col-span-2 bg-nature-bg p-2.5 rounded-lg border"><span className="text-nature-muted block">Slug Reference</span><span className="font-mono text-nature-dark select-all">{product.slug}</span></div>
          {product.description && (
            <div className="col-span-2 bg-nature-bg p-3 rounded-lg border"><span className="text-nature-muted block mb-1">Description</span><p className="text-nature-dark leading-relaxed font-normal">{product.description}</p></div>
          )}
        </div>

        <div className="bg-nature-bg border rounded-xl p-3 space-y-2 text-xs">
          <h4 className="font-bold text-nature-muted uppercase text-[10px] tracking-wider">Olfactory Scent Pyramid</h4>
          <div className="space-y-1.5 pt-1">
            <div><span className="font-medium text-nature-olive">Top Notes:</span> <span className="text-nature-dark">{topList}</span></div>
            <div><span className="font-medium text-nature-olive">Heart Notes:</span> <span className="text-nature-dark">{heartList}</span></div>
            <div><span className="font-medium text-nature-olive">Base Notes:</span> <span className="text-nature-dark">{baseList}</span></div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-bold text-nature-muted uppercase tracking-wider">Available Variants</h4>
          <div className="space-y-2">
            {product.variants?.map(v => {
              const profit = v.sale_price - v.original_price;
              return (
                <div key={v.id} className="grid grid-cols-4 items-center bg-nature-bg border rounded-xl p-3 text-xs gap-2">
                  <div><span className="text-nature-olive font-bold text-sm block">{v.size}</span><span className="text-[10px] text-nature-muted font-mono block truncate">{v.sku || 'No SKU'}</span></div>
                  <div className="text-center"><span className="text-nature-muted block text-[10px]">Stock</span><span className="font-semibold">{v.stock_quantity} units</span></div>
                  <div className="text-center"><span className="text-nature-muted block text-[10px]">Price (Sale)</span><span className="font-semibold text-nature-olive">{formatMMK(v.sale_price)}</span></div>
                  <div className="text-right"><span className="text-nature-muted block text-[10px]">Est. Profit</span><span className={`font-semibold ${profit >= 0 ? 'text-nature-olive' : 'text-red-600'}`}>{formatMMK(profit)}</span></div>
                </div>
              );
            })}
            {(!product.variants || product.variants.length === 0) && <p className="text-xs text-center text-nature-muted italic">No variants registered.</p>}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 border py-2 rounded-xl text-sm">Close</button>
          <button type="button" onClick={() => onEdit(product)} className="flex-1 bg-nature-olive text-white py-2 rounded-xl text-sm font-semibold">Edit Product</button>
        </div>
      </div>
    </div>
  );
}