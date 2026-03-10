import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../api/client';
import { useUser } from '../context/UserContext';

const BASE_URL = import.meta.env.VITE_API_URL;
// Ensure we handle trailing slashes correctly and only replace the last /api if it exists
const WS_BASE = BASE_URL.replace(/^http/, 'ws');
const WS_URL = WS_BASE.endsWith('/') 
    ? WS_BASE.replace(/\/api\/$/, '/ws/chat/') 
    : WS_BASE.replace(/\/api$/, '/ws/chat/');

export const useChat = () => {
    const { user } = useUser();
    const [messages, setMessages] = useState([]);
    const [conversation, setConversation] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [loading, setLoading] = useState(true);
    const socketRef = useRef(null);

    // Initial setup: Fetch or create conversation and load history
    const initChat = useCallback(async () => {
        if (!user) return;
        try {
            setLoading(true);
            console.log("Initializing chat for user:", user.email);
            
            // 1. Get/Init conversation
            // Using trailing slash to match Django's default expectation
            const res = await api.get('/chats/init/');
            console.log("Conversation initialized:", res.data);
            setConversation(res.data);

            // 2. Fetch history
            const historyRes = await api.get(`/chats/${res.data.id}/messages/`);
            const historyData = historyRes.data.results || historyRes.data;
            const historyList = Array.isArray(historyData) ? historyData : [];
            
            setMessages(historyList.map(msg => ({
                id: msg.id,
                text: msg.text,
                from: msg.sender?.email === user.email ? 'user' : 'support',
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
        if (user) {
            initChat();
        }
    }, [user, initChat]);

    // WebSocket connection
    useEffect(() => {
        if (!conversation || !user) return;

        const token = localStorage.getItem('access_token');
        if (!token) {
            console.warn("No access token found for WebSocket");
            return;
        }

        // Ensure WS_URL check matches routing.py re_path(r'ws/chat/$', ...)
        // The URL should end in /ws/chat/
        const wsFullUrl = WS_URL.endsWith('/') ? `${WS_URL}?token=${token}` : `${WS_URL}/?token=${token}`;
        console.log("Connecting to WebSocket:", wsFullUrl.split('?')[0]); // Log without token
        
        const socket = new WebSocket(wsFullUrl);
        socketRef.current = socket;

        socket.onopen = () => {
            console.log("Chat WebSocket connected");
            setIsConnected(true);
            // Join the specific chat group
            socket.send(JSON.stringify({ action: 'join', chatId: conversation.id }));
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                const isMe = data.senderEmail === user.email;
                
                setMessages(prev => {
                    // Avoid duplicates if we just sent it
                    if (prev.find(m => m.id === data.id)) return prev;
                    
                    return [...prev, {
                        id: data.id,
                        text: data.text,
                        from: isMe ? 'user' : 'support',
                        time: data.time
                    }];
                });
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

    const sendMessage = (text) => {
        if (socketRef.current && isConnected && conversation) {
            socketRef.current.send(JSON.stringify({
                chatId: conversation.id,
                text: text
            }));
            return true;
        }
        console.warn("Cannot send message: socket not connected or no conversation");
        return false;
    };

    return { messages, sendMessage, isConnected, loading };
};
