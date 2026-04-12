import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

let cachedConfig = null;
let fetchPromise = null;

const getInitialConfig = () => {
    if (cachedConfig) return cachedConfig;
    const stored = sessionStorage.getItem('storeConfig');
    if (stored) {
        try {
            cachedConfig = JSON.parse(stored);
            return cachedConfig;
        } catch (e) {}
    }
    // Return empty defaults to prevent flashing of placeholder text
    return { website_name: '', favicon: null }; 
};

export const useStoreConfig = () => {
    const [config, setConfig] = useState(getInitialConfig());

    const refreshConfig = async () => {
        try {
            if (!fetchPromise) {
                fetchPromise = api.get('/configuration/');
            }
            const res = await fetchPromise;
            cachedConfig = res.data;
            sessionStorage.setItem('storeConfig', JSON.stringify(res.data));
            setConfig(res.data);
            
            // Apply document head immediately
            if (res.data.website_name) {
                document.title = `${res.data.website_name} - Admin Dashboard`;
            } else {
                document.title = 'Admin Dashboard';
            }
            if (res.data.favicon) {
                let link = document.querySelector("link[rel~='icon']");
                if (!link) {
                    link = document.createElement('link');
                    link.rel = 'icon';
                    document.head.appendChild(link);
                }
                link.href = res.data.favicon;
            }
        } catch (error) {
            console.error('Failed to fetch store config', error);
        } finally {
            // Reset promise so subsequent manual refreshes can hit the API
            setTimeout(() => { fetchPromise = null; }, 100);
        }
    };

    useEffect(() => {
        // If config is empty (first load of session), fetch it
        // Or we can always fetch it once per session if we want to ensure freshness
        // But for "only once per session", checking if cachedConfig exists is perfect.
        if (!sessionStorage.getItem('storeConfig')) {
            refreshConfig();
        } else {
            // Apply to document head instantly
            if (cachedConfig.website_name) {
                document.title = `${cachedConfig.website_name} - Admin Dashboard`;
            } else {
                document.title = 'Admin Dashboard';
            }
            if (cachedConfig.favicon) {
                let link = document.querySelector("link[rel~='icon']");
                if (!link) {
                    link = document.createElement('link');
                    link.rel = 'icon';
                    document.head.appendChild(link);
                }
                link.href = cachedConfig.favicon;
            }
        }
    }, []);

    const updateConfigLocal = (newConfig) => {
        const merged = { ...config, ...newConfig };
        cachedConfig = merged;
        sessionStorage.setItem('storeConfig', JSON.stringify(merged));
        setConfig(merged);
    };

    return { config, refreshConfig, updateConfigLocal };
};
