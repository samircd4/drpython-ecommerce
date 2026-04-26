import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const { user } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnreadCount = useCallback(async () => {
        if (!user) return;
        try {
            const response = await api.get('/chats/');
            const chats = Array.isArray(response.data) ? response.data : (response.data?.results || []);
            const total = chats.reduce((acc, chat) => acc + (chat.unread_count || 0), 0);
            setUnreadCount(total);
        } catch (err) {
            console.error("ChatContext: Failed to fetch unread count", err);
        }
    }, [user]);

    useEffect(() => {
        if (!user) {
            setUnreadCount(0);
            return;
        }

        fetchUnreadCount();
        
        // Refresh every 30 seconds
        const interval = setInterval(fetchUnreadCount, 30000);
        
        // Listen for manual refresh events (e.g., from Messages page)
        const handleRefresh = () => fetchUnreadCount();
        window.addEventListener('unreadCountRefresh', handleRefresh);
        
        return () => {
            clearInterval(interval);
            window.removeEventListener('unreadCountRefresh', handleRefresh);
        };
    }, [user, fetchUnreadCount]);

    return (
        <ChatContext.Provider value={{ unreadCount, refreshUnreadCount: fetchUnreadCount }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};
