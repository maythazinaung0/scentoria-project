import { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Trash2, ShoppingBag, Package } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const formatMMK = (amount) =>
  new Intl.NumberFormat('en-MM', {
    style: 'currency',
    currency: 'MMK',
    minimumFractionDigits: 0,
  }).format(amount);

// Same visual language as ProductDetailPage / CartPage
const panelClass = "bg-white/45 backdrop-blur-xl border border-white/60 rounded-lg shadow-[0_4px_24px_-12px_rgba(44,53,39,0.15)]";
const labelClass = "text-[11px] uppercase tracking-[0.25em] text-nature-olive font-medium";

function CartItemImage({ src, alt }) {
  const [imgError, setImgError] = useState(false);
  const showImage = src && !imgError;

  return (
    <div className="w-16 h-16 flex-shrink-0 rounded-lg border border-nature-border/60 bg-white/50 overflow-hidden flex items-center justify-center">
      {showImage ? (
        <img
          src={src}
          alt={alt}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <Package className="w-6 h-6 text-nature-sand" strokeWidth={1} />
      )}
    </div>
  );
}

export default function CartDrawer() {
  const { items, isOpen, closeCart } = useCart();

  const itemCount = items.reduce((acc, i) => acc + i.quantity, 0);
  const total = items.reduce(
    (acc, i) => acc + (i.product_variant?.sale_price ?? 0) * i.quantity,
    0
  );

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-nature-bg z-50 shadow-2xl
        transform transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-nature-border/70">
          <div>
            <p className={labelClass}>{itemCount > 0 ? `${itemCount} Item${itemCount !== 1 ? 's' : ''}` : 'Empty'}</p>
            <h2 className="font-serif text-2xl text-nature-dark leading-tight mt-0.5">Your Cart</h2>
          </div>
          <button onClick={closeCart} className="text-nature-muted hover:text-nature-olive transition-colors">
            <X size={22} strokeWidth={1.5} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3">
              <ShoppingBag className="w-10 h-10 text-nature-sand" strokeWidth={1} />
              <p className="text-nature-muted text-sm">Your cart is empty.</p>
            </div>
          ) : (
            items.map((item) => {
              const variant = item.product_variant;
              if (!variant) return null;
              return (
                <div key={item.id} className={`${panelClass} flex gap-4 p-3`}>
                  <CartItemImage src={variant.product?.image_url} alt={variant.product?.name} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-nature-dark truncate">
                      {variant.product?.name}
                    </p>
                    <p className="text-nature-muted text-xs mt-0.5">
                      {variant.size} · Qty {item.quantity}
                    </p>
                    <p className="text-nature-olive text-sm font-semibold mt-1">
                      {formatMMK(variant.sale_price * item.quantity)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className={`${panelClass} mx-6 mb-6 p-5 space-y-4`}>
            <div className="flex justify-between items-baseline pb-4 border-b border-nature-border/50">
              <span className={labelClass}>Subtotal</span>
              <span className="text-nature-olive font-serif text-2xl">{formatMMK(total)}</span>
            </div>
            <Link
              to="/cart"
              onClick={closeCart}
              className="block w-full text-center bg-nature-olive hover:bg-nature-olive-dark text-white py-3 rounded-md text-xs font-medium tracking-[0.15em] uppercase transition-colors"
            >
              View Cart
            </Link>
            <Link
              to="/checkout"
              onClick={closeCart}
              className="block w-full text-center border border-nature-olive text-nature-olive py-3 rounded-md text-xs font-medium tracking-[0.15em] uppercase hover:bg-nature-sage/10 transition-colors"
            >
              Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  );
}