import React from 'react';
import { Eye, Pencil, Trash2 } from 'lucide-react';

const CategoryTable = ({ categories, loading }) => {
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
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Parent</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-transparent divide-y divide-slate-700">
                    {categories && categories.length > 0 ? (
                        categories.map((cat) => (
                            <tr key={cat.id} className="hover:bg-slate-800 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-100">{cat.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <img
                                        src={cat.logo || 'https://via.placeholder.com/40'}
                                        alt={cat.name}
                                        className="h-10 w-10 rounded-lg object-contain bg-slate-800 p-1"
                                    />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-100">{cat.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400 font-mono">{cat.slug}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                                    {cat.parent ? (
                                        <span className="bg-slate-800 px-2 py-1 rounded border border-slate-700">
                                            ID: {cat.parent}
                                        </span>
                                    ) : (
                                        <span className="text-slate-500 italic">None</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex space-x-2">
                                        <button className="text-purple-400 hover:text-purple-200"><Eye className="h-5 w-5" /></button>
                                        <button className="text-green-400 hover:text-green-200"><Pencil className="h-5 w-5" /></button>
                                        <button className="text-red-400 hover:text-red-200"><Trash2 className="h-5 w-5" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={6} className="px-6 py-6 text-center text-slate-300">No categories found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default CategoryTable;
