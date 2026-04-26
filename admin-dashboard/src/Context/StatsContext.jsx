import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from './AuthContext';

const StatsContext = createContext();

export const StatsProvider = ({ children }) => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchStats = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const response = await api.get('/dashboard/stats/');
            setStats(response.data);
        } catch (err) {
            console.error("StatsContext: Failed to fetch dashboard stats", err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (!user) {
            setStats(null);
            return;
        }

        fetchStats();
        
        // Refresh every 60 seconds as requested
        const interval = setInterval(fetchStats, 60000);
        
        return () => clearInterval(interval);
    }, [user, fetchStats]);

    return (
        <StatsContext.Provider value={{ stats, loading, refreshStats: fetchStats }}>
            {children}
        </StatsContext.Provider>
    );
};

export const useStats = () => {
    const context = useContext(StatsContext);
    if (!context) {
        throw new Error('useStats must be used within a StatsProvider');
    }
    return context;
};
