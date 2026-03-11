import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, Send, MoreVertical, Phone, Video, Paperclip, Smile } from "lucide-react";
import api from "../api/axiosConfig";
import { useAuth } from "../Context/AuthContext";
import useChatSocket from "../hooks/useChatSocket";

const Messages = () => {
    const { user } = useAuth();
    const token = localStorage.getItem('access_token');

    const [chats, setChats] = useState([]);
    const [selectedChatId, setSelectedChatId] = useState(null);
    const [messageInput, setMessageInput] = useState("");
    const [isLoadingChats, setIsLoadingChats] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    
    // The active chat derived from the list
    const activeChat = chats.find(c => Number(c.id) === Number(selectedChatId));
    const isTyping = activeChat?.isTyping || false;
    const typingTimeoutRef = useRef(null);
    const messagesEndRef = useRef(null);

    const handleSelectChat = useCallback(async (chat) => {
        setSelectedChatId(chat.id);
        setIsLoadingMessages(true);
        try {
            const response = await api.get(`/chats/${chat.id}/messages/`);
            const messageData = Array.isArray(response.data) ? response.data : (response.data?.results || []);

            setChats(prevChats => prevChats.map(c =>
                Number(c.id) === Number(chat.id) ? { ...c, messages: messageData, unread: 0 } : c
            ));
        } catch (error) {
            // silently handle error
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
                setChats(conversationData);
                if (conversationData.length > 0 && !selectedChatId) {
                    setSelectedChatId(conversationData[0].id);
                    handleSelectChat(conversationData[0]);
                }
            } catch (error) {
                // silently handle error
            } finally {
                setIsLoadingChats(false);
            }
        };
        fetchConversations();
    }, [handleSelectChat]);

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

        const chatId = Number(message.chatId || message.conversation || message.id);
        const type = message.type || 'chat_message';
        const sender = message.sender || {};
        const text = message.text || "";
        const sender_id = Number(sender.id || message.sender_id);
        
        if (!chatId) return;

        if (type === 'typing') {
            const isTargetTyping = message.isTyping !== undefined ? message.isTyping : (message.typing !== undefined ? message.typing : message.is_typing);
            setChats(prevChats => prevChats.map(chat => 
                Number(chat.id) === chatId ? { ...chat, isTyping: !!isTargetTyping } : chat
            ));
            return;
        }

        const currentUserId = Number(user?.id);
        const isFromMe = sender_id === currentUserId;

        const newMessage = { 
            id: message.id || Date.now(), 
            sender: sender.id ? sender : { id: sender_id },
            text, 
            time: message.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timestamp: message.timestamp || new Date().toISOString()
        };

        setChats(prevChats => {
            const chatIndex = prevChats.findIndex(c => Number(c.id) === chatId);
            
            if (chatIndex !== -1) {
                const existingChat = prevChats[chatIndex];
                
                const isDuplicate = existingChat.messages?.some(m => 
                    (m.id === newMessage.id) || 
                    (isFromMe && m.text === newMessage.text && Math.abs(new Date(m.timestamp || Date.now()) - new Date(newMessage.timestamp)) < 2000)
                );

                if (isDuplicate && isFromMe) return prevChats;

                const updatedChat = {
                    ...existingChat,
                    messages: [...(existingChat.messages || []), newMessage],
                    lastMessage: text,
                    time: newMessage.time,
                    isTyping: false
                };

                if (Number(selectedChatId) !== chatId && !isFromMe) {
                    updatedChat.unread = (updatedChat.unread || 0) + 1;
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
                    lastMessage: text,
                    time: newMessage.time,
                    unread: isFromMe ? 0 : 1,
                    messages: [newMessage],
                    isTyping: false,
                    participants: sender.id ? [sender] : []
                };
                return [newChat, ...prevChats];
            }
        });
    }, [user?.id, selectedChatId]);

    const { isConnected, sendMessage } = useChatSocket(token, handleWebSocketMessage);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!messageInput.trim() || !selectedChatId) return;

        const messageData = {
            chatId: selectedChatId,
            text: messageInput,
            sender_id: user.id
        };

        const sent = sendMessage(messageData);

        if (sent) {
            const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const newMessage = { 
                id: Date.now(), 
                text: messageInput, 
                sender: { id: user.id, first_name: user.first_name, last_name: user.last_name },
                time: now 
            };

            setChats(prevChats => {
                const chatIndex = prevChats.findIndex(c => Number(c.id) === Number(selectedChatId));
                if (chatIndex === -1) return prevChats;

                const existingChat = prevChats[chatIndex];
                const updatedChat = {
                    ...existingChat,
                    messages: [...(existingChat.messages || []), newMessage],
                    lastMessage: messageInput,
                    time: now
                };

                const newChats = [...prevChats];
                newChats.splice(chatIndex, 1);
                return [updatedChat, ...newChats];
            });

            setMessageInput("");
            sendMessage({ type: 'typing', chatId: selectedChatId, isTyping: false });
        }
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
        <div className="h-[calc(100vh-64px)] p-0 sm:px-6 sm:py-4 flex flex-col sm:flex-row gap-4 sm:gap-6">
            <div className="flex-1 mt-6 flex overflow-hidden bg-[#071229] rounded-2xl border border-slate-800 shadow-2xl">
                {/* Sidebar */}
                <div className="w-full md:w-80 border-r border-slate-800 flex flex-col">
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
                                // Derive contact name/avatar - support participants, target_user, or customer field
                                const cust = chat.customer || {};
                                const otherParticipant = chat.participants?.find(p => Number(p.id) !== Number(user?.id)) 
                                    || chat.target_user 
                                    || {};
                                
                                // Robust name finding
                                const displayName = chat.name 
                                    || (cust.full_name)
                                    || (cust.first_name ? `${cust.first_name} ${cust.last_name}` : null)
                                    || (cust.user?.first_name ? `${cust.user.first_name} ${cust.user.last_name}` : null)
                                    || (otherParticipant.first_name ? `${otherParticipant.first_name} ${otherParticipant.last_name}` : null) 
                                    || (cust.user?.username)
                                    || cust.username || otherParticipant.username 
                                    || 'Customer';
                                    
                                const displayAvatar = chat.avatar || cust.profile_picture || otherParticipant.profile_picture;

                                if (displayName === 'Customer') {
                                    console.log(`🔍 [UI] Chat ${chat.id} defaulting to 'Customer'. Data:`, { chat, otherParticipant });
                                }

                                return (
                                            <button
                                                key={chat.id}
                                                onClick={() => handleSelectChat(chat)}
                                                className={`w-full flex items-center gap-3 p-4 hover:bg-slate-800/50 transition-colors border-b border-slate-800/50 ${Number(selectedChatId) === Number(chat.id) ? 'bg-blue-600/10 border-l-4 border-l-blue-600' : ''}`}
                                            >
                                        <div className="relative">
                                            <img 
                                                src={displayAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0D8ABC&color=fff`} 
                                                alt={displayName} 
                                                className="w-12 h-12 rounded-xl object-cover border border-slate-700" 
                                            />
                                            <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#071229] ${isConnected ? 'bg-green-500' : 'bg-slate-500'}`} />
                                        </div>
                                        <div className="flex-1 text-left overflow-hidden">
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className="text-sm font-bold text-white truncate">{displayName}</h4>
                                                <span className="text-[10px] text-slate-500 whitespace-nowrap">{chat.time}</span>
                                            </div>
                                            <p className={`text-xs truncate ${chat.isTyping ? 'text-green-500 font-bold' : 'text-slate-400'}`}>
                                                {chat.isTyping ? 'Typing...' : chat.lastMessage}
                                            </p>
                                        </div>
                                        {chat.unread > 0 && (
                                            <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                                {chat.unread}
                                            </span>
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Chat Window */}
                <div className="hidden md:flex flex-1 flex-col bg-[#0b1326]">
                    {activeChat ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#071229]">
                                <div className="flex items-center gap-3">
                                    {(() => {
                                        const otherParticipant = activeChat.participants?.find(p => Number(p.id) !== Number(user?.id)) 
                                            || activeChat.customer 
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
                                                    className="w-10 h-10 rounded-xl object-cover border border-slate-700" 
                                                />
                                                <div>
                                                    <h3 className="text-sm font-bold text-white uppercase tracking-tight">{displayName}</h3>
                                                    <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase ${isConnected ? 'text-green-500' : 'text-amber-500'}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
                                                        {isConnected ? 'Online' : 'Reconnecting...'}
                                                    </span>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>
                                <div className="flex items-center gap-4 text-slate-400">
                                    <button className="hover:text-blue-500 transition-colors"><Phone className="w-5 h-5" /></button>
                                    <button className="hover:text-blue-500 transition-colors"><Video className="w-5 h-5" /></button>
                                    <button className="hover:text-blue-500 transition-colors"><MoreVertical className="w-5 h-5" /></button>
                                </div>
                            </div>

                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
                                {isLoadingMessages ? (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                                    </div>
                                ) : Array.isArray(activeChat.messages) && (
                                    <>
                                        {activeChat.messages.map((msg) => {
                                            const isMe = Number(msg.sender?.id) === Number(user?.id);
                                            const senderName = msg.sender ? `${msg.sender.first_name} ${msg.sender.last_name}`.trim() : 'System';
                                            
                                            return (
                                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[70%] rounded-2xl p-3 shadow-lg ${isMe
                                                        ? 'bg-blue-600 text-white rounded-tr-none'
                                                        : 'bg-[#071229] border border-slate-800 text-slate-200 rounded-tl-none'
                                                        }`}>
                                                        {!isMe && <p className="text-[10px] font-bold text-blue-500 mb-1">{senderName}</p>}
                                                        <p className="text-sm">{msg.text}</p>
                                                        <span className={`text-[10px] block mt-1 ${isMe ? 'text-blue-200' : 'text-slate-500'}`}>
                                                            {msg.time || (msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '')}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {isTyping && (
                                            <div className="flex justify-start">
                                                <div className="bg-[#071229] border border-slate-800 text-slate-400 rounded-2xl px-4 py-3 rounded-tl-none shadow-lg shadow-blue-500/5">
                                                    <div className="flex gap-1.5 items-center">
                                                        <div className="flex gap-1">
                                                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-duration:1s] [animation-delay:-0.3s]" />
                                                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-duration:1s] [animation-delay:-0.15s]" />
                                                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-duration:1s]" />
                                                        </div>
                                                        <span className="text-[11px] font-bold ml-1 text-slate-400 uppercase tracking-widest italic">Typing...</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            <div className="p-4 bg-[#071229] border-t border-slate-800">
                                <form
                                    className="flex items-center gap-3 bg-[#0b1a2a] border border-slate-700 rounded-2xl px-4 py-2"
                                    onSubmit={handleSendMessage}
                                >
                                    <button type="button" className="text-slate-400 hover:text-blue-500"><Smile className="w-5 h-5" /></button>
                                    <button type="button" className="text-slate-400 hover:text-blue-500"><Paperclip className="w-5 h-5" /></button>
                                    <input
                                        type="text"
                                        value={messageInput}
                                        onChange={handleTyping}
                                        placeholder={isConnected ? "Type your message..." : "Waiting for connection..."}
                                        className="flex-1 bg-transparent border-none text-sm text-slate-200 focus:outline-none"
                                        disabled={!isConnected}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!isConnected}
                                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
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
