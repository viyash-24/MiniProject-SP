import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false, disallowAdmin = false }) => {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  // Determine if the user has admin access, considering both Firestore role and environment variable override
  const adminEmailEnv = (process.env.REACT_APP_ADMIN_EMAIL || '').toLowerCase();
  const emailMatchesEnv = (user?.email || '').toLowerCase() === adminEmailEnv && !!adminEmailEnv;
  const hasAdminAccess = isAdmin || emailMatchesEnv;

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (requireAdmin && !hasAdminAccess) return <Navigate to="/" replace />;
  if (disallowAdmin && hasAdminAccess) return <Navigate to="/admin" replace />;
  return children;
};

export default ProtectedRoute;
