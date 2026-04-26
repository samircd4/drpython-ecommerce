import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import toast from 'react-hot-toast';

/**
 * ProtectedRoute component to guard routes based on user role and permissions.
 */
const ProtectedRoute = ({ children, requiredPermission = null }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="min-h-screen bg-[#071229] flex items-center justify-center text-blue-500 text-xl font-bold animate-pulse">Verifying Permissions...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Role-based logic
    const hasPermission = (permission) => {
        if (!permission) return true;
        if (user?.is_superuser) return true;
        return user?.permissions?.includes(permission);
    };

    if (requiredPermission && !hasPermission(requiredPermission)) {
        toast.error("Access Denied: You don't have permission to view this page.", {
            id: 'access-denied-toast',
            style: {
                background: '#1e0a0a',
                color: '#ff4d4d',
                border: '1px solid #3d1414',
            }
        });
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;
