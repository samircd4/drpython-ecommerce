import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
    UserPlus, 
    Mail, 
    Save, 
    ArrowLeft, 
    Phone, 
    User,
    Lock,
    Eye,
    EyeOff,
    ShieldCheck,
    Tag,
    ShoppingBag
} from "lucide-react";
import { motion } from "framer-motion";
import api from "../api/axiosConfig";
import Breadcrumb from "../components/Layout/Breadcrumb";
import toast from "react-hot-toast";

const CustomerAdd = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone_number: "",
        customer_type: "retail",
        password: "", // Default handle in backend but UI allows setting it
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        // Prepare data - ensure empty strings don't override defaults if not intended
        const payload = { ...formData };
        if (!payload.password) delete payload.password;

        try {
            const response = await api.post('/customers/', payload);
            toast.success("New customer deployed successfully!");
            navigate(`/customers/view/${response.data.id}`);
        } catch (err) {
            console.error("Failed to create customer:", err);
            const errors = err.response?.data;
            if (errors) {
                Object.keys(errors).forEach(key => {
                    const message = Array.isArray(errors[key]) ? errors[key][0] : errors[key];
                    toast.error(`${key}: ${message}`);
                });
            } else {
                toast.error("Protocol failure. Check system logs.");
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
                            title="Customer Recruitment" 
                            paths={[
                                { label: "Home", path: "/" },
                                { label: "Customers", path: "/customers" },
                                { label: "New Customer", path: "/customers/new" }
                            ]} 
                        />
                        <h1 className="text-2xl font-black text-white uppercase tracking-tight mt-1">Enroll New Customer</h1>
                    </div>
                    <button 
                        onClick={() => navigate('/customers')}
                        className="group flex items-center gap-2 px-5 py-2.5 bg-slate-800/40 hover:bg-slate-800 text-slate-300 rounded-2xl transition-all border border-slate-700/50 hover:border-slate-600 font-bold text-sm"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Customers
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
                            <h2 className="text-xl font-bold text-slate-100 italic">Profile Commissioning</h2>
                            <p className="text-sm text-slate-500 font-medium">Establishing a new identity in the Sarker Shop ecosystem.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 sm:p-12 space-y-12 transition-all">
                        {/* Core Identity */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="h-4 w-1 bg-blue-500 rounded-full" />
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Core Identity</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Legal Name</label>
                                    <div className="relative group">
                                        <User className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                                        <input 
                                            required
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full bg-[#071229] border border-slate-700/60 rounded-2xl pl-14 pr-5 py-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/50 transition-all font-bold tracking-tight border-l-4 border-l-transparent focus:border-l-blue-500"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Communication Email</label>
                                    <div className="relative group">
                                        <Mail className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                                        <input 
                                            required
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full bg-[#071229] border border-slate-700/60 rounded-2xl pl-14 pr-5 py-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/50 transition-all font-bold tracking-tight border-l-4 border-l-transparent focus:border-l-blue-500"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Contact & Security */}
                        <section className="space-y-6 text-left">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="h-4 w-1 bg-emerald-500 rounded-full" />
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contact & Security</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Contact Phone</label>
                                    <div className="relative group">
                                        <Phone className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                                        <input 
                                            type="text"
                                            name="phone_number"
                                            value={formData.phone_number}
                                            onChange={handleChange}
                                            className="w-full bg-[#071229] border border-slate-700/60 rounded-2xl pl-14 pr-5 py-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600/50 transition-all font-medium border-l-4 border-l-transparent focus:border-l-emerald-500"
                                            placeholder="017xxxxxxxx"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Initial Passphrase</label>
                                    <div className="relative group">
                                        <Lock className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                                        <input 
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="w-full bg-[#071229] border border-slate-700/60 rounded-2xl pl-14 pr-14 py-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600/50 transition-all font-mono border-l-4 border-l-transparent focus:border-l-emerald-500"
                                            placeholder="Leave blank for default"
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    <p className="text-[9px] text-slate-600 ml-1 italic">Defaults to: Sarker@123</p>
                                </div>
                            </div>
                        </section>

                        {/* Classification */}
                        <section className="space-y-6 text-left">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="h-4 w-1 bg-purple-500 rounded-full" />
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Customer Classification</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <label 
                                    className={`flex items-center gap-4 p-5 rounded-2xl border transition-all cursor-pointer group/type ${
                                        formData.customer_type === 'retail' 
                                            ? 'bg-blue-600/10 border-blue-500/40 shadow-lg shadow-blue-500/5' 
                                            : 'bg-[#071229]/40 border-slate-800 hover:border-slate-700'
                                    }`}
                                >
                                    <input 
                                        type="radio" 
                                        name="customer_type" 
                                        value="retail" 
                                        checked={formData.customer_type === 'retail'} 
                                        onChange={handleChange}
                                        className="hidden"
                                    />
                                    <div className={`p-3 rounded-xl ${formData.customer_type === 'retail' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                                        <ShoppingBag className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className={`text-sm font-black uppercase tracking-tight ${formData.customer_type === 'retail' ? 'text-blue-300' : 'text-slate-400'}`}>Retail Node</p>
                                        <p className="text-[10px] text-slate-500 font-medium">Standard consumer pricing tier.</p>
                                    </div>
                                    {formData.customer_type === 'retail' && <ShieldCheck className="w-5 h-5 text-blue-500 ml-auto" />}
                                </label>

                                <label 
                                    className={`flex items-center gap-4 p-5 rounded-2xl border transition-all cursor-pointer group/type ${
                                        formData.customer_type === 'wholesale' 
                                            ? 'bg-purple-600/10 border-purple-500/40 shadow-lg shadow-purple-500/5' 
                                            : 'bg-[#071229]/40 border-slate-800 hover:border-slate-700'
                                    }`}
                                >
                                    <input 
                                        type="radio" 
                                        name="customer_type" 
                                        value="wholesale" 
                                        checked={formData.customer_type === 'wholesale'} 
                                        onChange={handleChange}
                                        className="hidden"
                                    />
                                    <div className={`p-3 rounded-xl ${formData.customer_type === 'wholesale' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                                        <Tag className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className={`text-sm font-black uppercase tracking-tight ${formData.customer_type === 'wholesale' ? 'text-purple-300' : 'text-slate-400'}`}>Wholesale Hub</p>
                                        <p className="text-[10px] text-slate-500 font-medium">Bulk acquisition pricing active.</p>
                                    </div>
                                    {formData.customer_type === 'wholesale' && <ShieldCheck className="w-5 h-5 text-purple-500 ml-auto" />}
                                </label>
                            </div>
                        </section>

                        {/* Submit */}
                        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-end gap-4">
                            <button 
                                type="button"
                                onClick={() => navigate('/customers')}
                                className="w-full sm:w-auto px-8 py-4 text-slate-500 font-black uppercase tracking-widest text-[10px] hover:text-slate-300 transition-colors"
                            >
                                Abort Protocol
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
                                        Activate Customer
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

export default CustomerAdd;
