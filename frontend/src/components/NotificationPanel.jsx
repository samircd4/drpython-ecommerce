import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Package, Tag, Info, CheckCircle2 } from 'lucide-react';

const NotificationPanel = ({ open, onClose, notifications }) => {
    const getIcon = (type) => {
        switch (type) {
            case 'order_update': return <Package className="w-5 h-5 text-blue-500" />;
            case 'promotion': return <Tag className="w-5 h-5 text-orange-500" />;
            case 'system': return <Info className="w-5 h-5 text-purple-500" />;
            default: return <Bell className="w-5 h-5 text-gray-500" />;
        }
    };

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-[70] flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0">
                            <div>
                                <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                                    Notifications
                                    <span className="bg-purple-100 text-purple-600 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-black">
                                        Beta
                                    </span>
                                    <span className="bg-gray-100 text-gray-400 text-[10px] px-2 py-0.5 rounded-full">
                                        {notifications.filter(n => !n.is_read).length} New
                                    </span>
                                </h2>
                                <p className="text-sm text-gray-400 font-medium">Stay updated with Sarker Shop</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-purple-100 rounded-xl transition-colors text-purple-600 hover:text-purple-600 cursor-pointer"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {notifications.length > 0 ? (
                                notifications.map((notif) => (
                                    <motion.div
                                        key={notif.id}
                                        whileHover={{ x: 4 }}
                                        className={`p-4 rounded-[1.25rem] border transition-all relative overflow-hidden group ${notif.is_read
                                            ? 'bg-gray-50/50 border-gray-100 opacity-70'
                                            : 'bg-white border-purple-100 shadow-sm shadow-purple-900/5 hover:border-purple-300'
                                            }`}
                                    >
                                        {!notif.is_read && (
                                            <div className="absolute top-0 right-0 w-1.5 h-full bg-purple-500" />
                                        )}

                                        <div className="flex gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${notif.is_read ? 'bg-gray-100' : 'bg-purple-50'
                                                }`}>
                                                {getIcon(notif.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h3 className={`text-sm font-bold truncate ${notif.is_read ? 'text-gray-600' : 'text-gray-900'
                                                        }`}>
                                                        {notif.title}
                                                    </h3>
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap ml-2">
                                                        {notif.time}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 leading-relaxed font-medium">
                                                    {notif.message}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                        <Bell className="w-8 h-8 text-gray-200" />
                                    </div>
                                    <h3 className="text-gray-900 font-bold mb-1">No notifications yet</h3>
                                    <p className="text-gray-400 text-sm">We'll let you know when something happens.</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                            <button className="w-full py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:text-purple-600 hover:border-purple-200 transition-all flex items-center justify-center gap-2">
                                <CheckCircle2 className="w-4 h-4" />
                                Mark all as read
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default NotificationPanel;
