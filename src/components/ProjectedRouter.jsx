import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/login" />;

  if (!allowedRoles.includes(user.role)) {
    if (user.role === 'customer') return <Navigate to="/customer" />;
    if (user.role === 'admin') return <Navigate to="/admin" />;
    if (user.role === 'manager') return <Navigate to="/manager" />;
  }

  return <Outlet />;
};

export default ProtectedRoute;