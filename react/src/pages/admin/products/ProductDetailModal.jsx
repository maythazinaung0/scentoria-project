import { X } from 'lucide-react';
import { formatMMK } from '../../../utils/currency';
import { HIDE_SCROLLBAR } from '../../../utils/ui';

// ---------------------------------------------------------------------------
// Read-only product detail modal (shown when a table row is clicked)
// ---------------------------------------------------------------------------
export default function ProductDetailModal({ product, onClose, onEdit, deleting }) {
  const topList = (product.notes ?? []).filter(n => n.pivot?.type === 'top').map(n => n.name).join(', ') || '—';
  const heartList = (product.notes ?? []).filter(n => n.pivot?.type === 'heart').map(n => n.name).join(', ') || '—';
  const baseList = (product.notes ?? []).filter(n => n.pivot?.type === 'base').map(n => n.name).join(', ') || '—';

  return (
    <div className="fixed inset-0 bg-nature-dark/85 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className={`bg-nature-card border border-nature-border rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto ${HIDE_SCROLLBAR} space-y-5 animate-fadeIn`} onClick={e => e.stopPropagation()}>
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