import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { packageAPI, bookingAPI } from '../../services/api';
import BookingForm from '../../components/BookingForm';
import './CustomerDashboard.css';

const CustomerDashboard = () => {
  const { user, logout } = useAuth();
  const [packages, setPackages] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [activeTab, setActiveTab] = useState('packages');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPackages();
    fetchBookings();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await packageAPI.getAll({ isActive: true });
      setPackages(response.data.data);
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await bookingAPI.getAll();
      setBookings(response.data.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const handleBookNow = (pkg) => {
    setSelectedPackage(pkg);
    setShowBookingForm(true);
  };

  const handleBookingSuccess = () => {
    setShowBookingForm(false);
    setSelectedPackage(null);
    fetchBookings();
    alert('Booking created successfully! Waiting for approval.');
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await bookingAPI.cancel(bookingId);
        fetchBookings();
        alert('Booking cancelled successfully!');
      } catch (error) {
        alert('Failed to cancel booking: ' + error.response?.data?.message);
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

  return (
    <div className="customer-dashboard">
      <nav className="customer-navbar">
        <div className="navbar-brand">
          <h2>📸 Studio Bion</h2>
        </div>
        <div className="navbar-user">
          <div className="user-avatar">{user?.name?.charAt(0)}</div>
          <div className="user-info">
            <span className="user-name">{user?.name}</span>
            <span className="user-role">Customer</span>
          </div>
          <button className="btn-logout" onClick={logout}>Logout</button>
        </div>
      </nav>

      <div className="customer-content">
        <div className="tabs">
          <button 
            className={activeTab === 'packages' ? 'active' : ''}
            onClick={() => setActiveTab('packages')}
          >
            📦 Available Packages
          </button>
          <button 
            className={activeTab === 'bookings' ? 'active' : ''}
            onClick={() => setActiveTab('bookings')}
          >
            📅 My Bookings ({bookings.length})
          </button>
        </div>

        {activeTab === 'packages' && (
          <div className="packages-section">
            {loading ? (
              <div className="loading">Loading packages...</div>
            ) : (
              <div className="package-grid">
                {packages.map(pkg => (
                  <div key={pkg._id} className="package-card-customer">
                    <div className="package-image">
                      {pkg.images && pkg.images.length > 0 ? (
                        <img 
                          src={`http://localhost:5000${pkg.images[0].url}`} 
                          alt={pkg.name}
                        />
                      ) : (
                        <div className="no-image">📸</div>
                      )}
                      <div className="package-badge">{pkg.category}</div>
                    </div>

                    <div className="package-content">
                      <h3>{pkg.name}</h3>
                      <p className="package-description">{pkg.description}</p>

                      <div className="package-features">
                        {pkg.features?.slice(0, 4).map((feature, index) => (
                          <div key={index} className="feature-item">
                            <span className="check-icon">✓</span>
                            {feature}
                          </div>
                        ))}
                      </div>

                      <div className="package-info">
                        <div className="info-item">
                          <span className="icon">⏱️</span>
                          <span>{pkg.duration}</span>
                        </div>
                        <div className="info-item">
                          <span className="icon">📅</span>
                          <span>{pkg.availableDays?.length || 0} days available</span>
                        </div>
                      </div>

                      <div className="package-footer">
                        <div className="package-price">
                          <span className="price-label">Starting from</span>
                          <span className="price-value">Rp {pkg.price?.toLocaleString()}</span>
                        </div>
                        <button 
                          className="btn-book-now"
                          onClick={() => handleBookNow(pkg)}
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="bookings-section">
            {bookings.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📅</div>
                <h3>No bookings yet</h3>
                <p>Start by booking your first photography package</p>
              </div>
            ) : (
              <div className="bookings-list">
                {bookings.map(booking => (
                  <div key={booking._id} className="booking-card">
                    <div className="booking-header">
                      <div className="booking-package-info">
                        <h3>{booking.package?.name}</h3>
                        <span className="booking-category">{booking.package?.category}</span>
                      </div>
                      <div 
                        className="booking-status"
                        style={{ backgroundColor: getStatusColor(booking.status) }}
                      >
                        {booking.status}
                      </div>
                    </div>

                    <div className="booking-details">
                      <div className="detail-row">
                        <span className="detail-label">📅 Date:</span>
                        <span className="detail-value">
                          {new Date(booking.bookingDate).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">🕒 Time:</span>
                        <span className="detail-value">{booking.bookingTime}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">👤 Name:</span>
                        <span className="detail-value">{booking.customerName}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">📱 Phone:</span>
                        <span className="detail-value">{booking.customerPhone}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">💰 Total:</span>
                        <span className="detail-value price">
                          Rp {booking.totalPrice?.toLocaleString()}
                        </span>
                      </div>
                      {booking.notes && (
                        <div className="detail-row">
                          <span className="detail-label">📝 Notes:</span>
                          <span className="detail-value">{booking.notes}</span>
                        </div>
                      )}
                    </div>

                    {booking.status === 'pending' && (
                      <div className="booking-actions">
                        <button 
                          className="btn-cancel-booking"
                          onClick={() => handleCancelBooking(booking._id)}
                        >
                          Cancel Booking
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showBookingForm && (
        <div className="modal-overlay" onClick={() => setShowBookingForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <BookingForm 
              package={selectedPackage}
              onSuccess={handleBookingSuccess}
              onCancel={() => setShowBookingForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;