import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

const PER_PAGE_OPTIONS = [8, 16, 24, 48];

/**
 * Compact, data-dense pagination for admin tables/grids.
 * Styled as a footer bar so it visually continues the table/grid above it.
 */
export default function AdminPagination({ page, totalPages, onPageChange, perPage, onPerPageChange, totalItems }) {
  const start = totalItems === 0 ? 0 : (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, totalItems);

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
    <div className="flex flex-wrap items-center justify-between gap-4 bg-nature-card border border-nature-olive/20 border-t-0 rounded-b-2xl px-5 py-4 -mt-6">
      <div className="flex items-center gap-3 text-xs text-nature-muted">
        <span>
          Showing <span className="font-medium text-nature-dark">{start}–{end}</span> of{' '}
          <span className="font-medium text-nature-dark">{totalItems}</span>
        </span>

        <div className="w-px h-4 bg-nature-olive/20" />

        <label className="flex items-center gap-1.5">
          <span>Rows</span>
          <div className="relative">
            <select
              value={perPage}
              onChange={(e) => onPerPageChange(Number(e.target.value))}
              className="appearance-none bg-nature-bg border border-nature-olive/25 rounded-lg pl-2.5 pr-6 py-1 text-xs text-nature-dark outline-none focus:border-nature-olive/60 transition-colors cursor-pointer"
            >
              {PER_PAGE_OPTIONS.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-nature-olive absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={2} />
          </div>
        </label>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-nature-olive/25 text-nature-dark disabled:opacity-30 disabled:cursor-not-allowed hover:border-nature-olive hover:text-nature-olive hover:bg-nature-olive/5 transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-3.5 h-3.5" strokeWidth={1.75} />
          </button>

          {pages.map((p, i) =>
            p === '...' ? (
              <span key={`ellipsis-${i}`} className="w-7 h-7 flex items-center justify-center text-nature-muted text-xs">
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                aria-current={p === page ? 'page' : undefined}
                className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-medium transition-colors ${
                  p === page
                    ? 'bg-nature-olive text-white shadow-[0_2px_8px_-2px_rgba(74,104,56,0.5)]'
                    : 'text-nature-dark hover:bg-nature-sage/20'
                }`}
              >
                {p}
              </button>
            )
          )}

          <button
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-nature-olive/25 text-nature-dark disabled:opacity-30 disabled:cursor-not-allowed hover:border-nature-olive hover:text-nature-olive hover:bg-nature-olive/5 transition-colors"
            aria-label="Next page"
          >
            <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.75} />
          </button>
        </div>
      )}
    </div>
  );
}