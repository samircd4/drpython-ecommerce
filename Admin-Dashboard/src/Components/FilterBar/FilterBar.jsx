import React, { useState, useRef, useEffect } from 'react';
import { Star } from 'lucide-react';

const RatingStars = ({ count = 0 }) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        stars.push(
            <Star key={i} className={`w-4 h-4 ${i <= count ? 'text-yellow-400' : 'text-slate-500'}`} />
        );
    }
    return <div className="flex items-center space-x-0.5">{stars}</div>;
};

const FilterBar = ({
    showBy = 10,
    onShowByChange = () => { },
    rating = 0,
    onRatingChange = () => { },
    category = 'Category',
    onCategoryChange = () => { },
    brand = 'Brand',
    onBrandChange = () => { },
    searchQuery = '',
    setSearchQuery = () => { },
    showOptions = [10, 20, 50, 100],
    categories = [],
    brands = [],
}) => {
    const [ratingOpen, setRatingOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const onDoc = (e) => {
            if (!ref.current) return;
            if (!ref.current.contains(e.target)) setRatingOpen(false);
        };
        document.addEventListener('click', onDoc);
        return () => document.removeEventListener('click', onDoc);
    }, []);

    return (
        <div className="flex flex-wrap gap-3 items-center w-full">
            <select value={showBy} onChange={(e) => onShowByChange(Number(e.target.value))} className="flex-shrink-0 bg-[#0b1a2a] text-slate-200 border border-slate-700 rounded-md px-3 py-2 focus:outline-none">
                {showOptions.map((s) => (
                    <option key={s} value={s}>{s}</option>
                ))}
            </select>

            <div className="relative" ref={ref}>
                <button type="button" onClick={() => setRatingOpen((v) => !v)} className="flex items-center space-x-2 bg-[#0b1a2a] text-slate-200 border border-slate-700 rounded-md px-3 py-2 focus:outline-none">
                    <span className="text-sm">Rating</span>
                    <div className="ml-1"><RatingStars count={rating} /></div>
                </button>

                {ratingOpen && (
                    <div className="absolute left-0 mt-2 w-44 bg-[#071229] border border-slate-700 rounded-md shadow-lg p-2 z-50">
                        <button onClick={() => { onRatingChange(0); setRatingOpen(false); }} className="w-full text-left px-2 py-1 text-slate-200 hover:bg-slate-800 rounded">All</button>
                        {[5, 4, 3, 2, 1].map((r) => (
                            <button key={r} onClick={() => { onRatingChange(r); setRatingOpen(false); }} className="w-full flex items-center justify-between px-2 py-2 hover:bg-slate-800 rounded">
                                <div className="flex items-center gap-1">
                                    <RatingStars count={r} />
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <select value={category} onChange={(e) => onCategoryChange(e.target.value)} className="flex-shrink-0 bg-[#0b1a2a] text-slate-200 border border-slate-700 rounded-md px-3 py-2 focus:outline-none">
                <option value="Category">Category</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>

            <select value={brand} onChange={(e) => onBrandChange(e.target.value)} className="flex-shrink-0 bg-[#0b1a2a] text-slate-200 border border-slate-700 rounded-md px-3 py-2 focus:outline-none">
                <option value="Brand">Brand</option>
                {brands.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>

            <div className="flex-1 min-w-0">
                <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." className="w-full bg-[#0b1a2a] text-slate-200 border border-slate-700 rounded-md px-3 py-2 focus:outline-none" />
            </div>
        </div>
    );
};

export default FilterBar;
