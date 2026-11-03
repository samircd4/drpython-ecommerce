import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell,
    CheckCircle2,
    Trash2,
    Clock,
    Package,
    CreditCard,
    Boxes,
    Star,
    Info,
    ChevronRight,
    Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../Context/NotificationContext';
import useNotificationListener from '../hooks/useNotificationListener';
import NotificationIcon from '../components/Layout/NotificationIcon';
import { getNotificationLabel, openNotificationTarget } from '../components/Layout/notificationMeta';
import ConfirmModal from '../components/Layout/ConfirmModal';
import Pagination from '../components/Layout/Pagination';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';

const PAGE_SIZE = 20;

const FILTERS = [
    { id: 'all', label: 'All', icon: Bell, params: {} },
    { id: 'unread', label: 'Unread', icon: Clock, params: { is_read: false } },
    { id: 'orders', label: 'Orders', icon: Package, params: { type__in: 'new_order,order_update' } },
    { id: 'payments', label: 'Payments', icon: CreditCard, params: { type: 'payment' } },
    { id: 'stock', label: 'Stock', icon: Boxes, params: { type: 'stock' } },
    { id: 'reviews', label: 'Reviews', icon: Star, params: { type: 'review' } },
    { id: 'system', label: 'System', icon: Info, params: { type__in: 'system,promotion,message' } },
];

const Notifications = () => {
    const navigate = useNavigate();
    const { markAsRead, markAsUnread, markAllAsRead, clearAll } = useNotification();
    const [filter, setFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [items, setItems] = useState([]);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false);

    const fetchPage = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, ...FILTERS.find(f => f.id === filter).params };
            const res = await api.get('/notifications/', { params });
            setItems(res.data?.results || []);
            setCount(res.data?.count || 0);
        } catch (err) {
            console.error("Failed to load notifications", err);
            toast.error("Could not load notifications");
        } finally {
            setLoading(false);
        }
    }, [page, filter]);

    useEffect(() => {
        fetchPage();
    }, [fetchPage]);

    // New notifications only appear on the first page
    useNotificationListener(() => {
        if (page === 1) fetchPage();
    });

    const setItemRead = (id, isRead) => {
        setItems(prev => prev.map(n => n.id === id ? { ...n, is_read: isRead } : n));
    };

    const handleToggleRead = async (id, isRead) => {
        if (isRead) {
            await markAsUnread(id);
        } else {
            await markAsRead(id);
        }
        setItemRead(id, !isRead);
    };

    const handleMarkAllRead = async () => {
        await markAllAsRead();
        setItems(prev => prev.map(n => ({ ...n, is_read: true })));
        toast.success("All notifications marked as read");
    };

    const handleClearAll = async () => {
        await clearAll();
        setShowClearConfirm(false);
        setItems([]);
        setCount(0);
        setPage(1);
        toast.success("Notifications cleared");
    };

    const handleNotificationClick = async (notif) => {
        if (!notif.is_read) {
            await markAsRead(notif.id);
            setItemRead(notif.id, true);
        }
        openNotificationTarget(notif, navigate);
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="p-4 sm:p-8 max-w-5xl mx-auto min-h-screen">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Notifications</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        {count} {count === 1 ? 'notification' : 'notifications'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleMarkAllRead}
                        className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs uppercase transition-all border border-slate-700/50 cursor-pointer"
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        Mark All Read
                    </button>
                    <button
                        onClick={() => setShowClearConfirm(true)}
                        disabled={count === 0}
                        className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl font-bold text-xs uppercase transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Trash2 className="w-4 h-4" />
                        Clear All
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar pb-2">
                {FILTERS.map(f => (
                    <button
                        key={f.id}
                        onClick={() => { setFilter(f.id); setPage(1); }}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
                            filter === f.id
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                            : 'bg-slate-800/40 text-slate-500 hover:text-slate-300 border border-slate-800'
                        }`}
                    >
                        <f.icon className="w-3.5 h-3.5" />
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Notification List */}
            <div className="space-y-3">
                {loading && items.length === 0 ? (
                    [1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-24 bg-slate-800/20 border border-slate-800 rounded-2xl animate-pulse" />
                    ))
                ) : items.length > 0 ? (
                    <AnimatePresence initial={false}>
                        {items.map((notif) => (
                            <motion.div
                                key={notif.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={`group relative p-6 bg-[#0b1a2a] border border-slate-800 rounded-2xl transition-all hover:border-slate-700 cursor-pointer ${
                                    !notif.is_read ? 'ring-1 ring-blue-500/30' : 'opacity-70'
                                }`}
                                onClick={() => handleNotificationClick(notif)}
                            >
                                {!notif.is_read && (
                                    <div className="absolute top-6 right-6 w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                                )}

                                <div className="flex items-start gap-5">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-slate-700/50 ${
                                        !notif.is_read ? 'bg-blue-500/10 border-blue-500/20' : 'bg-slate-800/50'
                                    }`}>
                                        <NotificationIcon type={notif.type} className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-4 mb-1 pr-6">
                                            <h3 className={`text-base font-bold tracking-tight ${
                                                !notif.is_read ? 'text-white' : 'text-slate-400'
                                            }`}>
                                                {notif.title}
                                            </h3>
                                            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                                                {formatTime(notif.created_at)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-400 leading-relaxed mb-4">
                                            {notif.message}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-900/50 px-3 py-1 rounded-lg">
                                                {getNotificationLabel(notif.type)}
                                            </span>
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleToggleRead(notif.id, notif.is_read);
                                                    }}
                                                    className={`p-2 rounded-xl transition-colors cursor-pointer ${
                                                        notif.is_read
                                                        ? 'hover:bg-amber-500/10 text-amber-500'
                                                        : 'hover:bg-blue-500/10 text-blue-400'
                                                    }`}
                                                    title={notif.is_read ? "Mark as unread" : "Mark as read"}
                                                >
                                                    {notif.is_read ? <Clock className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                                                </button>
                                                <div className="p-2 text-slate-500">
                                                    <ChevronRight className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                ) : (
                    <div className="py-24 flex flex-col items-center justify-center text-center px-8">
                        <div className="w-20 h-20 bg-slate-900 rounded-2xl flex items-center justify-center mb-6 border border-slate-800/50">
                            <Bell className="w-10 h-10 text-slate-700" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No notifications</h3>
                        <p className="text-slate-500 text-sm max-w-xs mx-auto">You're all caught up.</p>
                    </div>
                )}
            </div>

            <div className="mt-6">
                <Pagination page={page} setPage={setPage} total={Math.ceil(count / PAGE_SIZE)} />
            </div>

            <ConfirmModal
                isOpen={showClearConfirm}
                onClose={() => setShowClearConfirm(false)}
                onConfirm={handleClearAll}
                title="Clear all notifications?"
                message="This removes all of your notifications. It cannot be undone."
                confirmText="CLEAR ALL"
            />
        </div>
    );
};

export default Notifications;
