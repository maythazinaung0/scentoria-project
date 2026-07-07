import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { theme } from '../../theme';
import ProductCard from '../../components/ProductCard';

const HERO_IMAGES = [
    'https://images.pexels.com/photos/15539722/pexels-photo-15539722.png',
    'https://images.pexels.com/photos/1190829/pexels-photo-1190829.jpeg?auto=compress&cs=tinysrgb&w=1400',
];

export default function HomePage({ searchQuery, products, scents }) {
    const [heroIdx, setHeroIdx] = useState(0);

    useEffect(() => {
        const t = setInterval(() => setHeroIdx(i => (i + 1) % HERO_IMAGES.length), 6000);
        return () => clearInterval(t);
    }, []);

    const filtered = Array.isArray(products) && searchQuery
        ? products.filter(p => p.name?.toLowerCase().includes(searchQuery.toLowerCase()))
        : products;

    return (
        <div style={{ backgroundColor: theme.colors.bgBase, color: theme.colors.textPrimary }}>
            <section className="max-w-7xl mx-auto px-6 md:px-8 py-16 md:py-24">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
                    <div className="relative overflow-hidden rounded-sm shadow-lg h-[500px]">
                        {HERO_IMAGES.map((img, idx) => (
                            <div
                                key={img}
                                className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${idx === heroIdx ? 'opacity-100' : 'opacity-0'}`}
                                style={{ backgroundImage: `url(${img})` }}
                            />
                        ))}
                    </div>

                    <div className="flex flex-col justify-center space-y-8">
                        <div>
                            <p className="text-[11px] tracking-[0.4em] uppercase mb-5" style={{ color: theme.colors.accent }}>The Art of Fragrance</p>
                            <h1 className="font-serif text-5xl md:text-6xl leading-[1.1]">
                                Discover Your<br />
                                <span className="italic font-normal" style={{ color: theme.colors.accent }}>Signature</span> Scent
                            </h1>
                        </div>
                        <div className="flex flex-wrap items-center gap-4">
                            <Link to="/scents" className="inline-flex items-center gap-2 px-8 py-3 transition-all hover:opacity-90 tracking-widest uppercase text-xs text-white" style={{ backgroundColor: theme.colors.accent }}>
                                Explore Scents <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link to="/products" className="inline-flex items-center gap-2 px-8 py-3 transition-all border border-[var(--color-accent)] text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white tracking-widest uppercase text-xs">
                                Shop All
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Scent profile section */}

            <section className="py-20 px-4 max-w-7xl mx-auto border-t border-gray-100">
                <div className="text-center mb-12">
                    <p className="text-[11px] tracking-[0.3em] uppercase mb-2" style={{ color: theme.colors.accent }}>Fragrance Families</p>
                    <h2 className="font-serif text-3xl">Explore Scent Profiles</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    {scents && scents.map(scent => (
                        <Link key={scent.id} to={`/scents/${scent.id}`}
                            className="group border border-gray-200 hover:border-gray-400 rounded-xl p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg bg-white">
                            <div className="w-full aspect-square mb-3 overflow-hidden rounded-lg bg-gray-50">
                                <img src={scent.image_url} alt={scent.name} className="w-full h-full object-cover" />
                            </div>
                            <p className="text-sm font-medium">{scent.name}</p>
                        </Link>
                    ))}
                </div>
                <div className="text-center pt-16 pb-8">
                    <Link
                        to="/scents"
                        className="text-sm font-semibold tracking-widest uppercase transition-colors hover:text-[var(--color-accent)]"
                    >
                        VIEW ALL SCENT PROFILES →
                    </Link>
                </div>
            </section>

            <div className="flex flex-wrap gap-2 py-7 border-b border-[#E5E7E2] mb-8"></div>

            {/* Fragrances section */}

            <section className="py-20 px-6 max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <p className="text-[11px] tracking-[0.3em] uppercase mb-2" style={{ color: theme.colors.accent }}>New Arrivals</p>
                    <h2 className="font-serif text-3xl">Featured Fragrances</h2>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {filtered && filtered.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>

                <div className="text-center pt-16 pb-8">
                    <Link to="/products" className="text-sm font-semibold tracking-widest uppercase transition-colors hover:text-[var(--color-accent)]">
                        VIEW ALL FRAGRANCES →
                    </Link>
                </div>
            </section>

            {/* Banner Section without extra margins */}
            <section className="relative py-24 overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center z-0"
                    style={{
                        backgroundImage: "url('https://images.pexels.com/photos/9944432/pexels-photo-9944432.jpeg')",
                    }}
                />
                <div className="absolute inset-0 bg-white/70 z-0" />

                <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
                    <p className="text-[11px] tracking-[0.3em] uppercase mb-3" style={{ color: theme.colors.accent }}>Available Volumes</p>
                    <h3 className="font-serif text-3xl mb-4">30ml, 50ml &amp; 100ml</h3>
                    <p className="text-gray-800 max-w-md mx-auto text-sm">Travel light or indulge fully — choose the size that fits your lifestyle.</p>
                </div>
            </section>
        </div>
    );
}