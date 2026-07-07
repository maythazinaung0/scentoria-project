import { theme } from '../theme'; // လမ်းကြောင်းမှန်အောင် သေချာစစ်ပါ

export default function SizeBanner() {
    return (
        // Padding အပိုတွေမပါအောင် container-width ကို full ထားပါ
        <section className="relative w-full overflow-hidden">
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center z-0"
                style={{
                    backgroundImage: "url('https://images.pexels.com/photos/9944432/pexels-photo-9944432.jpeg')",
                }}
            />
            {/* Overlay - Page ရဲ့ background color နဲ့ အရောင်တူစေရန် */}
            <div className="absolute inset-0 bg-nature-bg/80 z-0" />

            {/* Content */}
            <div className="relative z-10 py-20 px-6 text-center">
                <p className="text-[10px] tracking-[0.3em] uppercase mb-2 font-medium text-nature-olive">Available Volumes</p>
                <h3 className="font-serif text-3xl mb-2 text-gray-900">30ml, 50ml &amp; 100ml</h3>
                <p className="text-gray-700 text-sm">Travel light or indulge fully — choose the size that fits your lifestyle.</p>
            </div>
        </section>
    );
}