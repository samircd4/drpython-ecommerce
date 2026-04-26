import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Bell, 
    CheckCircle2, 
    Trash2, 
    Clock, 
    Info, 
    Package, 
    Tag, 
    ChevronRight,
    Search,
    Filter,
    MoreVertical,
    Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../Context/NotificationContext';
import toast from 'react-hot-toast';

const Notifications = () => {
    const navigate = useNavigate();
    const { 
        notifications, 
        loading, 
        markAsRead, 
        markAsUnread,
        markAllAsRead, 
        clearAll 
    } = useNotification();
    const [filter, setFilter] = useState('all'); 
    const [showClearConfirm, setShowClearConfirm] = useState(false);

    const handleToggleRead = async (id, isRead) => {
        if (isRead) {
            await markAsUnread(id);
        } else {
            await markAsRead(id);
        }
    };

    const handleMarkAllRead = async () => {
        await markAllAsRead();
        toast.success("Inbox cleared");
    };

    const handleClearAll = async () => {
        setShowClearConfirm(false);
        await clearAll();
        toast.success("Notifications purged");
    };

    const handleNotificationClick = async (notif) => {
        if (!notif.is_read) {
            await markAsRead(notif.id);
        }

        // 1. Check for specific order-tracking links (common in auto-generated notifications)
        const trackMatch = notif.link?.match(/\/order-tracking\/(\d+)/);
        if (trackMatch) {
            navigate(`/orders?search=${trackMatch[1]}`);
            return;
        }

        // 2. Custom link handle
        if (notif.link) {
            navigate(notif.link);
        } 
        // 3. Type-based handle
        else if (notif.type === 'order_update') {
            const orderIdMatch = notif.message.match(/#(\d+)/);
            if (orderIdMatch) {
                navigate(`/orders?search=${orderIdMatch[1]}`);
            } else {
                navigate('/orders');
            }
        } else if (notif.type === 'promotion') {
            navigate('/coupons');
        } else if (notif.type === 'system') {
            navigate('/settings');
        }
    };

    const filteredNotifs = notifications.filter(n => {
        if (filter === 'unread') return !n.is_read;
        if (filter === 'orders') return n.type === 'order_update';
        if (filter === 'promotions') return n.type === 'promotion';
        if (filter === 'system') return n.type === 'system';
        return true;
    });

    const getIcon = (type) => {
        switch (type) {
            case 'order_update': return <Package className="w-5 h-5 text-blue-400" />;
            case 'promotion': return <Tag className="w-5 h-5 text-orange-400" />;
            case 'system': return <Info className="w-5 h-5 text-purple-400" />;
            default: return <Bell className="w-5 h-5 text-slate-400" />;
        }
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
                    <h1 className="text-3xl font-black text-white tracking-tight uppercase">Intelligence Center</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
                            Manage your system alerts
                        </p>
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] font-black rounded-lg">
                            DEBUG: {notifications.length} Sync'd
                        </span>
                    </div>
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
                        className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl font-bold text-xs uppercase transition-all cursor-pointer"
                    >
                        <Trash2 className="w-4 h-4" />
                        Clear All
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar pb-2">
                {[
                    { id: 'all', label: 'All Alerts', icon: Bell },
                    { id: 'unread', label: 'Unread', icon: Clock },
                    { id: 'orders', label: 'Orders', icon: Package },
                    { id: 'promotions', label: 'Promotions', icon: Tag },
                    { id: 'system', label: 'System', icon: Info }
                ].map(f => (
                    <button
                        key={f.id}
                        onClick={() => setFilter(f.id)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all cursor-pointer shrink-0 ${
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
                {loading ? (
                    [1,2,3,4,5].map(i => (
                        <div key={i} className="h-24 bg-slate-800/20 border border-slate-800 rounded-[2rem] animate-pulse" />
                    ))
                ) : filteredNotifs.length > 0 ? (
                    <AnimatePresence initial={false}>
                        {filteredNotifs.map((notif) => (
                            <motion.div
                                key={notif.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={`group relative p-6 bg-[#0b1a2a] border border-slate-800 rounded-[2rem] transition-all hover:border-slate-700 cursor-pointer ${
                                    !notif.is_read ? 'ring-1 ring-blue-500/30' : 'opacity-70'
                                }`}
                                onClick={() => handleNotificationClick(notif)}
                            >
                                {!notif.is_read && (
                                    <div className="absolute top-6 right-6 w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                                )}

                                <div className="flex items-start gap-5">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-slate-700/50 ${
                                        !notif.is_read ? 'bg-blue-500/10 border-blue-500/20 ring-4 ring-blue-500/5' : 'bg-slate-800/50'
                                    }`}>
                                        {getIcon(notif.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className={`text-lg font-black tracking-tight ${
                                                !notif.is_read ? 'text-white' : 'text-slate-400'
                                            }`}>
                                                {notif.title}
                                            </h3>
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">
                                                {formatTime(notif.created_at)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-400 leading-relaxed mb-4">
                                            {notif.message}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 bg-slate-900/50 px-3 py-1 rounded-lg">
                                                    #{notif.id} • {notif.type.replace('_', ' ')}
                                                </span>
                                            </div>
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
                        <div className="w-24 h-24 bg-slate-900 rounded-[2.5rem] flex items-center justify-center mb-6 border border-slate-800/50 relative">
                            <Bell className="w-10 h-10 text-slate-700" />
                            <motion.div 
                                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                                transition={{ duration: 4, repeat: Infinity }}
                                className="absolute inset-0 bg-blue-500/5 rounded-[2.5rem]"
                            />
                        </div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Omniscient Inbox Empty</h3>
                        <p className="text-slate-500 text-sm max-w-xs mx-auto font-medium">No system alerts detected at this moment. You are completely up to date.</p>
                    </div>
                )}
            </div>

            {/* Custom Clear Confirmation Overlay */}
            <AnimatePresence>
                {showClearConfirm && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowClearConfirm(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-sm bg-[#0b1a2a] border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl shadow-red-500/10"
                        >
                            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 border border-red-500/20">
                                <Trash2 className="w-8 h-8 text-red-500" />
                            </div>
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Purge Intelligence?</h2>
                            <p className="text-slate-400 text-sm leading-relaxed mb-8">
                                You are about to erase all notifications from the system. This action cannot be undone. Are you sure?
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setShowClearConfirm(false)}
                                    className="py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-xs uppercase tracking-widest rounded-2xl transition-all cursor-pointer"
                                >
                                    Keep Them
                                </button>
                                <button
                                    onClick={handleClearAll}
                                    className="py-4 bg-red-500 hover:bg-red-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-red-500/20 transition-all cursor-pointer"
                                >
                                    Delete Now
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Notifications;
