import { Search, Send, MoreVertical, Phone, Video, Paperclip, Smile, ArrowLeft, X as FaTimes } from "lucide-react";
import api from "../api/axiosConfig";
import { useAuth } from "../Context/AuthContext";
import useChatSocket from "../hooks/useChatSocket";
import { useState, useRef, useCallback, useEffect } from "react";

const Messages = () => {
    const { user } = useAuth();
    const token = localStorage.getItem('access_token');

    const [chats, setChats] = useState([]);
    const [selectedChatId, setSelectedChatId] = useState(null);
    const [messageInput, setMessageInput] = useState("");
    const [replyTo, setReplyTo] = useState(null); // New: track message being replied to
    const [isLoadingChats, setIsLoadingChats] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [showChatOnMobile, setShowChatOnMobile] = useState(false);
    
    // Mobile Touch/Long-Press State
    const [longPressedMsgId, setLongPressedMsgId] = useState(null);
    const touchTimeoutRef = useRef(null);

    // Timezone helper: Asia/Dhaka 12-hour format
    const formatLocalTime = (date = new Date()) => {
        return date.toLocaleTimeString('en-US', { 
            timeZone: 'Asia/Dhaka', 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: true 
        });
    };

    // Layout visibility control
    useEffect(() => {
        // When showChatOnMobile is true OR selectedChatId exists on mobile/narrow view
        const shouldHide = showChatOnMobile;
        window.dispatchEvent(new CustomEvent('toggleLayout', { detail: shouldHide }));
        
        return () => {
            window.dispatchEvent(new CustomEvent('toggleLayout', { detail: false }));
        };
    }, [showChatOnMobile]);

    // The active chat derived from the list
    const activeChat = chats.find(c => Number(c.id) === Number(selectedChatId));
    const isTyping = activeChat?.isTyping || false;
    const typingTimeoutRef = useRef(null);
    const messagesEndRef = useRef(null);

    const handleSelectChat = useCallback(async (chat) => {
        setSelectedChatId(chat.id);
        setShowChatOnMobile(true);
        setIsLoadingMessages(true);
        try {
            // Mark as read on backend
            await api.patch(`/chats/read/${chat.id}/`);
            
            const response = await api.get(`/chats/${chat.id}/messages/`);
            const messageData = Array.isArray(response.data) ? response.data : (response.data?.results || []);

            setChats(prevChats => prevChats.map(c =>
                Number(c.id) === Number(chat.id) ? { ...c, messages: messageData, unread: 0, unread_count: 0 } : c
            ));
            // Trigger global refresh for badges
            window.dispatchEvent(new CustomEvent('unreadCountRefresh'));
        } catch (error) {
            console.error(`Failed to fetch messages for chat ${chat.id}:`, error);
        } finally {
            setIsLoadingMessages(false);
        }
    }, []);

    // Initial fetch of conversations
    useEffect(() => {
        const fetchConversations = async () => {
            setIsLoadingChats(true);
            try {
                const response = await api.get('/chats/');
                const conversationData = Array.isArray(response.data) ? response.data : (response.data?.results || []);
                
                // Format times for initial load
                const formatted = conversationData.map(chat => ({
                    ...chat,
                    time: chat.updated_at ? formatLocalTime(new Date(chat.updated_at)) : chat.time
                }));
                
                setChats(formatted);
            } catch (error) {
                console.error("Messages: Failed to fetch conversations", error);
            } finally {
                setIsLoadingChats(false);
            }
        };
        fetchConversations();
    }, []);

    // Auto-scroll to bottom of chat
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [activeChat?.messages]);

    // Handle incoming WebSocket messages via callback
    const handleWebSocketMessage = useCallback((message) => {
        if (!message) return;

        const type = message.type || 'chat_message';
        
        // 1. Handle User Status Changes (Presence)
        if (type === 'user_status') {
            const { user_id, is_online } = message;
            setChats(prev => prev.map(chat => {
                const cust = chat.customer || {};
                const other = chat.participants?.find(p => Number(p.id) !== Number(user?.id)) || chat.target_user || {};
                const otherId = Number(cust.id || other.id || other.user_id);
                
                if (otherId === Number(user_id)) {
                    return { ...chat, isOnline: is_online };
                }
                return chat;
            }));
            return;
        }

        // 2. Handle Typing indicators
        if (type === 'typing') {
            const chatId = Number(message.chatId);
            const senderId = Number(message.sender_id);
            if (senderId === Number(user?.id)) return; // Ignore my own typing events

            setChats(prev => prev.map(chat => 
                Number(chat.id) === chatId ? { ...chat, isTyping: !!message.isTyping } : chat
            ));
            return;
        }

        // 3. Handle Reaction Updates
        if (type === 'reaction_update') {
            const { message_id, reactions, chatId } = message;
            setChats(prev => prev.map(chat => {
                if (Number(chat.id) === Number(chatId)) {
                    return {
                        ...chat,
                        messages: (chat.messages || []).map(m => 
                            Number(m.id) === Number(message_id) ? { ...m, reactions } : m
                        )
                    };
                }
                return chat;
            }));
            return;
        }

        // 4. Handle actual chat messages
        if (type === 'chat_message' || !type) {
            const chatId = Number(message.chatId || message.conversation || message.id);
            const msgData = message.message || message;
            const sender = msgData.sender || {};
            const text = msgData.text || "";
            const sender_id = Number(sender.id || msgData.sender_id);
            
            if (!chatId) return;

            const currentUserId = Number(user?.id);
            const isFromMe = sender_id === currentUserId;

            const newMessage = { 
                id: msgData.id || Date.now(), 
                sender: sender.id ? sender : { id: sender_id },
                text, 
                image: msgData.image,
                video: msgData.video,
                message_type: msgData.message_type,
                parent_message_id: msgData.parent_message_id,
                reactions: msgData.reactions || {},
                time: msgData.time || formatLocalTime(msgData.timestamp ? new Date(msgData.timestamp) : new Date()),
                timestamp: msgData.timestamp || new Date().toISOString()
            };

            setChats(prevChats => {
                const chatIndex = prevChats.findIndex(c => Number(c.id) === chatId);
                
                if (chatIndex !== -1) {
                    const existingChat = prevChats[chatIndex];
                    
                    // Relaxed duplicate check: Only reject if we already have this EXACT ID.
                    // The previous text/time check was falsely rejecting fresh WS messages.
                    const isDuplicate = existingChat.messages?.some(m => String(m.id) === String(newMessage.id));

                    if (isDuplicate) return prevChats;

                    const updatedChat = {
                        ...existingChat,
                        messages: [...(existingChat.messages || []), newMessage],
                        last_message: { text },
                        lastMessage: text,
                        time: newMessage.time,
                        isTyping: false
                    };

                    if (Number(selectedChatId) !== chatId && !isFromMe) {
                        updatedChat.unread = (updatedChat.unread || 0) + 1;
                        updatedChat.unread_count = (updatedChat.unread_count || 0) + 1;
                        window.dispatchEvent(new CustomEvent('unreadCountRefresh'));
                    }

                    const newChats = [...prevChats];
                    newChats.splice(chatIndex, 1);
                    return [updatedChat, ...newChats];
                } else {
                    const cust = message.customer || {};
                    const newChat = {
                        id: chatId,
                        name: (cust.first_name ? `${cust.first_name} ${cust.last_name}` : null) 
                            || (sender.first_name ? `${sender.first_name} ${sender.last_name}` : 'New Customer'),
                        avatar: cust.profile_picture || sender.profile_picture,
                        customer: cust,
                        last_message: { text },
                        lastMessage: text,
                        time: newMessage.time,
                        unread: isFromMe ? 0 : 1,
                        unread_count: isFromMe ? 0 : 1,
                        messages: [newMessage],
                        isTyping: false,
                        isOnline: true, // If we just got a message, they are online
                        participants: sender.id ? [sender] : []
                    };

                    if (!isFromMe) window.dispatchEvent(new CustomEvent('unreadCountRefresh'));
                    return [newChat, ...prevChats];
                }
            });
        }
    }, [user?.id, selectedChatId]);

    const { isConnected, sendMessage, joinChat } = useChatSocket(token, handleWebSocketMessage);

    // Join rooms when connected or list updates
    useEffect(() => {
        if (isConnected && chats.length > 0) {
            chats.forEach(chat => joinChat(chat.id));
        }
    }, [isConnected, chats.length, joinChat]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if ((!messageInput.trim() && !replyTo) || !selectedChatId) return;

        const messageData = {
            type: 'chat_message',
            chatId: selectedChatId,
            text: messageInput,
            parent_message_id: replyTo?.id
        };

        const sent = sendMessage(messageData);

        if (sent) {
            setMessageInput("");
            setReplyTo(null);
            sendMessage({ type: 'typing', chatId: selectedChatId, isTyping: false });
        }
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file || !selectedChatId) return;

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
                chatId: selectedChatId,
                text: "",
                [isImage ? 'image' : 'video']: fileUrl,
                parent_message_id: replyTo?.id
            });
            setReplyTo(null);
        } catch (error) {
            console.error("File upload failed:", error);
        }
    };

    const handleReaction = (msgId, emoji) => {
        sendMessage({
            type: 'reaction',
            chatId: selectedChatId,
            message_id: msgId,
            emoji: emoji
        });
    };

    const handleTyping = (e) => {
        setMessageInput(e.target.value);
        if (!selectedChatId) return;
        
        sendMessage({ type: 'typing', chatId: selectedChatId, isTyping: true });

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            sendMessage({ type: 'typing', chatId: selectedChatId, isTyping: false });
        }, 2000);
    };

    return (
        <div className="h-full p-0 flex flex-col sm:flex-row gap-0 overflow-hidden">
            <div className="flex-1 flex overflow-hidden bg-[#071229] relative">
                {/* Sidebar */}
                <div className={`${showChatOnMobile ? 'hidden md:flex' : 'flex'} w-full md:w-80 border-r border-slate-800 flex-col bg-[#071229] transition-all duration-300`}>
                    <div className="p-4 border-b border-slate-800">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search messages..."
                                className="w-full bg-[#0b1a2a] border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {isLoadingChats ? (
                            <div className="flex justify-center p-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                            </div>
                        ) : !Array.isArray(chats) || chats.length === 0 ? (
                            <div className="p-8 text-center text-slate-500 text-sm">No conversations found.</div>
                        ) : (
                            chats.map((chat) => {
                                const cust = chat.customer || {};
                                const otherParticipant = chat.participants?.find(p => Number(p.id) !== Number(user?.id)) 
                                    || chat.target_user 
                                    || {};
                                
                                const displayName = chat.name 
                                    || (cust.full_name)
                                    || (cust.first_name ? `${cust.first_name} ${cust.last_name}` : null)
                                    || (cust.user?.first_name ? `${cust.user.first_name} ${cust.user.last_name}` : null)
                                    || (otherParticipant.first_name ? `${otherParticipant.first_name} ${otherParticipant.last_name}` : null) 
                                    || (cust.user?.username)
                                    || cust.username || otherParticipant.username 
                                    || 'Customer';
                                    
                                const displayAvatar = chat.avatar || cust.profile_picture || otherParticipant.profile_picture;

                                return (
                                    <button
                                        key={chat.id}
                                        onClick={() => handleSelectChat(chat)}
                                        className={`w-full flex items-center gap-3 p-4 hover:bg-slate-800/50 transition-colors border-b border-slate-800/50 cursor-pointer ${Number(selectedChatId) === Number(chat.id) ? 'bg-blue-600/10 border-l-4 border-l-blue-600' : ''}`}
                                    >
                                        <div className="relative">
                                            <img 
                                                src={displayAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0D8ABC&color=fff`} 
                                                alt={displayName} 
                                                className="w-12 h-12 rounded-xl object-cover border border-slate-700 cursor-pointer" 
                                            />
                                            {/* Presence indicator: Individual user status */}
                                            <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#071229] ${chat.isOnline ? 'bg-green-500' : 'bg-slate-500'}`} />
                                        </div>
                                        <div className="flex-1 text-left overflow-hidden">
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className="text-sm font-bold text-white truncate">{displayName}</h4>
                                                <span className="text-[10px] text-slate-500 whitespace-nowrap">{chat.time}</span>
                                            </div>
                                            <p className={`text-xs truncate ${chat.isTyping ? 'text-green-500 font-bold' : 'text-slate-400'}`}>
                                                {chat.isTyping ? 'Typing...' : (chat.last_message?.text || chat.lastMessage)}
                                            </p>
                                        </div>
                                        {chat.unread_count > 0 && (
                                            <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                                {chat.unread_count}
                                            </span>
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Chat Window */}
                <div className={`${showChatOnMobile ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-[#0b1326] transition-all duration-300`}>
                    {activeChat ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#071229]">
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={() => setShowChatOnMobile(false)}
                                        className="md:hidden p-2 -ml-2 text-slate-400 hover:text-white cursor-pointer"
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                    </button>
                                    {(() => {
                                        const cust = activeChat.customer || {};
                                        const otherParticipant = activeChat.participants?.find(p => Number(p.id) !== Number(user?.id)) 
                                            || cust 
                                            || activeChat.target_user 
                                            || {};
                                        
                                        const displayName = activeChat.name 
                                            || (otherParticipant.first_name ? `${otherParticipant.first_name} ${otherParticipant.last_name}` : null) 
                                            || otherParticipant.username 
                                            || 'Customer';
                                            
                                        const displayAvatar = activeChat.avatar || otherParticipant.profile_picture;
                                        
                                        return (
                                            <>
                                                <img 
                                                    src={displayAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0D8ABC&color=fff`} 
                                                    alt={displayName} 
                                                    className="w-10 h-10 rounded-xl object-cover border border-slate-700 cursor-pointer" 
                                                />
                                                <div>
                                                    <h3 className="text-sm font-bold text-white uppercase tracking-tight">{displayName}</h3>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase ${activeChat.isOnline ? 'text-green-500' : 'text-slate-500'}`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${activeChat.isOnline ? 'bg-green-500 animate-pulse' : 'bg-slate-500'}`} />
                                                            {activeChat.isOnline ? 'Online' : 'Offline'}
                                                        </span>
                                                        {!activeChat.isOnline && (
                                                            <>
                                                                <span className="text-slate-500 text-[10px]">•</span>
                                                                <span className="text-slate-500 text-[10px] font-medium">
                                                                    Last active {activeChat.time || 'recently'}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>
                                <div className="flex items-center gap-4 text-slate-400">
                                    <button 
                                        onClick={() => {
                                            setSelectedChatId(null);
                                            setShowChatOnMobile(false);
                                        }}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-500 rounded-lg transition-all text-xs font-bold cursor-pointer"
                                    >
                                        Dashboard
                                    </button>
                                    <button className="hover:text-blue-500 transition-colors cursor-pointer hidden sm:block"><Phone className="w-5 h-5" /></button>
                                    <button className="hover:text-blue-500 transition-colors cursor-pointer hidden sm:block"><Video className="w-5 h-5" /></button>
                                    <button className="hover:text-blue-500 transition-colors cursor-pointer"><MoreVertical className="w-5 h-5" /></button>
                                </div>
                            </div>

                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-8 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] scroll-smooth overflow-x-hidden pb-16">
                                {isLoadingMessages ? (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                                    </div>
                                ) : Array.isArray(activeChat.messages) && (
                                    <>
                                        {activeChat.messages.filter(msg => msg.text || msg.image || msg.video).map((msg, index) => {
                                            const isMe = Number(msg.sender?.id) === Number(user?.id);
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
                                            const sender = msg.sender || {};
                                            const senderImage = sender.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(sender.first_name || 'U')}&background=0D8ABC&color=fff`;
                                            
                                            return (
                                                <div key={msg.id || index} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                                    {/* Profile image */}
                                                    <div className="shrink-0 mb-1 flex-shrink-0">
                                                        {isMe ? (
                                                            user?.profile_picture ? (
                                                                <img src={user.profile_picture} alt="Me" className="w-8 h-8 rounded-full object-cover border border-slate-700" />
                                                            ) : (
                                                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-slate-700 shadow-sm p-1">
                                                                    <img src="/favicon.png" alt="Admin" className="w-full h-full object-contain" />
                                                                </div>
                                                            )
                                                        ) : (
                                                            <img 
                                                                src={senderImage} 
                                                                alt="sender" 
                                                                className="w-8 h-8 rounded-full object-cover border border-slate-700"
                                                            />
                                                        )}
                                                    </div>
                                                    
                                                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                                                        {msg.parent_message_id && (() => {
                                                            const parent = activeChat.messages.find(m => Number(m.id) === Number(msg.parent_message_id));
                                                            if (!parent) return null;
                                                            return (
                                                                <button 
                                                                    onClick={() => {
                                                                        const el = document.getElementById(`admin-msg-${msg.parent_message_id}`);
                                                                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                                    }}
                                                                    className="bg-slate-800/50 border-l-4 border-blue-500 px-3 py-1 mb-1 rounded-md text-[10px] text-slate-400 max-w-full truncate overflow-hidden hover:bg-slate-700/50 transition-colors cursor-pointer text-left group/reply"
                                                                >
                                                                    <div className="flex items-center gap-1">
                                                                        <Send size={8} className="text-blue-400 rotate-180 group-hover/reply:text-blue-500" />
                                                                        {parent.text || (parent.image ? '📷 Image' : '🎬 Video')}
                                                                    </div>
                                                                </button>
                                                            );
                                                        })()}
                                                        <div 
                                                            id={`admin-msg-${msg.id}`}
                                                            onTouchStart={handleTouchStart}
                                                            onTouchEnd={handleTouchEnd}
                                                            onTouchCancel={handleTouchEnd}
                                                            className={`relative group px-4 py-3 rounded-2xl shadow-lg transition-all ${isMe
                                                            ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-tr-none'
                                                            : 'bg-[#071229] border border-slate-800 text-slate-200 rounded-tl-none'
                                                            } ${msg.reactions && Object.keys(msg.reactions).length > 0 ? 'mb-12' : ''} ${isLongPressed ? 'ring-2 ring-blue-500 scale-[1.02]' : ''}`}>
                                                            {msg.image ? (
                                                                <div className="space-y-2">
                                                                    <img 
                                                                        src={msg.image.startsWith('http') ? msg.image : `${api.defaults.baseURL.replace(/\/api\/?$/, '')}/media/${msg.image.replace(/^\/media\//, '')}`} 
                                                                        alt="uploaded" 
                                                                        className="max-w-[300px] rounded-lg cursor-pointer hover:scale-[1.01] transition-transform" 
                                                                        onClick={() => window.open(msg.image.startsWith('http') ? msg.image : `${api.defaults.baseURL.replace(/\/api\/?$/, '')}/media/${msg.image.replace(/^\/media\//, '')}`, '_blank')} 
                                                                    />
                                                                    {msg.text && <p className="text-sm leading-relaxed">{msg.text}</p>}
                                                                </div>
                                                            ) : msg.video ? (
                                                                <div className="space-y-2">
                                                                    <video src={msg.video.startsWith('http') ? msg.video : `${api.defaults.baseURL.replace(/\/api\/?$/, '')}/media/${msg.video.replace(/^\/media\//, '')}`} controls className="max-w-[300px] rounded-lg" />
                                                                    {msg.text && <p className="text-sm leading-relaxed">{msg.text}</p>}
                                                                </div>
                                                            ) : (
                                                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                                            )}
                                                            
                                                            {/* Emoji Reaction Display */}
                                                            {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                                                                <div className={`absolute top-full mt-1 ${isMe ? 'right-0' : 'left-0'} flex flex-row flex-wrap gap-1.5 z-20 min-w-max p-1`}>
                                                                    {Object.entries(msg.reactions).map(([emoji, users]) => {
                                                                        const hasReacted = users.includes(Number(user?.id)) || users.includes(String(user?.id));
                                                                        return (
                                                                            <div 
                                                                                key={emoji} 
                                                                                className={`flex flex-col items-center shadow-2xl bg-[#0b1a2a]/95 backdrop-blur-md border rounded-2xl p-1 animate-in zoom-in duration-300 min-w-[32px] ${hasReacted ? 'border-blue-500 ring-1 ring-blue-400/30' : 'border-slate-800'}`}
                                                                            >
                                                                                <span className="text-sm leading-none mb-1">{emoji}</span>
                                                                                <div className="flex flex-col gap-0.5 items-center">
                                                                                    {users.map(uId => {
                                                                                        const isMeReact = Number(uId) === Number(user?.id);
                                                                                        return (
                                                                                            <div key={uId} className="flex items-center gap-1 w-full px-1">
                                                                                                <div className="w-4 h-4 rounded-full border border-slate-700 overflow-hidden shadow-sm flex items-center justify-center shrink-0">
                                                                                                    {isMeReact ? (
                                                                                                        (user?.avatar) ? 
                                                                                                            <img src={user.avatar} className="w-full h-full object-cover" /> : 
                                                                                                            <div className="w-full h-full bg-blue-600 flex items-center justify-center text-[6px] font-extrabold text-white">YOU</div>
                                                                                                    ) : (
                                                                                                        (activeChat.customer?.avatar) ?
                                                                                                            <img src={activeChat.customer.avatar} className="w-full h-full object-cover" /> :
                                                                                                            <div className="w-full h-full bg-slate-700 flex items-center justify-center text-[6px] font-extrabold text-white">{activeChat.customer?.full_name?.charAt(0) || 'C'}</div>
                                                                                                    )}
                                                                                                </div>
                                                                                                <span className="text-[8px] font-bold text-slate-400 whitespace-nowrap">
                                                                                                    {isMeReact ? 'You' : (activeChat.customer?.first_name || 'Cust')}
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
                                                            <div className={`absolute -top-12 ${isMe ? 'right-0' : 'left-0'} h-12 flex items-end ${isLongPressed ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto'} transition-all z-30 pb-2`}>
                                                                <div className="flex bg-[#0b1a2a] border border-slate-700 rounded-xl p-1.5 gap-2 shadow-2xl items-center animate-in slide-in-from-top-2 duration-300">
                                                                    <div className="flex gap-2 border-r border-slate-700 pr-2">
                                                                        {['❤️', '👍', '😂', '🔥', '😮'].map(emoji => (
                                                                            <button 
                                                                                key={emoji} 
                                                                                onClick={() => {
                                                                                    handleReaction(msg.id, emoji);
                                                                                    setLongPressedMsgId(null);
                                                                                }}
                                                                                className="text-xl hover:scale-125 transition-transform cursor-pointer filter hover:drop-shadow-blue active:scale-95"
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
                                                                        className="p-1.5 text-blue-500 hover:text-white bg-blue-500/10 hover:bg-blue-600 rounded-lg transition-all cursor-pointer active:scale-90 flex items-center gap-1 text-[10px] font-bold uppercase"
                                                                        title="Reply"
                                                                    >
                                                                        <div className="rotate-180"><Send className="w-3 h-3" /></div>
                                                                        Reply
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <span className="text-[10px] sm:text-xs font-bold text-slate-300 mt-2 bg-slate-800/30 px-2 py-0.5 rounded shadow-sm opacity-90 transition-opacity hover:opacity-100">
                                                            {msg.time}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {isTyping && (
                                            <div className="flex items-end gap-2">
                                                <div className="w-8 h-8 rounded-full bg-slate-800 animate-pulse flex-shrink-0" />
                                                <div className="bg-[#071229] border border-slate-800 text-slate-400 rounded-2xl px-4 py-2.5 rounded-tl-none shadow-lg">
                                                    <div className="flex gap-1">
                                                        <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                                        <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                                        <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Sticky Input Box */}
                            <div className="p-3 sm:p-4 bg-[#071229] border-t border-slate-800 sticky bottom-0">
                                <form
                                    className="flex items-center gap-2 sm:gap-3 bg-[#0b1a2a] border border-slate-700 rounded-2xl px-3 sm:px-4 py-2 shadow-inner group focus-within:border-blue-500/50 transition-colors"
                                    onSubmit={handleSendMessage}
                                >
                                    {replyTo && (
                                        <div className="absolute bottom-full left-0 right-0 bg-[#071229] border-t border-slate-800 p-2 flex items-center justify-between text-xs animate-in slide-in-from-bottom-2 duration-200">
                                            <div className="flex items-center gap-2 text-slate-400 overflow-hidden">
                                                <div className="w-1 h-8 bg-blue-600 rounded-full" />
                                                <div className="truncate">
                                                    <span className="font-bold text-blue-500 uppercase block text-[10px]">Replying to</span>
                                                    {replyTo.text || (replyTo.image ? '📷 Image' : '🎬 Video')}
                                                </div>
                                            </div>
                                            <button onClick={() => setReplyTo(null)} className="p-1 hover:text-red-500 transition-colors cursor-pointer">
                                                <FaTimes size={14} />
                                            </button>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1 sm:gap-2">
                                        <button type="button" className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all cursor-pointer">
                                            <Smile className="w-5 h-5" />
                                        </button>
                                        <label className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all cursor-pointer">
                                            <Paperclip className="w-5 h-5" />
                                            <input type="file" className="hidden" accept="image/*,video/*" onChange={handleFileSelect} />
                                        </label>
                                    </div>
                                    <textarea
                                        value={messageInput}
                                        rows={1}
                                        onInput={(e) => {
                                            e.target.style.height = 'auto';
                                            e.target.style.height = e.target.scrollHeight + 'px';
                                        }}
                                        onChange={handleTyping}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage(e);
                                            }
                                        }}
                                        placeholder={isConnected ? "Type a message..." : "Reconnecting..."}
                                        className="flex-1 bg-transparent border-none text-sm text-slate-200 focus:outline-none py-1 resize-none max-h-32"
                                        disabled={!isConnected}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!isConnected || (!messageInput.trim() && !replyTo)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50 disabled:grayscale"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 opacity-50 p-6 text-center">
                            <div className="w-20 h-20 bg-slate-800 flex items-center justify-center rounded-3xl mb-4">
                                <Search className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Your Inbox</h3>
                            <p>Select a contact to start messaging.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Messages;
