import React from 'react';
import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
    if (!product) return null;

    return (
        <div className="relative aspect-[3/4] overflow-hidden bg-[var(--color-bg-muted)] group cursor-pointer">
            {/* ပုံရိပ် */}
            <img
                src={product.image_url || 'https://via.placeholder.com/300x400'}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />

            {/* ပုံမှန်အခြေအနေ */}
            <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/70 via-black/30 to-transparent transition-transform duration-500 group-hover:-translate-y-20">
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/80 font-medium mb-1">
                    {product.brand?.name || 'Scentoria'}
                </p>
                <h3 className="font-serif text-lg text-white">{product.name}</h3>
                <p className="text-xs text-white/70 mt-1">{product.scent?.name}</p>
            </div>

            {/* Hover အခြေအနေ */}
            <div className="absolute bottom-0 left-0 w-full p-6 bg-[var(--color-bg-base)] translate-y-full transition-transform duration-500 group-hover:translate-y-0">
                <h3 className="font-serif text-lg text-[var(--color-text-primary)] mb-1">{product.name}</h3>
                <p className="text-xs text-[var(--color-text-muted)] mb-3">{product.scent?.name}</p>

                {/* ဈေးနှုန်းအစား အကြံပြုလိုသည့် စာသား */}
                <p className="text-sm font-medium text-[var(--color-text-primary)] mb-4 italic opacity-80">
                    Discover your signature scent
                </p>

                <Link
                    to={`/products/${product.id}`}
                    className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] hover:text-[var(--color-accent)] transition-colors border-b border-transparent hover:border-[var(--color-accent)] pb-1"
                >
                    Explore →
                </Link>
            </div>
        </div>
    );
}