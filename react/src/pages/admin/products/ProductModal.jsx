import { useRef, useState } from 'react';
import { Trash2, X, Package, Loader2, UploadCloud, Link as LinkIcon } from 'lucide-react';
import Dropdown from '../../../components/Admin/Dropdown';
import FieldError from '../../../components/FieldError';
import { HIDE_SCROLLBAR } from '../../../utils/ui';
import { AVAILABLE_SIZES } from './constants';
import api from '../../../api';

// Mirrors Laravel's Str::slug() closely enough for a live preview —
// the real slug is always generated server-side in ProductController;
// this is just so the admin can see what to expect before saving.
function slugify(text) {
  return (text ?? '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Each layer of the scent pyramid is capped at this many notes. Duplicates
// across layers (e.g. the same note in both Heart and Base) are allowed —
// this only limits how many notes a single layer can hold.
const MAX_NOTES_PER_LAYER = 5;

// ---------------------------------------------------------------------------
// Add/Edit Product form modal
// ---------------------------------------------------------------------------
export default function ProductModal({ editTarget, form, update, handleNameChange, brands, scents, notes, addNoteId, removeNoteId, addVariant, removeVariant, updateVariant, error, errors = {}, saving, onSubmit, onCancel }) {
  const activeSizes = form.variants.map(v => v.size);
  const remainingSizes = AVAILABLE_SIZES.filter(s => !activeSizes.includes(s)); // sizes not yet added as a variant

  const selectedBrand = brands.find(b => String(b.id) === String(form.brand_id));
  const slugPreview = selectedBrand && form.name
    ? slugify(`${selectedBrand.name} ${form.name}`)
    : null;

  const showImage = Boolean(form.image_url);

  // Client-side validation, run on submit before the request ever goes out —
  // same "required field" checks the ScentModal does, just for this form's
  // shape (brand/scent selects, the note pyramid, and variants). Merged with
  // whatever the server sends back via the `errors` prop, so a 422 after
  // these pass still surfaces correctly under the right field.
  const [localErrors, setLocalErrors] = useState({});
  const displayErrors = { ...localErrors, ...errors };

  function validate() {
    const errs = {};
    if (!form.name?.trim()) {
      errs.name = ['The product name field is required.'];
    } else if (form.name.trim().length < 2) {
      errs.name = ['The product name must be at least 2 characters.'];
    } else if (form.name.trim().length > 255) {
      errs.name = ['The product name must not be greater than 255 characters.'];
    }

    if (!form.description?.trim()) {
      errs.description = ['The description field is required.'];
    } else if (form.description.trim().length < 10) {
      errs.description = ['The description must be at least 10 characters.'];
    } else if (form.description.trim().length > 1000) {
      errs.description = ['The description must not be greater than 1000 characters.'];
    }
    if (!form.brand_id) errs.brand_id = ['Please select a brand.'];
    if (!form.scent_id) errs.scent_id = ['Please select a scent family.'];
    if (!form.top_notes?.length) errs.top_notes = ['Add at least one top note.'];
    if (!form.heart_notes?.length) errs.heart_notes = ['Add at least one heart note.'];
    if (!form.base_notes?.length) errs.base_notes = ['Add at least one base note.'];

    if (!form.variants?.length) {
      errs.variants = ['Please add at least one product size variant.'];
    } else {
      // Each variant needs a valid cost, sale price, and stock quantity —
      // this is what was missing before, which is why FieldError never had
      // anything to render even though the JSX was already wired up for it.
      form.variants.forEach((v, i) => {
        const cost = Number(v.original_price);
        const sale = Number(v.sale_price);
        const stock = Number(v.stock_quantity);

        const costValid = v.original_price !== '' && v.original_price != null && !Number.isNaN(cost) && cost > 0;
        const saleValid = v.sale_price !== '' && v.sale_price != null && !Number.isNaN(sale) && sale > 0;
        const MAX_PRICE = 50_000_000; // sanity ceiling to catch a typo'd extra digit, not a real business limit
        const MAX_STOCK = 10_000; // sanity ceiling to catch a typo'd extra digit, not a real warehouse limit

        if (!costValid) {
          errs[`variants.${i}.original_price`] = ['Enter a valid cost.'];
        } else if (cost % 100 !== 0) {
          errs[`variants.${i}.original_price`] = ['Prices need to be in steps of 100 MMK.'];
        } else if (cost > MAX_PRICE) {
          errs[`variants.${i}.original_price`] = ['The price cannot be larger than 5,000,000 MMK.'];
        }
        if (!saleValid) {
          errs[`variants.${i}.sale_price`] = ['Please enter a valid price.'];
        } else if (sale % 100 !== 0) {
          errs[`variants.${i}.sale_price`] = ['Prices need to be in steps of 100 MMK.'];
        } else if (sale > MAX_PRICE) {
          errs[`variants.${i}.sale_price`] = ['The price cannot be larger than 5,000,000 MMK.'];
        } else if (costValid && sale < cost) {
          errs[`variants.${i}.sale_price`] = ['Selling price cannot be lower than cost price.'];
        }
        if (v.stock_quantity === '' || v.stock_quantity == null || Number.isNaN(stock) || stock < 0) {
          errs[`variants.${i}.stock_quantity`] = ['Please enter a valid stock amount.'];
        } else if (stock > MAX_STOCK) {
          errs[`variants.${i}.stock_quantity`] = ['The stock amount cannot be higher than 10,000.'];
        }
      });
    }
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


  const [imageMode, setImageMode] = useState('upload'); // 'upload' | 'url'
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  async function uploadFile(file) {
    if (!file || !file.type.startsWith('image/')) {
      setUploadError('Please choose an image file.');
      return;
    }
    setUploading(true);
    setUploadError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post('/admin/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      update('image_url', data.url);
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }

  // Whole-number input only (prices are stored as integers, no decimals) —
  // strips anything typed that isn't a digit instead of just relying on
  // <input type="number">, which still lets letters like "e" through in
  // most browsers.
  function handleWholeNumberChange(index, field, rawValue) {
    updateVariant(index, field, rawValue.replace(/[^0-9]/g, ''));
  }

  // MMK's smallest real denomination is the hundred (no tens) — round to
  // the nearest 100 once the admin leaves the field, rather than blocking
  // keystrokes while they're still typing (which would make it impossible
  // to type the leading digits of a number like "1000" one at a time).
  function handlePriceBlur(index, field, rawValue) {
    if (rawValue === '') return;
    const rounded = Math.round(Number(rawValue) / 100) * 100;
    updateVariant(index, field, String(rounded));
  }

  // Renders one of the three note pickers (Top/Heart/Base) with add + remove chips.
  const renderNoteSelector = (label, typeKey) => {
    const takenIds = form[typeKey] ?? [];
    // Only excludes notes already picked in *this* layer — the same note can
    // still appear in more than one layer (real perfumes do this), it's just
    // capped so no single layer turns into an unbounded list.
    const noteOptions = notes
      .filter(n => !takenIds.includes(n.id))
      .map(n => ({ value: n.id, label: n.name }));
    const atLimit = takenIds.length >= MAX_NOTES_PER_LAYER;

    return (
      <div className=" border border-nature-olive/20 rounded-lg p-2.5 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-nature-olive text-[10px] font-semibold uppercase tracking-wider">{label}</span>
          {atLimit ? (
            <span className="text-[10px] text-nature-muted italic">Limit reached ({MAX_NOTES_PER_LAYER})</span>
          ) : (
            <Dropdown
              value=""
              onChange={(id) => addNoteId(typeKey, id)}
              options={noteOptions}
              placeholder="+ Add"
              fullWidth={false}
              compact
            />
          )}
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
            <p className="text-[11px] text-nature-muted italic">None yet</p>
          )}
        </div>
        <FieldError errors={displayErrors} field={typeKey} />
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-nature-dark/85 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className={`bg-nature-card border border-nature-olive/20 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto ${HIDE_SCROLLBAR} space-y-5 shadow-2xl`} onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between pb-3 border-b border-nature-olive/20">
          <h2 className="font-serif text-xl">{editTarget ? 'Edit Product' : 'Add New Product'}</h2>
          <button type="button" onClick={onCancel} className="text-nature-muted hover:text-nature-olive transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-5">

          {/* Product Name */}
          <div className=" border border-nature-olive/20 p-2.5 rounded-lg">
            <label className="text-nature-olive text-[10px] font-semibold uppercase tracking-wider block mb-1">Product Name *</label>
            <input
              maxLength={255}
              value={form.name}
              onChange={e => handleNameChange(e.target.value)}
              placeholder="e.g. Sauvage"
              className="w-full bg-nature-card border border-nature-olive/20 focus:border-nature-olive/60 rounded-lg px-3 py-2 text-sm outline-none transition-colors"
            />
            <FieldError errors={displayErrors} field="name" />
          </div>

          {/* Product Image — drag & drop upload, with a URL fallback for
              already-hosted images. Same flow as ScentModal's image field. */}
          <div className="g border border-nature-olive/20 p-3 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-nature-olive text-[10px] font-semibold uppercase tracking-wider">Product Image</span>
              <button
                type="button"
                onClick={() => setImageMode(imageMode === 'upload' ? 'url' : 'upload')}
                className="flex items-center gap-1 text-[11px] text-nature-olive hover:text-nature-olive/80 font-medium"
              >
                {imageMode === 'upload' ? (
                  <><LinkIcon className="w-3 h-3" /> Paste URL instead</>
                ) : (
                  <><UploadCloud className="w-3 h-3" /> Upload instead</>
                )}
              </button>
            </div>

            {imageMode === 'upload' ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`relative flex items-center gap-4 border-2 border-dashed rounded-xl px-4 py-4 cursor-pointer transition-colors ${
                  isDragging ? 'border-nature-olive bg-nature-olive/5' : 'border-nature-olive/30 hover:border-nature-olive/60'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  className="hidden"
                  onChange={handleFileChange}
                />
                {showImage && !uploading ? (
                  <img
                    src={form.image_url}
                    alt=""
                    onError={(e) => { e.target.style.display = 'none'; }}
                    className="w-16 h-16 rounded-lg object-cover border border-nature-olive/20 flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg border border-nature-olive/20 bg-gradient-to-br from-nature-olive/15 via-nature-sage/25 to-neutral-100 flex items-center justify-center flex-shrink-0">
                    {uploading ? (
                      <Loader2 className="w-5 h-5 text-nature-olive animate-spin" />
                    ) : (
                      <Package className="w-6 h-6 text-nature-olive/35" strokeWidth={1} />
                    )}
                  </div>
                )}
                <p className="text-xs text-nature-muted">
                  {uploading ? 'Uploading...' : showImage ? 'Click or drop to replace' : 'Click or drag an image here'}
                </p>
              </div>
            ) : (
              <>
                <input
                  value={form.image_url}
                  onChange={e => update('image_url', e.target.value)}
                  maxLength={255}
                  placeholder="https://..."
                  className="w-full bg-nature-card border border-nature-olive/20 focus:border-nature-olive/60 rounded-lg px-3 py-2 text-xs outline-none transition-colors"
                />
                {showImage && (
                  <img
                    src={form.image_url}
                    alt=""
                    onError={(e) => { e.target.style.display = 'none'; }}
                    className="w-16 h-16 rounded-lg object-cover border border-nature-olive/20"
                  />
                )}
              </>
            )}

            {uploadError && <p className="text-red-600 text-xs bg-red-50 border rounded px-2.5 py-1.5">{uploadError}</p>}
            <FieldError errors={displayErrors} field="image_url" />
          </div>

          {/* Slug preview — read-only, auto-generated from brand + name */}
          <div className=" border border-nature-olive/20 p-2.5 rounded-lg">
            <span className="text-nature-olive text-[10px] font-semibold uppercase tracking-wider block mb-0.5">Slug (auto-generated)</span>
            <span className="font-mono text-sm text-nature-dark select-all">
              {slugPreview || <span className="text-nature-muted italic font-sans">Pick a brand and enter a name to preview</span>}
            </span>
          </div>

          {/* Brand / Scent */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className=" border border-nature-olive/20 p-2.5 rounded-lg">
              <span className="text-nature-olive text-[10px] font-semibold uppercase tracking-wider block mb-1">Brand *</span>
              <Dropdown
                value={form.brand_id}
                onChange={(v) => update('brand_id', v)}
                placeholder="Select Brand"
                options={brands.map(b => ({ value: b.id, label: b.name }))}
              />
              <FieldError errors={displayErrors} field="brand_id" />
            </div>
            <div className=" border border-nature-olive/20 p-2.5 rounded-lg">
              <span className="text-nature-olive text-[10px] font-semibold uppercase tracking-wider block mb-1">Scent Family *</span>
              <Dropdown
                value={form.scent_id}
                onChange={(v) => update('scent_id', v)}
                placeholder="Select Scent"
                options={scents.map(s => ({ value: s.id, label: s.name }))}
              />
              <FieldError errors={displayErrors} field="scent_id" />
            </div>
          </div>

          {/* Type / Gender / Season */}
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className=" border border-nature-olive/20 p-2.5 rounded-lg">
              <span className="text-nature-olive text-[10px] font-semibold uppercase tracking-wider block mb-1">Type</span>
              <Dropdown
                value={form.type}
                onChange={(v) => update('type', v)}
                options={[
                  { value: 'perfume', label: 'Perfume' },
                  { value: 'cologne', label: 'Cologne' },
                  { value: 'body spray', label: 'Body Spray' },
                ]}
              />
              <FieldError errors={displayErrors} field="type" />
            </div>
            <div className=" border border-nature-olive/20 p-2.5 rounded-lg">
              <span className="text-nature-olive text-[10px] font-semibold uppercase tracking-wider block mb-1">Gender *</span>
              <Dropdown
                value={form.gender}
                onChange={(v) => update('gender', v)}
                options={[
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                  { value: 'unisex', label: 'Unisex' },
                ]}
              />
              <FieldError errors={displayErrors} field="gender" />
            </div>
            <div className=" border border-nature-olive/20 p-2.5 rounded-lg">
              <span className="text-nature-olive text-[10px] font-semibold uppercase tracking-wider block mb-1">Season</span>
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
              <FieldError errors={displayErrors} field="season" />
            </div>
          </div>

          <div className=" border border-nature-olive/20 p-3 rounded-lg">
            <span className="text-nature-olive text-[10px] font-semibold uppercase tracking-wider block mb-1">Description</span>
            <textarea
              rows={2}
              maxLength={500}
              value={form.description}
              onChange={e => update('description', e.target.value)}
              className={`w-full bg-nature-card border border-nature-olive/20 focus:border-nature-olive/60 rounded-lg px-3 py-2 text-sm outline-none resize-none transition-colors ${HIDE_SCROLLBAR}`}
            />
            <FieldError errors={displayErrors} field="description" />
          </div>

          {/* Scent notes pyramid: top / heart / base */}
          <div>
            <h3 className="text-xs font-bold text-nature-olive uppercase tracking-wider mb-2">Olfactory Scent Pyramid</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {renderNoteSelector('Top Notes', 'top_notes')}
              {renderNoteSelector('Heart Notes', 'heart_notes')}
              {renderNoteSelector('Base Notes', 'base_notes')}
            </div>
          </div>

          {/* Size/price/stock variants — SKU shown as a live preview, not typed */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-nature-olive uppercase tracking-wider">Available Variants</h3>
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
            <FieldError errors={displayErrors} field="variants" />
            <div className="space-y-2">
              {form.variants.map((v, i) => {
                const skuPreview = slugPreview ? `${slugPreview}-${slugify(v.size)}` : null;
                return (
                  <div key={v.size} className=" border border-nature-olive/15 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-nature-olive font-bold text-sm">{v.size}</span>
                      <button type="button" onClick={() => removeVariant(i)} className="text-red-500 hover:text-red-700">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <span className="text-[10px] text-nature-muted block mb-0.5">Cost</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={v.original_price}
                          onChange={e => handleWholeNumberChange(i, 'original_price', e.target.value)}
                          onBlur={e => handlePriceBlur(i, 'original_price', e.target.value)}
                          className="bg-nature-card border border-nature-olive/20 focus:border-nature-olive/60 rounded px-2 py-1.5 text-xs outline-none w-full transition-colors"
                        />
                        <FieldError errors={displayErrors} field={`variants.${i}.original_price`} />
                      </div>
                      <div>
                        <span className="text-[10px] text-nature-muted block mb-0.5">Selling Price</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={v.sale_price}
                          onChange={e => handleWholeNumberChange(i, 'sale_price', e.target.value)}
                          onBlur={e => handlePriceBlur(i, 'sale_price', e.target.value)}
                          className="bg-nature-card border border-nature-olive/20 focus:border-nature-olive/60 rounded px-2 py-1.5 text-xs outline-none w-full transition-colors"
                        />
                        <FieldError errors={displayErrors} field={`variants.${i}.sale_price`} />
                      </div>
                      <div>
                        <span className="text-[10px] text-nature-muted block mb-0.5">Stock</span>
                        <input type="number" value={v.stock_quantity} onChange={e => updateVariant(i, 'stock_quantity', e.target.value)} className="bg-nature-card border border-nature-olive/20 focus:border-nature-olive/60 rounded px-2 py-1.5 text-xs outline-none w-full transition-colors" />
                        <FieldError errors={displayErrors} field={`variants.${i}.stock_quantity`} />
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-nature-muted block mb-0.5">SKU (auto-generated)</span>
                      <span className="font-mono text-xs text-nature-dark">
                        {skuPreview || <span className="text-nature-muted italic font-sans">Set brand + name first</span>}
                      </span>
                    </div>
                  </div>
                );
              })}
              {form.variants.length === 0 && <p className="text-xs text-nature-muted italic py-2 text-center">No sizes selected yet. Use dropdown above to add one.</p>}
            </div>
          </div>

          {error && <p className="text-red-600 text-sm bg-red-50 border rounded px-3 py-2">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onCancel} className="flex-1 border border-nature-olive/30 text-nature-dark hover:border-nature-olive hover:text-nature-olive transition-colors py-2 rounded-xl text-sm">Cancel</button>
            <button type="submit" disabled={saving || uploading} className="flex-1 bg-nature-olive hover:bg-nature-olive-dark transition-colors text-white py-2 rounded-xl text-sm font-semibold disabled:opacity-60">{saving ? 'SAVING...' : 'SAVE PRODUCT'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}