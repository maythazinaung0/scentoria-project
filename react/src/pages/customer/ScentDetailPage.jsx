import { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Heart, ShoppingBag } from 'lucide-react';
import ProductCard from '../../components/ProductCard';

export default function ScentDetailPage() {
    const { id } = useParams();
    const location = useLocation();
    const [data, setData] = useState(null);

    // useEffect အပြင်ဘက်မှာ သတ်မှတ်ပါ
    const isScentPage = location.pathname.includes('/scents/');

    useEffect(() => {
        if (!id) return;

        const url = isScentPage
            ? `http://localhost/api/products?scent_id=${id}`
            : `http://localhost/api/products/${id}`;

        fetch(url, { headers: { 'Accept': 'application/json' } })
            .then((res) => {
                if (!res.ok) throw new Error('Network error');
                return res.json();
            })
            .then((json) => {
                setData(json);
            })
            .catch((err) => console.error("Fetch Error:", err));
    }, [id]); // [id] တစ်ခုတည်းကိုသာ ထားပါ (Error ပျောက်သွားပါလိမ့်မယ်)

    if (!data) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-6 transition-opacity duration-500">
            {isScentPage ? (
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-serif mb-8 text-center">Fragrances in this Collection</h1>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {Array.isArray(data) && data.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            ) : (
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
            )}
        </div>
    );
}