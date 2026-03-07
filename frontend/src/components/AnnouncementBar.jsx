import React from 'react';
import { motion } from 'framer-motion';
import { FaRocket } from 'react-icons/fa';

const AnnouncementBar = () => {
    return (
        <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white py-2 px-4 relative z-50 overflow-hidden shadow-lg border-b border-white/10"
        >
            {/* Animated Shine Effect */}
            <motion.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 w-1/2 h-full pointer-events-none"
            />

            <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 sm:gap-3 text-[11px] min-[380px]:text-sm sm:text-base font-bold tracking-tight">
                <motion.div
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-yellow-400"
                >
                    <FaRocket className="h-4 w-4 sm:h-5 sm:w-5" />
                </motion.div>

                <p className="flex items-center gap-2 text-center break-words leading-tight max-w-[80vw] sm:max-w-none">
                    <span className="hidden sm:inline">Exciting News:</span>
                    Our full-featured website will be
                    <span className="px-2 py-0.5 bg-yellow-400 text-purple-900 rounded-md animate-pulse">
                        LIVE SOON
                    </span>
                    <span className="hidden sm:inline">— Stay tuned for amazing deals!</span>
                </p>

                <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="hidden md:block"
                >
                    🚀
                </motion.div>
            </div>
        </motion.div>
    );
};

export default AnnouncementBar;
