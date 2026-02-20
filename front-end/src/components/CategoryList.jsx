// src/components/CategoryList.jsx
import React, { useEffect, useState, useRef } from 'react';
import { MdApps } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

const CategoryList = ({ onNavigate }) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const listRef = useRef(null);
    const navigate = useNavigate();

    const slugify = (text) => {
        return text.toString().toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '')
    }

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get(`/categories/`);
                const data = Array.isArray(response.data) ? response.data : (response.data.results || []);
                setCategories(data); // Limit to first 8 to match design
                setLoading(false);
            } catch (error) {
                console.error("Error fetching categories:", error);
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    const handleCategoryClick = (cat) => {
        const slug = cat.slug || slugify(cat.name);
        navigate(`/category/${slug}`);
        if (typeof onNavigate === 'function') onNavigate();
    };

    const handleMoreClick = () => {
        if (listRef.current) {
            listRef.current.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
            
        }
    };

    if (loading) {
        return (
            <div className="w-full md:w-60 bg-white rounded-lg shadow animate-pulse">
                <div className="h-12 bg-purple-200 rounded-t-lg mb-2"></div>
                <div className="space-y-2 p-4">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-8 bg-gray-100 rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full md:w-60 bg-white rounded-lg shadow">
            <div className="flex items-center gap-2 bg-purple-600 text-white font-bold px-4 py-3 rounded-t-lg text-lg">
                <MdApps className="text-xl" />
                <span>All Categories</span>
            </div>
            <ul ref={listRef} className="overflow-y-visible md:overflow-y-auto md:max-h-[440px] scrollbar-hide hide-scrollbar">
                {categories.map(cat => (
                    <li
                        key={cat.id || cat.name}
                        onClick={() => handleCategoryClick(cat)}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-purple-100 cursor-pointer text-base"
                    >
                        {cat.logo ? (
                            <img
                                src={cat.logo}
                                alt={cat.name}
                                className="w-5 h-5 object-contain"
                            />
                        ) : (
                            <span className="text-lg">📱</span> /* Fallback icon */
                        )}
                        <span className="truncate">{cat.name}</span>
                    </li>
                ))}
                <li className="sticky bottom-0 bg-white">
                    <button
                        onClick={handleMoreClick}
                        className='hidden sm:block w-full text-center p-2 bg-purple-600 text-white font-bold rounded cursor-pointer py-3'
                    >
                        More
                    </button>
                </li>
            </ul>
        </div>
    );
};

export default CategoryList;
