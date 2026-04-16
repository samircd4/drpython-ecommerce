import { useState, useEffect } from "react";
import api from "../api/axiosConfig";

let cachedConfig = null;
let cachedTimestamp = null;
let fetchPromise = null;

// Cache expiration time: 5 minutes (300000 ms)
const CACHE_EXPIRATION_MS = 5 * 60 * 1000;

const isCacheStale = () => {
  if (!cachedTimestamp) return true;
  return Date.now() - cachedTimestamp > CACHE_EXPIRATION_MS;
};

const getInitialConfig = () => {
  if (cachedConfig && !isCacheStale()) return cachedConfig;

  const stored = sessionStorage.getItem("storeConfig");
  const storedTimestamp = sessionStorage.getItem("storeConfig_timestamp");

  if (stored && storedTimestamp) {
    try {
      // Check if stored cache is also stale
      if (Date.now() - parseInt(storedTimestamp) <= CACHE_EXPIRATION_MS) {
        cachedConfig = JSON.parse(stored);
        cachedTimestamp = parseInt(storedTimestamp);
        return cachedConfig;
      }
    } catch (e) {}
  }

  // Return empty defaults to prevent flashing of placeholder text
  return { website_name: "", favicon: null };
};

export const useStoreConfig = () => {
  const [config, setConfig] = useState(getInitialConfig());

  const clearCache = () => {
    cachedConfig = null;
    cachedTimestamp = null;
    sessionStorage.removeItem("storeConfig");
    sessionStorage.removeItem("storeConfig_timestamp");
  };

  const refreshConfig = async () => {
    try {
      if (!fetchPromise) {
        fetchPromise = api.get("/configuration/");
      }
      const res = await fetchPromise;
      const now = Date.now();

      cachedConfig = res.data;
      cachedTimestamp = now;
      sessionStorage.setItem("storeConfig", JSON.stringify(res.data));
      sessionStorage.setItem("storeConfig_timestamp", now.toString());
      setConfig(res.data);

      // Apply document head immediately
      if (res.data.website_name) {
        document.title = `${res.data.website_name} - Admin Dashboard`;
      } else {
        document.title = "Admin Dashboard";
      }
      if (res.data.favicon) {
        let link = document.querySelector("link[rel~='icon']");
        if (!link) {
          link = document.createElement("link");
          link.rel = "icon";
          document.head.appendChild(link);
        }
        link.href = res.data.favicon;
      }
    } catch (error) {
      console.error("Failed to fetch store config", error);
    } finally {
      // Reset promise so subsequent manual refreshes can hit the API
      setTimeout(() => {
        fetchPromise = null;
      }, 100);
    }
  };

  useEffect(() => {
    // If cache is stale or doesn't exist, fetch fresh config
    if (!sessionStorage.getItem("storeConfig") || isCacheStale()) {
      refreshConfig();
    } else {
      // Apply to document head instantly
      if (cachedConfig && cachedConfig.website_name) {
        document.title = `${cachedConfig.website_name} - Admin Dashboard`;
      } else {
        document.title = "Admin Dashboard";
      }
      if (cachedConfig && cachedConfig.favicon) {
        let link = document.querySelector("link[rel~='icon']");
        if (!link) {
          link = document.createElement("link");
          link.rel = "icon";
          document.head.appendChild(link);
        }
        link.href = cachedConfig.favicon;
      }
    }

    // Listen for config updates from current tab (custom event)
    const handleConfigUpdated = () => {
      clearCache();
      refreshConfig();
    };

    // Listen for config updates from other tabs (storage event)
    const handleStorageChange = (e) => {
      if (e.key === "storeConfigUpdated") {
        clearCache();
        refreshConfig();
      }
    };

    window.addEventListener("storeConfigUpdated", handleConfigUpdated);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storeConfigUpdated", handleConfigUpdated);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const updateConfigLocal = (newConfig) => {
    const merged = { ...config, ...newConfig };
    const now = Date.now();

    cachedConfig = merged;
    cachedTimestamp = now;
    sessionStorage.setItem("storeConfig", JSON.stringify(merged));
    sessionStorage.setItem("storeConfig_timestamp", now.toString());
    setConfig(merged);
  };

  return { config, refreshConfig, updateConfigLocal, clearCache };
};
