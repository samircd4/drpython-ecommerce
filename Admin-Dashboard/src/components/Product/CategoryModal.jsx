import React, { useState, useEffect } from 'react';
import { X, Upload, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axiosConfig';

const CategoryModal = ({ isOpen, onClose, category, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        parent: '',
        logo: null
    });
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/categories/');
                setCategories(response.data.results || []);
            } catch (err) {
                console.error("Failed to fetch parent categories", err);
            }
        };
        if (isOpen) fetchCategories();
    }, [isOpen]);

    useEffect(() => {
        if (category) {
            setFormData({
                name: category.name || '',
                slug: category.slug || '',
                parent: category.parent || '',
                logo: null
            });
            setPreview(category.logo || null);
        } else {
            setFormData({ name: '', slug: '', parent: '', logo: null });
            setPreview(null);
        }
    }, [category, isOpen]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, logo: file });
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('slug', formData.slug);
            if (formData.parent) {
                data.append('parent', formData.parent);
            }
            if (formData.logo) {
                data.append('logo', formData.logo);
            }

            let response;
            if (category) {
                response = await api.patch(`/categories/${category.id}/`, data);
                toast.success('Category updated successfully');
            } else {
                response = await api.post('/categories/', data);
                toast.success('Category created successfully');
            }
            onSave && onSave(response.data);
            onClose();
        } catch (error) {
            console.error('Error saving category:', error);
            toast.error(error.response?.data?.detail || 'Failed to save category');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-[#0b1a2a] w-full max-w-md rounded-2xl border border-slate-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0b3a61]/30">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        {category ? 'Edit Category' : 'Add New Category'}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-4">
                        {/* Logo Upload */}
                        <div className="flex flex-col items-center">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-2xl bg-slate-800 border-2 border-dashed border-slate-700 flex items-center justify-center overflow-hidden transition-all group-hover:border-blue-500/50">
                                    {preview ? (
                                        <img src={preview} alt="Preview" className="w-full h-full object-contain p-2" />
                                    ) : (
                                        <Upload className="h-8 w-8 text-slate-500" />
                                    )}
                                </div>
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                                <div className="mt-2 text-center text-xs text-slate-400">
                                    Click to {preview ? 'change' : 'upload'} logo
                                </div>
                            </div>
                        </div>

                        {/* Name Field */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Category Name</label>
                            <input
                                required
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Electronics, Smartphones..."
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>

                        {/* Parent Field */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Parent Category</label>
                            <select
                                value={formData.parent}
                                onChange={(e) => setFormData({ ...formData, parent: e.target.value })}
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                            >
                                <option value="">Root Category</option>
                                {categories
                                    .filter(c => !category || c.id !== category.id)
                                    .map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))
                                }
                            </select>
                        </div>

                        {/* Slug Field */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Slug (Optional)</label>
                            <input
                                type="text"
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                placeholder="electronics..."
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-400 text-sm italic focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 transition-colors font-semibold shadow-lg"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-all font-semibold shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <><Check className="h-4 w-4" /> {category ? 'Update' : 'Create'}</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CategoryModal;
