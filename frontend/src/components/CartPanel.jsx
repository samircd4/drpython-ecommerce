import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { X, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { useCart, fixImage } from '../context/CartContext.jsx';
import EmptyCart from './cart/EmptyCart';
import TakaIcon from './TakaIcon';

const CartPanel = ({ open, onClose }) => {
    const { cartItem, updateQuantity, deleteItem } = useCart();
    const navigate = useNavigate();

    useEffect(() => {
        if (open) {
            document.documentElement.style.overflow = 'hidden';
        } else {
            document.documentElement.style.overflow = '';
        }
        return () => {
            document.documentElement.style.overflow = '';
        };
    }, [open]);

    const subtotal = cartItem.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);

    if (typeof document === 'undefined') return null;

    return ReactDOM.createPortal(
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[70]"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[80] flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0">
                            <div>
                                <h2 className="text-xl font-black text-gray-900 flex items-center gap-2 uppercase tracking-tight">
                                    Your Cart
                                    <span className="bg-purple-100 text-purple-600 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-black">
                                        {cartItem.length} Items
                                    </span>
                                </h2>
                                <p className="text-sm text-gray-400 font-medium">Review your items before checkout</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-purple-100 rounded-xl transition-colors text-purple-600 cursor-pointer"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
                            {cartItem.length > 0 ? (
                                <AnimatePresence initial={false}>
                                    {cartItem.map((item, index) => (
                                        <motion.div
                                            key={`${item.id}:${item.variant?.id ?? "base"}`}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
                                        >
                                            <div className="flex gap-4">
                                                <div className="w-20 h-20 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 shrink-0">
                                                    <img
                                                        src={fixImage(item.image)}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0 flex flex-col justify-between">
                                                    <div>
                                                        <div className="flex justify-between items-start gap-2">
                                                            <h3 className="text-sm font-bold text-gray-900 truncate group-hover:text-purple-600 transition-colors">
                                                                <Link to={`/products/${item.slug}`} onClick={onClose}>
                                                                    {item.name}
                                                                </Link>
                                                            </h3>
                                                            <button 
                                                                onClick={() => deleteItem(item.id, item.variant?.id ?? null)}
                                                                className="text-gray-300 hover:text-red-500 transition-colors cursor-pointer"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                        {item.variant && (
                                                            <p className="text-[10px] text-purple-600 font-bold uppercase tracking-wider mt-1">
                                                                {item.variant.color} {item.variant.ram && `• ${item.variant.ram}GB`} {item.variant.storage && `/ ${item.variant.storage}GB`}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center justify-between mt-2">
                                                        <span className="text-sm font-black text-gray-900 flex items-center">
                                                            <TakaIcon size={12} />
                                                            {Number(item.price).toLocaleString()}
                                                        </span>
                                                        <div className="flex items-center bg-gray-100 rounded-lg p-1">
                                                            <button 
                                                                onClick={() => updateQuantity(item.id, "decrease", undefined, item.variant?.id ?? null)}
                                                                className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-purple-600 font-bold transition-colors cursor-pointer"
                                                            >
                                                                −
                                                            </button>
                                                            <span className="w-8 text-center text-xs font-black text-gray-900">{item.quantity}</span>
                                                            <button 
                                                                onClick={() => updateQuantity(item.id, "increase", undefined, item.variant?.id ?? null)}
                                                                className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-purple-600 font-bold transition-colors cursor-pointer"
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center p-8 opacity-40">
                                    <ShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
                                    <p className="text-gray-500 font-bold">Your cart is empty</p>
                                    <button onClick={onClose} className="mt-4 text-purple-600 text-sm font-black uppercase tracking-widest hover:underline">
                                        Start Shopping
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {cartItem.length > 0 && (
                            <div className="p-6 border-t border-gray-100 bg-white">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-gray-500 font-bold uppercase tracking-widest text-xs">Total Amount</span>
                                    <span className="text-2xl font-black text-gray-900 flex items-center gap-1">
                                        <TakaIcon size={20} />
                                        {Number(subtotal).toLocaleString()}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => { onClose(); navigate('/cart'); }}
                                        className="py-4 border border-gray-200 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer"
                                    >
                                        View Cart
                                    </button>
                                    <button
                                        onClick={() => { onClose(); navigate('/checkout'); }}
                                        className="py-4 bg-purple-600 rounded-2xl text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-purple-600/20 hover:bg-purple-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        Checkout
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default CartPanel;
