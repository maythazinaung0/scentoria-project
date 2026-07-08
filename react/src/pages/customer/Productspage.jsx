import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import ProductCard from '../../components/ProductCard';
import { theme } from '../../theme';
import SizeBanner from '../../components/SizeBanner';

export default function ProductsPage({ products = [] }) {
    const { searchQuery } = useOutletContext();
    const [selectedBrand, setSelectedBrand] = useState('');

    const safeProducts = Array.isArray(products) ? products : [];
    const brands = [...new Set(safeProducts.map(p => p.brand?.name || p.brand))].filter(Boolean).sort();

    const filtered = safeProducts.filter(p => {
        const brandName = (p.brand?.name || p.brand || '').toString().toLowerCase();
        const productName = (p.name || '').toString().toLowerCase();

        let scentString = '';
        if (p.scent_profile?.name) scentString += p.scent_profile.name + ' ';
        if (p.scent) scentString += (typeof p.scent === 'object' ? p.scent.name || '' : p.scent) + ' ';

        const scentName = scentString.toLowerCase();
        const q = (searchQuery ?? '').toLowerCase();

        const matchesBrand = !selectedBrand || brandName === selectedBrand.toLowerCase();

        const matchesSearch = !q ||
            brandName.includes(q) ||
            productName.includes(q) ||
            scentName.includes(q);

        return matchesBrand && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-[var(--color-text-primary)] pt-24">
            {/* Header */}
            <div className="py-14 px-4 text-center border-b border-[#E5E7E2]">
                <p className="text-[var(--color-accent)] text-[11px] tracking-[0.3em] uppercase mb-2">Our Collection</p>
                <h1 className="font-serif text-4xl">All Fragrances</h1>
            </div>

            <div className="max-w-7xl mx-auto px-4 pb-24">
                {/* Brand Filters */}
                <div className="flex flex-wrap gap-2 py-7 border-b border-[#E5E7E2] mb-8">
                    <button onClick={() => setSelectedBrand('')}
                        className={`text-[11px] px-4 py-1.5 rounded border transition-colors tracking-wider ${!selectedBrand ? 'bg-[var(--color-accent)] border-[var(--color-accent)] text-white' : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-accent)]'
                            }`}>
                        ALL
                    </button>
                    {brands.map(b => (
                        <button key={b} onClick={() => setSelectedBrand(b)}
                            className={`text-[11px] px-4 py-1.5 rounded border transition-colors tracking-wider ${selectedBrand === b ? 'bg-[var(--color-accent)] border-[var(--color-accent)] text-white' : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-accent)]'
                                }`}>
                            {b.toUpperCase()}
                        </button>
                    ))}
                </div>

                {/* Products Section */}
                <section className="py-12">
                    <div className="text-center mb-12">
                        <p className="text-[var(--color-accent)] text-[11px] tracking-[0.3em] uppercase mb-2">
                            {searchQuery ? `Search: "${searchQuery}"` : 'Curated Selection'}
                        </p>
                        <h2 className="font-serif text-3xl">
                            {searchQuery ? 'Fragrances Found' : 'Featured Fragrances'}
                        </h2>
                    </div>

                    {filtered.length === 0 ? (
                        <div className="text-center py-20 text-[var(--color-text-muted)]">
                            <p>Currently We Don't Have The Product That You Search</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {filtered.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}
                </section>

            </div>
            <SizeBanner />
        </div>
    );
}