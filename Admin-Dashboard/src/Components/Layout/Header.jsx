import {
    Bell,
    ChevronDown,
    Menu,
    Plus,
    Search,
    Settings,
    User,
    LogOut,
    ShoppingCart,
    MessageSquare,
    Box,
    Layers,
    Tag,
    ShoppingBag,
    CreditCard,
    Users
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import api from "../../api/axiosConfig";

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
const BACKEND_URL = API_BASE.replace(/\/api\/?$/, '');

const getFullUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${BACKEND_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

const Header = ({ SidebarCollapsed, onToggleSidebar }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [theme, setTheme] = useState(() => {
        try {
            const t = localStorage.getItem("theme");
            if (t) return t;
            return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        } catch (e) {
            return "light";
        }
    });

    useEffect(() => {
        try {
            if (theme === "dark") {
                document.documentElement.classList.add("dark");
            } else {
                document.documentElement.classList.remove("dark");
            }
            localStorage.setItem("theme", theme);
        } catch (e) { }
    }, [theme]);

    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [showAddDropdown, setShowAddDropdown] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);
    const addDropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowUserDropdown(false);
            }
            if (addDropdownRef.current && !addDropdownRef.current.contains(event.target)) {
                setShowAddDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchUnread = async () => {
            try {
                const response = await api.get('/chats/');
                const chats = Array.isArray(response.data) ? response.data : (response.data?.results || []);
                const total = chats.reduce((acc, chat) => acc + (chat.unread_count || 0), 0);
                setUnreadCount(total);
            } catch (err) {
                console.error("Header: Failed to fetch unread count", err);
            }
        };
        if (user) fetchUnread();
        const interval = setInterval(fetchUnread, 30000);
        return () => clearInterval(interval);
    }, [user]);

    const handleMarkAllRead = async () => {
        try {
            const response = await api.get('/chats/');
            const chats = Array.isArray(response.data) ? response.data : (response.data?.results || []);
            const unreadChats = chats.filter(c => c.unread_count > 0);
            
            await Promise.all(unreadChats.map(chat => api.patch(`/chats/read/${chat.id}/`)));
            setUnreadCount(0);
            window.dispatchEvent(new CustomEvent('unreadCountRefresh'));
        } catch (err) {
            console.error("Header: Failed to mark all as read", err);
        }
    };

    return (
        <div className="relative z-50 shadow-lg backdrop-blur-xl border-b border-slate-800 px-4 sm:px-6 py-2 sm:py-4 h-12 sm:h-16" style={{ backgroundImage: 'linear-gradient(90deg,var(--bg-start),var(--bg-mid),var(--bg-end))' }}>
            <div className="flex items-center justify-between h-full">
                {/* Left section - logo attached to header */}
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-transparent flex items-center justify-center">
                            <img src="/logo-DaOXiO9r.png" alt="logo" className="w-9 h-9 object-contain" />
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-lg font-bold text-slate-100 uppercase">Sarker Shop</h1>
                        </div>
                    </div>

                    <button
                        onClick={onToggleSidebar}
                        className="p-2 rounded-lg cursor-pointer text-slate-200 hover:bg-slate-800 transition-colors"
                        aria-label="Toggle sidebar"
                    >
                        <Menu className="w-5 h-5"></Menu>
                    </button>

                    <div className="hidden md:block">
                        <h1 className="text-2xl font-bold text-slate-100">
                            Dashboard
                        </h1>
                        <p className="text-sm text-slate-300">Welcome back, {user?.name.split(' ')[0] || 'Admin'}! here's what's happening today</p>
                    </div>
                </div>

                {/* Center - hidden on small screens to keep header compact */}
                <div className="hidden sm:block flex-1 max-w-md mx-8">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                        <input
                            className="w-full pl-10  pr-4 py-2.5 bg-[#0b1a2a] border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#214b6b] transition-all"
                            type="text"
                            placeholder="Search Anything"
                        />
                    </div>
                </div>

                {/* Right */}
                <div className="flex items-center space-x-3">
                    {/* Add New Dropdown */}
                    <div className="relative" ref={addDropdownRef}>
                        <button 
                            onClick={() => setShowAddDropdown(!showAddDropdown)}
                            className="flex items-center space-x-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors cursor-pointer group shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="text-sm font-semibold">New</span>
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showAddDropdown ? 'rotate-180' : ''}`} />
                        </button>

                        {showAddDropdown && (
                            <div className="absolute right-0 mt-3 w-56 bg-[#0b1a2a] border border-slate-700/50 rounded-xl shadow-2xl py-2 z-[60] animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right">
                                <div className="px-3 py-1.5 mb-1">
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Create</p>
                                </div>
                                
                                <button onClick={() => { navigate('/products/new'); setShowAddDropdown(false); }} className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer group">
                                    <Box className="w-4 h-4 text-slate-400 group-hover:text-blue-400" />
                                    <span>Product</span>
                                </button>
                                
                                <button onClick={() => { navigate('/brands/new'); setShowAddDropdown(false); }} className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer group">
                                    <Tag className="w-4 h-4 text-slate-400 group-hover:text-purple-400" />
                                    <span>Brand</span>
                                </button>
                                
                                <button onClick={() => { navigate('/categories/new'); setShowAddDropdown(false); }} className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer group">
                                    <Layers className="w-4 h-4 text-slate-400 group-hover:text-emerald-400" />
                                    <span>Category</span>
                                </button>

                                <div className="h-px bg-slate-800 my-1 mx-2" />
                                
                                <button onClick={() => { navigate('/orders/new'); setShowAddDropdown(false); }} className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer group">
                                    <ShoppingBag className="w-4 h-4 text-slate-400 group-hover:text-amber-400" />
                                    <span>Order</span>
                                </button>

                                <button onClick={() => { navigate('/payments/new'); setShowAddDropdown(false); }} className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer group">
                                    <CreditCard className="w-4 h-4 text-slate-400 group-hover:text-green-400" />
                                    <span>Payment</span>
                                </button>

                                <button onClick={() => { navigate('/customers/new'); setShowAddDropdown(false); }} className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer group">
                                    <Users className="w-4 h-4 text-slate-400 group-hover:text-pink-400" />
                                    <span>Customer</span>
                                </button>
                            </div>
                        )}
                    </div>
                    
                    <div className="hidden sm:block h-6 w-px bg-slate-700 mx-1"></div>

                    {/* Cart Icon (Mobile & Desktop) */}
                    <button className="p-2.5 cursor-pointer rounded-xl text-slate-200 hover:bg-slate-800 transition-colors relative">
                        <ShoppingCart className="w-5 h-5" />
                    </button>

                    {/* Notification/Messages */}
                    <button 
                        onClick={() => {
                            handleMarkAllRead();
                            navigate('/messages');
                        }}
                        className="relative p-2.5 cursor-pointer rounded-xl text-slate-200 hover:bg-slate-800 transition-colors"
                    >
                        <MessageSquare className="w-5 h-5" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-slate-100 text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#071229]">
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                        )}
                    </button>

                    <button className="relative p-2.5 cursor-pointer rounded-xl text-slate-200 hover:bg-slate-800 transition-colors hidden sm:block">
                        <Bell className="w-5 h-5" />
                        <span className="absolute -top-1 w-5 h-5 bg-red-500 text-slate-100 text-xs rounded-full flex items-center justify-center">
                            3
                        </span>
                    </button>

                    {/* User Profile */}
                    <div className="relative" ref={dropdownRef}>
                        <button 
                            onClick={() => setShowUserDropdown(!showUserDropdown)}
                            className="flex items-center space-x-3 pl-3 border-l border-slate-700 cursor-pointer group"
                        >
                            <div className="w-8 h-8 rounded-full bg-slate-700 ring-2 ring-[#184a6a] flex items-center justify-center text-slate-200 overflow-hidden group-hover:ring-blue-500 transition-all">
                                {user?.profile_picture ? (
                                    <img src={getFullUrl(user.profile_picture)} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-4 h-4" />
                                )}
                            </div>
                            <div className="hidden md:block text-left">
                                <p className="text-xs font-bold text-slate-100 uppercase tracking-tight truncate max-w-[100px]">
                                    {user?.name || 'Administrator'}
                                </p>
                                <div className="flex items-center">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">
                                        {user?.role || 'Super Admin'}
                                    </p>
                                    <ChevronDown className={`w-3 h-3 ml-1 text-slate-500 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} />
                                </div>
                            </div>
                        </button>

                        {showUserDropdown && (
                            <div className="absolute right-0 mt-3 w-48 bg-[#0b1a2a] border border-slate-800 rounded-xl shadow-2xl py-2 z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
                                <button 
                                    onClick={() => {
                                        navigate('/settings');
                                        setShowUserDropdown(false);
                                    }}
                                    className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
                                >
                                    <Settings className="w-4 h-4" />
                                    <span>Settings</span>
                                </button>
                                <div className="h-px bg-slate-800 my-1 mx-2" />
                                <button 
                                    onClick={() => {
                                        logout();
                                        setShowUserDropdown(false);
                                    }}
                                    className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>Logout</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Header;
