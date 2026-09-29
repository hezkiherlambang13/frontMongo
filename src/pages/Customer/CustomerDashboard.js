// // src/pages/Customer/CustomerDashboard.js
// import React, { useState, useEffect } from 'react';
// import { useAuth } from '../../context/AuthContext';
// import { packageAPI, bookingAPI, studioAPI } from '../../services/api';
// import BookingForm from '../../components/BookingForm';
// import './CustomerDashboard.css';

// // Ikon fallback per nama kategori (opsional, kalau tidak dikenali pakai ikon generik)
// const CATEGORY_ICONS = {
//   wedding: '💍',
//   prewedding: '💑',
//   wisuda: '🎓',
//   graduation: '🎓',
//   keluarga: '👨‍👩‍👧‍👦',
//   family: '👨‍👩‍👧‍👦',
//   portrait: '🧍',
//   event: '🎉',
//   product: '📦',
// };
// const getCategoryIcon = (name) => CATEGORY_ICONS[(name || '').toLowerCase().trim()] || '📁';

// const CustomerDashboard = () => {
//   const { user, logout } = useAuth();

//   const [activeTab, setActiveTab] = useState('packages');

//   // ✅ NEW: studio sebagai tab utama di atas daftar paket
//   const [studios, setStudios] = useState([]);
//   const [studiosLoading, setStudiosLoading] = useState(true);
//   const [activeStudioId, setActiveStudioId] = useState(null);

//   const [packages, setPackages] = useState([]);
//   const [packagesLoading, setPackagesLoading] = useState(true);
//   const [selectedCategory, setSelectedCategory] = useState(null);

//   const [bookings, setBookings] = useState([]);
//   const [selectedPackage, setSelectedPackage] = useState(null);
//   const [showBookingForm, setShowBookingForm] = useState(false);

//   const BASE_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

//   // ── Load daftar studio sekali di awal ──────────────────────────────
//   useEffect(() => {
//     studioAPI.getAll()
//       .then(res => {
//         const list = res.data?.data ?? [];
//         setStudios(list);
//         const firstActive = list.find(s => s.isActive) || list[0];
//         if (firstActive) setActiveStudioId(firstActive.id);
//       })
//       .catch(() => setStudios([]))
//       .finally(() => setStudiosLoading(false));

//     fetchBookings();
//   }, []);

//   // ── Setiap kali studio aktif berubah, ambil ulang paket khusus studio itu ──
//   useEffect(() => {
//     if (!activeStudioId) return;
//     fetchPackagesForStudio(activeStudioId);
//     setSelectedCategory(null); // reset ke tampilan folder saat pindah studio
//   }, [activeStudioId]);

//   const fetchPackagesForStudio = async (studioId) => {
//     setPackagesLoading(true);
//     try {
//       const response = await packageAPI.getAll({ isActive: true, studioId });
//       setPackages(response.data.data ?? []);
//     } catch (error) {
//       console.error('Error fetching packages:', error);
//       setPackages([]);
//     } finally {
//       setPackagesLoading(false);
//     }
//   };

//   const fetchBookings = async () => {
//     try {
//       const response = await bookingAPI.getAll();
//       setBookings(response.data.data ?? []);
//     } catch (error) {
//       console.error('Error fetching bookings:', error);
//     }
//   };

//   const handleSwitchStudio = (studioId) => {
//     if (studioId === activeStudioId) return;
//     setActiveStudioId(studioId);
//   };

//   const handleBookNow = (pkg) => {
//     setSelectedPackage(pkg);
//     setShowBookingForm(true);
//   };

//   const handleBookingSuccess = () => {
//     setShowBookingForm(false);
//     setSelectedPackage(null);
//     fetchBookings();
//   };

//   const handleCancelBooking = async (bookingId) => {
//     if (window.confirm('Yakin ingin membatalkan booking ini?')) {
//       try {
//         await bookingAPI.cancel(bookingId);
//         fetchBookings();
//         alert('Booking berhasil dibatalkan!');
//       } catch (error) {
//         alert('Gagal membatalkan: ' + error.response?.data?.message);
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

//   // ── Kelompokkan paket studio aktif berdasarkan kategori ──────────────
//   const groupedByCategory = packages.reduce((acc, pkg) => {
//     const catName = pkg.categoryRef?.name || pkg.category?.trim() || 'Lainnya';
//     if (!acc[catName]) acc[catName] = [];
//     acc[catName].push(pkg);
//     return acc;
//   }, {});
//   const categoryFolders = Object.keys(groupedByCategory);
//   const activePackages = selectedCategory ? (groupedByCategory[selectedCategory] || []) : [];
//   const activeStudio = studios.find(s => s.id === activeStudioId);

//   return (
//     <div className="customer-dashboard">
//       <nav className="customer-navbar">
//         <div className="navbar-brand">
//           <h2>📸 Digibox Studio</h2>
//         </div>
//         <div className="navbar-user">
//           <span className="user-greeting">Hai, <strong>{user?.name}</strong></span>
//           <button className="btn-logout" onClick={logout}>Logout</button>
//         </div>
//       </nav>

//       <div className="customer-content">
//         <div className="tabs">
//           <button
//             className={activeTab === 'packages' ? 'active' : ''}
//             onClick={() => setActiveTab('packages')}
//           >
//             📦 Paket Tersedia
//           </button>
//           <button
//             className={activeTab === 'bookings' ? 'active' : ''}
//             onClick={() => setActiveTab('bookings')}
//           >
//             📅 Booking Saya ({bookings.length})
//           </button>
//         </div>

//         {activeTab === 'packages' && (
//           <div className="packages-section">

//             {/* ✅ NEW: TAB STUDIO — navigasi utama di atas kategori */}
//             {studiosLoading ? (
//               <div className="loading">Memuat studio...</div>
//             ) : studios.length === 0 ? (
//               <div className="empty-state">
//                 <div className="empty-icon">🏢</div>
//                 <h3>Belum ada studio tersedia</h3>
//                 <p>Silakan coba lagi nanti atau hubungi admin.</p>
//               </div>
//             ) : (
//               <>
//                 <div className="studio-tabs">
//                   {studios.map(studio => (
//                     <button
//                       key={studio.id}
//                       className={`studio-tab ${activeStudioId === studio.id ? 'active' : ''} ${!studio.isActive ? 'closed' : ''}`}
//                       onClick={() => handleSwitchStudio(studio.id)}
//                     >
//                       <span className="studio-tab-icon">🏢</span>
//                       <span className="studio-tab-name">{studio.name}</span>
//                       <span className={`studio-tab-dot ${studio.isActive ? 'open' : 'closed'}`}></span>
//                     </button>
//                   ))}
//                 </div>

//                 {activeStudio && !activeStudio.isActive && (
//                   <div className="studio-closed-banner">
//                     ⚠️ {activeStudio.name} sedang tutup{activeStudio.note ? ` — ${activeStudio.note}` : ''}. Booking untuk studio ini tidak tersedia sementara.
//                   </div>
//                 )}

//                 {/* ISI STUDIO — folder kategori / paket */}
//                 <div className="studio-panel" key={activeStudioId}>
//                   {packagesLoading ? (
//                     <div className="loading">Loading packages...</div>
//                   ) : packages.length === 0 ? (
//                     <div className="empty-state">
//                       <div className="empty-icon">📦</div>
//                       <h3>Belum ada paket tersedia di {activeStudio?.name}</h3>
//                     </div>
//                   ) : !selectedCategory ? (
//                     <div className="category-folder-grid">
//                       {categoryFolders.map(cat => (
//                         <button key={cat} className="category-folder-card" onClick={() => setSelectedCategory(cat)}>
//                           <span className="folder-icon">{getCategoryIcon(cat)}</span>
//                           <span className="folder-name">{cat}</span>
//                           <span className="folder-count">{groupedByCategory[cat].length} paket tersedia</span>
//                         </button>
//                       ))}
//                     </div>
//                   ) : (
//                     <>
//                       <div className="folder-breadcrumb">
//                         <button className="btn-back-folder" onClick={() => setSelectedCategory(null)}>← Semua Kategori</button>
//                         <span className="folder-breadcrumb-title">
//                           {getCategoryIcon(selectedCategory)} {selectedCategory}
//                           <span className="folder-breadcrumb-count"> ({activePackages.length} paket)</span>
//                         </span>
//                       </div>

//                       <div className="package-grid">
//                         {activePackages.map(pkg => (
//                           <div key={pkg.id} className="package-card-customer">
//                             <div className="package-image">
//                               {pkg.images && pkg.images.length > 0 ? (
//                                 <img src={`${BASE_URL}${pkg.images[0]}`} alt={pkg.name} />
//                               ) : (
//                                 <div className="no-image">📸</div>
//                               )}
//                               <div className="package-badge">{selectedCategory}</div>
//                             </div>

//                             <div className="package-content">
//                               <h3>{pkg.name}</h3>
//                               <p className="package-description">{pkg.description}</p>

//                               {pkg.features && pkg.features.length > 0 && (
//                                 <div className="package-features">
//                                   {pkg.features.slice(0, 4).map((feature, index) => (
//                                     <div key={index} className="feature-item">
//                                       <span className="check-icon">✓</span>
//                                       {feature}
//                                     </div>
//                                   ))}
//                                 </div>
//                               )}

//                               <div className="package-info">
//                                 {pkg.duration && (
//                                   <div className="info-item">
//                                     <span className="icon">⏱️</span>
//                                     <span>{pkg.duration}</span>
//                                   </div>
//                                 )}
//                                 {pkg.availableDays && pkg.availableDays.length > 0 && (
//                                   <div className="info-item">
//                                     <span className="icon">📅</span>
//                                     <span>{pkg.availableDays.length} hari tersedia</span>
//                                   </div>
//                                 )}
//                               </div>

//                               <div className="package-footer">
//                                 <div className="package-price">
//                                   <span className="price-label">Mulai dari</span>
//                                   <span className="price-value">Rp {pkg.price?.toLocaleString('id-ID')}</span>
//                                 </div>
//                                 <button
//                                   className="btn-book-now"
//                                   onClick={() => handleBookNow(pkg)}
//                                   disabled={!activeStudio?.isActive}
//                                   title={!activeStudio?.isActive ? 'Studio sedang tutup' : ''}
//                                 >
//                                   Pesan Sekarang
//                                 </button>
//                               </div>
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     </>
//                   )}
//                 </div>
//               </>
//             )}
//           </div>
//         )}

//         {activeTab === 'bookings' && (
//           <div className="bookings-section">
//             {bookings.length === 0 ? (
//               <div className="empty-state">
//                 <div className="empty-icon">📅</div>
//                 <h3>Belum ada booking</h3>
//                 <p>Mulai pesan paket foto pertama kamu!</p>
//               </div>
//             ) : (
//               <div className="bookings-list">
//                 {bookings.map(booking => (
//                   <div key={booking.id} className="booking-card">
//                     <div className="booking-header">
//                       <div className="booking-package-info">
//                         <h3>{booking.package?.name}</h3>
//                         <span className="booking-category">
//                           {booking.package?.categoryRef?.name || booking.package?.category}
//                         </span>
//                         {booking.studio?.name && (
//                           <span className="booking-category" style={{ marginLeft: 8, background: '#eef2ff', color: '#4338ca' }}>
//                             🏢 {booking.studio.name}
//                           </span>
//                         )}
//                       </div>
//                       <div
//                         className="booking-status"
//                         style={{ backgroundColor: getStatusColor(booking.status) }}
//                       >
//                         {booking.status}
//                       </div>
//                     </div>

//                     <div className="booking-details">
//                       <div className="detail-row">
//                         <span className="detail-label">📅 Tanggal:</span>
//                         <span className="detail-value">
//                           {booking.bookingDate
//                             ? new Date(booking.bookingDate).toLocaleDateString('id-ID')
//                             : '-'}
//                         </span>
//                       </div>
//                       <div className="detail-row">
//                         <span className="detail-label">🕒 Jam:</span>
//                         <span className="detail-value">{booking.bookingTime || '-'}</span>
//                       </div>
//                       <div className="detail-row">
//                         <span className="detail-label">👤 Nama:</span>
//                         <span className="detail-value">{booking.userName || '-'}</span>
//                       </div>
//                       <div className="detail-row">
//                         <span className="detail-label">📱 HP:</span>
//                         <span className="detail-value">{booking.userPhone || '-'}</span>
//                       </div>
//                       <div className="detail-row">
//                         <span className="detail-label">💰 Total:</span>
//                         <span className="detail-value price">
//                           Rp {booking.totalPrice?.toLocaleString('id-ID') || '-'}
//                         </span>
//                       </div>
//                       {booking.notes && (
//                         <div className="detail-row">
//                           <span className="detail-label">📝 Catatan:</span>
//                           <span className="detail-value">{booking.notes}</span>
//                         </div>
//                       )}
//                     </div>

//                     {booking.status === 'pending' && (
//                       <div className="booking-actions">
//                         <button
//                           className="btn-cancel-booking"
//                           onClick={() => handleCancelBooking(booking.id)}
//                         >
//                           Batalkan Booking
//                         </button>
//                       </div>
//                     )}

//                     {booking.status === 'approved' && (
//                       <div className="booking-actions">
//                         <button
//                           className="btn-pay"
//                           onClick={() => window.open(`${BASE_URL}/api/bookings/${booking.id}/whatsapp`, '_blank')}
//                         >
//                           💬 Bayar via WhatsApp
//                         </button>
//                       </div>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {showBookingForm && selectedPackage && (
//         <div className="modal-overlay" onClick={() => setShowBookingForm(false)}>
//           <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//             <BookingForm
//               package={selectedPackage}
//               studioId={activeStudioId}
//               studioName={activeStudio?.name}
//               onSuccess={handleBookingSuccess}
//               onCancel={() => setShowBookingForm(false)}
//             />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CustomerDashboard;
// src/pages/Customer/CustomerDashboard.js
// src/pages/Customer/CustomerDashboard.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { packageAPI, bookingAPI, studioAPI } from '../../services/api';
import BookingForm from '../../components/BookingForm';
import FeatureModal from '../../components/FeatureModal';
import RescheduleModal from '../../components/RescheduleModal'; // ✅ NEW
import './CustomerDashboard.css';

const CATEGORY_ICONS = {
  wedding: '💍',
  prewedding: '💑',
  wisuda: '🎓',
  graduation: '🎓',
  keluarga: '👨‍👩‍👧‍👦',
  family: '👨‍👩‍👧‍👦',
  portrait: '🧍',
  event: '🎉',
  product: '📦',
};
const getCategoryIcon = (name) => CATEGORY_ICONS[(name || '').toLowerCase().trim()] || '📁';

const MAX_VISIBLE_FEATURES = 3;

const CustomerDashboard = () => {
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('packages');

  const [studios, setStudios] = useState([]);
  const [studiosLoading, setStudiosLoading] = useState(true);
  const [activeStudioId, setActiveStudioId] = useState(null);

  const [packages, setPackages] = useState([]);
  const [packagesLoading, setPackagesLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [bookings, setBookings] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);

  const [featureModalPkg, setFeatureModalPkg] = useState(null);

  // ✅ NEW: state untuk reschedule
  const [rescheduleBooking, setRescheduleBooking] = useState(null);

  const BASE_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

  useEffect(() => {
    studioAPI.getAll()
      .then(res => {
        const list = res.data?.data ?? [];
        setStudios(list);
        const firstActive = list.find(s => s.isActive) || list[0];
        if (firstActive) setActiveStudioId(firstActive.id);
      })
      .catch(() => setStudios([]))
      .finally(() => setStudiosLoading(false));

    fetchBookings();
  }, []);

  useEffect(() => {
    if (!activeStudioId) return;
    fetchPackagesForStudio(activeStudioId);
    setSelectedCategory(null);
  }, [activeStudioId]);

  const fetchPackagesForStudio = async (studioId) => {
    setPackagesLoading(true);
    try {
      const response = await packageAPI.getAll({ isActive: true, studioId });
      setPackages(response.data.data ?? []);
    } catch (error) {
      console.error('Error fetching packages:', error);
      setPackages([]);
    } finally {
      setPackagesLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await bookingAPI.getAll();
      setBookings(response.data.data ?? []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const handleSwitchStudio = (studioId) => {
    if (studioId === activeStudioId) return;
    setActiveStudioId(studioId);
  };

  const handleBookNow = (pkg) => {
    setSelectedPackage(pkg);
    setShowBookingForm(true);
  };

  const handleBookingSuccess = () => {
    setShowBookingForm(false);
    setSelectedPackage(null);
    fetchBookings();
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

  // ✅ NEW: handler reschedule
  const handleRescheduleSuccess = () => {
    setRescheduleBooking(null);
    fetchBookings();
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

  // ✅ NEW: cek apakah booking bisa di-reschedule
  const canReschedule = (booking) => {
    return ['pending', 'approved'].includes(booking.status);
  };

  const groupedByCategory = packages.reduce((acc, pkg) => {
    const catName = pkg.categoryRef?.name || pkg.category?.trim() || 'Lainnya';
    if (!acc[catName]) acc[catName] = [];
    acc[catName].push(pkg);
    return acc;
  }, {});
  const categoryFolders = Object.keys(groupedByCategory);
  const activePackages = selectedCategory ? (groupedByCategory[selectedCategory] || []) : [];
  const activeStudio = studios.find(s => s.id === activeStudioId);

  return (
    <div className="customer-dashboard">
      <nav className="customer-navbar">
        <div className="navbar-brand">
          <h2>📸 Digibox Studio</h2>
        </div>
        <div className="navbar-user">
          <span className="user-greeting">Hai, <strong>{user?.name}</strong></span>
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
            {studiosLoading ? (
              <div className="loading">Memuat studio...</div>
            ) : studios.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🏢</div>
                <h3>Belum ada studio tersedia</h3>
                <p>Silakan coba lagi nanti atau hubungi admin.</p>
              </div>
            ) : (
              <>
                <div className="studio-tabs">
                  {studios.map(studio => (
                    <button
                      key={studio.id}
                      className={`studio-tab ${activeStudioId === studio.id ? 'active' : ''} ${!studio.isActive ? 'closed' : ''}`}
                      onClick={() => handleSwitchStudio(studio.id)}
                    >
                      <span className="studio-tab-icon">🏢</span>
                      <span className="studio-tab-name">{studio.name}</span>
                      <span className={`studio-tab-dot ${studio.isActive ? 'open' : 'closed'}`}></span>
                    </button>
                  ))}
                </div>

                {activeStudio && !activeStudio.isActive && (
                  <div className="studio-closed-banner">
                    ⚠️ {activeStudio.name} sedang tutup{activeStudio.note ? ` — ${activeStudio.note}` : ''}. Booking untuk studio ini tidak tersedia sementara.
                  </div>
                )}

                <div className="studio-panel" key={activeStudioId}>
                  {packagesLoading ? (
                    <div className="loading">Loading packages...</div>
                  ) : packages.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">📦</div>
                      <h3>Belum ada paket tersedia di {activeStudio?.name}</h3>
                    </div>
                  ) : !selectedCategory ? (
                    <div className="category-folder-grid">
                      {categoryFolders.map(cat => (
                        <button key={cat} className="category-folder-card" onClick={() => setSelectedCategory(cat)}>
                          <span className="folder-icon">{getCategoryIcon(cat)}</span>
                          <span className="folder-name">{cat}</span>
                          <span className="folder-count">{groupedByCategory[cat].length} paket tersedia</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <>
                      <div className="folder-breadcrumb">
                        <button className="btn-back-folder" onClick={() => setSelectedCategory(null)}>← Semua Kategori</button>
                        <span className="folder-breadcrumb-title">
                          {getCategoryIcon(selectedCategory)} {selectedCategory}
                          <span className="folder-breadcrumb-count"> ({activePackages.length} paket)</span>
                        </span>
                      </div>

                      <div className="package-grid">
                        {activePackages.map(pkg => {
                          const allFeatures = pkg.features || [];
                          const visibleFeatures = allFeatures.slice(0, MAX_VISIBLE_FEATURES);
                          const remainingCount = allFeatures.length - MAX_VISIBLE_FEATURES;

                          return (
                            <div key={pkg.id} className="package-card-customer">
                              <div className="package-image">
                                {pkg.images && pkg.images.length > 0 ? (
                                  <img src={`${BASE_URL}${pkg.images[0]}`} alt={pkg.name} />
                                ) : (
                                  <div className="no-image">📸</div>
                                )}
                                <div className="package-badge">{selectedCategory}</div>
                              </div>

                              <div className="package-content">
                                <h3>{pkg.name}</h3>
                                <p className="package-description">{pkg.description}</p>

                                {visibleFeatures.length > 0 && (
                                  <div className="package-features">
                                    {visibleFeatures.map((feature, index) => (
                                      <div key={index} className="feature-item">
                                        <span className="check-icon">✓</span>
                                        <span className="feature-text">{feature}</span>
                                      </div>
                                    ))}
                                    {remainingCount > 0 && (
                                      <button
                                        type="button"
                                        className="btn-show-all-features"
                                        onClick={() => setFeatureModalPkg(pkg)}
                                      >
                                        +{remainingCount} fitur lainnya — Lihat semua
                                      </button>
                                    )}
                                  </div>
                                )}

                                <div className="package-info">
                                  {pkg.duration && (
                                    <div className="info-item">
                                      <span className="icon">⏱️</span>
                                      <span>{pkg.duration}</span>
                                    </div>
                                  )}
                                  {pkg.availableDays && pkg.availableDays.length > 0 && (
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
                                    disabled={!activeStudio?.isActive}
                                    title={!activeStudio?.isActive ? 'Studio sedang tutup' : ''}
                                  >
                                    Pesan Sekarang
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              </>
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
                  <div key={booking.id} className="booking-card">
                    <div className="booking-header">
                      <div className="booking-package-info">
                        <h3>{booking.package?.name}</h3>
                        <span className="booking-category">
                          {booking.package?.categoryRef?.name || booking.package?.category}
                        </span>
                        {booking.studio?.name && (
                          <span className="booking-category" style={{ marginLeft: 8, background: '#eef2ff', color: '#4338ca' }}>
                            🏢 {booking.studio.name}
                          </span>
                        )}
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

                    {/* ✅ BOOKING ACTIONS — dengan tombol Reschedule */}
                    <div className="booking-actions">
                      {/* Tombol Reschedule — muncul untuk pending & approved */}
                      {canReschedule(booking) && (
                        <button
                          className="btn-reschedule"
                          onClick={() => setRescheduleBooking(booking)}
                        >
                          🗓️ Ubah Jadwal
                        </button>
                      )}

                      {/* Tombol Batalkan — hanya pending */}
                      {booking.status === 'pending' && (
                        <button
                          className="btn-cancel-booking"
                          onClick={() => handleCancelBooking(booking.id)}
                        >
                          Batalkan
                        </button>
                      )}

                      {/* Tombol WhatsApp — hanya approved */}
                      {booking.status === 'approved' && (
                        <button
                          className="btn-pay"
                          onClick={() => window.open(`${BASE_URL}/api/bookings/${booking.id}/whatsapp`, '_blank')}
                        >
                          💬 Bayar via WhatsApp
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Booking Form */}
      {showBookingForm && selectedPackage && (
        <div className="modal-overlay" onClick={() => setShowBookingForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <BookingForm
              package={selectedPackage}
              studioId={activeStudioId}
              studioName={activeStudio?.name}
              onSuccess={handleBookingSuccess}
              onCancel={() => setShowBookingForm(false)}
            />
          </div>
        </div>
      )}

      {/* Modal Semua Fitur */}
      {featureModalPkg && (
        <FeatureModal
          packageName={featureModalPkg.name}
          features={featureModalPkg.features || []}
          onClose={() => setFeatureModalPkg(null)}
        />
      )}

      {/* ✅ NEW: Modal Reschedule */}
      {rescheduleBooking && (
        <div className="modal-overlay" onClick={() => setRescheduleBooking(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <RescheduleModal
              booking={rescheduleBooking}
              onSuccess={handleRescheduleSuccess}
              onCancel={() => setRescheduleBooking(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;