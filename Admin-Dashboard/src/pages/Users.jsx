import React, { useState, useEffect, useMemo } from 'react';
import Breadcrumb from '../components/Layout/Breadcrumb';
import Pagination from '../components/Layout/Pagination';
import UserTable from '../components/Users/UserTable';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';
import { UserPlus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Users = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [showBy, setShowBy] = useState(12);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const response = await api.get('/users/');
                // Ensure users is an array
                setUsers(Array.isArray(response.data) ? response.data : (response.data.results || []));
            } catch (err) {
                console.error("Failed to fetch users:", err);
                toast.error("Failed to load users list.");
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const filteredUsers = useMemo(() => {
        return users.filter(user =>
            (user.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (user.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (user.first_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (user.last_name || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, users]);

    const totalPages = Math.max(1, Math.ceil(filteredUsers.length / showBy));
    const visibleUsers = filteredUsers.slice((page - 1) * showBy, page * showBy);

    return (
        <div className="p-0 sm:p-6 min-h-screen bg-transparent">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 px-4 sm:px-0">
                <Breadcrumb 
                    title="System Users" 
                    paths={[
                        { label: "Home", path: "/" },
                        { label: "Dashboard", path: "/" },
                        { label: "Users", path: "/users" }
                    ]} 
                />
                <button 
                    onClick={() => navigate('/users/add')}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-lg shadow-blue-600/20 font-bold text-sm active:scale-[0.98] w-full sm:w-auto"
                >
                    <UserPlus className="w-4 h-4" />
                    Create Operator
                </button>
            </div>

            <div className="my-6 px-4 sm:px-0">
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#071229] p-4 rounded-xl border border-slate-800 shadow-sm transition-all hover:border-slate-700">
                    <div className="flex-1 w-full relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                            placeholder="Search by name, email or username..."
                            className="w-full bg-[#0b1a2a] text-slate-200 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                        />
                    </div>
                    <div className="flex items-center gap-4 text-slate-400 text-sm">
                        <div className="flex items-center gap-2">
                            <span>Show:</span>
                            <select
                                value={showBy}
                                onChange={(e) => { setShowBy(Number(e.target.value)); setPage(1); }}
                                className="bg-[#0b1a2a] text-slate-200 border border-slate-700 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            >
                                {[12, 24, 48].map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-4 sm:px-0 mt-6">
                <UserTable users={visibleUsers} loading={loading} />
            </div>

            <div className="mt-6 px-4 sm:px-0 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-slate-400">
                    Showing <span className="text-slate-200 font-semibold">{visibleUsers.length}</span> of <span className="text-slate-200 font-semibold">{filteredUsers.length}</span> operators
                </div>
                <Pagination page={page} setPage={setPage} total={totalPages} />
            </div>
        </div>
    );
};

export default Users;
