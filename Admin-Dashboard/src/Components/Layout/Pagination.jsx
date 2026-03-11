import React from 'react';

const Pagination = ({ page, setPage, total }) => {
    if (total <= 1) return null;

    const pages = [];
    const start = Math.max(1, page - 1);
    const end = Math.min(total, page + 1);

    if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push('...');
    }

    for (let i = start; i <= end; i++) {
        pages.push(i);
    }

    if (end < total) {
        if (end < total - 1) pages.push('...');
        pages.push(total);
    }

    return (
        <div className="flex items-center space-x-2">
            <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${page === 1
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                    }`}
            >
                ‹ Previous
            </button>

            <div className="flex items-center space-x-1">
                {pages.map((p, idx) => (
                    p === '...' ? (
                        <span key={`dots-${idx}`} className="px-2 text-slate-500">...</span>
                    ) : (
                        <button
                            key={p}
                            onClick={() => setPage(p)}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${p === page
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                                }`}
                        >
                            {p}
                        </button>
                    )
                ))}
            </div>

            <button
                disabled={page === total}
                onClick={() => setPage((p) => Math.min(total, p + 1))}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${page === total
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                    }`}
            >
                Next ›
            </button>
        </div>
    );
};

export default Pagination;
