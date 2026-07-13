import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Reusable numbered pagination, themed to match the rest of the app.
 *
 * Props:
 * - page: current page number (1-indexed)
 * - totalPages: total number of pages
 * - onChange: (nextPage: number) => void
 */
export default function Pagination({ page, totalPages, onChange }) {
    if (totalPages <= 1) return null;

    // Build a windowed page list with ellipses, e.g. 1 … 4 5 [6] 7 8 … 12
    const pages = [];
    const window = 1;
    for (let p = 1; p <= totalPages; p++) {
        if (p === 1 || p === totalPages || (p >= page - window && p <= page + window)) {
            pages.push(p);
        } else if (pages[pages.length - 1] !== '...') {
            pages.push('...');
        }
    }

    return (
        <nav className="flex items-center justify-center gap-1.5" aria-label="Pagination">
            <button
                onClick={() => onChange(Math.max(1, page - 1))}
                disabled={page === 1}
                className="w-9 h-9 flex items-center justify-center rounded-full border border-nature-border/70 text-nature-dark disabled:opacity-30 disabled:cursor-not-allowed hover:border-nature-olive hover:text-nature-olive transition-colors"
                aria-label="Previous page"
            >
                <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
            </button>

            {pages.map((p, i) =>
                p === '...' ? (
                    <span key={`ellipsis-${i}`} className="w-9 h-9 flex items-center justify-center text-nature-muted text-sm">
                        …
                    </span>
                ) : (
                    <button
                        key={p}
                        onClick={() => onChange(p)}
                        aria-current={p === page ? 'page' : undefined}
                        className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-medium transition-colors ${
                            p === page
                                ? 'bg-nature-olive text-white'
                                : 'text-nature-dark hover:bg-nature-sage/20'
                        }`}
                    >
                        {p}
                    </button>
                )
            )}

            <button
                onClick={() => onChange(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="w-9 h-9 flex items-center justify-center rounded-full border border-nature-border/70 text-nature-dark disabled:opacity-30 disabled:cursor-not-allowed hover:border-nature-olive hover:text-nature-olive transition-colors"
                aria-label="Next page"
            >
                <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
            </button>
        </nav>
    );
}