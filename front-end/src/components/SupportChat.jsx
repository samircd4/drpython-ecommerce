import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaHeadset, FaPaperPlane, FaTimes, FaUserAlt, FaCircle } from "react-icons/fa";
import { useUser } from "../context/UserContext";

const SupportChat = ({ onClose }) => {
    const { user } = useUser();
    const [messages, setMessages] = useState([
        { from: "support", text: "👋 Hi there! Welcome to Sarker Shop. How can we help you today?", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const newMessage = {
            from: "user",
            text: input,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages([...messages, newMessage]);
        setInput("");

        // Simulate Support Response
        setIsTyping(true);
        setTimeout(() => {
            setMessages(prev => [...prev, {
                from: "support",
                text: "Thanks for your message! Our expert will be with you shortly. 😊",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
            setIsTyping(false);
        }, 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20, transformOrigin: "bottom right" }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-24 right-4 md:right-10 md:bottom-28 w-[90vw] md:w-96 h-[500px] bg-white rounded-[2rem] shadow-[0_20px_60px_rgba(109,40,217,0.3)] flex flex-col z-[70] overflow-hidden border border-purple-100"
        >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white flex justify-between items-center shadow-lg">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                            <FaHeadset size={22} />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-purple-600 rounded-full animate-pulse" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg leading-tight">Support Expert</h3>
                        <div className="flex items-center gap-2 text-xs text-purple-100 font-medium">
                            <FaCircle size={8} className="text-green-400" />
                            Online & Ready to Help
                        </div>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="w-10 h-10 rounded-xl hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
                >
                    <FaTimes size={20} />
                </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-neutral-50/50 space-y-4 scrollbar-thin scrollbar-thumb-purple-200">
                {messages.map((msg, idx) => (
                    <motion.div
                        initial={{ opacity: 0, x: msg.from === "user" ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={idx}
                        className={`flex items-end gap-2 ${msg.from === "user" ? "flex-row-reverse" : "flex-row"}`}
                    >
                        {/* Avatar */}
                        <div className="shrink-0 mb-5">
                            {msg.from === "support" ? (
                                <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 border border-purple-200">
                                    <FaHeadset size={14} />
                                </div>
                            ) : (
                                (user?.avatar || user?.social_avatar_url) ? (
                                    <img src={user.avatar || user.social_avatar_url} alt="User" className="w-8 h-8 rounded-xl object-cover border border-purple-200" />
                                ) : (
                                    <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 border border-indigo-200">
                                        <FaUserAlt size={12} />
                                    </div>
                                )
                            )}
                        </div>

                        {/* Content */}
                        <div className={`flex flex-col max-w-[75%] ${msg.from === "user" ? "items-end" : "items-start"}`}>
                            <div
                                className={`px-4 py-3 rounded-2xl text-sm shadow-sm ${msg.from === "user"
                                    ? "bg-gradient-to-tr from-purple-600 to-indigo-600 text-white rounded-tr-none"
                                    : "bg-white text-gray-800 border border-purple-50 rounded-tl-none"
                                    }`}
                            >
                                {msg.text}
                            </div>
                            <span className="text-[10px] text-gray-400 mt-1 font-bold px-1 uppercase tracking-tighter">
                                {msg.time}
                            </span>
                        </div>
                    </motion.div>
                ))}

                {/* Typing Indicator */}
                <AnimatePresence>
                    {isTyping && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="flex items-end gap-2"
                        >
                            <div className="shrink-0 mb-1">
                                <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 border border-purple-200">
                                    <FaHeadset size={14} />
                                </div>
                            </div>
                            <div className="bg-white border border-purple-50 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1 items-center">
                                <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0 }} className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                                <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }} className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                                <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }} className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-purple-50">
                <form
                    onSubmit={handleSend}
                    className="flex items-center gap-2 bg-neutral-100 rounded-2xl p-1 pr-2 border border-transparent focus-within:border-purple-300 transition-all shadow-inner"
                >
                    <input
                        className="flex-1 px-4 py-3 bg-transparent text-sm outline-none placeholder:text-gray-400 font-medium"
                        type="text"
                        placeholder="Type your message..."
                        value={input}
                        onChange={e => setInput(e.target.value)}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim()}
                        className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center hover:bg-indigo-600 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 cursor-pointer shadow-md"
                    >
                        <FaPaperPlane size={14} className="ml-0.5" />
                    </button>
                </form>
                <p className="text-[10px] text-center text-gray-400 mt-3 font-semibold uppercase tracking-widest">
                    Sarker Shop Secure Support
                </p>
            </div>
        </motion.div>
    );
};

export default SupportChat;