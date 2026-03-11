import React from 'react';
import { Eye, Pencil, Trash2 } from 'lucide-react';

const SortArrow = ({ column, sortColumn, sortDirection }) => {
    if (sortColumn !== column) return <span className="opacity-20 ml-1 inline-flex flex-col leading-[0] align-middle"><span className="text-[8px]">▲</span><span className="text-[8px]">▼</span></span>;
    return <span className="ml-1 inline-flex flex-col leading-[0] align-middle font-bold text-blue-400"><span className={`text-[8px] ${sortDirection === 'asc' ? 'opacity-100' : 'opacity-20'}`}>▲</span><span className={`text-[8px] ${sortDirection === 'desc' ? 'opacity-100' : 'opacity-20'}`}>▼</span></span>;
};

const BestSellingProductsTable = ({ products, sortColumn, sortDirection, handleSort }) => {
    return (
        <div className="overflow-x-auto rounded-lg border border-slate-700 shadow-sm">
            <table className="min-w-full divide-y divide-slate-700">
                <thead className="text-white sticky top-0 z-10" style={{ backgroundColor: 'var(--accent-strong-start)' }}>
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            <input type="checkbox" className="rounded bg-slate-800 border-slate-600" />
                        </th>
                        {[
                            { id: 'product_id', label: 'UID' },
                            { id: 'name', label: 'Product' },
                            { id: 'category', label: 'Category' },
                            { id: 'brand', label: 'Brand' },
                            { id: 'price', label: 'Price' },
                            { id: 'stock_quantity', label: 'Stock' },
                            { id: 'rating', label: 'Rating' },
                            { id: 'product_type', label: 'Type' },
                            { id: 'is_active', label: 'Status' }
                        ].map((col) => (
                            <th
                                key={col.id}
                                className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-white/10 transition-colors ${sortColumn === col.id ? 'bg-white/5' : ''}`}
                                onClick={() => handleSort(col.id)}
                            >
                                <div className="flex items-center whitespace-nowrap">
                                    {col.label} <SortArrow column={col.id} sortColumn={sortColumn} sortDirection={sortDirection} />
                                </div>
                            </th>
                        ))}
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-transparent divide-y divide-slate-700">
                    {products && products.length > 0 ? (
                        products.map((product) => (
                            <tr key={product.id} className="hover:bg-slate-800 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <input type="checkbox" className="rounded" />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-100">{product.product_id || product.sku}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <img
                                            src={product.image || 'https://via.placeholder.com/40'}
                                            alt={product.name}
                                            className="h-10 w-10 rounded-lg object-cover bg-slate-800"
                                        />
                                        <div className="ml-4 max-w-[200px]">
                                            <h3 className="text-sm font-medium text-slate-100 truncate">{product.name}</h3>
                                            <p className="text-xs text-slate-400 truncate">{product.short_description}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                                    <span className="bg-blue-600/10 text-blue-400 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tight">
                                        {product.category?.name || 'Uncategorized'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{product.brand?.name || 'No Brand'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {product.discount_price && product.discount_price !== product.price ? (
                                        <>
                                            <span className="line-through text-slate-500 mr-2">${product.price}</span>
                                            <span className="text-emerald-400 font-bold font-mono">${product.discount_price}</span>
                                        </>
                                    ) : (
                                        <span className="text-slate-100 font-bold font-mono">${product.price}</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${product.stock_quantity > 10 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                        {product.stock_quantity} In Stock
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                                    <div className="flex items-center gap-1">
                                        <span className="text-yellow-400">★</span>
                                        <span className="font-bold text-slate-100">{product.rating || 'N/A'}</span>
                                        <span className="text-slate-500">({product.reviews_count || 0})</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                                    <span className="font-mono text-blue-400">{product.product_type}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300 text-center">
                                    {product.is_active ? (
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                                    ) : (
                                        <span className="w-2 h-2 rounded-full bg-red-500 inline-block shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex space-x-2">
                                        <button className="text-purple-400 hover:text-purple-200">
                                            <Eye className="h-5 w-5" />
                                        </button>
                                        <button className="text-green-400 hover:text-green-200">
                                            <Pencil className="h-5 w-5" />
                                        </button>
                                        <button className="text-red-400 hover:text-red-200">
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={11} className="px-6 py-6 text-center text-slate-300">No products found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default BestSellingProductsTable;
