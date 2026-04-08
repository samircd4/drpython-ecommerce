import React, { useState, useEffect } from "react";
import Breadcrumb from "../components/Layout/Breadcrumb";
import BestSellingProductsTable from "../components/Dashboard/BestSellingProductsTable";
import StatsGrid from "../components/Dashboard/StatsGrid";
import PopularClients from "../components/Dashboard/PopularClients";
import OrdersOverview from "../components/Dashboard/OrdersOverview";
import FilterBar from "../components/FilterBar/FilterBar";
import Pagination from "../components/Layout/Pagination";
import api from "../api/axiosConfig";

const Dashboard = () => {
    const [products, setProducts] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [allCategories, setAllCategories] = useState([]);
    const [allBrands, setAllBrands] = useState([]);
    const [sortColumn, setSortColumn] = useState('sold_count');
    const [sortDirection, setSortDirection] = useState('desc');
    const [searchQuery, setSearchQuery] = useState('');
    const [showBy, setShowBy] = useState(20);
    const [ratingFilter, setRatingFilter] = useState(0);
    const [categoryFilter, setCategoryFilter] = useState('Category');
    const [brandFilter, setBrandFilter] = useState('Brand');
    const [page, setPage] = useState(1);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch Products, Brands, Categories, and Dashboard Stats in parallel
                const [productsRes, brandsRes, categoriesRes, statsRes] = await Promise.all([
                    api.get('/products/?ordering=-sold_count'),
                    api.get('/brands/'),
                    api.get('/categories/'),
                    api.get('/dashboard/stats/')
                ]);

                setProducts(productsRes.data.results || []);
                setAllBrands(brandsRes.data.results || []);
                setAllCategories(categoriesRes.data.results || []);
                setStats(statsRes.data);
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
            if (column === 'category') valB = b.category?.name;
            if (column === 'brand') valB = b.brand?.name;
            if (column === 'price') {
                valA = a.discount_price && parseFloat(a.discount_price) > 0 ? parseFloat(a.discount_price) : parseFloat(a.price || 0);
                valB = b.discount_price && parseFloat(b.discount_price) > 0 ? parseFloat(b.discount_price) : parseFloat(b.price || 0);
            }

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
            <Breadcrumb 
                title="Dashboard" 
                paths={[{ label: "Home", path: "/" }]} 
            />

            <StatsGrid stats={stats?.summary} />

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PopularClients clients={stats?.popular_clients} />
                <OrdersOverview data={stats?.orders_overview} />
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
                        showOptions={[20, 50, 100]}
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
