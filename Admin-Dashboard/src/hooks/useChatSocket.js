import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for managing Chat WebSockets
 * @param {string} token - JWT Access Token for authentication
 * @param {function} onMessage - Callback for incoming messages
 */
const useChatSocket = (token, onMessage) => {
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const reconnectAttemptsRef = useRef(0);
    const onMessageRef = useRef(onMessage);
    const isUnmountedRef = useRef(false);

    // Keep the callback ref fresh without triggering reconnects
    useEffect(() => {
        onMessageRef.current = onMessage;
    });

    useEffect(() => {
        if (!token) return;

        isUnmountedRef.current = false;

        const WS_URL = import.meta.env.VITE_WS_URL || 'wss://sarker.shop/ws/chat/';

        const connect = () => {
            if (isUnmountedRef.current) return;

            if (socketRef.current) {
                socketRef.current.onopen = null;
                socketRef.current.onmessage = null;
                socketRef.current.onerror = null;
                socketRef.current.onclose = null;
                if (
                    socketRef.current.readyState === WebSocket.OPEN ||
                    socketRef.current.readyState === WebSocket.CONNECTING
                ) {
                    socketRef.current.close(1000);
                }
                socketRef.current = null;
            }

            // Ensure URL ends correctly for query params
            const fullWsUrl = WS_URL.includes('?') 
                ? `${WS_URL}&token=${token}` 
                : `${WS_URL}${WS_URL.endsWith('/') ? '' : '/'}?token=${token}`;
            
            const socket = new WebSocket(fullWsUrl);
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
                    if (onMessageRef.current) onMessageRef.current(data);
                } catch (e) {
                    // ignore parse errors
                }
            };

            socket.onerror = () => {
                // Errors are always followed by onclose — reconnect handled there
            };

            socket.onclose = (event) => {
                if (isUnmountedRef.current) return;
                setIsConnected(false);

                if (event.code !== 1000) {
                    const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
                    reconnectTimeoutRef.current = setTimeout(() => {
                        reconnectAttemptsRef.current += 1;
                        connect();
                    }, delay);
                }
            };
        };

        // Small delay prevents React StrictMode from closing the socket before it connects
        const initialTimer = setTimeout(connect, 100);

        return () => {
            isUnmountedRef.current = true;
            clearTimeout(initialTimer);
            if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
            if (socketRef.current) {
                socketRef.current.onopen = null;
                socketRef.current.onmessage = null;
                socketRef.current.onerror = null;
                socketRef.current.onclose = null;
                if (
                    socketRef.current.readyState === WebSocket.OPEN ||
                    socketRef.current.readyState === WebSocket.CONNECTING
                ) {
                    socketRef.current.close(1000);
                }
                socketRef.current = null;
            }
            setIsConnected(false);
        };
    }, [token]);

    const sendMessage = (messageData) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({
                ...messageData,
                time: new Date().toISOString() // Let backend handle formatting, but send ISO for sync if needed
            }));
            return true;
        }
        return false;
    };

    const joinChat = (chatId) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({
                action: 'join',
                chatId: chatId
            }));
        }
    };

    return { isConnected, sendMessage, joinChat };
};

export default useChatSocket;
