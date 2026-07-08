import { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Heart, ShoppingBag } from 'lucide-react';
import ProductCard from '../../components/ProductCard';

export default function ScentDetailPage() {
    const { id } = useParams();
    const location = useLocation();
    const [scent, setScent] = useState(null);
    const [products, setProducts] = useState(null);
    const [data, setData] = useState(null); // used for product-detail branch

    const isScentPage = location.pathname.includes('/scents/');

    useEffect(() => {
        if (!id) return;

        if (isScentPage) {
            Promise.all([
                fetch(`http://localhost/api/scents/${id}`, { headers: { 'Accept': 'application/json' } }).then(res => {
                    if (!res.ok) throw new Error('Network error');
                    return res.json();
                }),
                fetch(`http://localhost/api/products?scent_id=${id}`, { headers: { 'Accept': 'application/json' } }).then(res => {
                    if (!res.ok) throw new Error('Network error');
                    return res.json();
                }),
            ])
                .then(([scentData, productData]) => {
                    setScent(scentData);
                    setProducts(productData);
                })
                .catch((err) => console.error("Fetch Error:", err));
        } else {
            fetch(`http://localhost/api/products/${id}`, { headers: { 'Accept': 'application/json' } })
                .then((res) => {
                    if (!res.ok) throw new Error('Network error');
                    return res.json();
                })
                .then((json) => setData(json))
                .catch((err) => console.error("Fetch Error:", err));
        }
    }, [id, isScentPage]);

    if (isScentPage) {
        if (!scent || !products) return null;

        return (
            <div className="min-h-screen bg-gray-50 py-12 px-6 transition-opacity duration-500">
                <div className="max-w-7xl mx-auto">
                    <Link to="/scents" className="flex items-center text-gray-500 mb-6 hover:text-black">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Scent Profiles
                    </Link>

                    {/* Scent detail header */}
                    <div className="bg-white rounded-2xl shadow-sm p-8 mb-10 grid md:grid-cols-[auto_1fr] gap-8 items-center">
                        <div className="w-24 h-24 rounded-2xl overflow-hidden border border-gray-200 flex-shrink-0">
                            {scent.image_url && (
                                <img src={scent.image_url} alt={scent.name} className="w-full h-full object-cover" />
                            )}
                        </div>
                        <div>
                            <p className="text-[10px] tracking-[0.2em] uppercase text-gray-400 mb-1">Fragrance Family</p>
                            <h1 className="text-3xl font-serif mb-2">{scent.name}</h1>
                            <p className="text-gray-600 leading-relaxed">{scent.description}</p>
                        </div>
                    </div>

                    <h2 className="text-2xl font-serif mb-8 text-center">Fragrances in this Collection</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {Array.isArray(products) && products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-6 transition-opacity duration-500">
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-sm">
                <Link to="/" className="flex items-center text-gray-500 mb-6 hover:text-black">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Link>
                <div className="grid md:grid-cols-2 gap-8">
                    <img src={data.image_url} alt={data.name} className="rounded-xl w-full h-80 object-cover" />
                    <div>
                        <h1 className="text-3xl font-serif mb-2">{data.name}</h1>
                        <p className="text-gray-600 mb-6">{data.description}</p>
                        <p className="text-2xl font-bold mb-6">{data.price_regular} MMK</p>
                        <div className="flex gap-4">
                            <button className="flex-1 bg-black text-white py-3 rounded-lg flex items-center justify-center gap-2">
                                <ShoppingBag size={18} /> Add to Wallet
                            </button>
                            <button className="p-3 border rounded-lg"><Heart size={18} /></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}