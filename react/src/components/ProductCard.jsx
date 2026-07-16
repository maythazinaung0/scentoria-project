import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';

const formatMMK = (price) => {
    return new Intl.NumberFormat('en-US').format(price || 0) + ' MMK';
};

export default function ProductCard({ product }) {
    const [imgError, setImgError] = useState(false);

    if (!product) return null;

    const salePrice = product.variants && product.variants.length > 0
        ? product.variants[0].sale_price
        : null;

    const prices = product.variants?.map(v => v.sale_price).filter(Boolean) || [];
    const minPrice = prices.length ? Math.min(...prices) : null;

    const showImage = product.image_url && !imgError;
    return (
        <div className="relative aspect-[3/4] overflow-hidden bg-nature-sand/20 group cursor-pointer">
            {showImage ? (
                <img
                    src={product.image_url}
                    alt={product.name}
                    onError={() => setImgError(true)}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-8 h-8 text-nature-sand" strokeWidth={1} />
                </div>
            )}

            <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/70 via-black/30 to-transparent transition-transform duration-500 group-hover:-translate-y-20">
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/80 font-medium mb-1">
                    {product.brand?.name || 'Scentoria'}
                </p>
                <h3 className="font-serif text-lg text-white">{product.name}</h3>
                <p className="text-xs text-white/70 mt-1">{product.scent?.name}</p>
            </div>

            <div className="absolute bottom-0 left-0 w-full p-6 bg-nature-bg translate-y-full transition-transform duration-500 group-hover:translate-y-0">
                <h3 className="font-serif text-lg text-nature-dark mb-1">{product.name}</h3>
                <p className="text-xs text-nature-muted mb-3">{product.scent?.name}</p>

                <div className="mb-4">
                    <p className="text-xs text-nature-muted mb-1">
                        {product.variants?.map(v => v.size).join(' · ')}
                    </p>
                    <p className="text-sm font-medium text-nature-dark">
                        {minPrice ? `From ${formatMMK(minPrice)}` : 'Contact for price'}
                    </p>
                </div>

                <Link
                    to={`/products/${product.slug}`}
                    className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-nature-dark hover:text-nature-olive transition-colors border-b border-transparent hover:border-nature-olive pb-1"
                >
                    Explore →
                </Link>
            </div>
        </div>
    );
}