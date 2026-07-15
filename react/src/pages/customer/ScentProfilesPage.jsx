import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Package } from 'lucide-react';
import SizeBanner from '../../components/SizeBanner';
import Pagination from '../../components/Pagination';
import api from '../../api';

const PER_PAGE_OPTIONS = [8, 12, 16, 24];

function ScentTile({ scent }) {
    const [imgError, setImgError] = useState(false);
    const showImage = scent.image_url && !imgError;

    return (
        <Link
            to={`/scents/${scent.id}`}
            className="group relative block aspect-[3/4] overflow-hidden rounded-sm bg-nature-sand/20"
        >
            {showImage ? (
                <img
                    src={scent.image_url}
                    alt={scent.name}
                    onError={() => setImgError(true)}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-8 h-8 text-nature-sand" strokeWidth={1} />
                </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="text-white font-serif text-lg leading-tight">
                    {scent.name}
                </p>
                <span className="block w-6 h-px bg-white/50 mt-2 transition-all duration-500 group-hover:w-10 group-hover:bg-white" />
                {scent.description && (
                    <p className="text-white/75 text-xs leading-relaxed mt-2 line-clamp-2">
                        {scent.description}
                    </p>
                )}
                {scent.tags && scent.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {scent.tags.slice(0, 2).map((tag, i) => (
                            <span
                                key={i}
                                className="px-2.5 py-1 bg-white/15 backdrop-blur-sm text-white text-[9px] rounded-full uppercase tracking-wider"
                            >
                                {tag}
                            </span>
                        ))}
                        {scent.tags.length > 2 && (
                            <span className="px-2.5 py-1 text-white/70 text-[9px] uppercase tracking-wider">
                                +{scent.tags.length - 2}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </Link>
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

    useEffect(() => {
        setPage(1);
    }, [perPage]);

    const totalPages = Math.max(1, Math.ceil(scents.length / perPage));
    const clampedPage = Math.min(page, totalPages);
    const visible = useMemo(() => {
        const start = (clampedPage - 1) * perPage;
        return scents.slice(start, start + perPage);
    }, [scents, clampedPage, perPage]);

    const pageStart = (clampedPage - 1) * perPage;
    const rangeStart = scents.length === 0 ? 0 : pageStart + 1;
    const rangeEnd = Math.min(pageStart + perPage, scents.length);

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
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="aspect-[3/4] rounded-sm bg-nature-sand/20 animate-pulse" />
                        ))}
                    </div>
                ) : scents.length === 0 ? (
                    <div className="text-center py-24">
                        <p className="font-serif text-xl text-nature-dark mb-2">No scent profiles yet</p>
                        <p className="text-nature-muted text-sm">Check back soon as our collection grows.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {visible.map((scent) => (
                                <ScentTile key={scent.id} scent={scent} />
                            ))}
                        </div>

                        <div className="flex flex-col items-center gap-3 mt-16">
                            <Pagination page={clampedPage} totalPages={totalPages} onChange={setPage} />
                            <p className="text-nature-muted text-xs mt-2">
                                Showing {rangeStart}–{rangeEnd} of {scents.length}
                            </p>
                        </div>
                    </>
                )}
            </div>

            <SizeBanner />
        </div>
    );
}