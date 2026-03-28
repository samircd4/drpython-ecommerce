import { useState, useEffect } from "react";
import { 
    Activity as ActivityIcon, 
    Clock, 
    User, 
    Filter, 
    RefreshCcw,
    ShieldCheck,
    Lock,
    Eye,
    ChevronRight,
    Search
} from "lucide-react";
import { motion } from "framer-motion";
import api from "../api/axiosConfig";
import Breadcrumb from "../components/Layout/Breadcrumb";
import toast from "react-hot-toast";

const Activity = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchActivities = async () => {
        setLoading(true);
        try {
            // We'll use the users list sorted by last_login as a proxy for activity
            // Since a dedicated audit log table might not exist yet.
            const response = await api.get('/users/');
            const users = Array.isArray(response.data) ? response.data : (response.data.results || []);
            
            // Filter users with last_login and sort them
            const sortedActivities = users
                .filter(u => u.last_login)
                .sort((a, b) => new Date(b.last_login) - new Date(a.last_login))
                .map(u => ({
                    id: u.id,
                    username: u.username,
                    email: u.email,
                    timestamp: u.last_login,
                    type: "SYSTEM_ACCESS",
                    description: "Successful terminal authentication.",
                    status: "AUTHORIZED",
                    ip: "127.0.0.1" // Mock IP
                }));
                
            setActivities(sortedActivities);
        } catch (err) {
            console.error("Failed to fetch activity:", err);
            toast.error("Failed to synchronize audit trail.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActivities();
    }, []);

    const filteredActivities = activities.filter(act => 
        act.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        act.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-4 sm:p-8 min-h-screen bg-transparent">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 sm:px-0">
                    <div>
                        <Breadcrumb 
                            title="System Audit Pool" 
                            paths={[
                                { label: "Home", path: "/" },
                                { label: "Users", path: "/users" },
                                { label: "Audit Trail", path: "/activity" }
                            ]} 
                        />
                        <h1 className="text-2xl font-black text-white uppercase tracking-tight mt-1 flex items-center gap-3">
                            <ActivityIcon className="w-7 h-7 text-emerald-500" />
                            Activity Pulse
                        </h1>
                    </div>
                    <button 
                        onClick={fetchActivities}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-800/40 hover:bg-slate-800 text-slate-300 rounded-xl transition-all border border-slate-700/50 hover:border-slate-600 font-bold text-[10px] uppercase tracking-widest active:scale-[0.98]"
                    >
                        <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh Nodes
                    </button>
                </div>

                {/* Filter & Subheader */}
                <div className="flex flex-col sm:flex-row items-center gap-4 px-4 sm:px-0">
                    <div className="relative flex-1 w-full group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                        <input 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Filter audit trail by identity..."
                            className="w-full bg-[#0b1a2a] border border-slate-700/40 rounded-2xl pl-14 pr-5 py-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 transition-all font-medium placeholder:text-slate-700"
                        />
                    </div>
                </div>

                {/* Audit Grid/List */}
                <div className="space-y-4 px-4 sm:px-0">
                    {loading && activities.length === 0 ? (
                        <div className="py-20 flex flex-col items-center gap-4 text-slate-700">
                            <div className="w-12 h-12 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Intercepting System Events...</p>
                        </div>
                    ) : filteredActivities.length > 0 ? (
                        filteredActivities.map((act, index) => (
                            <motion.div 
                                key={act.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.03 }}
                                className="group bg-[#0b1a2a] border border-slate-700/40 hover:border-emerald-500/30 rounded-3xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all shadow-xl hover:shadow-emerald-500/5 overflow-hidden relative"
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none group-hover:opacity-[0.05] transition-opacity">
                                    <ActivityIcon className="w-24 h-24" />
                                </div>

                                <div className="flex items-center gap-5 flex-1 min-w-0">
                                    <div className="p-3 bg-emerald-500/10 rounded-2xl group-hover:scale-110 transition-transform">
                                        <Lock className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="text-sm font-black text-slate-200 uppercase tracking-tight truncate">{act.username}</span>
                                            <span className="text-[9px] font-black text-slate-500 bg-slate-800/60 px-2 py-0.5 rounded-md uppercase tracking-tighter">ID: {act.id}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                            <p className="text-xs text-slate-400 font-medium truncate">{act.description}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-8 items-center">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest leading-none mb-1">Status Code</span>
                                        <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1.5">
                                            <ShieldCheck className="w-3 h-3" />
                                            {act.status}
                                        </span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest leading-none mb-1">Origin Node</span>
                                        <span className="text-[10px] font-mono font-bold text-slate-400">{act.ip}</span>
                                    </div>
                                    <div className="flex flex-col col-span-2 md:col-span-1 border-t md:border-t-0 border-slate-800 pt-4 md:pt-0">
                                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest leading-none mb-1">Temporal Stamp</span>
                                        <div className="flex items-center gap-2 text-[10px] text-slate-200 font-bold">
                                            <Clock className="w-3 h-3 text-slate-500" />
                                            {new Date(act.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="py-20 bg-[#0b1a2a]/60 border border-dashed border-slate-700/40 rounded-3xl flex flex-col items-center">
                            <Filter className="w-12 h-12 text-slate-700 mb-4" />
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em]">No events match filter criteria</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Activity;
