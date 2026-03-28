import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
    User, 
    Mail, 
    Phone, 
    Calendar, 
    ShieldCheck, 
    ShieldAlert,
    ArrowLeft,
    ExternalLink,
    MapPin,
    Package,
    ShoppingBag,
    CreditCard
} from "lucide-react";
import { motion } from "framer-motion";
import api from "../api/axiosConfig";
import Breadcrumb from "../components/Layout/Breadcrumb";

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
            } finally {
                setLoading(false);
            }
        };
        fetchCustomer();
    }, [id]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#071229]">
            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        </div>
    );

    if (error || !customer) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#071229] text-slate-400">
            <p className="mb-4">{error || "Customer not found."}</p>
            <button onClick={() => navigate('/customers')} className="px-4 py-2 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors">
                Back to Customers
            </button>
        </div>
    );

    return (
        <div className="p-4 sm:p-6 min-h-screen bg-transparent">
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <Breadcrumb title="Customer Details" paths={["Home", "Customers", customer.name || customer.username]} />
                    <button 
                        onClick={() => navigate('/customers')}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-800 text-slate-300 rounded-xl transition-all border border-slate-700/50 cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Sidebar - Profile Card */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-1 space-y-6"
                    >
                        <div className="bg-[#0b1a2a] border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl">
                            <div className="h-24 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />
                            <div className="px-6 pb-6 -mt-12">
                                <div className="relative inline-block">
                                    <img 
                                        src={customer.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(customer.name || 'U')}&background=random&size=128`} 
                                        alt={customer.name}
                                        className="w-24 h-24 rounded-2xl border-4 border-[#0b1a2a] bg-[#0b1a2a] object-cover shadow-2xl"
                                    />
                                    <div className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-[#0b1a2a] ${customer.is_email_verified ? 'bg-emerald-500' : 'bg-yellow-500'}`} title={customer.is_email_verified ? 'Verified' : 'Pending Verification'} />
                                </div>
                                <div className="mt-4">
                                    <h2 className="text-xl font-bold text-slate-100">{customer.name || customer.username}</h2>
                                    <p className="text-sm text-slate-400 font-mono">ID: C-{customer.id}</p>
                                </div>
                                
                                <div className="mt-6 space-y-3">
                                    <div className="flex items-center gap-3 text-slate-300">
                                        <div className="p-2 bg-blue-500/10 rounded-lg"><Mail className="w-4 h-4 text-blue-400" /></div>
                                        <span className="text-sm truncate">{customer.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-300">
                                        <div className="p-2 bg-purple-500/10 rounded-lg"><Phone className="w-4 h-4 text-purple-400" /></div>
                                        <span className="text-sm">{customer.phone_number || 'No Phone'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-300">
                                        <div className="p-2 bg-amber-500/10 rounded-lg"><Calendar className="w-4 h-4 text-amber-400" /></div>
                                        <span className="text-sm">Joined {new Date(customer.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={() => navigate(`/customers/edit/${customer.id}`)}
                                    className="w-full mt-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
                                >
                                    Edit Profile
                                </button>
                            </div>
                        </div>

                        {/* Status Stats */}
                        <div className="bg-[#0b1a2a]/50 border border-slate-700/50 rounded-2xl p-6 grid grid-cols-2 gap-4">
                            <div className="text-center">
                                <p className="text-xs text-slate-500 uppercase font-black tracking-widest mb-1">Type</p>
                                <span className={`text-xs px-2 py-1 rounded-full font-bold bg-blue-500/10 text-blue-400 capitalize`}>
                                    {customer.customer_type || 'Retail'}
                                </span>
                            </div>
                            <div className="text-center">
                                <p className="text-xs text-slate-500 uppercase font-black tracking-widest mb-1">Status</p>
                                <span className={`text-xs px-2 py-1 rounded-full font-bold ${customer.is_email_verified ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                                    {customer.is_email_verified ? 'Verified' : 'Pending'}
                                </span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Main Content */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-2 space-y-6"
                    >
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { icon: ShoppingBag, label: 'Total Orders', value: customer.total_orders ?? 0, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                                { icon: CreditCard, label: 'Total Spent', value: `৳ ${(Number(customer.total_spent) || 0).toLocaleString()}`, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                                { icon: Package, label: 'Wishlist', value: 'Coming soon', color: 'text-purple-400', bg: 'bg-purple-400/10' }
                            ].map((stat, i) => (
                                <div key={i} className="bg-[#0b1a2a] border border-slate-700/30 p-4 rounded-2xl">
                                    <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
                                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                    </div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                                    <p className="text-lg font-bold text-slate-100 mt-0.5">{stat.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Additional Info / Activity */}
                        <div className="bg-[#0b1a2a] border border-slate-700/50 rounded-2xl overflow-hidden shadow-lg">
                            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                                <h3 className="font-bold text-slate-200 uppercase text-sm tracking-wide">Account Details</h3>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-black text-slate-500 uppercase flex items-center gap-2">
                                            <ShieldCheck className="w-3.5 h-3.5" />
                                            Administrative Info
                                        </h4>
                                        <div className="space-y-3">
                                            <DetailItem label="Username" value={customer.username} />
                                            <DetailItem label="First Name" value={customer.first_name || '—'} />
                                            <DetailItem label="Last Name" value={customer.last_name || '—'} />
                                            <div className="pt-2">
                                                <h5 className="text-[10px] font-black text-slate-600 uppercase mb-2">Address Book</h5>
                                                {customer.addresses?.length > 0 ? (
                                                    <div className="space-y-2">
                                                        {customer.addresses.map((addr) => (
                                                            <div key={addr.id} className="p-2 bg-slate-800/30 rounded-lg text-xs">
                                                                <div className="flex justify-between font-bold text-slate-300">
                                                                    <span>{addr.address_type}</span>
                                                                    {addr.is_default && <span className="text-[10px] text-blue-400 font-bold uppercase">Default</span>}
                                                                </div>
                                                                <p className="text-slate-400 mt-1">{addr.address}, {addr.sub_district}, {addr.district}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-slate-500">No addresses saved.</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-black text-slate-500 uppercase flex items-center gap-2">
                                            <Activity className="w-3.5 h-3.5" />
                                            Activity Stats
                                        </h4>
                                        <div className="space-y-3">
                                            <DetailItem label="Wholesale Access" value={customer.is_wholesaler ? 'Yes' : 'No'} highlight={customer.is_wholesaler} />
                                            <DetailItem label="Staff Access" value={customer.is_staff ? 'Yes' : 'No'} highlight={customer.is_staff} />
                                            <DetailItem label="Last Activity" value="Coming soon" />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-800">
                                    <h4 className="text-xs font-black text-slate-500 uppercase flex items-center gap-2 mb-4">
                                        <MapPin className="w-3.5 h-3.5" />
                                        Recent Orders
                                    </h4>
                                    {customer.recent_orders?.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-slate-800">
                                                <thead>
                                                    <tr>
                                                        <th className="px-4 py-2 text-left text-[10px] font-black text-slate-600 uppercase">Order ID</th>
                                                        <th className="px-4 py-2 text-left text-[10px] font-black text-slate-600 uppercase">Date</th>
                                                        <th className="px-4 py-2 text-left text-[10px] font-black text-slate-600 uppercase">Status</th>
                                                        <th className="px-4 py-2 text-left text-[10px] font-black text-slate-600 uppercase">Amount</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-800/50">
                                                    {customer.recent_orders.map((order) => (
                                                        <tr key={order.id} className="hover:bg-slate-800/30 transition-colors">
                                                            <td className="px-4 py-3 text-xs font-mono text-slate-300">#{order.id}</td>
                                                            <td className="px-4 py-3 text-xs text-slate-400">{new Date(order.created_at).toLocaleDateString()}</td>
                                                            <td className="px-4 py-3 text-xs">
                                                                <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">{order.status}</span>
                                                            </td>
                                                            <td className="px-4 py-3 text-xs font-bold text-slate-300">৳{order.total_amount}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="text-center py-10 opacity-30">
                                            <ShoppingBag className="w-10 h-10 mx-auto mb-2" />
                                            <p className="text-sm font-medium">No orders found yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

const DetailItem = ({ label, value, highlight = false, isStatus = false }) => (
    <div className="flex justify-between items-center text-sm">
        <span className="text-slate-500 font-medium">{label}</span>
        <span className={`font-semibold ${highlight ? 'text-blue-400' : isStatus ? 'text-blue-400' : 'text-slate-200'}`}>
            {value}
        </span>
    </div>
);

const Activity = ({ className }) => <ShieldAlert className={className} />;

export default CustomerView;
