// src/pages/Manager/ManagerDashboard.js
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { BookingManagement } from '../Admin/AdminDashboard';
import './ManagerDashboard.css';

const ManagerDashboard = () => {
  const { user, logout } = useAuth();

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
          <p>Review dan kelola booking pelanggan</p>
        </div>
        {/* Pakai komponen yang sama dengan Admin, role='manager' = tidak ada tombol delete */}
        <BookingManagement role="manager" />
      </div>
    </div>
  );
};

export default ManagerDashboard;

// // src/pages/Manager/ManagerDashboard.js
// import React, { useState, useEffect } from 'react';
// import { useAuth } from '../../context/AuthContext';
// import { bookingAPI } from '../../services/api';
// import './ManagerDashboard.css';

// const ManagerDashboard = () => {
//   const { user, logout } = useAuth();
//   const [bookings, setBookings] = useState([]);
//   const [stats, setStats] = useState(null);
//   const [filter, setFilter] = useState('all');
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchBookings();
//     fetchStats();
//   }, []);

//   const fetchBookings = async () => {
//     try {
//       const response = await bookingAPI.getAll();
//       // ✅ FIX: ambil dari response.data.data
//       setBookings(response.data.data ?? []);
//     } catch (error) {
//       console.error('Error fetching bookings:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchStats = async () => {
//     try {
//       const response = await bookingAPI.getStats();
//       setStats(response.data.data);
//     } catch (error) {
//       console.error('Error fetching stats:', error);
//     }
//   };

//   const handleUpdateStatus = async (bookingId, status) => {
//     const confirmMessage = status === 'approved'
//       ? 'Approve booking ini?'
//       : status === 'completed'
//         ? 'Tandai booking ini sebagai selesai?'
//         : 'Reject booking ini?';

//     if (window.confirm(confirmMessage)) {
//       try {
//         await bookingAPI.updateStatus(bookingId, status);
//         fetchBookings();
//         fetchStats();
//         alert(`Booking berhasil di-${status}!`);
//       } catch (error) {
//         alert('Gagal update: ' + error.response?.data?.message);
//       }
//     }
//   };

//   const getStatusColor = (status) => {
//     const colors = {
//       pending: '#fbbf24',
//       approved: '#34d399',
//       rejected: '#f87171',
//       completed: '#60a5fa',
//       cancelled: '#9ca3af',
//       expired: '#6b7280',
//     };
//     return colors[status] || '#9ca3af';
//   };

//   const filteredBookings = bookings.filter(booking => {
//     if (filter === 'all') return true;
//     return booking.status === filter;
//   });

//   return (
//     <div className="manager-dashboard">
//       <nav className="manager-navbar">
//         <div className="navbar-brand">
//           <h2>📸 Studio Bion</h2>
//           <span className="manager-badge">Manager</span>
//         </div>
//         <div className="navbar-user">
//           <div className="user-avatar">{user?.name?.charAt(0)}</div>
//           <div className="user-info">
//             <span className="user-name">{user?.name}</span>
//             <span className="user-role">Manager</span>
//           </div>
//           <button className="btn-logout" onClick={logout}>Logout</button>
//         </div>
//       </nav>

//       <div className="manager-content">
//         <div className="page-header">
//           <h1>📋 Booking Management</h1>
//           <p>Review and manage customer bookings</p>
//         </div>

//         {stats && (
//           <div className="stats-grid">
//             <div className="stat-card stat-all">
//               <div className="stat-icon">📊</div>
//               <div className="stat-info">
//                 <h3>{stats.totalBookings}</h3>
//                 <p>Total Bookings</p>
//               </div>
//             </div>
//             <div className="stat-card stat-pending">
//               <div className="stat-icon">⏳</div>
//               <div className="stat-info">
//                 <h3>{stats.pendingBookings}</h3>
//                 <p>Pending Review</p>
//               </div>
//             </div>
//             <div className="stat-card stat-approved">
//               <div className="stat-icon">✅</div>
//               <div className="stat-info">
//                 <h3>{stats.approvedBookings}</h3>
//                 <p>Approved</p>
//               </div>
//             </div>
//             <div className="stat-card stat-completed">
//               <div className="stat-icon">🎉</div>
//               <div className="stat-info">
//                 <h3>{stats.completedBookings}</h3>
//                 <p>Completed</p>
//               </div>
//             </div>
//           </div>
//         )}

//         <div className="filter-section">
//           {['all', 'pending', 'approved', 'rejected', 'completed'].map(f => (
//             <button
//               key={f}
//               className={filter === f ? 'active' : ''}
//               onClick={() => setFilter(f)}
//             >
//               {f.charAt(0).toUpperCase() + f.slice(1)} ({f === 'all' ? bookings.length : bookings.filter(b => b.status === f).length})
//             </button>
//           ))}
//         </div>

//         {loading ? (
//           <div className="loading">Loading bookings...</div>
//         ) : filteredBookings.length === 0 ? (
//           <div className="empty-state">
//             <div className="empty-icon">📅</div>
//             <h3>Tidak ada booking</h3>
//             <p>Tidak ada booking yang sesuai filter</p>
//           </div>
//         ) : (
//           <div className="bookings-table">
//             {filteredBookings.map(booking => (
//               // ✅ FIX: booking.id bukan booking._id
//               <div key={booking.id} className="booking-row">
//                 <div className="booking-main-info">
//                   <div className="booking-customer">
//                     <div className="customer-avatar">
//                       {booking.userName?.charAt(0) || '?'}
//                     </div>
//                     <div className="customer-details">
//                       {/* ✅ FIX: field names sesuai schema (userName, userEmail, userPhone) */}
//                       <h3>{booking.userName || '-'}</h3>
//                       <p>{booking.userEmail || '-'}</p>
//                       <p>{booking.userPhone || '-'}</p>
//                     </div>
//                   </div>

//                   <div className="booking-package-details">
//                     <h4>{booking.package?.name || '-'}</h4>
//                     <div className="package-meta">
//                       {booking.package?.category && (
//                         <span className="meta-badge">{booking.package.category}</span>
//                       )}
//                       {booking.bookingDate && (
//                         <span className="meta-item">
//                           📅 {new Date(booking.bookingDate).toLocaleDateString('id-ID')}
//                         </span>
//                       )}
//                       {booking.bookingTime && (
//                         <span className="meta-item">🕒 {booking.bookingTime}</span>
//                       )}
//                     </div>
//                     {booking.notes && (
//                       <p className="booking-notes">📝 {booking.notes}</p>
//                     )}
//                   </div>

//                   <div className="booking-price-status">
//                     <div className="booking-price">
//                       Rp {booking.totalPrice?.toLocaleString('id-ID') || '-'}
//                     </div>
//                     <div
//                       className="booking-status"
//                       style={{ backgroundColor: getStatusColor(booking.status) }}
//                     >
//                       {booking.status}
//                     </div>
//                     {booking.approvedBy && (
//                       <p className="approved-by">Approved by: {booking.approvedBy.name}</p>
//                     )}
//                   </div>
//                 </div>

//                 <div className="booking-actions">
//                   {booking.status === 'pending' && (
//                     <>
//                       <button
//                         className="btn-approve"
//                         onClick={() => handleUpdateStatus(booking.id, 'approved')}
//                       >
//                         ✓ Approve
//                       </button>
//                       <button
//                         className="btn-reject"
//                         onClick={() => handleUpdateStatus(booking.id, 'rejected')}
//                       >
//                         ✕ Reject
//                       </button>
//                     </>
//                   )}
//                   {booking.status === 'approved' && (
//                     <button
//                       className="btn-complete"
//                       onClick={() => handleUpdateStatus(booking.id, 'completed')}
//                     >
//                       ✓ Tandai Selesai
//                     </button>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ManagerDashboard;