import { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Heart, ShoppingBag } from 'lucide-react';
import ProductCard from '../../components/ProductCard';




export default function ScentDetailPage() {
    const { id } = useParams();
    const location = useLocation();
    const [scent, setScent] = useState(null);
    const [products, setProducts] = useState(null);
    const [data, setData] = useState(null);

    const isScentPage = location.pathname.includes('/scents/');

    useEffect(() => {
        if (!id) return;

        if (isScentPage) {
            fetch(`http://localhost/api/scents/${id}`, { headers: { 'Accept': 'application/json' } })
                .then(res => { if (!res.ok) throw new Error('Network error'); return res.json(); })
                .then(scentData => {
                    setScent(scentData);
                    setProducts(scentData.products || []);
                })
                .catch((err) => console.error("Fetch Error:", err));
        } else {
            fetch(`http://localhost/api/products/${id}`, { headers: { 'Accept': 'application/json' } })
                .then((res) => res.json())
                .then((json) => setData(json))
                .catch((err) => console.error("Fetch Error:", err));
        }
    }, [id, isScentPage]);


    if (isScentPage) {
        if (!scent) return null;
        return (
            <div className="min-h-screen bg-nature-bg pt-24 pb-12 px-6">
                <div className="max-w-5xl mx-auto">
                    {/* Back link aligned left and spaced below navbar */}
                    <Link to="/scents" className="inline-flex items-center text-nature-muted mb-6 hover:text-nature-olive transition-colors text-sm">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Scent Profiles
                    </Link>

                    {/* Main Content Card - Aligned left with container */}
                    <div className="bg-nature-card border border-nature-border rounded-3xl p-8 mb-16 grid md:grid-cols-[auto_1fr] gap-8 items-center">
                        <div className="w-24 h-24 rounded-2xl overflow-hidden border border-nature-border">
                            {scent.image_url && <img src={scent.image_url} alt={scent.name} className="w-full h-full object-cover" />}
                        </div>
                        <div>
                            <p className="text-[10px] tracking-[0.2em] uppercase text-nature-olive mb-1">Fragrance Family</p>
                            <h1 className="text-3xl font-serif mb-2 text-nature-dark">{scent.name}</h1>
                            <p className="text-nature-muted leading-relaxed">{scent.description}</p>
                        </div>
                    </div>

                    {/* Centered Collection Title */}
                    <h2 className="text-2xl font-serif mb-8 text-center text-nature-dark">Fragrances in this Collection</h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {Array.isArray(products) && products.map((product) => <ProductCard key={product.id} product={product} />)}
                    </div>
                </div>
            </div>
        );
    }

    // Product Detail Page
    if (!data) return null;
    return (
        <div className="min-h-screen bg-nature-bg pt-24 pb-12 px-6">
            <div className="max-w-4xl mx-auto bg-nature-card border border-nature-border p-8 rounded-3xl">
                <Link to="/" className="inline-flex items-center text-nature-muted mb-6 hover:text-nature-olive">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Link>
                <div className="grid md:grid-cols-2 gap-8">
                    <img src={data.image_url} alt={data.name} className="rounded-2xl w-full h-80 object-cover" />
                    <div>
                        <h1 className="text-3xl font-serif mb-2 text-nature-dark">{data.name}</h1>
                        <p className="text-nature-muted mb-6">{data.description}</p>
                        <p className="text-2xl font-bold mb-6 text-nature-dark">{data.price_regular} MMK</p>
                        <div className="flex gap-4">
                            <button className="flex-1 bg-nature-olive text-white py-3 rounded-lg flex items-center justify-center gap-2">
                                <ShoppingBag size={18} /> Add to Wallet
                            </button>
                            <button className="p-3 border border-nature-border rounded-lg text-nature-muted"><Heart size={18} /></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}