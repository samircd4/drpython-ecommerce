import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../api/client";
import React from 'react'

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = useCallback(async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await api.get('/customers/me/');
            setUser(response.data);
        } catch (error) {
            console.error("Error fetching user profile:", error);
            setUser(null);
            // If token is invalid, we might want to clear it, but let's be careful
            if (error.response?.status === 401) {
                // localStorage.removeItem('access_token');
                // localStorage.removeItem('refresh_token');
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
    };

    return (
        <UserContext.Provider value={{ user, setUser, loading, refreshUser: fetchUser, logout }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
};
