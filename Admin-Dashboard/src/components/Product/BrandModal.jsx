import React, { useState, useEffect } from 'react';
import { X, Upload, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axiosConfig';

const BrandModal = ({ isOpen, onClose, brand, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        logo: null
    });
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (brand) {
            setFormData({
                name: brand.name || '',
                slug: brand.slug || '',
                logo: null
            });
            setPreview(brand.logo || null);
        } else {
            setFormData({ name: '', slug: '', logo: null });
            setPreview(null);
        }
    }, [brand, isOpen]);

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
            if (formData.logo) {
                data.append('logo', formData.logo);
            }

            let response;
            if (brand) {
                response = await api.patch(`/brands/${brand.id}/`, data);
                toast.success('Brand updated successfully');
            } else {
                response = await api.post('/brands/', data);
                toast.success('Brand created successfully');
            }
            onSave(response.data);
            onClose();
        } catch (error) {
            console.error('Error saving brand:', error);
            toast.error(error.response?.data?.message || 'Failed to save brand');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-[#0b1a2a] w-full max-w-md rounded-2xl border border-slate-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0b3a61]/30">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        {brand ? 'Edit Brand' : 'Add New Brand'}
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
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Brand Name</label>
                            <input
                                required
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Samsung, Apple..."
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>

                        {/* Slug Field */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Slug (Optional)</label>
                            <input
                                type="text"
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                placeholder="samsung-galaxy..."
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-400 text-sm italic focus:outline-none focus:border-blue-500 transition-colors"
                            />
                            <p className="text-[10px] text-slate-500 mt-1">If left blank, slug will be auto-generated from name.</p>
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
                                <><Check className="h-4 w-4" /> {brand ? 'Update' : 'Create'}</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BrandModal;
