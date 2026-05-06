import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute: React.FC = () => {
    const token = localStorage.getItem('token');
    const isAuthenticated = !!token && token !== 'null' && token !== 'undefined' && token !== '';

    console.log('[AuthCheck] Token:', token);
    console.log('[AuthCheck] Is Authenticated:', isAuthenticated);

    if (!isAuthenticated) {
        console.log('[AuthCheck] Not authenticated, redirecting to /login');
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
