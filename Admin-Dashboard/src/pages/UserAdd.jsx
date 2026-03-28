import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
    UserPlus, 
    Mail, 
    Save, 
    ArrowLeft, 
    X, 
    ShieldCheck, 
    Lock, 
    Key, 
    Activity,
    User,
    Eye,
    EyeOff
} from "lucide-react";
import { motion } from "framer-motion";
import api from "../api/axiosConfig";
import Breadcrumb from "../components/Layout/Breadcrumb";
import toast from "react-hot-toast";

const UserAdd = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [groups, setGroups] = useState([]);
    const [showPassword, setShowPassword] = useState(false);
    
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        first_name: "",
        last_name: "",
        is_staff: true,
        is_active: true,
        is_superuser: false,
        groups: []
    });

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const response = await api.get('/groups/');
                setGroups(response.data || []);
            } catch (err) {
                console.error("Failed to fetch roles:", err);
            }
        };
        fetchGroups();
    }, []);

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
        setLoading(true);
        try {
            const response = await api.post('/users/', formData);
            toast.success("New operator commissioned successfully!");
            navigate(`/users/view/${response.data.id}`);
        } catch (err) {
            console.error("Failed to create user:", err);
            const errors = err.response?.data;
            if (errors) {
                Object.keys(errors).forEach(key => {
                    toast.error(`${key}: ${errors[key]}`);
                });
            } else {
                toast.error("Deployment failed. Check system logs.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 sm:p-8 min-h-screen bg-transparent">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 sm:px-0">
                    <div>
                        <Breadcrumb 
                            title="Operator Recruitment" 
                            paths={[
                                { label: "Home", path: "/" },
                                { label: "Users", path: "/users" },
                                { label: "New Operator", path: "/users/add" }
                            ]} 
                        />
                        <h1 className="text-2xl font-black text-white uppercase tracking-tight mt-1">Deploy New Staff</h1>
                    </div>
                    <button 
                        onClick={() => navigate('/users')}
                        className="group flex items-center gap-2 px-5 py-2.5 bg-slate-800/40 hover:bg-slate-800 text-slate-300 rounded-2xl transition-all border border-slate-700/50 hover:border-slate-600 font-bold text-sm"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Directory
                    </button>
                </div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#0b1a2a] border border-slate-700/40 rounded-[2.5rem] shadow-2xl overflow-hidden relative"
                >
                    <div className="p-8 border-b border-slate-800 bg-gradient-to-r from-blue-600/10 via-transparent to-transparent flex items-center gap-4">
                        <div className="p-3 bg-blue-600/20 rounded-2xl">
                            <UserPlus className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-100 italic">Credential Enrollment</h2>
                            <p className="text-sm text-slate-500 font-medium">Provisioning a new terminal for administrative access.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 sm:p-12 space-y-12 transition-all">
                        {/* Auth Credentials */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="h-4 w-1 bg-blue-500 rounded-full" />
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Authentication Nodes</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Unique Username</label>
                                    <div className="relative group">
                                        <User className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                                        <input 
                                            required
                                            type="text"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            className="w-full bg-[#071229] border border-slate-700/60 rounded-2xl pl-14 pr-5 py-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/50 transition-all font-bold tracking-tight border-l-4 border-l-transparent focus:border-l-blue-500"
                                            placeholder="operator_77"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Access Passphrase</label>
                                    <div className="relative group">
                                        <Lock className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                                        <input 
                                            required
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="w-full bg-[#071229] border border-slate-700/60 rounded-2xl pl-14 pr-14 py-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/50 transition-all font-mono border-l-4 border-l-transparent focus:border-l-blue-500"
                                            placeholder="••••••••"
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Bio Data */}
                        <section className="space-y-6 text-left">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="h-4 w-1 bg-emerald-500 rounded-full" />
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Personal Information</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Legal First Name</label>
                                    <input 
                                        type="text"
                                        name="first_name"
                                        value={formData.first_name}
                                        onChange={handleChange}
                                        className="w-full bg-[#071229] border border-slate-700/60 rounded-2xl px-5 py-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600/50 transition-all font-medium border-l-4 border-l-transparent focus:border-l-emerald-500"
                                        placeholder="Admin"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Legal Last Name</label>
                                    <input 
                                        type="text"
                                        name="last_name"
                                        value={formData.last_name}
                                        onChange={handleChange}
                                        className="w-full bg-[#071229] border border-slate-700/60 rounded-2xl px-5 py-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600/50 transition-all font-medium border-l-4 border-l-transparent focus:border-l-emerald-500"
                                        placeholder="User"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Communication Email</label>
                                <div className="relative group">
                                    <Mail className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                                    <input 
                                        required
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full bg-[#071229] border border-slate-700/60 rounded-2xl pl-14 pr-5 py-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600/50 transition-all font-medium border-l-4 border-l-transparent focus:border-l-emerald-500"
                                        placeholder="operator@sarker.shop"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Privileges */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="h-4 w-1 bg-purple-500 rounded-full" />
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Authorization Matrix</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <StatusToggle color="blue" label="Active" desc="Can log in" name="is_active" checked={formData.is_active} onChange={handleChange} />
                                <StatusToggle color="emerald" label="Staff" desc="Admin access" name="is_staff" checked={formData.is_staff} onChange={handleChange} />
                                <StatusToggle color="purple" label="Super" desc="Full root" name="is_superuser" checked={formData.is_superuser} onChange={handleChange} />
                            </div>
                        </section>

                        {/* Roles */}
                        <section className="space-y-6 text-left">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="h-4 w-1 bg-indigo-500 rounded-full" />
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Operational Roles</h3>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {groups.map(group => (
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
                                        <div className={`p-2 rounded-xl inline-block mb-3 ${formData.groups.includes(group.name) ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                                            <Key className="w-4 h-4" />
                                        </div>
                                        <p className={`text-sm font-black uppercase tracking-tight ${formData.groups.includes(group.name) ? 'text-purple-300' : 'text-slate-400'}`}>
                                            {group.name}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Submit */}
                        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-end gap-4">
                            <button 
                                type="button"
                                onClick={() => navigate('/users')}
                                className="w-full sm:w-auto px-8 py-4 text-slate-500 font-black uppercase tracking-widest text-[10px] hover:text-slate-300 transition-colors"
                            >
                                Discard Protocol
                            </button>
                            <button 
                                type="submit"
                                disabled={loading}
                                className="w-full sm:w-auto flex items-center justify-center gap-3 px-12 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-blue-600/20 transition-all active:scale-[0.98] disabled:opacity-50"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Initialize Operator
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

const StatusToggle = ({ label, desc, name, checked, onChange, color }) => (
    <label className={`flex items-center gap-4 p-5 bg-[#071229]/60 border border-slate-700/50 rounded-2xl cursor-pointer hover:border-${color}-500/50 transition-all group/toggle text-left`}>
        <div className="relative">
            <input 
                type="checkbox"
                name={name}
                checked={checked}
                onChange={onChange}
                className={`w-6 h-6 appearance-none border-2 border-slate-600 rounded-lg checked:bg-${color}-600 checked:border-${color}-600 transition-all cursor-pointer`}
            />
            {checked && <ShieldCheck className="w-4 h-4 text-white absolute top-1 left-1 pointer-events-none" />}
        </div>
        <div>
            <p className={`text-sm font-bold text-slate-200 group-hover/toggle:text-${color}-300 transition-colors`}>{label}</p>
            <p className="text-[10px] text-slate-500 font-medium">{desc}</p>
        </div>
    </label>
);

export default UserAdd;
