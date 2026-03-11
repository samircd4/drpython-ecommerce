import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosConfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUserProfile = async () => {
        try {
            const response = await api.get('/customers/me/');
            const userData = response.data;

            // Enforce Superuser Restriction
            if (!userData.is_superuser && !userData.is_staff) {
                logout();
                throw new Error('Access denied. Only superusers or staff can access this dashboard.');
            }

            const userWithId = {
                ...userData,
                id: userData.id || userData.user_id || userData.pk
            };
            setUser(userWithId);
            localStorage.setItem('admin_user', JSON.stringify(userWithId));
            return userWithId;
        } catch (error) {
            console.error('Failed to fetch profile', error);
            if (error.status !== 403) logout();
            throw error;
        }
    };

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('access_token');
            if (token) {
                try {
                    await fetchUserProfile();
                } catch (e) {
                    console.error('Session expired or invalid');
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (identifier, password) => {
        try {
            // Flexible login: sending identifier as 'username' which helps many backends handle both email/username
            const response = await api.post('/auth/login/', {
                username: identifier,
                password
            });
            const { access, refresh } = response.data;

            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);

            return await fetchUserProfile();
        } catch (error) {
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            const response = await api.post('/auth/register/', userData);
            // Assuming register might also return tokens or require subsequent login
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('admin_user');
    };

    const resetPassword = async (email) => {
        try {
            await api.post('/auth/password/reset/', { email });
        } catch (error) {
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, resetPassword, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
