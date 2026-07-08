import { Link } from 'react-router-dom';
import {
    Heart, Package, Award, Truck, Shield, Leaf,
    Phone, Mail, MapPin, Clock, ChevronDown
} from 'lucide-react';
import { useState } from 'react';
import ScentoriaLogo from '../../components/ScentoriaLogo';
import { theme } from '../../theme';
import SizeBanner from '../../components/SizeBanner';

const faqs = [
    { q: 'Are your fragrances authentic?', a: 'Our fragrances are premium inspired alternatives — expertly crafted to closely mirror iconic designer and niche scents using high-quality fragrance oils. They are not counterfeit products but original formulations that capture the spirit of luxury perfumery.' },
    { q: 'How long do your fragrances last?', a: 'Our high-concentration oils typically last 6–10 hours on skin, sometimes longer on fabric. Regular size (full bottle) contains more oil for extended wear, while the small size is perfect for trying a new scent or carrying with you.' },
    { q: 'How does the Virtual Wallet work?', a: 'Top up your Scentoria Wallet from your profile page. Once admin approves your top-up (usually within 24 hours), the balance is added. You can then use it to checkout instantly — no need to pay each time.' },
    { q: 'What is the delivery area?', a: 'We currently deliver across Yangon and selected cities in Myanmar. Delivery times vary by location — typically 1–3 business days within Yangon.' },
    { q: 'Can I return or exchange a product?', a: 'We accept returns within 7 days if the product is unused and in original packaging. For exchanges, please contact us via Viber or Facebook before returning the item.' },
    { q: 'How do I know which scent is right for me?', a: 'Browse our Scent Profiles page — each profile explains the fragrance family, top/middle/base notes, and the mood it evokes. You can also message us on Facebook or Viber and we\'ll recommend based on your preferences.' },
];

export default function AboutPage() {
    const [openFaq, setOpenFaq] = useState(null);

    return (
        <div className="bg-nature-bg text-nature-dark">
            {/* Header with explicit top padding */}
            <div className="max-w-5xl mx-auto px-4 text-center pt-24 mb-16">
                <div className="flex items-center justify-center gap-3 mb-5">
                    <ScentoriaLogo className="w-10 h-12 text-nature-olive" />
                    <h1 className="font-serif text-5xl text-nature-dark tracking-tight">{theme.brand.name}</h1>
                </div>
                <p className="text-lg text-nature-muted max-w-2xl mx-auto mb-8">Premium inspired fragrances at honest prices — helping you discover your signature scent.</p>
                <div className="flex justify-center gap-4">
                    <Link to="/products" className="bg-nature-olive text-white px-8 py-3 rounded-lg hover:bg-nature-dark transition-colors">SHOP NOW</Link>
                    <Link to="/scents" className="border border-nature-border px-8 py-3 rounded-lg hover:bg-white transition-colors">EXPLORE SCENTS</Link>
                </div>
            </div>

            {/* Our Story */}
            <div className="max-w-5xl mx-auto px-4 mb-20">
                <h2 className="font-serif text-4xl mb-8">Our Story</h2>
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <img src="https://images.pexels.com/photos/13284500/pexels-photo-13284500.jpeg" alt="Story" className="rounded-2xl shadow-lg" />
                    <div className="space-y-4 text-sm text-nature-muted leading-relaxed">
                        <p>{theme.brand.name} was founded with one belief: everyone deserves to smell extraordinary. In Myanmar's fragrance market, authentic luxury scents remain out of reach for most. We set out to change that.</p>
                        <p>We carefully craft inspired fragrances that capture the character and soul of iconic designer and niche perfumes — using premium fragrance oils formulated to perform at the same level as their inspirations.</p>
                        <p>Every bottle is filled with care, and every order is personally packed by our team in Yangon. We're not a faceless warehouse — we're fragrance lovers who want to share the joy of great scent with you.</p>
                        <div className="flex gap-8 pt-4">
                            <div><p className="font-serif text-2xl text-nature-olive">50+</p><p className="text-xs">Fragrances</p></div>
                            <div><p className="font-serif text-2xl text-nature-olive">1K+</p><p className="text-xs">Happy Customers</p></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Why Choose Scentoria */}
            <div className="max-w-5xl mx-auto px-4 mb-20">
                <h2 className="font-serif text-3xl text-center mb-2">Why Choose Scentoria</h2>
                <p className="text-center text-nature-muted mb-10 font-sans">Quality you can trust, prices you'll love.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { icon: Package, title: 'Premium Quality', desc: 'High-concentration fragrance oils that perform and last just as long as the originals.' },
                        { icon: Award, title: 'Expert Selection', desc: 'Every scent is hand-picked and tested by our team before it reaches our catalogue.' },
                        { icon: Heart, title: 'Fair Pricing', desc: 'No celebrity endorsements or extravagant advertising. Just great fragrance at fair cost.' },
                        { icon: Shield, title: 'Safe & Cruelty-Free', desc: 'Skin-safe formulations with no animal testing. Safe for daily wear.' },
                        { icon: Leaf, title: 'Thoughtful Packaging', desc: 'Clean, minimal packaging designed to protect your fragrance during delivery.' },
                        { icon: Truck, title: 'Yangon Delivery', desc: 'Fast, safe delivery across Yangon and selected Myanmar cities within 1–3 business days.' },
                    ].map((item, i) => (
                        <div key={i} className="bg-white p-6 rounded-xl border border-nature-border transition-all duration-300 hover:border-nature-olive hover:shadow-lg cursor-default">
                            <item.icon className="w-8 h-8 text-nature-olive mb-3" />
                            <h3 className="font-medium mb-1 font-sans">{item.title}</h3>
                            <p className="text-xs text-nature-muted font-sans">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* FAQ */}
            <div className="max-w-3xl mx-auto px-4 mb-20">
                <h2 className="font-serif text-3xl text-center mb-2">Frequently Asked Questions</h2>
                <p className="text-center text-nature-muted mb-8 font-sans">Everything you need to know before ordering.</p>
                <div className="space-y-4">
                    {faqs.map((faq, i) => (
                        <div key={i} className="bg-white rounded-xl border border-nature-border transition-all duration-300 hover:border-nature-olive hover:shadow-md">
                            <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex justify-between p-5 text-left font-medium text-sm font-sans focus:outline-none">
                                {faq.q}
                                <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} />
                            </button>
                            {openFaq === i && (
                                <div className="p-5 pt-0 text-sm text-nature-muted border-t border-nature-border pt-3 font-sans">
                                    {faq.a}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Get In Touch */}
            <div className="max-w-5xl mx-auto px-4 mb-20">
                <h2 className="font-serif text-3xl text-center mb-2">Get In Touch</h2>
                <p className="text-center text-nature-muted mb-8 font-sans">We're here to help you find your perfect fragrance.</p>
                <div className="grid md:grid-cols-2 gap-6">
                    {[
                        { icon: Phone, title: 'Phone / Viber', val: '+95 9 123 456 789' },
                        { icon: Mail, title: 'Email', val: 'hello@scentoria.com' },
                        { icon: MapPin, title: 'Delivery Area', val: 'We deliver across Yangon and selected townships in Myanmar. Orders are dispatched from our Yangon warehouse.', isMulti: true },
                        { icon: Clock, title: 'Business Hours', val: 'Mon – Sat: 9:00 AM – 6:00 PM\nSunday: 10:00 AM – 4:00 PM', isMulti: true }
                    ].map((item, i) => (
                        <div key={i} className="bg-white p-6 rounded-xl border border-nature-border transition-all duration-300 hover:border-nature-olive hover:shadow-md flex items-start gap-4 cursor-default">
                            <item.icon className="text-nature-olive mt-1 flex-shrink-0" />
                            <div>
                                <p className="text-xs text-nature-muted uppercase tracking-wider mb-1 font-sans">{item.title}</p>
                                <p className={`text-sm text-nature-dark font-sans ${item.isMulti ? 'leading-relaxed' : 'font-medium'}`} style={{ whiteSpace: 'pre-line' }}>{item.val}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <SizeBanner />
        </div>
    );
}