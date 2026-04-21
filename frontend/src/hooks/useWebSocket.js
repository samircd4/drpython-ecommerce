import { useState, useEffect, useRef } from 'react';

const useWebSocket = (url) => {
    const [data, setData] = useState(null);
    const [status, setStatus] = useState('connecting');
    const ws = useRef(null);
    const reconnectTimer = useRef(null);
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;

        if (!url) {
            setStatus('disconnected');
            return;
        }

        const connect = () => {
            // Don't connect if unmounted
            if (!isMounted.current) return;

            // Close existing connection if any
            if (ws.current) {
                ws.current.onclose = null; // Prevent triggering reconnect
                ws.current.close();
            }

            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            let fullUrl = url;

            if (!url.startsWith('ws')) {
                const envWsUrl = import.meta.env.VITE_WS_URL;
                let base;

                if (envWsUrl) {
                    base = envWsUrl.trim();
                } else {
                    const fallbackHost = window.location.host;
                    base = `${protocol}//${fallbackHost}`;
                }

                // Ensure path starts with a slash
                const path = url.startsWith('/') ? url : '/' + url;
                
                // Construct and normalize:
                // 1. Join base and path
                // 2. Replace multiple slashes with a single one (except after protocol)
                // 3. Specifically fix /ws/ws/ if it appears
                fullUrl = `${base}${path}`;
                
                // Normalize slashes (but preserve ws:// or wss://)
                fullUrl = fullUrl.replace(/([^:])\/\//g, '$1/');
                
                // Specific fix for the common /ws/ws/ issue
                if (fullUrl.includes('/ws/ws/')) {
                    fullUrl = fullUrl.replace('/ws/ws/', '/ws/');
                }
            }

            const token = localStorage.getItem('access_token');
            const fullWsUrl = token ? `${fullUrl}${fullUrl.includes('?') ? '&' : '?'}token=${token}` : fullUrl;

            const socket = new WebSocket(fullWsUrl);

            socket.onopen = () => {
                if (isMounted.current) {
                    console.log('WebSocket Connected:', fullUrl);
                    setStatus('connected');
                }
            };

            socket.onmessage = (event) => {
                if (isMounted.current) {
                    const message = JSON.parse(event.data);
                    setData(message);
                }
            };

            socket.onclose = (e) => {
                if (!isMounted.current) return;
                console.log('WebSocket Disconnected:', e.reason || 'No reason');
                setStatus('disconnected');

                // Reconnect after 3 seconds (only if still mounted)
                reconnectTimer.current = setTimeout(() => {
                    if (isMounted.current) {
                        console.log('Attempting WebSocket reconnect...');
                        connect();
                    }
                }, 3000);
            };

            socket.onerror = (err) => {
                console.error('WebSocket Error:', err);
                // Don't close here — onclose will fire automatically after onerror
            };

            ws.current = socket;
        };

        connect();

        // Cleanup on unmount or URL change
        return () => {
            isMounted.current = false;
            if (reconnectTimer.current) {
                clearTimeout(reconnectTimer.current);
            }
            if (ws.current) {
                ws.current.onclose = null; // Prevent reconnect on intentional close
                ws.current.close();
                ws.current = null;
            }
        };
    }, [url]); // Only re-run when URL changes

    return { data, status };
};

export default useWebSocket;
