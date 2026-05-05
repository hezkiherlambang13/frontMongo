// src/components/BookingForm.js
import React, { useState, useEffect } from 'react';
import { bookingAPI } from '../services/api';
import api from '../services/api';
import './BookingForm.css';

// Konversi durasi string ke menit: "15 menit" → 15, "1 jam" → 60, "2 jam 30 menit" → 150
const parseDurationToMinutes = (duration) => {
  if (!duration) return 60;
  let total = 0;
  const jamMatch = duration.match(/(\d+)\s*(jam|hour)/i);
  const menitMatch = duration.match(/(\d+)\s*(menit|min)/i);
  if (jamMatch) total += parseInt(jamMatch[1]) * 60;
  if (menitMatch) total += parseInt(menitMatch[1]);
  // kalau tidak ada match, coba parse angka langsung (misal "30")
  if (total === 0) {
    const numMatch = duration.match(/(\d+)/);
    if (numMatch) total = parseInt(numMatch[1]);
  }
  return total || 60;
};

const BookingForm = ({ package: pkg, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    bookingDate: '',
    bookingTime: '',
    userName: '',
    userPhone: '',
    userEmail: '',
    notes: '',
  });
  const [bookedTimes, setBookedTimes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingTimes, setFetchingTimes] = useState(false);

  // Durasi paket dalam menit
  const durationMinutes = parseDurationToMinutes(pkg.duration);

  // Generate slot waktu berdasarkan durasi paket
  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 8;
    const endHour = 17;
    const startMinutes = startHour * 60;
    const endMinutes = endHour * 60;

    let current = startMinutes;
    while (current + durationMinutes <= endMinutes) {
      const h = Math.floor(current / 60);
      const m = current % 60;
      slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
      current += durationMinutes;
    }
    return slots;
  };

  // Jam sekarang dalam format "HH:MM"
  const getNowTime = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  };

  const isToday = (dateStr) => {
    if (!dateStr) return false;
    const today = new Date().toISOString().split('T')[0];
    return dateStr === today;
  };

  const isTimePast = (time) => {
    if (!isToday(formData.bookingDate)) return false;
    return time <= getNowTime();
  };

  const isTimeBooked = (time) => bookedTimes.includes(time);

  const isTimeDisabled = (time) => isTimePast(time) || isTimeBooked(time);

  // Fetch jam yang sudah dipesan saat tanggal berubah
  useEffect(() => {
    if (!formData.bookingDate) {
      setBookedTimes([]);
      return;
    }
    setFetchingTimes(true);
    setFormData(prev => ({ ...prev, bookingTime: '' })); // reset jam saat tanggal berubah
    api.get(`/bookings/booked-times?packageId=${pkg.id}&date=${formData.bookingDate}`)
      .then(res => setBookedTimes(res.data.data || []))
      .catch(() => setBookedTimes([]))
      .finally(() => setFetchingTimes(false));
  }, [formData.bookingDate, pkg.id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.bookingDate) { alert('Tanggal wajib dipilih'); return; }
    if (!formData.bookingTime) { alert('Jam wajib dipilih'); return; }
    if (isTimeDisabled(formData.bookingTime)) { alert('Jam ini tidak tersedia'); return; }

    setLoading(true);
    try {
      await bookingAPI.create({
        packageId: pkg.id,
        bookingDate: new Date(formData.bookingDate).toISOString(),
        bookingTime: formData.bookingTime,
        userName: formData.userName,
        userPhone: formData.userPhone,
        userEmail: formData.userEmail,
        notes: formData.notes,
      });
      onSuccess();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || 'Gagal membuat booking'));
    } finally {
      setLoading(false);
    }
  };

  const allSlots = generateTimeSlots();

  return (
    <div className="booking-form">
      <div className="form-header">
        <h2>📅 Pesan: {pkg.name}</h2>
        <button className="btn-close" onClick={onCancel}>✕</button>
      </div>

      <div className="package-summary">
        <div className="summary-item">
          <span className="summary-label">Kategori:</span>
          <span className="summary-value">{pkg.category}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Durasi:</span>
          <span className="summary-value">{pkg.duration}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Harga:</span>
          <span className="summary-value price">Rp {pkg.price?.toLocaleString('id-ID')}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* TANGGAL */}
        <div className="form-group">
          <label>Tanggal *</label>
          <input
            type="date"
            name="bookingDate"
            value={formData.bookingDate}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            required
          />
          {pkg.availableDays?.length > 0 && (
            <p className="helper-text">📅 Hari tersedia: {pkg.availableDays.join(', ')}</p>
          )}
        </div>

        {/* JAM */}
        <div className="form-group">
          <label>Jam * <small style={{ color: '#888', fontWeight: 'normal' }}>
            (jeda {durationMinutes < 60
              ? `${durationMinutes} menit`
              : `${Math.floor(durationMinutes / 60)} jam${durationMinutes % 60 ? ` ${durationMinutes % 60} menit` : ''}`}
             per sesi)
          </small></label>

          {!formData.bookingDate ? (
            <p className="helper-text" style={{ color: '#f59e0b' }}>⚠️ Pilih tanggal dulu untuk melihat jam tersedia</p>
          ) : fetchingTimes ? (
            <p className="helper-text">⏳ Mengecek ketersediaan jam...</p>
          ) : allSlots.length === 0 ? (
            <p className="helper-text" style={{ color: '#f87171' }}>Tidak ada slot tersedia</p>
          ) : (
            <>
              <div className="time-slots">
                {allSlots.map(time => {
                  const past = isTimePast(time);
                  const booked = isTimeBooked(time);
                  const disabled = past || booked;
                  const selected = formData.bookingTime === time;

                  return (
                    <button
                      key={time}
                      type="button"
                      className={`time-slot ${selected ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
                      onClick={() => !disabled && setFormData({ ...formData, bookingTime: time })}
                      disabled={disabled}
                      title={booked ? 'Sudah dipesan' : past ? 'Waktu sudah lewat' : ''}
                      style={{
                        opacity: disabled ? 0.7 : 1,
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        textDecoration: booked ? 'line-through' : 'none',
                        backgroundColor: booked ? '#fff1f2' : past ? '#f8fafc' : selected ? '' : '#f0fdf4',
                        borderColor: booked ? '#fca5a5' : past ? '#cbd5e1' : selected ? '' : '#86efac',
                        color: booked ? '#991b1b' : past ? '#94a3b8' : selected ? '' : '#166534',
                      }}
                    >
                      {time}
                      {booked && <span style={{ fontSize: '10px', display: 'block', color: '#ef4444' }}>penuh</span>}
                      {past && !booked && <span style={{ fontSize: '10px', display: 'block', color: '#9ca3af' }}>lewat</span>}
                    </button>
                  );
                })}
              </div>
              <div className="time-legend" style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 13 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 14, height: 14, background: '#f0fdf4', border: '2px solid #86efac', borderRadius: 3, display: 'inline-block' }}></span> Tersedia
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 14, height: 14, background: '#fff1f2', border: '2px solid #fca5a5', borderRadius: 3, display: 'inline-block' }}></span> Penuh
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 14, height: 14, background: '#f8fafc', border: '2px solid #cbd5e1', borderRadius: 3, display: 'inline-block' }}></span> Lewat
                </span>
              </div>
            </>
          )}
        </div>

        {/* NAMA */}
        <div className="form-group">
          <label>Nama Lengkap *</label>
          <input
            type="text"
            name="userName"
            value={formData.userName}
            onChange={handleChange}
            placeholder="Masukkan nama lengkap"
            required
          />
        </div>

        {/* TELEPON */}
        <div className="form-group">
          <label>No. Telepon *</label>
          <input
            type="tel"
            name="userPhone"
            value={formData.userPhone}
            onChange={handleChange}
            placeholder="08xxxxxxxxxx"
            required
          />
        </div>

        {/* EMAIL */}
        <div className="form-group">
          <label>Email *</label>
          <input
            type="email"
            name="userEmail"
            value={formData.userEmail}
            onChange={handleChange}
            placeholder="email@contoh.com"
            required
          />
        </div>

        {/* CATATAN */}
        <div className="form-group">
          <label>Catatan Tambahan</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            placeholder="Permintaan khusus atau catatan..."
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={onCancel}>Batal</button>
          <button type="submit" className="btn-submit" disabled={loading || !formData.bookingTime}>
            {loading ? 'Processing...' : 'Konfirmasi Booking'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;