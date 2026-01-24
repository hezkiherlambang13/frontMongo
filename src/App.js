// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { AuthProvider, useAuth } from './contex/AuthContext';
// import Navbar from './components/Navbar';
// import LandingPage from './pages/LandingPage';
// import LoginPage from './pages/LoginPage';
// import CustomerPage from './pages/CustomerPage';
// import AdminDashboard from './pages/AdminDashboard';
// import ManagerDashboard from './pages/ManagerDashboard';
// import ProtectedRoute from './components/ProtectedRoute';

// const AppContent = () => {
//   const { user, loading } = useAuth();

//   if (loading) return <div className="text-center mt-10">Memuat...</div>;

//   return (
//     <>
//       <Navbar />
//       <Routes>
//         <Route path="/" element={<LandingPage />} />
//         <Route path="/login" element={<LoginPage />} />

//         <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
//           <Route path="/customer" element={<CustomerPage />} />
//         </Route>

//         <Route element={<ProtectedRoute allowedRoles={['admin', 'manager']} />}>
//           <Route path="/admin" element={<AdminDashboard />} />
//         </Route>

//         <Route element={<ProtectedRoute allowedRoles={['manager']} />}>
//           <Route path="/manager" element={<ManagerDashboard />} />
//         </Route>

//         <Route path="*" element={<Navigate to="/" />} />
//       </Routes>
//     </>
//   );
// };

// const App = () => {
//   return (
//     <AuthProvider>
//       <Router>
//         <AppContent />
//       </Router>
//     </AuthProvider>
//   );
// };

// export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import AdminDashboard from './pages/Admin/AdminDashboard.js';
import CustomerDashboard from './pages/Customer/CustomerDashboard.js';
import ManagerDashboard from './pages/Manager/ManagerDashboard.js';
import NotFound from './pages/NotFound.js';
import './App.css';

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

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Redirect based on role
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

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on role
  switch (user.role) {
    case 'admin':
      return <Navigate to="/admin/dashboard" replace />;
    case 'manager':
      return <Navigate to="/manager/dashboard" replace />;
    case 'customer':
      return <Navigate to="/customer/dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Root - redirect based on role */}
          <Route path="/" element={<RoleBasedRedirect />} />

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

          {/* Customer Routes */}
          <Route
            path="/customer/dashboard"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />

          {/* 404 & Unauthorized */}
          <Route path="/unauthorized" element={<NotFound message="Unauthorized Access" />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;