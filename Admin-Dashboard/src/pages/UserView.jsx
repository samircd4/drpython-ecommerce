import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
    User as UserIcon, 
    Mail, 
    Calendar, 
    ShieldCheck, 
    ShieldAlert,
    ArrowLeft,
    Clock,
    Lock,
    Key,
    Activity
} from "lucide-react";
import { motion } from "framer-motion";
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
                setError("Failed to load user details.");
                toast.error("User not found.");
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [id]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#071229]">
            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        </div>
    );

    if (error || !userData) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#071229] text-slate-400">
            <p className="mb-4">{error || "User not found."}</p>
            <button onClick={() => navigate('/all-users')} className="px-4 py-2 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors">
                Back to Users
            </button>
        </div>
    );

    return (
        <div className="p-4 sm:p-6 min-h-screen bg-transparent">
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <Breadcrumb title="User Details" paths={["Home", "Users", userData.username]} />
                    <button 
                        onClick={() => navigate('/all-users')}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-800 text-slate-300 rounded-xl transition-all border border-slate-700/50 cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Sidebar - Identity */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-1 space-y-6"
                    >
                        <div className="bg-[#0b1a2a] border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl">
                            <div className="h-24 bg-gradient-to-r from-purple-600/20 to-blue-600/20" />
                            <div className="px-6 pb-6 -mt-12 text-center">
                                <div className="relative inline-block mx-auto">
                                    <div className="w-24 h-24 rounded-2xl border-4 border-[#0b1a2a] bg-[#1e293b] flex items-center justify-center shadow-2xl overflow-hidden">
                                        <img 
                                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userData.first_name || userData.username)}&background=random&size=128`} 
                                            alt={userData.username}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-[#0b1a2a] ${userData.is_active ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                </div>
                                <div className="mt-4">
                                    <h2 className="text-xl font-bold text-slate-100">{userData.first_name ? `${userData.first_name} ${userData.last_name || ''}` : userData.username}</h2>
                                    <p className="text-sm text-slate-400 font-mono">@{userData.username}</p>
                                </div>
                                
                                <div className="mt-6 flex flex-wrap justify-center gap-2">
                                    {userData.is_superuser && (
                                        <span className="px-2 py-1 bg-purple-500/10 text-purple-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-purple-500/20">Superuser</span>
                                    )}
                                    {userData.is_staff && (
                                        <span className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-500/20">Staff</span>
                                    )}
                                    {!userData.is_staff && (
                                        <span className="px-2 py-1 bg-slate-700/50 text-slate-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-600/20">Customer</span>
                                    )}
                                </div>

                                <button 
                                    onClick={() => navigate(`/users/edit/${userData.id}`)}
                                    className="w-full mt-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
                                >
                                    Edit Permissions
                                </button>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-[#0b1a2a]/50 border border-slate-700/50 rounded-2xl p-6 space-y-4">
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Access Log</h4>
                            <div className="flex items-center gap-3 text-slate-300">
                                <Clock className="w-4 h-4 text-blue-400" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-500 font-bold uppercase">Last Login</span>
                                    <span className="text-xs">{userData.last_login ? new Date(userData.last_login).toLocaleString() : 'Never'}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-slate-300">
                                <Calendar className="w-4 h-4 text-emerald-400" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-500 font-bold uppercase">Member Since</span>
                                    <span className="text-xs">{new Date(userData.date_joined).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Main Content Area */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-2 space-y-6"
                    >
                        <div className="bg-[#0b1a2a] border border-slate-700/50 rounded-2xl overflow-hidden shadow-lg">
                            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/10">
                                <h3 className="font-bold text-slate-200 uppercase text-xs tracking-widest">Account Information</h3>
                                <ShieldCheck className="w-4 h-4 text-blue-400" />
                            </div>
                            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">User Identification</p>
                                        <div className="space-y-2">
                                            <p className="text-sm flex justify-between"><span className="text-slate-400">Database ID</span> <span className="text-slate-100 font-mono">#{userData.id}</span></p>
                                            <p className="text-sm flex justify-between"><span className="text-slate-400">Username</span> <span className="text-slate-100">@{userData.username}</span></p>
                                            <p className="text-sm flex justify-between"><span className="text-slate-400">Status</span> <span className={userData.is_active ? 'text-emerald-400' : 'text-red-400'}>{userData.is_active ? 'Active' : 'Disabled'}</span></p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Contact Details</p>
                                        <div className="space-y-2">
                                            <p className="text-sm flex justify-between"><span className="text-slate-400">Primary Email</span> <span className="text-blue-400 underline decoration-blue-400/30 font-medium">{userData.email}</span></p>
                                            <p className="text-sm flex justify-between"><span className="text-slate-400">Full Name</span> <span className="text-slate-100">{userData.first_name ? `${userData.first_name} ${userData.last_name || ''}` : '—'}</span></p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6 bg-[#071229] p-6 rounded-2xl border border-slate-700/30">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                                        <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Permissions Matrix</h4>
                                    </div>
                                    <div className="space-y-4">
                                        <PermissionItem label="Can access admin panel" enabled={userData.is_staff} />
                                        <PermissionItem label="Full administrative control" enabled={userData.is_superuser} />
                                        <PermissionItem label="Account active and enabled" enabled={userData.is_active} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity Mock */}
                        <div className="bg-[#0b1a2a] border border-slate-700/50 rounded-2xl p-6 shadow-lg">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-slate-200 uppercase text-xs tracking-widest">Recent Activity Log</h3>
                                <Activity className="w-4 h-4 text-slate-500" />
                            </div>
                            <div className="space-y-4">
                                <div className="text-center py-12 opacity-20">
                                    <Lock className="w-12 h-12 mx-auto mb-3" />
                                    <p className="text-sm font-medium">Activity tracking coming soon.</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

const PermissionItem = ({ label, enabled }) => (
    <div className="flex items-center justify-between gap-4">
        <span className="text-xs text-slate-400 font-medium">{label}</span>
        <div className={`p-1 rounded-full ${enabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
            <ShieldCheck className={`w-3.5 h-3.5 ${enabled ? 'block' : 'hidden'}`} />
            <ShieldAlert className={`w-3.5 h-3.5 ${!enabled ? 'block' : 'hidden'}`} />
        </div>
    </div>
);

export default UserView;
