import { useEffect, useState } from 'react';
import { Plus, Search, Package } from 'lucide-react';
import api from '../../api';
import Dropdown from '../../components/Admin/Dropdown';
import { EMPTY_FORM } from './products/constants';
import ProductModal from './products/ProductModal';
import ProductTable from './products/ProductTable';
import ProductDetailModal from './products/ProductDetailModal';

export default function Products() {
  // Core data loaded from the API
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [scents, setScents] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add/Edit form modal state
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // null = adding a new product, otherwise the product being edited
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleting, setDeleting] = useState(null); // id of the product currently being deleted (for disabling its button)

  // Filter/search bar state
  const [search, setSearch] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterGender, setFilterGender] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null); // product shown in the read-only detail modal

  // Fetches products, brands, scents, and notes together on page load
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
      console.error('Failed to load admin resources:', e);
    } finally { setLoading(false); }
  }

  useEffect(() => {
    load();
  }, []);

  // Generic form field updater: update('description', 'new text')
  const update = (field, value) => setForm(f => ({ ...f, [field]: value }));

  // Updates name and auto-generates a URL-friendly slug from it
  const handleNameChange = (name) => setForm(f => ({
    ...f, name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
  }));

  // --- Variant (size/price/stock) helpers ---------------------------------
  const addVariant = (size) => {
    if (!size || form.variants.some(v => v.size === size)) return; // prevent duplicate sizes
    setForm(f => ({
      ...f, variants: [...f.variants, { size, original_price: '', sale_price: '', stock_quantity: '', sku: '' }]
    }));
  };

  const removeVariant = (idx) => setForm(f => ({ ...f, variants: f.variants.filter((_, i) => i !== idx) }));

  const updateVariant = (idx, field, value) => setForm(f => {
    const v = [...f.variants]; v[idx] = { ...v[idx], [field]: value }; return { ...f, variants: v };
  });

  // --- Scent note helpers (top/heart/base) ---------------------------------
  const addNoteId = (typeKey, id) => {
    if (!id) return;
    const numId = Number(id);
    if (form[typeKey].includes(numId)) return; // avoid adding the same note twice
    setForm(f => ({ ...f, [typeKey]: [...f[typeKey], numId] }));
  };

  const removeNoteId = (typeKey, id) => {
    setForm(f => ({ ...f, [typeKey]: f[typeKey].filter(item => item !== id) }));
  };

  // Opens the modal pre-filled with an existing product's data for editing
  function openEdit(p, e) {
    if (e) e.stopPropagation(); // don't trigger the row's onClick (which opens the detail modal)
    setEditTarget(p);

    // Split the flat notes array back into top/heart/base groups based on pivot type
    const top_notes = (p.notes ?? []).filter ? p.notes.filter(n => n.pivot?.type === 'top').map(n => n.id) : [];
    const heart_notes = (p.notes ?? []).filter ? p.notes.filter(n => n.pivot?.type === 'heart').map(n => n.id) : [];
    const base_notes = (p.notes ?? []).filter ? p.notes.filter(n => n.pivot?.type === 'base').map(n => n.id) : [];

    setForm({
      ...p,
      top_notes, heart_notes, base_notes,
      // Convert numeric fields to strings so they bind cleanly to text inputs
      variants: (p.variants ?? []).map(v => ({ ...v, original_price: String(v.original_price), sale_price: String(v.sale_price), stock_quantity: String(v.stock_quantity) }))
    });
    setFormError(''); setShowForm(true);
  }

  // Creates a new product or updates the existing one (editTarget)
  async function handleSave(e) {
    e.preventDefault();
    // Manual validation replaces the native "required" checks we lost by
    // switching Brand/Scent Family from <select> to the custom Dropdown
    if (!form.brand_id) return setFormError('Please select a brand.');
    if (!form.scent_id) return setFormError('Please select a scent family.');
    if (form.variants.length === 0) return setFormError('Please add at least one product size variant.');
    setFormError(''); setSaving(true);
    try {
      if (editTarget) { await api.put(`/products/${editTarget.id}`, form); }
      else { await api.post('/products', form); }
      setShowForm(false); setSelectedProduct(null); await load();
    } catch (err) { setFormError(err.response?.data?.message || err.message || 'Error saving product'); } finally { setSaving(false); }
  }

  // Deletes a product after confirmation
  async function handleDelete(id, e) {
    if (e) e.stopPropagation();
    if (!confirm('Permanently delete this product?')) return;
    setDeleting(id);
    try {
      await api.delete(`/products/${id}`);
      setProducts(p => p.filter(x => x.id !== id));
      if (selectedProduct?.id === id) setSelectedProduct(null);
    } catch (err) {
      console.error('Error deleting product:', err);
      alert(err.response?.data?.message || 'Error deleting product');
    } finally { setDeleting(null); }
}

  // Applies the search box, brand filter, and gender filter together
  const filtered = products.filter(p => {
    const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.brand?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesBrand = !filterBrand || String(p.brand_id) === String(filterBrand);
    const matchesGender = !filterGender || p.gender === filterGender;
    return matchesSearch && matchesBrand && matchesGender;
  });

  return (
    <div className="text-nature-dark space-y-6 relative">
      {/* Page header + Add Product action */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl">Products</h1>
          <p className="text-nature-muted text-sm mt-0.5">{products.length} fragrances in catalogue</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { setEditTarget(null); setForm({ ...EMPTY_FORM }); setFormError(''); setShowForm(true); }} className="flex items-center gap-2 bg-nature-olive hover:bg-nature-olive-dark text-white font-semibold px-4 py-2.5 rounded-xl text-sm tracking-wider transition-colors"><Plus className="w-4 h-4" /> ADD PRODUCT</button>
        </div>
      </div>

      {/* Search + filter bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-nature-muted" />
            <input type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="bg-nature-card border border-nature-border rounded-xl pl-9 pr-4 py-2 text-sm outline-none transition-colors w-56" />
          </div>

          {/* Brand filter dropdown */}
          <div className="w-40">
            <Dropdown
              value={filterBrand}
              onChange={setFilterBrand}
              placeholder="All Brands"
              options={[{ value: '', label: 'All Brands' }, ...brands.map(b => ({ value: b.id, label: b.name }))]}
            />
          </div>

          {/* Gender filter dropdown */}
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
        </div>
      </div>

      {/* Add/Edit Product modal */}
      {showForm && (
        <ProductModal editTarget={editTarget} form={form} update={update} handleNameChange={handleNameChange} brands={brands} scents={scents} notes={notes} addNoteId={addNoteId} removeNoteId={removeNoteId} addVariant={addVariant} removeVariant={removeVariant} updateVariant={updateVariant} error={formError} saving={saving} onSubmit={handleSave} onCancel={() => setShowForm(false)} />
      )}

      {/* Read-only product detail modal */}
      {selectedProduct && (
        <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onEdit={(p) => { setSelectedProduct(null); openEdit(p); }} deleting={deleting} />
      )}

      {/* Product list: loading skeleton -> empty state -> table */}
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