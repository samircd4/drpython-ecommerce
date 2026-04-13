import React from 'react';
import { Eye, Pencil, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SortArrow = ({ column, sortColumn, sortDirection }) => {
    if (sortColumn !== column) return <span className="opacity-20 ml-1 inline-flex flex-col leading-[0] align-middle"><span className="text-[8px]">▲</span><span className="text-[8px]">▼</span></span>;
    return <span className="ml-1 inline-flex flex-col leading-[0] align-middle font-bold text-blue-400"><span className={`text-[8px] ${sortDirection === 'asc' ? 'opacity-100' : 'opacity-20'}`}>▲</span><span className={`text-[8px] ${sortDirection === 'desc' ? 'opacity-100' : 'opacity-20'}`}>▼</span></span>;
};

const InventoryTable = ({ items = [], loading = false, sortColumn, sortDirection, onSort }) => {
    const navigate = useNavigate();

    const getStatus = (item) => {
        const stock = item.stock_quantity || 0;
        const threshold = item.low_stock_threshold || 10;
        if (stock <= 0) return 'Out of Stock';
        if (stock <= threshold) return 'Low Stock';
        return 'In Stock';
    };

    return (
        <div className="overflow-x-auto rounded-xl border border-slate-700 shadow-xl">
            <table className="min-w-full divide-y divide-slate-700">
                <thead className="text-white bg-[#0b3a61]">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors hover:bg-white/5" onClick={() => onSort('name')}>
                            <div className="flex items-center whitespace-nowrap">Product <SortArrow column="name" sortColumn={sortColumn} sortDirection={sortDirection} /></div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors hover:bg-white/5" onClick={() => onSort('category')}>
                            <div className="flex items-center whitespace-nowrap">Category <SortArrow column="category" sortColumn={sortColumn} sortDirection={sortDirection} /></div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors hover:bg-white/5" onClick={() => onSort('stock_quantity')}>
                            <div className="flex items-center whitespace-nowrap">Stock Level <SortArrow column="stock_quantity" sortColumn={sortColumn} sortDirection={sortDirection} /></div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors hover:bg-white/5" onClick={() => onSort('low_stock_threshold')}>
                            <div className="flex items-center whitespace-nowrap">Min. Stock <SortArrow column="low_stock_threshold" sortColumn={sortColumn} sortDirection={sortDirection} /></div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors hover:bg-white/5" onClick={() => onSort('brand')}>
                            <div className="flex items-center whitespace-nowrap">Brand <SortArrow column="brand" sortColumn={sortColumn} sortDirection={sortDirection} /></div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-transparent divide-y divide-slate-700">
                    {loading ? (
                        <tr>
                            <td colSpan="7" className="px-6 py-20 text-center">
                                <div className="flex flex-col items-center gap-3">
                                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                                    <span className="text-slate-400 text-sm font-medium">Synchronizing Inventory Data...</span>
                                </div>
                            </td>
                        </tr>
                    ) : items.length === 0 ? (
                        <tr>
                            <td colSpan="7" className="px-6 py-12 text-center text-slate-500 italic">No inventory items found.</td>
                        </tr>
                    ) : items.map((item) => {
                        const status = getStatus(item);
                        return (
                            <tr 
                                key={item.id} 
                                onClick={() => navigate(`/products/view/${item.id}`)}
                                className="group hover:bg-slate-800/60 transition-colors cursor-pointer"
                            >
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <img
                                            src={item.image || 'https://via.placeholder.com/40'}
                                            alt={item.name}
                                            className="w-10 h-10 rounded-lg object-cover shadow-sm border border-slate-700 bg-slate-800 transition-transform group-hover:scale-105"
                                        />
                                        <div className="ml-4">
                                            <div className="text-sm font-bold text-slate-100 group-hover:text-blue-400 transition-colors">{item.name}</div>
                                            <div className="text-[10px] text-slate-500 font-mono tracking-tighter uppercase">{item.product_id || item.sku || `UID-${item.id}`}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-xs font-medium text-slate-400 bg-slate-800/50 px-2 py-0.5 rounded border border-slate-700/50">
                                        {item.category?.name || 'General'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-700 ${
                                                    status === 'In Stock' ? 'bg-emerald-500' : status === 'Low Stock' ? 'bg-yellow-500' : 'bg-red-500'
                                                }`}
                                                style={{ width: `${Math.min(100, ((item.stock_quantity || 0) / 100) * 100)}%` }}
                                            />
                                        </div>
                                        <span className={`text-sm font-black ${status === 'In Stock' ? 'text-slate-200' : status === 'Low Stock' ? 'text-yellow-400' : 'text-red-400'}`}>
                                            {item.stock_quantity || 0}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-slate-400 font-mono text-xs">{item.low_stock_threshold || 10}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`flex items-center w-fit gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ring-1 ring-inset ${
                                        status === 'In Stock'
                                        ? 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20'
                                        : status === 'Low Stock'
                                            ? 'bg-yellow-500/10 text-yellow-400 ring-yellow-500/20 shadow-[0_0_12px_rgba(234,179,8,0.1)]'
                                            : 'bg-red-500/10 text-red-400 ring-red-500/20 shadow-[0_0_12px_rgba(239,68,68,0.1)]'
                                    }`}>
                                        {status === 'Low Stock' && <AlertTriangle className="w-3 h-3 animate-pulse" />}
                                        {status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-slate-400 text-xs italic">{item.brand?.name || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex space-x-2">
                                        <button 
                                            onClick={() => navigate(`/products/view/${item.id}`)}
                                            title="View Details" 
                                            className="p-2 bg-blue-500/10 text-blue-400 rounded-xl hover:bg-blue-500 hover:text-white transition-all cursor-pointer shadow-lg shadow-blue-500/0 hover:shadow-blue-500/20"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </button>
                                        <button 
                                            onClick={() => navigate(`/products/edit/${item.id}`)}
                                            title="Edit Inventory" 
                                            className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl hover:bg-emerald-500 hover:text-white transition-all cursor-pointer shadow-lg shadow-emerald-500/0 hover:shadow-emerald-500/20"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default InventoryTable;
