// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import Home from './pages/Home.js';
import Login from './pages/Login';
import AdminDashboard from './pages/Admin/AdminDashboard.js';
import CustomerDashboard from './pages/Customer/CustomerDashboard.js';
import ManagerDashboard from './pages/Manager/ManagerDashboard.js';
import NotFound from './pages/NotFound.js';
import './App.css';
import api from './services/api';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Redirect based on role setelah login
const RoleBasedRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'admin':
      return <Navigate to="/admin/dashboard" replace />;
    case 'manager':
      return <Navigate to="/manager/dashboard" replace />;
    case 'user': // ✅ role di DB adalah 'user', bukan 'customer'
      return <Navigate to="/customer/dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export const emailTemplateAPI = {
  get: () => api.get('/email-template'),
  update: (data) => api.put('/email-template', data),
  reset: () => api.post('/email-template/reset'),
};

export const managerStatsAPI = {
  get: (params) => api.get('/bookings/manager-stats', { params }),
};

function App() {
  return (
   
      <AuthProvider>
       <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Manager Routes */}
          <Route
            path="/manager/dashboard"
            element={
              <ProtectedRoute allowedRoles={['manager']}>
                <ManagerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Customer Routes — role di DB: 'user' */}
          <Route
            path="/customer/dashboard"
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />

          {/* 404 & Unauthorized */}
          <Route path="/unauthorized" element={<NotFound message="Unauthorized Access" />} />
          <Route path="*" element={<NotFound />} />
         </Routes>
        </Router>
      </AuthProvider>
  );
}

export default App;
