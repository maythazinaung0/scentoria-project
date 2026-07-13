import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, X, SunSnow, Users, Flower2, Beaker, ArrowLeft, Snowflake, Leaf, Sun, CloudSun, Mars, Venus, User, Package } from 'lucide-react';
import ReactDOM from 'react-dom';
import api from '../api';

const POPULAR_TOOLS = [
    { label: 'Search by Brand', type: 'brand', listEndpoint: '/brands-list', desc: 'Browse by designer houses', icon: Search, color: 'text-nature-olive' },
    { label: 'Search by Season', type: 'season', listEndpoint: '/seasons', desc: 'Find scents for every season', icon: SunSnow, color: 'text-amber-600' },
    { label: 'Search by Gender', type: 'gender', listEndpoint: '/genders', desc: 'Masculine, feminine & unisex', icon: Users, color: 'text-rose-500' },
    { label: 'Search by Scent', type: 'scent', listEndpoint: '/scents', desc: 'Filter by notes & accords', icon: Flower2, color: 'text-nature-olive' },
    { label: 'Search by Notes', type: 'note', listEndpoint: '/notes', desc: 'Find by individual ingredients', icon: Beaker, color: 'text-amber-600' },
];

export default function SearchModal({ isOpen, onClose, searchQuery, onSearchChange }) {
    const [results, setResults] = useState([]);
    const [view, setView] = useState('menu');
    const [listData, setListData] = useState([]);
    const [products, setProducts] = useState([]);
    const [activeType, setActiveType] = useState(null);
    const [imgErrors, setImgErrors] = useState({});

    const getPlaceholderIcon = (name) => {
        const n = (name || '').toLowerCase();
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
            setImgErrors({});
        }
    }, [isOpen]);

    useEffect(() => {
        if (searchQuery.length < 2) { setResults([]); return; }
        const timer = setTimeout(() => {
            api.get(`/search?q=${searchQuery}`)
                .then(res => setResults(res.data))
                .catch(err => console.error(err));
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleToolClick = (tool) => {
        setActiveType(tool.type);
        api.get(tool.listEndpoint)
            .then(res => {
                setListData(res.data);
                setView('list');
            })
            .catch(err => console.error(err));
    };

    // id here is the brand/scent/note/season/gender id — not a product slug
    const handleItemClick = (id) => {
        api.get(`/products-by-${activeType}/${id}`)
            .then(res => {
                setProducts(res.data);
                setView('products');
            })
            .catch(err => console.error(err));
    };

    const handleClose = () => { onSearchChange(''); onClose(); setView('menu'); };

    if (!isOpen) return null;

    const renderThumb = (key, imageUrl, name) => {
        const showImage = imageUrl && !imgErrors[key];
        return (
            <div className="w-12 h-12 flex-shrink-0 border border-white/70 bg-white/40 rounded-md overflow-hidden flex items-center justify-center">
                {showImage ? (
                    <img
                        src={imageUrl}
                        alt={name}
                        onError={() => setImgErrors(prev => ({ ...prev, [key]: true }))}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <Package className="w-5 h-5 text-nature-sand" strokeWidth={1} />
                )}
            </div>
        );
    };

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[99999] flex items-start justify-center pt-20 px-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />

            <div className="relative w-full max-w-2xl bg-white/80 backdrop-blur-xl border border-white/60 rounded-lg shadow-[0_4px_24px_-12px_rgba(44,53,39,0.15)] p-6 animate-in fade-in zoom-in duration-200">
                <div className="relative flex items-center gap-3 border-b border-nature-border/70 pb-4 mb-4">
                    <Search className="w-4 h-4 text-nature-olive" strokeWidth={1.5} />
                    <input
                        autoFocus
                        type="text"
                        placeholder="Search fragrances..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="flex-1 outline-none bg-transparent text-sm text-nature-dark placeholder:text-nature-muted"
                    />
                    <button onClick={handleClose} className="p-1.5 hover:bg-white/50 rounded-md transition-colors">
                        <X className="w-4 h-4 text-nature-muted" strokeWidth={1.5} />
                    </button>
                </div>

                <div className="max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
                    {searchQuery.length >= 2 && (
                        <div className="grid gap-1">
                            {results.length === 0 ? (
                                <p className="text-center text-xs text-nature-muted py-8">No fragrances found for "{searchQuery}"</p>
                            ) : results.map((p) => (
                                <Link
                                    to={`/products/${p.slug}`}
                                    onClick={handleClose}
                                    key={p.id}
                                    className="flex items-center gap-4 p-3 hover:bg-white/50 rounded-lg transition-colors"
                                >
                                    {renderThumb(`search-${p.id}`, p.image_url, p.name)}
                                    <div>
                                        <h4 className="font-serif text-sm text-nature-dark">{p.name}</h4>
                                        <p className="text-nature-muted text-[10px] uppercase tracking-wide mt-0.5">{p.brand?.name}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {searchQuery.length < 2 && view === 'menu' && (
                        <div className="grid grid-cols-1 gap-1">
                            {POPULAR_TOOLS.map((tool) => (
                                <button
                                    key={tool.label}
                                    onClick={() => handleToolClick(tool)}
                                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/50 text-left transition-colors group"
                                >
                                    <div className={`w-10 h-10 flex items-center justify-center rounded-md bg-nature-sand/20 group-hover:bg-white/70 transition-colors ${tool.color}`}>
                                        <tool.icon className="w-4 h-4" strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <h3 className="font-serif text-sm text-nature-dark">{tool.label}</h3>
                                        <p className="text-nature-muted text-[11px] mt-0.5">{tool.desc}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {searchQuery.length < 2 && (view === 'list' || view === 'products') && (
                        <div>
                            <button
                                onClick={() => setView(view === 'products' ? 'list' : 'menu')}
                                className="flex items-center gap-1.5 mb-4 text-nature-muted hover:text-nature-olive text-[11px] uppercase tracking-[0.15em] transition-colors"
                            >
                                <ArrowLeft className="w-3 h-3" /> Back
                            </button>

                            {(view === 'list' ? listData : products).length === 0 ? (
                                <p className="text-center text-xs text-nature-muted py-8">
                                    {view === 'products' ? 'No products match this filter.' : 'Nothing here yet.'}
                                </p>
                            ) : (
                                <div className="grid gap-1">
                                    {(view === 'list' ? listData : products).map((item) => {
                                        const isProduct = view === 'products';
                                        const IconComp = getPlaceholderIcon(item.name);
                                        const imageUrl = item.image_url || item.icon_url;

                                        const thumb = imageUrl ? (
                                            renderThumb(`${view}-${item.id}`, imageUrl, item.name)
                                        ) : (
                                            <div className="w-12 h-12 flex-shrink-0 rounded-md bg-nature-sand/20 flex items-center justify-center">
                                                <IconComp className="w-5 h-5 text-nature-sand" strokeWidth={1.5} />
                                            </div>
                                        );

                                        const content = (
                                            <>
                                                {thumb}
                                                <div>
                                                    <h4 className="font-serif text-sm text-nature-dark">{item.name}</h4>
                                                    {isProduct && (
                                                        <p className="text-nature-muted text-[10px] uppercase tracking-wide mt-0.5">{item.brand?.name}</p>
                                                    )}
                                                </div>
                                            </>
                                        );

                                        return isProduct ? (
                                            <Link
                                                to={`/products/${item.slug}`}
                                                key={item.id}
                                                onClick={handleClose}
                                                className="flex items-center gap-4 p-3 hover:bg-white/50 rounded-lg transition-colors"
                                            >
                                                {content}
                                            </Link>
                                        ) : (
                                            <div
                                                key={item.id}
                                                onClick={() => handleItemClick(item.id)}
                                                className="flex items-center gap-4 p-3 hover:bg-white/50 rounded-lg cursor-pointer transition-colors"
                                            >
                                                {content}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}