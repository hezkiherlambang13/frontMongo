// src/pages/Customer/CustomerDashboard.js
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
      // ✅ FIX: ambil dari response.data.data
      setPackages(response.data.data ?? []);
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await bookingAPI.getAll();
      // ✅ FIX: ambil dari response.data.data
      setBookings(response.data.data ?? []);
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
    alert('Booking berhasil dibuat! Menunggu konfirmasi admin.');
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Yakin ingin membatalkan booking ini?')) {
      try {
        await bookingAPI.cancel(bookingId);
        fetchBookings();
        alert('Booking berhasil dibatalkan!');
      } catch (error) {
        alert('Gagal membatalkan: ' + error.response?.data?.message);
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#fbbf24',
      approved: '#34d399',
      rejected: '#f87171',
      completed: '#60a5fa',
      cancelled: '#9ca3af',
      expired: '#6b7280',
    };
    return colors[status] || '#9ca3af';
  };

  const BASE_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

  return (
    <div className="customer-dashboard">
      <nav className="customer-navbar">
        <div className="navbar-brand">
          <h2>📸 Digibox Studio</h2>
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
            📦 Paket Tersedia
          </button>
          <button
            className={activeTab === 'bookings' ? 'active' : ''}
            onClick={() => setActiveTab('bookings')}
          >
            📅 Booking Saya ({bookings.length})
          </button>
        </div>

        {activeTab === 'packages' && (
          <div className="packages-section">
            {loading ? (
              <div className="loading">Loading packages...</div>
            ) : packages.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📦</div>
                <h3>Belum ada paket tersedia</h3>
              </div>
            ) : (
              <div className="package-grid">
                {packages.map(pkg => (
                  // ✅ FIX: pkg.id bukan pkg._id (PostgreSQL)
                  <div key={pkg.id} className="package-card-customer">
                    <div className="package-image">
                      {pkg.images && pkg.images.length > 0 ? (
                        // ✅ FIX: images adalah string array bukan object array
                        <img
                          src={`${BASE_URL}${pkg.images[0]}`}
                          alt={pkg.name}
                        />
                      ) : (
                        <div className="no-image">📸</div>
                      )}
                      {pkg.category && <div className="package-badge">{pkg.category}</div>}
                    </div>

                    <div className="package-content">
                      <h3>{pkg.name}</h3>
                      <p className="package-description">{pkg.description}</p>

                      {pkg.features && pkg.features.length > 0 && (
                        <div className="package-features">
                          {pkg.features.slice(0, 4).map((feature, index) => (
                            <div key={index} className="feature-item">
                              <span className="check-icon">✓</span>
                              {feature}
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="package-info">
                        {pkg.duration && (
                          <div className="info-item">
                            <span className="icon">⏱️</span>
                            <span>{pkg.duration}</span>
                          </div>
                        )}
                        {pkg.availableDays && (
                          <div className="info-item">
                            <span className="icon">📅</span>
                            <span>{pkg.availableDays.length} hari tersedia</span>
                          </div>
                        )}
                      </div>

                      <div className="package-footer">
                        <div className="package-price">
                          <span className="price-label">Mulai dari</span>
                          <span className="price-value">Rp {pkg.price?.toLocaleString('id-ID')}</span>
                        </div>
                        <button
                          className="btn-book-now"
                          onClick={() => handleBookNow(pkg)}
                        >
                          Pesan Sekarang
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
                <h3>Belum ada booking</h3>
                <p>Mulai pesan paket foto pertama kamu!</p>
              </div>
            ) : (
              <div className="bookings-list">
                {bookings.map(booking => (
                  // ✅ FIX: booking.id bukan booking._id
                  <div key={booking.id} className="booking-card">
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
                        <span className="detail-label">📅 Tanggal:</span>
                        <span className="detail-value">
                          {booking.bookingDate
                            ? new Date(booking.bookingDate).toLocaleDateString('id-ID')
                            : '-'}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">🕒 Jam:</span>
                        <span className="detail-value">{booking.bookingTime || '-'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">👤 Nama:</span>
                        <span className="detail-value">{booking.userName || '-'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">📱 HP:</span>
                        <span className="detail-value">{booking.userPhone || '-'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">💰 Total:</span>
                        <span className="detail-value price">
                          Rp {booking.totalPrice?.toLocaleString('id-ID') || '-'}
                        </span>
                      </div>
                      {booking.notes && (
                        <div className="detail-row">
                          <span className="detail-label">📝 Catatan:</span>
                          <span className="detail-value">{booking.notes}</span>
                        </div>
                      )}
                    </div>

                    {booking.status === 'pending' && (
                      <div className="booking-actions">
                        <button
                          className="btn-cancel-booking"
                          onClick={() => handleCancelBooking(booking.id)}
                        >
                          Batalkan Booking
                        </button>
                      </div>
                    )}

                    {booking.status === 'approved' && (
                      <div className="booking-actions">
                        <button
                          className="btn-pay"
                          onClick={() => window.open(`http://localhost:5000/api/bookings/${booking.id}/whatsapp`, '_blank')}
                        >
                          💬 Bayar via WhatsApp
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