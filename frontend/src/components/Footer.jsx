import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaFacebookF, FaTiktok, FaInstagram, FaLinkedinIn, FaYoutube,
    FaHeadset, FaPhoneAlt, FaMapMarkerAlt
} from "react-icons/fa";
import api from "../api/client";
import { toast } from "react-toastify";
import SupportChat from "./SupportChat";
import { useCart } from "../context/CartContext";

import logo from "../assets/logo_footer.png";

const Footer = () => {
    const [chatOpen, setChatOpen] = useState(false);
    const { isCartOpen, isFilterOpen, isCategoryOpen, isDrawerOpen } = useCart();

    const sectionVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubscribe = async (e) => {
        e.preventDefault();
        if (!email) return;
        setLoading(true);
        try {
            const response = await api.post('/subscribe/', { email });
            // API returns 201 for new, 200 for existing
            toast.success(response.data.detail || "Subscribed successfully!");
            setEmail("");
        } catch (error) {
            toast.error("Subscription failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <footer className="relative bg-[#020617] text-white overflow-hidden border-t border-white/5 pb-6 md:pb-6">
                {/* Dynamic Background Elements */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]" />
                </div>

                <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">

                        {/* 1. Brand Identity Card */}
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={sectionVariants}
                            className="space-y-8 text-center md:text-left"
                        >
                            <div className="inline-block md:block">
                                <Link to="/">
                                    <img src={logo} alt="Sarker Shop" className="h-12 w-auto mx-auto md:mx-0 object-contain mb-4" />
                                </Link>
                                <p className="text-gray-400 leading-relaxed max-w-sm mx-auto md:mx-0 font-medium italic">
                                    "Elevating your digital lifestyle with premium tech and unparalleled service."
                                </p>
                            </div>

                            <div className="flex flex-col gap-4 max-w-xs mx-auto md:mx-0">
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-4 group hover:bg-white/10 transition-all duration-300">
                                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                                        <FaMapMarkerAlt />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Location</p>
                                        <p className="text-sm font-semibold">Islami Super Market, Kishoreganj</p>
                                    </div>
                                </div>
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-4 group hover:bg-white/10 transition-all duration-300">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                                        <FaPhoneAlt />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Hotline</p>
                                        <a href="tel:+8801781355377" className="text-sm font-semibold">+880 1708 601002</a>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* 2. Navigation Clusters */}
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={sectionVariants}
                            transition={{ delay: 0.1 }}
                            className="space-y-8"
                        >
                            <h3 className="text-xs uppercase tracking-[0.3em] text-purple-400 font-black text-center md:text-left">Discovery</h3>
                            <ul className="grid grid-cols-2 md:grid-cols-1 gap-4 text-center md:text-left">
                                <li>
                                    <Link to="/" className="text-gray-400 hover:text-white transition-all duration-300 text-sm font-bold flex items-center justify-center md:justify-start gap-2 group">
                                        <span className="w-0 group-hover:w-2 h-[1px] bg-purple-500 transition-all"></span>
                                        Home
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/products" className="text-gray-400 hover:text-white transition-all duration-300 text-sm font-bold flex items-center justify-center md:justify-start gap-2 group">
                                        <span className="w-0 group-hover:w-2 h-[1px] bg-purple-500 transition-all"></span>
                                        Products
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/about" className="text-gray-400 hover:text-white transition-all duration-300 text-sm font-bold flex items-center justify-center md:justify-start gap-2 group">
                                        <span className="w-0 group-hover:w-2 h-[1px] bg-purple-500 transition-all"></span>
                                        About Us
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/contact" className="text-gray-400 hover:text-white transition-all duration-300 text-sm font-bold flex items-center justify-center md:justify-start gap-2 group">
                                        <span className="w-0 group-hover:w-2 h-[1px] bg-purple-500 transition-all"></span>
                                        Contact Us
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/team" className="text-gray-400 hover:text-white transition-all duration-300 text-sm font-bold flex items-center justify-center md:justify-start gap-2 group">
                                        <span className="w-0 group-hover:w-2 h-[1px] bg-purple-500 transition-all"></span>
                                        Our Team
                                    </Link>
                                </li>
                            </ul>

                        </motion.div>

                        {/* 3. Support Ecosystem */}
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={sectionVariants}
                            transition={{ delay: 0.2 }}
                            className="space-y-8"
                        >
                            <h3 className="text-xs uppercase tracking-[0.3em] text-indigo-400 font-black text-center md:text-left">Essentials</h3>
                            <ul className="grid grid-cols-2 md:grid-cols-1 gap-4 text-center md:text-left">
                                <li>
                                    <Link to="/order-tracking" className="text-gray-400 hover:text-white transition-all duration-300 text-sm font-bold flex items-center justify-center md:justify-start gap-2 group">
                                        <span className="w-0 group-hover:w-2 h-[1px] bg-indigo-500 transition-all"></span>
                                        Track Order
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/terms" className="text-gray-400 hover:text-white transition-all duration-300 text-sm font-bold flex items-center justify-center md:justify-start gap-2 group">
                                        <span className="w-0 group-hover:w-2 h-[1px] bg-indigo-500 transition-all"></span>
                                        Returns Policy
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/terms" className="text-gray-400 hover:text-white transition-all duration-300 text-sm font-bold flex items-center justify-center md:justify-start gap-2 group">
                                        <span className="w-0 group-hover:w-2 h-[1px] bg-indigo-500 transition-all"></span>
                                        Privacy Policy
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/terms" className="text-gray-400 hover:text-white transition-all duration-300 text-sm font-bold flex items-center justify-center md:justify-start gap-2 group">
                                        <span className="w-0 group-hover:w-2 h-[1px] bg-indigo-500 transition-all"></span>
                                        Terms & Conditions
                                    </Link>
                                </li>
                            </ul>
                        </motion.div>

                        {/* 4. Connectivity & Newsletter */}
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={sectionVariants}
                            transition={{ delay: 0.3 }}
                            className="space-y-10"
                        >
                            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 backdrop-blur-xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-600/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-purple-600/40 transition-colors" />

                                <h3 className="text-xl font-bold mb-2">Join the Elite</h3>
                                <p className="text-xs text-gray-500 mb-6 font-medium">Get early access to premium gadgets.</p>

                                <form onSubmit={handleSubscribe} className="space-y-3">
                                    <div className="relative">
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="you@example.com"
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500/50 transition-all placeholder-gray-700"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl shadow-xl shadow-purple-900/40 active:scale-95 transition-all text-sm tracking-widest uppercase disabled:opacity-50 cursor-pointer"
                                    >
                                        {loading ? "Subscribing..." : "Subscribe"}
                                    </button>
                                </form>
                            </div>

                            <div className="flex justify-center md:justify-start gap-4">
                                {[
                                    {
                                        icon: <FaFacebookF />,
                                        color: '#1877F2',
                                        link: "https://facebook.com/shopsarker"
                                    },
                                    {
                                        icon: <FaTiktok />,
                                        color: '#FF0000',
                                        link: "https://www.tiktok.com/@sarkershop"
                                    },
                                    {
                                        icon: <FaInstagram />,
                                        color: 'gradient',
                                        link: "https://www.instagram.com/sarkershop"
                                    },
                                    {
                                        icon: <FaLinkedinIn />,
                                        color: '#0A66C2',
                                        link: "https://www.linkedin.com/company/sarkershop/"
                                    },
                                    {
                                        icon: <FaYoutube />,
                                        color: '#FF0000',
                                        link: "https://www.youtube.com/@sarkershop"
                                    }
                                ].map((social, idx) => (
                                    <motion.a
                                        key={idx}
                                        href={social.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        whileHover={{ y: -5, scale: 1.1 }}
                                        className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/30 transition-all"
                                    >
                                        {social.icon}
                                    </motion.a>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>


                {/* Ultra-Fancy Bottom Dock Support Button */}
                {!isCartOpen && !isFilterOpen && !isCategoryOpen && !isDrawerOpen && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setChatOpen(true)}
                        className="fixed right-4 bottom-20 md:right-10 md:bottom-10 z-[60] flex items-center gap-3 p-1 md:pr-6 bg-white rounded-full shadow-[0_20px_50px_rgba(109,40,217,0.3)] group cursor-pointer"
                    >
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shrink-0">
                            <FaHeadset size={20} />
                        </div>
                        <span className="hidden md:block text-black font-black text-xs uppercase tracking-widest whitespace-nowrap">
                            Talk to an Expert
                        </span>
                        <div className="absolute inset-0 rounded-full border-2 border-purple-500 animate-ping opacity-20 pointer-events-none" />
                    </motion.button>
                )}
            </footer>

            <AnimatePresence>
                {chatOpen && <SupportChat onClose={() => setChatOpen(false)} />}
            </AnimatePresence>
        </>
    );
};

export default Footer;