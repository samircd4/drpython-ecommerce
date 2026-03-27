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
                    // Ensure base is trimmed and has no trailing slash
                    const base = envWsUrl.trim().replace(/\/+$/, '');
                    // Ensure path starts with a single slash
                    const path = url.startsWith('/') ? url : '/' + url;
                    
                    fullUrl = `${base}${path}`;
                    
                    // Deduplicate /ws/ws or // if they happen
                    fullUrl = fullUrl.replace(/([^:])\/\//g, '$1/');
                    if (fullUrl.includes('/ws/ws/')) {
                        fullUrl = fullUrl.replace('/ws/ws/', '/ws/');
                    }
                } else {
                    // Fallback logic
                    const envApiUrl = import.meta.env.VITE_API_URL;
                    let host = window.location.host;
                    
                    if (envApiUrl && envApiUrl.startsWith('http')) {
                        try {
                            host = new URL(envApiUrl).host;
                        } catch (e) {}
                    }
                    fullUrl = `${protocol}//${host}${url}`;
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
