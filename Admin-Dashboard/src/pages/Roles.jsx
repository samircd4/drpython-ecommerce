import { useState, useEffect, useMemo } from "react";
import { 
    ShieldCheck, 
    Plus, 
    Trash2, 
    Users, 
    ShieldAlert, 
    Lock,
    X,
    CheckCircle2,
    Search,
    ChevronRight,
    Key,
    Save,
    Layout
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axiosConfig";
import Breadcrumb from "../components/Layout/Breadcrumb";
import toast from "react-hot-toast";
import { useAuth } from "../Context/AuthContext";

const Roles = () => {
    const { hasPermission } = useAuth();
    const [roles, setRoles] = useState([]);
    const [allPermissions, setAllPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModifying, setIsModifying] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [formData, setFormData] = useState({ name: "", permissions: [] });
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchRolesAndPermissions = async () => {
        setLoading(true);
        try {
            const [rolesRes, permsRes] = await Promise.all([
                api.get('/groups/'),
                api.get('/permissions/')
            ]);
            setRoles(rolesRes.data || []);
            setAllPermissions(permsRes.data || []);
        } catch (err) {
            console.error("Discovery failure:", err);
            toast.error("Failed to synchronize security registry.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRolesAndPermissions();
    }, []);

    // Friendly names for models
    const MODEL_LABELS = {
        'product': '📦 Product',
        'productvariant': '📦 Product Variant',
        'productimage': '📦 Product Image',
        'productspecification': '📦 Product Specification',
        'category': '🏷️ Category',
        'brand': '🏷️ Brand',
        'order': '🛒 Order',
        'orderitem': '🛒 Order Item',
        'payment': '💳 Payment',
        'coupon': '🎟️ Coupon',
        'customer': '👤 Customer',
        'address': '📍 Address',
        'review': '⭐ Review',
        'question': '❓ Q&A',
        'answer': '❓ Answer',
        'contact': '📧 Contact',
        'subscribe': '📧 Subscription',
        'user': '🔐 User',
        'group': '🔐 Group',
        'conversation': '💬 Conversation',
        'message': '💬 Message',
        'notification': '🔔 Notification',
        'storeconfiguration': '⚙️ Store Config',
        'cart': '🛒 Cart',
        'cartitem': '🛒 Cart Item',
        'checkout': '🛒 Checkout',
        'address': '🏠 Address',
        'data_management': '📊 Data Management',
    };

    // Also keep app-level labels for the card breakdown
    const APP_LABELS = {
        'products': '📦 Products',
        'orders': '🛒 Orders & Payments',
        'accounts': '👤 Customers & Addresses',
        'reviews': '⭐ Reviews',
        'auth': '🔐 Users & Groups',
        'chat': '💬 Chat',
        'web': '🌐 Website',
    };

    // Group permissions by model (from backend) with friendly names
    const groupedPermissions = useMemo(() => {
        const groups = {};
        allPermissions.forEach(perm => {
            // Special Case: Isolate Export/Import into its own card
            if (perm.codename === 'export_import' || perm.codename === 'export_product') {
                const groupName = MODEL_LABELS['data_management'];
                if (!groups[groupName]) groups[groupName] = [];
                groups[groupName].push(perm);
                return;
            }

            const modelName = perm.model || 'system';
            const groupName = MODEL_LABELS[modelName] || modelName;
            
            if (!groups[groupName]) groups[groupName] = [];
            groups[groupName].push(perm);
        });
        
        // Sort by the order defined in MODEL_LABELS
        const orderedKeys = Object.values(MODEL_LABELS);
        const sorted = {};
        orderedKeys.forEach(key => {
            if (groups[key]) sorted[key] = groups[key];
        });
        // Add any remaining
        Object.keys(groups).forEach(key => {
            if (!sorted[key]) sorted[key] = groups[key];
        });
        
        return sorted;
    }, [allPermissions]);

    const handleOpenModal = (role = null) => {
        if (role) {
            setEditingRole(role);
            setFormData({ name: role.name, permissions: role.permissions || [] });
        } else {
            setEditingRole(null);
            setFormData({ name: "", permissions: [] });
        }
        setIsModifying(true);
    };

    const handlePermissionToggle = (permId) => {
        setFormData(prev => {
            const current = [...prev.permissions];
            if (current.includes(permId)) {
                return { ...prev, permissions: current.filter(id => id !== permId) };
            } else {
                return { ...prev, permissions: [...current, permId] };
            }
        });
    };

    const handleToggleModule = (modulePerms, allChecked) => {
        setFormData(prev => {
            let nextPerms = [...prev.permissions];
            const moduleIds = modulePerms.map(p => p.id);
            
            if (allChecked) {
                // Uncheck all in this module
                nextPerms = nextPerms.filter(id => !moduleIds.includes(id));
            } else {
                // Check all in this module
                moduleIds.forEach(id => {
                    if (!nextPerms.includes(id)) nextPerms.push(id);
                });
            }
            return { ...prev, permissions: nextPerms };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) return;
        
        setSaving(true);
        try {
            if (editingRole) {
                await api.patch(`/groups/${editingRole.id}/`, formData);
                toast.success(`Access protocol '${formData.name}' updated.`);
            } else {
                await api.post('/groups/', formData);
                toast.success(`New security role '${formData.name}' initialized.`);
            }
            setIsModifying(false);
            fetchRolesAndPermissions();
        } catch (err) {
            console.error("Persistence failure:", err);
            toast.error(err.response?.data?.name?.[0] || "Failed to save security configuration.");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteRole = async (id, name) => {
        if (!window.confirm(`Are you sure you want to decommission the '${name}' role?`)) return;
        
        try {
            await api.delete(`/groups/${id}/`);
            toast.success(`Role '${name}' removed from registry.`);
            fetchRolesAndPermissions();
        } catch (err) {
            console.error("Decommission error:", err);
            toast.error("Failed to decommissioning role.");
        }
    };

    if (loading && roles.length === 0) return (
        <div className="min-h-screen flex items-center justify-center bg-[#071229]">
            <div className="w-16 h-16 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="p-4 sm:p-8 min-h-screen bg-transparent">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 sm:px-0">
                    <div>
                        <Breadcrumb 
                            title="Access Control Matrix" 
                            paths={[
                                { label: "Home", path: "/" },
                                { label: "Users", path: "/users" },
                                { label: "Roles & Permissions", path: "/roles" }
                            ]} 
                        />
                        <h1 className="text-2xl font-black text-white uppercase tracking-tight mt-1 flex items-center gap-3">
                            <ShieldCheck className="w-7 h-7 text-indigo-500" />
                            Security Authority
                        </h1>
                    </div>
                    <button 
                        onClick={() => handleOpenModal()}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl transition-all shadow-xl shadow-indigo-600/20 font-black text-[10px] uppercase tracking-widest active:scale-[0.98] cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        Initialize New Role
                    </button>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 sm:px-0">
                    <AnimatePresence>
                        {roles.map((role, index) => (
                            <motion.div 
                                key={role.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-[#0b1a2a] border border-slate-700/40 rounded-[2.5rem] p-8 group hover:border-indigo-500/30 transition-all shadow-2xl hover:shadow-indigo-500/10 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
                                    <ShieldCheck className="w-32 h-32" />
                                </div>

                                <div className="flex items-center justify-between mb-8">
                                    <div className="p-4 bg-indigo-500/10 rounded-2xl">
                                        <Lock className="w-6 h-6 text-indigo-400 group-hover:rotate-12 transition-transform" />
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => hasPermission('auth.change_group') && handleOpenModal(role)}
                                            disabled={!hasPermission('auth.change_group')}
                                            className={`p-2 transition-colors ${
                                                hasPermission('auth.change_group')
                                                    ? 'text-slate-400 hover:text-indigo-400 cursor-pointer'
                                                    : 'text-slate-600/30 cursor-not-allowed hidden'
                                            }`}
                                        >
                                            <Save className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => hasPermission('auth.delete_group') && handleDeleteRole(role.id, role.name)}
                                            disabled={!hasPermission('auth.delete_group')}
                                            className={`p-2 transition-colors ${
                                                hasPermission('auth.delete_group')
                                                    ? 'text-slate-400 hover:text-red-400 cursor-pointer'
                                                    : 'text-slate-600/30 cursor-not-allowed hidden'
                                            }`}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                
                                <h3 className="text-xl font-black text-white tracking-tight uppercase mb-2">{role.name}</h3>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">{role.permissions?.length || 0} Permissions</span>
                                </div>
                                
                                {/* Grouped permission breakdown */}
                                <div className="space-y-1.5 mb-6 max-h-40 overflow-y-auto no-scrollbar">
                                    {(() => {
                                        const permIds = role.permissions || [];
                                        if (permIds.length === 0) return (
                                            <p className="text-[10px] text-slate-600 italic">No permissions assigned</p>
                                        );
                                        
                                        // Group the role's permission IDs by the app label from allPermissions
                                        const breakdown = {};
                                        permIds.forEach(pid => {
                                            const perm = allPermissions.find(p => p.id === pid);
                                            if (perm) {
                                                const label = APP_LABELS[perm.app_label] || perm.app_label;
                                                if (!breakdown[label]) breakdown[label] = [];
                                                breakdown[label].push(perm);
                                            }
                                        });
                                        
                                        return Object.entries(breakdown).map(([label, perms]) => (
                                            <div key={label} className="flex items-center justify-between px-3 py-1.5 bg-slate-800/30 rounded-xl">
                                                <span className="text-[11px] font-bold text-slate-400">{label}</span>
                                                <span className="text-[10px] font-black text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md">{perms.length}</span>
                                            </div>
                                        ));
                                    })()}
                                </div>
                                
                                <div className="pt-4 border-t border-slate-800/60 flex items-center justify-end">
                                    <button 
                                        onClick={() => handleOpenModal(role)}
                                        className="text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                                    >
                                        Configure →
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Matrix Configuration Modal */}
            <AnimatePresence>
                {isModifying && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-12 overflow-hidden">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-[#071229]/95 backdrop-blur-xl"
                            onClick={() => setIsModifying(false)}
                        />
                        
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative bg-[#0b1a2a] border border-slate-700/50 w-full max-w-5xl h-full max-h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="p-8 border-b border-slate-800 bg-gradient-to-r from-indigo-600/10 via-transparent to-transparent flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-indigo-500/20 rounded-2xl">
                                        <Layout className="w-6 h-6 text-indigo-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-white uppercase tracking-tight">Authority Configuration</h2>
                                        <p className="text-xs text-slate-500 font-medium">Reconfiguring security privileges for the operational cluster.</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsModifying(false)} className="p-3 bg-slate-800/40 hover:bg-slate-800 text-slate-400 hover:text-white rounded-2xl transition-all cursor-pointer"> 
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-auto p-8 lg:p-12">
                                <form onSubmit={handleSubmit} className="space-y-12">
                                    {/* Role Identity */}
                                    <section className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-4 w-1 bg-indigo-500 rounded-full" />
                                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Group Core Identifier</h3>
                                        </div>
                                        <input 
                                            required
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-[#071229] border border-slate-700/60 rounded-2xl px-8 py-5 text-lg font-black text-white placeholder:text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-600/20 border-l-4 border-l-indigo-600 transition-all uppercase tracking-tight"
                                            placeholder="Enter Security Role Name..."
                                        />
                                    </section>

                                    {/* Permission Matrix */}
                                    <section className="space-y-8 text-left">
                                        <div className="flex items-center justify-between flex-wrap gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-4 w-1 bg-emerald-500 rounded-full" />
                                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Capability Assignment Matrix</h3>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />
                                                    <input
                                                        type="text"
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                        placeholder="Filter permissions..."
                                                        className="bg-[#071229] border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-300 placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 w-56"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2 px-3 py-1 bg-slate-800/40 rounded-full">
                                                    <span className="text-[9px] font-black text-indigo-400">{formData.permissions.length}</span>
                                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">Active</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {Object.entries(groupedPermissions).map(([module, perms]) => {
                                                // Filter permissions by search term
                                                const filteredPerms = searchTerm 
                                                    ? perms.filter(p => 
                                                        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                        p.codename.toLowerCase().includes(searchTerm.toLowerCase())
                                                      )
                                                    : perms;
                                                
                                                if (filteredPerms.length === 0) return null;
                                                
                                                const allChecked = filteredPerms.every(p => formData.permissions.includes(p.id));
                                                const someChecked = filteredPerms.some(p => formData.permissions.includes(p.id));

                                                return (
                                                    <div key={module} className="bg-[#071229] border border-slate-800 rounded-3xl overflow-hidden flex flex-col">
                                                        <div className={`px-6 py-4 border-b border-slate-800 flex items-center justify-between ${someChecked ? 'bg-indigo-900/20' : 'bg-slate-800/30'}`}>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-black text-slate-300 tracking-wide">{module}</span>
                                                                <span className="text-[9px] font-bold text-slate-600">({filteredPerms.length})</span>
                                                            </div>
                                                            <button 
                                                                type="button"
                                                                onClick={() => handleToggleModule(filteredPerms, allChecked)}
                                                                className={`text-[9px] font-black uppercase tracking-tighter px-2.5 py-1 rounded-lg transition-all cursor-pointer ${allChecked ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-400 hover:text-white'}`}
                                                            >
                                                                {allChecked ? 'Revoke All' : 'Grant All'}
                                                            </button>
                                                        </div>
                                                        <div className="p-4 grid grid-cols-1 gap-1">
                                                            {filteredPerms.map(perm => (
                                                                <label 
                                                                    key={perm.id}
                                                                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${formData.permissions.includes(perm.id) ? 'bg-indigo-600/10' : 'hover:bg-slate-800/40'}`}
                                                                >
                                                                    <div className="relative">
                                                                        <input 
                                                                            type="checkbox"
                                                                            checked={formData.permissions.includes(perm.id)}
                                                                            onChange={() => handlePermissionToggle(perm.id)}
                                                                            className="w-5 h-5 appearance-none border-2 border-slate-700 rounded-md checked:bg-indigo-600 checked:border-indigo-600 transition-all cursor-pointer"
                                                                        />
                                                                        {formData.permissions.includes(perm.id) && <CheckCircle2 className="w-3.5 h-3.5 text-white absolute top-[3px] left-[3px] pointer-events-none" />}
                                                                    </div>
                                                                    <div className="flex flex-col">
                                                                        <span className={`text-[11px] font-bold ${formData.permissions.includes(perm.id) ? 'text-indigo-300' : 'text-slate-400'}`}>
                                                                            {perm.name}
                                                                        </span>
                                                                        <span className="text-[9px] text-slate-700 font-mono font-bold tracking-tight">
                                                                            {perm.app_label}.{perm.codename}
                                                                        </span>
                                                                    </div>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </section>
                                </form>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-8 border-t border-slate-800 bg-[#071229]/50 flex items-center justify-end gap-4">
                                <button 
                                    type="button"
                                    onClick={() => setIsModifying(false)}
                                    className="px-8 py-4 text-slate-500 font-black uppercase tracking-widest text-[10px] hover:text-slate-300 transition-colors cursor-pointer"
                                >
                                    Abort Changes
                                </button>
                                <button 
                                    onClick={handleSubmit}
                                    disabled={saving || !formData.name.trim()}
                                    className="flex items-center justify-center gap-3 px-12 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-indigo-600/20 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                                >
                                    {saving ? (
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <ShieldCheck className="w-4 h-4" />
                                            Commit Protocol
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Roles;
