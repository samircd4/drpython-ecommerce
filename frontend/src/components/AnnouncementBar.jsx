import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRocket, FaGift, FaTrophy, FaStar, FaMobileAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';

const offers = [
    {
        icon: <FaMobileAlt className="text-yellow-400" />,
        text: "৳500–৳1,000 OFF on Smartphones | Use Coupon Code: SAVE500 / SAVE700 / SAVE1000"
    },
    {
        icon: <FaGift className="text-yellow-400" />,
        text: "First 100 Orders Get FREE Gift — Hurry up, limited offer!"
    },
    {
        icon: <FaTrophy className="text-yellow-400" />,
        text: "First 10 Customers Get EXTRA Reward — Limited Offer!"
    },
    {
        icon: <FaStar className="text-yellow-400" />,
        text: "Get ৳300 OFF on Your First Order | Use Coupon Code: WELCOME300",
        badge: "NEW"
    }
];

const AnnouncementBar = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % offers.length);
        }, 4000); // Change offer every 4 seconds

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white py-2 px-4 relative z-50 overflow-hidden shadow-lg border-b border-white/10 h-10 sm:h-12 flex items-center">
            {/* Animated Shine Effect */}
            <motion.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 w-1/2 h-full pointer-events-none"
            />

            <div className="max-w-7xl mx-auto w-full relative h-full flex items-center justify-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className="flex items-center justify-center gap-2 sm:gap-3 text-[11px] min-[380px]:text-sm sm:text-base font-bold tracking-tight w-full"
                    >
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            {offers[currentIndex].icon}
                        </motion.div>

                        <div className="flex items-center gap-2 text-center break-words leading-tight max-w-[85vw] sm:max-w-none">
                            {offers[currentIndex].badge && (
                                <span className="px-1.5 py-0.5 bg-yellow-400 text-purple-900 text-[10px] rounded font-black animate-pulse whitespace-nowrap">
                                    {offers[currentIndex].badge}
                                </span>
                            )}
                            <div className="flex flex-wrap justify-center items-center gap-x-1">
                                {offers[currentIndex].text.split(/(\bSAVE\d+\b|\bWELCOME\d+\b)/g).map((part, index) => {
                                    if (part.match(/^(SAVE\d+|WELCOME\d+)$/)) {
                                        return (
                                            <button
                                                key={index}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigator.clipboard.writeText(part);
                                                    toast.success(`Coupon "${part}" copied!`, {
                                                        position: "top-center",
                                                        autoClose: 1500,
                                                        className: "text-xs font-bold"
                                                    });
                                                }}
                                                className="cursor-pointer bg-white/20 hover:bg-white/40 px-1.5 py-0.5 rounded border border-white/30 transition-all active:scale-95 flex items-center gap-1 font-black text-yellow-300 mx-0.5"
                                                title="Click to copy"
                                            >
                                                {part}
                                            </button>
                                        );
                                    }
                                    return <span key={index}>{part}</span>;
                                })}
                            </div>
                        </div>

                        <motion.div
                            animate={{ x: [0, 5, 0] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="hidden md:block"
                        >
                            🚀
                        </motion.div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AnnouncementBar;
