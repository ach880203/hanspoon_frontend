
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="container mt-5 d-flex justify-content-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (!user) {
        // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (requiredRole && !user.role?.includes(requiredRole)) {
        console.log('[ProtectedRoute] Access Denied. User role:', user.role, 'Required:', requiredRole);
        // 권한이 없는 경우 홈으로 리다이렉트 (또는 에러 페이지)
        alert('접근 권한이 없습니다.');
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
