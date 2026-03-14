import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../api/client';
import { useUser } from '../context/UserContext';

const BASE_URL = import.meta.env.VITE_API_URL;
// Ensure we handle trailing slashes correctly and only replace the last /api if it exists
const WS_BASE = BASE_URL.replace(/^http/, 'ws');
const WS_URL = WS_BASE.endsWith('/') 
    ? WS_BASE.replace(/\/api\/$/, '/ws/chat/') 
    : WS_BASE.replace(/\/api$/, '/ws/chat/');

// Helper to get or create a persistent guest_id
const getGuestId = () => {
    let gid = localStorage.getItem('guest_chat_id');
    if (!gid) {
        // Fallback for randomUUID if not available
        gid = typeof crypto.randomUUID === 'function' 
            ? crypto.randomUUID() 
            : 'guest-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('guest_chat_id', gid);
    }
    return gid;
};

export const useChat = () => {
    const { user } = useUser();
    const guestIdRef = useRef(getGuestId());
    const [messages, setMessages] = useState([]);
    const [conversation, setConversation] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [loading, setLoading] = useState(true);
    const socketRef = useRef(null);

    // Initial setup: Fetch or create conversation and load history
    const initChat = useCallback(async () => {
        try {
            setLoading(true);
            // 1. Get/Init conversation
            const res = await api.get('/chats/init/', { 
                params: !user ? { guest_id: guestIdRef.current } : {} 
            });
            
            if (!res.data || !res.data.id) {
                throw new Error("Invalid conversation data received");
            }
            
            setConversation(res.data);

            // 2. Fetch history
            const historyRes = await api.get(`/chats/${res.data.id}/messages/`, { 
                params: !user ? { guest_id: guestIdRef.current } : {}
            });
            const historyData = historyRes.data.results || historyRes.data;
            const historyList = Array.isArray(historyData) ? historyData : [];
            
            setMessages(historyList.map(msg => ({
                id: msg.id,
                text: msg.text,
                image: msg.image,
                video: msg.video,
                sender: msg.sender,
                guest_id: msg.guest_id,
                parent_message_id: msg.parent_message_id,
                reactions: msg.reactions || {},
                from: (user && msg.sender?.email === user.email) || (!user && msg.guest_id === guestIdRef.current) ? 'user' : 'support',
                time: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            })));
        } catch (err) {
            console.error("Failed to init chat details:", {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status
            });
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        initChat();
    }, [user, initChat]);

    // WebSocket connection
    useEffect(() => {
        if (!conversation) return;

        const token = localStorage.getItem('access_token');
        let wsFullUrl = WS_URL;
        
        if (token) {
            wsFullUrl = wsFullUrl.endsWith('/') ? `${WS_URL}?token=${token}` : `${WS_URL}/?token=${token}`;
        } else {
            const gid = guestIdRef.current;
            // Use & if ? already exists, but WS_URL shouldn't have it normally
            const separator = wsFullUrl.includes('?') ? '&' : '?';
            wsFullUrl = wsFullUrl.endsWith('/') ? `${wsFullUrl}${separator}guest_id=${gid}` : `${wsFullUrl}/${separator}guest_id=${gid}`;
        }
        console.log("Connecting to WebSocket:", wsFullUrl.split('?')[0]); // Log without token
        
        const socket = new WebSocket(wsFullUrl);
        socketRef.current = socket;

        socket.onopen = () => {
            console.log("Chat WebSocket connected");
            setIsConnected(true);
            
            // Explicitly join the chat group for real-time messages
            if (conversation?.id) {
                console.log("Joining chat room:", conversation.id);
                socket.send(JSON.stringify({
                    action: 'join',
                    chatId: conversation.id
                }));
            }
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                const type = data.type;

                if (type === 'reaction_update') {
                    setMessages(prev => prev.map(msg => 
                        Number(msg.id) === Number(data.message_id) ? { ...msg, reactions: data.reactions } : msg
                    ));
                    return;
                }

                if (type === 'chat_message' || !type) {
                    const msgData = data.message || data;
                    const isMe = (user && msgData.sender?.email === user.email) || 
                                 (!user && msgData.guest_id === guestIdRef.current);
                    
                    setMessages(prev => {
                        // Avoid duplicates
                        if (prev.find(m => m.id === msgData.id)) return prev;
                        
                        return [...prev, {
                            id: msgData.id,
                            text: msgData.text,
                            image: msgData.image,
                            video: msgData.video,
                            sender: msgData.sender,
                            guest_id: msgData.guest_id,
                            parent_message_id: msgData.parent_message_id,
                            reactions: msgData.reactions || {},
                            from: isMe ? 'user' : 'support',
                            time: msgData.time
                        }];
                    });
                }
            } catch (e) {
                console.error("Failed to parse WebSocket message:", e);
            }
        };

        socket.onerror = (err) => {
            console.error("WebSocket error:", err);
        };

        socket.onclose = (event) => {
            console.log("Chat WebSocket disconnected", event.code, event.reason);
            setIsConnected(false);
        };

        return () => {
            if (socket.readyState === WebSocket.OPEN) {
                socket.close();
            }
        };
    }, [conversation, user]);

    const sendMessage = (payload) => {
        console.log("DEBUG: sendMessage attempt", payload);
        if (socketRef.current && isConnected && conversation) {
            const data = typeof payload === 'string' 
                ? { type: 'chat_message', chatId: conversation.id, text: payload }
                : { ...payload, chatId: conversation.id };
            
            console.log("DEBUG: sending via WebSocket", data);
            socketRef.current.send(JSON.stringify(data));
            return true;
        }
        console.warn("DEBUG: sendMessage failed - state:", { 
            hasSocket: !!socketRef.current, 
            isConnected, 
            hasConv: !!conversation 
        });
        return false;
    };

    return { messages, sendMessage, isConnected, loading, guest_id: guestIdRef.current };
};
