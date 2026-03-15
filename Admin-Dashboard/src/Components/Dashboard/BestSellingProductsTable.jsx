import React from 'react';
import { Eye, Pencil, Trash2, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useProductLink from '../../hooks/useProductLink';


const SortArrow = ({ column, sortColumn, sortDirection }) => {
    if (sortColumn !== column) return <span className="opacity-20 ml-1 inline-flex flex-col leading-[0] align-middle"><span className="text-[8px]">▲</span><span className="text-[8px]">▼</span></span>;
    return <span className="ml-1 inline-flex flex-col leading-[0] align-middle font-bold text-blue-400"><span className={`text-[8px] ${sortDirection === 'asc' ? 'opacity-100' : 'opacity-20'}`}>▲</span><span className={`text-[8px] ${sortDirection === 'desc' ? 'opacity-100' : 'opacity-20'}`}>▼</span></span>;
};

const TakaIcon = ({ className = "w-3 h-3" }) => (
    <img src="/currency-taka.svg" alt="৳" className={`${className} opacity-70 brightness-125`} />
);

const BestSellingProductsTable = ({ products, sortColumn, sortDirection, handleSort, handleDelete }) => {
    const navigate = useNavigate();
    const { copyToClipboard } = useProductLink();

    return (
        <div className="overflow-x-auto rounded-lg border border-slate-700 shadow-sm">
            <table className="min-w-full divide-y divide-slate-700">
                <thead className="text-white sticky top-0 z-10" style={{ backgroundColor: 'var(--accent-strong-start)' }}>
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            <input type="checkbox" className="rounded bg-slate-800 border-slate-600 focus:ring-blue-500/20" />
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
                            <tr key={product.id} className="hover:bg-slate-800/60 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <input type="checkbox" className="rounded bg-slate-800 border-slate-700" />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-100">{product.product_id || product.sku}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <img
                                            src={product.image || 'https://via.placeholder.com/40'}
                                            alt={product.name}
                                            className="h-10 w-10 rounded-lg object-cover bg-slate-800 border border-slate-700"
                                        />
                                        <div className="ml-4 max-w-[200px]">
                                            <h3 
                                                onClick={() => copyToClipboard(product.slug, product.name)}
                                                className="text-sm font-medium text-slate-100 truncate cursor-pointer hover:text-blue-400 transition-colors"
                                                title="Click to copy product link"
                                            >
                                                {product.name}
                                            </h3>
                                            <p className="text-xs text-slate-400 truncate">{product.short_description}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                                    <span className="bg-blue-600/10 text-blue-400 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-tight border border-blue-500/20">
                                        {product.category?.name || 'Uncategorized'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{product.brand?.name || 'No Brand'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <div className="flex flex-col">
                                        {product.discount_price && parseFloat(product.discount_price) > 0 ? (
                                            <>
                                                <div className="flex items-center text-emerald-400 font-bold font-mono">
                                                    <TakaIcon className="w-3.5 h-3.5 mr-0.5 mt-0.5" />
                                                    {parseFloat(product.discount_price).toLocaleString()}
                                                </div>
                                                <div className="flex items-center text-slate-500 text-[10px] line-through font-mono opacity-50">
                                                    <TakaIcon className="w-2.5 h-2.5 mr-0.5" />
                                                    {parseFloat(product.price).toLocaleString()}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex items-center text-slate-100 font-bold font-mono">
                                                <TakaIcon className="w-3.5 h-3.5 mr-0.5 mt-0.5" />
                                                {parseFloat(product.price).toLocaleString()}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${product.stock_quantity > 10 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                        {product.stock_quantity} In Stock
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                                    <div className="flex items-center gap-1.5">
                                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                                        <span className="font-bold text-slate-100">{product.rating || '0.0'}</span>
                                        <span className="text-slate-500 text-xs">({product.reviews_count || 0})</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300 font-mono text-blue-400 uppercase text-[11px] tracking-wider">
                                    {product.product_type}
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
                                        <button 
                                            onClick={() => navigate(`/products/view/${product.id}`)}
                                            className="p-1.5 bg-purple-500/10 text-purple-400 rounded-lg hover:bg-purple-500 hover:text-white transition-all cursor-pointer"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </button>
                                        <button 
                                            onClick={() => navigate(`/products/edit/${product.id}`)}
                                            className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500 hover:text-white transition-all cursor-pointer"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                        <button onClick={() => handleDelete && handleDelete(product.id)} className="p-1.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all cursor-pointer">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={11} className="px-6 py-12 text-center text-slate-500 italic">No products found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default BestSellingProductsTable;
