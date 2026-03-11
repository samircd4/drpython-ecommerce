import React, { useState, useEffect } from "react";
import Breadcrumb from "../Components/Layout/Breadcrumb";
import BestSellingProductsTable from "../Components/Dashboard/BestSellingProductsTable";
import StatsGrid from "../Components/Dashboard/StatsGrid";
import PopularClients from "../Components/Dashboard/PopularClients";
import OrdersOverview from "../Components/Dashboard/OrdersOverview";
import FilterBar from "../Components/FilterBar/FilterBar";
import Pagination from "../Components/Layout/Pagination";
import api from "../api/axiosConfig";

const Dashboard = () => {
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

                // On Dashboard, we can prioritize showing products marked as bestsellers if the API supports it
                // For now, we use the results from the first page
                setProducts(productsRes.data.results || []);
                setAllBrands(brandsRes.data.results || []);
                setAllCategories(categoriesRes.data.results || []);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
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

            // Handle nested objects for sort if necessary (though Table handle labels)
            if (column === 'category') valA = a.category?.name;
            if (column === 'brand') valA = a.brand?.name;

            if (valA === undefined || valA === null) valA = '';
            if (valB === undefined || valB === null) valB = '';

            if (typeof valA === 'string' || typeof valB === 'string') {
                const sA = String(valA).toLowerCase();
                const sB = String(valB).toLowerCase();
                if (sA < sB) return direction === 'asc' ? -1 : 1;
                if (sA > sB) return direction === 'asc' ? 1 : -1;
                return 0;
            }

            const nA = Number(valA);
            const nB = Number(valB);
            if (isNaN(nA) || isNaN(nB)) {
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

    const filteredProducts = products.filter((p) => {
        const q = searchQuery.trim().toLowerCase();
        if (q) {
            const matchesSearch = String(p.name).toLowerCase().includes(q) ||
                String(p.category?.name).toLowerCase().includes(q) ||
                String(p.brand?.name).toLowerCase().includes(q) ||
                String(p.product_id || p.sku).toLowerCase().includes(q) ||
                String(p.description).toLowerCase().includes(q);
            if (!matchesSearch) return false;
        }

        if (ratingFilter && p.rating < ratingFilter) return false;
        if (categoryFilter && categoryFilter !== 'Category' && p.category?.name !== categoryFilter) return false;
        if (brandFilter && brandFilter !== 'Brand' && p.brand?.name !== brandFilter) return false;
        return true;
    });

    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / showBy));
    const visibleProducts = filteredProducts.slice((page - 1) * showBy, page * showBy);

    return (
        <div className="p-0 sm:p-6 min-h-screen bg-transparent bg-slate-900/50">
            <Breadcrumb title="Dashboard" paths={["Home"]} />

            <StatsGrid />

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PopularClients />
                <OrdersOverview />
            </div>

            <div className="mt-6 rounded-xl bg-[#071229] p-6 shadow-md border border-slate-800 text-white">
                <div className="mb-6">
                    <h2 className="text-xl font-bold mb-4">Best Selling Products</h2>
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
                        showOptions={[12, 24, 48, 96]}
                        categories={categories}
                        brands={brands}
                    />
                </div>

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

                {!loading && (
                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-sm text-slate-400">
                            Showing <span className="text-slate-200 font-semibold">{visibleProducts.length}</span> of <span className="text-slate-200 font-semibold">{filteredProducts.length}</span> entries
                        </div>
                        <Pagination page={page} setPage={setPage} total={totalPages} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
