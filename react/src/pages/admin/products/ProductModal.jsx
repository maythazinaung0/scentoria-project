import { Trash2, X } from 'lucide-react';
import Dropdown from '../../../components/Admin/Dropdown';
import { HIDE_SCROLLBAR } from '../../../utils/ui';
import { AVAILABLE_SIZES } from './constants';

// ---------------------------------------------------------------------------
// Add/Edit Product form modal
// ---------------------------------------------------------------------------
export default function ProductModal({ editTarget, form, update, handleNameChange, brands, scents, notes, addNoteId, removeNoteId, addVariant, removeVariant, updateVariant, error, saving, onSubmit, onCancel }) {
  const activeSizes = form.variants.map(v => v.size);
  const remainingSizes = AVAILABLE_SIZES.filter(s => !activeSizes.includes(s)); // sizes not yet added as a variant

  // Renders one of the three note pickers (Top/Heart/Base) with add + remove chips.
  // The "+ Add Note" dropdown uses fullWidth=false + shrink-0 (inside Dropdown)
  // so its label always renders in full, no matter how long the
  // "TOP/HEART/BASE NOTES" label next to it is.
  const renderNoteSelector = (label, typeKey) => {
    const takenIds = form[typeKey] ?? [];
    const noteOptions = notes.filter(n => !takenIds.includes(n.id)).map(n => ({ value: n.id, label: n.name }));

    return (
      <div className="bg-nature-bg border rounded-xl p-3 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <label className="text-[11px] font-bold text-nature-muted uppercase tracking-wider">{label}</label>
          <Dropdown
            value=""
            onChange={(id) => addNoteId(typeKey, id)}
            options={noteOptions}
            placeholder="+ Add Note"
            fullWidth={false}
            compact
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {takenIds.map(id => {
            const match = notes.find(n => n.id === id);
            return (
              <span key={id} className="inline-flex items-center gap-1 bg-nature-card border border-nature-olive/20 text-nature-olive px-2 py-0.5 rounded-md text-xs">
                {match ? match.name : `Note #${id}`}
                <button type="button" onClick={() => removeNoteId(typeKey, id)} className="text-nature-muted hover:text-red-600 ml-0.5"><X className="w-3 h-3" /></button>
              </span>
            );
          })}
          {takenIds.length === 0 && (
            <p className="text-[11px] text-nature-muted italic">No items allocated</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-nature-dark/85 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className={`bg-nature-card border border-nature-border rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto ${HIDE_SCROLLBAR} shadow-2xl`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5"><h2 className="font-serif text-xl">{editTarget ? 'Edit Product' : 'Add New Product'}</h2><button onClick={onCancel} className="text-nature-muted hover:text-nature-dark"><X className="w-5 h-5" /></button></div>
        <form onSubmit={onSubmit} className="space-y-4">
          {/* Basic info: name, slug, brand, scent family */}
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs text-nature-muted mb-1">Name *</label><input required value={form.name} onChange={e => handleNameChange(e.target.value)} className="w-full bg-nature-bg border rounded-lg px-3 py-2 text-sm outline-none" /></div>
            <div><label className="block text-xs text-nature-muted mb-1">Slug *</label><input required value={form.slug} onChange={e => update('slug', e.target.value)} className="w-full bg-nature-bg border rounded-lg px-3 py-2 text-sm outline-none" /></div>
            <div>
              <label className="block text-xs text-nature-muted mb-1">Brand *</label>
              <Dropdown
                value={form.brand_id}
                onChange={(v) => update('brand_id', v)}
                placeholder="Select Brand"
                options={brands.map(b => ({ value: b.id, label: b.name }))}
              />
            </div>
            <div>
              <label className="block text-xs text-nature-muted mb-1">Scent Family *</label>
              <Dropdown
                value={form.scent_id}
                onChange={(v) => update('scent_id', v)}
                placeholder="Select Scent"
                options={scents.map(s => ({ value: s.id, label: s.name }))}
              />
            </div>
          </div>

          {/* Type / Gender / Season */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-nature-muted mb-1">Type</label>
              <Dropdown
                value={form.type}
                onChange={(v) => update('type', v)}
                options={[
                  { value: 'perfume', label: 'Perfume' },
                  { value: 'cologne', label: 'Cologne' },
                  { value: 'body spray', label: 'Body Spray' },
                ]}
              />
            </div>
            <div>
              <label className="block text-xs text-nature-muted mb-1">Gender *</label>
              <Dropdown
                value={form.gender}
                onChange={(v) => update('gender', v)}
                options={[
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                  { value: 'unisex', label: 'Unisex' },
                ]}
              />
            </div>
            <div>
              <label className="block text-xs text-nature-muted mb-1">Season</label>
              <Dropdown
                value={form.season}
                onChange={(v) => update('season', v)}
                options={[
                  { value: 'spring', label: 'Spring' },
                  { value: 'summer', label: 'Summer' },
                  { value: 'fall', label: 'Fall' },
                  { value: 'winter', label: 'Winter' },
                ]}
              />
            </div>
          </div>

          {/* Scent notes pyramid: top / heart / base */}
          <div className="border-t pt-3 space-y-2">
            <h3 className="text-sm font-semibold text-nature-dark">Scent Notes Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {renderNoteSelector('Top Notes', 'top_notes')}
              {renderNoteSelector('Heart Notes', 'heart_notes')}
              {renderNoteSelector('Base Notes', 'base_notes')}
            </div>
          </div>

          <div><label className="block text-xs text-nature-muted mb-1">Image URL</label><input value={form.image_url} onChange={e => update('image_url', e.target.value)} className="w-full bg-nature-bg border rounded-lg px-3 py-2 text-sm outline-none" /></div>
          <div>
            <label className="block text-xs text-nature-muted mb-1">Description</label>
            {/* HIDE_SCROLLBAR keeps this scrollable when text overflows, without showing a scrollbar */}
            <textarea rows={2} value={form.description} onChange={e => update('description', e.target.value)} className={`w-full bg-nature-bg border rounded-lg px-3 py-2 text-sm outline-none resize-none ${HIDE_SCROLLBAR}`} />
          </div>

          {/* Size/price/stock variants */}
          <div className="border-t pt-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold">Variants</h3>
              {remainingSizes.length > 0 && (
                <Dropdown
                  value=""
                  onChange={(size) => addVariant(size)}
                  options={remainingSizes.map(s => ({ value: s, label: s }))}
                  placeholder="+ Add Variant Size"
                  fullWidth={false}
                  compact
                />
              )}
            </div>
            <div className="space-y-2">
              {form.variants.map((v, i) => (
                <div key={v.size} className="grid grid-cols-12 gap-2 items-center bg-nature-bg p-2 rounded-lg border">
                  <div className="col-span-1 text-xs font-bold text-nature-olive">{v.size}</div>
                  <div className="col-span-2"><input type="text" placeholder="Cost" required value={v.original_price} onChange={e => updateVariant(i, 'original_price', e.target.value)} className="bg-nature-card border rounded px-2 py-1 text-xs outline-none w-full" /></div>
                  <div className="col-span-2"><input type="text" placeholder="Sale" required value={v.sale_price} onChange={e => updateVariant(i, 'sale_price', e.target.value)} className="bg-nature-card border rounded px-2 py-1 text-xs outline-none w-full" /></div>
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