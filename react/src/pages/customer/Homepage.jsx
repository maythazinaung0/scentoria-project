import { useEffect, useState } from 'react';
import { Sparkles, Wind, Leaf, Flame, Star } from 'lucide-react';
import { theme } from '../../theme';
import { Link } from 'react-router-dom';
const SCENT_ICONS = { Floral: Sparkles, Woody: Leaf, Oriental: Flame, Fresh: Wind, Citrus: Star, Aquatic: Wind };

export default function HomePage({ searchQuery }) {
    const [products, setProducts] = useState([]);
    const [scents, setScents] = useState([]);

    useEffect(() => {
        fetch('http://localhost/api/scents')
            .then(res => res.json())
            .then(data => {
                console.log("Scents received:", data); // ဒီလိုင်းလေးထည့်ပါ
                setScents(data);
            })
            .catch(err => console.error("Error fetching scents:", err));

        fetch('http://localhost/api/products')
            .then(res => res.json())
            .then(data => {
                console.log("Products received:", data); // ဒီလိုင်းလေးထည့်ပါ
                setProducts(data);
            })
            .catch(err => console.error("Error fetching products:", err));
    }, []);

    // Search Query ရှိရင် စစ်ထုတ်ခြင်း
    const filteredProducts = searchQuery
        ? products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
        : products;

    // return သည် တစ်ခုတည်းသာ ရှိရပါမည်
    return (
        <div style={{ backgroundColor: theme.colors.bgBase, color: theme.colors.textPrimary }}>


           // Hero Section အတွင်းပိုင်းကို ဒီအတိုင်း ပြင်လိုက်ပါ
            {/* Hero Section */}
            <section className="max-w-7xl mx-auto py-16 px-6 grid md:grid-cols-2 gap-12 items-center">
                <img src="https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg" alt="Fragrance" className="w-full rounded-sm shadow-lg" />
                <div>
                    <p style={{ color: theme.colors.accent }} className="tracking-widest uppercase text-xs mb-4">The Art of Fragrance</p>
                    <h1 className="text-6xl font-serif">Discover Your <span className="italic" style={{ color: theme.colors.accent }}>Signature</span> Scent</h1>
                    <p className="mt-6 text-gray-600 mb-8">Premium inspired fragrances curated for the discerning nose.</p>

                    {/* Button များ - Hero Section အတွင်း၌သာ ရှိရမည် */}
                    <div className="flex flex-wrap items-center gap-4">
                        {/* Explore Scents Button */}
                        <Link
                            to="/scents"
                            className="inline-flex items-center gap-2 bg-[var(--color-accent)] hover:opacity-90 text-white px-8 py-3 transition-colors tracking-widest uppercase text-xs"
                        >
                            Explore Scents
                        </Link>

                        {/* Shop All Button */}
                        <Link
                            to="/products"
                            className="inline-flex items-center gap-2 border border-gray-400 hover:border-black text-black px-8 py-3 transition-colors tracking-widest uppercase text-xs"
                        >
                            Shop All
                        </Link>
                    </div>
                </div>
            </section>

            {/* Scent Profiles */}
            <section className="py-20 text-center max-w-6xl mx-auto px-6">
                <h2 className="text-3xl font-serif mb-10">Explore Scent Profiles</h2>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    {scents.map(s => {
                        const Icon = SCENT_ICONS[s.name] || Sparkles;
                        return (
                            // ဤနေရာတွင် Link ကို ထည့်ပါ
                            <Link to={`/scents/${s.id}`} key={s.id} className="block group">
                                <div className="border p-6 rounded-xl hover:shadow-md transition-all cursor-pointer">
                                    <Icon className="mx-auto mb-3" style={{ color: theme.colors.accent }} />
                                    <p className="font-medium">{s.name}</p>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </section>

            {/* Featured Fragrances Grid */}
            <section className="max-w-7xl mx-auto py-20 px-6">
                <h2 className="text-3xl font-serif text-center mb-12">Featured Fragrances</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredProducts.map(p => (
                        <div key={p.id} className="group border p-4 hover:border-gray-400 transition-all">
                            <img src={p.image_url} alt={p.name} className="w-full h-64 object-cover group-hover:scale-105 transition-transform" />
                            <h3 className="mt-4 font-serif text-lg">{p.name}</h3>
                            <p className="font-semibold" style={{ color: theme.colors.accent }}>{p.price_regular} MMK</p>
                            <button className="mt-4 w-full py-2 border border-black hover:bg-black hover:text-white transition-colors uppercase text-xs tracking-widest">
                                Explore
                            </button>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}