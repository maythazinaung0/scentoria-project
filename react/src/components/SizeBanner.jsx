import { theme } from '../theme';
// Drop perfume-bottles.jpg into src/assets/ (adjust the path below if you
// place it somewhere else, e.g. public/images/ — in that case use
// backgroundImage: "url('/images/perfume-bottles.jpg')" instead of the import).
import perfumeBottles from '../assets/perfume-bottles.jpg';

export default function SizeBanner() {
    return (
        <section
            className="relative w-full overflow-hidden"
            style={{ backgroundColor: '#d98a9c' }} // matches the photo's pink backdrop
        >
            <div className="relative z-10 max-w-4xl mx-auto grid grid-cols-3 md:grid-cols-2 items-center">
                {/* Text — lives in the solid pink area beside the photo, so it
                    never has to compete with the bottles for contrast */}
                <div className="order-2 md:order-1 text-center md:text-left px-6 py-10 md:py-0">
                    <p className="text-[10px] tracking-[0.3em] uppercase mb-2 font-medium text-white/80">Available Volumes</p>
                    <h3 className="font-serif text-3xl md:text-4xl mb-2 text-white drop-shadow-sm">30ml, 50ml &amp; 100ml</h3>
                    <p className="text-white/90 text-sm max-w-xs mx-auto md:mx-0">Travel light or indulge fully — choose the size that fits your lifestyle.</p>
                </div>

                {/* Photo */}
                <div className="order-1 md:order-2 relative h-[180px] md:h-[270px]">
                    <div
                        className="absolute inset-0 bg-contain bg-center bg-no-repeat"
                        style={{ backgroundImage: `url(${perfumeBottles})` }}
                    />
                    {/* A light overlay for tonal cohesion with the pink backdrop —
                        subtle on purpose, since the photo no longer needs to
                        carry legible text on top of it */}
<div className="absolute inset-0 bg-black/5" />                </div>
            </div>
        </section>
    );
}