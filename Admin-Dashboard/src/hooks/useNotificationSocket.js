import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for managing Notification WebSockets
 * @param {string} token - JWT Access Token
 * @param {number} userId - ID of the current user
 * @param {function} onNotification - Callback for incoming notifications
 */
const useNotificationSocket = (token, userId, onNotification) => {
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
        if (!token || !userId) {
            console.log("WS Notification: Missing token or userId, skipping connection", { token: !!token, userId });
            return;
        }

        isUnmountedRef.current = false;
        const BASE_WS = (import.meta.env.VITE_WS_URL || 'ws://127.0.0.1:8000').trim();
        const apiPath = `/ws/notifications/${userId}/`;

        // Robust normalization
        let WS_URL = `${BASE_WS}${apiPath}`;
        WS_URL = WS_URL.replace(/([^:])\/\//g, '$1/'); // Fix // but keep wss://
        if (WS_URL.includes('/ws/ws/')) {
            WS_URL = WS_URL.replace('/ws/ws/', '/ws/'); // Deduplicate /ws/
        }

        const connect = () => {
            if (isUnmountedRef.current) return;

            if (socketRef.current) {
                socketRef.current.close(1000);
            }

            const fullWsUrl = `${WS_URL}?token=${token}`;
            console.log(`WS Notification: Connecting to ${WS_URL}...`);
            
            const socket = new WebSocket(fullWsUrl);
            socketRef.current = socket;

            socket.onopen = () => {
                if (isUnmountedRef.current) return;
                console.log("WS Notification: Connected! ✅");
                setIsConnected(true);
                reconnectAttemptsRef.current = 0;
            };

            socket.onmessage = (event) => {
                if (isUnmountedRef.current) return;
                console.log("WS Notification: Message received 📩", event.data);
                try {
                    const data = JSON.parse(event.data);
                    if (onNotificationRef.current) onNotificationRef.current(data);
                } catch (e) {
                    console.error("WS Notification: Parse error", e);
                }
            };

            socket.onclose = (event) => {
                if (isUnmountedRef.current) return;
                console.log(`WS Notification: Disconnected ❌ (Code: ${event.code})`);
                setIsConnected(false);
                if (event.code !== 1000) {
                    const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000);
                    console.log(`WS Notification: Reconnecting in ${delay}ms... (Attempt ${reconnectAttemptsRef.current + 1})`);
                    reconnectTimeoutRef.current = setTimeout(() => {
                        reconnectAttemptsRef.current += 1;
                        connect();
                    }, delay);
                }
            };

            socket.onerror = (err) => {
                console.error("WS Notification: Socket error", err);
            };
        };

        const initialTimer = setTimeout(connect, 100);

        return () => {
            isUnmountedRef.current = true;
            clearTimeout(initialTimer);
            if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
            if (socketRef.current) socketRef.current.close(1000);
        };
    }, [token, userId]);

    return { isConnected };
};

export default useNotificationSocket;
