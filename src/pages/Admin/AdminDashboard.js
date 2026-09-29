// // src/pages/Admin/AdminDashboard.js
// import React, { useState, useEffect } from 'react';
// import { useAuth } from '../../context/AuthContext';
// import { packageAPI, bookingAPI } from '../../services/api';
// import api from '../../services/api';
// import PackageForm from '../../components/PackageForm';
// import PackageList from '../../components/PackageList';
// import './AdminDashboard.css';

// const BASE_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

// const AdminDashboard = () => {
//   const { user, logout } = useAuth();
//   const [packages, setPackages] = useState([]);
//   const [stats, setStats] = useState(null);
//   const [showForm, setShowForm] = useState(false);
//   const [editingPackage, setEditingPackage] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState('packages');
//   const [backgrounds, setBackgrounds] = useState([]);
//   const [bgLoading, setBgLoading] = useState(false);
//   const [uploadingBg, setUploadingBg] = useState(false);
//   const [bgError, setBgError] = useState('');
//   const [bgSuccess, setBgSuccess] = useState('');

//   useEffect(() => { fetchPackages(); fetchStats(); }, []);
//   useEffect(() => { if (activeTab === 'backgrounds') fetchBackgrounds(); }, [activeTab]);

//   const fetchPackages = async () => {
//     try {
//       const response = await packageAPI.getAll();
//       setPackages(response.data.data ?? []);
//     } catch (error) { console.error('Error fetching packages:', error); }
//     finally { setLoading(false); }
//   };

//   const fetchStats = async () => {
//     try {
//       const response = await bookingAPI.getStats();
//       setStats(response.data.data);
//     } catch (error) { console.error('Error fetching stats:', error); }
//   };

//   const fetchBackgrounds = async () => {
//     setBgLoading(true);
//     try {
//       const res = await api.get('/login-backgrounds');
//       const data = res.data?.data ?? res.data;
//       setBackgrounds(Array.isArray(data) ? data : []);
//     } catch (error) { console.error('Error:', error); }
//     finally { setBgLoading(false); }
//   };

//   const handleUploadBackground = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     if (file.size > 50 * 1024 * 1024) { setBgError('Maksimal 50MB'); return; }
//     const isImage = file.type.startsWith('image/');
//     const isVideo = file.type.startsWith('video/');
//     if (!isImage && !isVideo) { setBgError('Hanya gambar atau video'); return; }
//     setUploadingBg(true); setBgError(''); setBgSuccess('');
//     try {
//       const formData = new FormData();
//       formData.append('background', file);
//       formData.append('type', isVideo ? 'video' : 'image');
//       await api.post('/login-backgrounds', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
//       setBgSuccess('Background berhasil diupload!');
//       fetchBackgrounds();
//       e.target.value = '';
//     } catch (error) {
//       setBgError('Gagal upload: ' + (error.response?.data?.message ?? error.message));
//     } finally { setUploadingBg(false); }
//   };

//   const handleToggleBg = async (id, currentStatus) => {
//     try {
//       await api.patch(`/login-backgrounds/${id}/toggle`, { isActive: !currentStatus });
//       fetchBackgrounds();
//     } catch { setBgError('Gagal mengubah status'); }
//   };

//   const handleDeleteBg = async (id) => {
//     if (!window.confirm('Hapus background ini?')) return;
//     try {
//       await api.delete(`/login-backgrounds/${id}`);
//       setBgSuccess('Background dihapus');
//       fetchBackgrounds();
//     } catch { setBgError('Gagal menghapus'); }
//   };

//   const handleAddPackage = () => { setEditingPackage(null); setShowForm(true); };
//   const handleEditPackage = (pkg) => { setEditingPackage(pkg); setShowForm(true); };
//   const handleDeletePackage = async (id) => {
//     if (window.confirm('Hapus paket ini?')) {
//       try { await packageAPI.delete(id); fetchPackages(); }
//       catch (error) { alert('Gagal: ' + error.response?.data?.message); }
//     }
//   };
//   const handleFormSuccess = () => { setShowForm(false); setEditingPackage(null); fetchPackages(); };

//   return (
//     <div className="admin-dashboard">
//       <div className="admin-sidebar">
//         <div className="sidebar-header">
//           <h2>📸 Studio Bion</h2>
//           <span className="admin-badge">Admin</span>
//         </div>
//         <div className="sidebar-user">
//           <div className="user-avatar">{user?.name?.charAt(0)}</div>
//           <div className="user-info"><h3>{user?.name}</h3><p>{user?.email}</p></div>
//         </div>
//         <nav className="sidebar-nav">
//           {[
//             { key: 'dashboard', icon: '📊', label: 'Dashboard' },
//             { key: 'packages', icon: '📦', label: 'Packages' },
//             { key: 'bookings', icon: '📅', label: 'Bookings' },
//             { key: 'backgrounds', icon: '🖼️', label: 'Home Background' },
//           ].map(({ key, icon, label }) => (
//             <button key={key} className={activeTab === key ? 'active' : ''} onClick={() => setActiveTab(key)}>
//               <span className="nav-icon">{icon}</span> {label}
//             </button>
//           ))}
//           <button onClick={logout} className="logout-btn"><span className="nav-icon">🚪</span> Logout</button>
//         </nav>
//       </div>

//       <div className="admin-content">
//         <div className="content-header">
//           <h1>
//             {activeTab === 'dashboard' && '📊 Dashboard'}
//             {activeTab === 'packages' && '📦 Package Management'}
//             {activeTab === 'bookings' && '📅 Booking Management'}
//             {activeTab === 'backgrounds' && '🖼️ Kelola Background Home'}
//           </h1>
//         </div>

//         {/* DASHBOARD */}
//         {activeTab === 'dashboard' && (
//           <div className="stats-grid">
//             <div className="stat-card stat-primary">
//               <div className="stat-icon">📦</div>
//               <div className="stat-info"><h3>{packages.length}</h3><p>Total Packages</p></div>
//             </div>
//             {stats && <>
//               <div className="stat-card stat-warning">
//                 <div className="stat-icon">⏳</div>
//                 <div className="stat-info"><h3>{stats.pendingBookings}</h3><p>Pending</p></div>
//               </div>
//               <div className="stat-card stat-success">
//                 <div className="stat-icon">✅</div>
//                 <div className="stat-info"><h3>{stats.completedBookings}</h3><p>Completed</p></div>
//               </div>
//               <div className="stat-card stat-info">
//                 <div className="stat-icon">💰</div>
//                 <div className="stat-info"><h3>Rp {stats.totalRevenue?.toLocaleString('id-ID')}</h3><p>Revenue</p></div>
//               </div>
//             </>}
//           </div>
//         )}

//         {/* PACKAGES */}
//         {activeTab === 'packages' && (
//           <div className="packages-section">
//             <div className="section-header">
//               <button className="btn-add-package" onClick={handleAddPackage}> Tambah Paket</button>
//             </div>
//             {loading ? <div className="loading">Loading...</div> : (
//               <PackageList packages={packages} onEdit={handleEditPackage} onDelete={handleDeletePackage} isAdmin={true} />
//             )}
//           </div>
//         )}

//         {/* BOOKINGS */}
//         {activeTab === 'bookings' && <BookingManagement role="admin" />}

//         {/* BACKGROUNDS */}
//         {activeTab === 'backgrounds' && (
//           <div className="backgrounds-section">
//             <div className="bg-info-banner">
//               <span>ℹ️</span>
//               <span>Background aktif tampil sebagai slideshow di halaman Home. Mendukung gambar & video.</span>
//             </div>
//             {bgError && <div className="bg-alert bg-alert-error">⚠️ {bgError} <button onClick={() => setBgError('')}>✕</button></div>}
//             {bgSuccess && <div className="bg-alert bg-alert-success">✅ {bgSuccess} <button onClick={() => setBgSuccess('')}>✕</button></div>}
//             <div className="bg-upload-area">
//               <label className="bg-upload-label" htmlFor="bg-file-input">
//                 {uploadingBg ? <span>⏳ Mengupload...</span> : <>
//                   <span className="upload-icon">📁</span>
//                   <span className="upload-text">Klik untuk upload background</span>
//                   <span className="upload-hint">Gambar (JPG, PNG, WebP) atau Video (MP4) — Maks. 50MB</span>
//                 </>}
//               </label>
//               <input id="bg-file-input" type="file" accept="image/*,video/mp4" onChange={handleUploadBackground} disabled={uploadingBg} style={{ display: 'none' }} />
//             </div>
//             {bgLoading ? <div className="loading">Memuat...</div> : backgrounds.length === 0 ? (
//               <div className="bg-empty"><span>🖼️</span><p>Belum ada background.</p></div>
//             ) : (
//               <div className="bg-grid">
//                 {backgrounds.map((bg) => (
//                   <div key={bg.id} className={`bg-card ${bg.isActive ? 'bg-card-active' : 'bg-card-inactive'}`}>
//                     <div className="bg-preview">
//                       {bg.type === 'video'
//                         ? <video src={`${BASE_URL}${bg.url}`} muted playsInline className="bg-preview-media" onMouseOver={e => e.target.play()} onMouseOut={e => { e.target.pause(); e.target.currentTime = 0; }} />
//                         : <img src={`${BASE_URL}${bg.url}`} alt="bg" className="bg-preview-media" />
//                       }
//                       <div className="bg-type-badge">{bg.type === 'video' ? '🎥' : '🖼️'}</div>
//                     </div>
//                     <div className="bg-card-footer">
//                       <span className={`bg-status ${bg.isActive ? 'status-active' : 'status-inactive'}`}>
//                         {bg.isActive ? '● Aktif' : '○ Nonaktif'}
//                       </span>
//                       <div className="bg-actions">
//                         <button className={`btn-toggle-bg ${bg.isActive ? 'btn-deactivate' : 'btn-activate'}`} onClick={() => handleToggleBg(bg.id, bg.isActive)}>
//                           {bg.isActive ? 'Nonaktifkan' : 'Aktifkan'}
//                         </button>
//                         <button className="btn-delete-bg" onClick={() => handleDeleteBg(bg.id)}>🗑️</button>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {showForm && (
//         <div className="modal-overlay" onClick={() => setShowForm(false)}>
//           <div className="modal-content" onClick={e => e.stopPropagation()}>
//             <PackageForm package={editingPackage} onSuccess={handleFormSuccess} onCancel={() => setShowForm(false)} />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // ===== SHARED BOOKING MANAGEMENT (dipakai Admin & Manager) =====
// export const BookingManagement = ({ role }) => {
//   const [bookings, setBookings] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [filter, setFilter] = useState('all');
//   const [photoModal, setPhotoModal] = useState(null); // booking yang sedang diedit pickup-nya

//   useEffect(() => { fetchBookings(); }, []);

//   const fetchBookings = async () => {
//     try {
//       const response = await bookingAPI.getAll();
//       setBookings(response.data.data ?? []);
//     } catch (error) { console.error(error); }
//     finally { setLoading(false); }
//   };

//   const handleUpdateStatus = async (id, status) => {
//     if (!window.confirm(`${status === 'approved' ? 'Approve' : status === 'completed' ? 'Selesaikan' : 'Reject'} booking ini?`)) return;
//     try {
//       await bookingAPI.updateStatus(id, status);
//       fetchBookings();
//     } catch (error) { alert('Gagal: ' + error.response?.data?.message); }
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm('Hapus booking ini?')) return;
//     try { await bookingAPI.delete(id); fetchBookings(); }
//     catch (error) { alert('Gagal: ' + error.response?.data?.message); }
//   };

//   const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

//   const getStatusColor = (status) => ({
//     pending: '#fbbf24', approved: '#34d399', rejected: '#f87171',
//     completed: '#60a5fa', cancelled: '#9ca3af', expired: '#6b7280',
//   }[status] || '#9ca3af');

//   return (
//     <div className="bookings-section">
//       <div className="filter-section">
//         {['all', 'pending', 'approved', 'rejected', 'completed'].map(f => (
//           <button key={f} className={filter === f ? 'active' : ''} onClick={() => setFilter(f)}>
//             {f.charAt(0).toUpperCase() + f.slice(1)} ({f === 'all' ? bookings.length : bookings.filter(b => b.status === f).length})
//           </button>
//         ))}
//       </div>

//       {loading ? <div className="loading">Loading...</div>
//         : filtered.length === 0 ? (
//           <div className="empty-state"><div className="empty-icon">📅</div><h3>Tidak ada booking</h3></div>
//         ) : (
//           <div className="bookings-table">
//             {filtered.map(booking => (
//               <div key={booking.id} className="booking-row">
//                 <div className="booking-main-info">
//                   <div className="booking-customer">
//                     <div className="customer-avatar">{booking.userName?.charAt(0) || '?'}</div>
//                     <div className="customer-details">
//                       <h3>{booking.userName || '-'}</h3>
//                       <p>{booking.userEmail || '-'}</p>
//                       <p>{booking.userPhone || '-'}</p>
//                     </div>
//                   </div>
//                   <div className="booking-package-details">
//                     <h4>{booking.package?.name || '-'}</h4>
//                     <div className="package-meta">
//                       {booking.package?.category && <span className="meta-badge">{booking.package.category}</span>}
//                       {booking.bookingDate && <span className="meta-item">📅 {new Date(booking.bookingDate).toLocaleDateString('id-ID')}</span>}
//                       {booking.bookingTime && <span className="meta-item">🕒 {booking.bookingTime}</span>}
//                     </div>
//                     {booking.notes && <p className="booking-notes">📝 {booking.notes}</p>}

//                     {/* INFO PENGAMBILAN FOTO */}
//                     {(booking.status === 'approved' || booking.status === 'completed') && (
//                       <div className="photo-pickup-info">
//                         <div className="pickup-badge" style={{
//                           background: booking.photoPickupStatus === 'sudah_diambil' ? '#d1fae5' : '#fef3c7',
//                           color: booking.photoPickupStatus === 'sudah_diambil' ? '#065f46' : '#92400e',
//                           padding: '4px 10px', borderRadius: 20, fontSize: 12, display: 'inline-block', marginTop: 6
//                         }}>
//                           🖼️ Foto: {booking.photoPickupStatus === 'sudah_diambil' ? 'Sudah diambil' : 'Belum diambil'}
//                         </div>
//                         {booking.photoPickupBy && <p style={{fontSize:12, color:'#6b7280', margin:'2px 0'}}>👤 {booking.photoPickupBy}</p>}
//                         {booking.photoPickupDate && <p style={{fontSize:12, color:'#6b7280', margin:'2px 0'}}>📅 {new Date(booking.photoPickupDate).toLocaleDateString('id-ID')}</p>}
//                         {booking.photoPickupNotes && <p style={{fontSize:12, color:'#6b7280', margin:'2px 0'}}>📝 {booking.photoPickupNotes}</p>}
//                       </div>
//                     )}
//                   </div>
//                   <div className="booking-price-status">
//                     <div className="booking-price">Rp {booking.totalPrice?.toLocaleString('id-ID') || '-'}</div>
//                     <div className="booking-status" style={{ backgroundColor: getStatusColor(booking.status) }}>
//                       {booking.status}
//                     </div>
//                     {booking.approvedBy && <p className="approved-by">by: {booking.approvedBy.name}</p>}
//                   </div>
//                 </div>

//                 <div className="booking-actions">
//                   {booking.status === 'pending' && <>
//                     <button className="btn-approve" onClick={() => handleUpdateStatus(booking.id, 'approved')}>✓ Approve</button>
//                     <button className="btn-reject" onClick={() => handleUpdateStatus(booking.id, 'rejected')}>✕ Reject</button>
//                   </>}
//                   {booking.status === 'approved' && <>
//                     <button className="btn-complete" onClick={() => handleUpdateStatus(booking.id, 'completed')}>✓ Selesai</button>
//                     <button className="btn-photo" onClick={() => setPhotoModal(booking)} style={{background:'#7c3aed', color:'white', border:'none', padding:'6px 12px', borderRadius:6, cursor:'pointer'}}>
//                       🖼️ Foto Pickup
//                     </button>
//                   </>}
//                   {booking.status === 'completed' && (
//                     <button className="btn-photo" onClick={() => setPhotoModal(booking)} style={{background:'#6b7280', color:'white', border:'none', padding:'6px 12px', borderRadius:6, cursor:'pointer'}}>
//                       🖼️ Edit Pickup
//                     </button>
//                   )}
//                   {role === 'admin' && (
//                     <button className="btn-delete-booking" onClick={() => handleDelete(booking.id)}>🗑️</button>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}

//       {/* MODAL PHOTO PICKUP */}
//       {photoModal && (
//         <PhotoPickupModal
//           booking={photoModal}
//           onClose={() => setPhotoModal(null)}
//           onSuccess={() => { setPhotoModal(null); fetchBookings(); }}
//         />
//       )}
//     </div>
//   );
// };

// // ===== MODAL PHOTO PICKUP =====
// const PhotoPickupModal = ({ booking, onClose, onSuccess }) => {
//   const [form, setForm] = useState({
//     photoPickupDate: booking.photoPickupDate ? new Date(booking.photoPickupDate).toISOString().split('T')[0] : '',
//     photoPickupBy: booking.photoPickupBy || '',
//     photoPickupNotes: booking.photoPickupNotes || '',
//     photoPickupStatus: booking.photoPickupStatus || 'belum_diambil',
//   });
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       await api.patch(`/bookings/${booking.id}/photo-pickup`, form);
//       alert('Info pengambilan foto berhasil disimpan!');
//       onSuccess();
//     } catch (error) {
//       alert('Gagal: ' + (error.response?.data?.message || error.message));
//     } finally { setLoading(false); }
//   };

//   return (
//     <div className="modal-overlay" onClick={onClose}>
//       <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
//         <div className="form-header" style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: 'white', padding: '20px 24px', borderRadius: '12px 12px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//           <h2 style={{ margin: 0, fontSize: 18 }}>🖼️ Info Pengambilan Foto</h2>
//           <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', fontSize: 20, cursor: 'pointer' }}>✕</button>
//         </div>

//         <div style={{ padding: 24 }}>
//           <div style={{ background: '#f3f4f6', borderRadius: 8, padding: 12, marginBottom: 20 }}>
//             <p style={{ margin: 0, fontWeight: 600 }}>{booking.userName}</p>
//             <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 14 }}>{booking.package?.name} — {booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString('id-ID') : '-'}</p>
//           </div>

//           <form onSubmit={handleSubmit}>
//             <div className="form-group" style={{ marginBottom: 16 }}>
//               <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Status Pengambilan</label>
//               <select
//                 value={form.photoPickupStatus}
//                 onChange={e => setForm({ ...form, photoPickupStatus: e.target.value })}
//                 style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14 }}
//               >
//                 <option value="belum_diambil">⏳ Belum Diambil</option>
//                 <option value="sudah_diambil">✅ Sudah Diambil</option>
//               </select>
//             </div>

//             <div className="form-group" style={{ marginBottom: 16 }}>
//               <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Nama yang Mengambil</label>
//               <input
//                 type="text"
//                 value={form.photoPickupBy}
//                 onChange={e => setForm({ ...form, photoPickupBy: e.target.value })}
//                 placeholder="Nama pengambil foto..."
//                 style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, boxSizing: 'border-box' }}
//               />
//             </div>

//             <div className="form-group" style={{ marginBottom: 16 }}>
//               <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Tanggal Pengambilan</label>
//               <input
//                 type="date"
//                 value={form.photoPickupDate}
//                 onChange={e => setForm({ ...form, photoPickupDate: e.target.value })}
//                 style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, boxSizing: 'border-box' }}
//               />
//             </div>

//             <div className="form-group" style={{ marginBottom: 20 }}>
//               <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Catatan</label>
//               <textarea
//                 value={form.photoPickupNotes}
//                 onChange={e => setForm({ ...form, photoPickupNotes: e.target.value })}
//                 placeholder="Catatan tambahan pengambilan foto..."
//                 rows={3}
//                 style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, boxSizing: 'border-box', resize: 'vertical' }}
//               />
//             </div>

//             <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
//               <button type="button" onClick={onClose} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid #d1d5db', background: 'white', cursor: 'pointer' }}>Batal</button>
//               <button type="submit" disabled={loading} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: 'white', fontWeight: 600, cursor: 'pointer' }}>
//                 {loading ? 'Menyimpan...' : 'Simpan'}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;

// src/pages/Admin/AdminDashboard.js
import CategoryManager from '../../components/CategoryManager';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { packageAPI, bookingAPI, studioAPI } from '../../services/api';
import api from '../../services/api';
import PackageForm from '../../components/PackageForm';
import PackageList from '../../components/PackageList';
import EmailTemplateManager from '../../components/EmailTemplateManager';
import './AdminDashboard.css';

const BASE_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [packages, setPackages] = useState([]);
  const [stats, setStats] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [backgrounds, setBackgrounds] = useState([]);
  const [bgLoading, setBgLoading] = useState(false);
  const [uploadingBg, setUploadingBg] = useState(false);
  const [bgError, setBgError] = useState('');
  const [bgSuccess, setBgSuccess] = useState('');

  
  useEffect(() => { fetchPackages(); fetchStats(); }, []);
  useEffect(() => { if (activeTab === 'backgrounds') fetchBackgrounds(); }, [activeTab]);

  const fetchPackages = async () => {
    try { const r = await packageAPI.getAll(); setPackages(r.data.data ?? []); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };
  const fetchStats = async () => {
    try { const r = await bookingAPI.getStats(); setStats(r.data.data); }
    catch (e) { console.error(e); }
  };
  const fetchBackgrounds = async () => {
    setBgLoading(true);
    try { const r = await api.get('/login-backgrounds'); const d = r.data?.data ?? r.data; setBackgrounds(Array.isArray(d) ? d : []); }
    catch (e) { console.error(e); } finally { setBgLoading(false); }
  };
  const handleUploadBackground = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    if (file.size > 50*1024*1024) { setBgError('Maksimal 50MB'); return; }
    const isImage = file.type.startsWith('image/'), isVideo = file.type.startsWith('video/');
    if (!isImage && !isVideo) { setBgError('Hanya gambar atau video'); return; }
    setUploadingBg(true); setBgError(''); setBgSuccess('');
    try {
      const fd = new FormData(); fd.append('background', file); fd.append('type', isVideo ? 'video' : 'image');
      await api.post('/login-backgrounds', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setBgSuccess('Background berhasil diupload!'); fetchBackgrounds(); e.target.value = '';
    } catch (err) { setBgError('Gagal upload: ' + (err.response?.data?.message ?? err.message)); }
    finally { setUploadingBg(false); }
  };
  const handleToggleBg = async (id, cur) => { try { await api.patch(`/login-backgrounds/${id}/toggle`, { isActive: !cur }); fetchBackgrounds(); } catch { setBgError('Gagal'); } };
  const handleDeleteBg = async (id) => { if (!window.confirm('Hapus?')) return; try { await api.delete(`/login-backgrounds/${id}`); setBgSuccess('Dihapus'); fetchBackgrounds(); } catch { setBgError('Gagal'); } };
  const handleAddPackage = () => { setEditingPackage(null); setShowForm(true); };
  const handleEditPackage = (p) => { setEditingPackage(p); setShowForm(true); };
  const handleDeletePackage = async (id) => { if (window.confirm('Hapus paket?')) { try { await packageAPI.delete(id); fetchPackages(); } catch (e) { alert('Gagal: ' + e.response?.data?.message); } } };
  const handleFormSuccess = () => { setShowForm(false); setEditingPackage(null); fetchPackages(); };

  const NAV = [
    { key:'email', icon:'📧', label:'Template Email' },
    { key:'dashboard', icon:'📊', label:'Dashboard' },
    { key:'packages',  icon:'📦', label:'Packages' },
    { key:'categories', icon:'📁', label:'Kategori' },
    { key:'bookings',  icon:'📅', label:'Bookings' },
    { key:'studios',   icon:'🏢', label:'Studio' },
    { key:'backgrounds', icon:'🖼️', label:'Background Hero' },
    { key:'cms',       icon:'🖊️', label:'Kelola Website' },
  ];

  return (
    <div className="admin-dashboard">
      <div className="admin-sidebar">
        <div className="sidebar-header"><h2>📸 Studio Bion</h2><span className="admin-badge">Admin</span></div>
        <div className="sidebar-user">
          <div className="user-avatar">{user?.name?.charAt(0)}</div>
          <div className="user-info"><h3>{user?.name}</h3><p>{user?.email}</p></div>
        </div>
        <nav className="sidebar-nav">
          {NAV.map(({ key, icon, label }) => (
            <button key={key} className={activeTab === key ? 'active' : ''} onClick={() => setActiveTab(key)}>
              <span className="nav-icon">{icon}</span> {label}
            </button>
          ))}
          <button onClick={logout} className="logout-btn"><span className="nav-icon">🚪</span> Logout</button>
        </nav>
      </div>

      <div className="admin-content">
        <div className="content-header">
          {activeTab==='categories' && '📁 Kelola Kategori Paket'}
          {activeTab === 'categories' && <CategoryManager />}
          <h1>
            {activeTab==='dashboard' && '📊 Dashboard'}
            {activeTab==='packages' && '📦 Package Management'}
            {activeTab==='bookings' && '📅 Booking Management'}
            {activeTab==='studios' && '🏢 Kelola Studio'}
            {activeTab==='backgrounds' && '🖼️ Background Hero Slideshow'}
            {activeTab==='cms' && '🖊️ Kelola Konten Website'}
            {activeTab==='email' && '📧 Template Email Booking'}
            {activeTab === 'email' && <EmailTemplateManager />}
          </h1>
        </div>

        {activeTab === 'dashboard' && (
          <div className="stats-grid">
            <div className="stat-card stat-primary"><div className="stat-icon">📦</div><div className="stat-info"><h3>{packages.length}</h3><p>Total Packages</p></div></div>
            {stats && <>
              <div className="stat-card stat-warning"><div className="stat-icon">⏳</div><div className="stat-info"><h3>{stats.pendingBookings}</h3><p>Pending</p></div></div>
              <div className="stat-card stat-success"><div className="stat-icon">✅</div><div className="stat-info"><h3>{stats.completedBookings}</h3><p>Completed</p></div></div>
              <div className="stat-card stat-info"><div className="stat-icon">💰</div><div className="stat-info"><h3>Rp {stats.totalRevenue?.toLocaleString('id-ID')}</h3><p>Revenue</p></div></div>
            </>}
          </div>
        )}

        {activeTab === 'packages' && (
          <div className="packages-section">
            <div className="section-header">
              <button className="btn-add-package" onClick={handleAddPackage}>+ Tambah Paket</button>
            </div>
            {loading ? <div className="loading">Loading...</div> : (
              <PackageList packages={packages} onEdit={handleEditPackage} onDelete={handleDeletePackage} isAdmin={true} />
            )}
          </div>
        )}

        {activeTab === 'bookings' && <BookingManagement role="admin" />}

        {activeTab === 'studios' && <StudioManager />}

        {activeTab === 'backgrounds' && (
          <div className="backgrounds-section">
            <div className="bg-info-banner"><span>ℹ️</span><span>Background aktif tampil sebagai slideshow di hero halaman utama. Mendukung gambar &amp; video.</span></div>
            {bgError && <div className="bg-alert bg-alert-error">⚠️ {bgError} <button onClick={() => setBgError('')}>✕</button></div>}
            {bgSuccess && <div className="bg-alert bg-alert-success">✅ {bgSuccess} <button onClick={() => setBgSuccess('')}>✕</button></div>}
            <div className="bg-upload-area">
              <label className="bg-upload-label" htmlFor="bg-file-input">
                {uploadingBg ? <span>⏳ Mengupload...</span> : <>
                  <span className="upload-icon">📁</span>
                  <span className="upload-text">Klik untuk upload background hero</span>
                  <span className="upload-hint">Gambar (JPG, PNG, WebP) atau Video (MP4) — Maks. 50MB</span>
                </>}
              </label>
              <input id="bg-file-input" type="file" accept="image/*,video/mp4" onChange={handleUploadBackground} disabled={uploadingBg} style={{display:'none'}} />
            </div>
            {bgLoading ? <div className="loading">Memuat...</div> : backgrounds.length === 0 ? (
              <div className="bg-empty"><span>🖼️</span><p>Belum ada background.</p></div>
            ) : (
              <div className="bg-grid">
                {backgrounds.map(bg => (
                  <div key={bg.id} className={`bg-card ${bg.isActive ? 'bg-card-active' : 'bg-card-inactive'}`}>
                    <div className="bg-preview">
                      {bg.type === 'video'
                        ? <video src={`${BASE_URL}${bg.url}`} muted playsInline className="bg-preview-media" onMouseOver={e=>e.target.play()} onMouseOut={e=>{e.target.pause();e.target.currentTime=0;}} />
                        : <img src={`${BASE_URL}${bg.url}`} alt="bg" className="bg-preview-media" />
                      }
                      <div className="bg-type-badge">{bg.type==='video'?'🎥':'🖼️'}</div>
                    </div>
                    <div className="bg-card-footer">
                      <span className={`bg-status ${bg.isActive?'status-active':'status-inactive'}`}>{bg.isActive?'● Aktif':'○ Nonaktif'}</span>
                      <div className="bg-actions">
                        <button className={`btn-toggle-bg ${bg.isActive?'btn-deactivate':'btn-activate'}`} onClick={() => handleToggleBg(bg.id, bg.isActive)}>{bg.isActive?'Nonaktifkan':'Aktifkan'}</button>
                        <button className="btn-delete-bg" onClick={() => handleDeleteBg(bg.id)}>🗑️</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'cms' && <CmsManager />}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <PackageForm package={editingPackage} onSuccess={handleFormSuccess} onCancel={() => setShowForm(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

// ===== STUDIO MANAGER ===== ✅ export supaya bisa dipakai di ManagerDashboard juga
export const StudioManager = () => {
  const [studios, setStudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [creatingDefault, setCreatingDefault] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', note: '' });
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [fetchError, setFetchError] = useState(false);

  const fetchStudios = async () => {
    setLoading(true);
    setFetchError(false);
    try {
      const res = await studioAPI.getAll();
      setStudios(res.data?.data ?? []);
    } catch (e) {
      setFetchError(true);
      setMsg({ type: 'err', text: 'Gagal memuat data studio. Cek koneksi ke server.' });
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchStudios(); }, []);

  // ✅ NEW: buat Studio 1 & 2 default langsung dari UI (kalau belum pernah di-seed)
  const handleCreateDefault = async () => {
    setCreatingDefault(true);
    setMsg({ type: '', text: '' });
    try {
      await studioAPI.seedDefault();
      setMsg({ type: 'ok', text: 'Studio 1 & Studio 2 berhasil dibuat!' });
      fetchStudios();
    } catch (e) {
      setMsg({ type: 'err', text: 'Gagal membuat studio: ' + (e.response?.data?.message || e.message) });
    } finally {
      setCreatingDefault(false);
    }
  };

  const handleToggle = async (studio) => {
    if (!window.confirm(`${studio.isActive ? 'Tutup' : 'Buka'} ${studio.name}?`)) return;
    setBusyId(studio.id);
    try {
      await studioAPI.toggle(studio.id);
      setMsg({ type: 'ok', text: `${studio.name} berhasil ${studio.isActive ? 'ditutup' : 'dibuka'}` });
      fetchStudios();
    } catch (e) {
      setMsg({ type: 'err', text: 'Gagal mengubah status: ' + (e.response?.data?.message || e.message) });
    } finally {
      setBusyId(null);
      setTimeout(() => setMsg({ type: '', text: '' }), 3500);
    }
  };

  const openEdit = (studio) => {
    setEditing(studio.id);
    setEditForm({ name: studio.name, note: studio.note || '' });
  };

  const saveEdit = async () => {
    setBusyId(editing);
    try {
      await studioAPI.update(editing, editForm);
      setMsg({ type: 'ok', text: 'Studio berhasil diupdate' });
      setEditing(null);
      fetchStudios();
    } catch (e) {
      setMsg({ type: 'err', text: 'Gagal update: ' + (e.response?.data?.message || e.message) });
    } finally {
      setBusyId(null);
      setTimeout(() => setMsg({ type: '', text: '' }), 3500);
    }
  };

  if (loading) return <div className="loading">Memuat data studio...</div>;

  return (
    <div className="studios-section">
      <div className="bg-info-banner">
        <span>ℹ️</span>
        <span>Nonaktifkan studio yang sedang tutup (renovasi, maintenance, dll). Studio yang tutup akan tampil buram dengan keterangan "Belum Dibuka" saat customer memilih paket. Admin & Manager sama-sama bisa mengontrol ini.</span>
      </div>

      {msg.text && (
        <div className={`bg-alert ${msg.type === 'ok' ? 'bg-alert-success' : 'bg-alert-error'}`}>
          {msg.type === 'ok' ? '✅' : '⚠️'} {msg.text}
          <button onClick={() => setMsg({ type: '', text: '' })}>✕</button>
        </div>
      )}

      {/* ✅ NEW: EMPTY STATE — ini yang sebelumnya blank tanpa pesan */}
      {studios.length === 0 ? (
        <div className="studio-empty-state">
          <span className="studio-empty-icon">🏢</span>
          <h3>Belum ada studio terdaftar</h3>
          <p>
            {fetchError
              ? 'Tidak bisa memuat data dari server. Pastikan backend berjalan dan route /api/studios sudah terdaftar.'
              : 'Klik tombol di bawah untuk membuat Studio 1 & Studio 2 secara otomatis.'}
          </p>
          {!fetchError && (
            <button className="btn-create-default-studio" onClick={handleCreateDefault} disabled={creatingDefault}>
              {creatingDefault ? '⏳ Membuat...' : '+ Buat Studio 1 & Studio 2'}
            </button>
          )}
          {fetchError && (
            <button className="btn-create-default-studio" onClick={fetchStudios}>
              🔄 Coba Lagi
            </button>
          )}
        </div>
      ) : (
        <div className="studio-admin-grid">
          {studios.map(studio => (
            <div key={studio.id} className={`studio-admin-card ${studio.isActive ? 'is-open' : 'is-closed'}`}>
              <div className="studio-admin-top">
                <div className="studio-admin-icon">🏢</div>
                <label className="studio-switch">
                  <input
                    type="checkbox"
                    checked={studio.isActive}
                    disabled={busyId === studio.id}
                    onChange={() => handleToggle(studio)}
                  />
                  <span className="studio-switch-slider"></span>
                </label>
              </div>

              {editing === studio.id ? (
                <div className="studio-edit-form">
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="Nama studio"
                  />
                  <textarea
                    value={editForm.note}
                    onChange={e => setEditForm({ ...editForm, note: e.target.value })}
                    placeholder="Catatan (opsional, misal: Tutup sampai 10 Juli)"
                    rows={2}
                  />
                  <div className="studio-edit-actions">
                    <button className="btn-cancel-mini" onClick={() => setEditing(null)}>Batal</button>
                    <button className="btn-save-mini" onClick={saveEdit} disabled={busyId === studio.id}>
                      {busyId === studio.id ? '...' : 'Simpan'}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="studio-admin-name">{studio.name}</h3>
                  <span className={`studio-admin-status ${studio.isActive ? 'status-open' : 'status-closed'}`}>
                    {studio.isActive ? '● Buka — Tersedia untuk Booking' : '● Tutup — Disembunyikan dari Booking'}
                  </span>
                  {studio.note && <p className="studio-admin-note">📝 {studio.note}</p>}
                  <button className="btn-edit-studio" onClick={() => openEdit(studio)}>✎ Edit Nama / Catatan</button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ===== CMS MANAGER =====
const DEFAULT_CMS_FORM = {
  heroPreTitle:'MINIMALIST SPACE', heroTitle:'Studio Kreatif Untuk', heroTitleItalic:'Momen Anda', heroWaLink:'https://wa.me/6281200000000',
  aboutPreTitle:'OUR PHILOSOPHY', aboutTitle:'Ruang Tanpa Batas untuk Imajinasi Anda.', aboutDesc1:'Kami menyediakan ruang yang fleksibel dan terkurasi.', aboutDesc2:'Dengan pencahayaan alami yang melimpah dan desain interior yang bersih.',
  servicesPreTitle:'OUR SERVICES', servicesTitle:'Fasilitas & Layanan',
  service1Icon:'📷', service1Title:'Studio Hire', service1Desc:'Penyewaan ruang studio dengan kontrol cahaya penuh dan berbagai pilihan backdrop premium.',
  service2Icon:'💡', service2Title:'Equipment Rental', service2Desc:'Akses ke koleksi pencahayaan terbaru, kamera high-end, dan berbagai modifier.',
  service3Icon:'✨', service3Title:'Post-Production', service3Desc:'Layanan retouching profesional dan color grading untuk hasil karya terbaik.',
  ctaTitle:'Pesan Sesi Anda Sekarang', ctaDesc:'Jadwalkan konsultasi atau langsung pesan ruang studio kami.', ctaWaLink:'https://wa.me/6281200000000',
  footerInstagram:'', footerWaLink:'https://wa.me/6281200000000',
};

const CmsManager = () => {
  const [tab, setTab] = useState('hero');
  const [form, setForm] = useState(DEFAULT_CMS_FORM);
  const [loadingCms, setLoadingCms] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type:'', text:'' });

  useEffect(() => {
    api.get('/cms/settings')
      .then(res => {
        const d = res.data?.data ?? res.data;
        if (d && typeof d === 'object') setForm(prev => ({ ...prev, ...d }));
      })
      .catch(() => {})
      .finally(() => setLoadingCms(false));
  }, []);

  const set = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const save = async () => {
    setSaving(true); setMsg({ type:'', text:'' });
    try {
      await api.post('/cms/settings', form);
      setMsg({ type:'ok', text:'✅ Konten website berhasil disimpan dan dipublikasikan!' });
      setTimeout(() => setMsg({ type:'', text:'' }), 4000);
    } catch (err) {
      setMsg({ type:'err', text:'Gagal: ' + (err.response?.data?.message || err.message) });
    } finally { setSaving(false); }
  };

  const TABS = [
    { key:'hero', label:'🏠 Hero & CTA' },
    { key:'about', label:'ℹ️ About' },
    { key:'services', label:'⚙️ Services' },
    { key:'footer', label:'🔗 Footer' },
  ];

  const inp = (name, placeholder='', type='text') => (
    <input type={type} name={name} value={form[name]} onChange={set} placeholder={placeholder}
      style={{width:'100%',padding:'10px 12px',borderRadius:8,border:'1px solid #d1d5db',fontSize:14,color:'#111',boxSizing:'border-box'}} />
  );
  const ta = (name, placeholder='', rows=3) => (
    <textarea name={name} value={form[name]} onChange={set} placeholder={placeholder} rows={rows}
      style={{width:'100%',padding:'10px 12px',borderRadius:8,border:'1px solid #d1d5db',fontSize:14,color:'#111',boxSizing:'border-box',resize:'vertical'}} />
  );
  const label = (text, hint) => (
    <div style={{marginBottom:6}}>
      <label style={{display:'block',fontSize:13,fontWeight:600,color:'#374151'}}>{text}</label>
      {hint && <span style={{fontSize:11,color:'#9ca3af'}}>{hint}</span>}
    </div>
  );
  const fg = (children, mb=18) => <div style={{marginBottom:mb}}>{children}</div>;
  const row = (children) => <div style={{display:'flex',gap:14,marginBottom:18}}>{children}</div>;

  if (loadingCms) return <div className="loading">Memuat pengaturan...</div>;

  return (
    <div style={{background:'#fff',borderRadius:12,border:'1px solid #e5e7eb',overflow:'hidden'}}>
      <div style={{display:'flex',borderBottom:'1px solid #e5e7eb',background:'#f9fafb',padding:'0 8px'}}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding:'14px 18px',border:'none',background:'none',fontSize:14,cursor:'pointer',fontWeight:500,
            color: tab===t.key ? '#2563eb' : '#6b7280',
            borderBottom: tab===t.key ? '2px solid #2563eb' : '2px solid transparent',
          }}>{t.label}</button>
        ))}
      </div>

      {msg.text && (
        <div style={{
          margin:'0 24px',marginTop:16,padding:'12px 16px',borderRadius:8,fontSize:14,
          background: msg.type==='ok' ? '#d1fae5' : '#fef2f2',
          color: msg.type==='ok' ? '#065f46' : '#991b1b',
          border: msg.type==='ok' ? '1px solid #a7f3d0' : '1px solid #fecaca',
        }}>{msg.text}</div>
      )}

      <div style={{padding:24}}>

        {tab === 'hero' && (
          <>
            <div style={{fontSize:15,fontWeight:700,color:'#111',marginBottom:20,paddingBottom:10,borderBottom:'1px solid #f3f4f6'}}>Bagian Hero (Layar Utama)</div>
            {fg(<>{label('Teks Kecil atas judul (Pre-Title)', 'Contoh: MINIMALIST SPACE')}{inp('heroPreTitle','MINIMALIST SPACE')}</>)}
            {row(<>
              <div style={{flex:1}}>{fg(<>{label('Judul Utama — baris 1 (tebal)')}{inp('heroTitle','Studio Kreatif Untuk')}</>)}</div>
              <div style={{flex:1}}>{fg(<>{label('Judul Utama — baris 2 (italic)')}{inp('heroTitleItalic','Momen Anda')}</>)}</div>
            </>)}
            {fg(<>{label('Link WhatsApp tombol "Hubungi Kami" di Hero','Format: https://wa.me/628xxxxxxxxxx')}{inp('heroWaLink','https://wa.me/628...')}</>)}

            <div style={{borderTop:'1px solid #f3f4f6',margin:'20px 0'}} />
            <div style={{fontSize:15,fontWeight:700,color:'#111',marginBottom:20}}>Bagian CTA (Bawah Halaman)</div>
            {fg(<>{label('Judul CTA')}{inp('ctaTitle','Pesan Sesi Anda Sekarang')}</>)}
            {fg(<>{label('Deskripsi CTA')}{ta('ctaDesc','Jadwalkan konsultasi atau langsung pesan...')}</>)}
            {fg(<>{label('Link WhatsApp tombol "Hubungi Kami" di CTA')}{inp('ctaWaLink','https://wa.me/628...')}</>)}
          </>
        )}

        {tab === 'about' && (
          <>
            <div style={{fontSize:15,fontWeight:700,color:'#111',marginBottom:20,paddingBottom:10,borderBottom:'1px solid #f3f4f6'}}>Bagian "Our Philosophy" / About</div>
            {fg(<>{label('Label kecil (Pre-Title)')}{inp('aboutPreTitle','OUR PHILOSOPHY')}</>)}
            {fg(<>{label('Judul About')}{inp('aboutTitle','Ruang Tanpa Batas untuk Imajinasi Anda.')}</>)}
            {fg(<>{label('Paragraf 1')}{ta('aboutDesc1','Deskripsi pertama...',3)}</>)}
            {fg(<>{label('Paragraf 2')}{ta('aboutDesc2','Deskripsi kedua...',3)}</>)}
          </>
        )}

        {tab === 'services' && (
          <>
            {row(<>
              <div style={{flex:1}}>{fg(<>{label('Label kecil (Pre-Title)')}{inp('servicesPreTitle','OUR SERVICES')}</>)}</div>
              <div style={{flex:1}}>{fg(<>{label('Judul Section Services')}{inp('servicesTitle','Fasilitas & Layanan')}</>)}</div>
            </>)}
            {[1,2,3].map(n => (
              <div key={n} style={{background:'#f9fafb',border:'1px solid #e5e7eb',borderRadius:10,padding:18,marginBottom:14}}>
                <div style={{fontSize:12,fontWeight:700,color:'#6b7280',marginBottom:14,textTransform:'uppercase',letterSpacing:'.5px'}}>Layanan {n}</div>
                {row(<>
                  <div style={{flex:'0 0 90px'}}>
                    {label('Ikon (emoji)')}
                    <input type="text" name={`service${n}Icon`} value={form[`service${n}Icon`]} onChange={set}
                      style={{width:'100%',padding:'10px',borderRadius:8,border:'1px solid #d1d5db',fontSize:22,textAlign:'center',boxSizing:'border-box'}} />
                  </div>
                  <div style={{flex:1}}>
                    {label('Judul Layanan')}
                    <input type="text" name={`service${n}Title`} value={form[`service${n}Title`]} onChange={set}
                      style={{width:'100%',padding:'10px 12px',borderRadius:8,border:'1px solid #d1d5db',fontSize:14,color:'#111',boxSizing:'border-box'}} />
                  </div>
                </>)}
                {label('Deskripsi')}
                <textarea name={`service${n}Desc`} value={form[`service${n}Desc`]} onChange={set} rows={2}
                  style={{width:'100%',padding:'10px 12px',borderRadius:8,border:'1px solid #d1d5db',fontSize:14,color:'#111',boxSizing:'border-box',resize:'vertical'}} />
              </div>
            ))}
          </>
        )}

        {tab === 'footer' && (
          <>
            <div style={{fontSize:15,fontWeight:700,color:'#111',marginBottom:20,paddingBottom:10,borderBottom:'1px solid #f3f4f6'}}>Footer & Tautan Sosial Media</div>
            {fg(<>{label('Link WhatsApp (Footer)')}{inp('footerWaLink','https://wa.me/628...')}</>)}
            {fg(<>
              {label('Link Instagram (opsional)','Kosongkan jika tidak ingin ditampilkan')}
              {inp('footerInstagram','https://instagram.com/namastudio')}
            </>)}
          </>
        )}
      </div>

      <div style={{padding:'16px 24px',borderTop:'1px solid #e5e7eb',background:'#f9fafb'}}>
        <button onClick={save} disabled={saving} style={{
          width:'100%',padding:'14px',borderRadius:8,border:'none',
          background: saving ? '#93c5fd' : '#2563eb',
          color:'#fff',fontSize:15,fontWeight:700,cursor:saving?'not-allowed':'pointer',transition:'background .2s',
        }}>
          {saving ? '⏳ Menyimpan...' : '🚀 Publikasikan Konten Website'}
        </button>
      </div>
    </div>
  );
};

// ===== BOOKING MANAGEMENT =====
export const BookingManagement = ({ role }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [photoModal, setPhotoModal] = useState(null);

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try { const r = await bookingAPI.getAll(); setBookings(r.data.data ?? []); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleUpdateStatus = async (id, status) => {
    if (!window.confirm(`${status==='approved'?'Approve':status==='completed'?'Selesaikan':'Reject'} booking ini?`)) return;
    try { await bookingAPI.updateStatus(id, status); fetchBookings(); }
    catch (e) { alert('Gagal: ' + e.response?.data?.message); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus booking ini?')) return;
    try { await bookingAPI.delete(id); fetchBookings(); }
    catch (e) { alert('Gagal: ' + e.response?.data?.message); }
  };

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  const statusColor = s => ({ pending:'#fbbf24', approved:'#34d399', rejected:'#f87171', completed:'#60a5fa', cancelled:'#9ca3af', expired:'#6b7280' }[s] || '#9ca3af');

  return (
    <div className="bookings-section">
      <div className="filter-section">
        {['all','pending','approved','rejected','completed'].map(f => (
          <button key={f} className={filter===f?'active':''} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase()+f.slice(1)} ({f==='all'?bookings.length:bookings.filter(b=>b.status===f).length})
          </button>
        ))}
      </div>

      {loading ? <div className="loading">Loading...</div>
        : filtered.length===0 ? <div className="empty-state"><div className="empty-icon">📅</div><h3>Tidak ada booking</h3></div>
        : (
          <div className="bookings-table">
            {filtered.map(b => (
              <div key={b.id} className="booking-row">
                <div className="booking-main-info">
                  <div className="booking-customer">
                    <div className="customer-avatar">{b.userName?.charAt(0)||'?'}</div>
                    <div className="customer-details">
                      <h3>{b.userName||'-'}</h3><p>{b.userEmail||'-'}</p><p>{b.userPhone||'-'}</p>
                    </div>
                  </div>
                  <div className="booking-package-details">
                    <h4>{b.package?.name||'-'}</h4>
                    <div className="package-meta">
                      {b.package?.category && <span className="meta-badge">{b.package.category}</span>}
                      {b.studio?.name && <span className="meta-badge" style={{background:'#eef2ff',color:'#4338ca'}}>🏢 {b.studio.name}</span>}
                      {b.bookingDate && <span className="meta-item">📅 {new Date(b.bookingDate).toLocaleDateString('id-ID')}</span>}
                      {b.bookingTime && <span className="meta-item">🕒 {b.bookingTime}</span>}
                    </div>
                    {b.status==='approved' && b.package?.lynkUrl && (
                      <div style={{background:'#f5f3ff',border:'1px solid #c4b5fd',borderRadius:6,padding:'6px 10px',marginTop:8,fontSize:12}}>
                        <span style={{color:'#6b7280'}}>Link bayar: </span>
                        <a href={b.package.lynkUrl} target="_blank" rel="noopener noreferrer" style={{color:'#7c3aed',fontWeight:600}}>{b.package.lynkUrl}</a>
                      </div>
                    )}
                    {b.notes && <p className="booking-notes">📝 {b.notes}</p>}
                    {(b.status==='approved'||b.status==='completed') && (
                      <div className="photo-pickup-info">
                        <div className="pickup-badge" style={{background:b.photoPickupStatus==='sudah_diambil'?'#d1fae5':'#fef3c7',color:b.photoPickupStatus==='sudah_diambil'?'#065f46':'#92400e',padding:'4px 10px',borderRadius:20,fontSize:12,display:'inline-block',marginTop:6}}>
                          🖼️ Foto: {b.photoPickupStatus==='sudah_diambil'?'Sudah diambil':'Belum diambil'}
                        </div>
                        {b.photoPickupBy && <p style={{fontSize:12,color:'#6b7280',margin:'2px 0'}}>👤 {b.photoPickupBy}</p>}
                        {b.photoPickupDate && <p style={{fontSize:12,color:'#6b7280',margin:'2px 0'}}>📅 {new Date(b.photoPickupDate).toLocaleDateString('id-ID')}</p>}
                        {b.photoPickupNotes && <p style={{fontSize:12,color:'#6b7280',margin:'2px 0'}}>📝 {b.photoPickupNotes}</p>}
                      </div>
                    )}
                  </div>
                  <div className="booking-price-status">
                    <div className="booking-price">Rp {b.totalPrice?.toLocaleString('id-ID')||'-'}</div>
                    <div className="booking-status" style={{backgroundColor:statusColor(b.status)}}>{b.status}</div>
                    {b.approvedBy && <p className="approved-by">by: {b.approvedBy.name}</p>}
                  </div>
                </div>
                <div className="booking-actions">
                  {b.status==='pending' && <>
                    <button className="btn-approve" onClick={()=>handleUpdateStatus(b.id,'approved')}>✓ Approve</button>
                    <button className="btn-reject" onClick={()=>handleUpdateStatus(b.id,'rejected')}>✕ Reject</button>
                  </>}
                  {b.status==='approved' && <>
                    <button className="btn-complete" onClick={()=>handleUpdateStatus(b.id,'completed')}>✓ Selesai</button>
                    <button className="btn-photo" onClick={()=>setPhotoModal(b)} style={{background:'#7c3aed',color:'white',border:'none',padding:'6px 12px',borderRadius:6,cursor:'pointer'}}>🖼️ Foto Pickup</button>
                  </>}
                  {b.status==='completed' && <button onClick={()=>setPhotoModal(b)} style={{background:'#6b7280',color:'white',border:'none',padding:'6px 12px',borderRadius:6,cursor:'pointer'}}>🖼️ Edit Pickup</button>}
                  {role==='admin' && <button className="btn-delete-booking" onClick={()=>handleDelete(b.id)}>🗑️</button>}
                </div>
              </div>
            ))}
          </div>
        )}
      {photoModal && <PhotoPickupModal booking={photoModal} onClose={()=>setPhotoModal(null)} onSuccess={()=>{setPhotoModal(null);fetchBookings();}} />}
    </div>
  );
};

// ===== PHOTO PICKUP MODAL =====
const PhotoPickupModal = ({ booking, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    photoPickupDate: booking.photoPickupDate ? new Date(booking.photoPickupDate).toISOString().split('T')[0] : '',
    photoPickupBy: booking.photoPickupBy||'',
    photoPickupNotes: booking.photoPickupNotes||'',
    photoPickupStatus: booking.photoPickupStatus||'belum_diambil',
  });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setLoading(true);
    try { await api.patch(`/bookings/${booking.id}/photo-pickup`, form); alert('Berhasil disimpan!'); onSuccess(); }
    catch (err) { alert('Gagal: ' + (err.response?.data?.message||err.message)); }
    finally { setLoading(false); }
  };

  const inp = (name, placeholder, type='text') => (
    <input type={type} value={form[name]} onChange={e=>setForm({...form,[name]:e.target.value})} placeholder={placeholder}
      style={{width:'100%',padding:'10px 12px',borderRadius:8,border:'1px solid #d1d5db',fontSize:14,boxSizing:'border-box'}} />
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e=>e.stopPropagation()} style={{maxWidth:480}}>
        <div style={{background:'linear-gradient(135deg,#7c3aed,#4f46e5)',color:'white',padding:'20px 24px',borderRadius:'12px 12px 0 0',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <h2 style={{margin:0,fontSize:18}}>🖼️ Info Pengambilan Foto</h2>
          <button onClick={onClose} style={{background:'none',border:'none',color:'white',fontSize:20,cursor:'pointer'}}>✕</button>
        </div>
        <div style={{padding:24}}>
          <div style={{background:'#f3f4f6',borderRadius:8,padding:12,marginBottom:20}}>
            <p style={{margin:0,fontWeight:600}}>{booking.userName}</p>
            <p style={{margin:'4px 0 0',color:'#6b7280',fontSize:14}}>{booking.package?.name} — {booking.bookingDate?new Date(booking.bookingDate).toLocaleDateString('id-ID'):'-'}</p>
          </div>
          <form onSubmit={submit}>
            <div style={{marginBottom:16}}>
              <label style={{display:'block',fontWeight:600,marginBottom:6,fontSize:14}}>Status</label>
              <select value={form.photoPickupStatus} onChange={e=>setForm({...form,photoPickupStatus:e.target.value})}
                style={{width:'100%',padding:'10px 12px',borderRadius:8,border:'1px solid #d1d5db',fontSize:14}}>
                <option value="belum_diambil"> Belum Diambil</option>
                <option value="sudah_diambil"> Sudah Diambil</option>
              </select>
            </div>
            <div style={{marginBottom:16}}><label style={{display:'block',fontWeight:600,marginBottom:6,fontSize:14}}>Nama yang Mengambil</label>{inp('photoPickupBy','Nama pengambil...')}</div>
            <div style={{marginBottom:16}}><label style={{display:'block',fontWeight:600,marginBottom:6,fontSize:14}}>Tanggal Pengambilan</label>{inp('photoPickupDate','','date')}</div>
            <div style={{marginBottom:20}}>
              <label style={{display:'block',fontWeight:600,marginBottom:6,fontSize:14}}>Catatan</label>
              <textarea value={form.photoPickupNotes} onChange={e=>setForm({...form,photoPickupNotes:e.target.value})} rows={3}
                style={{width:'100%',padding:'10px 12px',borderRadius:8,border:'1px solid #d1d5db',fontSize:14,boxSizing:'border-box',resize:'vertical'}} />
            </div>
            <div style={{display:'flex',gap:12,justifyContent:'flex-end'}}>
              <button type="button" onClick={onClose} style={{padding:'10px 20px',borderRadius:8,border:'1px solid #d1d5db',background:'white',cursor:'pointer'}}>Batal</button>
              <button type="submit" disabled={loading} style={{padding:'10px 20px',borderRadius:8,border:'none',background:'linear-gradient(135deg,#7c3aed,#4f46e5)',color:'white',fontWeight:600,cursor:'pointer'}}>
                {loading?'Menyimpan...':'Simpan'}
              </button>
            </div>
          </form>
        </div> 
      </div>
    </div>
  );
};

export default AdminDashboard;
