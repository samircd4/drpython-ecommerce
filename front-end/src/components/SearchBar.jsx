// src/components/SearchBar.jsx
import React, { useState, useRef, useEffect } from 'react';
import { FiSearch } from 'react-icons/fi';
import api from '../api/client';
import { Link, useLocation } from 'react-router-dom';

const SearchBar = ({ onFocus, onBlur, onOpen, onClose }) => {
    const [showInput, setShowInput] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const location = useLocation();

    const wrapperRef = useRef(null);
    const inputRef = useRef(null);
    const debounceRef = useRef(null);

    // 🔁 Realtime search with debounce
    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        setLoading(true);

        debounceRef.current && clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(async () => {
            try {
                const res = await api.get(`/products/search/?q=${query}`);
                setResults(res.data.results || []);
            } catch (err) {
                console.error('Search error:', err);
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 400); // debounce delay

        return () => clearTimeout(debounceRef.current);
    }, [query]);

    // Focus input on mobile
    useEffect(() => {
        if (showInput && inputRef.current) {
            inputRef.current.focus();
        }
    }, [showInput]);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setShowInput(false);
                setQuery('');
                setResults([]);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close on navigation
    useEffect(() => {
        closeSearch();
    }, [location.pathname]);

    const handleSubmit = (e) => e.preventDefault();
    const closeSearch = () => {
        setShowInput(false);
        setQuery('');
        setResults([]);
        onClose && onClose();
    }

    return (
        <div ref={wrapperRef} className="relative w-full sm:max-w-xl">
            {/* Mobile icon */}
            {!showInput && (
                <button
                    type="button"
                    className="sm:hidden absolute right-0 top-1/2 -translate-y-1/2 p-2 z-10"
                    onClick={() => {
                        setShowInput(true);
                        onOpen && onOpen();
                    }}
                >
                    <FiSearch className="text-purple-600 text-2xl cursor-pointer" />
                </button>
            )}

            {/* Search input */}
            <form
                onSubmit={handleSubmit}
                className={`
                    w-full flex items-center border-2 border-purple-600 rounded-full bg-white
                    transition-all duration-300
                    ${showInput ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}
                    sm:opacity-100 sm:scale-100 sm:pointer-events-auto
                    px-2 py-1 sm:px-4 sm:py-2
                `}
            >
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search the product"
                    className="flex-1 outline-none bg-transparent text-gray-600"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={onFocus}
                    onBlur={onBlur}
                />
                <button
                    type="submit"
                    className="p-1 hover:scale-110 transition-transform cursor-pointer"
                    aria-label="Submit search"
                >
                    <FiSearch className="text-purple-600 text-xl" />
                </button>
            </form>

            {/* Results dropdown */}
            {(loading || results.length > 0) && (
                <div className="absolute left-0 right-0 mt-2 z-50">
                    <ul className="bg-white border rounded-lg shadow-lg max-h-72 overflow-y-auto">
                        {loading && (
                            <li className="px-4 py-3 text-gray-500 text-sm">
                                Searching...
                            </li>
                        )}

                        {!loading && results.map((product) => (
                            <Link
                                key={product.id}
                                to={`/products/${product.slug}`}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => closeSearch()}
                                className="block"
                            >
                                <li className="px-4 py-2 hover:bg-purple-50 cursor-pointer flex items-center gap-3">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-10 h-10 object-cover rounded"
                                    />
                                    <div className="flex-1">
                                        <p className="font-medium text-sm truncate">
                                            {product.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            ৳ {product.price}
                                        </p>
                                    </div>
                                </li>
                            </Link>
                        ))}


                        {!loading && query && results.length === 0 && (
                            <li className="px-4 py-3 text-gray-500 text-sm">
                                No products found
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default SearchBar;
