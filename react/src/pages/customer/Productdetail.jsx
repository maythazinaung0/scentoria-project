import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Heart, ShoppingCart, Minus, Plus } from 'lucide-react';
import { theme } from '../../theme';

export default function ProductDetailPage() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [selectedSize, setSelectedSize] = useState('30ml');
    const [qty, setQty] = useState(1);
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState('');

    useEffect(() => {
        fetch(`http://localhost/api/products/${id}`)
            .then(res => res.json())
            .then(data => setProduct(data))
            .catch(err => console.error("Error loading product:", err));
    }, [id]);

    if (!product) return <div className="pt-24 text-center text-nature-muted">Loading...</div>;

    const renderNotes = (notes) => {
        if (!notes) return <span className="text-gray-400 text-sm">N/A</span>;
        return notes.split(',').map((note, i) => (
            <span key={i} className="bg-nature-sage/20 text-nature-olive px-3 py-1 rounded-full text-xs border border-nature-sage/30 mr-2 mb-2 inline-block">
                {note.trim()}
            </span>
        ));
    };

    return (
        <div className="min-h-screen bg-nature-bg py-12 px-6 pt-24 text-nature-dark">
            <div className="max-w-6xl mx-auto">
                <Link to="/products" className="text-sm text-nature-muted mb-8 block hover:text-nature-olive">← Back to Fragrances</Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Left Column: Image & Notes */}
                    <div className="space-y-8">
                        <div className="bg-nature-card rounded-3xl p-8 border border-nature-border">
                            <img src={product.image_url} alt={product.name} className="w-full h-auto object-contain" />
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-nature-border">
                            <h3 className="text-xs uppercase tracking-widest text-nature-olive mb-6">Fragrance Notes</h3>
                            <div className="space-y-4">
                                <div className="flex items-start"><span className="w-16 text-sm text-nature-muted">Top</span> <div>{renderNotes(product.scent_profile?.top_notes)}</div></div>
                                <div className="flex items-start"><span className="w-16 text-sm text-nature-muted">Heart</span> <div>{renderNotes(product.scent_profile?.middle_notes)}</div></div>
                                <div className="flex items-start"><span className="w-16 text-sm text-nature-muted">Base</span> <div>{renderNotes(product.scent_profile?.base_notes)}</div></div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Info & Actions */}
                    <div className="space-y-8">
                        <div>
                            <h1 className="text-4xl font-serif text-nature-dark mb-4">{product.name}</h1>
                            <p className="text-nature-muted leading-relaxed">{product.description}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-3">SIZE</label>
                            <div className="flex gap-3">
                                {['30ml', '50ml', '100ml'].map((s) => (
                                    <button key={s} onClick={() => setSelectedSize(s)}
                                        className={`px-8 py-2 rounded-lg border transition ${selectedSize === s ? 'bg-nature-olive text-white border-nature-olive' : 'border-nature-border bg-white text-nature-muted'}`}>
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center border border-nature-border rounded-lg">
                                <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-3 text-nature-muted"><Minus size={16} /></button>
                                <span className="w-12 text-center text-sm">{qty}</span>
                                <button onClick={() => setQty(qty + 1)} className="p-3 text-nature-muted"><Plus size={16} /></button>
                            </div>
                            <button className="flex-1 bg-nature-olive text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2">
                                <ShoppingCart size={18} /> ADD TO CART
                            </button>
                            <button className="p-3 border border-nature-border rounded-lg text-nature-olive hover:bg-nature-sage/10"><Heart size={20} /></button>
                        </div>

                        {/* Reviews Section */}
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
                                onClick={() => {
                                    setReviews([...reviews, newReview]);
                                    setNewReview('');
                                }}
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