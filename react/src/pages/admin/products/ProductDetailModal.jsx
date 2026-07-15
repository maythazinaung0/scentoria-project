import { useState } from 'react';
import { X, Package } from 'lucide-react';
import { formatMMK } from '../../../utils/currency';
import { HIDE_SCROLLBAR } from '../../../utils/ui';

export default function ProductDetailModal({ product, onClose, onEdit, deleting }) {
  const [imgError, setImgError] = useState(false);
  const showImage = product.image_url && !imgError;

  const topList = (product.notes ?? []).filter(n => n.pivot?.type === 'top').map(n => n.name).join(', ') || '—';
  const heartList = (product.notes ?? []).filter(n => n.pivot?.type === 'heart').map(n => n.name).join(', ') || '—';
  const baseList = (product.notes ?? []).filter(n => n.pivot?.type === 'base').map(n => n.name).join(', ') || '—';
  const status = product.status === 'inactive' ? 'inactive' : 'active';

  return (
    <div className="fixed inset-0 bg-nature-dark/85 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-nature-card border border-nature-olive/20 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col animate-fadeIn overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Sticky header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-nature-olive/20 flex-shrink-0">
          <h2 className="font-serif text-xl">Product Details</h2>
          <button onClick={onClose} className="text-nature-muted hover:text-nature-olive transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className={`flex-1 overflow-y-auto ${HIDE_SCROLLBAR} px-6 py-5 space-y-5`}>
          <div className="flex gap-4 items-center bg-nature-bg p-3 rounded-xl border border-nature-olive/20">
            {showImage ? (
              <img
                src={product.image_url}
                alt={product.name}
                onError={() => setImgError(true)}
                className="w-24 h-24 rounded-xl object-cover border border-nature-olive/20 flex-shrink-0"
              />
            ) : (
              <div className="w-24 h-24 rounded-xl border border-nature-olive/20 bg-gradient-to-br from-nature-olive/15 via-nature-sage/25 to-neutral-100 flex items-center justify-center flex-shrink-0">
                <Package className="w-7 h-7 text-nature-olive/35" strokeWidth={1} />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-serif text-xl font-medium break-words">{product.name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize flex-shrink-0 ${status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'}`}>
                  {status}
                </span>
              </div>
              <p className="text-nature-olive font-semibold break-words">{product.brand?.name ?? 'Unknown Brand'}</p>
              <p className="text-xs text-nature-muted mt-1 capitalize">{product.type} &bull; {product.gender}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-nature-bg border border-nature-olive/15 p-2.5 rounded-lg">
              <span className="text-nature-olive text-[10px] font-semibold uppercase tracking-wider block mb-0.5">Scent Family</span>
              <span className="font-medium text-sm text-nature-dark break-words">{product.scent?.name ?? '—'}</span>
            </div>
            <div className="bg-nature-bg border border-nature-olive/15 p-2.5 rounded-lg">
              <span className="text-nature-olive text-[10px] font-semibold uppercase tracking-wider block mb-0.5">Season Focus</span>
              <span className="font-medium text-sm text-nature-dark capitalize">{product.season}</span>
            </div>
            <div className="col-span-2 bg-nature-bg border border-nature-olive/15 p-2.5 rounded-lg">
              <span className="text-nature-olive text-[10px] font-semibold uppercase tracking-wider block mb-0.5">Slug Reference</span>
              <span className="font-mono text-xs text-nature-dark select-all break-all">{product.slug}</span>
            </div>
            {product.description && (
              <div className="col-span-2 bg-nature-bg border border-nature-olive/15 p-3 rounded-lg">
                <span className="text-nature-olive text-[10px] font-semibold uppercase tracking-wider block mb-1">Description</span>
                <p className="text-nature-dark leading-relaxed font-normal break-words whitespace-pre-wrap">{product.description}</p>
              </div>
            )}
          </div>

          <div className="bg-nature-bg border border-nature-olive/20 rounded-xl p-3 space-y-2 text-xs">
            <h4 className="font-bold text-nature-olive uppercase text-[10px] tracking-wider">Olfactory Scent Pyramid</h4>
            <div className="space-y-1.5 pt-1">
              <div className="break-words"><span className="font-medium text-nature-olive">Top Notes:</span> <span className="text-nature-dark">{topList}</span></div>
              <div className="break-words"><span className="font-medium text-nature-olive">Heart Notes:</span> <span className="text-nature-dark">{heartList}</span></div>
              <div className="break-words"><span className="font-medium text-nature-olive">Base Notes:</span> <span className="text-nature-dark">{baseList}</span></div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-nature-olive uppercase tracking-wider">Available Variants</h4>
            <div className="space-y-2">
              {product.variants?.map(v => {
                const profit = v.sale_price - v.original_price;
                return (
                  <div key={v.id} className="grid grid-cols-4 items-center bg-nature-bg border border-nature-olive/15 rounded-xl p-3 text-xs gap-2">
                    <div className="min-w-0">
                      <span className="text-nature-olive font-bold text-sm block">{v.size}</span>
                      <span className="text-[10px] text-nature-muted font-mono block truncate">{v.sku || 'No SKU'}</span>
                    </div>
                    <div className="text-center"><span className="text-nature-olive text-[10px] block">Stock</span><span className="font-semibold text-nature-dark">{v.stock_quantity} units</span></div>
                    <div className="text-center"><span className="text-nature-olive text-[10px] block">Price (Sale)</span><span className="font-semibold text-nature-olive">{formatMMK(v.sale_price)}</span></div>
                    <div className="text-right"><span className="text-nature-olive text-[10px] block">Est. Profit</span><span className={`font-semibold ${profit >= 0 ? 'text-nature-olive' : 'text-red-600'}`}>{formatMMK(profit)}</span></div>
                  </div>
                );
              })}
              {(!product.variants || product.variants.length === 0) && <p className="text-xs text-center text-nature-muted italic">No variants registered.</p>}
            </div>
          </div>
        </div>

        {/* Sticky footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-nature-olive/20 flex-shrink-0">
          <button type="button" onClick={onClose} className="flex-1 border border-nature-olive/30 text-nature-dark hover:border-nature-olive hover:text-nature-olive transition-colors py-2 rounded-xl text-sm">Close</button>
          <button type="button" onClick={() => onEdit(product)} className="flex-1 bg-nature-olive hover:bg-nature-olive-dark transition-colors text-white py-2 rounded-xl text-sm font-semibold">Edit Product</button>
        </div>
      </div>
    </div>
  );
}