import React, { useState, useEffect } from 'react';
import Breadcrumb from '../Components/Layout/Breadcrumb';
import CategoryTable from '../Components/Product/CategoryTable';
import FilterBar from '../Components/FilterBar/FilterBar';
import api from '../api/axiosConfig';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showBy, setShowBy] = useState(12);

    useEffect(() => {
        const fetchCategories = async () => {
            setLoading(true);
            try {
                const response = await api.get('/categories/');
                setCategories(response.data.results || []);
            } catch (error) {
                console.error('Error fetching categories:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    const filteredCategories = categories.filter((c) => {
        const q = searchQuery.trim().toLowerCase();
        if (q) {
            return c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q);
        }
        return true;
    });

    const visibleCategories = filteredCategories.slice(0, showBy);

    return (
        <div className="p-0 sm:px-6 sm:py-4 min-h-screen" style={{ backgroundImage: 'linear-gradient(90deg,var(--bg-start),var(--bg-mid),var(--bg-end))' }}>
            <Breadcrumb title="Categories" paths={["Home", "Products", "Categories"]} />

            <div className="my-6">
                <FilterBar
                    showBy={showBy}
                    onShowByChange={setShowBy}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    showOptions={[12, 24, 48, 96]}
                    // Simplified filter for categories
                    categories={[]}
                    brands={[]}
                />
            </div>

            <CategoryTable categories={visibleCategories} loading={loading} />
        </div>
    );
};

export default Categories;
