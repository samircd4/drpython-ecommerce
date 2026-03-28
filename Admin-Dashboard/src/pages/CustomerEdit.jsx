import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
    User, 
    Mail, 
    Phone, 
    Save,
    ArrowLeft,
    X,
    CheckCircle2
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
    });

    useEffect(() => {
        const fetchCustomer = async () => {
            try {
                const response = await api.get(`/customers/${id}/`);
                const { first_name, last_name, name, email, phone_number } = response.data;
                setFormData({
                    first_name: first_name || "",
                    last_name: last_name || "",
                    name: name || "",
                    email: email || "",
                    phone_number: phone_number || "",
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
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.patch(`/customers/${id}/`, formData);
            toast.success("Customer updated successfully!");
            navigate(`/customers/view/${id}`);
        } catch (err) {
            console.error("Failed to update customer:", err);
            toast.error(err.response?.data?.detail || "Failed to update customer.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#071229]">
            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="p-4 sm:p-6 min-h-screen bg-transparent">
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <Breadcrumb title="Edit Customer" paths={["Home", "Customers", "Edit"]} />
                    <button 
                        onClick={() => navigate(`/customers/view/${id}`)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-800 text-slate-300 rounded-xl transition-all border border-slate-700/50 cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                        Cancel
                    </button>
                </div>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-[#0b1a2a] border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden"
                >
                    <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-blue-600/10 to-transparent">
                        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-3">
                            <User className="w-6 h-6 text-blue-400" />
                            Update Customer Profile
                        </h2>
                        <p className="text-sm text-slate-400 mt-1">Modify account details and contact information.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">First Name</label>
                                <div className="relative">
                                    <input 
                                        type="text"
                                        name="first_name"
                                        value={formData.first_name}
                                        onChange={handleChange}
                                        className="w-full bg-[#071229] border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/50 transition-all"
                                        placeholder="John"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Last Name</label>
                                <div className="relative">
                                    <input 
                                        type="text"
                                        name="last_name"
                                        value={formData.last_name}
                                        onChange={handleChange}
                                        className="w-full bg-[#071229] border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/50 transition-all"
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Display Name (Full Name)</label>
                            <input 
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full bg-[#071229] border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/50 transition-all font-semibold"
                                placeholder="John Doe"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input 
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full bg-[#071229] border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/50 transition-all"
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
                                <div className="relative">
                                    <Phone className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input 
                                        type="text"
                                        name="phone_number"
                                        value={formData.phone_number}
                                        onChange={handleChange}
                                        className="w-full bg-[#071229] border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/50 transition-all"
                                        placeholder="017XXXXXXXX"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-800 flex items-center justify-end gap-4">
                            <button 
                                type="button"
                                onClick={() => navigate(`/customers/view/${id}`)}
                                className="px-6 py-3 bg-slate-800/80 hover:bg-slate-800 text-slate-300 font-bold rounded-xl transition-all border border-slate-700/50 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                disabled={saving}
                                className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? (
                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Save Changes
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
