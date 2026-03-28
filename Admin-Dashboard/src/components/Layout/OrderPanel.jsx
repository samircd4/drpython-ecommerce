import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, ChevronRight, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OrderPanel = ({ open, onClose, orders, onOrderClick }) => {
    const navigate = useNavigate();

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'JUST NOW';
        if (diffInMinutes < 60) return `${diffInMinutes}M AGO`;
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}H AGO`;
        
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays}D AGO`;
    };

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
                        className="fixed inset-x-3 top-16 bottom-auto sm:absolute sm:inset-auto sm:top-14 sm:right-0 sm:w-[380px] bg-[#071229] text-white rounded-2xl shadow-2xl border border-slate-800 z-[100] overflow-hidden flex flex-col max-h-[80vh] sm:max-h-[560px]"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#0b1a2a]">
                            <h2 className="text-lg font-bold flex items-center gap-2 uppercase tracking-tight">
                                Recent Orders
                                <span className="bg-blue-600/20 text-blue-400 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-black">
                                    {orders.length}
                                </span>
                            </h2>
                            <button 
                                onClick={onClose}
                                className="p-1 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                            {orders.length > 0 ? (
                                <div className="divide-y divide-slate-800/50">
                                    {orders.map((order) => (
                                        <div 
                                            key={order.id}
                                            onClick={() => onOrderClick(order, 'view')}
                                            className="p-4 hover:bg-white/5 transition-all cursor-pointer group relative"
                                        >
                                            <div className="flex items-start gap-4">
                                                {/* Stacked Product Images */}
                                                <div className="relative w-12 h-12 shrink-0">
                                                    {order.items?.slice(0, 3).map((item, idx) => (
                                                        <div 
                                                            key={idx}
                                                            className="absolute top-0 left-0 w-10 h-10 rounded-lg border-2 border-[#071229] overflow-hidden bg-slate-800 shadow-lg transition-transform group-hover:translate-x-1"
                                                            style={{ 
                                                                zIndex: 10 - idx,
                                                                transform: `translateX(${idx * 6}px) translateY(${idx * 4}px)`,
                                                                opacity: 1 - (idx * 0.2)
                                                            }}
                                                        >
                                                            <img 
                                                                src={item.product?.image || '/placeholder-product.png'} 
                                                                alt="" 
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                    ))}
                                                    {order.items?.length > 3 && (
                                                        <div className="absolute -bottom-1 -right-1 bg-blue-600 text-[8px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#071229] z-20">
                                                            +{order.items.length - 3}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Order Details */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start mb-0.5">
                                                        <h3 className="text-sm font-bold text-slate-100 truncate pr-4 uppercase tracking-tight">
                                                            {order.full_name}
                                                        </h3>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1 whitespace-nowrap">
                                                                <Clock className="w-2.5 h-2.5" />
                                                                {formatTime(order.created_at)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-[10px] font-mono text-blue-400 font-bold">#{order.id}</span>
                                                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-tighter ${
                                                            order.status === 'Delivered' ? 'bg-emerald-500/10 text-emerald-400' :
                                                            order.status === 'Cancelled' ? 'bg-red-500/10 text-red-400' :
                                                            'bg-amber-500/10 text-amber-400'
                                                        }`}>
                                                            {order.status}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-xs text-slate-400 truncate max-w-[120px] sm:max-w-[150px]">
                                                            {order.items?.map(i => i.product?.name).join(', ')}
                                                        </p>
                                                        <span className="text-sm font-black text-white">৳{order.grand_total}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-20 flex flex-col items-center justify-center text-center px-8 opacity-50">
                                    <ShoppingBag className="w-12 h-12 text-slate-700 mb-4" />
                                    <h3 className="text-slate-300 font-bold mb-1">No orders yet</h3>
                                    <p className="text-slate-500 text-xs">Waiting for your first sale!</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-slate-800 bg-[#0b1a2a]">
                            <button 
                                onClick={() => {
                                    navigate('/orders');
                                    onClose();
                                }}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 cursor-pointer uppercase tracking-widest"
                            >
                                View All Orders
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default OrderPanel;
