import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Package } from 'lucide-react';
import ProductCard from '../../components/ProductCard';
import SizeBanner from '../../components/SizeBanner';
import api from '../../api';

const HERO_IMAGES = [
    'https://images.pexels.com/photos/15539722/pexels-photo-15539722.png',
    'https://images.pexels.com/photos/1190829/pexels-photo-1190829.jpeg?auto=compress&cs=tinysrgb&w=1400',
];

const STATEMENT_IMAGE =
    'https://images.pexels.com/photos/3059609/pexels-photo-3059609.jpeg?auto=compress&cs=tinysrgb&w=1600';

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

            {/* Gradient + label, same language as the featured fragrance cards */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="text-white font-serif text-lg leading-tight">
                    {scent.name}
                </p>
                <span className="block w-6 h-px bg-white/50 mt-2 transition-all duration-500 group-hover:w-10 group-hover:bg-white" />
            </div>
        </Link>
    );
}

export default function HomePage() {
    const [heroIdx, setHeroIdx] = useState(0);
    const [products, setProducts] = useState([]);
    const [scents, setScents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const t = setInterval(() => setHeroIdx(i => (i + 1) % HERO_IMAGES.length), 6000);
        return () => clearInterval(t);
    }, []);

    useEffect(() => {
        async function load() {
            const [productsRes, scentsRes] = await Promise.allSettled([
                api.get('/products'),
                api.get('/scents'),
            ]);

            if (productsRes.status === 'fulfilled') {
                setProducts(productsRes.value.data ?? []);
            } else {
                console.error('Error fetching products:', productsRes.reason);
            }

            if (scentsRes.status === 'fulfilled') {
                setScents(scentsRes.value.data ?? []);
            } else {
                console.error('Error fetching scents:', scentsRes.reason);
            }

            setLoading(false);
        }

        load();
    }, []);

    // Show a generous first screenful, but never force a layout that assumes
    // a fixed count — the grid below wraps gracefully at any total.
    const visibleScents = scents.slice(0, 12);
    const hasMoreScents = scents.length > visibleScents.length;

    return (
        <div className="bg-nature-bg text-nature-dark">

            {/* --- HERO: full-bleed, cinematic --- */}
            <section className="relative h-[92vh] min-h-[560px] w-full overflow-hidden">
                {HERO_IMAGES.map((img, idx) => (
                    <div
                        key={img}
                        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-[2000ms] ease-in-out ${idx === heroIdx ? 'opacity-100' : 'opacity-0'}`}
                        style={{ backgroundImage: `url(${img})` }}
                    />
                ))}
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/25" />

                <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
                    <p className="text-[11px] tracking-[0.5em] uppercase text-white/80 mb-6">
                        The Art of Fragrance
                    </p>
                    <h1 className="font-serif text-white text-5xl sm:text-6xl md:text-7xl leading-[1.05] max-w-3xl">
                        Discover Your <span className="italic font-normal">Signature</span> Scent
                    </h1>
                    <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
                        <Link
                            to="/scents"
                            className="inline-flex items-center gap-2 px-9 py-3.5 bg-white text-nature-dark text-xs uppercase tracking-[0.2em] font-medium transition-all hover:bg-nature-olive hover:text-white"
                        >
                            Explore Scents <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                            to="/products"
                            className="inline-flex items-center gap-2 px-9 py-3.5 border border-white/80 text-white text-xs uppercase tracking-[0.2em] font-medium transition-all hover:bg-white hover:text-nature-dark"
                        >
                            Shop All
                        </Link>
                    </div>
                </div>

                {/* Hero progress indicator, replaces implicit dots with something quieter */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                    {HERO_IMAGES.map((_, idx) => (
                        <div key={idx} className={`h-[2px] rounded-full transition-all duration-500 ${idx === heroIdx ? 'w-8 bg-white' : 'w-3 bg-white/40'}`} />
                    ))}
                </div>
            </section>

            {/* --- SCENT PROFILES: dynamic, no fixed slot count --- */}
            {/* --- SCENT PROFILES: dynamic, no fixed slot count --- */}
            <section className="py-24 px-6 max-w-6xl mx-auto">
                <div className="text-center mb-14">
                    <p className="text-[11px] tracking-[0.35em] uppercase text-nature-olive mb-3">Fragrance Families</p>
                    <h2 className="font-serif text-3xl sm:text-4xl">Explore Scent Profiles</h2>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="aspect-[3/4] rounded-sm bg-nature-sand/20 animate-pulse" />
                        ))}
                    </div>
                ) : visibleScents.length === 0 ? (
                    <p className="text-nature-muted text-sm text-center py-6">
                        Scent profiles are coming soon.
                    </p>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {visibleScents.map(scent => (
                            <ScentTile key={scent.id} scent={scent} />
                        ))}
                    </div>
                )}

                {hasMoreScents && (
                    <div className="text-center pt-14">
                        <Link
                            to="/scents"
                            className="text-nature-dark text-xs font-medium tracking-[0.2em] uppercase transition-colors hover:text-nature-olive inline-flex items-center gap-2"
                        >
                            View All Scent Profiles <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                )}
            </section>

            {/* --- EDITORIAL STATEMENT: the page's one big moment --- */}
            <section className="relative h-[70vh] min-h-[420px] w-full overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${STATEMENT_IMAGE})` }}
                />
                <div className="absolute inset-0 bg-black/35" />
                <div className="relative h-full flex items-center px-6 sm:px-16">
                    <div className="max-w-xl">
                        <p className="text-[11px] tracking-[0.4em] uppercase text-white/75 mb-5">Our Philosophy</p>
                        <p className="font-serif text-white text-3xl sm:text-4xl leading-snug">
                            A fragrance is worn long after the room is empty —
                            <span className="italic"> it should be chosen with the same care.</span>
                        </p>
                        <Link
                            to="/about"
                            className="inline-flex items-center gap-2 mt-8 text-white text-xs uppercase tracking-[0.2em] font-medium border-b border-white/60 pb-1 hover:border-white transition-colors"
                        >
                            Our Story <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* --- FEATURED FRAGRANCES (kept as-is) --- */}
            <section className="py-24 px-6 max-w-7xl mx-auto">
                <div className="text-center mb-14">
                    <p className="text-[11px] tracking-[0.35em] uppercase text-nature-olive mb-3">New Arrivals</p>
                    <h2 className="font-serif text-3xl sm:text-4xl">Featured Fragrances</h2>
                </div>

                <div className="flex overflow-x-auto gap-6 pb-6 scrollbar-hide">
                    {loading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="min-w-[240px] md:min-w-[280px] h-80 bg-nature-sand/20 rounded-xl animate-pulse" />
                        ))
                    ) : (
                        [...products]
                            .sort((a, b) => b.id - a.id)
                            .slice(0, 8)
                            .map((product) => (
                                <div key={product.id} className="min-w-[240px] md:min-w-[280px]">
                                    <ProductCard product={product} />
                                </div>
                            ))
                    )}
                </div>

                <div className="text-center pt-8">
                    <Link
                        to="/products"
                        className="text-nature-dark text-xs font-medium tracking-[0.2em] uppercase transition-colors hover:text-nature-olive inline-flex items-center gap-2"
                    >
                        View All Fragrances <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </section>

            <SizeBanner />
        </div>
    );
}