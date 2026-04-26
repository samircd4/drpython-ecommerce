import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
    User, 
    Mail, 
    Phone, 
    Save,
    X,
    ShieldCheck,
    Briefcase,
    BadgeCheck,
    Globe,
    ChevronDown
} from "lucide-react";
import { motion } from "framer-motion";
import api from "../api/axiosConfig";
import Breadcrumb from "../components/Layout/Breadcrumb";
import toast from "react-hot-toast";

const CustomerEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        name: "",
        email: "",
        phone_number: "",
        customer_type: "retail",
        is_email_verified: false,
    });

    useEffect(() => {
        const fetchCustomer = async () => {
            try {
                const response = await api.get(`/customers/${id}/`);
                const { first_name, last_name, name, email, phone_number, customer_type, is_email_verified } = response.data;
                setFormData({
                    first_name: first_name || "",
                    last_name: last_name || "",
                    name: name || "",
                    email: email || "",
                    phone_number: phone_number || "",
                    customer_type: customer_type || "retail",
                    is_email_verified: is_email_verified || false,
                });
            } catch (err) {
                console.error("Failed to fetch customer:", err);
                toast.error("Failed to load customer data.");
                navigate('/customers');
            } finally {
                setLoading(false);
            }
        };
        fetchCustomer();
    }, [id, navigate]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.patch(`/customers/${id}/`, formData);
            toast.success("Customer profile synchronized!");
            navigate(`/customers/view/${id}`);
        } catch (err) {
            console.error("Failed to update customer:", err);
            toast.error(err.response?.data?.detail || "Update failed. Please check credentials.");
        } finally {
            setSaving(false);
        }
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

    return (
        <div className="p-4 sm:p-8 min-h-screen bg-transparent">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex items-center justify-between px-4 sm:px-0">
                    <div>
                        <Breadcrumb 
                            title="Profile Modification" 
                            paths={[
                                { label: "Home", path: "/" },
                                { label: "Customers", path: "/customers" },
                                { label: "Intelligence", path: `/customers/view/${id}` },
                                { label: "Edit", path: `/customers/edit/${id}` }
                            ]} 
                        />
                        <h1 className="text-2xl font-black text-white uppercase tracking-tight mt-1">Update Identity</h1>
                    </div>
                    <button 
                        onClick={() => navigate(`/customers/view/${id}`)}
                        className="group flex items-center gap-2 px-5 py-2.5 bg-slate-800/40 hover:bg-slate-800 text-slate-300 rounded-2xl transition-all border border-slate-700/50 hover:border-slate-600 font-bold text-sm"
                    >
                        <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                        Abort Changes
                    </button>
                </div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#0b1a2a] border border-slate-700/40 rounded-[2.5rem] shadow-2xl overflow-hidden relative"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                        <Save className="w-48 h-48" />
                    </div>

                    <div className="p-8 border-b border-slate-800 bg-gradient-to-r from-blue-600/10 via-transparent to-transparent">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-600/20 rounded-2xl">
                                <ShieldCheck className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-100 italic">Advanced Identity Control</h2>
                                <p className="text-sm text-slate-500 font-medium">Synchronizing customer data with master records.</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 sm:p-12 space-y-10">
                        {/* Basic Information */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="h-4 w-1 bg-blue-500 rounded-full" />
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Core Bio-Data</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Legal First Name</label>
                                    <input 
                                        type="text"
                                        name="first_name"
                                        value={formData.first_name}
                                        onChange={handleChange}
                                        className="w-full bg-[#071229] border border-slate-700/60 rounded-2xl px-5 py-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/50 transition-all font-medium border-l-4 border-l-transparent focus:border-l-blue-500 placeholder:text-slate-700"
                                        placeholder="John"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Legal Last Name</label>
                                    <input 
                                        type="text"
                                        name="last_name"
                                        value={formData.last_name}
                                        onChange={handleChange}
                                        className="w-full bg-[#071229] border border-slate-700/60 rounded-2xl px-5 py-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/50 transition-all font-medium border-l-4 border-l-transparent focus:border-l-blue-500 placeholder:text-slate-700"
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 text-left">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Public Display Identity</label>
                                <div className="relative group">
                                    <User className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                                    <input 
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full bg-[#071229] border border-slate-700/60 rounded-2xl pl-14 pr-5 py-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/50 transition-all font-bold tracking-tight border-l-4 border-l-transparent focus:border-l-blue-500"
                                        placeholder="John Doe Intelligence"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Contact Meta */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="h-4 w-1 bg-emerald-500 rounded-full" />
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contact Infrastructure</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Encrypted Email Address</label>
                                    <div className="relative group">
                                        <Mail className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                                        <input 
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full bg-[#071229] border border-slate-700/60 rounded-2xl pl-14 pr-5 py-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600/50 transition-all font-medium border-l-4 border-l-transparent focus:border-l-emerald-500"
                                            placeholder="john@sarker.shop"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2 text-left">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Voice Communication Node</label>
                                    <div className="relative group">
                                        <Phone className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                                        <input 
                                            type="text"
                                            name="phone_number"
                                            value={formData.phone_number}
                                            onChange={handleChange}
                                            className="w-full bg-[#071229] border border-slate-700/60 rounded-2xl pl-14 pr-5 py-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600/50 transition-all font-medium border-l-4 border-l-transparent focus:border-l-emerald-500"
                                            placeholder="017-XXXX-XXXX"
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Status & Classification */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="h-4 w-1 bg-purple-500 rounded-full" />
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Classification & Access</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Trade Classification</label>
                                    <div className="relative group">
                                        <Briefcase className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-focus-within:text-purple-400 transition-colors" />
                                        <select 
                                            name="customer_type"
                                            value={formData.customer_type}
                                            onChange={handleChange}
                                            className="w-full bg-[#071229] border border-slate-700/60 rounded-2xl pl-14 pr-12 py-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600/50 transition-all font-bold appearance-none cursor-pointer border-l-4 border-l-transparent focus:border-l-purple-500"
                                        >
                                            <option value="retail">Retail Protocol</option>
                                            <option value="wholesale">Wholesale Protocol</option>
                                        </select>
                                        <ChevronDown className="w-5 h-5 absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <label className="w-full flex items-center gap-5 p-5 bg-[#071229] border border-slate-700/50 rounded-2xl cursor-pointer hover:border-purple-500/50 transition-all group/toggle">
                                        <div className="relative">
                                            <input 
                                                type="checkbox"
                                                name="is_email_verified"
                                                checked={formData.is_email_verified}
                                                onChange={handleChange}
                                                className="w-6 h-6 appearance-none border-2 border-slate-600 rounded-lg checked:bg-purple-600 checked:border-purple-600 transition-all cursor-pointer"
                                            />
                                            {formData.is_email_verified && (
                                                <BadgeCheck className="w-4 h-4 text-white absolute top-1 left-1 pointer-events-none" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-200 transition-colors group-hover/toggle:text-purple-300">Identity Validated</p>
                                            <p className="text-[10px] text-slate-500 font-medium">Manually authorize email verification status.</p>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </section>

                        {/* Action Control */}
                        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-end gap-4">
                            <button 
                                type="button"
                                onClick={() => navigate(`/customers/view/${id}`)}
                                className="w-full sm:w-auto px-8 py-4 bg-transparent hover:bg-slate-800/40 text-slate-400 font-black uppercase tracking-widest text-xs transition-all rounded-2xl border border-slate-800 hover:border-slate-700"
                            >
                                Discard Changes
                            </button>
                            <button 
                                type="submit"
                                disabled={saving}
                                className="w-full sm:w-auto flex items-center justify-center gap-3 px-12 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-blue-600/20 transition-all active:scale-[0.98] disabled:opacity-50"
                            >
                                {saving ? (
                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Commit Updates
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

export default CustomerEdit;
