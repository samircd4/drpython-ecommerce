import { useState, useEffect, useRef } from 'react';
import api from '../api/axiosConfig';

// Server closes with 4003 when the token is missing/expired or the user id does not match
const AUTH_REJECTED = 4003;

/**
 * Custom hook for managing the Notification WebSocket.
 * Use it once (NotificationContext); other components subscribe through that context.
 * @param {number} userId - ID of the current user
 * @param {function} onNotification - Callback for incoming notifications
 */
const useNotificationSocket = (userId, onNotification) => {
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const reconnectAttemptsRef = useRef(0);
    const onNotificationRef = useRef(onNotification);
    const isUnmountedRef = useRef(false);

    useEffect(() => {
        onNotificationRef.current = onNotification;
    });

    useEffect(() => {
        if (!userId) return;

        isUnmountedRef.current = false;
        const BASE_WS = (import.meta.env.VITE_WS_URL || 'ws://127.0.0.1:8000').trim();
        const apiPath = `/ws/notifications/${userId}/`;

        // Robust normalization
        let WS_URL = `${BASE_WS}${apiPath}`;
        WS_URL = WS_URL.replace(/([^:])\/\//g, '$1/'); // Fix // but keep wss://
        if (WS_URL.includes('/ws/ws/')) {
            WS_URL = WS_URL.replace('/ws/ws/', '/ws/'); // Deduplicate /ws/
        }

        const scheduleReconnect = () => {
            const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
            reconnectTimeoutRef.current = setTimeout(() => {
                reconnectAttemptsRef.current += 1;
                connect();
            }, delay);
        };

        const connect = () => {
            if (isUnmountedRef.current) return;

            // Read the token at connect time so reconnects pick up refreshed tokens
            const token = localStorage.getItem('access_token');
            if (!token) return;

            if (socketRef.current) {
                socketRef.current.close(1000);
            }

            const socket = new WebSocket(`${WS_URL}?token=${token}`);
            socketRef.current = socket;

            socket.onopen = () => {
                if (isUnmountedRef.current) return;
                setIsConnected(true);
                reconnectAttemptsRef.current = 0;
            };

            socket.onmessage = (event) => {
                if (isUnmountedRef.current) return;
                try {
                    const data = JSON.parse(event.data);
                    if (onNotificationRef.current) onNotificationRef.current(data);
                } catch (e) {
                    console.error("WS Notification: Parse error", e);
                }
            };

            socket.onclose = (event) => {
                if (isUnmountedRef.current) return;
                setIsConnected(false);
                if (event.code === 1000) return;

                if (event.code === AUTH_REJECTED) {
                    // Any authenticated request lets the axios interceptor refresh an expired token
                    api.get('/notifications/unread_count/')
                        .then(scheduleReconnect)
                        .catch(() => { /* refresh failed: user is logged out, stop reconnecting */ });
                } else {
                    scheduleReconnect();
                }
            };
        };

        const initialTimer = setTimeout(connect, 100);

        return () => {
            isUnmountedRef.current = true;
            clearTimeout(initialTimer);
            if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
            if (socketRef.current) socketRef.current.close(1000);
        };
    }, [userId]);

    return { isConnected };
};

export default useNotificationSocket;
