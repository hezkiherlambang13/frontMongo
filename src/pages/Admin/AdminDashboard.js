// src/pages/Admin/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { packageAPI, bookingAPI } from '../../services/api';
import api from '../../services/api';
import PackageForm from '../../components/PackageForm';
import PackageList from '../../components/PackageList';
import './AdminDashboard.css';

const BASE_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [packages, setPackages] = useState([]);
  const [stats, setStats] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('packages');
  const [backgrounds, setBackgrounds] = useState([]);
  const [bgLoading, setBgLoading] = useState(false);
  const [uploadingBg, setUploadingBg] = useState(false);
  const [bgError, setBgError] = useState('');
  const [bgSuccess, setBgSuccess] = useState('');

  useEffect(() => { fetchPackages(); fetchStats(); }, []);
  useEffect(() => { if (activeTab === 'backgrounds') fetchBackgrounds(); }, [activeTab]);

  const fetchPackages = async () => {
    try {
      const response = await packageAPI.getAll();
      setPackages(response.data.data ?? []);
    } catch (error) { console.error('Error fetching packages:', error); }
    finally { setLoading(false); }
  };

  const fetchStats = async () => {
    try {
      const response = await bookingAPI.getStats();
      setStats(response.data.data);
    } catch (error) { console.error('Error fetching stats:', error); }
  };

  const fetchBackgrounds = async () => {
    setBgLoading(true);
    try {
      const res = await api.get('/login-backgrounds');
      const data = res.data?.data ?? res.data;
      setBackgrounds(Array.isArray(data) ? data : []);
    } catch (error) { console.error('Error:', error); }
    finally { setBgLoading(false); }
  };

  const handleUploadBackground = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) { setBgError('Maksimal 50MB'); return; }
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    if (!isImage && !isVideo) { setBgError('Hanya gambar atau video'); return; }
    setUploadingBg(true); setBgError(''); setBgSuccess('');
    try {
      const formData = new FormData();
      formData.append('background', file);
      formData.append('type', isVideo ? 'video' : 'image');
      await api.post('/login-backgrounds', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setBgSuccess('Background berhasil diupload!');
      fetchBackgrounds();
      e.target.value = '';
    } catch (error) {
      setBgError('Gagal upload: ' + (error.response?.data?.message ?? error.message));
    } finally { setUploadingBg(false); }
  };

  const handleToggleBg = async (id, currentStatus) => {
    try {
      await api.patch(`/login-backgrounds/${id}/toggle`, { isActive: !currentStatus });
      fetchBackgrounds();
    } catch { setBgError('Gagal mengubah status'); }
  };

  const handleDeleteBg = async (id) => {
    if (!window.confirm('Hapus background ini?')) return;
    try {
      await api.delete(`/login-backgrounds/${id}`);
      setBgSuccess('Background dihapus');
      fetchBackgrounds();
    } catch { setBgError('Gagal menghapus'); }
  };

  const handleAddPackage = () => { setEditingPackage(null); setShowForm(true); };
  const handleEditPackage = (pkg) => { setEditingPackage(pkg); setShowForm(true); };
  const handleDeletePackage = async (id) => {
    if (window.confirm('Hapus paket ini?')) {
      try { await packageAPI.delete(id); fetchPackages(); }
      catch (error) { alert('Gagal: ' + error.response?.data?.message); }
    }
  };
  const handleFormSuccess = () => { setShowForm(false); setEditingPackage(null); fetchPackages(); };

  return (
    <div className="admin-dashboard">
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <h2>📸 Studio Bion</h2>
          <span className="admin-badge">Admin</span>
        </div>
        <div className="sidebar-user">
          <div className="user-avatar">{user?.name?.charAt(0)}</div>
          <div className="user-info"><h3>{user?.name}</h3><p>{user?.email}</p></div>
        </div>
        <nav className="sidebar-nav">
          {[
            { key: 'dashboard', icon: '📊', label: 'Dashboard' },
            { key: 'packages', icon: '📦', label: 'Packages' },
            { key: 'bookings', icon: '📅', label: 'Bookings' },
            { key: 'backgrounds', icon: '🖼️', label: 'Home Background' },
          ].map(({ key, icon, label }) => (
            <button key={key} className={activeTab === key ? 'active' : ''} onClick={() => setActiveTab(key)}>
              <span className="nav-icon">{icon}</span> {label}
            </button>
          ))}
          <button onClick={logout} className="logout-btn"><span className="nav-icon">🚪</span> Logout</button>
        </nav>
      </div>

      <div className="admin-content">
        <div className="content-header">
          <h1>
            {activeTab === 'dashboard' && '📊 Dashboard'}
            {activeTab === 'packages' && '📦 Package Management'}
            {activeTab === 'bookings' && '📅 Booking Management'}
            {activeTab === 'backgrounds' && '🖼️ Kelola Background Home'}
          </h1>
        </div>

        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="stats-grid">
            <div className="stat-card stat-primary">
              <div className="stat-icon">📦</div>
              <div className="stat-info"><h3>{packages.length}</h3><p>Total Packages</p></div>
            </div>
            {stats && <>
              <div className="stat-card stat-warning">
                <div className="stat-icon">⏳</div>
                <div className="stat-info"><h3>{stats.pendingBookings}</h3><p>Pending</p></div>
              </div>
              <div className="stat-card stat-success">
                <div className="stat-icon">✅</div>
                <div className="stat-info"><h3>{stats.completedBookings}</h3><p>Completed</p></div>
              </div>
              <div className="stat-card stat-info">
                <div className="stat-icon">💰</div>
                <div className="stat-info"><h3>Rp {stats.totalRevenue?.toLocaleString('id-ID')}</h3><p>Revenue</p></div>
              </div>
            </>}
          </div>
        )}

        {/* PACKAGES */}
        {activeTab === 'packages' && (
          <div className="packages-section">
            <div className="section-header">
              <button className="btn-add-package" onClick={handleAddPackage}> Tambah Paket</button>
            </div>
            {loading ? <div className="loading">Loading...</div> : (
              <PackageList packages={packages} onEdit={handleEditPackage} onDelete={handleDeletePackage} isAdmin={true} />
            )}
          </div>
        )}

        {/* BOOKINGS */}
        {activeTab === 'bookings' && <BookingManagement role="admin" />}

        {/* BACKGROUNDS */}
        {activeTab === 'backgrounds' && (
          <div className="backgrounds-section">
            <div className="bg-info-banner">
              <span>ℹ️</span>
              <span>Background aktif tampil sebagai slideshow di halaman Home. Mendukung gambar & video.</span>
            </div>
            {bgError && <div className="bg-alert bg-alert-error">⚠️ {bgError} <button onClick={() => setBgError('')}>✕</button></div>}
            {bgSuccess && <div className="bg-alert bg-alert-success">✅ {bgSuccess} <button onClick={() => setBgSuccess('')}>✕</button></div>}
            <div className="bg-upload-area">
              <label className="bg-upload-label" htmlFor="bg-file-input">
                {uploadingBg ? <span>⏳ Mengupload...</span> : <>
                  <span className="upload-icon">📁</span>
                  <span className="upload-text">Klik untuk upload background</span>
                  <span className="upload-hint">Gambar (JPG, PNG, WebP) atau Video (MP4) — Maks. 50MB</span>
                </>}
              </label>
              <input id="bg-file-input" type="file" accept="image/*,video/mp4" onChange={handleUploadBackground} disabled={uploadingBg} style={{ display: 'none' }} />
            </div>
            {bgLoading ? <div className="loading">Memuat...</div> : backgrounds.length === 0 ? (
              <div className="bg-empty"><span>🖼️</span><p>Belum ada background.</p></div>
            ) : (
              <div className="bg-grid">
                {backgrounds.map((bg) => (
                  <div key={bg.id} className={`bg-card ${bg.isActive ? 'bg-card-active' : 'bg-card-inactive'}`}>
                    <div className="bg-preview">
                      {bg.type === 'video'
                        ? <video src={`${BASE_URL}${bg.url}`} muted playsInline className="bg-preview-media" onMouseOver={e => e.target.play()} onMouseOut={e => { e.target.pause(); e.target.currentTime = 0; }} />
                        : <img src={`${BASE_URL}${bg.url}`} alt="bg" className="bg-preview-media" />
                      }
                      <div className="bg-type-badge">{bg.type === 'video' ? '🎥' : '🖼️'}</div>
                    </div>
                    <div className="bg-card-footer">
                      <span className={`bg-status ${bg.isActive ? 'status-active' : 'status-inactive'}`}>
                        {bg.isActive ? '● Aktif' : '○ Nonaktif'}
                      </span>
                      <div className="bg-actions">
                        <button className={`btn-toggle-bg ${bg.isActive ? 'btn-deactivate' : 'btn-activate'}`} onClick={() => handleToggleBg(bg.id, bg.isActive)}>
                          {bg.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                        <button className="btn-delete-bg" onClick={() => handleDeleteBg(bg.id)}>🗑️</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
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

// ===== SHARED BOOKING MANAGEMENT (dipakai Admin & Manager) =====
export const BookingManagement = ({ role }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [photoModal, setPhotoModal] = useState(null); // booking yang sedang diedit pickup-nya

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try {
      const response = await bookingAPI.getAll();
      setBookings(response.data.data ?? []);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const handleUpdateStatus = async (id, status) => {
    if (!window.confirm(`${status === 'approved' ? 'Approve' : status === 'completed' ? 'Selesaikan' : 'Reject'} booking ini?`)) return;
    try {
      await bookingAPI.updateStatus(id, status);
      fetchBookings();
    } catch (error) { alert('Gagal: ' + error.response?.data?.message); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus booking ini?')) return;
    try { await bookingAPI.delete(id); fetchBookings(); }
    catch (error) { alert('Gagal: ' + error.response?.data?.message); }
  };

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  const getStatusColor = (status) => ({
    pending: '#fbbf24', approved: '#34d399', rejected: '#f87171',
    completed: '#60a5fa', cancelled: '#9ca3af', expired: '#6b7280',
  }[status] || '#9ca3af');

  return (
    <div className="bookings-section">
      <div className="filter-section">
        {['all', 'pending', 'approved', 'rejected', 'completed'].map(f => (
          <button key={f} className={filter === f ? 'active' : ''} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)} ({f === 'all' ? bookings.length : bookings.filter(b => b.status === f).length})
          </button>
        ))}
      </div>

      {loading ? <div className="loading">Loading...</div>
        : filtered.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">📅</div><h3>Tidak ada booking</h3></div>
        ) : (
          <div className="bookings-table">
            {filtered.map(booking => (
              <div key={booking.id} className="booking-row">
                <div className="booking-main-info">
                  <div className="booking-customer">
                    <div className="customer-avatar">{booking.userName?.charAt(0) || '?'}</div>
                    <div className="customer-details">
                      <h3>{booking.userName || '-'}</h3>
                      <p>{booking.userEmail || '-'}</p>
                      <p>{booking.userPhone || '-'}</p>
                    </div>
                  </div>
                  <div className="booking-package-details">
                    <h4>{booking.package?.name || '-'}</h4>
                    <div className="package-meta">
                      {booking.package?.category && <span className="meta-badge">{booking.package.category}</span>}
                      {booking.bookingDate && <span className="meta-item">📅 {new Date(booking.bookingDate).toLocaleDateString('id-ID')}</span>}
                      {booking.bookingTime && <span className="meta-item">🕒 {booking.bookingTime}</span>}
                    </div>
                    {booking.notes && <p className="booking-notes">📝 {booking.notes}</p>}

                    {/* INFO PENGAMBILAN FOTO */}
                    {(booking.status === 'approved' || booking.status === 'completed') && (
                      <div className="photo-pickup-info">
                        <div className="pickup-badge" style={{
                          background: booking.photoPickupStatus === 'sudah_diambil' ? '#d1fae5' : '#fef3c7',
                          color: booking.photoPickupStatus === 'sudah_diambil' ? '#065f46' : '#92400e',
                          padding: '4px 10px', borderRadius: 20, fontSize: 12, display: 'inline-block', marginTop: 6
                        }}>
                          🖼️ Foto: {booking.photoPickupStatus === 'sudah_diambil' ? 'Sudah diambil' : 'Belum diambil'}
                        </div>
                        {booking.photoPickupBy && <p style={{fontSize:12, color:'#6b7280', margin:'2px 0'}}>👤 {booking.photoPickupBy}</p>}
                        {booking.photoPickupDate && <p style={{fontSize:12, color:'#6b7280', margin:'2px 0'}}>📅 {new Date(booking.photoPickupDate).toLocaleDateString('id-ID')}</p>}
                        {booking.photoPickupNotes && <p style={{fontSize:12, color:'#6b7280', margin:'2px 0'}}>📝 {booking.photoPickupNotes}</p>}
                      </div>
                    )}
                  </div>
                  <div className="booking-price-status">
                    <div className="booking-price">Rp {booking.totalPrice?.toLocaleString('id-ID') || '-'}</div>
                    <div className="booking-status" style={{ backgroundColor: getStatusColor(booking.status) }}>
                      {booking.status}
                    </div>
                    {booking.approvedBy && <p className="approved-by">by: {booking.approvedBy.name}</p>}
                  </div>
                </div>

                <div className="booking-actions">
                  {booking.status === 'pending' && <>
                    <button className="btn-approve" onClick={() => handleUpdateStatus(booking.id, 'approved')}>✓ Approve</button>
                    <button className="btn-reject" onClick={() => handleUpdateStatus(booking.id, 'rejected')}>✕ Reject</button>
                  </>}
                  {booking.status === 'approved' && <>
                    <button className="btn-complete" onClick={() => handleUpdateStatus(booking.id, 'completed')}>✓ Selesai</button>
                    <button className="btn-photo" onClick={() => setPhotoModal(booking)} style={{background:'#7c3aed', color:'white', border:'none', padding:'6px 12px', borderRadius:6, cursor:'pointer'}}>
                      🖼️ Foto Pickup
                    </button>
                  </>}
                  {booking.status === 'completed' && (
                    <button className="btn-photo" onClick={() => setPhotoModal(booking)} style={{background:'#6b7280', color:'white', border:'none', padding:'6px 12px', borderRadius:6, cursor:'pointer'}}>
                      🖼️ Edit Pickup
                    </button>
                  )}
                  {role === 'admin' && (
                    <button className="btn-delete-booking" onClick={() => handleDelete(booking.id)}>🗑️</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      {/* MODAL PHOTO PICKUP */}
      {photoModal && (
        <PhotoPickupModal
          booking={photoModal}
          onClose={() => setPhotoModal(null)}
          onSuccess={() => { setPhotoModal(null); fetchBookings(); }}
        />
      )}
    </div>
  );
};

// ===== MODAL PHOTO PICKUP =====
const PhotoPickupModal = ({ booking, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    photoPickupDate: booking.photoPickupDate ? new Date(booking.photoPickupDate).toISOString().split('T')[0] : '',
    photoPickupBy: booking.photoPickupBy || '',
    photoPickupNotes: booking.photoPickupNotes || '',
    photoPickupStatus: booking.photoPickupStatus || 'belum_diambil',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.patch(`/bookings/${booking.id}/photo-pickup`, form);
      alert('Info pengambilan foto berhasil disimpan!');
      onSuccess();
    } catch (error) {
      alert('Gagal: ' + (error.response?.data?.message || error.message));
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
        <div className="form-header" style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: 'white', padding: '20px 24px', borderRadius: '12px 12px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: 18 }}>🖼️ Info Pengambilan Foto</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', fontSize: 20, cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ padding: 24 }}>
          <div style={{ background: '#f3f4f6', borderRadius: 8, padding: 12, marginBottom: 20 }}>
            <p style={{ margin: 0, fontWeight: 600 }}>{booking.userName}</p>
            <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 14 }}>{booking.package?.name} — {booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString('id-ID') : '-'}</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Status Pengambilan</label>
              <select
                value={form.photoPickupStatus}
                onChange={e => setForm({ ...form, photoPickupStatus: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14 }}
              >
                <option value="belum_diambil">⏳ Belum Diambil</option>
                <option value="sudah_diambil">✅ Sudah Diambil</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Nama yang Mengambil</label>
              <input
                type="text"
                value={form.photoPickupBy}
                onChange={e => setForm({ ...form, photoPickupBy: e.target.value })}
                placeholder="Nama pengambil foto..."
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, boxSizing: 'border-box' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Tanggal Pengambilan</label>
              <input
                type="date"
                value={form.photoPickupDate}
                onChange={e => setForm({ ...form, photoPickupDate: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, boxSizing: 'border-box' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Catatan</label>
              <textarea
                value={form.photoPickupNotes}
                onChange={e => setForm({ ...form, photoPickupNotes: e.target.value })}
                placeholder="Catatan tambahan pengambilan foto..."
                rows={3}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, boxSizing: 'border-box', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button type="button" onClick={onClose} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid #d1d5db', background: 'white', cursor: 'pointer' }}>Batal</button>
              <button type="submit" disabled={loading} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: 'white', fontWeight: 600, cursor: 'pointer' }}>
                {loading ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;