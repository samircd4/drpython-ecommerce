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

            // 1. If we have a dedicated WS URL defined in .env, use it
            const envWsUrl = import.meta.env.VITE_WS_URL;
            
            if (!url.startsWith('ws')) {
                if (envWsUrl) {
                    // Remove trailing slash if present
                    const base = envWsUrl.endsWith('/') ? envWsUrl.slice(0, -1) : envWsUrl;
                    fullUrl = `${base}${url}`;
                } else {
                    // Fallback to VITE_API_URL or window.location.host
                    const envApiUrl = import.meta.env.VITE_API_URL;
                    let host = window.location.host; // Default to current browser host
                    
                    if (envApiUrl && envApiUrl.startsWith('http')) {
                        try {
                            host = new URL(envApiUrl).host;
                        } catch (e) {
                            console.warn("Failed to parse VITE_API_URL for WebSocket host, using window.location.host", e);
                        }
                    }
                    
                    fullUrl = `${protocol}//${host}${url}`;
                }
            }
            
            // Final check: Remove double slashes or redundant /ws/ if they appear due to concatenation
            fullUrl = fullUrl.replace(/([^:])\/\//g, '$1/');

            const socket = new WebSocket(fullUrl);

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
