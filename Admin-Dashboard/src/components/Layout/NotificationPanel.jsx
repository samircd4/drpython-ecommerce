import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCircle2, Trash2, Clock, Info, Package, Tag, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotificationPanel = ({ open, onClose, notifications = [], onMarkRead, onMarkAllRead, onClearAll }) => {
    const navigate = useNavigate();

    const getIcon = (type) => {
        switch (type) {
            case 'order_update': return <Package className="w-4 h-4 text-blue-400" />;
            case 'promotion': return <Tag className="w-4 h-4 text-orange-400" />;
            case 'system': return <Info className="w-4 h-4 text-purple-400" />;
            default: return <Bell className="w-4 h-4 text-slate-400" />;
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'NOW';
        if (diffInMinutes < 60) return `${diffInMinutes}M`;
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}H`;
        
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays}D`;
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Mobile backdrop overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99] sm:hidden"
                    />

                    {/* Panel - fixed fullscreen on mobile, absolute dropdown on desktop */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="fixed inset-x-3 top-16 bottom-auto sm:absolute sm:inset-auto sm:top-14 sm:right-0 sm:w-[400px] bg-[#071229] text-white rounded-2xl shadow-2xl border border-slate-800 z-[100] overflow-hidden flex flex-col max-h-[80vh] sm:max-h-[560px]"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#0b1a2a]">
                            <div>
                                <h2 className="text-lg font-bold flex items-center gap-2">
                                    Notifications
                                    {unreadCount > 0 && (
                                        <span className="bg-purple-600/20 text-purple-400 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-black">
                                            {unreadCount} New
                                        </span>
                                    )}
                                </h2>
                            </div>
                            <div className="flex items-center gap-1">
                                <button 
                                    onClick={onMarkAllRead}
                                    title="Mark all as read"
                                    className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 cursor-pointer"
                                >
                                    <CheckCircle2 className="w-5 h-5" />
                                </button>
                                <button 
                                    onClick={onClose}
                                    className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 cursor-pointer sm:hidden"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                                <button className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 cursor-pointer hidden sm:block">
                                    <Settings className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                            {notifications.length > 0 ? (
                                <div className="divide-y divide-slate-800/50">
                                    <AnimatePresence initial={false}>
                                        {notifications.map((notif) => (
                                            <motion.div
                                                key={notif.id}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20, height: 0 }}
                                                onClick={async () => {
                                                    if (!notif.is_read && onMarkRead) {
                                                        await onMarkRead(notif.id);
                                                    }
                                                    // Redirection logic
                                                    if (notif.link) {
                                                        navigate(notif.link);
                                                        onClose();
                                                    } else if (notif.type === 'order_update' && notif.order_id) {
                                                        navigate(`/orders?search=${notif.order_id}`);
                                                        onClose();
                                                    }
                                                }}
                                                className={`p-4 transition-colors relative group cursor-pointer hover:bg-white/5 ${
                                                    !notif.is_read ? 'bg-purple-600/5' : ''
                                                }`}
                                            >
                                                {!notif.is_read && (
                                                    <div className="absolute top-0 right-0 w-1 h-full bg-purple-600" />
                                                )}

                                                <div className="flex gap-3 sm:gap-4">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-slate-700/50 ${
                                                        notif.is_read ? 'bg-slate-800/50' : 'bg-purple-600/10 border-purple-500/20'
                                                    }`}>
                                                        {getIcon(notif.type)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-start mb-0.5">
                                                            <h3 className={`text-sm font-bold truncate pr-4 sm:pr-6 ${
                                                                notif.is_read ? 'text-slate-400' : 'text-slate-100'
                                                            }`}>
                                                                {notif.title}
                                                            </h3>
                                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap pt-1">
                                                                {formatTime(notif.time || notif.created_at)}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                                                            {notif.message}
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <div className="py-20 flex flex-col items-center justify-center text-center px-8 opacity-50">
                                    <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-4 border border-slate-800">
                                        <Bell className="w-8 h-8 text-slate-700" />
                                    </div>
                                    <h3 className="text-slate-300 font-bold mb-1">No notifications yet</h3>
                                    <p className="text-slate-500 text-sm">We'll let you know when something happens.</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-[#0b1a2a] flex gap-2 border-t border-slate-800">
                            <button
                                onClick={onClearAll}
                                disabled={notifications.length === 0}
                                className="flex-1 py-3 bg-red-600/10 hover:bg-red-600/20 text-red-500 text-xs font-black rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer uppercase tracking-widest"
                            >
                                <Trash2 className="w-4 h-4" />
                                Clear All
                            </button>
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-black rounded-xl transition-all cursor-pointer uppercase tracking-widest"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default NotificationPanel;
