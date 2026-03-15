import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import Breadcrumb from '../Components/Layout/Breadcrumb';
import CategoryTable from '../Components/Product/CategoryTable';
import CategoryModal from '../Components/Product/CategoryModal';
import CategoryViewModal from '../Components/Product/CategoryViewModal';
import FilterBar from '../Components/FilterBar/FilterBar';
import api from '../api/axiosConfig';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showBy, setShowBy] = useState(12);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);

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

    useEffect(() => {
        fetchCategories();

        // Listen for global refresh event
        const handleRefresh = () => fetchCategories();
        window.addEventListener('refreshData', handleRefresh);
        return () => window.removeEventListener('refreshData', handleRefresh);
    }, []);

    const handleDeleteCategory = async (categoryId) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return;
        const p = api.delete(`/categories/${categoryId}/`).then(() => {
            setCategories(prev => prev.filter(c => c.id !== categoryId));
        });
        toast.promise(p, {
            loading: 'Deleting category...',
            success: 'Category deleted successfully',
            error: 'Failed to delete category',
        });
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <Breadcrumb title="Categories" paths={["Home", "Products", "Categories"]} />
                <button 
                    onClick={handleAddClick}
                    className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-500 transition-all font-semibold shadow-lg shadow-emerald-600/20 w-fit"
                >
                    <Plus className="h-5 w-5" /> Add Category
                </button>
            </div>

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

            <CategoryTable 
                categories={visibleCategories} 
                loading={loading} 
                handleDelete={handleDeleteCategory} 
                onEdit={handleEditClick}
                onView={handleViewClick}
            />

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
        </div>
    );
};

export default Categories;
