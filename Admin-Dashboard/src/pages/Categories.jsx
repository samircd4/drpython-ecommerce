import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import Breadcrumb from '../components/Layout/Breadcrumb';
import CategoryTable from '../components/Product/CategoryTable';
import CategoryModal from '../components/Product/CategoryModal';
import CategoryViewModal from '../components/Product/CategoryViewModal';
import FilterBar from '../components/FilterBar/FilterBar';
import ConfirmModal from '../components/Layout/ConfirmModal';
import Pagination from '../components/Layout/Pagination';
import api from '../api/axiosConfig';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [categoryIdToDelete, setCategoryIdToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await api.get('/categories/', {
                params: {
                    page,
                    search: searchQuery
                }
            });
            setCategories(response.data.results || []);
            setTotalCount(response.data.count || 0);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();

        // Listen for global refresh event
        const handleRefresh = () => fetchCategories();
        window.addEventListener('refreshData', handleRefresh);
        return () => window.removeEventListener('refreshData', handleRefresh);
    }, [page, searchQuery]);

    const handleDeleteCategory = (categoryId) => {
        setCategoryIdToDelete(categoryId);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!categoryIdToDelete) return;
        setIsDeleting(true);
        try {
            await api.delete(`/categories/${categoryIdToDelete}/`);
            setCategories(prev => prev.filter(c => c.id !== categoryIdToDelete));
            toast.success('Category deleted successfully');
            setIsDeleteModalOpen(false);
        } catch (error) {
            console.error('Error deleting category:', error);
            toast.error('Failed to delete category');
        } finally {
            setIsDeleting(false);
            setCategoryIdToDelete(null);
        }
    };

    const handleAddClick = () => {
        setSelectedCategory(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (category) => {
        setSelectedCategory(category);
        setIsModalOpen(true);
    };

    const handleViewClick = (category) => {
        setSelectedCategory(category);
        setIsViewModalOpen(true);
    };

    const handleSaveCategory = () => {
        fetchCategories();
    };

    const totalPages = Math.max(1, Math.ceil(totalCount / 20));
    const visibleCategories = categories;

    return (
        <div className="p-0 sm:px-6 sm:py-4 min-h-screen" style={{ backgroundImage: 'linear-gradient(90deg,var(--bg-start),var(--bg-mid),var(--bg-end))' }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <Breadcrumb title="Categories" paths={["Home", "Products", "Categories"]} />
                <button 
                    onClick={handleAddClick}
                    className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-500 transition-all font-semibold shadow-lg shadow-emerald-600/20 w-fit cursor-pointer"
                >
                    <Plus className="h-5 w-5" /> Add Category
                </button>
            </div>

            <div className="my-6">
                <FilterBar
                    searchQuery={searchQuery}
                    setSearchQuery={(q) => { setSearchQuery(q); setPage(1); }}
                    // Simplified filter for categories
                    categories={[]}
                    brands={[]}
                />
            </div>

            <CategoryTable 
                categories={visibleCategories} 
                loading={loading} 
                handleDelete={handleDeleteCategory} 
                onEdit={handleEditClick}
                onView={handleViewClick}
            />

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-slate-400">
                    Showing <span className="text-slate-200 font-semibold">{visibleCategories.length}</span> of <span className="text-slate-200 font-semibold">{totalCount}</span> categories
                </div>
                <Pagination page={page} setPage={setPage} total={totalPages} />
            </div>

            {/* Modals */}
            <CategoryModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                category={selectedCategory} 
                onSave={handleSaveCategory} 
            />
            
            <CategoryViewModal 
                isOpen={isViewModalOpen} 
                onClose={() => setIsViewModalOpen(false)} 
                category={selectedCategory} 
            />

            <ConfirmModal 
                isOpen={isDeleteModalOpen}
                isLoading={isDeleting}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Are You Sure!"
                message="Want to delete this category?"
            />
        </div>
    );
};

export default Categories;
