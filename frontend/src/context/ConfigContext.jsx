import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const ConfigContext = createContext(null);

export const ConfigProvider = ({ children }) => {
    const [config, setConfig] = useState(() => {
        const cached = sessionStorage.getItem('storeConfig');
        if (cached) {
            try {
                return JSON.parse(cached);
            } catch (e) {
                return null;
            }
        }
        return null;
    });

    const refreshConfig = async () => {
        try {
            const res = await api.get('/configuration/');
            const data = res.data;
            setConfig(data);
            sessionStorage.setItem('storeConfig', JSON.stringify(data));
            
            // Sync with document head
            if (data.website_name) {
                document.title = data.website_name;
            }
            if (data.favicon) {
                let link = document.querySelector("link[rel~='icon']");
                if (!link) {
                    link = document.createElement('link');
                    link.rel = 'icon';
                    document.head.appendChild(link);
                }
                link.href = data.favicon;
            }
        } catch (error) {
            console.error('Failed to fetch store configuration:', error);
        }
    };

    useEffect(() => {
        // Always fetch once per session to ensure freshness, 
        // but the cached value serves the initial render.
        refreshConfig();
    }, []);

    return (
        <ConfigContext.Provider value={{ config, refreshConfig }}>
            {children}
        </ConfigContext.Provider>
    );
};

export const useConfig = () => {
    const context = useContext(ConfigContext);
    if (!context) {
        throw new Error('useConfig must be used within a ConfigProvider');
    }
    return context;
};
