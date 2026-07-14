import { Link } from 'react-router-dom';
import {
    Heart, Package, Award, Truck, Shield, Leaf,
    Phone, Mail, MapPin, Clock, ChevronDown, ArrowRight
} from 'lucide-react';
import { useState } from 'react';
import ScentoriaLogo from '../../components/ScentoriaLogo';
import SizeBanner from '../../components/SizeBanner';

// Same visual language as the rest of the site
const panelClass = "bg-white/45 backdrop-blur-xl border border-white/60 rounded-lg shadow-[0_4px_24px_-12px_rgba(44,53,39,0.15)]";
const labelClass = "text-[11px] uppercase tracking-[0.25em] text-nature-olive font-medium";

const faqs = [
    { q: 'Are your fragrances authentic?', a: 'Our fragrances are premium inspired alternatives — expertly crafted to closely mirror iconic designer and niche scents using high-quality fragrance oils. They are not counterfeit products but original formulations that capture the spirit of luxury perfumery.' },
    { q: 'How long do your fragrances last?', a: 'Our high-concentration oils typically last 6–10 hours on skin, sometimes longer on fabric. Regular size (full bottle) contains more oil for extended wear, while the small size is perfect for trying a new scent or carrying with you.' },
    { q: 'How does the Virtual Wallet work?', a: 'Top up your Scentoria Wallet from your profile page. Once admin approves your top-up (usually within 24 hours), the balance is added. You can then use it to checkout instantly — no need to pay each time.' },
    { q: 'What is the delivery area?', a: 'We currently deliver across Yangon and selected cities in Myanmar. Delivery times vary by location — typically 1–3 business days within Yangon.' },
    { q: 'Can I return or exchange a product?', a: 'We accept returns within 7 days if the product is unused and in original packaging. For exchanges, please contact us via Viber or Facebook before returning the item.' },
    { q: 'How do I know which scent is right for me?', a: 'Browse our Scent Profiles page — each profile explains the fragrance family, top/middle/base notes, and the mood it evokes. You can also message us on Facebook or Viber and we\'ll recommend based on your preferences.' },
];



// ... (imports and constants remain unchanged)

export default function AboutPage() {
    const [openFaq, setOpenFaq] = useState(null);

    return (
        <div className="bg-nature-bg text-nature-dark">

            {/* --- HERO --- */}
            <div className="max-w-5xl mx-auto px-4 text-center pt-28 pb-20">
                <div className="flex items-center justify-center gap-3 mb-6">
                    <ScentoriaLogo className="w-9 h-11 text-nature-olive" />
                    <h1 className="font-serif text-5xl sm:text-6xl text-nature-dark tracking-tight">Scentoria</h1>
                </div>
                <p className="text-nature-muted text-base max-w-xl mx-auto mb-9 leading-relaxed">
                    Premium inspired fragrances at honest prices — helping you discover your signature scent.
                </p>
                <div className="flex justify-center gap-4">
                    {/* "Shop Now" Button: White base, Green hover */}
                    <Link
                        to="/products"
                        className="inline-flex items-center gap-2 px-9 py-3.5 bg-white text-nature-dark border border-nature-olive text-xs uppercase tracking-[0.2em] font-medium transition-all hover:bg-nature-olive hover:text-white"
                    >
                        Shop Now <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    {/* "Explore Scents" Button: Green base, Dark Green hover */}
                    <Link
                        to="/scents"
                        className="inline-flex items-center gap-2 px-9 py-3.5 bg-nature-olive text-white text-xs uppercase tracking-[0.2em] font-medium transition-all hover:bg-nature-olive-dark"
                    >
                        Explore Scents
                    </Link>
                </div>
            </div>



            {/* --- OUR STORY --- */}
            <div className="max-w-5xl mx-auto px-4 mb-24">
                <p className={`${labelClass} text-center mb-2`}>Since Day One</p>
                <h2 className="font-serif text-3xl sm:text-4xl text-center mb-12">Our Story</h2>

                {/* Using grid-cols-12 to give the text more width than the image */}
                <div className="grid md:grid-cols-12 gap-10 items-center">

                    {/* Image takes 5 columns */}
                    <div className="md:col-span-5 aspect-square overflow-hidden rounded-sm">
                        <img
                            src="https://images.pexels.com/photos/932587/pexels-photo-932587.jpeg"
                            alt="Scentoria fragrance atelier"
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Text takes 7 columns */}
                    <div className="md:col-span-7 space-y-4 text-sm text-nature-muted leading-relaxed">
                        <p>Scentoria was founded with one belief: everyone deserves to smell extraordinary. In Myanmar's fragrance market, authentic luxury scents remain out of reach for most. We set out to change that.</p>
                        <p>We carefully craft inspired fragrances that capture the character and soul of iconic designer and niche perfumes — using premium fragrance oils formulated to perform at the same level as their inspirations.</p>
                        <p>Every bottle is filled with care, and every order is personally packed by our team in Yangon. We're not a faceless warehouse — we're fragrance lovers who want to share the joy of great scent with you.</p>

                        <div className="flex gap-10 pt-5">
                            <div>
                                <p className="font-serif text-3xl text-nature-olive">50+</p>
                                <p className={labelClass}>Fragrances</p>
                            </div>
                            <div>
                                <p className="font-serif text-3xl text-nature-olive">1K+</p>
                                <p className={labelClass}>Happy Customers</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- WHY CHOOSE SCENTORIA --- */}
            <div className="max-w-5xl mx-auto px-4 mb-24">
                <p className={`${labelClass} text-center mb-2`}>Our Commitment</p>
                <h2 className="font-serif text-3xl sm:text-4xl text-center mb-2">Why Choose Scentoria</h2>
                <p className="text-center text-nature-muted text-sm mb-12">Quality you can trust, prices you'll love.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {[
                        { icon: Package, title: 'Premium Quality', desc: 'High-concentration fragrance oils that perform and last just as long as the originals.' },
                        { icon: Award, title: 'Expert Selection', desc: 'Every scent is hand-picked and tested by our team before it reaches our catalogue.' },
                        { icon: Heart, title: 'Fair Pricing', desc: 'No celebrity endorsements or extravagant advertising. Just great fragrance at fair cost.' },
                        { icon: Shield, title: 'Safe & Cruelty-Free', desc: 'Skin-safe formulations with no animal testing. Safe for daily wear.' },
                        { icon: Leaf, title: 'Thoughtful Packaging', desc: 'Clean, minimal packaging designed to protect your fragrance during delivery.' },
                        { icon: Truck, title: 'Yangon Delivery', desc: 'Fast, safe delivery across Yangon and selected Myanmar cities within 1–3 business days.' },
                    ].map((item, i) => (
                        <div key={i} className={`${panelClass} p-6 transition-colors hover:border-nature-olive/40 cursor-default`}>
                            <item.icon className="w-6 h-6 text-nature-olive mb-4" strokeWidth={1.5} />
                            <h3 className="text-nature-dark font-medium text-sm mb-1.5">{item.title}</h3>
                            <p className="text-nature-muted text-xs leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- FAQ --- */}
            <div className="max-w-3xl mx-auto px-4 mb-24">
                <p className={`${labelClass} text-center mb-2`}>Good to Know</p>
                <h2 className="font-serif text-3xl sm:text-4xl text-center mb-2">Frequently Asked Questions</h2>
                <p className="text-center text-nature-muted text-sm mb-10">Everything you need to know before ordering.</p>
                <div className="space-y-3">
                    {faqs.map((faq, i) => (
                        <div key={i} className={`${panelClass} transition-colors hover:border-nature-olive/40`}>
                            <button
                                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                className="w-full flex items-center justify-between gap-4 p-5 text-left text-nature-dark text-sm font-medium focus:outline-none"
                            >
                                {faq.q}
                                <ChevronDown className={`w-4 h-4 text-nature-muted flex-shrink-0 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} strokeWidth={1.5} />
                            </button>
                            {openFaq === i && (
                                <div className="px-5 pb-5 pt-4 text-nature-muted text-sm leading-relaxed border-t border-nature-border/50">
                                    {faq.a}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* --- GET IN TOUCH --- */}
            <div className="max-w-5xl mx-auto px-4 mb-24">
                <p className={`${labelClass} text-center mb-2`}>We're Here to Help</p>
                <h2 className="font-serif text-3xl sm:text-4xl text-center mb-2">Get In Touch</h2>
                <p className="text-center text-nature-muted text-sm mb-10">We're here to help you find your perfect fragrance.</p>
                <div className="grid md:grid-cols-2 gap-5">
                    {[
                        { icon: Phone, title: 'Phone / Viber', val: '+95 09123456789' },
                        { icon: Mail, title: 'Email', val: 'admin@scentoria.com' },
                        { icon: MapPin, title: 'Delivery Area', val: 'We deliver across Yangon and selected townships in Myanmar. Orders are dispatched from our Yangon warehouse.', isMulti: true },
                        { icon: Clock, title: 'Business Hours', val: 'Mon – Sat: 9:00 AM – 6:00 PM\nSunday: 10:00 AM – 4:00 PM', isMulti: true }
                    ].map((item, i) => (
                        <div key={i} className={`${panelClass} p-6 flex items-start gap-4 transition-colors hover:border-nature-olive/40 cursor-default`}>
                            <item.icon className="text-nature-olive mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                            <div>
                                <p className={`${labelClass} mb-1.5`}>{item.title}</p>
                                <p
                                    className={`text-nature-dark text-sm ${item.isMulti ? 'leading-relaxed text-nature-muted' : 'font-medium'}`}
                                    style={{ whiteSpace: 'pre-line' }}
                                >
                                    {item.val}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <SizeBanner />
        </div >
    );
}