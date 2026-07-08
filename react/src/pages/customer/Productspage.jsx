import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import ProductCard from '../../components/ProductCard';
import { theme } from '../../theme';
import SizeBanner from '../../components/SizeBanner';

export default function ProductsPage({ products = [] }) {
    const { searchQuery } = useOutletContext();
    const [selectedBrand, setSelectedBrand] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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

            {/* Full-width container for the border line */}
            <div className="w-full border-b border-[#E5E7E2] mb-8">
                {/* Centered container for the button alignment */}
                <div className="max-w-7xl mx-auto px-4 py-7 relative">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className={`text-[11px] px-6 py-2 rounded border transition-colors tracking-wider flex items-center gap-3 ${selectedBrand
                                ? 'bg-[var(--color-accent)] border-[var(--color-accent)] text-white'
                                : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-accent)]'
                            }`}
                    >
                        {selectedBrand ? selectedBrand.toUpperCase() : 'ALL'}
                        <span className="text-[10px]">▼</span>
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                        <div className="absolute left-4 mt-2 w-48 bg-white border border-[var(--color-border)] rounded shadow-xl z-50">
                            <button
                                className="block w-full text-left px-4 py-3 text-[11px] hover:bg-[var(--color-accent)] hover:text-white uppercase tracking-wider transition-colors"
                                onClick={() => { setSelectedBrand(''); setIsDropdownOpen(false); }}
                            >
                                All
                            </button>
                            {brands.map(b => (
                                <button
                                    key={b}
                                    className="block w-full text-left px-4 py-3 text-[11px] hover:bg-[var(--color-accent)] hover:text-white uppercase tracking-wider transition-colors border-t border-gray-100"
                                    onClick={() => { setSelectedBrand(b); setIsDropdownOpen(false); }}
                                >
                                    {b}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Products Section */}
            <div className="max-w-7xl mx-auto px-4 pb-24">
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