import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { bookingAPI } from '../../services/api';
import './ManagerDashboard.css';

const ManagerDashboard = () => {
  const { user, logout } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
    fetchStats();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await bookingAPI.getAll();
      setBookings(response.data.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
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

  const handleUpdateStatus = async (bookingId, status) => {
    const confirmMessage = status === 'approved' 
      ? 'Are you sure you want to approve this booking?'
      : 'Are you sure you want to reject this booking?';
    
    if (window.confirm(confirmMessage)) {
      try {
        await bookingAPI.updateStatus(bookingId, status);
        fetchBookings();
        fetchStats();
        alert(`Booking ${status} successfully!`);
      } catch (error) {
        alert('Failed to update booking: ' + error.response?.data?.message);
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#fbbf24',
      approved: '#34d399',
      rejected: '#f87171',
      completed: '#60a5fa',
      cancelled: '#9ca3af'
    };
    return colors[status] || '#9ca3af';
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  return (
    <div className="manager-dashboard">
      <nav className="manager-navbar">
        <div className="navbar-brand">
          <h2>📸 Studio Bion</h2>
          <span className="manager-badge">Manager</span>
        </div>
        <div className="navbar-user">
          <div className="user-avatar">{user?.name?.charAt(0)}</div>
          <div className="user-info">
            <span className="user-name">{user?.name}</span>
            <span className="user-role">Manager</span>
          </div>
          <button className="btn-logout" onClick={logout}>Logout</button>
        </div>
      </nav>

      <div className="manager-content">
        <div className="page-header">
          <h1>📋 Booking Management</h1>
          <p>Review and manage customer bookings</p>
        </div>

        {stats && (
          <div className="stats-grid">
            <div className="stat-card stat-all">
              <div className="stat-icon">📊</div>
              <div className="stat-info">
                <h3>{stats.totalBookings}</h3>
                <p>Total Bookings</p>
              </div>
            </div>
            <div className="stat-card stat-pending">
              <div className="stat-icon">⏳</div>
              <div className="stat-info">
                <h3>{stats.pendingBookings}</h3>
                <p>Pending Review</p>
              </div>
            </div>
            <div className="stat-card stat-approved">
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <h3>{stats.approvedBookings}</h3>
                <p>Approved</p>
              </div>
            </div>
            <div className="stat-card stat-completed">
              <div className="stat-icon">🎉</div>
              <div className="stat-info">
                <h3>{stats.completedBookings}</h3>
                <p>Completed</p>
              </div>
            </div>
          </div>
        )}

        <div className="filter-section">
          <button 
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All ({bookings.length})
          </button>
          <button 
            className={filter === 'pending' ? 'active' : ''}
            onClick={() => setFilter('pending')}
          >
            Pending ({bookings.filter(b => b.status === 'pending').length})
          </button>
          <button 
            className={filter === 'approved' ? 'active' : ''}
            onClick={() => setFilter('approved')}
          >
            Approved ({bookings.filter(b => b.status === 'approved').length})
          </button>
          <button 
            className={filter === 'rejected' ? 'active' : ''}
            onClick={() => setFilter('rejected')}
          >
            Rejected ({bookings.filter(b => b.status === 'rejected').length})
          </button>
          <button 
            className={filter === 'completed' ? 'active' : ''}
            onClick={() => setFilter('completed')}
          >
            Completed ({bookings.filter(b => b.status === 'completed').length})
          </button>
        </div>

        {loading ? (
          <div className="loading">Loading bookings...</div>
        ) : filteredBookings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <h3>No bookings found</h3>
            <p>There are no bookings matching your filter</p>
          </div>
        ) : (
          <div className="bookings-table">
            {filteredBookings.map(booking => (
              <div key={booking._id} className="booking-row">
                <div className="booking-main-info">
                  <div className="booking-customer">
                    <div className="customer-avatar">
                      {booking.customerName?.charAt(0)}
                    </div>
                    <div className="customer-details">
                      <h3>{booking.customerName}</h3>
                      <p>{booking.customerEmail}</p>
                      <p>{booking.customerPhone}</p>
                    </div>
                  </div>

                  <div className="booking-package-details">
                    <h4>{booking.package?.name}</h4>
                    <div className="package-meta">
                      <span className="meta-badge">{booking.package?.category}</span>
                      <span className="meta-item">
                        📅 {new Date(booking.bookingDate).toLocaleDateString('id-ID')}
                      </span>
                      <span className="meta-item">
                        🕒 {booking.bookingTime}
                      </span>
                    </div>
                    {booking.notes && (
                      <p className="booking-notes">📝 {booking.notes}</p>
                    )}
                  </div>

                  <div className="booking-price-status">
                    <div className="booking-price">
                      Rp {booking.totalPrice?.toLocaleString()}
                    </div>
                    <div 
                      className="booking-status"
                      style={{ backgroundColor: getStatusColor(booking.status) }}
                    >
                      {booking.status}
                    </div>
                    {booking.approvedBy && (
                      <p className="approved-by">
                        Approved by: {booking.approvedBy.name}
                      </p>
                    )}
                  </div>
                </div>

                {booking.status === 'pending' && (
                  <div className="booking-actions">
                    <button 
                      className="btn-approve"
                      onClick={() => handleUpdateStatus(booking._id, 'approved')}
                    >
                      ✓ Approve
                    </button>
                    <button 
                      className="btn-reject"
                      onClick={() => handleUpdateStatus(booking._id, 'rejected')}
                    >
                      ✕ Reject
                    </button>
                  </div>
                )}

                {booking.status === 'approved' && (
                  <div className="booking-actions">
                    <button 
                      className="btn-complete"
                      onClick={() => handleUpdateStatus(booking._id, 'completed')}
                    >
                      ✓ Mark as Completed
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerDashboard;