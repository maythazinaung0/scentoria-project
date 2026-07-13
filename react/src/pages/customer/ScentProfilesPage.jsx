import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Package } from 'lucide-react';
import SizeBanner from '../../components/SizeBanner';
import Pagination from '../../components/Pagination';
import api from '../../api';

const PER_PAGE_OPTIONS = [8, 12, 16, 24];

function ScentImage({ src, alt }) {
    const [imgError, setImgError] = useState(false);
    const showImage = src && !imgError;

    return (
        <div className="aspect-[3/4] w-full overflow-hidden bg-nature-sand/20">
            {showImage ? (
                <img
                    src={src}
                    alt={alt}
                    onError={() => setImgError(true)}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-6 h-6 text-nature-sand" strokeWidth={1} />
                </div>
            )}
        </div>
    );
}

export default function ScentProfilesPage() {
    const [scents, setScents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [perPage, setPerPage] = useState(12);
    const [page, setPage] = useState(1);

    useEffect(() => {
        async function load() {
            try {
                const { data } = await api.get('/scents');
                setScents(data ?? []);
            } catch (err) {
                console.error('Failed to load scent profiles:', err);
                setScents([]);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    // Reset to page 1 whenever the page size changes, so the user
    // is never stranded on an out-of-range page.
    useEffect(() => {
        setPage(1);
    }, [perPage]);

    const totalPages = Math.max(1, Math.ceil(scents.length / perPage));
    const clampedPage = Math.min(page, totalPages);
    const visible = useMemo(() => {
        const start = (clampedPage - 1) * perPage;
        return scents.slice(start, start + perPage);
    }, [scents, clampedPage, perPage]);

    return (
        <div className="min-h-screen bg-nature-bg">

            {/* --- EDITORIAL HEADER --- */}
            <div className="pt-24 pb-14 px-6 text-center flex flex-col items-center">
                <p className="text-[11px] tracking-[0.35em] uppercase text-nature-olive mb-4">
                    Knowledge & Discovery
                </p>
                <h1 className="font-serif text-5xl sm:text-6xl text-nature-dark mb-5">
                    Scent Profiles
                </h1>
                <p className="text-nature-muted max-w-md leading-relaxed text-sm">
                    Every fragrance belongs to a family. Understanding these families
                    helps you discover perfumes that resonate with your personal style.
                </p>
            </div>

            <div className="max-w-7xl mx-auto px-6 pb-24">

                {/* --- TOOLBAR --- */}
                <div className="flex flex-wrap items-center justify-between gap-4 py-5 border-y border-nature-border/60 mb-12">
                    <p className="text-nature-muted text-xs uppercase tracking-wider">
                        {scents.length} Scent Profile{scents.length !== 1 ? 's' : ''}
                    </p>

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

                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="aspect-[3/4] bg-nature-sand/20" />
                                <div className="h-4 w-1/2 bg-nature-sand/20 rounded mt-3" />
                                <div className="h-3 w-full bg-nature-sand/20 rounded mt-2" />
                            </div>
                        ))}
                    </div>
                ) : scents.length === 0 ? (
                    <div className="text-center py-24">
                        <p className="font-serif text-xl text-nature-dark mb-2">No scent profiles yet</p>
                        <p className="text-nature-muted text-sm">Check back soon as our collection grows.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
                            {visible.map((scent) => (
                                <Link
                                    key={scent.id}
                                    to={`/scents/${scent.id}`}
                                    className="group flex flex-col"
                                >
                                    <ScentImage src={scent.image_url} alt={scent.name} />

                                    <div className="flex items-start justify-between gap-2 mt-4">
                                        <h3 className="font-serif text-lg text-nature-dark leading-tight">
                                            {scent.name}
                                        </h3>
                                        <ArrowRight className="w-3.5 h-3.5 text-nature-muted mt-1.5 flex-shrink-0 transition-transform group-hover:translate-x-1 group-hover:text-nature-olive" strokeWidth={1.5} />
                                    </div>

                                    {scent.description && (
                                        <p className="text-nature-muted text-xs leading-relaxed mt-1.5 line-clamp-2">
                                            {scent.description}
                                        </p>
                                    )}

                                    {scent.tags && scent.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mt-3">
                                            {scent.tags.slice(0, 2).map((tag, i) => (
                                                <span
                                                    key={i}
                                                    className="px-2.5 py-1 bg-nature-sage/20 text-nature-olive text-[9px] rounded-full uppercase tracking-wider"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                            {scent.tags.length > 2 && (
                                                <span className="px-2.5 py-1 text-nature-muted text-[9px] uppercase tracking-wider">
                                                    +{scent.tags.length - 2}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </Link>
                            ))}
                        </div>

                        <div className="mt-16">
                            <Pagination page={clampedPage} totalPages={totalPages} onChange={setPage} />
                        </div>
                    </>
                )}
            </div>

            <SizeBanner />
        </div>
    );
}