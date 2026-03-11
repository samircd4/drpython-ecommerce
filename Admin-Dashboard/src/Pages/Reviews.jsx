import React, { useState, useMemo } from 'react';
import { Eye, CheckCircle, XCircle, Star, MessageSquare } from 'lucide-react';
import Breadcrumb from '../Components/Layout/Breadcrumb';
import Pagination from '../Components/Layout/Pagination';
import FilterBar from '../Components/FilterBar/FilterBar';
import mockReviews from '../data/reviews.json';

const StatusBadge = ({ status }) => {
    const map = {
        Published: 'bg-green-500/10 text-green-400 ring-green-500/20',
        Pending: 'bg-yellow-500/10 text-yellow-400 ring-yellow-500/20',
        Hidden: 'bg-gray-500/10 text-gray-400 ring-gray-500/20',
    };
    return <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ring-1 ${map[status] || 'bg-slate-600'}`}>{status}</span>;
};

const Reviews = () => {
    const [reviews, setReviews] = useState(mockReviews);
    const [showBy, setShowBy] = useState(12);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [sortColumn, setSortColumn] = useState('date');
    const [sortDirection, setSortDirection] = useState('desc');

    const handleSort = (column) => {
        const direction = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortColumn(column);
        setSortDirection(direction);

        const sorted = [...reviews].sort((a, b) => {
            const valA = a[column];
            const valB = b[column];
            if (direction === 'asc') return valA > valB ? 1 : -1;
            return valA < valB ? 1 : -1;
        });
        setReviews(sorted);
    };

    const filtered = useMemo(() => {
        return reviews.filter(r =>
            r.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.comment.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [reviews, searchQuery]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / showBy));
    const visible = filtered.slice((page - 1) * showBy, page * showBy);

    const SortArrow = ({ column }) => {
        if (sortColumn !== column) return <span className="opacity-20 ml-1 inline-flex flex-col leading-[0] align-middle"><span className="text-[8px]">▲</span><span className="text-[8px]">▼</span></span>;
        return <span className="ml-1 inline-flex flex-col leading-[0] align-middle font-bold text-blue-400"><span className={`text-[8px] ${sortDirection === 'asc' ? 'opacity-100' : 'opacity-20'}`}>▲</span><span className={`text-[8px] ${sortDirection === 'desc' ? 'opacity-100' : 'opacity-20'}`}>▼</span></span>;
    };

    return (
        <div className="p-0 sm:p-6 min-h-screen bg-transparent">
            <Breadcrumb title="Reviews" paths={["Home", "Dashboard", "Reviews"]} />

            <div className="my-6">
                <FilterBar
                    showBy={showBy}
                    onShowByChange={(n) => { setShowBy(n); setPage(1); }}
                    searchQuery={searchQuery}
                    setSearchQuery={(v) => { setSearchQuery(v); setPage(1); }}
                    showOptions={[12, 24, 48]}
                />
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-700 shadow-xl">
                <table className="min-w-full divide-y divide-slate-700">
                    <thead className="text-white bg-[#0b3a61]">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer" onClick={() => handleSort('id')}>
                                <div className="flex items-center whitespace-nowrap">ID <SortArrow column="id" /></div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer" onClick={() => handleSort('product')}>
                                <div className="flex items-center whitespace-nowrap">Product <SortArrow column="product" /></div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer" onClick={() => handleSort('rating')}>
                                <div className="flex items-center whitespace-nowrap">Rating <SortArrow column="rating" /></div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Comment</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer" onClick={() => handleSort('status')}>
                                <div className="flex items-center whitespace-nowrap">Status <SortArrow column="status" /></div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer" onClick={() => handleSort('date')}>
                                <div className="flex items-center whitespace-nowrap">Date <SortArrow column="date" /></div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-transparent divide-y divide-slate-700">
                        {visible.map(r => (
                            <tr key={r.id} className="hover:bg-slate-800 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-slate-400 text-xs font-mono">{r.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <img src={r.userImage} alt={r.user} className="w-8 h-8 rounded-lg" />
                                        <span className="text-slate-100 font-medium text-sm">{r.user}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-slate-300 text-sm">{r.product}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-1 text-yellow-500">
                                        <Star className="w-3 h-3 fill-current" />
                                        <span className="text-xs font-bold">{r.rating}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 max-w-xs">
                                    <p className="text-slate-400 text-sm truncate" title={r.comment}>{r.comment}</p>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={r.status} /></td>
                                <td className="px-6 py-4 whitespace-nowrap text-slate-500 text-xs">{r.date}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex space-x-2">
                                        <button title="View" className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500 hover:text-white transition-all"><Eye className="h-4 w-4" /></button>
                                        <button title="Approve" className="p-1.5 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500 hover:text-white transition-all"><CheckCircle className="h-4 w-4" /></button>
                                        <button title="Reject" className="p-1.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all"><XCircle className="h-4 w-4" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-slate-400">showing <span className="text-slate-200 font-semibold">{visible.length}</span> of <span className="text-slate-200 font-semibold">{filtered.length}</span> results</div>
                <Pagination page={page} setPage={setPage} total={totalPages} />
            </div>
        </div>
    );
};

export default Reviews;
