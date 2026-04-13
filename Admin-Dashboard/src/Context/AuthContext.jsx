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

    const loginWithGoogle = async (accessToken) => {
        try {
            const response = await api.post('/auth/google/', {
                access_token: accessToken
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
            await api.post('/auth/forgot-password/', { email });
        } catch (error) {
            throw error;
        }
    };


    const hasPermission = (permission) => {
        if (!permission) return true;
        if (user?.is_superuser) return true;
        
        const userPerms = user?.permissions || [];
        
        // Try direct match (e.g. 'accounts.delete_address')
        if (userPerms.includes(permission)) return true;
        
        // Try partial match if permission has a dot (e.g. match 'delete_address' against 'accounts.delete_address')
        if (permission.includes('.')) {
            const codename = permission.split('.')[1];
            if (userPerms.some(p => p.endsWith(codename))) return true;
        }
        
        return false;
    };

    return (
        <AuthContext.Provider value={{ 
            user, login, loginWithGoogle, register, logout, 
            resetPassword, fetchUserProfile, loading, hasPermission 
        }}>
            {!loading && children}
        </AuthContext.Provider>

    );
};

export const useAuth = () => useContext(AuthContext);
