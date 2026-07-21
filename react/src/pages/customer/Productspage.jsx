import React, { useEffect, useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '../../components/ProductCard';
import SizeBanner from '../../components/SizeBanner';
import Pagination from '../../components/Pagination';
import api from '../../api';

const PER_PAGE_OPTIONS = [8, 12, 24, 48];
const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
];

function getVariantPrice(product) {
    return product.variants && product.variants.length > 0
        ? (product.variants[0].sale_price ?? 0)
        : 0;
}


export default function ProductsPage() {
    const { searchQuery } = useOutletContext();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [sortBy, setSortBy] = useState('newest');
    const [perPage, setPerPage] = useState(8);
    const [page, setPage] = useState(1);

    useEffect(() => {
        async function load() {
            try {
                const res = await api.get('/products');
                setProducts(res.data ?? []);
            } catch (err) {
                console.error('Error fetching products:', err);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, []);

    const safeProducts = Array.isArray(products) ? products : [];

    const filtered = useMemo(() => {
        const q = (searchQuery ?? '').toLowerCase();

        const result = safeProducts.filter(p => {
            const brandName = (p.brand?.name || p.brand || '').toString().toLowerCase();
            const productName = (p.name || '').toString().toLowerCase();

            let scentString = '';
            if (p.scent_profile?.name) scentString += p.scent_profile.name + ' ';
            if (p.scent) scentString += (typeof p.scent === 'object' ? p.scent.name || '' : p.scent) + ' ';
            const scentName = scentString.toLowerCase();

            return !q || brandName.includes(q) || productName.includes(q) || scentName.includes(q);
        });

        const sorted = [...result];
        if (sortBy === 'price-asc') {
            sorted.sort((a, b) => getVariantPrice(a) - getVariantPrice(b));
        } else if (sortBy === 'price-desc') {
            sorted.sort((a, b) => getVariantPrice(b) - getVariantPrice(a));
        } else {
            sorted.sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
        }

        return sorted;
    }, [safeProducts, searchQuery, sortBy]);

    // Reset to page 1 whenever the result set or page size changes,
    // so the user is never stranded on an out-of-range page.
    useEffect(() => {
        setPage(1);
    }, [searchQuery, perPage, sortBy]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
    const clampedPage = Math.min(page, totalPages);
    const pageStart = (clampedPage - 1) * perPage;
    const visible = filtered.slice(pageStart, pageStart + perPage);

    const rangeStart = filtered.length === 0 ? 0 : pageStart + 1;
    const rangeEnd = Math.min(pageStart + perPage, filtered.length);

    return (
        <div className="min-h-screen bg-nature-bg text-nature-dark pt-24">

            {/* --- EDITORIAL HEADER --- */}
            <div className="max-w-4xl mx-auto px-6 pt-10 pb-16 text-center">
                <p className="text-[11px] tracking-[0.35em] uppercase text-nature-olive mb-4">Our Collection</p>
                <h1 className="font-serif text-5xl sm:text-6xl leading-tight">All Fragrances</h1>
                <p className="text-nature-muted text-sm mt-5 max-w-lg mx-auto leading-relaxed">
                    A curated house of scent — from bright, citrus openings to warm,
                    lingering bases. Explore the full collection below.
                </p>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">

                {/* --- TOOLBAR: result count, sort, per-page --- */}
                <div className="flex flex-wrap items-center justify-between gap-4 py-5 border-y border-nature-border/60 mb-12">
                    <p className="text-nature-muted text-xs uppercase tracking-wider">
                        {searchQuery ? (
                            <>Results for <span className="text-nature-dark font-medium">"{searchQuery}"</span> · {filtered.length} found</>
                        ) : (
                            <>{filtered.length} Fragrance{filtered.length !== 1 ? 's' : ''}</>
                        )}
                    </p>

                    <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 text-xs text-nature-muted">
                            <span className="uppercase tracking-wider">Sort</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-transparent border border-nature-border/70 rounded-md px-2.5 py-1.5 text-nature-dark text-xs outline-none focus:border-nature-olive transition-colors"
                            >
                                {SORT_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </label>

                        <label className="flex items-center gap-2 text-xs text-nature-muted">
                            <span className="uppercase tracking-wider">Show</span>
                            <select
                                value={perPage}
                                onChange={(e) => setPerPage(Number(e.target.value))}
                                className="bg-transparent border border-nature-border/70 rounded-md px-2.5 py-1.5 text-nature-dark text-xs outline-none focus:border-nature-olive transition-colors"
                            >
                                {PER_PAGE_OPTIONS.map(n => (
                                    <option key={n} value={n}>{n} per page</option>
                                ))}
                            </select>
                        </label>
                    </div>
                </div>

                {/* --- PRODUCT GRID --- */}
                {loading ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="aspect-[3/4] bg-nature-sand/20 rounded-sm animate-pulse" />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-24">
                        <p className="font-serif text-xl text-nature-dark mb-2">No fragrances found</p>
                        <p className="text-nature-muted text-sm">
                            Try a different search term, or browse the full collection.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {visible.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>

                        <div className="flex flex-col items-center gap-3 mt-16">
                            <Pagination page={clampedPage} totalPages={totalPages} onChange={setPage} />
                            <p className="text-nature-muted text-xs mt-2">
                                Showing {rangeStart}–{rangeEnd} of {filtered.length}
                            </p>
                        </div>
                    </>
                )}
            </div>

            <SizeBanner />
        </div>
    );
}