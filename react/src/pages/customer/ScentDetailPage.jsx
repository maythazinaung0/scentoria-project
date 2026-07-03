import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Heart, ShoppingBag } from 'lucide-react';

export default function ScentDetailPage() {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    // URL ထဲမှာ 'scents' ပါရင် Scent Family, မပါရင် Product အဖြစ် သတ်မှတ်မယ်
    const isScentPage = window.location.pathname.includes('/scents/');

    useEffect(() => {
        setLoading(true);
        const url = isScentPage
            ? `http://localhost/api/products?scent_id=${id}`
            : `http://localhost/api/products/${id}`;

        // ၁။ URL မှန်မမှန် စစ်ဆေးရန်
        console.log("Fetching URL:", url);

        fetch(url)
            .then((res) => {
                // ၃။ Response အဆင့်မှာ Error ရှိမရှိ စစ်ဆေးရန်
                console.log("Response status:", res.status);
                return res.json();
            })
            .then((json) => {
                // ၂။ Data အမှန်တကယ် ရမရ စစ်ဆေးရန်
                console.log("Received Data from API:", json);
                setData(json);
                setLoading(false);
            })
            .catch((err) => {
                // ၄။ Fetch လုပ်တဲ့နေရာမှာ Error ရှိမရှိ စစ်ဆေးရန်
                console.error("Fetch Error:", err);
                setLoading(false);
            });
    }, [id, isScentPage]);
    if (loading) return <div className="p-20 text-center">Loading...</div>;
    if (!data) return <div className="p-20 text-center">No data found.</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-6">
            {isScentPage ? (
                // === Scent Family Page (ပစ္စည်းစာရင်း) ===
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-serif mb-8 text-center">Fragrances in this Collection</h1>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {data.map((product) => (
                            <div key={product.id} className="bg-white p-4 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                                <img src={product.image_url} alt={product.name} className="w-full h-48 object-cover rounded-lg" />
                                <h3 className="mt-4 font-serif text-lg">{product.name}</h3>
                                <p className="text-gray-500 text-sm mb-4">{product.price_regular} MMK</p>
                                <Link to={`/products/${product.id}`} className="block w-full text-center bg-black text-white py-2 rounded-lg text-sm">
                                    View Details
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                // === Product Detail Page (ပစ္စည်းတစ်ခုချင်းစီ) ===
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