import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { packageAPI, bookingAPI } from '../../services/api';
import PackageForm from '../../components/PackageForm';
import PackageList from '../../components/PackageList';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [packages, setPackages] = useState([]);
  const [stats, setStats] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('packages');

  useEffect(() => {
    fetchPackages();
    fetchStats();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await packageAPI.getAll();
      setPackages(response.data.data);
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await bookingAPI.getStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleAddPackage = () => {
    setEditingPackage(null);
    setShowForm(true);
  };

  const handleEditPackage = (pkg) => {
    setEditingPackage(pkg);
    setShowForm(true);
  };

  const handleDeletePackage = async (id) => {
    if (window.confirm('Are you sure you want to delete this package?')) {
      try {
        await packageAPI.delete(id);
        fetchPackages();
        alert('Package deleted successfully!');
      } catch (error) {
        alert('Failed to delete package: ' + error.response?.data?.message);
      }
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingPackage(null);
    fetchPackages();
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <h2>📸 Studio Bion</h2>
          <span className="admin-badge">Admin</span>
        </div>
        
        <div className="sidebar-user">
          <div className="user-avatar">{user?.name?.charAt(0)}</div>
          <div className="user-info">
            <h3>{user?.name}</h3>
            <p>{user?.email}</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={activeTab === 'dashboard' ? 'active' : ''}
            onClick={() => setActiveTab('dashboard')}
          >
            <span className="nav-icon">📊</span>
            Dashboard
          </button>
          <button 
            className={activeTab === 'packages' ? 'active' : ''}
            onClick={() => setActiveTab('packages')}
          >
            <span className="nav-icon">📦</span>
            Packages
          </button>
          <button 
            className={activeTab === 'bookings' ? 'active' : ''}
            onClick={() => setActiveTab('bookings')}
          >
            <span className="nav-icon">📅</span>
            Bookings
          </button>
          <button onClick={logout} className="logout-btn">
            <span className="nav-icon">🚪</span>
            Logout
          </button>
        </nav>
      </div>

      <div className="admin-content">
        <div className="content-header">
          <h1>
            {activeTab === 'dashboard' && '📊 Dashboard'}
            {activeTab === 'packages' && '📦 Package Management'}
            {activeTab === 'bookings' && '📅 Booking Management'}
          </h1>
        </div>

        {activeTab === 'dashboard' && stats && (
          <div className="stats-grid">
            <div className="stat-card stat-primary">
              <div className="stat-icon">📦</div>
              <div className="stat-info">
                <h3>{packages.length}</h3>
                <p>Total Packages</p>
              </div>
            </div>
            <div className="stat-card stat-warning">
              <div className="stat-icon">⏳</div>
              <div className="stat-info">
                <h3>{stats.pendingBookings}</h3>
                <p>Pending Bookings</p>
              </div>
            </div>
            <div className="stat-card stat-success">
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <h3>{stats.completedBookings}</h3>
                <p>Completed</p>
              </div>
            </div>
            <div className="stat-card stat-info">
              <div className="stat-icon">💰</div>
              <div className="stat-info">
                <h3>Rp {stats.totalRevenue.toLocaleString()}</h3>
                <p>Total Revenue</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'packages' && (
          <div className="packages-section">
            <div className="section-header">
              <button className="btn-add-package" onClick={handleAddPackage}>
                ➕ Add New Package
              </button>
            </div>

            {loading ? (
              <div className="loading">Loading packages...</div>
            ) : (
              <PackageList 
                packages={packages}
                onEdit={handleEditPackage}
                onDelete={handleDeletePackage}
                isAdmin={true}
              />
            )}
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="bookings-section">
            <p className="coming-soon">Booking management coming in next section...</p>
          </div>
        )}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <PackageForm 
              package={editingPackage}
              onSuccess={handleFormSuccess}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;