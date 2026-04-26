import React, { useState, useMemo, useEffect } from 'react';
import toast from 'react-hot-toast';
import FilterBar from '../components/FilterBar/FilterBar';
import { Eye, Pencil, Trash2, Plus, Search, X } from 'lucide-react';
import Breadcrumb from '../components/Layout/Breadcrumb';
import Pagination from '../components/Layout/Pagination';
import ConfirmModal from '../components/Layout/ConfirmModal';
import api from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';

const StatusBadge = ({ status }) => {
    const map = { Active: 'bg-green-500 text-white', Pending: 'bg-yellow-500 text-black', Banned: 'bg-red-500 text-white' };
    return <span className={`px-2 py-0.5 rounded text-xs ${map[status] || 'bg-slate-600'}`}>{status}</span>;
};

const SortArrow = ({ column, sortColumn, sortDirection }) => {
    if (sortColumn !== column) return <span className="opacity-20 ml-1 inline-flex flex-col leading-[0] align-middle"><span className="text-[8px]">▲</span><span className="text-[8px]">▼</span></span>;
    return <span className="ml-1 inline-flex flex-col leading-[0] align-middle font-bold text-blue-400"><span className={`text-[8px] ${sortDirection === 'asc' ? 'opacity-100' : 'opacity-20'}`}>▲</span><span className={`text-[8px] ${sortDirection === 'desc' ? 'opacity-100' : 'opacity-20'}`}>▼</span></span>;
};

const Customers = () => {
    const navigate = useNavigate();
    const { hasPermission } = useAuth();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);
    const [sortColumn, setSortColumn] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [customerIdToDelete, setCustomerIdToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setPage(1); // Reset to page 1 on new search
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    React.useEffect(() => {
        const fetchCustomers = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/customers/`, {
                    params: { 
                        page: page, 
                        search: debouncedSearch 
                    }
                });
                
                if (response.data && response.data.results) {
                    setCustomers(response.data.results);
                    setTotalCount(response.data.count || 0);
                } else {
                    setCustomers(Array.isArray(response.data) ? response.data : []);
                    setTotalCount(Array.isArray(response.data) ? response.data.length : 0);
                }
            } catch (error) {
                console.error("Failed to fetch customers:", error);
                setCustomers([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCustomers();
    }, [page, debouncedSearch]);

    const handleDeleteCustomer = (customerId) => {
        setCustomerIdToDelete(customerId);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!customerIdToDelete) return;
        setIsDeleting(true);
        try {
            await api.delete(`/customers/${customerIdToDelete}/`);
            setCustomers(prev => prev.filter(c => c.id !== customerIdToDelete));
            setTotalCount(prev => prev - 1);
            toast.success('Customer deleted successfully');
            setIsDeleteModalOpen(false);
        } catch (error) {
            console.error('Error deleting customer:', error);
            toast.error('Failed to delete customer');
        } finally {
            setIsDeleting(false);
            setCustomerIdToDelete(null);
        }
    };

    const handleSort = (column) => {
        const direction = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortColumn(column);
        setSortDirection(direction);

        const sorted = [...customers].sort((a, b) => {
            let valA = a[column];
            let valB = b[column];
            if (typeof valA === 'string') valA = valA.toLowerCase();
            if (typeof valB === 'string') valB = valB.toLowerCase();
            if (direction === 'asc') return valA > valB ? 1 : -1;
            return valA < valB ? 1 : -1;
        });
        setCustomers(sorted);
    };

    const totalPages = Math.max(1, Math.ceil(totalCount / 20));
    const visible = customers;

    return (
        <div className="p-0 sm:p-6 min-h-screen bg-transparent space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <Breadcrumb 
                    title="Customers" 
                    paths={[
                        { label: "Home", path: "/" },
                        { label: "Customers", path: "/customers" }
                    ]} 
                />
                {hasPermission('accounts.add_customer') && (
                    <button 
                        onClick={() => navigate('/customers/new')}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-600/20 active:scale-95 cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        Add Customer
                    </button>
                )}
            </div>

            <div className="bg-[#071229] p-4 rounded-xl border border-slate-800 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="flex-1 relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                            <Search className="w-4 h-4" />
                        </div>
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by name, email, or phone (e.g. John, 017...)"
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
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-700 shadow-xl">
                <table className="min-w-full divide-y divide-slate-700">
                    <thead className="text-white bg-[#0b3a61]">
                        <tr>
                            {[
                                { id: 'id', label: 'UID' },
                                { id: 'image', label: 'Photo' },
                                { id: 'name', label: 'Name' },
                                { id: 'email', label: 'Email' },
                                { id: 'phone', label: 'Phone' },
                                { id: 'role', label: 'Role' },
                                { id: 'status', label: 'Status' },
                                { id: 'orders', label: 'Orders' },
                                { id: 'joined', label: 'Joined' }
                            ].map(col => (
                                <th key={col.id} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer" onClick={() => (col.id !== 'image' && handleSort(col.id))}>
                                    <div className="flex items-center whitespace-nowrap">
                                        {col.label} {col.id !== 'image' && <SortArrow column={col.id} sortColumn={sortColumn} sortDirection={sortDirection} />}
                                    </div>
                                </th>
                            ))}
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-transparent divide-y divide-slate-700">
                        {loading ? (
                            <tr><td colSpan="10" className="text-center py-8 text-slate-400 font-medium">Loading customers...</td></tr>
                        ) : visible.map(c => (
                            <tr 
                                key={c.id} 
                                onClick={() => navigate(`/customers/view/${c.id}`)}
                                className="group hover:bg-slate-800/80 transition-all cursor-pointer border-b border-slate-800 last:border-0"
                            >
                                <td className="px-6 py-4 whitespace-nowrap text-slate-100 font-medium text-sm">C-{c.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <img
                                        src={c.avatar || c.social_avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name || c.username || 'U')}&background=random`}
                                        alt={c.name || c.username}
                                        className="w-10 h-10 rounded-lg object-cover shadow-sm border border-slate-700"
                                    />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-slate-100 text-sm font-medium">{c.name || c.username}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-slate-400 text-sm italic">{c.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-slate-300 font-mono text-sm">{c.phone_number || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-slate-300 text-sm">{c.is_wholesaler ? 'Wholesale' : (c.customer_type || 'Retail')}</td>
                                <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={c.is_email_verified ? 'Active' : 'Pending'} /></td>
                                <td className="px-6 py-4 whitespace-nowrap text-slate-300 text-sm font-semibold">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                                        {c.total_orders || 0}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-slate-500 text-xs">{new Date(c.created_at).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex space-x-2">
                                        {hasPermission('accounts.change_customer') && (
                                            <button onClick={() => navigate(`/customers/edit/${c.id}`)} title="Edit" className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl hover:bg-emerald-500 hover:text-white transition-all cursor-pointer shadow-lg shadow-emerald-500/0 hover:shadow-emerald-500/20"><Pencil className="h-4 w-4" /></button>
                                        )}
                                        {hasPermission('accounts.delete_customer') && (
                                            <button title="Delete" onClick={() => handleDeleteCustomer(c.id)} className="p-2 bg-red-500/10 text-red-500 hover:text-white hover:bg-red-500 rounded-xl transition-all cursor-pointer"><Trash2 className="h-4 w-4" /></button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-slate-400">showing <span className="text-slate-200 font-semibold">{visible.length}</span> of <span className="text-slate-200 font-semibold">{totalCount}</span> results</div>
                <Pagination page={page} setPage={setPage} total={totalPages} />
            </div>

            <ConfirmModal 
                isOpen={isDeleteModalOpen}
                isLoading={isDeleting}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Are You Sure!"
                message="Want to delete this customer?"
            />
        </div>
    );
};

export default Customers;
