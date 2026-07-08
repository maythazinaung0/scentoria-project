import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ShoppingCart, Minus, Plus, Heart } from 'lucide-react';
import { theme } from '../../theme';
import { useCart } from '../../contexts/CartContext';

export default function ProductDetailPage() {
    const { id } = useParams();
    const { addToCart } = useCart(); // Added this
    const [product, setProduct] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [qty, setQty] = useState(1);
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState('');

    useEffect(() => {
        fetch(`http://localhost/api/products/${id}`)
            .then(res => res.json())
            .then(data => {
                setProduct(data);
                if (data.variants?.length > 0) setSelectedVariant(data.variants[0]);
            })
            .catch(err => console.error("Error fetching product:", err));
    }, [id]);

    const handleAddToCart = () => {
        if (selectedVariant) {
            addToCart(product, selectedVariant, qty);
        }
    };

    if (!product) return <div className="pt-24 text-center text-nature-muted">Loading...</div>;

    const getNotesData = (type) => {
        return product.notes
            ?.filter(n => n.type === type)
            .map(n => ({
                name: n.note?.name || "N/A",
                icon: n.note?.icon_url || null
            })) || [];
    };

    return (
        <div className="min-h-screen bg-nature-bg py-12 px-6 pt-24 text-nature-dark">
            <div className="max-w-6xl mx-auto">
                <Link to="/products" className="text-sm text-nature-muted mb-8 block hover:text-nature-olive">
                    ← Back to Fragrances
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-8">
                        <div className="bg-nature-card rounded-3xl p-8 border border-nature-border">
                            <img src={product.image_url} alt={product.name} className="w-full h-auto object-contain" />
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-nature-border">
                            <h3 className="text-xs uppercase tracking-widest text-nature-olive mb-6">Fragrance Notes</h3>
                            <div className="space-y-6">
                                {['top', 'heart', 'base'].map((type) => (
                                    <div key={type} className="flex items-start">
                                        <span className="w-16 text-sm text-nature-muted capitalize">{type}</span>
                                        <div className="flex flex-wrap gap-2">
                                            {getNotesData(type).length > 0 ? getNotesData(type).map((n, i) => (
                                                <div key={i} className="flex items-center gap-2 bg-nature-sage/10 px-3 py-1 rounded-full border border-nature-sage/20">
                                                    {n.icon && <img src={n.icon} alt={n.name} className="w-5 h-5 rounded-full object-cover" />}
                                                    <span className="text-xs text-nature-olive font-medium">{n.name}</span>
                                                </div>
                                            )) : <span className="text-gray-400 text-sm">N/A</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <h1 className="text-4xl font-serif text-nature-dark mb-4">{product.name}</h1>
                            <p className="text-nature-muted leading-relaxed">{product.description}</p>
                        </div>

                        <div className="space-y-4">
                            <p className="text-3xl font-bold text-nature-olive">
                                {selectedVariant
                                    ? new Intl.NumberFormat('my-MM', { style: 'currency', currency: 'MMK' }).format(selectedVariant.sale_price || 0)
                                    : "MMK 0"}
                            </p>
                            <div>
                                <label className="block text-sm font-semibold mb-3">SIZE</label>
                                <div className="flex gap-3">
                                    {product.variants?.map((v) => (
                                        <button key={v.id} onClick={() => { setSelectedVariant(v); setQty(1); }}
                                            className={`px-8 py-2 rounded-lg border transition ${selectedVariant?.id === v.id ? 'bg-nature-olive text-white border-nature-olive' : 'border-nature-border bg-white text-nature-muted'}`}>
                                            {v.size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center border border-nature-border rounded-lg">
                                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="p-3 text-nature-muted"><Minus size={16} /></button>
                                <span className="w-12 text-center text-sm">{qty}</span>
                                <button onClick={() => setQty(q => Math.min(q + 1, selectedVariant?.stock_quantity || 1))} className="p-3 text-nature-muted"><Plus size={16} /></button>
                            </div>
                            <button
                                onClick={handleAddToCart}
                                className="flex-1 bg-nature-olive text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-[#2d4533] transition"
                            >
                                <ShoppingCart size={18} /> ADD TO CART
                            </button>
                            <button className="p-3 border border-nature-border rounded-lg text-nature-olive hover:bg-nature-sage/10"><Heart size={20} /></button>
                        </div>

                        <div className="pt-8 border-t border-nature-border">
                            <h3 className="font-serif text-xl mb-6">Customer Reviews</h3>
                            <div className="space-y-4 mb-6">
                                {reviews.map((r, i) => <div key={i} className="bg-nature-card p-4 rounded-xl italic text-sm text-nature-muted">"{r}"</div>)}
                            </div>
                            <textarea
                                className="w-full p-4 border border-nature-border rounded-xl bg-white"
                                rows="3"
                                placeholder="Write a review..."
                                value={newReview}
                                onChange={(e) => setNewReview(e.target.value)}
                            />
                            <button
                                onClick={() => { setReviews([...reviews, newReview]); setNewReview(''); }}
                                className="mt-3 px-8 py-3 text-white rounded-lg transition-all"
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