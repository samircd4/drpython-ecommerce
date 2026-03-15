import React from 'react';
import { X, ExternalLink, Layers, GitBranch } from 'lucide-react';

const CategoryViewModal = ({ isOpen, onClose, category }) => {
    if (!isOpen || !category) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-[#0b1a2a] w-full max-w-md rounded-2xl border border-slate-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0b3a61]/30">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        Category Details
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-8">
                    <div className="flex flex-col items-center">
                        <div className="w-32 h-32 rounded-3xl bg-slate-800 border-2 border-slate-700 flex items-center justify-center overflow-hidden mb-6 shadow-xl">
                            <img 
                                src={category.logo || 'https://via.placeholder.com/128'} 
                                alt={category.name} 
                                className="w-full h-full object-contain p-4"
                            />
                        </div>
                        
                        <h2 className="text-2xl font-bold text-white mb-1">{category.name}</h2>
                        <code className="text-sm text-emerald-400 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20 mb-8 lowercase tracking-wide font-mono">
                            slug: {category.slug}
                        </code>

                        <div className="w-full grid grid-cols-2 gap-4">
                            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700 flex items-center gap-3">
                                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                                    <Layers className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Type</p>
                                    <p className="text-sm text-slate-200">{category.parent ? 'Sub-category' : 'Main Category'}</p>
                                </div>
                            </div>
                            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700 flex items-center gap-3">
                                <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                                    <GitBranch className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Parent ID</p>
                                    <p className="text-sm text-slate-200">{category.parent || 'None'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="w-full mt-6 bg-slate-800/20 p-4 rounded-xl border border-slate-700/50">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs text-slate-400 font-medium uppercase tracking-widest">Global UID</span>
                                <span className="text-xs text-slate-200 font-mono">#CAT-{category.id}</span>
                            </div>
                            <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 w-full animate-pulse opacity-50"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 bg-slate-800/30 border-t border-slate-800 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 border border-slate-700 transition-colors text-sm font-semibold"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CategoryViewModal;
