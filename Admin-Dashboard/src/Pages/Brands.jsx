import React, { useState, useEffect } from 'react';
import Breadcrumb from '../Components/Layout/Breadcrumb';
import BrandTable from '../Components/Product/BrandTable';
import FilterBar from '../Components/FilterBar/FilterBar';
import api from '../api/axiosConfig';

const Brands = () => {
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showBy, setShowBy] = useState(12);

    useEffect(() => {
        const fetchBrands = async () => {
            setLoading(true);
            try {
                const response = await api.get('/brands/');
                setBrands(response.data.results || []);
            } catch (error) {
                console.error('Error fetching brands:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchBrands();
    }, []);

    const filteredBrands = brands.filter((b) => {
        const q = searchQuery.trim().toLowerCase();
        if (q) {
            return b.name.toLowerCase().includes(q) || b.slug.toLowerCase().includes(q);
        }
        return true;
    });

    const visibleBrands = filteredBrands.slice(0, showBy);

    return (
        <div className="p-0 sm:px-6 sm:py-4 min-h-screen" style={{ backgroundImage: 'linear-gradient(90deg,var(--bg-start),var(--bg-mid),var(--bg-end))' }}>
            <Breadcrumb title="Brands" paths={["Home", "Products", "Brands"]} />

            <div className="my-6">
                <FilterBar
                    showBy={showBy}
                    onShowByChange={setShowBy}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    showOptions={[12, 24, 48, 96]}
                    // Simplified filter for brands (no category/rating filter for now)
                    categories={[]}
                    brands={[]}
                />
            </div>

            <BrandTable brands={visibleBrands} loading={loading} />
        </div>
    );
};

export default Brands;
