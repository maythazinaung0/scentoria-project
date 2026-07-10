import React from 'react';
import ProductCard from '../../components/ProductCard';
import SizeBanner from '../../components/SizeBanner';
import { theme } from '../../theme';

export default function ProductsPage({ products = [], scents = [] }) {
    const safeProducts = Array.isArray(products) ? products : [];
    const safeScents = Array.isArray(scents) ? scents : [];

    return (
        <div
            className="min-h-screen pt-12"
            style={{ backgroundColor: theme.colors.bgBase, color: theme.colors.textPrimary }}
        >
            {/* Header */}
            <div className="py-12 px-4 text-center">
                <p className="text-[11px] tracking-[0.3em] uppercase mb-4" style={{ color: theme.colors.accent }}>
                    Our Collection
                </p>
                <h1 className="font-serif text-4xl">All Fragrances</h1>

                <p className="mt-4 text-xs uppercase tracking-[0.2em]" style={{ color: theme.colors.textMuted }}>
                    A curated selection of premium inspired fragrances for every personality.
                </p>
            </div>

            {/* Content */}
            <div className="py-6">
                {safeScents.map((scent) => {
                    const associatedProducts = safeProducts.filter(
                        (p) => p.scent_id === scent.id || p.scent_name === scent.name
                    );

                    if (associatedProducts.length === 0) return null;

                    return (
                        <section key={scent.id} className="py-8">
                            {/* Scent Title Section */}
                            <div className="text-center mb-8">
                                <h2 className="font-serif text-2xl mb-2">{scent.name}</h2>

                            </div>

                            {/* Scrollable Container */}
                            <div className="flex overflow-x-auto gap-6 pb-6 px-6 scrollbar-hide max-w-[1280px] mx-auto">
                                {associatedProducts.map((product) => (
                                    <div key={product.id} className="min-w-[200px] max-w-[200px] md:min-w-[240px] md:max-w-[240px] flex-shrink-0">
                                        <ProductCard product={product} />
                                    </div>
                                ))}
                            </div>

                            {/* Decorative Line */}
                            <div
                                className="w-full border-b mt-4"
                                style={{ borderColor: theme.colors.borderSubtle }}
                            ></div>
                        </section>
                    );
                })}
            </div>
            <SizeBanner />
        </div>
    );
}