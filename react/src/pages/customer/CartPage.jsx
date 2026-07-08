import { useState, useEffect } from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';  
import axios from 'axios';
 
const formatMMK = (amount) => {
    return new Intl.NumberFormat('en-MM', {
        style: 'currency',
        currency: 'MMK',
        minimumFractionDigits: 0
    }).format(amount);
};

export default function CartPage() {
    const { user } = useAuth();
 
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCartItems();
    }, []);

    const fetchCartItems = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/cart', { withCredentials: true });
            setItems(response.data);
        } catch (error) {
            console.error("Error fetching cart items:", error);
        } finally {
            setLoading(false);
        }
    };

    // Dynamic state calculations for the summary panel
    const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
    const total = items.reduce((acc, item) => acc + (item.product_variant.sale_price * item.quantity), 0);

    // Simulated interactivity actions
    const updateQuantity = async (id, newQty) => {
        if (newQty < 1) return;

        const targetItem = items.find(item => item.id === id);
        if (!targetItem) return;

        const maxStock = targetItem.product_variant.stock_quantity;

        if (newQty > maxStock) {
            setItems(items.map(item => 
                item.id === id ? { ...item, error: `Only ${maxStock} items available.` } : item
            ));
            return;
        }

        try {
            await axios.post('http://localhost:8000/api/cart', {
                product_variant_id: targetItem.product_variant_id,
                quantity: newQty
            }, { withCredentials: true });
 
            setItems(items.map(item => 
                item.id === id ? { ...item, quantity: newQty, error: null } : item
            ));
        } catch (error) {
            console.error("Error updating quantity:", error);
        }
    };

    const removeFromCart = async (id) => {
        try {
            
            await axios.delete(`http://localhost:8000/api/cart/${id}`, { withCredentials: true });
         
            setItems(items.filter(item => item.id !== id));
        } catch (error) {
            console.error("Error removing item from cart:", error);
        }
    };

    

    // If you delete all items, this view will trigger automatically
    if (itemCount === 0) return (
        <div className="min-h-screen bg-nature-bg pt-24 flex flex-col items-center justify-center text-center px-4 gap-5">
            <ShoppingBag className="w-14 h-14 text-nature-sand" />
            <h2 className="font-serif text-3xl text-nature-dark">Your cart is empty</h2>
            <p className="text-nature-muted text-sm">Discover our fragrance collection and add something beautiful.</p>
            <Link to="/products" className="bg-nature-olive hover:bg-nature-olive-dark text-white font-medium px-8 py-3 rounded transition-colors tracking-[0.1em] text-sm">
                SHOP FRAGRANCES
            </Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-nature-bg text-nature-dark pt-24">
            <div className="max-w-5xl mx-auto px-4 py-12">
                <h1 className="font-serif text-3xl text-nature-dark mb-8">Your Cart</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* List Items Grid */}
                    <div className="lg:col-span-2 space-y-3">
                        {items.map(item => {
                            const variant = item.product_variant;
                            if (!variant) return null;
                            const price = variant.sale_price;

                            return (
                                <div key={item.id} className="bg-nature-card border border-nature-border rounded-xl p-4 flex gap-4 flex-col sm:flex-row">
                                    <div className="flex gap-4 flex-1">
                                        <img
                                            src={variant.product?.image_url ?? 'https://images.pexels.com/photos/3018845/pexels-photo-3018845.jpeg?auto=compress&cs=tinysrgb&w=200'}
                                            alt={variant.product?.name}
                                            className="w-[72px] h-[72px] rounded-lg object-cover flex-shrink-0 border border-nature-border"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-nature-muted text-[10px] tracking-[0.2em] uppercase">{variant.product?.brand}</p>
                                            <p className="font-serif text-nature-dark text-base leading-tight">{variant.product?.name}</p>
                                            <p className="text-nature-muted text-xs capitalize mt-0.5">{variant.size} size</p>

                                            <div className="flex items-center gap-3 mt-2">
                                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="w-6 h-6 rounded border border-nature-border text-nature-dark text-sm flex items-center justify-center hover:border-nature-olive transition-colors">−</button>
                                                <span className="text-nature-dark text-sm font-medium">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="w-6 h-6 rounded border border-nature-border text-nature-dark text-sm flex items-center justify-center hover:border-nature-olive transition-colors">+</button>
                                            </div>

                                            {item.error && (
                                                <p className="text-red-500 text-xs mt-1.5 font-medium animate-pulse">
                                                    {item.error}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end justify-between self-end sm:self-auto">
                                        <button onClick={() => removeFromCart(item.id)} className="text-nature-subtle hover:text-red-500 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <p className="text-nature-olive font-semibold text-sm">{formatMMK(price * item.quantity)}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Summary Panel */}
                    <div className="bg-nature-card border border-nature-border rounded-xl p-5 h-fit sticky top-24">
                        <h3 className="font-serif text-xl text-nature-dark mb-5">Order Summary</h3>
                        <div className="space-y-2.5 mb-5">
                            {items.map(item => {
                                const variant = item.product_variant;
                                if (!variant) return null;
                                const price = variant.sale_price;
                                return (
                                    <div key={item.id} className="flex justify-between text-sm">
                                        <span className="text-nature-muted truncate mr-2">{variant.product?.name} ({variant.size}) ×{item.quantity}</span>
                                        <span className="text-nature-dark flex-shrink-0">{formatMMK(price * item.quantity)}</span>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="border-t border-nature-border pt-4 mb-5">
                            <div className="flex justify-between">
                                <span className="text-nature-dark font-semibold">Total</span>
                                <span className="text-nature-olive font-semibold text-lg">{formatMMK(total)}</span>
                            </div>
                        </div>
                        {user ? (
                            <Link to="/checkout"
                                className="w-full bg-nature-olive hover:bg-nature-olive-dark text-white font-medium py-3 rounded-xl transition-colors tracking-[0.1em] text-sm flex items-center justify-center gap-2">
                                PROCEED TO CHECKOUT <ArrowRight className="w-4 h-4" />
                            </Link>
                        ) : (
                            <>
                                <Link to="/login?redirect=%2Fcheckout"
                                    className="w-full bg-nature-olive hover:bg-nature-olive-dark text-white font-medium py-3 rounded-xl transition-colors tracking-[0.1em] text-sm flex items-center justify-center gap-2">
                                    SIGN IN TO CHECKOUT
                                </Link>
                                <p className="text-nature-muted text-xs text-center mt-3">
                                    Your cart is saved. Sign in or register to complete your order.
                                </p>
                            </>
                        )}
                        <Link to="/products" className="block text-center text-nature-muted hover:text-nature-olive text-xs mt-4 transition-colors tracking-wider">
                            CONTINUE SHOPPING
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}