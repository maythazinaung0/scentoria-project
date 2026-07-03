import { Link } from 'react-router-dom';
import {
    Heart, Package, Award, Truck, Shield, Leaf,
    Phone, Mail, MapPin, Clock, ChevronDown, ChevronUp
} from 'lucide-react';
import { useState } from 'react';
import ScentoriaLogo from '../../components/ScentoriaLogo';

import { theme } from '../../theme';

const faqs = [
    {
        q: 'Are your fragrances authentic?',
        a: 'Our fragrances are premium inspired alternatives — expertly crafted to closely mirror iconic designer and niche scents using high-quality fragrance oils. They are not counterfeit products but original formulations that capture the spirit of luxury perfumery.',
    },
    {
        q: 'How long do your fragrances last?',
        a: 'Our high-concentration oils typically last 6–10 hours on skin, sometimes longer on fabric. Regular size (full bottle) contains more oil for extended wear, while the small size is perfect for trying a new scent or carrying with you.',
    },
    {
        q: 'How does the Virtual Wallet work?',
        a: 'Top up your Scentoria Wallet from your profile page. Once admin approves your top-up (usually within 24 hours), the balance is added. You can then use it to checkout instantly — no need to pay each time.',
    },
    {
        q: 'What is the delivery area?',
        a: 'We currently deliver across Yangon and selected cities in Myanmar. Delivery times vary by location — typically 1–3 business days within Yangon.',
    },
    {
        q: 'Can I return or exchange a product?',
        a: 'We accept returns within 7 days if the product is unused and in original packaging. For exchanges, please contact us via Viber or Facebook before returning the item.',
    },
    {
        q: 'How do I know which scent is right for me?',
        a: 'Browse our Scent Profiles page — each profile explains the fragrance family, top/middle/base notes, and the mood it evokes. You can also message us on Facebook or Viber and we\'ll recommend based on your preferences.',
    },
];

export default function AboutPage() {
    const [openFaq, setOpenFaq] = useState(null);

    return (
        <div className="min-h-screen bg-nature-bg text-nature-dark pt-24 pb-20">

            <div className="max-w-5xl mx-auto px-4 text-center mb-16">
                <div className="flex items-center justify-center gap-3 mb-5">
                    <ScentoriaLogo className="w-9 h-11 text-nature-olive" />
                    <h1 className="font-serif text-4xl sm:text-5xl text-nature-dark tracking-wide">{theme.brand.name}</h1>
                </div>
                <p className="text-lg sm:text-xl text-nature-muted max-w-2xl mx-auto leading-relaxed">
                    Premium inspired fragrances at honest prices — helping you discover your signature scent.
                </p>
                <div className="flex flex-wrap justify-center gap-3 mt-7">
                    <Link to="/products" className="bg-nature-olive hover:bg-nature-olive-dark text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm tracking-wider">
                        SHOP NOW
                    </Link>
                    <Link to="/scents" className="border border-nature-olive/40 text-nature-olive hover:bg-nature-sage/10 px-6 py-3 rounded-xl transition-colors text-sm tracking-wider">
                        EXPLORE SCENTS
                    </Link>
                </div>
            </div>

            {/* အခြား sections များမှာလည်း တူညီစွာဖြင့် ဆက်လက်ထားရှိပါသည် */}
            <div className="max-w-5xl mx-auto px-4 mb-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    <div>
                        <img
                            src="https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg?auto=compress&cs=tinysrgb&w=700"
                            alt="Scentoria perfume collection"
                            className="w-full rounded-2xl object-cover h-72 lg:h-96 border border-nature-border"
                        />
                    </div>
                    <div>
                        <h2 className="font-serif text-3xl text-nature-dark mb-5">Our Story</h2>
                        <div className="space-y-4 text-nature-dark leading-relaxed text-sm">
                            <p>{theme.brand.name} was founded with one belief: everyone deserves to smell extraordinary. In Myanmar's fragrance market, authentic luxury scents remain out of reach for most. We set out to change that.</p>
                            <p>We carefully craft inspired fragrances that capture the character and soul of iconic designer and niche perfumes — using premium fragrance oils formulated to perform at the same level as their inspirations.</p>
                            <p>Every bottle is filled with care, and every order is personally packed by our team in Yangon. We're not a faceless warehouse — we're fragrance lovers who want to share the joy of great scent with you.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* FAQ Section */}
            <div className="max-w-3xl mx-auto px-4 mb-16">
                <h2 className="font-serif text-3xl text-nature-dark text-center mb-2">Frequently Asked Questions</h2>
                <div className="space-y-2">
                    {faqs.map((faq, i) => (
                        <div key={i} className="bg-nature-card border border-nature-border rounded-xl overflow-hidden">
                            <button
                                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-nature-sage/10 transition-colors"
                            >
                                <span className="text-nature-dark text-sm font-medium pr-4">{faq.q}</span>
                                {openFaq === i
                                    ? <ChevronUp className="w-4 h-4 text-nature-olive flex-shrink-0" />
                                    : <ChevronDown className="w-4 h-4 text-nature-muted flex-shrink-0" />
                                }
                            </button>
                            {openFaq === i && (
                                <div className="px-5 pb-4">
                                    <p className="text-nature-muted text-sm leading-relaxed border-t border-nature-border pt-3">{faq.a}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}