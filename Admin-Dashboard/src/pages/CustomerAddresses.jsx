import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Pencil, Trash2, Plus, MapPin, Search, X } from 'lucide-react';
import Breadcrumb from '../components/Layout/Breadcrumb';
import Pagination from '../components/Layout/Pagination';
import ConfirmModal from '../components/Layout/ConfirmModal';
import api from '../api/axiosConfig';
import { useModals } from '../Context/ModalContext';

import { useLocation } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';

const CustomerAddresses = () => {
    const { openAddressModal } = useModals();
    const { hasPermission } = useAuth();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [searchQuery, setSearchQuery] = useState(queryParams.get('search') || '');
    const [debouncedSearch, setDebouncedSearch] = useState(queryParams.get('search') || '');
    const [page, setPage] = useState(1);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [addressIdToDelete, setAddressIdToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchAddresses = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/addresses/`, {
                params: { 
                    page: page, 
                    search: debouncedSearch 
                }
            });
            
            if (response.data && response.data.results) {
                setAddresses(response.data.results);
                setTotalCount(response.data.count);
            } else {
                setAddresses(Array.isArray(response.data) ? response.data : []);
                setTotalCount(Array.isArray(response.data) ? response.data.length : 0);
            }
        } catch (error) {
            console.error("Failed to fetch addresses:", error);
            setAddresses([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, [page, debouncedSearch]);

    useEffect(() => {
        const handleRefresh = () => fetchAddresses();
        window.addEventListener('refreshData', handleRefresh);
        return () => window.removeEventListener('refreshData', handleRefresh);
    }, []);

    const handleDeleteClick = (id) => {
        setAddressIdToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!addressIdToDelete) return;
        setIsDeleting(true);
        try {
            await api.delete(`/addresses/${addressIdToDelete}/`);
            setAddresses(prev => prev.filter(a => a.id !== addressIdToDelete));
            setTotalCount(prev => prev - 1);
            toast.success('Address deleted successfully');
            setIsDeleteModalOpen(false);
        } catch (error) {
            console.error('Error deleting address:', error);
            toast.error('Failed to delete address');
        } finally {
            setIsDeleting(false);
            setAddressIdToDelete(null);
        }
    };

    const totalPages = Math.max(1, Math.ceil(totalCount / 20));

    return (
        <div className="p-0 sm:p-6 min-h-screen bg-transparent space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <Breadcrumb 
                    title="Customer Addresses" 
                    paths={[
                        { label: "Home", path: "/" },
                        { label: "Customers", path: "/all-customers" },
                        { label: "Addresses", path: "/addresses" }
                    ]} 
                />
                {hasPermission('accounts.add_address') && (
                    <button 
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-600/20 active:scale-95 cursor-pointer"
                        onClick={() => openAddressModal(null, 'create')}
                    >
                        <Plus className="w-4 h-4" />
                        Add Address
                    </button>
                )}
            </div>

            <div className="bg-[#071229] p-4 rounded-xl border border-slate-800 shadow-sm">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search addresses by name, city, area, or phone..."
                        className="w-full bg-[#0b1a2a] text-slate-200 border border-slate-700 rounded-lg pl-10 pr-10 py-2.5 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                    />
                    {searchQuery && (
                        <button 
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-700 shadow-xl">
                <table className="min-w-full divide-y divide-slate-700">
                    <thead className="text-white bg-[#0b3a61]">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Address Details</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">City/Area</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-transparent divide-y divide-slate-700">
                        {loading ? (
                            <tr><td colSpan="5" className="text-center py-8 text-slate-400 font-medium text-sm italic">Loading data...</td></tr>
                        ) : addresses.length === 0 ? (
                            <tr><td colSpan="5" className="text-center py-8 text-slate-400 font-medium text-sm italic">No addresses found</td></tr>
                        ) : addresses.map(addr => (
                            <tr 
                                key={addr.id} 
                                onClick={() => openAddressModal(addr, 'view')}
                                className="group hover:bg-slate-800/80 transition-all border-b border-slate-800 last:border-0 cursor-pointer"
                            >
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex flex-col">
                                        <span className="text-slate-100 font-bold text-sm">{addr.customer_name || addr.full_name}</span>
                                        <span className="text-slate-500 text-xs">{addr.phone}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-slate-700 text-slate-300">
                                        {addr.address_type || 'Home'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-normal max-w-xs">
                                    <div className="flex items-start gap-2">
                                        <MapPin className="w-3.5 h-3.5 text-slate-500 mt-1 shrink-0" />
                                        <p className="text-slate-300 text-sm italic">{addr.address}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-slate-400 text-sm font-medium">
                                    {addr.sub_district}, {addr.district}, {addr.division}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex space-x-2">
                                        {hasPermission('accounts.change_address') && (
                                            <button 
                                                onClick={() => openAddressModal(addr, 'edit')}
                                                className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl hover:bg-emerald-500 hover:text-white transition-all cursor-pointer shadow-lg shadow-emerald-500/0 hover:shadow-emerald-500/20"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                        )}
                                        {hasPermission('accounts.delete_address') && (
                                            <button 
                                                onClick={() => handleDeleteClick(addr.id)}
                                                className="p-2 bg-red-500/10 text-red-500 hover:text-white hover:bg-red-500 rounded-xl transition-all cursor-pointer"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-slate-400">showing <span className="text-slate-200 font-semibold">{addresses.length}</span> of <span className="text-slate-200 font-semibold">{totalCount}</span> addresses</div>
                <Pagination page={page} setPage={setPage} total={totalPages} />
            </div>

            <ConfirmModal 
                isOpen={isDeleteModalOpen}
                isLoading={isDeleting}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Confirm Removal"
                message="Are you sure you want to delete this address? This action cannot be undone."
            />
        </div>
    );
};

export default CustomerAddresses;
