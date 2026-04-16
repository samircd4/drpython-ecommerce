/**
 * useVisitorTrackingData Hook
 *
 * Establishes a WebSocket connection to the backend tracking service
 * and receives real-time visitor tracking updates for the admin dashboard.
 *
 * Usage:
 * const { visitors, isConnected } = useVisitorTrackingData();
 */

import { useEffect, useRef, useCallback, useState } from "react";

export const useVisitorTrackingData = () => {
  const websocketRef = useRef(null);
  const reconnectIntervalRef = useRef(null);
  const isConnectingRef = useRef(false);

  const [visitors, setVisitors] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

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

      console.log("[Admin Tracking] Connecting to:", wsUrl.toString());

      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("[Admin Tracking] WebSocket connected");
        isConnectingRef.current = false;
        setIsConnected(true);

        // Clear any existing reconnect interval
        if (reconnectIntervalRef.current) {
          clearInterval(reconnectIntervalRef.current);
          reconnectIntervalRef.current = null;
        }
      };

      ws.onmessage = (event) => {
        console.log("[Admin Tracking] Message received:", event.data);
        console.log("[Admin Tracking] Message type:", event.data);

        try {
          const message = JSON.parse(event.data);
          console.log("[Admin Tracking] Parsed message:", message);
          console.log(
            "[Admin Tracking] Message type check:",
            message.type,
            "visitor_data exists:",
            !!message.visitor_data,
          );

          if (message.type === "visitor_update" && message.visitor_data) {
            console.log(
              "[Admin Tracking] Calling handleVisitorUpdate with:",
              message.visitor_data,
            );
            handleVisitorUpdate(message.visitor_data);
          } else {
            console.warn(
              "[Admin Tracking] Message did not match expected format",
            );
          }
        } catch (error) {
          console.error("[Admin Tracking] Error parsing message:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("[Admin Tracking] WebSocket error:", error);
        isConnectingRef.current = false;
        setIsConnected(false);
      };

      ws.onclose = () => {
        console.log("[Admin Tracking] WebSocket closed");
        isConnectingRef.current = false;
        setIsConnected(false);

        // Attempt to reconnect after 5 seconds
        if (!reconnectIntervalRef.current) {
          reconnectIntervalRef.current = setTimeout(() => {
            connect();
          }, 5000);
        }
      };

      websocketRef.current = ws;
    } catch (error) {
      console.error("[Admin Tracking] Error creating WebSocket:", error);
      isConnectingRef.current = false;
      setIsConnected(false);

      // Attempt to reconnect after 5 seconds
      if (!reconnectIntervalRef.current) {
        reconnectIntervalRef.current = setTimeout(() => {
          connect();
        }, 5000);
      }
    }
  }, [getWebSocketURL]);

  // Handle incoming visitor update
  const handleVisitorUpdate = useCallback((visitorData) => {
    console.log(
      "[Admin Tracking] handleVisitorUpdate called with:",
      visitorData,
    );
    setVisitors((prevVisitors) => {
      // Find existing visitor using user_id (for logged-in users), email, or IP address (for guests)
      const existingIndex = prevVisitors.findIndex((v) => {
        // For logged-in users, match by user_id
        if (visitorData.user_id && visitorData.user_id !== null) {
          return v.user_id === visitorData.user_id;
        }
        // For registered guests with email, match by email
        if (visitorData.email && visitorData.email !== null) {
          return v.email === visitorData.email;
        }
        // For anonymous guests, match by IP address to track session
        if (visitorData.ip_address) {
          return v.ip_address === visitorData.ip_address;
        }
        return false;
      });

      // Format the timestamp to display time
      const formatTimestamp = (timestamp) => {
        if (!timestamp) return new Date().toLocaleTimeString();
        try {
          return new Date(timestamp).toLocaleTimeString();
        } catch (e) {
          return new Date().toLocaleTimeString();
        }
      };

      if (existingIndex > -1) {
        // Update existing visitor - MERGE all new data including cart_items
        const updated = [...prevVisitors];
        updated[existingIndex] = {
          ...updated[existingIndex],
          ...visitorData, // This spreads cart_items and all new data
          lastActive: formatTimestamp(visitorData.timestamp),
          lastUpdateTime: Date.now(), // Track when visitor was last updated
          isOffline: false, // Mark as online when update received
          id: updated[existingIndex].id, // Preserve id
        };
        console.log(
          "[Admin Tracking] Updated existing visitor with cart_items:",
          updated[existingIndex].cart_items,
          "Full visitor:",
          updated[existingIndex],
        );
        return updated;
      } else {
        // Add new visitor
        const newVisitor = {
          id: Date.now(), // Simple unique ID
          ...visitorData,
          lastActive: formatTimestamp(visitorData.timestamp),
          lastUpdateTime: Date.now(), // Track when visitor was added
          isOffline: false, // Not offline when first added
          isBlocked: false,
        };
        console.log(
          "[Admin Tracking] Added new visitor with cart_items:",
          newVisitor.cart_items,
        );
        return [...prevVisitors, newVisitor];
      }
    });
  }, []);

  // Connected to WebSocket on mount
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

  // Mark visitors as offline if no updates for 30 seconds
  useEffect(() => {
    const offlineCheckInterval = setInterval(() => {
      const now = Date.now();
      const OFFLINE_THRESHOLD = 30000; // 30 seconds

      setVisitors((prevVisitors) => {
        return prevVisitors.map((visitor) => {
          if (
            visitor.lastUpdateTime &&
            now - visitor.lastUpdateTime > OFFLINE_THRESHOLD
          ) {
            if (!visitor.isOffline) {
              console.log(
                `[Admin Tracking] Marking visitor ${visitor.name} (ID: ${visitor.id}) as offline - last update ${(now - visitor.lastUpdateTime) / 1000}s ago`,
              );
            }
            return { ...visitor, isOffline: true, sessionStatus: "Idle" };
          }
          return visitor;
        });
      });
    }, 5000); // Check every 5 seconds

    return () => clearInterval(offlineCheckInterval);
  }, []);

  // Expose state and functions
  return {
    visitors,
    isConnected,
    setVisitors, // Allow parent to manage visitors state (e.g., for blocking)
  };
};
