import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus,
    X,
    Box,
    Tag,
    Layers,
    ShoppingBag,
    CreditCard,
    Users,
    Ticket
} from "lucide-react";
import { useModals } from "../../Context/ModalContext";

const fabItems = [
    { id: 'product', label: 'Product', icon: Box, color: 'text-blue-400', path: '/products/new' },
    { id: 'brand', label: 'Brand', icon: Tag, color: 'text-purple-400', modal: 'brand' },
    { id: 'category', label: 'Category', icon: Layers, color: 'text-emerald-400', modal: 'category' },
    { id: 'order', label: 'Order', icon: ShoppingBag, color: 'text-amber-400', path: '/orders/new' },
    { id: 'payment', label: 'Payment', icon: CreditCard, color: 'text-green-400', path: '/payments/new' },
    { id: 'customer', label: 'Customer', icon: Users, color: 'text-pink-400', path: '/customers/new' },
    { id: 'coupon', label: 'Coupon', icon: Ticket, color: 'text-yellow-400', path: '/coupons' },
];

const MobileFAB = () => {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const { openModal } = useModals();
    const fabRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (fabRef.current && !fabRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleItemClick = (item) => {
        setOpen(false);
        if (item.modal) {
            openModal(item.modal);
        } else if (item.path) {
            navigate(item.path);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50" ref={fabRef}>
            {/* Menu Items */}
            <AnimatePresence>
                {open && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                            onClick={() => setOpen(false)}
                        />

                        {/* Menu */}
                        <div className="absolute bottom-16 right-0 z-50 flex flex-col gap-2 items-end">
                            {fabItems.map((item, index) => (
                                <motion.button
                                    key={item.id}
                                    initial={{ opacity: 0, x: 40, scale: 0.8 }}
                                    animate={{
                                        opacity: 1,
                                        x: 0,
                                        scale: 1,
                                        transition: { delay: index * 0.04, type: "spring", stiffness: 300, damping: 20 }
                                    }}
                                    exit={{
                                        opacity: 0,
                                        x: 40,
                                        scale: 0.8,
                                        transition: { delay: (fabItems.length - index) * 0.03 }
                                    }}
                                    onClick={() => handleItemClick(item)}
                                    className="flex items-center gap-3 px-4 py-3 bg-[#0b1a2a] border border-slate-700/50 rounded-xl shadow-2xl cursor-pointer group hover:bg-slate-800 transition-colors min-w-[160px]"
                                >
                                    <item.icon className={`w-5 h-5 ${item.color}`} />
                                    <span className="text-sm font-semibold text-slate-200 whitespace-nowrap">
                                        {item.label}
                                    </span>
                                </motion.button>
                            ))}
                        </div>
                    </>
                )}
            </AnimatePresence>

            {/* FAB Button */}
            <motion.button
                onClick={() => setOpen(!open)}
                whileTap={{ scale: 0.9 }}
                className="relative z-50 w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/30 flex items-center justify-center cursor-pointer border-2 border-blue-500/30"
            >
                <motion.div
                    animate={{ rotate: open ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {open ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                </motion.div>

                {/* Pulse ring */}
                {!open && (
                    <span className="absolute inset-0 rounded-full bg-blue-500/30 animate-ping pointer-events-none" />
                )}
            </motion.button>
        </div>
    );
};

export default MobileFAB;
