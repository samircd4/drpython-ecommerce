import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import Breadcrumb from '../Components/Layout/Breadcrumb';
import BrandTable from '../Components/Product/BrandTable';
import BrandModal from '../Components/Product/BrandModal';
import BrandViewModal from '../Components/Product/BrandViewModal';
import FilterBar from '../Components/FilterBar/FilterBar';
import ConfirmModal from '../Components/Layout/ConfirmModal';
import api from '../api/axiosConfig';

const Brands = () => {
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showBy, setShowBy] = useState(12);

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
            const response = await api.get('/brands/');
            setBrands(response.data.results || []);
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
    }, []);

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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <Breadcrumb title="Brands" paths={["Home", "Products", "Brands"]} />
                <button 
                    onClick={handleAddClick}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-500 transition-all font-semibold shadow-lg shadow-blue-600/20 w-fit"
                >
                    <Plus className="h-5 w-5" /> Add Brand
                </button>
            </div>

            <div className="my-6">
                <FilterBar
                    showBy={showBy}
                    onShowByChange={setShowBy}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    showOptions={[12, 24, 48, 96]}
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
