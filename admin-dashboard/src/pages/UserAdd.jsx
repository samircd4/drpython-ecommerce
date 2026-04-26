import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
    UserPlus, 
    Mail, 
    Save, 
    ArrowLeft, 
    ShieldCheck, 
    Lock, 
    User,
    Eye,
    EyeOff,
    Search,
    Loader2,
    Check,
    Key
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axiosConfig";
import Breadcrumb from "../components/Layout/Breadcrumb";
import toast from "react-hot-toast";

const UserAdd = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [groups, setGroups] = useState([]);
    const [showPassword, setShowPassword] = useState(false);
    
    // Search states
    const [customerSearch, setCustomerSearch] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef(null);
    
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

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (customerSearch.trim().length > 1) {
                setIsSearching(true);
                try {
                    // Search users instead of customers to catch all accounts
                    const res = await api.get(`/users/?search=${customerSearch}`);
                    setSearchResults(res.data.results || []);
                    setShowResults(true);
                } catch (err) {
                    console.error("Search failed", err);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
                setShowResults(false);
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [customerSearch]);

    // Close search results on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowResults(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Auto-detect existing user if email is typed manually but matches a search result
    useEffect(() => {
        if (!selectedUser && formData.email) {
            const exactMatch = searchResults.find(u => u.email?.toLowerCase() === formData.email.toLowerCase());
            if (exactMatch) {
                setSelectedUser(exactMatch.id);
                toast(`Existing user detected: ${exactMatch.username}. Switching to promotion mode.`, { icon: '🔄' });
            }
        }
    }, [formData.email, searchResults, selectedUser]);

    const handleSelectCustomer = (user) => {
        setSelectedUser(user.id);
        setFormData(prev => ({
            ...prev,
            username: user.username || "",
            email: user.email || "",
            first_name: user.first_name || "",
            last_name: user.last_name || "",
            is_staff: user.is_staff,
            is_superuser: user.is_superuser,
            is_active: user.is_active,
            groups: user.groups || []
        }));
        setCustomerSearch(user.email);
        setShowResults(false);
        toast.success(`Selected user: ${user.email}`);
    };

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
            // Final safety check: if email exists in results but we haven't selected it, 
            // the above useEffect should have caught it, but we check again.
            let finalSelectedUser = selectedUser;
            if (!finalSelectedUser && formData.email) {
                const match = searchResults.find(c => c.email?.toLowerCase() === formData.email.toLowerCase());
                if (match) finalSelectedUser = match.user_id;
            }

            // If we have a selectedUser, we are promoting (PATCH)
            let response;
            if (finalSelectedUser) {
                // If password is empty, don't send it to backend to avoid overriding with empty string
                const payload = { ...formData };
                if (!payload.password) delete payload.password;
                
                response = await api.patch(`/users/${finalSelectedUser}/`, payload);
                toast.success("User promoted successfully!");
            } else {
                // Fallback: Create new user if no customer selected
                if (!formData.password) {
                    toast.error("Password is required for new accounts.");
                    setLoading(false);
                    return;
                }
                response = await api.post('/users/', formData);
                toast.success("New user created successfully!");
            }
            navigate(`/users/view/${response.data.id}`);
        } catch (err) {
            console.error("Submit failed:", err);
            const errors = err.response?.data;
            if (errors) {
                Object.keys(errors).forEach(key => {
                    toast.error(`${key}: ${Array.isArray(errors[key]) ? errors[key][0] : errors[key]}`);
                });
            } else {
                toast.error("Process failed. Check connection.");
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
                            title="Promote Staff" 
                            paths={[
                                { label: "Home", path: "/" },
                                { label: "Users", path: "/users" },
                                { label: "Promote", path: "/users/add" }
                            ]} 
                        />
                        <h1 className="text-2xl font-black text-white uppercase tracking-tight mt-1">Upgrade Customer to Staff</h1>
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
                            <h2 className="text-xl font-bold text-slate-100 italic">User Promotion Flow</h2>
                            <p className="text-sm text-slate-500 font-medium">Search for an existing customer and upgrade their permissions.</p>
                        </div>
                    </div>

                    <div className="p-8 sm:p-12 space-y-12">
                        {/* Search Section */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="h-4 w-1 bg-yellow-500 rounded-full" />
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Step 1: Find Existing Customer</h3>
                            </div>
                            <div className="relative" ref={searchRef}>
                                <div className="relative group">
                                    <Search className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${isSearching ? 'text-blue-500' : 'text-slate-500'}`} />
                                    <input 
                                        type="text"
                                        placeholder="Search by name, email or phone..."
                                        value={customerSearch}
                                        onChange={(e) => setCustomerSearch(e.target.value)}
                                        className="w-full bg-[#071229] border border-slate-700/60 rounded-2xl pl-14 pr-12 py-5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-yellow-600/50 transition-all font-bold tracking-tight border-l-4 border-l-yellow-500"
                                    />
                                    {isSearching && (
                                        <div className="absolute right-5 top-1/2 -translate-y-1/2">
                                            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                                        </div>
                                    )}
                                </div>

                                <AnimatePresence>
                                    {showResults && searchResults.length > 0 && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute left-0 right-0 top-full mt-2 bg-[#0b1a2a] border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-[300px] overflow-y-auto"
                                        >
                                            {searchResults.map((user) => (
                                                <button
                                                    key={user.id}
                                                    onClick={() => handleSelectCustomer(user)}
                                                    className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors border-b border-slate-800 last:border-0 text-left"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                                                            <User className="w-5 h-5 text-slate-400" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-white">{user.first_name} {user.last_name || user.username}</p>
                                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{user.email}</p>
                                                        </div>
                                                    </div>
                                                    {selectedUser === user.id && <Check className="w-5 h-5 text-green-500" />}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </section>

                        <form onSubmit={handleSubmit} className="space-y-12 transition-all">
                            {/* Bio Data */}
                            <section className={`space-y-6 text-left transition-opacity ${!selectedUser ? 'opacity-50' : 'opacity-100'}`}>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="h-4 w-1 bg-emerald-500 rounded-full" />
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Step 2: Verify Personal Info</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">First Name</label>
                                        <input 
                                            type="text"
                                            name="first_name"
                                            value={formData.first_name}
                                            onChange={handleChange}
                                            className="w-full bg-[#071229] border border-slate-700/60 rounded-2xl px-5 py-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600/50 transition-all font-medium border-l-4 border-l-transparent focus:border-l-emerald-500"
                                            placeholder="Auto-populated"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Last Name</label>
                                        <input 
                                            type="text"
                                            name="last_name"
                                            value={formData.last_name}
                                            onChange={handleChange}
                                            className="w-full bg-[#071229] border border-slate-700/60 rounded-2xl px-5 py-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600/50 transition-all font-medium border-l-4 border-l-transparent focus:border-l-emerald-500"
                                            placeholder="Auto-populated"
                                        />
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
                                                placeholder="Auto-populated"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Username / ID</label>
                                        <div className="relative group">
                                            <User className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                                            <input 
                                                required
                                                type="text"
                                                name="username"
                                                value={formData.username}
                                                onChange={handleChange}
                                                className="w-full bg-[#071229] border border-slate-700/60 rounded-2xl pl-14 pr-5 py-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600/50 transition-all font-medium border-l-4 border-l-transparent focus:border-l-emerald-500"
                                                placeholder="Auto-populated"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Passphrase override */}
                            <section className={`space-y-6 text-left transition-opacity ${!selectedUser ? 'opacity-50' : 'opacity-100'}`}>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="h-4 w-1 bg-red-500 rounded-full" />
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{selectedUser ? "Step 3: Reset Password (Optional)" : "Step 3: Security Credentials"}</h3>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">System Passphrase</label>
                                    <div className="relative group">
                                        <Lock className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-red-400 transition-colors" />
                                        <input 
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required={!selectedUser}
                                            className="w-full bg-[#071229] border border-slate-700/60 rounded-2xl pl-14 pr-14 py-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-600/50 transition-all font-mono border-l-4 border-l-transparent focus:border-l-red-500"
                                            placeholder={selectedUser ? "Leave empty to keep existing" : "Required for new users"}
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
                            </section>

                            {/* Privileges */}
                            <section className={`space-y-6 transition-opacity ${!selectedUser ? 'opacity-50' : 'opacity-100'}`}>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="h-4 w-1 bg-purple-500 rounded-full" />
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Step 4: Authorization Matrix</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <StatusToggle color="blue" label="Active" desc="Can log in" name="is_active" checked={formData.is_active} onChange={handleChange} />
                                    <StatusToggle color="emerald" label="Staff" desc="Admin access" name="is_staff" checked={formData.is_staff} onChange={handleChange} />
                                    <StatusToggle color="purple" label="Super" desc="Full root" name="is_superuser" checked={formData.is_superuser} onChange={handleChange} />
                                </div>
                            </section>

                            {/* Roles */}
                            <section className={`space-y-6 text-left transition-opacity ${!selectedUser ? 'opacity-50' : 'opacity-100'}`}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="h-4 w-1 bg-indigo-500 rounded-full" />
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Step 5: Operational Roles</h3>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {groups.map(group => (
                                        <button
                                            key={group.id}
                                            type="button"
                                            onClick={() => handleGroupToggle(group.name)}
                                            className={`p-5 rounded-2xl border transition-all text-left ${
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
                                    Cancel Request
                                </button>
                                <button 
                                    type="submit"
                                    disabled={loading}
                                    className="w-full sm:w-auto flex items-center justify-center gap-3 px-12 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-blue-600/20 transition-all active:scale-[0.98] disabled:opacity-50"
                                >
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            {selectedUser ? "Initialize Promotion" : "Initialize New Operator"}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

const StatusToggle = ({ label, desc, name, checked, onChange, color }) => (
    <label className={`flex items-center gap-4 p-5 bg-[#071229]/60 border border-slate-700/50 rounded-2xl cursor-pointer hover:border-slate-600 transition-all group/toggle text-left`}>
        <div className="relative">
            <input 
                type="checkbox"
                name={name}
                checked={checked}
                onChange={onChange}
                className="w-6 h-6 appearance-none border-2 border-slate-600 rounded-lg checked:bg-blue-600 checked:border-blue-600 transition-all cursor-pointer"
            />
            {checked && <ShieldCheck className="w-4 h-4 text-white absolute top-1 left-1 pointer-events-none" />}
        </div>
        <div>
            <p className="text-sm font-bold text-slate-200 transition-colors">{label}</p>
            <p className="text-[10px] text-slate-500 font-medium">{desc}</p>
        </div>
    </label>
);

export default UserAdd;
