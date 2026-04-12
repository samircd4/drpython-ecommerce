import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaHeadset, FaPaperPlane, FaTimes, FaUser, FaCircle, FaPaperclip, FaSmile, FaReply } from "react-icons/fa";
import { useUser } from "../context/UserContext";
import { useChat } from "../hooks/useChat";
import { Link } from "react-router-dom";
import { useConfig } from "../context/ConfigContext";
import axios from "axios";
import api, { BASE_URL } from "../api/client";

const BACKEND_URL = BASE_URL ? BASE_URL.replace(/\/api\/?$/, '') : 'http://localhost:8000';

const getFullUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${BACKEND_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

const SupportChat = ({ onClose }) => {
    const { user } = useUser();
    const { config } = useConfig();
    const { messages, sendMessage, isConnected, loading, guest_id } = useChat();
    const siteName = config?.website_name || "Sarker Shop";
    const [input, setInput] = useState("");
    const [replyTo, setReplyTo] = useState(null);
    
    // Mobile Touch/Long-Press State
    const [longPressedMsgId, setLongPressedMsgId] = useState(null);
    const [hoveredMsgId, setHoveredMsgId] = useState(null);
    const hoverTimeoutRef = useRef(null);
    const touchTimeoutRef = useRef(null);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Clear long press state if user scrolls or interacts elsewhere
    useEffect(() => {
        const handleScroll = () => setLongPressedMsgId(null);
        const chatArea = messagesEndRef.current ? messagesEndRef.current.parentElement : null;
        if (chatArea) {
            chatArea.addEventListener('scroll', handleScroll);
        }
        return () => {
            if (chatArea) {
                chatArea.removeEventListener('scroll', handleScroll);
            }
        };
    }, []);

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim() && !replyTo) return;

        const success = sendMessage({
            type: 'chat_message',
            text: input,
            parent_message_id: replyTo ? replyTo.id : null
        });

        if (success) {
            setInput("");
            setReplyTo(null);
        }
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post('/chats/upload/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            const fileUrl = response.data.url;
            const isImage = file.type.startsWith('image/');
            
            sendMessage({
                type: 'chat_message',
                text: "",
                [isImage ? 'image' : 'video']: fileUrl
            });
        } catch (error) {
            console.error("File upload failed:", error);
        }
    };

    const handleReaction = (msgId, emoji) => {
        sendMessage({
            type: 'reaction',
            message_id: msgId,
            emoji: emoji
        });
    };

    // Welcome message if no history
    const welcomeMessage = {
        from: "support",
        text: `👋 Hi there! Welcome to ${siteName}. How can we help you today?`,
        time: "Now"
    };

    const displayMessages = messages.length > 0 ? messages : [welcomeMessage];

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
                        <div className="w-12 h-12 rounded-2xl bg-white p-2 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
                            <img src={config?.favicon || "/favicon.png"} alt={siteName} className="w-full h-full object-contain" />
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-purple-600 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg leading-tight">Support Expert</h3>
                        <div className="flex items-center gap-2 text-xs text-purple-100 font-medium">
                            <FaCircle size={8} className={isConnected ? "text-green-400" : "text-gray-400"} />
                            {isConnected ? "Online & Ready to Help" : "Connecting..."}
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
            <div className="flex-1 overflow-y-auto p-6 bg-neutral-50/50 space-y-8 scrollbar-thin scrollbar-thumb-purple-200 overflow-x-hidden pb-12">
                {loading ? (
                    <div className="flex justify-center py-10">
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full" />
                    </div>
                ) : (
                    displayMessages.filter(msg => msg.text || msg.image || msg.video).map((msg, idx) => {
                        const isLongPressed = longPressedMsgId === msg.id;

                        // Touch Handlers for Mobile Long Press
                        const handleTouchStart = () => {
                            if (touchTimeoutRef.current) clearTimeout(touchTimeoutRef.current);
                            touchTimeoutRef.current = setTimeout(() => {
                                setLongPressedMsgId(msg.id);
                            }, 500); // 500ms long press
                        };
                        const handleTouchEnd = () => {
                            if (touchTimeoutRef.current) clearTimeout(touchTimeoutRef.current);
                        };

                        return (
                        <motion.div
                            initial={{ opacity: 0, x: msg.from === "user" ? 20 : -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            key={msg.id || idx}
                            className={`flex items-end gap-2 ${msg.from === "user" ? "flex-row-reverse" : "flex-row"}`}
                        >
                            {/* Avatar */}
                            <div className="shrink-0 mb-5">
                                {msg.from === "support" ? (
                                    (msg.sender?.profile_picture) ? (
                                        <img src={getFullUrl(msg.sender.profile_picture)} alt="Support" className="w-8 h-8 rounded-xl object-cover border border-purple-200" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center border border-purple-200 shadow-sm p-1">
                                            <img src="/favicon.png" alt="Support" className="w-full h-full object-contain" />
                                        </div>
                                    )
                                ) : (
                                    (user?.avatar || user?.social_avatar_url) ? (
                                        <img src={getFullUrl(user.avatar || user.social_avatar_url)} alt="User" className="w-8 h-8 rounded-xl object-cover border border-purple-200" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center border border-purple-200 shadow-sm">
                                            <FaUser className="text-purple-400 w-4 h-4" />
                                        </div>
                                    )
                                )}
                            </div>

                             {/* Content */}
                             <div className={`flex flex-col max-w-[75%] ${msg.from === "user" ? "items-end" : "items-start"}`}>
                                 {msg.parent_message_id && (() => {
                                     const parent = messages.find(m => Number(m.id) === Number(msg.parent_message_id));
                                     if (!parent) return null;
                                     return (
                                         <button 
                                             onClick={() => {
                                                 const el = document.getElementById(`msg-${msg.parent_message_id}`);
                                                 if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                             }}
                                             className="bg-neutral-200/50 border-l-4 border-purple-500 px-3 py-1 mb-1 rounded-md text-[10px] text-gray-500 max-w-full truncate text-left hover:bg-neutral-300/50 transition-colors cursor-pointer group/reply"
                                         >
                                             <div className="flex items-center gap-1">
                                                 <FaReply size={8} className="text-purple-400 group-hover/reply:text-purple-600" />
                                                 {parent.text || (parent.image ? '📷 Image' : '🎬 Video')}
                                             </div>
                                         </button>
                                     );
                                 })()}
                                 <div
                                     id={`msg-${msg.id}`}
                                     onPointerEnter={() => {
                                         if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                                         setHoveredMsgId(msg.id);
                                     }}
                                     onPointerLeave={() => {
                                         hoverTimeoutRef.current = setTimeout(() => setHoveredMsgId(null), 500);
                                     }}
                                     onTouchStart={handleTouchStart}
                                     onTouchEnd={handleTouchEnd}
                                     onTouchCancel={handleTouchEnd}
                                     className={`relative group px-4 py-2.5 rounded-2xl shadow-md transition-all ${
                                         msg.from === 'user' 
                                         ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-tr-none' 
                                         : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
                                     } ${msg.reactions && Object.keys(msg.reactions).length > 0 ? 'mb-12' : ''} ${isLongPressed ? 'ring-2 ring-purple-500 shadow-md scale-[1.02]' : ''}`}
                                 >
                                     {msg.image ? (
                                         <div className="space-y-2">
                                             <img 
                                                 src={msg.image.startsWith('http') ? msg.image : `${api.defaults.baseURL.replace(/\/api\/?$/, '')}/media/${msg.image.replace(/^\/media\//, '')}`} 
                                                 alt="uploaded" 
                                                 className="max-w-[200px] rounded-lg cursor-pointer hover:scale-[1.02] transition-transform" 
                                                 onClick={() => window.open(msg.image.startsWith('http') ? msg.image : `${api.defaults.baseURL.replace(/\/api\/?$/, '')}/media/${msg.image.replace(/^\/media\//, '')}`, '_blank')} 
                                             />
                                             {msg.text && <p className="leading-relaxed">{msg.text}</p>}
                                         </div>
                                     ) : msg.video ? (
                                         <div className="space-y-2">
                                             <video src={msg.video.startsWith('http') ? msg.video : `${api.defaults.baseURL.replace(/\/api\/?$/, '')}/media/${msg.video.replace(/^\/media\//, '')}`} controls className="max-w-[200px] rounded-lg" />
                                             {msg.text && <p className="leading-relaxed">{msg.text}</p>}
                                         </div>
                                     ) : (
                                         <p className="leading-relaxed">{msg.text}</p>
                                     )}

                                     {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                                         <div className={`absolute top-full mt-1 ${msg.from === 'user' ? 'right-0' : 'left-0'} flex flex-row flex-wrap gap-1.5 z-20 min-w-max p-1`}>
                                             {Object.entries(msg.reactions).map(([emoji, reactors]) => {
                                                 const myUId = user?.id || guest_id;
                                                 const hasReacted = reactors.some(r => String(r.id) === String(myUId));
                                                 return (
                                                     <div 
                                                        key={emoji} 
                                                        className={`flex flex-col items-center bg-white/90 backdrop-blur-sm border rounded-2xl p-1 shadow-lg animate-in zoom-in duration-300 min-w-[32px] ${hasReacted ? 'border-purple-400 ring-1 ring-purple-200' : 'border-purple-100'}`}
                                                     >
                                                         <span className="text-sm leading-none mb-1">{emoji}</span>
                                                          <div className="flex flex-col gap-0.5 items-center">
                                                             {reactors.map(reactor => {
                                                                 const uId = reactor.id;
                                                                 const isMe = String(uId) === String(myUId);
                                                                 
                                                                 // Use enriched name or default labels
                                                                 let label = isMe ? 'You' : (reactor.is_staff ? 'Expert' : (reactor.name || 'User'));
                                                                 
                                                                 return (
                                                                    <div key={uId} className="group/avatar relative flex items-center gap-1 w-full">
                                                                         <div className="w-4 h-4 rounded-full border border-white overflow-hidden shadow-sm shrink-0">
                                                                             {isMe ? (
                                                                                 (user?.avatar || user?.social_avatar_url) ? (
                                                                                     <img src={getFullUrl(user.avatar || user.social_avatar_url)} className="w-full h-full object-cover" alt="Me" />
                                                                                 ) : (
                                                                                     <div className="w-full h-full bg-indigo-500 flex items-center justify-center text-[6px] font-extrabold text-white">YOU</div>
                                                                                 )
                                                                             ) : (
                                                                                 reactor.avatar ? (
                                                                                     <img src={getFullUrl(reactor.avatar)} alt={reactor.name} className="w-full h-full object-cover" />
                                                                                 ) : (
                                                                                     reactor.is_staff ? (
                                                                                         <div className="w-full h-full bg-white flex items-center justify-center">
                                                                                             <img src="/favicon.png" className="w-full h-full object-contain p-0.5" alt="Admin" />
                                                                                         </div>
                                                                                     ) : (
                                                                                         <div className="w-full h-full bg-purple-50 flex items-center justify-center">
                                                                                             <FaUser className="text-purple-300 w-2.5 h-2.5" />
                                                                                         </div>
                                                                                     )
                                                                                 )
                                                                             )}
                                                                         </div>
                                                                         <span className="text-[8px] font-bold text-gray-500 whitespace-nowrap">
                                                                             {label}
                                                                         </span>
                                                                     </div>
                                                                );
                                                            })}
                                                         </div>
                                                     </div>
                                                 );
                                             })}
                                         </div>
                                     )}

                                     {/* Actions Overlay - Visible on Hover (Desktop) or Long Press (Mobile) */}
                                     <AnimatePresence>
                                         {(isLongPressed || hoveredMsgId === msg.id) && (
                                             <motion.div 
                                                initial={{ opacity: 0, x: msg.from === 'user' ? 30 : -30, scale: 0.8 }}
                                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                                exit={{ opacity: 0, x: msg.from === 'user' ? 30 : -30, scale: 0.8 }}
                                                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                                                className={`absolute -bottom-12 ${msg.from === 'user' ? 'right-0' : 'left-0'} h-12 flex items-start z-30 pt-2`}
                                             >
                                                     <div className="flex bg-white border border-purple-100 rounded-xl p-1.5 gap-2 shadow-xl items-center relative">
                                                 <div className="flex gap-2 border-r border-purple-100 pr-2">
                                                     {['❤️', '👍', '😂', '🔥', '😮'].map(emoji => (
                                                         <button 
                                                             key={emoji} 
                                                             onClick={() => {
                                                                 handleReaction(msg.id, emoji);
                                                                 setLongPressedMsgId(null);
                                                             }}
                                                             className="text-xl hover:scale-125 transition-transform cursor-pointer filter hover:drop-shadow-md active:scale-95"
                                                         >
                                                             {emoji}
                                                         </button>
                                                     ))}
                                                 </div>
                                                 <button 
                                                     onClick={() => {
                                                         setReplyTo(msg);
                                                         setLongPressedMsgId(null);
                                                     }}
                                                     className="p-1.5 text-purple-600 hover:text-white bg-purple-50 hover:bg-purple-600 rounded-lg transition-all cursor-pointer active:scale-90 flex items-center gap-1 text-[10px] font-bold uppercase"
                                                     title="Reply"
                                                 >
                                                     <div className="rotate-180"><FaPaperPlane className="w-3 h-3" /></div>
                                                     Reply
                                                 </button>
                                             </div>
                                         </motion.div>
                                         )}
                                     </AnimatePresence>
                                     </div>
                                 <span className="text-[10px] text-gray-400 mt-1 font-bold px-1 uppercase tracking-tighter">
                                     {msg.time}
                                 </span>
                             </div>
                        </motion.div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-purple-50 relative">
                {replyTo && (
                    <div className="absolute bottom-full left-0 right-0 bg-neutral-50 p-2 border-t border-purple-100 flex items-center justify-between text-[10px] animate-in slide-in-from-bottom-2">
                        <div className="flex items-center gap-2 text-gray-500 overflow-hidden">
                            <div className="w-1 h-6 bg-purple-600 rounded-full" />
                            <div className="truncate italic">
                                <span className="font-bold text-purple-600 non-italic mr-1">Reply to:</span>
                                {replyTo.text || (replyTo.image ? '📷 Image' : '🎬 Video')}
                            </div>
                        </div>
                        <button onClick={() => setReplyTo(null)} className="p-1 text-gray-400 hover:text-red-500 cursor-pointer">
                            <FaTimes size={12} />
                        </button>
                    </div>
                )}
                <form
                    onSubmit={handleSend}
                    className="flex items-center gap-2 bg-neutral-100 rounded-2xl p-1 pr-2 border border-transparent focus-within:border-purple-300 transition-all shadow-inner"
                >
                    <div className="flex items-center gap-1 pl-1">
                        <button 
                            type="button" 
                            className="p-2 text-gray-400 hover:text-purple-600 cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <FaPaperclip size={16} />
                        </button>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*,video/*" 
                            onChange={handleFileSelect} 
                        />
                    </div>
                    <textarea
                        className="flex-1 px-2 py-3 bg-transparent text-sm outline-none placeholder:text-gray-400 font-medium resize-none max-h-32 scrollbar-none"
                        placeholder={isConnected ? "Type your message..." : "Connecting..."}
                        value={input}
                        rows={1}
                        onInput={(e) => {
                            e.target.style.height = 'auto';
                            e.target.style.height = e.target.scrollHeight + 'px';
                        }}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend(e);
                            }
                        }}
                        disabled={!isConnected}
                    />
                    <button
                        type="submit"
                        disabled={(!input.trim() && !replyTo) || !isConnected}
                        className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center hover:bg-indigo-600 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 cursor-pointer shadow-md"
                    >
                        <FaPaperPlane size={14} className="ml-0.5" />
                    </button>
                </form>
                <p className="text-[10px] text-center text-gray-400 mt-3 font-semibold uppercase tracking-widest">
                    {siteName} Secure Support
                </p>
            </div>
        </motion.div>
    );
};

export default SupportChat;