import React, { useState, useMemo } from 'react';
import FilterBar from '../Components/FilterBar/FilterBar';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import Breadcrumb from '../Components/Layout/Breadcrumb';
import Pagination from '../Components/Layout/Pagination';

const StatusBadge = ({ status }) => {
    const map = { Active: 'bg-green-500 text-white', Inactive: 'bg-yellow-500 text-white', Banned: 'bg-red-500 text-white' };
    return <span className={`px-2 py-0.5 rounded text-xs ${map[status] || 'bg-slate-600'}`}>{status}</span>;
};

const mockCustomers = Array.from({ length: 28 }).map((_, i) => ({
    id: `C-${1000 + i}`,
    image: `https://i.pravatar.cc/150?u=${1000 + i}`,
    name: ['Arafat Hossain', 'Sadia Akter', 'Nur Islam', 'Mina Rahman', 'Rafi Ahmed', 'Taslima Banu'][i % 6],
    email: `user${i}@example.com`,
    phone: `017${10000000 + i}`,
    role: ['Customer', 'VIP', 'Wholesale'][i % 3],
    status: ['Active', 'Inactive', 'Banned'][i % 3],
    orders: (i % 12) + 1,
    joined: `2023-0${(i % 9) + 1}-15`
}));

const SortArrow = ({ column, sortColumn, sortDirection }) => {
    if (sortColumn !== column) return <span className="opacity-20 ml-1 inline-flex flex-col leading-[0] align-middle"><span className="text-[8px]">▲</span><span className="text-[8px]">▼</span></span>;
    return <span className="ml-1 inline-flex flex-col leading-[0] align-middle font-bold text-blue-400"><span className={`text-[8px] ${sortDirection === 'asc' ? 'opacity-100' : 'opacity-20'}`}>▲</span><span className={`text-[8px] ${sortDirection === 'desc' ? 'opacity-100' : 'opacity-20'}`}>▼</span></span>;
};

const Customers = () => {
    const [customers, setCustomers] = useState(mockCustomers);
    const [showBy, setShowBy] = useState(12);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [sortColumn, setSortColumn] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');

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

    const filtered = useMemo(() => {
        if (!searchQuery) return customers;
        const q = searchQuery.toLowerCase();
        return customers.filter(c => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q));
    }, [customers, searchQuery]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / showBy));
    const visible = filtered.slice((page - 1) * showBy, page * showBy);

    return (
        <div className="p-0 sm:p-6 min-h-screen bg-transparent">
            <Breadcrumb title="Customers" paths={["Home", "Customers"]} />
            <div className="my-4">
                <div className="flex items-center gap-4 bg-[#071229] p-4 rounded-xl border border-slate-800 shadow-sm">
                    <div className="flex-1">
                        <input
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                            placeholder="Search customers..."
                            className="w-full bg-[#0b1a2a] text-slate-200 border border-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                        />
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <span>Show:</span>
                        <select
                            value={showBy}
                            onChange={(e) => { setShowBy(Number(e.target.value)); setPage(1); }}
                            className="bg-[#0b1a2a] text-slate-200 border border-slate-700 rounded-lg px-2 py-1.5 focus:outline-none"
                        >
                            {[12, 24, 48].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
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
                        {visible.map(c => (
                            <tr key={c.id} className="hover:bg-slate-800 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-slate-100 font-medium text-sm">{c.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <img
                                        src={c.image}
                                        alt={c.name}
                                        className="w-10 h-10 rounded-lg object-cover shadow-sm border border-slate-700"
                                    />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-slate-100 text-sm font-medium">{c.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-slate-400 text-sm italic">{c.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-slate-300 font-mono text-sm">{c.phone}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-slate-300 text-sm">{c.role}</td>
                                <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={c.status} /></td>
                                <td className="px-6 py-4 whitespace-nowrap text-slate-300 text-sm">{c.orders}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-slate-500 text-xs">{c.joined}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex space-x-2">
                                        <button title="View" className="p-1.5 bg-purple-500/10 text-purple-400 rounded-lg hover:bg-purple-500 hover:text-white transition-all"><Eye className="h-4 w-4" /></button>
                                        <button title="Edit" className="p-1.5 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500 hover:text-white transition-all"><Pencil className="h-4 w-4" /></button>
                                        <button title="Delete" className="p-1.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all"><Trash2 className="h-4 w-4" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-slate-400">showing <span className="text-slate-200 font-semibold">{visible.length}</span> of <span className="text-slate-200 font-semibold">{filtered.length}</span> results</div>
                <Pagination page={page} setPage={setPage} total={totalPages} />
            </div>
        </div>
    );
};

export default Customers;
