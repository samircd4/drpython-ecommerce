import React, { useState, useEffect } from 'react';
import FilterBar from '../Components/FilterBar/FilterBar';
import BestSellingProductsTable from '../Components/Dashboard/BestSellingProductsTable';
import Breadcrumb from '../Components/Layout/Breadcrumb';
import Pagination from '../Components/Layout/Pagination';
import api from '../api/axiosConfig';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [allCategories, setAllCategories] = useState([]);
    const [allBrands, setAllBrands] = useState([]);
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');
    const [searchQuery, setSearchQuery] = useState('');
    const [showBy, setShowBy] = useState(12);
    const [ratingFilter, setRatingFilter] = useState(0);
    const [categoryFilter, setCategoryFilter] = useState('Category');
    const [brandFilter, setBrandFilter] = useState('Brand');
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch Products, Brands, and Categories in parallel
                const [productsRes, brandsRes, categoriesRes] = await Promise.all([
                    api.get('/products/'),
                    api.get('/brands/'),
                    api.get('/categories/')
                ]);

                setProducts(productsRes.data.results || []);
                setTotalCount(productsRes.data.count || 0);
                setAllBrands(brandsRes.data.results || []);
                setAllCategories(categoriesRes.data.results || []);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSort = (column) => {
        let direction = 'asc';
        if (sortColumn === column && sortDirection === 'asc') {
            direction = 'desc';
        }
        setSortColumn(column);
        setSortDirection(direction);

        const sortedProducts = [...products].sort((a, b) => {
            let valA = a[column];
            let valB = b[column];

            // Normalize undefined/null
            if (valA === undefined || valA === null) valA = '';
            if (valB === undefined || valB === null) valB = '';

            // If either value is a string, compare as string (case-insensitive)
            if (typeof valA === 'string' || typeof valB === 'string') {
                const sA = String(valA).toLowerCase();
                const sB = String(valB).toLowerCase();
                if (sA < sB) return direction === 'asc' ? -1 : 1;
                if (sA > sB) return direction === 'asc' ? 1 : -1;
                return 0;
            }

            // Otherwise compare numbers
            const nA = Number(valA);
            const nB = Number(valB);
            if (isNaN(nA) || isNaN(nB)) {
                // Fallback to string compare if values aren't numeric
                const sA = String(valA).toLowerCase();
                const sB = String(valB).toLowerCase();
                if (sA < sB) return direction === 'asc' ? -1 : 1;
                if (sA > sB) return direction === 'asc' ? 1 : -1;
                return 0;
            }

            return direction === 'asc' ? nA - nB : nB - nA;
        });

        setProducts(sortedProducts);
    };

    const categories = allCategories.map(c => c.name).filter(Boolean);
    const brands = allBrands.map(b => b.name).filter(Boolean);

    // Compute filteredProducts from current products and filters
    const filteredProducts = products.filter((p) => {
        const q = searchQuery.trim().toLowerCase();
        if (q) {
            const matchesSearch = String(p.name).toLowerCase().includes(q) ||
                String(p.category?.name).toLowerCase().includes(q) ||
                String(p.brand?.name).toLowerCase().includes(q) ||
                String(p.product_id).toLowerCase().includes(q) ||
                String(p.description).toLowerCase().includes(q);
            if (!matchesSearch) return false;
        }

        if (ratingFilter && p.rating < ratingFilter) return false;
        if (categoryFilter && categoryFilter !== 'Category' && p.category?.name !== categoryFilter) return false;
        if (brandFilter && brandFilter !== 'Brand' && p.brand?.name !== brandFilter) return false;
        return true;
    });

    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / showBy));
    // apply pagination slicing
    const visibleProducts = filteredProducts.slice((page - 1) * showBy, page * showBy);

    return (
        <div className="p-0 sm:px-6 sm:py-4 min-h-screen" style={{ backgroundImage: 'linear-gradient(90deg,var(--bg-start),var(--bg-mid),var(--bg-end))' }}>
            <Breadcrumb title="Products" paths={["Home", "Products"]} />

            {/* Top Filter Section (use shared FilterBar) */}
            <div className="my-6">
                <FilterBar
                    showBy={showBy}
                    onShowByChange={(n) => { setShowBy(n); setPage(1); }}
                    rating={ratingFilter}
                    onRatingChange={(r) => { setRatingFilter(r); setPage(1); }}
                    category={categoryFilter}
                    onCategoryChange={(c) => { setCategoryFilter(c); setPage(1); }}
                    brand={brandFilter}
                    onBrandChange={(b) => { setBrandFilter(b); setPage(1); }}
                    searchQuery={searchQuery}
                    setSearchQuery={(v) => { setSearchQuery(v); setPage(1); }}
                    showOptions={[12, 24, 48]}
                    categories={categories}
                    brands={brands}
                />
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex items-center justify-center p-20 bg-[#0b1a2a]/50 rounded-2xl border border-slate-800">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <BestSellingProductsTable
                    products={visibleProducts}
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    handleSort={handleSort}
                />
            )}

            {/* Pagination Bottom */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-slate-400">
                    Showing <span className="text-slate-200 font-semibold">{visibleProducts.length}</span> of <span className="text-slate-200 font-semibold">{filteredProducts.length}</span> entries
                </div>
                <Pagination page={page} setPage={setPage} total={totalPages} />
            </div>
        </div>
    );
};

export default Products;
