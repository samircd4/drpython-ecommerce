import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Phone, User, Home, Briefcase, Star, Trash2, Pencil, Save, AlertCircle, CheckCircle, Plus, Search } from 'lucide-react';
import api from '../../api/axiosConfig';
import toast from 'react-hot-toast';

const AddressModal = ({ isOpen, onClose, address, onSave, mode: initialMode = 'view' }) => {
    const [mode, setMode] = useState(initialMode);
    const [loading, setLoading] = useState(false);
    const [divisions, setDivisions] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [subDistricts, setSubDistricts] = useState([]);
    
    // Customer Dropdown State
    const [customers, setCustomers] = useState([]);
    const [customerSearch, setCustomerSearch] = useState('');
    const [showCustDropdown, setShowCustDropdown] = useState(false);
    
    const [formData, setFormData] = useState({
        customer: '',
        customer_name: '',
        full_name: '',
        phone: '',
        address: '',
        division: '',
        district: '',
        sub_district: '',
        address_type: 'Home',
        is_default: false
    });

    useEffect(() => {
        if (isOpen) {
            if (address && initialMode !== 'create') {
                setFormData({
                    customer: address.customer || '',
                    customer_name: address.customer_name || '',
                    full_name: address.full_name || '',
                    phone: address.phone || '',
                    address: address.address || '',
                    division: address.division || '',
                    district: address.district || '',
                    sub_district: address.sub_district || '',
                    address_type: address.address_type || 'Home',
                    is_default: address.is_default || false
                });
                setMode(initialMode);
            } else {
                // Reset for Create
                setFormData({
                    customer: '',
                    customer_name: '',
                    full_name: '',
                    phone: '',
                    address: '',
                    division: '',
                    district: '',
                    sub_district: '',
                    address_type: 'Home',
                    is_default: false
                });
                setMode('create');
                fetchCustomers('');
            }
            
            if (initialMode === 'edit' || initialMode === 'create') {
                fetchDivisions();
            }
        }
    }, [isOpen, address, initialMode]);

    const fetchCustomers = async (query) => {
        try {
            const res = await api.get('/customers/', { params: { search: query, limit: 10 } });
            setCustomers(res.data.results || res.data);
        } catch (err) {
            console.error("Failed to fetch customers");
        }
    };

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (mode === 'create') fetchCustomers(customerSearch);
        }, 300);
        return () => clearTimeout(delayDebounce);
    }, [customerSearch, mode]);

    const fetchDivisions = async () => {
        try {
            const res = await api.get('/divisions/');
            setDivisions(res.data);
        } catch (err) {
            console.error("Failed to fetch divisions");
        }
    };

    const fetchDistricts = async (divName) => {
        try {
            const div = divisions.find(d => d.name === divName);
            if (div) {
                const res = await api.get(`/districts/?division_id=${div.id}`);
                setDistricts(res.data);
            }
        } catch (err) {
            console.error("Failed to fetch districts");
        }
    };

    const fetchSubDistricts = async (distName) => {
        try {
            const dist = districts.find(d => d.name === distName);
            if (dist) {
                const res = await api.get(`/sub-districts/?district_id=${dist.id}`);
                setSubDistricts(res.data);
            }
        } catch (err) {
            console.error("Failed to fetch sub-districts");
        }
    };

    useEffect(() => {
        if ((mode === 'edit' || mode === 'create') && formData.division && divisions.length > 0) {
            fetchDistricts(formData.division);
        }
    }, [formData.division, divisions, mode]);

    useEffect(() => {
        if ((mode === 'edit' || mode === 'create') && formData.district && districts.length > 0) {
            fetchSubDistricts(formData.district);
        }
    }, [formData.district, districts, mode]);

    const handleSubmit = async () => {
        if (mode === 'create' && !formData.customer) {
            toast.error("Please select a customer");
            return;
        }

        setLoading(true);
        try {
            if (mode === 'create') {
                await api.post('/addresses/', formData);
                toast.success("Address created successfully");
            } else {
                await api.put(`/addresses/${address.id}/`, formData);
                toast.success("Address updated successfully");
            }
            onSave();
            onClose();
        } catch (err) {
            toast.error(mode === 'create' ? "Failed to create address" : "Failed to update address");
        } finally {
            setLoading(false);
        }
    };

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleDelete = async () => {
        setLoading(true);
        try {
            await api.delete(`/addresses/${address.id}/`);
            toast.success("Address erased from system");
            onSave();
            onClose();
        } catch (err) {
            toast.error("Operation failed");
        } finally {
            setLoading(false);
            setShowDeleteConfirm(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                />
                
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-lg bg-[#0b1a2a] border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden"
                >
                    {/* Confirmation Overlay */}
                    <AnimatePresence>
                        {showDeleteConfirm && (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-8 text-center"
                            >
                                <div className="space-y-6">
                                    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
                                        <Trash2 className="w-10 h-10 text-red-500" />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-xl font-black text-white uppercase tracking-tight">System Purge</h4>
                                        <p className="text-slate-400 text-sm">This action will permanently delete this record. Proceed with caution.</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button 
                                            onClick={() => setShowDeleteConfirm(false)}
                                            className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl font-bold text-xs uppercase transition-all cursor-pointer"
                                        >
                                            Keep Address
                                        </button>
                                        <button 
                                            onClick={handleDelete}
                                            disabled={loading}
                                            className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-bold text-xs uppercase transition-all shadow-lg shadow-red-600/20 disabled:opacity-50 cursor-pointer"
                                        >
                                            {loading ? 'Erasing...' : 'Delete Now'}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Header */}
                    <div className="px-8 py-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-600/10 to-transparent">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-blue-500/10 rounded-2xl text-blue-400">
                                <Plus className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white tracking-tight uppercase">
                                    {mode === 'view' ? 'Address Intelligence' : mode === 'create' ? 'Onboard Address' : 'Refine Location'}
                                </h3>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                    {mode === 'create' ? 'Create New Entry' : address?.customer_name || 'Individual Profile'}
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                        {mode === 'view' ? (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <ViewField icon={User} label="Receiver" value={formData.full_name} />
                                    <ViewField icon={Phone} label="Phone" value={formData.phone} />
                                </div>
                                <div className="p-5 bg-slate-800/20 border border-slate-800 rounded-3xl">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Street Address</span>
                                    <p className="text-slate-200 text-sm leading-relaxed">{formData.address}</p>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <ViewField label="Sub-District" value={formData.sub_district} compact />
                                    <ViewField label="District" value={formData.district} compact />
                                    <ViewField label="Division" value={formData.division} compact />
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
                                    <div className="flex items-center gap-2">
                                        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${formData.address_type === 'Home' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}>
                                            {formData.address_type === 'Home' ? <Home className="w-3 h-3 inline mr-1" /> : <Briefcase className="w-3 h-3 inline mr-1" />}
                                            {formData.address_type}
                                        </div>
                                        {formData.is_default && (
                                            <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-black uppercase flex items-center gap-1">
                                                <Star className="w-3 h-3 fill-current" />
                                                Primary
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-5">
                                {mode === 'create' && (
                                    <div className="relative space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Assign Customer</label>
                                        <div 
                                            onClick={() => setShowCustDropdown(!showCustDropdown)}
                                            className="w-full bg-[#0b1a2a] border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-200 focus:border-blue-500 transition-colors cursor-pointer flex items-center justify-between"
                                        >
                                            <span className={formData.customer_name ? 'text-slate-100 font-bold' : 'text-slate-500'}>
                                                {formData.customer_name || 'Select a customer profile...'}
                                            </span>
                                            <Search className="w-4 h-4 text-slate-500" />
                                        </div>

                                        <AnimatePresence>
                                            {showCustDropdown && (
                                                <motion.div 
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="absolute z-10 w-full mt-2 bg-[#0b1a2a] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
                                                >
                                                    <div className="p-3 border-b border-slate-800">
                                                        <input 
                                                            type="text"
                                                            autoFocus
                                                            placeholder="Search name, email, or phone..."
                                                            className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                                                            value={customerSearch}
                                                            onChange={(e) => setCustomerSearch(e.target.value)}
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    </div>
                                                    <div className="max-h-48 overflow-y-auto custom-scrollbar">
                                                        {customers.length === 0 ? (
                                                            <div className="p-4 text-center text-xs text-slate-500 italic">No customers found</div>
                                                        ) : (
                                                            customers.map(c => (
                                                                <div 
                                                                    key={c.id}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setFormData({...formData, customer: c.id, customer_name: c.name});
                                                                        setShowCustDropdown(false);
                                                                    }}
                                                                    className="px-4 py-3 hover:bg-slate-800 transition-colors cursor-pointer border-b border-slate-800/50 last:border-0"
                                                                >
                                                                    <div className="flex flex-col">
                                                                        <span className="text-xs font-bold text-slate-200">{c.name}</span>
                                                                        <span className="text-[10px] text-slate-500">{c.email} • {c.phone_number || 'No phone'}</span>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-4">
                                    <InputField 
                                        label="Receiver Name" 
                                        value={formData.full_name} 
                                        onChange={(v) => setFormData({...formData, full_name: v})} 
                                        placeholder="Enter full name"
                                    />
                                    <InputField 
                                        label="Phone Number" 
                                        value={formData.phone} 
                                        onChange={(v) => setFormData({...formData, phone: v})} 
                                        placeholder="+8801..."
                                    />
                                </div>
                                <div className="space-y-4">
                                    <SelectField 
                                        label="Division" 
                                        options={divisions.map(d => d.name)} 
                                        value={formData.division}
                                        onChange={(v) => {
                                            setFormData({...formData, division: v, district: '', sub_district: ''});
                                            if (divisions.length === 0) fetchDivisions();
                                        }}
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <SelectField 
                                            label="District" 
                                            options={districts.map(d => d.name)} 
                                            value={formData.district}
                                            disabled={!formData.division}
                                            onChange={(v) => setFormData({...formData, district: v, sub_district: ''})}
                                        />
                                        <SelectField 
                                            label="Sub-District" 
                                            options={subDistricts.map(d => d.name)} 
                                            value={formData.sub_district}
                                            disabled={!formData.district}
                                            onChange={(v) => setFormData({...formData, sub_district: v})}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Street / House / Road</label>
                                    <textarea 
                                        value={formData.address}
                                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                                        className="w-full bg-[#0b1a2a] border border-slate-800 rounded-2xl p-4 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors h-24 resize-none"
                                        placeholder="Describe the exact location..."
                                    />
                                </div>
                                <div className="flex items-center gap-6 p-2">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Type</span>
                                        <div className="flex bg-slate-800/40 p-1 rounded-xl border border-slate-800">
                                            {['Home', 'Office'].map(t => (
                                                <button 
                                                    key={t}
                                                    type="button"
                                                    onClick={() => setFormData({...formData, address_type: t})}
                                                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer ${formData.address_type === t ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-slate-300'}`}
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input 
                                            type="checkbox" 
                                            checked={formData.is_default}
                                            onChange={(e) => setFormData({...formData, is_default: e.target.checked})}
                                            className="hidden"
                                        />
                                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${formData.is_default ? 'bg-emerald-500 border-emerald-500' : 'border-slate-700 bg-slate-800/50'}`}>
                                            {formData.is_default && <CheckCircle className="w-3 h-3 text-white" />}
                                        </div>
                                        <span className={`text-[10px] font-black uppercase tracking-tight transition-colors ${formData.is_default ? 'text-emerald-400' : 'text-slate-500'}`}>Set As Primary</span>
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-8 py-6 bg-slate-800/20 border-t border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {mode !== 'create' && (
                                <button 
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-xl transition-all font-bold text-xs uppercase cursor-pointer"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Remove
                                </button>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            {mode === 'view' ? (
                                <>
                                    <button 
                                        onClick={onClose}
                                        className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all font-bold text-xs uppercase cursor-pointer"
                                    >
                                        Close
                                    </button>
                                    <button 
                                        onClick={() => {
                                            if (divisions.length === 0) fetchDivisions();
                                            setMode('edit');
                                        }}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all font-bold text-xs uppercase shadow-lg shadow-blue-600/20 cursor-pointer"
                                    >
                                        <Pencil className="w-3.5 h-3.5" />
                                        Modify
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button 
                                        onClick={() => mode === 'create' ? onClose() : setMode('view')}
                                        className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all font-bold text-xs uppercase cursor-pointer"
                                    >
                                        {mode === 'create' ? 'Cancel' : 'Discard'}
                                    </button>
                                    <button 
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all font-bold text-xs uppercase shadow-lg shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
                                    >
                                        {loading ? <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                                        {mode === 'create' ? 'Onboard Address' : 'Save Changes'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

const ViewField = ({ icon: Icon, label, value, compact = false }) => (
    <div className={`flex flex-col ${compact ? 'space-y-1' : 'space-y-2'}`}>
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">{label}</span>
        <div className={`flex items-center gap-3 p-3 bg-slate-800/10 border border-slate-800/50 rounded-2xl ${compact ? 'py-2 px-3' : ''}`}>
            {Icon && <Icon className="w-3.5 h-3.5 text-slate-400" />}
            <span className={`text-slate-200 font-bold ${compact ? 'text-[10px]' : 'text-sm'}`}>{value || '—'}</span>
        </div>
    </div>
);

const InputField = ({ label, value, onChange, placeholder }) => (
    <div className="flex flex-col space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">{label}</label>
        <input 
            type="text" 
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-[#0b1a2a] border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
            placeholder={placeholder}
        />
    </div>
);

const SelectField = ({ label, options, value, onChange, disabled }) => (
    <div className="flex flex-col space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">{label}</label>
        <select 
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="w-full bg-[#0b1a2a] border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-30 appearance-none cursor-pointer"
        >
            <option value="">Select {label}</option>
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);

export default AddressModal;
