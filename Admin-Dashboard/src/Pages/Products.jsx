import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import FilterBar from '../Components/FilterBar/FilterBar';
import BestSellingProductsTable from '../Components/Dashboard/BestSellingProductsTable';
import Breadcrumb from '../Components/Layout/Breadcrumb';
import Pagination from '../Components/Layout/Pagination';
import ConfirmModal from '../Components/Layout/ConfirmModal';
import api from '../api/axiosConfig';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [allCategories, setAllCategories] = useState([]);
    const [allBrands, setAllBrands] = useState([]);
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');
    const [searchQuery, setSearchQuery] = useState('');
    const [showBy, setShowBy] = useState(20);
    const [ratingFilter, setRatingFilter] = useState(0);
    const [categoryFilter, setCategoryFilter] = useState('Category');
    const [brandFilter, setBrandFilter] = useState('Brand');
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [productIdToDelete, setProductIdToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const fetchStaticData = async () => {
            try {
                const [brandsRes, categoriesRes] = await Promise.all([
                    api.get('/brands/'),
                    api.get('/categories/')
                ]);
                setAllBrands(brandsRes.data.results || []);
                setAllCategories(categoriesRes.data.results || []);
            } catch (error) {
                console.error('Error fetching categories/brands:', error);
            }
        };
        fetchStaticData();
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const params = {
                    page,
                    page_size: showBy,
                    search: searchQuery,
                    rating__gte: ratingFilter > 0 ? ratingFilter : undefined
                };
                
                if (categoryFilter !== 'Category') {
                    const cat = allCategories.find(c => c.name === categoryFilter);
                    if (cat) params.category = cat.id;
                }
                if (brandFilter !== 'Brand') {
                    const brand = allBrands.find(b => b.name === brandFilter);
                    if (brand) params.brand = brand.id;
                }
                if (sortColumn) {
                    params.ordering = sortDirection === 'asc' ? sortColumn : `-${sortColumn}`;
                }

                const res = await api.get('/products/', { params });
                setProducts(res.data.results || []);
                setTotalCount(res.data.count || 0);
            } catch (error) {
                console.error('Error fetching products:', error);
                setProducts([]);
                setTotalCount(0);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [page, searchQuery, categoryFilter, brandFilter, ratingFilter, sortColumn, sortDirection, allCategories, allBrands, showBy]);
    
    const handleDeleteProduct = (productId) => {
        setProductIdToDelete(productId);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!productIdToDelete) return;
        
        setIsDeleting(true);
        try {
            await api.delete(`/products/${productIdToDelete}/`);
            setProducts(prev => prev.filter(p => p.id !== productIdToDelete));
            setTotalCount(prev => prev - 1);
            toast.success('Product deleted successfully');
            setIsDeleteModalOpen(false);
        } catch (error) {
            console.error('Error deleting product:', error);
            toast.error('Failed to delete product');
        } finally {
            setIsDeleting(false);
            setProductIdToDelete(null);
        }
    };

    const handleSort = (column) => {
        let direction = 'asc';
        if (sortColumn === column && sortDirection === 'asc') {
            direction = 'desc';
        }
        setSortColumn(column);
        setSortDirection(direction);
    };

    const categories = allCategories.map(c => c.name).filter(Boolean);
    const brands = allBrands.map(b => b.name).filter(Boolean);

    const totalPages = Math.ceil(totalCount / showBy) || 1;
    const visibleProducts = products;

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
                    handleDelete={handleDeleteProduct}
                />
            )}

            {/* Pagination Bottom */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-slate-400">
                    Showing <span className="text-slate-200 font-semibold">{visibleProducts.length}</span> of <span className="text-slate-200 font-semibold">{totalCount}</span> entries
                </div>
                <Pagination page={page} setPage={setPage} total={totalPages} />
            </div>

            <ConfirmModal 
                isOpen={isDeleteModalOpen}
                isLoading={isDeleting}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Are You Sure!"
                message="Want to delete this product?"
            />
        </div>
    );
};

export default Products;
