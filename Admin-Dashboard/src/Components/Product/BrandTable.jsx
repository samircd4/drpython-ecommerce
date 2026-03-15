import React from 'react';
import { Eye, Pencil, Trash2 } from 'lucide-react';

const BrandTable = ({ brands, loading, handleDelete, onEdit, onView }) => {
    if (loading) {
        return (
            <div className="flex items-center justify-center p-20 bg-[#0b1a2a]/50 rounded-2xl border border-slate-800">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-lg border border-slate-700 shadow-sm">
            <table className="min-w-full divide-y divide-slate-700">
                <thead className="text-white sticky top-0 z-10" style={{ backgroundColor: 'var(--accent-strong-start)' }}>
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Logo</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Slug</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-transparent divide-y divide-slate-700">
                    {brands && brands.length > 0 ? (
                        brands.map((brand) => (
                            <tr key={brand.id} className="hover:bg-slate-800 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-100">{brand.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <img
                                        src={brand.logo || 'https://via.placeholder.com/40'}
                                        alt={brand.name}
                                        className="h-10 w-10 rounded-lg object-contain bg-slate-800 p-1"
                                    />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-100">{brand.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400 font-mono">{brand.slug}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex space-x-2">
                                        <button 
                                            title="View Details"
                                            onClick={() => onView && onView(brand)}
                                            className="p-1.5 bg-purple-500/10 text-purple-400 rounded-lg hover:bg-purple-500 hover:text-white transition-all cursor-pointer"
                                        >
                                            <Eye className="h-5 w-5" />
                                        </button>
                                        <button 
                                            title="Edit Brand"
                                            onClick={() => onEdit && onEdit(brand)}
                                            className="p-1.5 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500 hover:text-white transition-all cursor-pointer"
                                        >
                                            <Pencil className="h-5 w-5" />
                                        </button>
                                        <button 
                                            title="Delete Brand"
                                            onClick={() => handleDelete && handleDelete(brand.id)} 
                                            className="p-1.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={5} className="px-6 py-6 text-center text-slate-300">No brands found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default BrandTable;
