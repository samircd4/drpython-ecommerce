import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
    User, 
    Mail, 
    Save,
    ArrowLeft,
    X,
    ShieldCheck,
    ShieldAlert,
    Trash2,
    Lock,
    Key,
    Activity,
    ChevronRight,
    Search
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axiosConfig";
import Breadcrumb from "../components/Layout/Breadcrumb";
import toast from "react-hot-toast";

const UserEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [groups, setGroups] = useState([]);
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        is_staff: false,
        is_active: false,
        is_superuser: false,
        groups: []
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userRes, groupsRes] = await Promise.all([
                    api.get(`/users/${id}/`),
                    api.get('/groups/')
                ]);
                
                const { first_name, last_name, email, is_staff, is_active, is_superuser, groups: userGroups } = userRes.data;
                
                setFormData({
                    first_name: first_name || "",
                    last_name: last_name || "",
                    email: email || "",
                    is_staff: is_staff || false,
                    is_active: is_active || false,
                    is_superuser: is_superuser || false,
                    groups: userGroups || []
                });
                
                setGroups(groupsRes.data || []);
            } catch (err) {
                console.error("Failed to fetch user data:", err);
                toast.error("Failed to synchronize with directory.");
                navigate('/all-users');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, navigate]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleGroupToggle = (groupName) => {
        setFormData(prev => {
            const currentGroups = [...prev.groups];
            if (currentGroups.includes(groupName)) {
                return { ...prev, groups: currentGroups.filter(g => g !== groupName) };
            } else {
                return { ...prev, groups: [...currentGroups, groupName] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.patch(`/users/${id}/`, formData);
            toast.success("Security clearance updated!");
            navigate(`/users/view/${id}`);
        } catch (err) {
            console.error("Failed to update user:", err);
            toast.error(err.response?.data?.detail || "System update failed.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#071229]">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-purple-500/10 border-t-purple-500 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <Lock className="w-6 h-6 text-purple-500/50" />
                </div>
            </div>
        </div>
    );

    return (
        <div className="p-4 sm:p-8 min-h-screen bg-transparent">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 sm:px-0">
                    <div>
                        <Breadcrumb 
                            title="Security Configuration" 
                            paths={[
                                { label: "Home", path: "/" },
                                { label: "Users", path: "/users" },
                                { label: "Edit Operator", path: `/users/edit/${id}` }
                            ]} 
                        />
                        <h1 className="text-2xl font-black text-white uppercase tracking-tight mt-1">Configure Permissions</h1>
                    </div>
                    <button 
                        onClick={() => navigate(`/users/view/${id}`)}
                        className="group flex items-center gap-2 px-5 py-2.5 bg-slate-800/40 hover:bg-slate-800 text-slate-300 rounded-2xl transition-all border border-slate-700/50 hover:border-slate-600 font-bold text-sm"
                    >
                        <X className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                        Cancel Modification
                    </button>
                </div>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-[#0b1a2a] border border-slate-700/40 rounded-[2.5rem] shadow-2xl overflow-hidden relative"
                >
                    <div className="p-8 border-b border-slate-800 bg-gradient-to-r from-purple-500/10 via-transparent to-transparent flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-500/20 rounded-2xl">
                                <ShieldCheck className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-100 italic">Advanced Access Matrix</h2>
                                <p className="text-sm text-slate-500 font-medium">Reconfiguring operator privileges and temporal access.</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 sm:p-12 space-y-12">
                        {/* Profile Data */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <section className="space-y-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="h-4 w-1 bg-purple-500 rounded-full" />
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Personal Identification</h3>
                                </div>
                                <div className="space-y-2 text-left">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">First Name</label>
                                    <input 
                                        type="text"
                                        name="first_name"
                                        value={formData.first_name}
                                        onChange={handleChange}
                                        className="w-full bg-[#071229] border border-slate-700/60 rounded-2xl px-5 py-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600/50 transition-all font-medium border-l-4 border-l-transparent focus:border-l-purple-500"
                                        placeholder="First Name"
                                    />
                                </div>
                                <div className="space-y-2 text-left">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Last Name</label>
                                    <input 
                                        type="text"
                                        name="last_name"
                                        value={formData.last_name}
                                        onChange={handleChange}
                                        className="w-full bg-[#071229] border border-slate-700/60 rounded-2xl px-5 py-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600/50 transition-all font-medium border-l-4 border-l-transparent focus:border-l-purple-500"
                                        placeholder="Last Name"
                                    />
                                </div>
                                <div className="space-y-2 text-left">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">System Communication Email</label>
                                    <div className="relative group">
                                        <Mail className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                                        <input 
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full bg-[#071229] border border-slate-700/60 rounded-2xl pl-14 pr-5 py-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600/50 transition-all font-medium border-l-4 border-l-transparent focus:border-l-purple-500"
                                            placeholder="operator@sarker.shop"
                                        />
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="h-4 w-1 bg-emerald-500 rounded-full" />
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Operational Status</h3>
                                </div>
                                <div className="space-y-4">
                                    <StatusToggle 
                                        label="Active Protocol" 
                                        desc="Enable or revoke system access." 
                                        name="is_active" 
                                        checked={formData.is_active} 
                                        onChange={handleChange} 
                                        color="blue"
                                    />
                                    <StatusToggle 
                                        label="Staff Capabilities" 
                                        desc="Grant access to the management cluster." 
                                        name="is_staff" 
                                        checked={formData.is_staff} 
                                        onChange={handleChange} 
                                        color="emerald"
                                    />
                                    <StatusToggle 
                                        label="Superuser Status" 
                                        desc="Unrestricted root-level authority." 
                                        name="is_superuser" 
                                        checked={formData.is_superuser} 
                                        onChange={handleChange} 
                                        color="purple"
                                    />
                                </div>
                            </section>
                        </div>

                        {/* Roles / Groups Selection */}
                        <section className="space-y-6">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="h-4 w-1 bg-indigo-500 rounded-full" />
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Assigned Roles & Operations</h3>
                                </div>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{formData.groups.length} active roles</span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {groups.length === 0 ? (
                                    <div className="col-span-3 p-8 bg-[#071229] rounded-2xl border border-dashed border-slate-700 text-center">
                                        <ShieldAlert className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">No roles defined in system</p>
                                    </div>
                                ) : groups.map(group => (
                                    <button
                                        key={group.id}
                                        type="button"
                                        onClick={() => handleGroupToggle(group.name)}
                                        className={`p-5 rounded-2xl border transition-all text-left group/role ${
                                            formData.groups.includes(group.name)
                                                ? 'bg-purple-600/10 border-purple-500/40 shadow-lg shadow-purple-500/5'
                                                : 'bg-[#071229]/40 border-slate-800 hover:border-slate-700'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className={`p-2 rounded-xl ${formData.groups.includes(group.name) ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-400 group-hover/role:bg-slate-700'}`}>
                                                <Key className="w-4 h-4" />
                                            </div>
                                            {formData.groups.includes(group.name) && (
                                                <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                                            )}
                                        </div>
                                        <p className={`text-sm font-black uppercase tracking-tight ${formData.groups.includes(group.name) ? 'text-purple-300' : 'text-slate-400 group-hover/role:text-slate-200'}`}>
                                            {group.name}
                                        </p>
                                        <p className="text-[9px] text-slate-600 font-bold mt-1 uppercase tracking-tighter">Authorized Operator</p>
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Action Control */}
                        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
                            <button 
                                type="button"
                                className="flex items-center gap-2 px-6 py-3 text-red-500/40 hover:text-red-500 transition-all font-black uppercase tracking-widest text-[10px] group/del disabled:cursor-not-allowed"
                                disabled
                            >
                                <Trash2 className="w-4 h-4 group-hover/del:scale-110 transition-transform" />
                                Decommission Account
                            </button>
                            
                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                <button 
                                    type="button"
                                    onClick={() => navigate(`/users/view/${id}`)}
                                    className="flex-1 sm:flex-none px-8 py-4 text-slate-400 font-bold text-sm hover:text-slate-200 transition-colors"
                                >
                                    Discard
                                </button>
                                <button 
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-12 py-4 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-purple-600/20 transition-all active:scale-[0.98] disabled:opacity-50"
                                >
                                    {saving ? (
                                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            Update Protocol
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

const StatusToggle = ({ label, desc, name, checked, onChange, color }) => (
    <label className={`flex items-center gap-5 p-5 bg-[#071229]/60 border border-slate-700/50 rounded-2xl cursor-pointer hover:border-${color}-500/50 transition-all group/toggle`}>
        <div className="relative">
            <input 
                type="checkbox"
                name={name}
                checked={checked}
                onChange={onChange}
                className={`w-6 h-6 appearance-none border-2 border-slate-600 rounded-lg checked:bg-${color}-600 checked:border-${color}-600 transition-all cursor-pointer`}
            />
            {checked && (
                <ShieldCheck className="w-4 h-4 text-white absolute top-1 left-1 pointer-events-none" />
            )}
        </div>
        <div>
            <p className={`text-sm font-bold text-slate-200 transition-colors group-hover/toggle:text-${color}-300`}>{label}</p>
            <p className="text-[10px] text-slate-500 font-medium">{desc}</p>
        </div>
    </label>
);

export default UserEdit;
