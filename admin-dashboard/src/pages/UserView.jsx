import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
    User as UserIcon, 
    Mail, 
    Calendar, 
    ShieldCheck, 
    ArrowLeft,
    Clock,
    Lock,
    Key,
    Activity,
    Settings,
    ShieldAlert,
    MoreVertical,
    CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axiosConfig";
import Breadcrumb from "../components/Layout/Breadcrumb";
import toast from "react-hot-toast";

const UserView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.get(`/users/${id}/`);
                setUserData(response.data);
            } catch (err) {
                console.error("Failed to fetch user:", err);
                setError("Failed to load operator details.");
                toast.error("Operator not found.");
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [id]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { staggerChildren: 0.08 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
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

    if (error || !userData) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#071229] text-white p-6">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-[#0b1a2a] p-8 rounded-3xl border border-slate-800 text-center max-w-md w-full shadow-2xl"
            >
                <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <ShieldAlert className="w-10 h-10 text-red-400" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Access Restricted</h2>
                <p className="text-slate-400 mb-8">{error || "The operator profile you requested cannot be located."}</p>
                <button 
                    onClick={() => navigate('/all-users')} 
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl transition-all font-bold border border-slate-700 active:scale-[0.98]"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Staff Directory
                </button>
            </motion.div>
        </div>
    );

    return (
        <div className="p-4 sm:p-8 min-h-screen bg-transparent">
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-6xl mx-auto space-y-8"
            >
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 sm:px-0">
                    <div>
                        <Breadcrumb title="Operator Intelligence" paths={["Home", "Users", userData.username]} />
                        <div className="flex items-center gap-4 mt-1">
                            <h1 className="text-2xl font-black text-white uppercase tracking-tight">System Operator</h1>
                            <div className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest ${userData.is_active ? 'bg-emerald-500/20 text-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.1)]' : 'bg-red-500/20 text-red-400'}`}>
                                {userData.is_active ? 'Active' : 'Disabled'}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => navigate('/all-users')}
                            className="group flex items-center gap-2 px-5 py-2.5 bg-slate-800/40 hover:bg-slate-800 text-slate-300 rounded-2xl transition-all border border-slate-700/50 hover:border-slate-600 font-bold text-sm"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Staff List
                        </button>
                        <button 
                            onClick={() => navigate(`/users/edit/${userData.id}`)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl transition-all shadow-lg shadow-purple-600/20 font-bold text-sm active:scale-[0.98]"
                        >
                            <Key className="w-4 h-4" />
                            Manage Permissions
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-4 sm:px-0">
                    {/* Left Column - User Credentials */}
                    <div className="lg:col-span-4 space-y-6">
                        <motion.div variants={itemVariants} className="bg-[#0b1a2a] border border-slate-700/40 rounded-[2.5rem] overflow-hidden shadow-2xl relative transition-all hover:border-purple-500/30">
                            <div className="h-32 bg-gradient-to-br from-purple-600/30 via-indigo-600/20 to-blue-600/10" />
                            <div className="relative px-8 pb-10 -mt-16 text-center">
                                <div className="inline-block relative group">
                                    <div className="w-32 h-32 rounded-3xl border-[6px] border-[#0b1a2a] bg-[#1e293b] shadow-2xl overflow-hidden ring-1 ring-white/10 group-hover:ring-purple-500 transition-all duration-500">
                                        <img 
                                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userData.first_name || userData.username)}&background=random&size=200`} 
                                            alt={userData.username}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                    </div>
                                    <div className={`absolute -bottom-1 -right-1 p-2 rounded-2xl border-4 border-[#0b1a2a] shadow-lg ${userData.is_superuser ? 'bg-purple-500' : 'bg-blue-500'}`}>
                                        <ShieldCheck className="w-4 h-4 text-white" />
                                    </div>
                                </div>
                                <div className="mt-6">
                                    <h2 className="text-2xl font-black text-white tracking-tight leading-tight">{userData.first_name ? `${userData.first_name} ${userData.last_name || ''}` : userData.username}</h2>
                                    <p className="text-sm text-slate-400 font-mono mt-1 opacity-70">@{userData.username}</p>
                                </div>
                                
                                <div className="mt-8 space-y-4 text-left">
                                    <InfoRow icon={Mail} label="Contact Email" value={userData.email} color="purple" />
                                    <InfoRow icon={Calendar} label="Registered" value={new Date(userData.date_joined).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })} color="blue" />
                                    <InfoRow icon={Clock} label="Last Presence" value={userData.last_login ? new Date(userData.last_login).toLocaleTimeString() : 'Never logged in'} color="indigo" />
                                </div>
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="bg-[#0b1a2a]/40 border border-slate-800 rounded-3xl p-6 backdrop-blur-sm">
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Quick Stats</h4>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center bg-[#071229]/60 p-4 rounded-2xl border border-slate-800/50 hover:border-slate-700 transition-colors">
                                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Role Tier</span>
                                    <span className="text-xs font-black uppercase text-purple-400">
                                        {userData.is_superuser ? 'Super Admin' : userData.is_staff ? 'Operator' : 'User'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center bg-[#071229]/60 p-4 rounded-2xl border border-slate-800/50 hover:border-slate-700 transition-colors">
                                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Security Clear</span>
                                    <span className="text-xs font-black uppercase text-emerald-400">Level 4</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column - Detail Panels */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Permissions Grid */}
                        <motion.div variants={itemVariants} className="bg-[#0b1a2a] border border-slate-700/30 rounded-[2.5rem] shadow-xl overflow-hidden shadow-purple-500/5">
                            <div className="px-8 py-6 border-b border-slate-800/60 flex items-center justify-between bg-gradient-to-r from-purple-500/5 to-transparent">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-500/10 rounded-xl shadow-lg shadow-purple-500/5">
                                        <Lock className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <span className="font-black uppercase text-sm tracking-widest text-slate-200">Privilege & Permission Matrix</span>
                                </div>
                                <MoreVertical className="w-5 h-5 text-slate-600 cursor-help" />
                            </div>
                            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <PermissionCard 
                                    label="Administrative Dashboard" 
                                    desc="Full access to the management backend and analytical tools." 
                                    enabled={userData.is_staff} 
                                    icon={ShieldCheck} 
                                />
                                <PermissionCard 
                                    label="Root Access" 
                                    desc="Unrestricted control over system settings, roles, and core services." 
                                    enabled={userData.is_superuser} 
                                    icon={Key} 
                                />
                                <PermissionCard 
                                    label="Service Integration" 
                                    desc="Capabilities to manage webhooks, API keys, and external connectors." 
                                    enabled={userData.is_staff} 
                                    icon={Activity} 
                                />
                                <PermissionCard 
                                    label="Audit Logging" 
                                    desc="Permission to view detailed system activity and security logs." 
                                    enabled={userData.is_superuser} 
                                    icon={ShieldAlert} 
                                />
                            </div>
                        </motion.div>

                        {/* Recent Actions / Meta Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <motion.div variants={itemVariants} className="bg-[#0b1a2a] border border-slate-700/30 rounded-[2rem] p-8 shadow-xl transition-all hover:border-blue-500/20">
                                <div className="flex items-center gap-3 mb-6">
                                    <Clock className="w-5 h-5 text-blue-400" />
                                    <h3 className="font-black uppercase text-xs tracking-widest text-slate-200">Temporal Data</h3>
                                </div>
                                <div className="space-y-5">
                                    <TimelineItem label="Last Login Attempt" value={userData.last_login ? new Date(userData.last_login).toLocaleString() : 'Never'} />
                                    <TimelineItem label="Creation Timestamp" value={new Date(userData.date_joined).toLocaleString()} />
                                    <TimelineItem label="Last Action Source" value="Direct Gateway" />
                                </div>
                            </motion.div>

                            <motion.div variants={itemVariants} className="bg-[#0b1a2a] border border-slate-700/30 rounded-[2rem] p-8 shadow-xl flex flex-col items-center justify-center text-center group transition-all hover:border-slate-700">
                                <div className="w-16 h-16 bg-slate-800/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform group-hover:bg-purple-500/5 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.1)]">
                                    <Settings className="w-8 h-8 text-slate-600 transition-colors group-hover:text-purple-400" />
                                </div>
                                <h3 className="font-black uppercase text-xs tracking-widest text-slate-200 mb-2">Audit History</h3>
                                <p className="text-xs text-slate-500 px-6 leading-relaxed">Operational logs for this operator are currently being indexed for the live dashboard.</p>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

const InfoRow = ({ icon: Icon, label, value, color }) => (
    <div className="flex items-center gap-4 group/row">
        <div className={`p-2.5 rounded-2xl bg-${color}-500/10 text-${color}-400 group-hover/row:scale-110 transition-transform shadow-lg shadow-${color}-500/5 group-hover/row:shadow-${color}-500/10`}>
            <Icon className="w-4 h-4" />
        </div>
        <div className="flex flex-col min-w-0">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 leading-none mb-1 opacity-60 italic">{label}</span>
            <span className="text-xs font-semibold text-slate-200 truncate group-hover/row:text-white transition-colors">{value}</span>
        </div>
    </div>
);

const PermissionCard = ({ label, desc, enabled, icon: Icon }) => (
    <div className={`p-6 rounded-3xl border transition-all duration-300 ${enabled ? 'bg-[#071229]/50 border-slate-800/60 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/5' : 'bg-red-500/5 border-red-500/10 opacity-50 grayscale-[0.5]'}`}>
        <div className="flex items-center justify-between mb-4">
            <Icon className={`w-5 h-5 ${enabled ? 'text-purple-400' : 'text-red-400'} transition-transform group-hover:scale-110`} />
            {enabled ? (
                <div className="p-1 px-2 rounded-full bg-emerald-500/10 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span className="text-[8px] font-black uppercase text-emerald-400 tracking-tighter">Active</span>
                </div>
            ) : (
                <div className="p-1 px-2 rounded-full bg-red-500/10 flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 text-red-500" />
                    <span className="text-[8px] font-black uppercase text-red-500 tracking-tighter">Locked</span>
                </div>
            )}
        </div>
        <h4 className={`text-sm font-black uppercase tracking-tight mb-2 transition-colors ${enabled ? 'text-slate-100 group-hover:text-purple-300' : 'text-slate-500'}`}>{label}</h4>
        <p className="text-[10px] leading-relaxed text-slate-500 font-medium">{desc}</p>
    </div>
);

const TimelineItem = ({ label, value }) => (
    <div className="flex flex-col group/timeline">
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 italic mb-1 group-hover/timeline:text-blue-400 transition-colors">{label}</span>
        <span className="text-xs font-bold text-slate-300 group-hover/timeline:text-white transition-colors">{value}</span>
    </div>
);

export default UserView;
