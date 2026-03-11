import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../api/client';
import { useUser } from '../context/UserContext';

const BASE_URL = import.meta.env.VITE_API_URL;
const WS_BASE = BASE_URL.replace(/^http/, 'ws');
const WS_URL = WS_BASE.endsWith('/') 
    ? WS_BASE.replace(/\/api\/$/, '/ws/chat/') 
    : WS_BASE.replace(/\/api$/, '/ws/chat/');

export const useAdminChat = () => {
    const { user } = useUser();
    const [conversations, setConversations] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [loadingConversations, setLoadingConversations] = useState(false);
    const socketRef = useRef(null);

    // 1. Fetch all conversations
    const fetchConversations = useCallback(async () => {
        if (!user?.is_staff) return;
        try {
            setLoadingConversations(true);
            const res = await api.get('/chats/');
            const data = res.data.results || res.data;
            setConversations(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to fetch conversations:", err);
        } finally {
            setLoadingConversations(false);
        }
    }, [user]);

    useEffect(() => {
        if (user?.is_staff) {
            fetchConversations();
        }
    }, [user, fetchConversations]);

    // 2. Fetch messages when active chat changes
    useEffect(() => {
        if (activeChat && user?.is_staff) {
            api.get(`/chats/${activeChat.id}/messages/`)
                .then(res => {
                    const historyData = res.data.results || res.data;
                    const historyList = Array.isArray(historyData) ? historyData : [];
                    setMessages(historyList.map(msg => ({
                        id: msg.id,
                        text: msg.text,
                        from: msg.sender?.id === user.id ? 'admin' : 'user',
                        time: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    })));
                })
                .catch(err => console.error("Failed to fetch messages:", err));
            
            // Join group via WebSocket if already connected
            if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
                socketRef.current.send(JSON.stringify({ action: 'join', chatId: activeChat.id }));
            }
        } else {
            setMessages([]);
        }
    }, [activeChat, user]);

    // 3. WebSocket Connection
    useEffect(() => {
        if (!user?.is_staff) return;

        const token = localStorage.getItem('access_token');
        if (!token) return;

        const wsFullUrl = WS_URL.endsWith('/') ? `${WS_URL}?token=${token}` : `${WS_URL}/?token=${token}`;
        
        const socket = new WebSocket(wsFullUrl);
        socketRef.current = socket;

        socket.onopen = () => {
            setIsConnected(true);
            if (activeChat) {
                socket.send(JSON.stringify({ action: 'join', chatId: activeChat.id }));
            }
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                
                // If message is for active chat, add to list
                if (activeChat && parseInt(data.chatId) === parseInt(activeChat.id)) {
                    setMessages(prev => {
                        if (prev.find(m => m.id === data.id)) return prev;
                        return [...prev, {
                            id: data.id,
                            text: data.text,
                            from: data.sender?.role === 'admin' ? 'admin' : 'user',
                            time: data.time
                        }];
                    });
                }

                // Refresh conversations list to update last message/unread count
                fetchConversations();
            } catch (e) {
                console.error("Admin chat parse error:", e);
            }
        };

        socket.onclose = () => setIsConnected(false);
        socket.onerror = (err) => console.error("Admin WebSocket error:", err);

        return () => {
            if (socket.readyState === WebSocket.OPEN) {
                socket.close();
            }
        };
    }, [user, activeChat, fetchConversations]);

    const sendMessage = (text) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN && activeChat) {
            socketRef.current.send(JSON.stringify({
                chatId: activeChat.id,
                text: text
            }));
            return true;
        }
        return false;
    };

    return { conversations, activeChat, setActiveChat, messages, sendMessage, isConnected, loadingConversations };
};
