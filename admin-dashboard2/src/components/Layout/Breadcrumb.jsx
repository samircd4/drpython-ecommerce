import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

/**
 * Enhanced Breadcrumb Component
 * @param {string} title - The main heading for the page
 * @param {Array<string|{label: string, path: string}>} paths - Navigation levels
 */
const Breadcrumb = ({ title = "", paths = [] }) => {
    
    // Helper to resolve path for legacy string-only arrays
    const resolvePath = (p, idx) => {
        if (typeof p === 'object') return p.path;
        
        const label = p.toLowerCase();
        if (label === 'home') return '/';
        if (label === 'dashboard') return '/';
        if (idx === paths.length - 1) return null; // Current page usually not clickable
        
        // Basic mapping for common strings
        const mapping = {
            'users': '/users',
            'customers': '/customers',
            'products': '/products',
            'orders': '/orders',
            'settings': '/settings',
            'reports': '/reports',
            'reviews': '/reviews',
            'inventory': '/inventory',
            'payments': '/payments',
            'categories': '/categories',
            'brands': '/brands'
        };
        
        return mapping[label] || null;
    };

    const getLabel = (p) => typeof p === 'object' ? p.label : p;

    return (
        <div className="sticky top-0 z-30 pt-3 pb-2 -mx-4 px-4 sm:-mx-8 sm:px-8 bg-[#071229]/80 backdrop-blur-md border-b border-slate-800/20 mb-6">
            <div className="rounded-[1.25rem] sm:rounded-[1.5rem] bg-[#112960]/40 p-3 sm:p-5 border border-slate-700/30 shadow-2xl shadow-black/20 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 transition-all hover:bg-[#112960]/60">
                <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto">
                    <div className="hidden sm:flex p-2 bg-indigo-500/20 rounded-xl">
                        <Home className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div className="min-w-0">
                        <h2 className="text-lg sm:text-2xl font-black text-white truncate tracking-tight uppercase leading-tight">{title}</h2>
                        <div className="md:hidden h-0.5 w-8 bg-indigo-500 rounded-full mt-0.5" />
                    </div>
                </div>

                <div className="w-full md:w-auto overflow-x-auto whitespace-nowrap scrollbar-hide py-0.5">
                    {paths && paths.length > 0 && (
                        <nav className="flex items-center gap-1.5">
                            {paths.map((p, idx) => {
                                const path = resolvePath(p, idx);
                                const label = getLabel(p);
                                const isLast = idx === paths.length - 1;

                                return (
                                    <React.Fragment key={idx}>
                                        {path && !isLast ? (
                                            <Link 
                                                to={path}
                                                className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-sky-400 hover:text-white transition-all"
                                            >
                                                {label}
                                            </Link>
                                        ) : (
                                            <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest ${isLast ? "text-slate-100" : "text-slate-500"}`}>
                                                {label}
                                            </span>
                                        )}
                                        {!isLast && (
                                            <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-700" />
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </nav>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Breadcrumb;
