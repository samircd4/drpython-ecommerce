import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from './AuthContext';
import useNotificationSocket from '../hooks/useNotificationSocket';
import toast from 'react-hot-toast';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const listenersRef = useRef(new Set());

    const fetchUnreadCount = useCallback(async () => {
        try {
            const res = await api.get('/notifications/unread_count/');
            setUnreadCount(res.data?.unread_count || 0);
        } catch (err) {
            console.error("NotificationContext: Error fetching unread count", err);
        }
    }, []);

    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const res = await api.get('/notifications/');
            setNotifications(Array.isArray(res.data) ? res.data : (res.data?.results || []));
            await fetchUnreadCount();
        } catch (err) {
            console.error("NotificationContext: Error fetching", err);
            toast.error("Could not load notifications");
        } finally {
            setLoading(false);
        }
    }, [user, fetchUnreadCount]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // Single WebSocket for the whole dashboard; components subscribe via hooks/useNotificationListener
    const { isConnected } = useNotificationSocket(user?.id, (data) => {
        setNotifications(prev => [data, ...prev.filter(n => n.id !== data.id)].slice(0, 50));
        if (!data.is_read) setUnreadCount(prev => prev + 1);

        if (data.type === 'new_order') {
            toast.success(data.message || 'New order received', { icon: '🛒', duration: 5000 });
        }
        listenersRef.current.forEach(listener => listener(data));
    });

    const subscribe = useCallback((listener) => {
        listenersRef.current.add(listener);
        return () => listenersRef.current.delete(listener);
    }, []);

    const markAsRead = async (id) => {
        try {
            await api.post(`/notifications/${id}/mark_read/`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error("Failed to mark notification as read", err);
        }
    };

    const markAsUnread = async (id) => {
        try {
            await api.post(`/notifications/${id}/mark_unread/`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: false } : n));
            setUnreadCount(prev => prev + 1);
        } catch (err) {
            console.error("Failed to mark notification as unread", err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.post('/notifications/mark_all_read/');
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error("Failed to mark all as read", err);
        }
    };

    const clearAll = async () => {
        try {
            await api.delete('/notifications/clear_all/');
            setNotifications([]);
            setUnreadCount(0);
        } catch (err) {
            console.error("Failed to clear notifications", err);
        }
    };

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            loading,
            isConnected,
            markAsRead,
            markAsUnread,
            markAllAsRead,
            clearAll,
            subscribe,
            refreshNotifications: fetchNotifications
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

