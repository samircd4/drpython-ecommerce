import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import Breadcrumb from '../components/Layout/Breadcrumb';
import BrandTable from '../components/Product/BrandTable';
import BrandModal from '../components/Product/BrandModal';
import BrandViewModal from '../components/Product/BrandViewModal';
import FilterBar from '../components/FilterBar/FilterBar';
import ConfirmModal from '../components/Layout/ConfirmModal';
import Pagination from '../components/Layout/Pagination';
import api from '../api/axiosConfig';

const Brands = () => {
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [brandIdToDelete, setBrandIdToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchBrands = async () => {
        setLoading(true);
        try {
            const response = await api.get('/brands/', {
                params: {
                    page,
                    search: searchQuery
                }
            });
            setBrands(response.data.results || []);
            setTotalCount(response.data.count || 0);
        } catch (error) {
            console.error('Error fetching brands:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBrands();
        
        // Listen for global refresh event
        const handleRefresh = () => fetchBrands();
        window.addEventListener('refreshData', handleRefresh);
        return () => window.removeEventListener('refreshData', handleRefresh);
    }, [page, searchQuery]);

    const handleDeleteBrand = (brandId) => {
        setBrandIdToDelete(brandId);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!brandIdToDelete) return;
        setIsDeleting(true);
        try {
            await api.delete(`/brands/${brandIdToDelete}/`);
            setBrands(prev => prev.filter(b => b.id !== brandIdToDelete));
            toast.success('Brand deleted successfully');
            setIsDeleteModalOpen(false);
        } catch (error) {
            console.error('Error deleting brand:', error);
            toast.error('Failed to delete brand');
        } finally {
            setIsDeleting(false);
            setBrandIdToDelete(null);
        }
    };

    const handleAddClick = () => {
        setSelectedBrand(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (brand) => {
        setSelectedBrand(brand);
        setIsModalOpen(true);
    };

    const handleViewClick = (brand) => {
        setSelectedBrand(brand);
        setIsViewModalOpen(true);
    };

    const handleSaveBrand = () => {
        fetchBrands(); // Refresh list after save
    };

    const totalPages = Math.max(1, Math.ceil(totalCount / 20));
    const visibleBrands = brands;

    return (
        <div className="p-0 sm:px-6 sm:py-4 min-h-screen" style={{ backgroundImage: 'linear-gradient(90deg,var(--bg-start),var(--bg-mid),var(--bg-end))' }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <Breadcrumb title="Brands" paths={["Home", "Products", "Brands"]} />
                <button 
                    onClick={handleAddClick}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-500 transition-all font-semibold shadow-lg shadow-blue-600/20 w-fit cursor-pointer"
                >
                    <Plus className="h-5 w-5" /> Add Brand
                </button>
            </div>

            <div className="my-6">
                <FilterBar
                    searchQuery={searchQuery}
                    setSearchQuery={(q) => { setSearchQuery(q); setPage(1); }}
                    // Simplified filter for brands
                    categories={[]}
                    brands={[]}
                />
            </div>

            <BrandTable 
                brands={visibleBrands} 
                loading={loading} 
                handleDelete={handleDeleteBrand} 
                onEdit={handleEditClick}
                onView={handleViewClick}
            />

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-slate-400">
                    Showing <span className="text-slate-200 font-semibold">{visibleBrands.length}</span> of <span className="text-slate-200 font-semibold">{totalCount}</span> brands
                </div>
                <Pagination page={page} setPage={setPage} total={totalPages} />
            </div>

            {/* Modals */}
            <BrandModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                brand={selectedBrand} 
                onSave={handleSaveBrand} 
            />
            
            <BrandViewModal 
                isOpen={isViewModalOpen} 
                onClose={() => setIsViewModalOpen(false)} 
                brand={selectedBrand} 
            />

            <ConfirmModal 
                isOpen={isDeleteModalOpen}
                isLoading={isDeleting}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Are You Sure!"
                message="Want to delete this brand?"
            />
        </div>
    );
};

export default Brands;
