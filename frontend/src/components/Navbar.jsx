import React, { useState, useEffect } from 'react';
import { FaCaretDown, FaUser } from 'react-icons/fa'
import { IoCartOutline } from 'react-icons/io5'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { FiMenu } from 'react-icons/fi';
import { UserLock, Bell } from 'lucide-react';
import CategoryList from './CategoryList';
import SearchBar from './SearchBar';
import { useCart } from '../context/CartContext'
import { useUser } from '../context/UserContext'
import CartPanel from './CartPanel'
import NotificationPanel from './NotificationPanel'
import useWebSocket from '../hooks/useWebSocket'
import api from '../api/client'
import { motion, AnimatePresence } from 'framer-motion';

import logo from '../assets/logo.png';

const API_URL = import.meta.env.VITE_API_URL;

const NavItem = ({ item }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <NavLink
            to={item.path}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={({ isActive }) => `
                relative py-1 cursor-pointer transition-colors duration-300
                ${isActive ? "text-purple-600" : "text-neutral-900 hover:text-purple-600"}
            `}
        >
            {({ isActive }) => (
                <motion.li
                    className="list-none relative"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    {item.name}
                    {/* Active Underline (Shared Layout) */}
                    {isActive && (
                        <motion.div
                            layoutId="navbar-underline"
                            className="absolute -bottom-1 left-0 right-0 h-0.5 bg-purple-600"
                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                    )}
                    {/* Hover Underline (Non-active items) */}
                    {!isActive && (
                        <motion.div
                            className="absolute -bottom-1 left-0 right-0 h-0.5 bg-purple-600"
                            initial={{ scaleX: 0, opacity: 0 }}
                            animate={{ scaleX: isHovered ? 1 : 0, opacity: isHovered ? 1 : 0 }}
                            transition={{ duration: 0.2 }}
                            style={{ originX: 0 }}
                        />
                    )}
                </motion.li>
            )}
        </NavLink>
    );
};

const Navbar = () => {
    const { isDrawerOpen, setIsDrawerOpen } = useCart();
    const [showDrawer, setShowDrawer] = useState(false);
    const [animationClass, setAnimationClass] = useState('');
    const [searchFocused, setSearchFocused] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const { cartItem, isCartOpen, setIsCartOpen } = useCart();
    const { user } = useUser();
    const navigate = useNavigate();
    const location = useLocation();
    const totalCount = cartItem.reduce((sum, item) => sum + (item.quantity || 0), 0);

    // ─── Real-time Notifications ──────────────────────────
    const [notifications, setNotifications] = useState([]);
    const [bellShake, setBellShake] = useState(false);

    // Load persisted notifications from API when user is logged in
    useEffect(() => {
        const loadNotifications = async () => {
            if (!user) {
                setNotifications([]);
                return;
            }
            try {
                const res = await api.get('/notifications/');
                if (res.data?.results?.length > 0) {
                    setNotifications(res.data.results);
                } else if (res.data?.length > 0) {
                    setNotifications(res.data);
                } else {
                    setNotifications([]);
                }
            } catch {
                setNotifications([]);
            }
        };
        loadNotifications();
    }, [user]);

    // Connect to notification WebSocket when logged in
    const { data: wsNotification } = useWebSocket(
        user?.user ? `/ws/notifications/${user.user}/` : null
    );

    // When a new notification arrives via WebSocket
    useEffect(() => {
        if (wsNotification) {
            setNotifications(prev => {
                // Prevent duplicate entries (e.g., from React Strict Mode double-invocation)
                if (prev.some(n => n.id === wsNotification.id)) return prev;
                return [wsNotification, ...prev];
            });
            // Trigger bell shake animation
            setBellShake(true);
            setTimeout(() => setBellShake(false), 1500);
        }
    }, [wsNotification]);

    // Mark all as read handler
    const handleMarkAllRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        if (user) {
            try {
                await api.post('/notifications/mark_all_read/');
            } catch { /* silently fail for demo data */ }
        }
    };

    // Mark single as read handler
    const handleMarkRead = async (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        if (user) {
            try {
                await api.post(`/notifications/${id}/mark_read/`);
            } catch { /* silently fail */ }
        }
    };

    // Delete single notification handler
    const handleDelete = async (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
        if (user) {
            try {
                // Assuming there's a delete or we just mark read for now 
                // but let's stick to what works for 'delete' if there was one
                // Actually the API doesn't have a delete for single and we're using mark_read
                await api.post(`/notifications/${id}/mark_read/`);
            } catch { /* silently fail */ }
        }
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    // Clear all notifications with staggered animation
    const handleClearAll = async () => {
        const ids = notifications.map(n => n.id);

        // Remove one by one with a delay
        ids.forEach((id, index) => {
            setTimeout(() => {
                setNotifications(prev => prev.filter(n => n.id !== id));
            }, index * 100); // 100ms delay between each removal
        });

        if (user) {
            try {
                await api.delete('/notifications/clear_all/');
            } catch { /* silently fail */ }
        }
    };
    // ──────────────────────────────────────────────────────

    const handleUserClick = (e) => {
        e.preventDefault();
        const token = localStorage.getItem('access_token');
        if (token) {
            navigate('/dashboard');
        } else {
            navigate('/account');
        }
    };

    useEffect(() => {
        if (isDrawerOpen) {
            setShowDrawer(true);
            setAnimationClass('animate-slide-in-left');
        } else {
            setAnimationClass('animate-slide-out-left');
            const timer = setTimeout(() => {
                setShowDrawer(false);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isDrawerOpen]);

    return (
        <>
            <div className='bg-white shadow-lg px-3 py-2 sm:p-4 fixed top-0 left-0 right-0 z-40'>
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-1">
                        {/* Hamburger for mobile */}
                        <button
                            className="md:hidden cursor-pointer"
                            onClick={() => setIsDrawerOpen(true)}
                            aria-label="Open categories"
                        >
                            <FiMenu className="text-2xl text-gray-700" />
                        </button>
                        {/* Brand and Menu section */}
                        <div
                            className={`
                                flex items-center flex-shrink-0
                                md:overflow-hidden transition-all duration-300
                                ${searchFocused ? 'w-0 opacity-0 mr-0' : 'w-auto opacity-100 mr-2'}
                                md:w-auto md:opacity-100 md:mr-4
                            `}
                        >
                            <Link
                                to={'/'}
                                className="flex items-center"
                            >
                                <img src={logo} alt="Sarker Shop" className="h-10 sm:h-12 w-auto object-contain" />
                            </Link>
                        </div>
                    </div>
                    {/* Right side: Search + Icons */}
                    <div className={`flex items-center flex-1 justify-end transition-all duration-300 ${searchFocused ? 'gap-2' : 'gap-3 sm:gap-6'}`}>
                        {/* SearchBar */}
                        <div className={`
                            transition-all duration-300 flex justify-end
                            ${searchFocused ? 'flex-1 max-w-full' : 'w-10'}
                            md:flex-1 md:w-auto md:max-w-none
                        `}>
                            <SearchBar
                                onFocus={() => setSearchFocused(true)}
                                onBlur={() => setSearchFocused(false)}
                            />
                        </div>

                        {/* Menu section */}
                        <nav className='flex gap-4 sm:gap-7 items-center'>
                            <ul className='md:flex gap-7 items-center text-xl font-semibold hidden'>
                                {[
                                    { name: 'Home', path: '/' },
                                    { name: 'Store', path: '/products' },
                                    { name: 'Tracking', path: '/order-tracking' },
                                    { name: 'About', path: '/about' },
                                ].map((item) => (
                                    <NavItem key={item.path} item={item} />
                                ))}
                            </ul>
                            <button className='relative cursor-pointer' onClick={() => setIsCartOpen(true)} aria-label="Open cart">
                                <IoCartOutline className='h-8 w-8 sm:h-7 sm:w-7' />
                                <span className='bg-purple-600 px-2 rounded-full absolute -top-3 -right-3 text-white text-xs'>{totalCount}</span>
                            </button>
                            <button className='relative cursor-pointer' onClick={() => setIsNotifOpen(true)} aria-label="Open notifications">
                                <motion.div
                                    animate={bellShake ? {
                                        rotate: [0, 20, -20, 15, -15, 10, -10, 0],
                                        scale: [1, 1.2, 1.2, 1.15, 1.15, 1.1, 1.1, 1],
                                    } : { rotate: 0 }}
                                    transition={{ duration: 0.8 }}
                                    whileHover={{ rotate: 15 }}
                                >
                                    <Bell className={`h-7 w-7 sm:h-6 sm:w-6 transition-colors duration-300 ${bellShake ? 'text-purple-600' : 'text-gray-700'}`} />
                                </motion.div>
                                <AnimatePresence>
                                    {unreadCount > 0 && (
                                        <motion.span
                                            key={unreadCount}
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0 }}
                                            className='bg-red-500 px-1.5 rounded-full absolute -top-2 -right-2 text-white text-[10px] font-bold border-2 border-white'
                                        >
                                            {unreadCount}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </button>
                            <button onClick={handleUserClick} className='hidden md:flex text-neutral-900 hover:text-purple-600 transition-colors items-center cursor-pointer' aria-label="Account">
                                {(user?.avatar || user?.social_avatar_url) ? (
                                    <img src={user.avatar || user.social_avatar_url} alt="User" className="h-8 w-8 rounded-full border border-purple-200 object-cover shadow-sm" />
                                ) : (
                                    <UserLock className='h-6 w-6' />
                                )}
                            </button>
                        </nav>
                    </div>
                </div>
            </div>
            {/* Cart Panel */}
            <CartPanel open={isCartOpen} onClose={() => setIsCartOpen(false)} />
            {/* Notification Panel */}
            <NotificationPanel
                open={isNotifOpen}
                onClose={() => setIsNotifOpen(false)}
                notifications={notifications}
                onMarkAllRead={handleMarkAllRead}
                onMarkRead={handleMarkRead}
                onClearAll={handleClearAll}
                onDelete={handleDelete}
            />
            {showDrawer && (
                <div className="fixed inset-0 z-50 flex" onClick={() => setIsDrawerOpen(false)}>
                    {/* Drawer */}
                    <div className={`relative bg-white w-64 h-full shadow-lg z-50 ${animationClass} flex flex-col`} onClick={(e) => e.stopPropagation()}>
                        <button
                            className="absolute top-3 right-3 text-2xl z-10 cursor-pointer"
                            onClick={() => setIsDrawerOpen(false)}
                            aria-label="Close categories"
                        >
                            &times;
                        </button>

                        <div className="flex-1 overflow-y-auto">
                            <CategoryList onNavigate={() => setIsDrawerOpen(false)} />
                        </div>
                    </div>
                </div>
            )}
            {/* Add this animation to your CSS or Tailwind config */}
            <style>
                {`
                @keyframes slide-in-left {
                    from { transform: translateX(-100%); }
                    to { transform: translateX(0); }
                }
                .animate-slide-in-left {
                    animation: slide-in-left 0.3s cubic-bezier(0.4,0,0.2,1) both;
                }
                @keyframes slide-out-left {
                    from { transform: translateX(0); }
                    to { transform: translateX(-100%); }
                }
                .animate-slide-out-left {
                    animation: slide-out-left 0.3s cubic-bezier(0.4,0,0.2,1) both;
                }
                `}
            </style>
        </>
    )
}

export default Navbar;
