import { useEffect, useState, useMemo } from 'react';
import { Plus, Search, Package, Pencil, Trash2, Loader2 } from 'lucide-react';
import api from '../../api';
import Dropdown from '../../components/Admin/Dropdown';
import AdminPagination from '../../components/Admin/AdminPagination';
import { EMPTY_FORM } from './products/constants';
import ProductModal from './products/ProductModal';
import ProductDetailModal from './products/ProductDetailModal';

function ProductCard({ product, openEdit, handleDelete, deleting, onSelect }) {
  const [imgError, setImgError] = useState(false);
  const status = product.status === 'inactive' ? 'inactive' : 'active';
  const showImage = product.image_url && !imgError;

  return (
    <div
      onClick={() => onSelect(product)}
      className="bg-white/30 backdrop-blur-xl border border-white/60 rounded-2xl overflow-hidden shadow-[0_2px_16px_-4px_rgba(44,53,39,0.08)] hover:shadow-[0_16px_40px_-8px_rgba(74,104,56,0.25)] hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
    >
      <div className="relative h-40 w-full overflow-hidden">
        {showImage ? (
          <img
            src={product.image_url}
            alt={product.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-nature-olive/15 via-nature-sage/25 to-neutral-100">
            <Package className="w-8 h-8 text-nature-olive/35" strokeWidth={1} />
          </div>
        )}

        <span
          className={`absolute top-3 right-3 text-[10px] px-2 py-0.5 rounded-full font-medium capitalize backdrop-blur-sm ${
            status === 'active' ? 'bg-emerald-100/90 text-emerald-800' : 'bg-red-100/90 text-red-700'
          }`}
        >
          {status}
        </span>
      </div>

      <div className="p-5">
        <p className="text-nature-olive text-[10px] font-semibold tracking-[0.15em] uppercase mb-1">
          {product.brand?.name ?? 'Unknown Brand'}
        </p>
        <h3 className="font-serif text-xl text-neutral-800 mb-1.5 truncate">{product.name}</h3>

        <div className="flex items-center gap-2 flex-wrap mb-3">
          {product.scent?.name && (
            <span className="bg-nature-sage/30 text-nature-olive px-2 py-0.5 rounded-full text-[11px]">
              {product.scent.name}
            </span>
          )}
          <span className="text-nature-muted text-[11px] capitalize">
            {product.type} · {product.gender}
          </span>
        </div>

        <p className="text-nature-muted text-xs">
          {product.variants?.length || 0} size{(product.variants?.length || 0) !== 1 ? 's' : ''} available
        </p>

        <div className="flex items-center justify-end gap-1 mt-4 pt-3 border-t border-nature-border/50">
          <button
            onClick={(e) => openEdit(product, e)}
            className="flex items-center gap-1.5 text-nature-muted hover:text-nature-olive hover:bg-nature-olive/10 transition-colors text-xs font-medium px-2.5 py-1.5 rounded-lg"
          >
            <Pencil className="w-3.5 h-3.5" /> Edit
          </button>
          <button
            onClick={(e) => handleDelete(product.id, e)}
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

export default function Products() {
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
  const [deleting, setDeleting] = useState(null);

  // Filter/search bar state
  const [search, setSearch] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterGender, setFilterGender] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

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
    setFormError(''); setShowForm(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.brand_id) return setFormError('Please select a brand.');
    if (!form.scent_id) return setFormError('Please select a scent family.');
    if (form.variants.length === 0) return setFormError('Please add at least one product size variant.');
    setFormError(''); setSaving(true);
    try {
      if (editTarget) { await api.put(`/admin/products/${editTarget.id}`, form); }
      else { await api.post('/admin/products', form); }
      setShowForm(false); setSelectedProduct(null); await load();
    } catch (err) { setFormError(err.response?.data?.message || err.message || 'Error saving product'); } finally { setSaving(false); }
  }

  async function handleDelete(id, e) {
    if (e) e.stopPropagation();
    if (!confirm('Permanently delete this product?')) return;
    setDeleting(id);
    try {
      await api.delete(`/admin/products/${id}`);
      setProducts(p => p.filter(x => x.id !== id));
      if (selectedProduct?.id === id) setSelectedProduct(null);
    } catch (err) { console.error('Error deleting product:', err); } finally { setDeleting(null); }
  }

  const filtered = useMemo(() => products.filter(p => {
    const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.brand?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesBrand = !filterBrand || String(p.brand_id) === filterBrand;
    const matchesGender = !filterGender || p.gender === filterGender;
    return matchesSearch && matchesBrand && matchesGender;
  }), [products, search, filterBrand, filterGender]);

  // Reset to page 1 whenever filters or page size change, so the user
  // is never stranded on an out-of-range page.
  useEffect(() => {
    setPage(1);
  }, [search, filterBrand, filterGender, perPage]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const clampedPage = Math.min(page, totalPages);
  const visible = useMemo(() => {
    const start = (clampedPage - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, clampedPage, perPage]);

  return (
    <div className="text-nature-dark space-y-6 relative">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl">Products</h1>
          <p className="text-nature-muted text-sm mt-0.5">{products.length} fragrances in catalogue</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { setEditTarget(null); setForm({ ...EMPTY_FORM }); setFormError(''); setShowForm(true); }} className="flex items-center gap-2 bg-nature-olive hover:bg-nature-olive-dark text-white font-semibold px-4 py-2.5 rounded-xl text-sm tracking-wider transition-colors"><Plus className="w-4 h-4" /> ADD PRODUCT</button>
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
        </div>
      </div>

      {showForm && (
        <ProductModal editTarget={editTarget} form={form} update={update} handleNameChange={handleNameChange} brands={brands} scents={scents} notes={notes} addNoteId={addNoteId} removeNoteId={removeNoteId} addVariant={addVariant} removeVariant={removeVariant} updateVariant={updateVariant} error={formError} saving={saving} onSubmit={handleSave} onCancel={() => setShowForm(false)} />
      )}

      {selectedProduct && (
        <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onEdit={(p) => { setSelectedProduct(null); openEdit(p); }} deleting={deleting} />
      )}

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-64 bg-white/20 border border-white/50 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-nature-muted"><Package className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>No products match your filters.</p></div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {visible.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                openEdit={openEdit}
                handleDelete={handleDelete}
                deleting={deleting === p.id}
                onSelect={setSelectedProduct}
              />
            ))}
          </div>

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