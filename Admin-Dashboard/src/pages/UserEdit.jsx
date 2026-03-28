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
    Trash2
} from "lucide-react";
import { motion } from "framer-motion";
import api from "../api/axiosConfig";
import Breadcrumb from "../components/Layout/Breadcrumb";
import toast from "react-hot-toast";

const UserEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        is_staff: false,
        is_active: false,
        is_superuser: false,
    });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.get(`/users/${id}/`);
                const { first_name, last_name, email, is_staff, is_active, is_superuser } = response.data;
                setFormData({
                    first_name: first_name || "",
                    last_name: last_name || "",
                    email: email || "",
                    is_staff: is_staff || false,
                    is_active: is_active || false,
                    is_superuser: is_superuser || false,
                });
            } catch (err) {
                console.error("Failed to fetch user:", err);
                toast.error("Failed to load user data.");
                navigate('/all-users');
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
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
            await api.patch(`/users/${id}/`, formData);
            toast.success("User updated successfully!");
            navigate(`/users/view/${id}`);
        } catch (err) {
            console.error("Failed to update user:", err);
            toast.error(err.response?.data?.detail || "Failed to update user.");
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
                    <Breadcrumb title="Edit User" paths={["Home", "Users", "Edit"]} />
                    <button 
                        onClick={() => navigate(`/users/view/${id}`)}
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
                            <ShieldCheck className="w-6 h-6 text-blue-400" />
                            Edit System Permissions
                        </h2>
                        <p className="text-sm text-slate-400 mt-1">Configure user access levels and account status.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">First Name</label>
                                <input 
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    className="w-full bg-[#071229] border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/50 transition-all font-medium"
                                    placeholder="John"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Last Name</label>
                                <input 
                                    type="text"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    className="w-full bg-[#071229] border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/50 transition-all font-medium"
                                    placeholder="Doe"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input 
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full bg-[#071229] border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/50 transition-all"
                                    placeholder="user@example.com"
                                />
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-800 space-y-4">
                            <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4">Role & Access Control</h4>
                            
                            <div className="space-y-3">
                                <label className="flex items-center gap-4 p-4 bg-[#071229] border border-slate-700/50 rounded-2xl cursor-pointer hover:border-blue-500/50 transition-all group">
                                    <div className="relative flex items-center">
                                        <input 
                                            type="checkbox"
                                            name="is_active"
                                            checked={formData.is_active}
                                            onChange={handleChange}
                                            className="w-5 h-5 appearance-none border-2 border-slate-600 rounded-md checked:bg-blue-600 checked:border-blue-600 transition-all cursor-pointer"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                                            {/* Custom checkmark if needed */}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-200">Account Enabled</p>
                                        <p className="text-xs text-slate-500">Uncheck to disable user access to the platform.</p>
                                    </div>
                                </label>

                                <label className="flex items-center gap-4 p-4 bg-[#071229] border border-slate-700/50 rounded-2xl cursor-pointer hover:border-blue-500/50 transition-all group">
                                    <input 
                                        type="checkbox"
                                        name="is_staff"
                                        checked={formData.is_staff}
                                        onChange={handleChange}
                                        className="w-5 h-5 appearance-none border-2 border-slate-600 rounded-md checked:bg-emerald-600 checked:border-emerald-600 transition-all cursor-pointer"
                                    />
                                    <div>
                                        <p className="text-sm font-bold text-slate-200">Staff Access (Admin Panel)</p>
                                        <p className="text-xs text-slate-500">Allows the user to log in to this management dashboard.</p>
                                    </div>
                                </label>

                                <label className="flex items-center gap-4 p-4 bg-[#071229] border border-slate-700/50 rounded-2xl cursor-pointer hover:border-purple-500/50 transition-all group">
                                    <input 
                                        type="checkbox"
                                        name="is_superuser"
                                        checked={formData.is_superuser}
                                        onChange={handleChange}
                                        className="w-5 h-5 appearance-none border-2 border-slate-600 rounded-md checked:bg-purple-600 checked:border-purple-600 transition-all cursor-pointer"
                                    />
                                    <div>
                                        <p className="text-sm font-bold text-slate-200">Superuser Privileges</p>
                                        <p className="text-xs text-slate-500 text-purple-400/80">Grant full unrestricted control over all modules and settings.</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
                            <button 
                                type="button"
                                className="flex items-center gap-2 px-4 py-2 text-red-500 opacity-30 hover:opacity-100 transition-opacity disabled:cursor-not-allowed"
                                disabled
                            >
                                <Trash2 className="w-4 h-4" />
                                <span className="text-xs font-black uppercase tracking-widest">Delete User</span>
                            </button>
                            
                            <div className="flex items-center gap-4">
                                <button 
                                    type="button"
                                    onClick={() => navigate(`/users/view/${id}`)}
                                    className="px-6 py-3 text-slate-400 font-bold text-sm hover:text-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={saving}
                                    className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-50"
                                >
                                    {saving ? (
                                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            Update Profile
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

export default UserEdit;
