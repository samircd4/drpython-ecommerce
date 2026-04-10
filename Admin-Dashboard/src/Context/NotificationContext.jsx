import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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

    const fetchNotifications = useCallback(async () => {
        if (!user) {
            console.log("NotificationContext: No user yet, skipping fetch");
            return;
        }
        setLoading(true);
        try {
            console.log("NotificationContext: Fetching notifications...");
            const res = await api.get('/notifications/');
            console.log("NotificationContext Response:", res.data);
            const data = Array.isArray(res.data) ? res.data : (res.data?.results || []);
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.is_read).length);
        } catch (err) {
            console.error("NotificationContext: Error fetching", err);
            toast.error("Alert system sync failed");
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // WebSocket Integration
    const accessToken = localStorage.getItem('access_token');
    useNotificationSocket(accessToken, user?.id, (data) => {
        // Refresh when a new notification comes in via socket
        fetchNotifications();
        
        // Optional: show toast for specific types if not already handled
        if (data.type === 'new_order') {
            toast.success(`New Order Received!`, { icon: '🛒' });
        }
    });

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
            markAsRead,
            markAsUnread,
            markAllAsRead,
            clearAll,
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
