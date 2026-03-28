import React, { useState, useEffect, useMemo } from 'react';
import Breadcrumb from '../components/Layout/Breadcrumb';
import Pagination from '../components/Layout/Pagination';
import UserTable from '../components/Users/UserTable';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';
import { UserPlus, Search, Users as UsersIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AllUsers = () => {
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
                setUsers(Array.isArray(response.data) ? response.data : (response.data.results || []));
            } catch (err) {
                console.error("Failed to fetch users:", err);
                toast.error("Failed to load staff directory.");
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
        <div className="p-4 sm:p-8 min-h-screen bg-transparent">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 px-4 sm:px-0">
                <div>
                    <Breadcrumb title="Operational Staff" paths={["Home", "Users", "Directory"]} />
                    <h1 className="text-2xl font-black text-white uppercase tracking-tight mt-1 flex items-center gap-3">
                        <UsersIcon className="w-7 h-7 text-blue-500" />
                        Staff Registry
                    </h1>
                </div>
                <button
                    onClick={() => navigate('/users/add')}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-lg shadow-blue-600/20 font-bold text-[10px] uppercase tracking-widest active:scale-[0.98]"
                >
                    <UserPlus className="w-4 h-4" />
                    Deploy Operator
                </button>
            </div>

            {/* Stats & Search */}
            <div className="mb-8 px-4 sm:px-0">
                <div className="flex flex-col sm:flex-row items-center gap-6 bg-[#0b1a2a] p-6 rounded-[2rem] border border-slate-700/40 shadow-xl overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none" />

                    <div className="flex-1 w-full relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                        <input
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                            placeholder="Enter username, designation or email segment..."
                            className="w-full bg-[#071229] text-slate-200 border border-slate-700/60 rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-600/30 transition-all text-sm font-medium placeholder:text-slate-600"
                        />
                    </div>

                    <div className="flex items-center gap-6 text-slate-500 text-xs font-black uppercase tracking-widest">
                        <div className="flex items-center gap-3 bg-[#071229] px-4 py-2 rounded-xl border border-slate-800">
                            <span>Showing:</span>
                            <select
                                value={showBy}
                                onChange={(e) => { setShowBy(Number(e.target.value)); setPage(1); }}
                                className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
                            >
                                {[12, 24, 48].map(n => <option key={n} value={n} className="bg-[#0b1a2a]">{n}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table Area */}
            <div className="px-4 sm:px-0">
                <div className="bg-[#0b1a2a] border border-slate-700/40 rounded-[2rem] overflow-hidden shadow-2xl">
                    <div className="px-8 py-5 border-b border-slate-800 flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Master Operator Index</span>
                        <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500/40" />
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500/20" />
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500/10" />
                        </div>
                    </div>
                    <UserTable users={visibleUsers} loading={loading} />
                </div>
            </div>

            {/* Pagination & Meta */}
            <div className="mt-8 px-4 sm:px-0 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Registry contains <span className="text-blue-400">{filteredUsers.length}</span> verified personnel
                </div>
                <Pagination page={page} setPage={setPage} total={totalPages} />
            </div>
        </div>
    );
};

export default AllUsers;
