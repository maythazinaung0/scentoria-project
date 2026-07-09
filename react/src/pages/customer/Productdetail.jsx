import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Minus, Plus, Heart, Check, Loader2 } from 'lucide-react';
import { theme } from '../../theme';
import api from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

export default function ProductDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [product, setProduct] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [qty, setQty] = useState(1);
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState('');

    const [adding, setAdding] = useState(false);
    const [addError, setAddError] = useState('');
    const [added, setAdded] = useState(false);
    const { refreshCart, openCart } = useCart();

    useEffect(() => {
        fetch(`http://localhost/api/products/${id}`)
            .then(res => res.json())
            .then(data => {
                setProduct(data);
                if (data.variants?.length > 0) setSelectedVariant(data.variants[0]);
            })
            .catch(err => console.error("Error fetching product:", err));
    }, [id]);

    if (!product) return <div className="pt-24 text-center text-nature-muted">Loading...</div>;

    const getNotesData = (type) => {
        return product.notes
            ?.filter(n => n.type === type)
            .map(n => ({
                name: n.note?.name || "N/A",
                icon: n.note?.icon_url || null
            })) || [];
    };

    async function handleAddToCart() {
        if (!user) {
            navigate('/login?redirect=' + encodeURIComponent(`/products/${id}`));
            return;
        }
        if (!selectedVariant) {
            setAddError('Please select a size.');
            return;
        }

        setAdding(true);
        setAddError('');
        try {
            await api.post('/cart', {
                product_variant_id: selectedVariant.id,
                quantity: qty,
            });
            setAdded(true);
            setTimeout(() => setAdded(false), 2000);
            await refreshCart();
            openCart();
        } catch (err) {
            setAddError(err.response?.data?.message || 'Failed to add to cart. Please try again.');
        } finally {
            setAdding(false);
        }
    }

    return (
        <div className="min-h-screen bg-nature-bg py-12 px-6 pt-24 text-nature-dark">
            <div className="max-w-6xl mx-auto">
                <Link to="/products" className="text-sm text-nature-muted mb-8 inline-flex items-center gap-1 hover:text-nature-olive transition-colors">
                    ← Back to Fragrances
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 mt-6">

                    {/* Left Column: Image & Notes */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-3xl p-10 border border-nature-border shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)]">
                            <img src={product.image_url} alt={product.name} className="w-full h-auto object-contain drop-shadow-sm" />
                        </div>

                        <div className="bg-white p-7 rounded-2xl border border-nature-border shadow-[0_4px_20px_-8px_rgba(0,0,0,0.06)]">
                            <h3 className="text-xs uppercase tracking-[0.2em] text-nature-olive font-semibold mb-6">Fragrance Notes</h3>
                            <div className="space-y-5">
                                {['top', 'heart', 'base'].map((type) => (
                                    <div key={type} className="flex items-start gap-3">
                                        <span className="w-16 pt-1.5 text-xs font-semibold uppercase tracking-wider text-nature-muted">{type}</span>
                                        <div className="flex flex-wrap gap-2 flex-1">
                                            {getNotesData(type).length > 0 ? getNotesData(type).map((n, i) => (
                                                <div key={i} className="flex items-center gap-2 bg-nature-sage/10 px-3 py-1.5 rounded-full border border-nature-sage/30">
                                                    {n.icon && <img src={n.icon} alt={n.name} className="w-5 h-5 rounded-full object-cover" />}
                                                    <span className="text-xs text-nature-olive font-medium">{n.name}</span>
                                                </div>
                                            )) : <span className="text-gray-400 text-sm italic">N/A</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Info & Actions */}
                    <div className="space-y-8">
                        <div>
                            <p className="text-[11px] uppercase tracking-[0.25em] text-nature-olive font-semibold mb-2">
                                {product.brand?.name || 'Scentoria'}
                            </p>
                            <h1 className="text-4xl font-serif text-nature-dark mb-4 leading-tight">{product.name}</h1>
                            <p className="text-nature-muted leading-relaxed">{product.description}</p>
                        </div>

                        <div className="bg-white rounded-2xl border border-nature-border shadow-[0_4px_20px_-8px_rgba(0,0,0,0.06)] p-6 space-y-5">
                            <p className="text-3xl font-serif font-semibold text-nature-olive">
                                {selectedVariant
                                    ? new Intl.NumberFormat('my-MM', { style: 'currency', currency: 'MMK' }).format(selectedVariant.sale_price || 0)
                                    : "MMK 0"}
                            </p>
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-3 text-nature-muted">Size</label>
                                <div className="flex gap-3">
                                    {product.variants?.map((v) => (
                                        <button key={v.id} onClick={() => { setSelectedVariant(v); setQty(1); }}
                                            className={`px-8 py-2.5 rounded-xl border text-sm font-medium transition-all ${selectedVariant?.id === v.id
                                                ? 'bg-nature-olive text-white border-nature-olive shadow-sm'
                                                : 'border-nature-border bg-white text-nature-muted hover:border-nature-olive/50'
                                                }`}>
                                            {v.size}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pt-1">
                                <div className="flex items-center border border-nature-border rounded-xl overflow-hidden">
                                    <button onClick={() => setQty(q => Math.max(1, q - 1))} className="p-3 text-nature-muted hover:bg-nature-sage/10 transition-colors"><Minus size={16} /></button>
                                    <span className="w-12 text-center text-sm font-medium">{qty}</span>
                                    <button onClick={() => setQty(q => Math.min(q + 1, selectedVariant?.stock_quantity || 1))} className="p-3 text-nature-muted hover:bg-nature-sage/10 transition-colors"><Plus size={16} /></button>
                                </div>
                                <button
                                    onClick={handleAddToCart}
                                    disabled={adding}
                                    className="flex-1 bg-nature-olive text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#2d4533] disabled:opacity-60 transition-colors shadow-[0_4px_16px_-4px_rgba(74,104,56,0.4)]"
                                >
                                    {adding ? (
                                        <Loader2 size={18} className="animate-spin" />
                                    ) : added ? (
                                        <Check size={18} />
                                    ) : (
                                        <ShoppingCart size={18} />
                                    )}
                                    {adding ? 'ADDING...' : added ? 'ADDED' : 'ADD TO CART'}
                                </button>
                                <button className="p-3.5 border border-nature-border rounded-xl text-nature-olive hover:bg-nature-sage/10 transition-colors"><Heart size={20} /></button>
                            </div>

                            {addError && (
                                <p className="text-red-600 text-xs bg-red-50 border border-red-200/60 rounded-lg px-3 py-2">{addError}</p>
                            )}
                        </div>

                        {/* Review Section */}
                        <div className="pt-8 border-t border-nature-border">
                            <h3 className="font-serif text-xl mb-6">Customer Reviews</h3>
                            <div className="space-y-3 mb-6">
                                {reviews.map((r, i) => (
                                    <div key={i} className="bg-white p-4 rounded-xl italic text-sm text-nature-muted border border-nature-border shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                                        "{r}"
                                    </div>
                                ))}
                            </div>
                            <textarea
                                className="w-full p-4 border border-nature-border rounded-xl bg-white outline-none focus:border-nature-olive/50 transition-colors"
                                rows="3"
                                placeholder="Write a review..."
                                value={newReview}
                                onChange={(e) => setNewReview(e.target.value)}
                            />
                            <button
                                onClick={() => { setReviews([...reviews, newReview]); setNewReview(''); }}
                                className="mt-3 px-8 py-3 text-white rounded-xl font-medium transition-all hover:opacity-90"
                                style={{ backgroundColor: theme.colors.accent }}
                            >
                                Submit Review
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}