/**
 * useVisitorTracking Hook
 *
 * Establishes a WebSocket connection to the backend tracking service
 * and sends visitor tracking data whenever the page/route changes.
 *
 * Usage:
 * const { isConnected } = useVisitorTracking();
 */

import { useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";

export const useVisitorTracking = () => {
  const websocketRef = useRef(null);
  const reconnectIntervalRef = useRef(null);
  const location = useLocation();
  const isConnectingRef = useRef(false);

  // Get the WebSocket URL from environment or use default
  const getWebSocketURL = useCallback(() => {
    const wsUrl = import.meta.env.VITE_TRACKING_WS_URL || "ws://localhost:8001";
    const protocol = wsUrl.startsWith("https") ? "wss" : "ws";

    // Ensure URL format is correct
    let url = wsUrl.replace(/^https?:/, "").replace(/^wss?:/, "");
    return `${protocol}:${url}`;
  }, []);

  // Establish WebSocket connection
  const connect = useCallback(() => {
    if (websocketRef.current?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    if (isConnectingRef.current) {
      return; // Already attempting to connect
    }

    isConnectingRef.current = true;

    try {
      const wsUrl = new URL(getWebSocketURL());
      wsUrl.pathname = "/ws/live-insights/";

      // Add authentication token if available
      try {
        const token = localStorage.getItem("access_token");
        if (token) {
          wsUrl.searchParams.append("token", token);
        }
      } catch (e) {
        // localStorage might not be available in some environments
      }

      console.log("[Visitor Tracking] Connecting to:", wsUrl.toString());

      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("[Visitor Tracking] WebSocket connected");
        isConnectingRef.current = false;

        // Clear any existing reconnect interval
        if (reconnectIntervalRef.current) {
          clearInterval(reconnectIntervalRef.current);
          reconnectIntervalRef.current = null;
        }

        // Send initial tracking data
        sendTrackingData();
      };

      ws.onmessage = (event) => {
        console.log("[Visitor Tracking] Message received:", event.data);
        // The frontend doesn't need to process responses from the tracking server
        // These are meant for the admin dashboard
      };

      ws.onerror = (error) => {
        console.error("[Visitor Tracking] WebSocket error:", error);
        isConnectingRef.current = false;
      };

      ws.onclose = () => {
        console.log("[Visitor Tracking] WebSocket closed");
        isConnectingRef.current = false;

        // Attempt to reconnect after 5 seconds
        if (!reconnectIntervalRef.current) {
          reconnectIntervalRef.current = setTimeout(() => {
            connect();
          }, 5000);
        }
      };

      websocketRef.current = ws;
    } catch (error) {
      console.error("[Visitor Tracking] Error creating WebSocket:", error);
      isConnectingRef.current = false;

      // Attempt to reconnect after 5 seconds
      if (!reconnectIntervalRef.current) {
        reconnectIntervalRef.current = setTimeout(() => {
          connect();
        }, 5000);
      }
    }
  }, [getWebSocketURL]);

  // Send tracking data to the backend
  const sendTrackingData = useCallback(() => {
    if (websocketRef.current?.readyState !== WebSocket.OPEN) {
      console.warn("[Visitor Tracking] WebSocket not connected, skipping send");
      return;
    }

    try {
      // Get cart items count from localStorage or sessionStorage
      const cartItems = (() => {
        try {
          const cart = JSON.parse(localStorage.getItem("cart") || "[]");
          return Array.isArray(cart) ? cart.length : 0;
        } catch {
          return 0;
        }
      })();

      const trackingData = {
        type: "page_view",
        page_url: location.pathname,
        cart_items: cartItems,
        timestamp: new Date().toISOString(),
      };

      websocketRef.current.send(JSON.stringify(trackingData));
      console.log("[Visitor Tracking] Data sent:", trackingData);
    } catch (error) {
      console.error("[Visitor Tracking] Error sending tracking data:", error);
    }
  }, [location.pathname]);

  // Connect to WebSocket on mount
  useEffect(() => {
    connect();

    return () => {
      // Clean up on unmount
      if (websocketRef.current) {
        websocketRef.current.close();
      }
      if (reconnectIntervalRef.current) {
        clearTimeout(reconnectIntervalRef.current);
      }
    };
  }, [connect]);

  // Send tracking data whenever the route changes
  useEffect(() => {
    sendTrackingData();
  }, [location.pathname, sendTrackingData]);

  // Expose connection status
  const isConnected = websocketRef.current?.readyState === WebSocket.OPEN;

  return { isConnected };
};
