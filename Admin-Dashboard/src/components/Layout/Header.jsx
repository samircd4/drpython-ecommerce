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
    Users,
    Ticket
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import { useModals } from "../../Context/ModalContext";
import api from "../../api/axiosConfig";
import { useChat } from "../../Context/ChatContext";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import OrderPanel from "./OrderPanel";
import NotificationPanel from "./NotificationPanel";
import useNotificationSocket from "../../hooks/useNotificationSocket";

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
const BACKEND_URL = API_BASE.replace(/\/api\/?$/, '');

const getFullUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${BACKEND_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

const Header = ({ SidebarCollapsed, onToggleSidebar }) => {
    const { user, logout } = useAuth();
    const { openModal, openOrderModal } = useModals();
    const { unreadCount, refreshUnreadCount } = useChat();
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
    const [showOrderPanel, setShowOrderPanel] = useState(false);
    const [showNotificationPanel, setShowNotificationPanel] = useState(false);
    
    const [recentOrders, setRecentOrders] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [newOrdersCount, setNewOrdersCount] = useState(0);
    const [lastKnownOrderId, setLastKnownOrderId] = useState(() => {
        return parseInt(localStorage.getItem('lastKnownOrderId')) || null;
    });

    const dropdownRef = useRef(null);
    const addDropdownRef = useRef(null);
    const orderPanelRef = useRef(null);
    const notificationPanelRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowUserDropdown(false);
            }
            if (addDropdownRef.current && !addDropdownRef.current.contains(event.target)) {
                setShowAddDropdown(false);
            }
            if (orderPanelRef.current && !orderPanelRef.current.contains(event.target)) {
                setShowOrderPanel(false);
            }
            if (notificationPanelRef.current && !notificationPanelRef.current.contains(event.target)) {
                setShowNotificationPanel(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchHeaderData = async () => {
        try {
            // Fetch recent orders
            const ordersRes = await api.get('/orders/');
            const orderData = Array.isArray(ordersRes.data) ? ordersRes.data : (ordersRes.data?.results || []);
            setRecentOrders(orderData.slice(0, 10));

            // Logic for "new orders" badge
            if (orderData.length > 0) {
                const latestId = orderData[0].id;
                if (lastKnownOrderId === null) {
                    setLastKnownOrderId(latestId);
                    // Initial load: we consider these "new" if they haven't been seen
                    setNewOrdersCount(orderData.length);
                } else if (latestId !== lastKnownOrderId) {
                    // New orders arrived
                    const newOnes = orderData.filter(o => o.id > lastKnownOrderId);
                    if (newOnes.length > 0) {
                        setNewOrdersCount(prev => prev + newOnes.length);
                        setLastKnownOrderId(latestId);
                    }
                }
            }

            // Fetch notifications
            try {
                const notifRes = await api.get('/notifications/');
                const notifData = Array.isArray(notifRes.data) ? notifRes.data : (notifRes.data?.results || []);
                setNotifications(notifData);
            } catch (e) {
                setNotifications([]);
            }
        } catch (error) {
            console.error("Header: Failed to fetch data", error);
        }
    };

    // WebSocket for True Real-Time Notifications
    const accessToken = localStorage.getItem('access_token');
    useNotificationSocket(accessToken, user?.id, (data) => {
        if (data.type === 'new_order') {
            toast.success(`New Order: ${data.message || 'Received!'}`, {
                duration: 5000,
                position: 'top-right',
                icon: '🛒'
            });
            // Optimistically increment badge
            setNewOrdersCount(prev => prev + 1);
            // Refresh full state after a short delay
            setTimeout(() => {
                fetchHeaderData();
            }, 1000);
        }
    });

    useEffect(() => {
        fetchHeaderData();
    }, [lastKnownOrderId]);

    // Persist lastKnownOrderId when it changes
    useEffect(() => {
        if (lastKnownOrderId) {
            localStorage.setItem('lastKnownOrderId', lastKnownOrderId.toString());
        }
    }, [lastKnownOrderId]);

    const handleMarkAllRead = async () => {
        try {
            const response = await api.get('/chats/');
            const chats = Array.isArray(response.data) ? response.data : (response.data?.results || []);
            const unreadChats = chats.filter(c => c.unread_count > 0);
            
            await Promise.all(unreadChats.map(chat => api.patch(`/chats/read/${chat.id}/`)));
            refreshUnreadCount();
        } catch (err) {
            console.error("Header: Failed to mark all as read", err);
        }
    };

    const handleOrderClick = (order) => {
        setShowOrderPanel(false);
        openOrderModal(order, 'view');
    };



    return (
        <div className="relative z-50 shadow-lg backdrop-blur-xl border-b border-slate-800 px-4 sm:px-6 py-2 sm:py-4 h-12 sm:h-16" style={{ backgroundImage: 'linear-gradient(90deg,var(--bg-start),var(--bg-mid),var(--bg-end))' }}>
            <div className="flex items-center justify-between h-full">
                {/* Left section - logo attached to header */}
                <div className="flex items-center space-x-4">
                        <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                            <div className="w-10 h-10 rounded-lg bg-transparent flex items-center justify-center">
                                <img src="/logo-DaOXiO9r.png" alt="logo" className="w-9 h-9 object-contain" />
                            </div>
                            <div className="hidden sm:block">
                                <h1 className="text-lg font-bold text-slate-100 uppercase">Sarker Shop</h1>
                            </div>
                        </Link>

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
                    <div className="relative group">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-blue-400" />
                        <input
                            className="w-full pl-10 pr-4 py-2.5 bg-[#0b1a2a] border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#214b6b] transition-all"
                            type="text"
                            placeholder="Search Anything"
                        />
                    </div>
                </div>

                {/* Right */}
                <div className="flex items-center space-x-3">
                    <div className="hidden sm:block h-6 w-px bg-slate-700 mx-1"></div>

                    {/* Cart Icon -> Order Panel */}
                    <div className="relative" ref={orderPanelRef}>
                        <button 
                            onClick={() => {
                                setShowOrderPanel(!showOrderPanel);
                                if (!showOrderPanel) setNewOrdersCount(0); // Reset badge when opening
                                setShowNotificationPanel(false);
                                setShowUserDropdown(false);
                                setShowAddDropdown(false);
                            }}
                            className={`p-2.5 cursor-pointer rounded-xl transition-colors relative ${
                                showOrderPanel ? 'bg-blue-600/20 text-blue-400' : 'text-slate-200 hover:bg-slate-800'
                            }`}
                        >
                            <ShoppingCart className="w-5 h-5" />
                            {newOrdersCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#071229]">
                                    {newOrdersCount}
                                </span>
                            )}
                        </button>
                        <OrderPanel 
                            open={showOrderPanel} 
                            onClose={() => setShowOrderPanel(false)} 
                            orders={recentOrders}
                            onOrderClick={handleOrderClick}
                        />
                    </div>

                    {/* Notification/Messages - Messages handled separately by user request */}
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

                    <div className="relative" ref={notificationPanelRef}>
                        <button 
                            onClick={() => {
                                setShowNotificationPanel(!showNotificationPanel);
                                setShowOrderPanel(false);
                                setShowUserDropdown(false);
                                setShowAddDropdown(false);
                            }}
                            className={`relative p-2.5 cursor-pointer rounded-xl transition-colors ${
                                showNotificationPanel ? 'bg-purple-600/20 text-purple-400' : 'text-slate-200 hover:bg-slate-800'
                            }`}
                        >
                            <Bell className="w-5 h-5" />
                            {notifications.filter(n => !n.is_read).length > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#071229]">
                                    {notifications.filter(n => !n.is_read).length}
                                </span>
                            )}
                        </button>
                        <NotificationPanel 
                            open={showNotificationPanel}
                            onClose={() => setShowNotificationPanel(false)}
                            notifications={notifications}
                            onMarkRead={async (id) => {
                                try {
                                    await api.patch(`/notifications/${id}/read/`);
                                    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
                                } catch (e) {
                                    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
                                }
                            }}
                            onMarkAllRead={async () => {
                                try {
                                    await api.post('/notifications/read-all/');
                                    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
                                } catch (e) {
                                    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
                                }
                            }}
                        />
                    </div>

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
