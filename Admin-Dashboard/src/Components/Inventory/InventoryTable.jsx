import React from 'react';
import { Eye, Pencil, Trash2, AlertTriangle } from 'lucide-react';

const SortArrow = ({ column, sortColumn, sortDirection }) => {
    if (sortColumn !== column) return <span className="opacity-20 ml-1 inline-flex flex-col leading-[0] align-middle"><span className="text-[8px]">▲</span><span className="text-[8px]">▼</span></span>;
    return <span className="ml-1 inline-flex flex-col leading-[0] align-middle font-bold text-blue-400"><span className={`text-[8px] ${sortDirection === 'asc' ? 'opacity-100' : 'opacity-20'}`}>▲</span><span className={`text-[8px] ${sortDirection === 'desc' ? 'opacity-100' : 'opacity-20'}`}>▼</span></span>;
};

const InventoryTable = ({ items = [], sortColumn, sortDirection, onSort }) => {
    return (
        <div className="overflow-x-auto rounded-xl border border-slate-700 shadow-xl">
            <table className="min-w-full divide-y divide-slate-700">
                <thead className="text-white bg-[#0b3a61]">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer" onClick={() => onSort('productName')}>
                            <div className="flex items-center whitespace-nowrap">Product <SortArrow column="productName" sortColumn={sortColumn} sortDirection={sortDirection} /></div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer" onClick={() => onSort('category')}>
                            <div className="flex items-center whitespace-nowrap">Category <SortArrow column="category" sortColumn={sortColumn} sortDirection={sortDirection} /></div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer" onClick={() => onSort('stockLevel')}>
                            <div className="flex items-center whitespace-nowrap">Stock Level <SortArrow column="stockLevel" sortColumn={sortColumn} sortDirection={sortDirection} /></div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer" onClick={() => onSort('minStock')}>
                            <div className="flex items-center whitespace-nowrap">Min. Stock <SortArrow column="minStock" sortColumn={sortColumn} sortDirection={sortDirection} /></div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer" onClick={() => onSort('status')}>
                            <div className="flex items-center whitespace-nowrap">Status <SortArrow column="status" sortColumn={sortColumn} sortDirection={sortDirection} /></div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer" onClick={() => onSort('location')}>
                            <div className="flex items-center whitespace-nowrap">Location <SortArrow column="location" sortColumn={sortColumn} sortDirection={sortDirection} /></div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-transparent divide-y divide-slate-700">
                    {items.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-800 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <img
                                        src={item.image}
                                        alt={item.productName}
                                        className="w-10 h-10 rounded-lg object-cover shadow-sm border border-slate-700"
                                    />
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-slate-100">{item.productName}</div>
                                        <div className="text-xs text-slate-500 font-mono">{item.id}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-slate-300 text-sm">{item.category}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-3">
                                    <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all ${item.stockLevel <= item.minStock ? 'bg-red-500' : 'bg-green-500'
                                                }`}
                                            style={{ width: `${Math.min(100, (item.stockLevel / 200) * 100)}%` }}
                                        />
                                    </div>
                                    <span className="text-sm text-slate-200 font-semibold">{item.stockLevel}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-slate-300 font-mono text-sm">{item.minStock}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`flex items-center w-fit gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ring-1 ring-inset ${item.status === 'In Stock'
                                    ? 'bg-green-500/10 text-green-400 ring-green-500/20'
                                    : item.status === 'Low Stock'
                                        ? 'bg-yellow-500/10 text-yellow-400 ring-yellow-500/20'
                                        : 'bg-red-500/10 text-red-400 ring-red-500/20'
                                    }`}>
                                    {item.status === 'Low Stock' && <AlertTriangle className="w-3 h-3" />}
                                    {item.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-slate-300 text-sm">{item.location}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex space-x-2">
                                    <button title="View" className="p-1.5 bg-purple-500/10 text-purple-400 rounded-lg hover:bg-purple-500 hover:text-white transition-all">
                                        <Eye className="h-4 w-4" />
                                    </button>
                                    <button title="Edit" className="p-1.5 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500 hover:text-white transition-all">
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                    <button title="Delete" className="p-1.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default InventoryTable;
