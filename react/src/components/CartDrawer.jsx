import { Link } from 'react-router-dom';
import { X, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const formatMMK = (amount) =>
  new Intl.NumberFormat('en-MM', {
    style: 'currency',
    currency: 'MMK',
    minimumFractionDigits: 0,
  }).format(amount);

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
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white z-50 shadow-2xl
        transform transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-nature-border">
          <h2 className="font-serif text-xl text-nature-dark">
            Your Bag {itemCount > 0 && `(${itemCount})`}
          </h2>
          <button onClick={closeCart} className="text-nature-muted hover:text-nature-dark">
            <X size={22} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3">
              <ShoppingBag className="w-12 h-12 text-nature-sand" />
              <p className="text-nature-muted text-sm">Your bag is empty.</p>
            </div>
          ) : (
            items.map((item) => {
              const variant = item.product_variant;
              if (!variant) return null;
              return (
                <div key={item.id} className="flex gap-4 border-b border-nature-border/60 pb-4">
                  <img
                    src={variant.product?.image_url}
                    alt={variant.product?.name}
                    className="w-16 h-16 object-cover rounded-lg border border-nature-border"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-nature-dark truncate">
                      {variant.product?.name}
                    </p>
                    <p className="text-xs text-nature-muted mt-0.5">
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
          <div className="border-t border-nature-border px-6 py-5 space-y-3">
            <div className="flex justify-between text-sm font-semibold">
              <span>Subtotal</span>
              <span className="text-nature-olive font-serif text-lg">{formatMMK(total)}</span>
            </div>
            <Link
              to="/cart"
              onClick={closeCart}
              className="block w-full text-center bg-nature-olive hover:bg-nature-olive-dark text-white py-3 rounded-xl text-sm font-medium tracking-wide transition-colors"
            >
              VIEW CART
            </Link>
            <Link
              to="/checkout"
              onClick={closeCart}
              className="block w-full text-center border border-nature-olive text-nature-olive py-3 rounded-xl text-sm font-medium tracking-wide hover:bg-nature-sage/10 transition-colors"
            >
              CHECKOUT
            </Link>
          </div>
        )}
      </div>
    </>
  );
}