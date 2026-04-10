import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
    User, 
    Mail, 
    Phone, 
    Calendar, 
    ShieldCheck, 
    ArrowLeft,
    MapPin,
    Package,
    ShoppingBag,
    CreditCard,
    Star,
    History,
    Settings,
    UserCheck,
    AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axiosConfig";
import Breadcrumb from "../components/Layout/Breadcrumb";
import toast from "react-hot-toast";

const CustomerView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCustomer = async () => {
            try {
                const response = await api.get(`/customers/${id}/`);
                setCustomer(response.data);
            } catch (err) {
                console.error("Failed to fetch customer:", err);
                setError("Failed to load customer details.");
                toast.error("Customer profile not found.");
            } finally {
                setLoading(false);
            }
        };
        fetchCustomer();
    }, [id]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#071229]">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-500/50" />
                </div>
            </div>
        </div>
    );

    if (error || !customer) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#071229] text-white p-6">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-[#0b1a2a] p-8 rounded-3xl border border-slate-800 text-center max-w-md w-full shadow-2xl"
            >
                <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-10 h-10 text-red-400" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Notice</h2>
                <p className="text-slate-400 mb-8">{error || "The profile you are looking for does not exist or has been removed."}</p>
                <button 
                    onClick={() => navigate('/customers')} 
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl transition-all font-bold border border-slate-700 active:scale-[0.98]"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Directory
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
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <Breadcrumb 
                            title="Profile Viewer" 
                            paths={[
                                { label: "Home", path: "/" },
                                { label: "Customers", path: "/customers" },
                                { label: customer.name || customer.username, path: `/customers/view/${customer.id}` }
                            ]} 
                        />
                        <h1 className="text-2xl font-black text-white mt-1 uppercase tracking-tight">Customer Intelligence</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => navigate('/customers')}
                            className="group flex items-center gap-2 px-5 py-2.5 bg-slate-800/40 hover:bg-slate-800 text-slate-300 rounded-2xl transition-all border border-slate-700/50 hover:border-slate-600 font-bold text-sm"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Directory
                        </button>
                        <button 
                            onClick={() => navigate(`/customers/edit/${customer.id}`)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl transition-all shadow-lg shadow-blue-600/20 font-bold text-sm active:scale-[0.98]"
                        >
                            <Settings className="w-4 h-4" />
                            Modify Profile
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column - Profile Summary */}
                    <div className="lg:col-span-4 space-y-6">
                        <motion.div variants={itemVariants} className="bg-[#0b1a2a] border border-slate-700/40 rounded-[2.5rem] overflow-hidden shadow-2xl relative group">
                            <div className="h-32 bg-gradient-to-br from-blue-600/30 via-purple-600/20 to-emerald-600/10" />
                            <div className="relative px-8 pb-10 -mt-16 text-center">
                                <div className="inline-block relative">
                                    <div className="w-32 h-32 rounded-3xl border-[6px] border-[#0b1a2a] bg-[#1e293b] shadow-2xl overflow-hidden ring-1 ring-white/10">
                                        <img 
                                            src={customer.avatar || customer.social_avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(customer.name || 'U')}&background=random&size=200`} 
                                            alt={customer.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    </div>
                                    <div className={`absolute -bottom-1 -right-1 p-2 rounded-2xl border-4 border-[#0b1a2a] shadow-lg ${customer.is_email_verified ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                                        <UserCheck className="w-4 h-4 text-white" />
                                    </div>
                                </div>
                                <div className="mt-6 flex flex-col items-center">
                                    <h2 className="text-2xl font-black text-white tracking-tight">{customer.name || customer.username}</h2>
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full mt-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                                        <span className="text-[10px] font-black uppercase text-blue-300 tracking-widest">{customer.customer_type || 'Retail Member'}</span>
                                    </div>
                                </div>
                                
                                <div className="mt-8 space-y-4 text-left">
                                    <DetailRow icon={Mail} label="Email Address" value={customer.email} color="blue" />
                                    <DetailRow icon={Phone} label="Mobile" value={customer.phone_number || 'Not provided'} color="purple" />
                                    <DetailRow icon={Calendar} label="Member Since" value={new Date(customer.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} color="amber" />
                                </div>
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="bg-[#0b1a2a]/40 border border-slate-800 rounded-3xl p-6 relative overflow-hidden">
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Account Access</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <StatusTile label="Staff" active={customer.is_staff} />
                                <StatusTile label="Wholesale" active={customer.is_wholesaler} />
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column - Data & Activity */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Financial Analytics */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <StatCard 
                                icon={ShoppingBag} 
                                label="Total Orders" 
                                value={customer.total_orders ?? 0} 
                                trend="+12% this month" 
                                color="blue" 
                            />
                            <StatCard 
                                icon={CreditCard} 
                                label="Revenue Contribution" 
                                value={`৳${(Number(customer.total_spent) || 0).toLocaleString()}`} 
                                trend="High Value Tier" 
                                color="emerald" 
                            />
                            <StatCard 
                                icon={Star} 
                                label="Loyalty Index" 
                                value="Tier 2" 
                                trend="Premium Customer" 
                                color="amber" 
                            />
                        </div>

                        {/* Recent History & Addresses */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
                            {/* Orders */}
                            <motion.div variants={itemVariants} className="bg-[#0b1a2a] border border-slate-700/30 rounded-[2rem] shadow-xl overflow-hidden min-h-[400px]">
                                <div className="px-6 py-5 border-b border-slate-800/60 flex items-center justify-between">
                                    <div className="flex items-center gap-3 font-black uppercase text-xs tracking-widest text-slate-200">
                                        <History className="w-4 h-4 text-blue-400" />
                                        Order History
                                    </div>
                                    <span className="text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-400 font-bold uppercase tracking-tighter">Recent 5</span>
                                </div>
                                <div className="p-4">
                                    {customer.recent_orders?.length > 0 ? (
                                        <div className="space-y-3">
                                            {customer.recent_orders.map((order) => (
                                                <div 
                                                    key={order.id} 
                                                    onClick={() => navigate(`/orders?search=${order.id}`)}
                                                    className="group p-4 bg-slate-800/10 hover:bg-slate-800/40 border border-slate-800/50 rounded-2xl transition-all cursor-pointer flex flex-col"
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="text-xs font-mono font-bold text-blue-400">#{order.id}</span>
                                                        <span className={`text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full ${order.status === 'Completed' || order.status === 'Delivered' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>{order.status}</span>
                                                    </div>
                                                    <div className="flex justify-between items-end">
                                                        <span className="text-[10px] text-slate-500 font-bold">{new Date(order.created_at).toLocaleDateString()}</span>
                                                        <span className="text-sm font-black text-slate-200 group-hover:text-white transition-colors">৳{order.total_amount || order.grand_total}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-20 text-slate-600 opacity-30">
                                            <Package className="w-16 h-16 mb-4 stroke-1" />
                                            <p className="text-sm font-bold uppercase tracking-widest">No transaction history</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>

                            {/* Addresses */}
                            <motion.div variants={itemVariants} className="bg-[#0b1a2a] border border-slate-700/30 rounded-[2rem] shadow-xl overflow-hidden min-h-[400px]">
                                <div className="px-6 py-5 border-b border-slate-800/60 flex items-center justify-between">
                                    <div className="flex items-center gap-3 font-black uppercase text-xs tracking-widest text-slate-200">
                                        <MapPin className="w-4 h-4 text-emerald-400" />
                                        Registered Addresses
                                    </div>
                                </div>
                                <div className="p-6">
                                    {customer.addresses?.length > 0 ? (
                                        <div className="space-y-4">
                                            {customer.addresses.map((addr) => (
                                                <div key={addr.id} className="relative p-5 bg-gradient-to-br from-slate-800/20 to-transparent border border-slate-800/50 rounded-[1.5rem] group hover:border-emerald-500/30 transition-all">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 bg-emerald-500/5 px-3 py-1 rounded-full">{addr.address_type}</span>
                                                        {addr.is_default && (
                                                            <div className="flex items-center gap-1.5 text-blue-400">
                                                                <Star className="w-3 h-3 fill-current" />
                                                                <span className="text-[9px] font-black uppercase tracking-tighter">Primary Address</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <h5 className="text-sm font-bold text-slate-200 mb-1">{addr.full_name}</h5>
                                                    <p className="text-xs text-slate-400 leading-relaxed max-w-[90%]">{addr.address}, {addr.sub_district}, {addr.district}, {addr.division}</p>
                                                    <div className="mt-4 pt-4 border-t border-slate-800/50 flex items-center gap-2">
                                                        <Phone className="w-3 h-3 text-slate-500" />
                                                        <span className="text-xs text-slate-300 font-mono font-medium">{addr.phone}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-20 text-slate-600 opacity-30">
                                            <MapPin className="w-16 h-16 mb-4 stroke-1" />
                                            <p className="text-sm font-bold uppercase tracking-widest text-center">No shipping address<br/>configured</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

const DetailRow = ({ icon: Icon, label, value, color }) => (
    <div className="flex items-center gap-4 group/row">
        <div className={`p-2.5 rounded-2xl bg-${color}-500/10 text-${color}-400 group-hover/row:scale-110 transition-transform shadow-lg shadow-${color}-500/5`}>
            <Icon className="w-4 h-4" />
        </div>
        <div className="flex flex-col min-w-0">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 leading-none mb-1">{label}</span>
            <span className="text-xs font-semibold text-slate-200 truncate">{value}</span>
        </div>
    </div>
);

const StatusTile = ({ label, active }) => (
    <div className={`flex flex-col items-center p-4 rounded-2xl border ${active ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' : 'bg-slate-800/20 border-slate-800 text-slate-500'}`}>
        <span className="text-[10px] font-black uppercase tracking-widest mb-1">{label}</span>
        {active ? (
            <ShieldCheck className="w-4 h-4" />
        ) : (
            <AlertCircle className="w-4 h-4 opacity-30" />
        )}
    </div>
);

const StatCard = ({ icon: Icon, label, value, trend, color }) => (
    <motion.div 
        whileHover={{ y: -5 }}
        className="bg-[#0b1a2a] border border-slate-700/30 p-6 rounded-[2rem] shadow-xl relative overflow-hidden group"
    >
        <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-500/5 blur-3xl -mr-12 -mt-12 group-hover:bg-${color}-500/10 transition-colors`} />
        <div className={`w-12 h-12 rounded-2xl bg-${color}-400/10 flex items-center justify-center mb-6`}>
            <Icon className={`w-6 h-6 text-${color}-400`} />
        </div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{label}</p>
        <div className="flex items-baseline justify-between mt-1">
            <h3 className="text-xl font-black text-white">{value}</h3>
            <span className={`text-[9px] font-bold ${color === 'emerald' ? 'text-emerald-400' : 'text-slate-500 uppercase tracking-tighter'}`}>{trend}</span>
        </div>
    </motion.div>
);

export default CustomerView;
