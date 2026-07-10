import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Search, X, SunSnow, Users, Flower2, Beaker, ArrowLeft, Snowflake, Leaf, Sun, CloudSun, Mars, Venus, User } from 'lucide-react';
import ReactDOM from 'react-dom';

const POPULAR_TOOLS = [
    { label: 'Search by Brand', type: 'brand', desc: 'Browse by designer houses', icon: Search, color: 'text-teal-600' },
    { label: 'Search by Season', type: 'season', desc: 'Find scents for every season', icon: SunSnow, color: 'text-amber-500' },
    { label: 'Search by Gender', type: 'gender', desc: 'Masculine, feminine & unisex', icon: Users, color: 'text-rose-400' },
    { label: 'Search by Scent', type: 'scent', desc: 'Filter by notes & accords', icon: Flower2, color: 'text-blue-500' },
    { label: 'Search by Notes', type: 'note', desc: 'Find by individual ingredients', icon: Beaker, color: 'text-amber-500' },
];

export default function SearchModal({ isOpen, onClose, searchQuery, onSearchChange }) {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [view, setView] = useState('menu');
    const [listData, setListData] = useState([]);
    const [products, setProducts] = useState([]);
    const [activeType, setActiveType] = useState(null);

    // Icon ရွေးချယ်ပေးမည့် Helper Function
    const getPlaceholderIcon = (name) => {
        const n = name.toLowerCase();
        if (n.includes('winter')) return Snowflake;
        if (n.includes('fall') || n.includes('autumn')) return Leaf;
        if (n.includes('summer')) return Sun;
        if (n.includes('spring')) return CloudSun;
        if (n.includes('male') && !n.includes('female')) return Mars;
        if (n.includes('female')) return Venus;
        if (n.includes('unisex')) return User;
        return Search;
    };

    useEffect(() => {
        if (!isOpen) {
            onSearchChange('');
            setResults([]);
            setView('menu');
        }
    }, [isOpen]);

    useEffect(() => {
        if (searchQuery.length < 2) { setResults([]); return; }
        const fetchResults = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`http://localhost/api/search?q=${searchQuery}`);
                setResults(res.data);
            } catch (err) { console.error(err); } finally { setLoading(false); }
        };
        const timer = setTimeout(fetchResults, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleToolClick = async (type) => {
        setLoading(true);
        setActiveType(type);
        try {
            const res = await axios.get(`http://localhost/api/${type}s`);
            setListData(res.data);
            setView('list');
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const handleItemClick = async (id) => {
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost/api/products-by-${activeType}/${id}`);
            setProducts(res.data);
            setView('products');
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const handleClose = () => { onSearchChange(''); onClose(); setView('menu'); };

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[99999] flex items-start justify-center pt-20 px-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />

            <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in duration-200">
                <div className="relative flex items-center gap-3 border-b border-gray-100 pb-4 mb-4">
                    <Search className="w-5 h-5 text-nature-olive" />
                    <input autoFocus type="text" placeholder="Search fragrances..." value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} className="flex-1 outline-none text-base text-nature-dark placeholder:text-gray-400" />
                    <button onClick={handleClose} className="p-1 hover:bg-gray-100 rounded-full"><X className="w-5 h-5 text-gray-400" /></button>
                </div>

                <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    {loading && <p className="text-center text-sm py-4 text-nature-muted">Loading...</p>}

                    {searchQuery.length >= 2 && !loading && (
                        <div className="grid gap-1">
                            {results.map((p) => (
                                <Link to={`/products/${p.id}`} onClick={handleClose} key={p.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-all">
                                    <img src={p.image_url} className="w-12 h-12 rounded-lg object-cover border border-gray-100" />
                                    <div><h4 className="text-sm font-semibold text-nature-dark">{p.name}</h4><p className="text-xs text-nature-muted">{p.brand?.name}</p></div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {searchQuery.length < 2 && view === 'menu' && (
                        <div className="grid grid-cols-1 gap-2">
                            {POPULAR_TOOLS.map((tool) => (
                                <button key={tool.label} onClick={() => handleToolClick(tool.type)} className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 text-left transition-all group">
                                    <div className={`p-2 rounded-lg bg-gray-50 group-hover:bg-white transition-colors ${tool.color}`}><tool.icon className="w-5 h-5" /></div>
                                    <div><h3 className="font-medium text-nature-dark">{tool.label}</h3><p className="text-xs text-nature-muted">{tool.desc}</p></div>
                                </button>
                            ))}
                        </div>
                    )}

                    {searchQuery.length < 2 && (view === 'list' || view === 'products') && (
                        <div>
                            <button onClick={() => setView(view === 'products' ? 'list' : 'menu')} className="flex items-center gap-1 mb-4 text-xs font-medium text-nature-olive hover:underline">
                                <ArrowLeft className="w-3 h-3" /> Back
                            </button>
                            <div className="grid gap-1">
                                {(view === 'list' ? listData : products).map((item) => {
                                    const isProduct = view === 'products';
                                    const IconComp = getPlaceholderIcon(item.name);

                                    const content = (
                                        <>
                                            <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden">
                                                {(item.image_url || item.icon_url) ? (
                                                    <img src={item.image_url || item.icon_url} className="w-full h-full object-cover" alt={item.name} />
                                                ) : (
                                                    <IconComp className="w-6 h-6 text-gray-400" />
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-semibold text-nature-dark">{item.name}</h4>
                                                {view === 'products' && <p className="text-xs text-nature-muted">{item.brand?.name}</p>}
                                            </div>
                                        </>
                                    );

                                    return isProduct ? (
                                        <Link to={`/products/${item.id}`} key={item.id} onClick={handleClose} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-all">
                                            {content}
                                        </Link>
                                    ) : (
                                        <div key={item.id} onClick={() => handleItemClick(item.id)} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-all">
                                            {content}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}