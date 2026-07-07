import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SizeBanner from '../../components/SizeBanner';

export default function ScentProfilesPage() {
    const [scents, setScents] = useState([]);

    useEffect(() => {
        fetch('http://localhost/api/scents')
            .then(res => res.json())
            .then(data => {
                setScents(data);
                localStorage.setItem('scents', JSON.stringify(data));
            });
    }, []);

    return (
        <div className="min-h-screen bg-[#FDFBF7]">
            {/* Header Section */}
            <div className="pt-20 pb-12 px-4 text-center flex flex-col items-center">
                <p className="text-[10px] tracking-[0.2em] uppercase mb-3 text-[#8A8D86]">
                    Knowledge & Discovery
                </p>
                <h1 className="font-serif text-4xl text-[#2D2E2B] mb-4">
                    Scent Profiles
                </h1>
                <p className="text-[#6B6E67] max-w-sm leading-relaxed text-sm">
                    Every fragrance belongs to a family. Understanding these families helps you discover perfumes that resonate with your personal style.
                </p>
            </div>

            <div className="border-b border-[#E5E5E5] w-full mb-16"></div>

            {/* Scent Cards Section - ပြင်ဆင်ထားသော ကုဒ် */}
            <div className="max-w-7xl mx-auto px-6 pb-20">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {scents.map((scent) => (
                        <div key={scent.id} className="border border-[#E5E5E5] rounded-2xl p-6 bg-white shadow-sm flex flex-col transition-shadow hover:shadow-md">

                            {/* Header: Image (Logo Style) + Arrow */}
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-14 h-14 rounded-2xl bg-white overflow-hidden border border-[#E5E5E5] shadow-sm">
                                    {/* အဓိကပြင်လိုက်တဲ့နေရာ - user_image ကို image_url သို့ ပြောင်းပေးလိုက်သည် */}
                                    <img
                                        src={scent.image_url}
                                        alt={scent.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <svg className="w-5 h-5 text-gray-500 mt-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </div>

                            {/* Title & Description */}
                            <h3 className="text-2xl font-serif text-[#2D2E2B] mb-2">{scent.name}</h3>
                            <p className="text-[#6B6E67] text-sm leading-relaxed mb-4 flex-grow">
                                {scent.description}
                            </p>

                            {/* Tags Section */}
                            <div className="flex flex-wrap gap-2 mt-auto mb-6">
                                {scent.tags && scent.tags.map((tag, index) => (
                                    <span key={index} className="px-3 py-1 bg-[#E8EBE3] text-[#6B6E67] text-[10px] rounded-full uppercase tracking-wider">
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            {/* View Detail Link */}
                            <Link
                                to={`/scents/${scent.id}`}
                                className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#2D2E2B] border-b border-[#2D2E2B] pb-0.5 hover:opacity-60 transition-opacity self-start"
                            >
                                VIEW DETAIL
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
            <SizeBanner />
        </div>
    );
}