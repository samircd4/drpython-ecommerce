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
import notificationsData from '../data/notifications.json'
import axios from 'axios';
import { motion } from 'framer-motion';

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
    const [showDrawer, setShowDrawer] = useState(false); // New state for controlling drawer visibility
    const [animationClass, setAnimationClass] = useState(''); // New state for animation class
    const [searchFocused, setSearchFocused] = useState(false); // NEW
    const [isNotifOpen, setIsNotifOpen] = useState(false); // NEW
    const { cartItem, isCartOpen, setIsCartOpen } = useCart();
    const { user } = useUser();
    const navigate = useNavigate();
    const location = useLocation();
    const totalCount = cartItem.reduce((sum, item) => sum + (item.quantity || 0), 0);

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
            }, 300); // Duration of slide-out animation
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
                                <IoCartOutline className='h-7 w-7' />
                                <span className='bg-purple-600 px-2 rounded-full absolute -top-3 -right-3 text-white text-xs'>{totalCount}</span>
                            </button>
                            <button className='relative cursor-pointer' onClick={() => setIsNotifOpen(true)} aria-label="Open notifications">
                                <motion.div whileHover={{ rotate: 15 }}>
                                    <Bell className='h-6 w-6 text-gray-700' />
                                </motion.div>
                                <span className='bg-red-500 px-1.5 rounded-full absolute -top-2 -right-2 text-white text-[10px] font-bold border-2 border-white'>
                                    {notificationsData.filter(n => !n.is_read).length}
                                </span>
                            </button>
                            <button onClick={handleUserClick} className='text-neutral-900 hover:text-purple-600 transition-colors flex items-center cursor-pointer' aria-label="Account">
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
                notifications={notificationsData}
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
                            <CategoryList onNavigate={() => setDrawerOpen(false)} />
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
