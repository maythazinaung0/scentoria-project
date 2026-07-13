import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, Package } from 'lucide-react';
import ProductCard from '../../components/ProductCard';
import api from '../../api';

const panelClass = "bg-white/45 backdrop-blur-xl border border-white/60 rounded-lg shadow-[0_4px_24px_-12px_rgba(44,53,39,0.15)]";

export default function ScentDetailPage() {
    const { id } = useParams();
    const [scent, setScent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!id) return;

        setLoading(true);
        setError(false);

        api.get(`/scents/${id}`)
            .then(({ data }) => setScent(data))
            .catch((err) => {
                console.error('Error fetching scent:', err.response ?? err);
                setError(true);
            })
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-nature-bg flex items-center justify-center">
                <div className="w-6 h-6 border border-nature-olive border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!scent || error) {
        return (
            <div className="min-h-screen bg-nature-bg pt-24 flex flex-col items-center justify-center text-center px-4">
                <Package className="w-10 h-10 text-nature-sand mb-6" strokeWidth={1} />
                <h2 className="font-serif text-2xl text-nature-dark mb-3">Scent family not found</h2>
                <p className="text-nature-muted text-sm max-w-xs mb-6">We couldn't find that fragrance family. It may have been removed, or the link may be incorrect.</p>
                <Link to="/scents" className="text-nature-olive hover:text-nature-olive-dark text-xs uppercase tracking-[0.15em] transition-colors">← Back to Scent Profiles</Link>
            </div>
        );
    }

    const products = scent.products ?? [];
    const commonNotes = scent.common_notes ?? [];

    return (
        <div className="min-h-screen bg-nature-bg text-nature-dark pt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">

                <Link to="/scents" className="inline-flex items-center gap-2 text-nature-muted hover:text-nature-olive transition-colors text-xs uppercase tracking-[0.15em] mb-6">
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Scent Profiles
                </Link>

                {/* Scent header */}
                <div className={`${panelClass} p-6 sm:p-8 mb-10`}>
                    <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-6 sm:gap-8 items-start">
                        <div className="w-24 h-24 rounded-lg overflow-hidden border border-white/60 bg-nature-sage/20 flex-shrink-0">
                            {scent.image_url ? (
                                <img src={scent.image_url} alt={scent.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <span className="font-serif text-3xl text-nature-olive/40">{scent.name?.[0]?.toUpperCase()}</span>
                                </div>
                            )}
                        </div>

                        <div>
                            <p className="text-[11px] uppercase tracking-[0.35em] text-nature-olive font-medium mb-2">Fragrance Family</p>
                            <h1 className="font-serif text-3xl sm:text-4xl text-nature-dark tracking-tight mb-3">{scent.name}</h1>
                            <p className="text-nature-muted text-sm leading-relaxed max-w-2xl">{scent.description}</p>

                            {commonNotes.length > 0 && (
                                <div className="mt-5 pt-5 border-t border-nature-border/60">
                                    <p className="flex items-center gap-1.5 text-nature-muted text-[10px] uppercase tracking-[0.2em] mb-2.5">
                                        <Sparkles className="w-3 h-3 text-nature-olive" strokeWidth={1.5} /> Common Notes
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {commonNotes.map((note) => (
                                            <span key={note} className="text-xs text-nature-olive bg-nature-sage/25 border border-nature-olive/20 px-3 py-1 rounded-full">
                                                {note}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Products in this scent family */}
                <div className="text-center mb-8">
                    <p className="text-[11px] uppercase tracking-[0.35em] text-nature-olive font-medium mb-2">Curated Selection</p>
                    <h2 className="font-serif text-3xl text-nature-dark">Fragrances in this Collection</h2>
                </div>

                {products.length === 0 ? (
                    <div className={`${panelClass} p-16 text-center`}>
                        <Package className="w-10 h-10 text-nature-sand mx-auto mb-4" strokeWidth={1} />
                        <p className="text-nature-muted text-sm">No fragrances are currently listed in this family.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}