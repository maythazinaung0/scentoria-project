import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
    ShoppingCart, Minus, Plus, Heart, Check, Loader2, Star, Pencil, Trash2, X,
    MessageSquare, ChevronDown, Package
} from 'lucide-react';
import api from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useConfirm } from '../../contexts/ConfirmContext';

// Same visual language as CartPage
const panelClass = "bg-white/45 backdrop-blur-xl border border-white/60 rounded-lg shadow-[0_4px_24px_-12px_rgba(44,53,39,0.15)]";
const labelClass = "text-[11px] uppercase tracking-[0.25em] text-nature-olive font-medium";

function timeAgo(dateString) {
    const seconds = Math.floor((Date.now() - new Date(dateString)) / 1000);
    const units = [
        ['year', 31536000], ['month', 2592000], ['day', 86400],
        ['hour', 3600], ['minute', 60],
    ];
    for (const [label, secs] of units) {
        const count = Math.floor(seconds / secs);
        if (count >= 1) return `${count} ${label}${count > 1 ? 's' : ''} ago`;
    }
    return 'just now';
}

function StarPicker({ value, onChange, size = 'w-6 h-6' }) {
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(n => (
                <button key={n} type="button" onClick={() => onChange(n)}>
                    <Star className={`${size} transition-colors ${n <= value ? 'text-amber-500 fill-amber-500' : 'text-nature-sand hover:text-amber-300'}`} />
                </button>
            ))}
        </div>
    );
}

function AccordionSection({ title, children, defaultOpen = false }) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-nature-border/60">
            <button
                type="button"
                onClick={() => setOpen(v => !v)}
                className="w-full flex items-center justify-between py-4 text-left"
            >
                <span className={labelClass}>{title}</span>
                <ChevronDown className={`w-4 h-4 text-nature-muted transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && <div className="pb-5">{children}</div>}
        </div>
    );
}

function ReviewCard({ review, isOwn, onEdit, onDelete }) {
    const initial = (review.user_name || '?').charAt(0).toUpperCase();
    return (
        <div className="flex gap-3 py-5 border-b border-nature-border/50 last:border-0">
            <div className="w-9 h-9 rounded-full bg-nature-olive/15 text-nature-olive font-semibold flex items-center justify-center flex-shrink-0 text-sm">
                {initial}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <p className="text-sm font-medium text-nature-dark">{review.user_name || 'Anonymous'}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'text-amber-500 fill-amber-500' : 'text-nature-sand'}`} />
                            ))}
                            <span className="text-nature-muted text-[11px]">{timeAgo(review.created_at)}</span>
                        </div>
                    </div>
                    {isOwn && (
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <button onClick={onEdit} className="text-nature-muted hover:text-nature-olive transition-colors" title="Edit your review">
                                <Pencil className="w-3.5 h-3.5" strokeWidth={1.5} />
                            </button>
                            <button onClick={onDelete} className="text-nature-muted hover:text-red-600 transition-colors" title="Delete your review">
                                <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                            </button>
                        </div>
                    )}
                </div>
                {review.comment && (
                    <p className="text-sm text-nature-dark/90 mt-2 leading-relaxed break-words">{review.comment}</p>
                )}
            </div>
        </div>
    );
}

function NoteChip({ note }) {
    const [imgError, setImgError] = useState(false);
    const showIcon = note.icon && !imgError;

    return (
        <div className="flex items-center gap-2 bg-nature-sage/15 px-3 py-1.5 rounded-full border border-nature-sage/30">
            {showIcon ? (
                <img
                    src={note.icon}
                    alt={note.name}
                    onError={() => setImgError(true)}
                    className="w-4 h-4 rounded-full object-cover"
                />
            ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-nature-olive/40 flex-shrink-0" />
            )}
            <span className="text-xs text-nature-olive font-medium">{note.name}</span>
        </div>
    );
}

export default function ProductDetailPage() {
        const openConfirm = useConfirm();
    const { slug } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [product, setProduct] = useState(null);
    const [imgError, setImgError] = useState(false);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [qty, setQty] = useState(1);

    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(true);
    const [reviewSort, setReviewSort] = useState('newest');
    const [composerRating, setComposerRating] = useState(0);
    const [composerComment, setComposerComment] = useState('');
    const [reviewSubmitting, setReviewSubmitting] = useState(false);
    const [reviewError, setReviewError] = useState('');
    const [editingOwnReview, setEditingOwnReview] = useState(false);

    const [wishlistId, setWishlistId] = useState(null);
    const [wishlistLoading, setWishlistLoading] = useState(false);

    const [adding, setAdding] = useState(false);
    const [addError, setAddError] = useState('');
    const [added, setAdded] = useState(false);
    const { refreshCart, openCart } = useCart();

    // Fetch the product by slug. Runs whenever the slug in the URL changes
    // (e.g. navigating from one product page straight to another).
    useEffect(() => {
        setProduct(null);
        api.get(`/products/${slug}`)
            .then(({ data }) => {
                setProduct(data);
                if (data.variants?.length > 0) setSelectedVariant(data.variants[0]);
            })
            .catch(err => console.error("Error fetching product:", err));
    }, [slug]);

    // Reviews and wishlist status both key off the product's numeric id —
    // /products/{product}/reviews still uses Laravel's default id-based
    // route-model binding, so this only runs once the product has loaded.
    useEffect(() => {
        if (!product) return;
        loadReviews(product.id);
        if (user) checkWishlistStatus(product.id);
    }, [product?.id, user]);

    async function loadReviews(productId) {
        setReviewsLoading(true);
        try {
            const { data } = await api.get(`/products/${productId}/reviews`);
            setReviews(data ?? []);
        } catch (err) {
            console.error('Failed to load reviews:', err);
        } finally {
            setReviewsLoading(false);
        }
    }

    async function checkWishlistStatus(productId) {
        try {
            const { data } = await api.get('/wishlists');
            const existing = (data ?? []).find(w => String(w.product_id) === String(productId));
            setWishlistId(existing ? existing.id : null);
        } catch (err) {
            console.error('Failed to check wishlist status:', err);
        }
    }

    async function handleToggleWishlist() {
        if (!user) {
            navigate('/login?redirect=' + encodeURIComponent(`/products/${slug}`));
            return;
        }
        setWishlistLoading(true);
        try {
            if (wishlistId) {
                await api.delete(`/wishlists/${wishlistId}`);
                setWishlistId(null);
            } else {
                const { data } = await api.post('/wishlists', { product_id: product.id });
                setWishlistId(data.id);
            }
        } catch (err) {
            console.error('Failed to update wishlist:', err);
        } finally {
            setWishlistLoading(false);
        }
    }

    const myReview = user ? reviews.find(r => r.user_id === user.id) : null;

    function startEditOwnReview() {
        setComposerRating(myReview.rating);
        setComposerComment(myReview.comment || '');
        setEditingOwnReview(true);
        setReviewError('');
        document.getElementById('review-composer')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    async function submitReview(e) {
        e.preventDefault();
        if (!user) {
            navigate('/login?redirect=' + encodeURIComponent(`/products/${slug}`));
            return;
        }
        if (!composerRating) { setReviewError('Please select a star rating.'); return; }

        setReviewSubmitting(true);
        setReviewError('');
        try {
            if (myReview) {
                await api.put(`/reviews/${myReview.id}`, { rating: composerRating, comment: composerComment });
            } else {
                await api.post(`/products/${product.id}/reviews`, { rating: composerRating, comment: composerComment });
            }
            setComposerRating(0);
            setComposerComment('');
            setEditingOwnReview(false);
            await loadReviews(product.id);
        } catch (err) {
            setReviewError(err.response?.data?.message || 'Could not submit your review. Please try again.');
        } finally {
            setReviewSubmitting(false);
        }
    }

   function confirmDeleteOwnReview() {
        openConfirm({
            title: 'Delete your review?',
            message: 'This will permanently remove your review from this product.',
            confirmLabel: 'Delete',
            onConfirm: async () => {
                await api.delete(`/reviews/${myReview.id}`);
                await loadReviews(product.id);
            },
        });
    }

    async function handleAddToCart() {
        if (!user) {
            navigate('/login?redirect=' + encodeURIComponent(`/products/${slug}`));
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

    if (!product) {
        return (
            <div className="min-h-screen bg-nature-bg pt-24 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-nature-olive animate-spin" strokeWidth={1.5} />
            </div>
        );
    }

    const getNotesData = (type) => {
        return (product.notes || [])
            .filter(n => n.pivot?.type === type)
            .map(n => ({
                name: n.name || 'Unnamed note',
                icon: n.icon_url || null,
            }));
    };

    const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
    const distribution = [5, 4, 3, 2, 1].map(star => {
        const count = reviews.filter(r => r.rating === star).length;
        return { star, count, pct: reviews.length ? (count / reviews.length) * 100 : 0 };
    });

    const sortedReviews = [...reviews].sort((a, b) => {
        if (reviewSort === 'highest') return b.rating - a.rating;
        if (reviewSort === 'lowest') return a.rating - b.rating;
        return new Date(b.created_at) - new Date(a.created_at);
    });

    return (
        <div className="min-h-screen bg-nature-bg text-nature-dark pt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">

                <Link to="/products" className="text-nature-muted hover:text-nature-olive text-xs tracking-[0.15em] uppercase transition-colors inline-flex items-center gap-1 mb-6">
                    ← Back to Fragrances
                </Link>

                {/* --- HERO: image + purchase panel --- */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

                   <div className="lg:col-span-7">
                        <div className={`${panelClass} aspect-square max-h-[560px] max-w-[540px] overflow-hidden mx-auto w-full ${!(product.image_url && !imgError) ? 'flex items-center justify-center p-10 sm:p-16' : ''}`}>
                            {product.image_url && !imgError ? (
                                <img
                                    src={product.image_url}
                                    alt={product.name}
                                    onError={() => setImgError(true)}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="flex flex-col items-center gap-3 text-nature-sand">
                                    <Package className="w-16 h-16" strokeWidth={1} />
                                    <span className="text-nature-muted text-xs uppercase tracking-widest">No image available</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-5">
                        <div className="lg:sticky lg:top-24">
                            <p className={`${labelClass} mb-2`}>{product.brand?.name || 'Scentoria'}</p>
                            <h1 className="font-serif text-3xl sm:text-4xl text-nature-dark leading-tight mb-3">{product.name}</h1>

                            {reviews.length > 0 && (
                                <a href="#reviews" className="flex items-center gap-2 mb-5 w-fit">
                                    <div className="flex items-center gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`w-4 h-4 ${i < Math.round(avgRating) ? 'text-amber-500 fill-amber-500' : 'text-nature-sand'}`} />
                                        ))}
                                    </div>
                                    <span className="text-nature-muted text-sm hover:text-nature-olive transition-colors">
                                        {avgRating.toFixed(1)} · {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                                    </span>
                                </a>
                            )}

                            <p className="font-serif text-3xl font-semibold text-nature-olive mb-6">
                                {selectedVariant
                                    ? new Intl.NumberFormat('my-MM', { style: 'currency', currency: 'MMK' }).format(selectedVariant.sale_price || 0)
                                    : "MMK 0"}
                            </p>

                            <div className={`${panelClass} p-6 space-y-5`}>
                                <div>
                                    <label className="block text-nature-muted text-xs font-semibold uppercase tracking-wider mb-3">Size</label>
                                    <div className="flex gap-3 flex-wrap">
                                        {product.variants?.map((v) => (
                                            <button key={v.id} onClick={() => { setSelectedVariant(v); setQty(1); }}
                                                className={`px-6 py-2.5 rounded-md border text-sm font-medium transition-all ${selectedVariant?.id === v.id
                                                    ? 'bg-nature-olive text-white border-nature-olive shadow-sm'
                                                    : 'border-nature-border bg-white/50 text-nature-muted hover:border-nature-olive/50'
                                                    }`}>
                                                {v.size}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex items-center border border-nature-border/70 rounded-md bg-white/40">
                                        <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center text-nature-dark hover:bg-white/50 transition-colors"><Minus size={16} /></button>
                                        <span className="w-10 text-center text-sm font-medium">{qty}</span>
                                        <button onClick={() => setQty(q => Math.min(q + 1, selectedVariant?.stock_quantity || 1))} className="w-10 h-10 flex items-center justify-center text-nature-dark hover:bg-white/50 transition-colors"><Plus size={16} /></button>
                                    </div>
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={adding}
                                        className="flex-1 bg-nature-olive hover:bg-nature-olive-dark text-white font-medium py-3.5 rounded-md flex items-center justify-center gap-2 tracking-[0.15em] text-xs uppercase transition-colors disabled:opacity-60"
                                    >
                                        {adding ? <Loader2 size={16} className="animate-spin" /> : added ? <Check size={16} /> : <ShoppingCart size={16} />}
                                        {adding ? 'Adding...' : added ? 'Added' : 'Add to Cart'}
                                    </button>
                                    <button
                                        onClick={handleToggleWishlist}
                                        disabled={wishlistLoading}
                                        className={`w-12 h-12 flex-shrink-0 flex items-center justify-center border rounded-md transition-colors disabled:opacity-60 ${wishlistId ? 'border-nature-olive bg-nature-olive/10 text-nature-olive' : 'border-nature-border text-nature-olive hover:bg-nature-sage/10'
                                            }`}
                                    >
                                        <Heart size={18} className={wishlistId ? 'fill-nature-olive' : ''} />
                                    </button>
                                </div>

                                {addError && (
                                    <p className="text-red-600 text-xs bg-red-50 border border-red-200/60 rounded-md px-3 py-2">{addError}</p>
                                )}
                            </div>

                            {/* Collapsible detail sections */}
                            <div className="mt-2">
                                <AccordionSection title="Description" defaultOpen>
                                    <p className="text-nature-muted text-sm leading-relaxed whitespace-pre-line break-words max-h-64 overflow-y-auto custom-scrollbar pr-1">
                                        {product.description}
                                    </p>
                                </AccordionSection>

                                <AccordionSection title="Fragrance Notes">
                                    <div className="space-y-4">
                                        {['top', 'heart', 'base'].map((type) => (
                                            <div key={type} className="flex items-start gap-3">
                                                <span className="w-16 pt-1 text-[11px] font-semibold uppercase tracking-wider text-nature-muted flex-shrink-0">{type}</span>
                                                <div className="flex flex-wrap gap-2 flex-1">
                                                    {getNotesData(type).length > 0 ? getNotesData(type).map((n, i) => (
                                                        <NoteChip key={i} note={n} />
                                                    )) : <span className="text-nature-sand text-sm italic">N/A</span>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </AccordionSection>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- REVIEWS --- */}
                <div id="reviews" className="mt-16 lg:mt-24 scroll-mt-24">
                    <div className="flex items-center gap-2 mb-8">
                        <MessageSquare className="w-4 h-4 text-nature-olive" />
                        <h2 className="font-serif text-2xl sm:text-3xl text-nature-dark">Customer Reviews</h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

                        {/* Rating summary */}
                        <div className="lg:col-span-4">
                            <div className={`${panelClass} p-6 lg:sticky lg:top-24`}>
                                {reviews.length > 0 ? (
                                    <>
                                        <div className="text-center pb-5 border-b border-nature-border/50 mb-5">
                                            <p className="font-serif text-5xl text-nature-olive">{avgRating.toFixed(1)}</p>
                                            <div className="flex items-center justify-center gap-0.5 mt-2">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className={`w-4 h-4 ${i < Math.round(avgRating) ? 'text-amber-500 fill-amber-500' : 'text-nature-sand'}`} />
                                                ))}
                                            </div>
                                            <p className="text-nature-muted text-xs mt-2 uppercase tracking-wide">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
                                        </div>

                                        <div className="space-y-2">
                                            {distribution.map(({ star, count, pct }) => (
                                                <div key={star} className="flex items-center gap-2 text-xs">
                                                    <span className="w-3 text-nature-muted">{star}</span>
                                                    <Star className="w-3 h-3 text-amber-500 fill-amber-500 flex-shrink-0" />
                                                    <div className="flex-1 h-1.5 bg-nature-border/40 rounded-full overflow-hidden">
                                                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pct}%` }} />
                                                    </div>
                                                    <span className="w-6 text-right text-nature-muted">{count}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-nature-muted text-sm text-center py-4">No reviews yet.</p>
                                )}

                                {user && !myReview && (
                                    <button
                                        type="button"
                                        onClick={() => document.getElementById('review-composer')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                                        className="w-full mt-6 bg-nature-olive hover:bg-nature-olive-dark text-white text-xs tracking-[0.15em] uppercase font-medium py-3 rounded-md transition-colors"
                                    >
                                        Write a Review
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Composer + review list */}
                        <div className="lg:col-span-8">
                            {user && (!myReview || editingOwnReview) && (
                                <form id="review-composer" onSubmit={submitReview} className={`${panelClass} p-6 mb-6 space-y-4`}>
                                    <div className="flex items-center justify-between flex-wrap gap-3">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-nature-muted">
                                            {editingOwnReview ? 'Edit Your Review' : 'Share Your Thoughts'}
                                        </label>
                                        <StarPicker value={composerRating} onChange={setComposerRating} size="w-5 h-5" />
                                    </div>
                                    <textarea
                                        className="w-full p-3 border border-nature-border/70 rounded-md bg-white/60 outline-none focus:border-nature-olive/50 transition-colors text-sm resize-none"
                                        rows="3"
                                        placeholder="What did you think of this fragrance?"
                                        value={composerComment}
                                        onChange={(e) => setComposerComment(e.target.value)}
                                    />
                                    {reviewError && <p className="text-red-600 text-xs bg-red-50 border border-red-200/60 rounded-md px-3 py-2">{reviewError}</p>}
                                    <div className="flex items-center gap-4">
                                        <button
                                            type="submit"
                                            disabled={reviewSubmitting}
                                            className="bg-nature-olive hover:bg-nature-olive-dark disabled:opacity-60 text-white px-6 py-2.5 rounded-md text-xs tracking-[0.15em] uppercase font-medium transition-colors"
                                        >
                                            {reviewSubmitting ? 'Submitting...' : editingOwnReview ? 'Save Changes' : 'Submit Review'}
                                        </button>
                                        {editingOwnReview && (
                                            <button type="button" onClick={() => setEditingOwnReview(false)} className="text-nature-muted hover:text-nature-dark text-xs uppercase tracking-wide flex items-center gap-1">
                                                <X className="w-3.5 h-3.5" /> Cancel
                                            </button>
                                        )}
                                    </div>
                                </form>
                            )}

                            {!user && (
                                <div className={`${panelClass} px-5 py-4 mb-6 text-sm text-nature-muted`}>
                                    <Link to={`/login?redirect=${encodeURIComponent(`/products/${slug}`)}`} className="text-nature-olive font-medium hover:underline">Log in</Link> to write a review.
                                </div>
                            )}

                            <div className={`${panelClass} px-6`}>
                                <div className="flex items-center justify-between py-4 border-b border-nature-border/50">
                                    <span className="text-nature-muted text-xs uppercase tracking-wide">
                                        {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                                    </span>
                                    {reviews.length > 1 && (
                                        <select
                                            value={reviewSort}
                                            onChange={(e) => setReviewSort(e.target.value)}
                                            className="text-xs text-nature-dark bg-transparent border border-nature-border/70 rounded-md px-2 py-1.5 outline-none"
                                        >
                                            <option value="newest">Newest</option>
                                            <option value="highest">Highest Rated</option>
                                            <option value="lowest">Lowest Rated</option>
                                        </select>
                                    )}
                                </div>

                                {reviewsLoading ? (
                                    <div className="py-10 text-center text-nature-muted text-sm flex items-center justify-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" /> Loading reviews...
                                    </div>
                                ) : sortedReviews.length === 0 ? (
                                    <p className="py-10 text-center text-nature-muted text-sm">No reviews yet — be the first to share your thoughts.</p>
                                ) : (
                                    <div className="max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
                                        {sortedReviews.map(review => (
                                            <ReviewCard
                                                key={review.id}
                                                review={review}
                                                isOwn={user && review.user_id === user.id}
                                                onEdit={startEditOwnReview}
                                                onDelete={confirmDeleteOwnReview}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}