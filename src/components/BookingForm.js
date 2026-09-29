// import React, { useState, useEffect } from 'react';
// import { bookingAPI } from '../services/api';
// import api from '../services/api';
// import './BookingForm.css';

// const parseDurationToMinutes = (duration) => {
//   if (!duration) return 60;
//   let total = 0;
//   const jamMatch = duration.match(/(\d+)\s*(jam|hour)/i);
//   const menitMatch = duration.match(/(\d+)\s*(menit|min)/i);
//   if (jamMatch) total += parseInt(jamMatch[1]) * 60;
//   if (menitMatch) total += parseInt(menitMatch[1]);
//   if (total === 0) {
//     const numMatch = duration.match(/(\d+)/);
//     if (numMatch) total = parseInt(numMatch[1]);
//   }
//   return total || 60;
// };

// // ✅ NEW: konversi "HH:MM" jadi total menit sejak 00:00
// const timeStringToMinutes = (str) => {
//   if (!str || !/^\d{1,2}:\d{2}$/.test(str)) return null;
//   const [h, m] = str.split(':').map(Number);
//   return h * 60 + m;
// };

// const DAY_NAMES_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
// const DAY_NAMES_ID = { Sunday: 'Minggu', Monday: 'Senin', Tuesday: 'Selasa', Wednesday: 'Rabu', Thursday: 'Kamis', Friday: 'Jumat', Saturday: 'Sabtu' };

// const getDayNameEN = (dateStr) => {
//   if (!dateStr) return null;
//   const d = new Date(dateStr + 'T00:00:00');
//   return DAY_NAMES_EN[d.getDay()];
// };

// const BookingForm = ({ package: pkg, studioId, studioName, onSuccess, onCancel }) => {
//   const [formData, setFormData] = useState({
//     bookingDate: '',
//     bookingTime: '',
//     userName: '',
//     userPhone: '',
//     userEmail: '',
//     notes: '',
//   });

//   const [bookedTimes, setBookedTimes] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [fetchingTimes, setFetchingTimes] = useState(false);
//   const [bookingResult, setBookingResult] = useState(null);

//   const durationMinutes = parseDurationToMinutes(pkg.duration);
//   const hasRestrictedDays = pkg.availableDays && pkg.availableDays.length > 0;

//   // ✅ NEW: ambil jam operasional dari paket, fallback ke 08:00–17:00 kalau tidak diset
//   const operatingStart = pkg.operatingStartTime || '08:00';
//   const operatingEnd = pkg.operatingEndTime || '17:00';

//   const selectedDayEN = getDayNameEN(formData.bookingDate);
//   const selectedDayID = selectedDayEN ? DAY_NAMES_ID[selectedDayEN] : null;
//   const isDayAllowed = !hasRestrictedDays || !selectedDayEN || pkg.availableDays.includes(selectedDayEN);

//   // ✅ CHANGED: generate slot berdasarkan jam operasional paket, bukan hardcode 8-17
//   const generateTimeSlots = () => {
//     const slots = [];
//     const startMinutes = timeStringToMinutes(operatingStart);
//     const endMinutes = timeStringToMinutes(operatingEnd);

//     if (startMinutes === null || endMinutes === null || startMinutes >= endMinutes) {
//       return slots;
//     }

//     let current = startMinutes;
//     while (current + durationMinutes <= endMinutes) {
//       const h = Math.floor(current / 60);
//       const m = current % 60;
//       slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
//       current += durationMinutes;
//     }
//     return slots;
//   };

//   const getNowTime = () => {
//     const now = new Date();
//     return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
//   };

//   const isToday = (dateStr) => {
//     if (!dateStr) return false;
//     const today = new Date().toISOString().split('T')[0];
//     return dateStr === today;
//   };

//   const isTimePast = (time) => {
//     if (!isToday(formData.bookingDate)) return false;
//     return time <= getNowTime();
//   };

//   const isTimeBooked = (time) => bookedTimes.includes(time);
//   const isTimeDisabled = (time) => isTimePast(time) || isTimeBooked(time);

//   useEffect(() => {
//     if (!formData.bookingDate || !studioId || !isDayAllowed) {
//       setBookedTimes([]);
//       return;
//     }
//     setFetchingTimes(true);
//     setFormData(prev => ({ ...prev, bookingTime: '' }));
//     api.get(`/bookings/booked-times?packageId=${pkg.id}&date=${formData.bookingDate}&studioId=${studioId}`)
//       .then(res => setBookedTimes(res.data.data || []))
//       .catch(() => setBookedTimes([]))
//       .finally(() => setFetchingTimes(false));
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [formData.bookingDate, pkg.id, studioId, isDayAllowed]);

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const findNearestAllowedDate = () => {
//     if (!hasRestrictedDays) return null;
//     const start = new Date();
//     for (let i = 0; i < 30; i++) {
//       const d = new Date(start);
//       d.setDate(start.getDate() + i);
//       const dayName = DAY_NAMES_EN[d.getDay()];
//       if (pkg.availableDays.includes(dayName)) {
//         return d.toISOString().split('T')[0];
//       }
//     }
//     return null;
//   };

//   const jumpToNearestDate = () => {
//     const nearest = findNearestAllowedDate();
//     if (nearest) setFormData(prev => ({ ...prev, bookingDate: nearest, bookingTime: '' }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!studioId) { alert('Studio tidak terdeteksi. Silakan tutup form dan coba lagi.'); return; }
//     if (!formData.bookingDate) { alert('Tanggal wajib dipilih'); return; }
//     if (!isDayAllowed) { alert(`Paket ini hanya tersedia pada hari: ${pkg.availableDays.map(d => DAY_NAMES_ID[d] || d).join(', ')}`); return; }
//     if (!formData.bookingTime) { alert('Jam wajib dipilih'); return; }
//     if (isTimeDisabled(formData.bookingTime)) { alert('Jam ini tidak tersedia'); return; }

//     setLoading(true);
//     try {
//       const res = await bookingAPI.create({
//         packageId: pkg.id,
//         studioId,
//         bookingDate: new Date(formData.bookingDate).toISOString(),
//         bookingTime: formData.bookingTime,
//         userName: formData.userName,
//         userPhone: formData.userPhone,
//         userEmail: formData.userEmail,
//         notes: formData.notes,
//       });

//       const createdBooking = res.data ? res.data.data : null;
//       setBookingResult({ booking: createdBooking });

//       if (pkg.lynkUrl) {
//         window.open(pkg.lynkUrl, '_blank', 'noopener,noreferrer');
//       }
//     } catch (error) {
//       const msg = error.response && error.response.data && error.response.data.message
//         ? error.response.data.message
//         : 'Gagal membuat booking';
//       alert('Error: ' + msg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (bookingResult) {
//     return (
//       <div className="booking-form">
//         <div className="form-header">
//           <h2>Booking Berhasil Dibuat</h2>
//           <button className="btn-close" onClick={onSuccess}>x</button>
//         </div>
//         <div className="booking-success-body">
//           <div className="success-icon">🎉</div>
//           <h3>Terima kasih, {formData.userName}!</h3>
//           <p className="success-desc">
//             Booking untuk <strong>{pkg.name}</strong> di <strong>{studioName}</strong> pada{' '}
//             <strong>
//               {new Date(formData.bookingDate).toLocaleDateString('id-ID', {
//                 weekday: 'long',
//                 year: 'numeric',
//                 month: 'long',
//                 day: 'numeric',
//               })}
//             </strong>{' '}
//             pukul <strong>{formData.bookingTime}</strong> telah tercatat.
//           </p>

//           {pkg.lynkUrl ? (
//             <div className="payment-redirect-box">
//               <p>Untuk menyelesaikan pemesanan, silakan lakukan pembayaran melalui link berikut:</p>
              
//                 href={pkg.lynkUrl}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="btn-go-payment"
//               <a>
//                 Lanjutkan ke Pembayaran
//               </a>
//               <p className="payment-hint">
//                 Jika halaman pembayaran tidak otomatis terbuka, klik tombol di atas. Setelah pembayaran, tim kami akan mengonfirmasi booking kamu.
//               </p>
//             </div>
//           ) : (
//             <p className="payment-hint">
//               Paket ini belum memiliki link pembayaran online. Silakan tunggu konfirmasi admin, atau hubungi kami melalui WhatsApp.
//             </p>
//           )}

//           <button className="btn-submit" style={{ marginTop: 20, width: '100%' }} onClick={onSuccess}>
//             Selesai
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const allSlots = generateTimeSlots();

//   return (
//     <div className="booking-form">
//       <div className="form-header">
//         <h2>Pesan: {pkg.name}</h2>
//         <button className="btn-close" onClick={onCancel}>x</button>
//       </div>

//       <div className="package-summary">
//         <div className="summary-item">
//           <span className="summary-label">Studio:</span>
//           <span className="summary-value">🏢 {studioName}</span>
//         </div>
//         <div className="summary-item">
//           <span className="summary-label">Kategori:</span>
//           <span className="summary-value">{pkg.categoryRef?.name || pkg.category}</span>
//         </div>
//         <div className="summary-item">
//           <span className="summary-label">Durasi:</span>
//           <span className="summary-value">{pkg.duration}</span>
//         </div>
//         {/* ✅ NEW: tampilkan jam operasional sebagai info */}
//         <div className="summary-item">
//           <span className="summary-label">Jam Operasional:</span>
//           <span className="summary-value">{operatingStart} — {operatingEnd}</span>
//         </div>
//         <div className="summary-item">
//           <span className="summary-label">Harga:</span>
//           <span className="summary-value price">Rp {pkg.price ? pkg.price.toLocaleString('id-ID') : ''}</span>
//         </div>
//       </div>

//       <form onSubmit={handleSubmit}>

//         <div className="form-group">
//           <label>Tanggal & Hari *</label>

//           {hasRestrictedDays && (
//             <div className="available-days-banner">
//               <span className="available-days-label">Paket ini hanya tersedia pada:</span>
//               <div className="available-days-chips">
//                 {pkg.availableDays.map(day => (
//                   <span key={day} className="day-chip">{DAY_NAMES_ID[day] || day}</span>
//                 ))}
//               </div>
//               <button type="button" className="btn-jump-date" onClick={jumpToNearestDate}>
//                 Lompat ke tanggal terdekat yang tersedia
//               </button>
//             </div>
//           )}

//           <div className="date-input-row">
//             <input
//               type="date"
//               name="bookingDate"
//               value={formData.bookingDate}
//               onChange={handleChange}
//               min={new Date().toISOString().split('T')[0]}
//               required
//             />
//             {selectedDayID && (
//               <span className={`selected-day-badge ${isDayAllowed ? 'ok' : 'blocked'}`}>
//                 {selectedDayID}
//               </span>
//             )}
//           </div>

//           {formData.bookingDate && !isDayAllowed && (
//             <p className="helper-text" style={{ color: '#dc2626', fontWeight: 600 }}>
//               {selectedDayID} bukan hari operasional paket ini. Silakan pilih tanggal lain sesuai hari yang tersedia di atas.
//             </p>
//           )}
//         </div>

//         <div className="form-group">
//           <label>
//             Jam *{' '}
//             <small style={{ color: '#888', fontWeight: 'normal' }}>
//               ({operatingStart}–{operatingEnd}, jeda {durationMinutes < 60
//                 ? `${durationMinutes} menit`
//                 : `${Math.floor(durationMinutes / 60)} jam${durationMinutes % 60 ? ` ${durationMinutes % 60} menit` : ''}`}
//               {' '}per sesi)
//             </small>
//           </label>

//           {!formData.bookingDate ? (
//             <p className="helper-text" style={{ color: '#f59e0b' }}>Pilih tanggal dulu untuk melihat jam tersedia</p>
//           ) : !isDayAllowed ? (
//             <p className="helper-text" style={{ color: '#dc2626' }}>Pilih tanggal dengan hari yang sesuai terlebih dahulu</p>
//           ) : fetchingTimes ? (
//             <p className="helper-text">Mengecek ketersediaan jam...</p>
//           ) : allSlots.length === 0 ? (
//             <p className="helper-text" style={{ color: '#f87171' }}>
//               Tidak ada slot tersedia. Jam operasional paket ini mungkin terlalu singkat untuk durasi sesi ({pkg.duration}).
//             </p>
//           ) : (
//             <div>
//               <div className="time-slots">
//                 {allSlots.map(time => {
//                   const past = isTimePast(time);
//                   const booked = isTimeBooked(time);
//                   const disabled = past || booked;
//                   const selected = formData.bookingTime === time;

//                   return (
//                     <button
//                       key={time}
//                       type="button"
//                       className={`time-slot ${selected ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
//                       onClick={() => !disabled && setFormData({ ...formData, bookingTime: time })}
//                       disabled={disabled}
//                       title={booked ? 'Sudah dipesan' : past ? 'Waktu sudah lewat' : ''}
//                       style={{
//                         opacity: disabled ? 0.7 : 1,
//                         cursor: disabled ? 'not-allowed' : 'pointer',
//                         textDecoration: booked ? 'line-through' : 'none',
//                         backgroundColor: booked ? '#fff1f2' : past ? '#f8fafc' : selected ? '' : '#f0fdf4',
//                         borderColor: booked ? '#fca5a5' : past ? '#cbd5e1' : selected ? '' : '#86efac',
//                         color: booked ? '#991b1b' : past ? '#94a3b8' : selected ? '' : '#166534',
//                       }}
//                     >
//                       {time}
//                       {booked && <span style={{ fontSize: '10px', display: 'block', color: '#ef4444' }}>penuh</span>}
//                       {past && !booked && <span style={{ fontSize: '10px', display: 'block', color: '#9ca3af' }}>lewat</span>}
//                     </button>
//                   );
//                 })}
//               </div>
//               <div className="time-legend" style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 13 }}>
//                 <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
//                   <span style={{ width: 14, height: 14, background: '#f0fdf4', border: '2px solid #86efac', borderRadius: 3, display: 'inline-block' }}></span> Tersedia
//                 </span>
//                 <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
//                   <span style={{ width: 14, height: 14, background: '#fff1f2', border: '2px solid #fca5a5', borderRadius: 3, display: 'inline-block' }}></span> Penuh
//                 </span>
//                 <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
//                   <span style={{ width: 14, height: 14, background: '#f8fafc', border: '2px solid #cbd5e1', borderRadius: 3, display: 'inline-block' }}></span> Lewat
//                 </span>
//               </div>
//             </div>
//           )}
//         </div>

//         <div className="form-group">
//           <label>Nama Lengkap *</label>
//           <input
//             type="text"
//             name="userName"
//             value={formData.userName}
//             onChange={handleChange}
//             placeholder="Masukkan nama lengkap"
//             required
//           />
//         </div>

//         <div className="form-group">
//           <label>No. Telepon *</label>
//           <input
//             type="tel"
//             name="userPhone"
//             value={formData.userPhone}
//             onChange={handleChange}
//             placeholder="08xxxxxxxxxx"
//             required
//           />
//         </div>

//         <div className="form-group">
//           <label>Email *</label>
//           <input
//             type="email"
//             name="userEmail"
//             value={formData.userEmail}
//             onChange={handleChange}
//             placeholder="email@contoh.com"
//             required
//           />
//         </div>

//         <div className="form-group">
//           <label>Catatan Tambahan</label>
//           <textarea
//             name="notes"
//             value={formData.notes}
//             onChange={handleChange}
//             rows="3"
//             placeholder="Permintaan khusus atau catatan..."
//           />
//         </div>

//         <div className="form-actions">
//           <button type="button" className="btn-cancel" onClick={onCancel}>Batal</button>
//           <button
//             type="submit"
//             className="btn-submit"
//             disabled={loading || !formData.bookingTime || !isDayAllowed}
//           >
//             {loading ? 'Processing...' : 'Konfirmasi Booking'}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default BookingForm;

import React, { useState, useEffect } from 'react';
import { bookingAPI } from '../services/api';
import api from '../services/api';
import './BookingForm.css';

const parseDurationToMinutes = (duration) => {
  if (!duration) return 60;
  let total = 0;
  const jamMatch = duration.match(/(\d+)\s*(jam|hour)/i);
  const menitMatch = duration.match(/(\d+)\s*(menit|min)/i);
  if (jamMatch) total += parseInt(jamMatch[1]) * 60;
  if (menitMatch) total += parseInt(menitMatch[1]);
  if (total === 0) {
    const numMatch = duration.match(/(\d+)/);
    if (numMatch) total = parseInt(numMatch[1]);
  }
  return total || 60;
};

const timeStringToMinutes = (str) => {
  if (!str || !/^\d{1,2}:\d{2}$/.test(str)) return null;
  const [h, m] = str.split(':').map(Number);
  return h * 60 + m;
};

const DAY_NAMES_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_NAMES_ID = { Sunday: 'Minggu', Monday: 'Senin', Tuesday: 'Selasa', Wednesday: 'Rabu', Thursday: 'Kamis', Friday: 'Jumat', Saturday: 'Sabtu' };

const getDayNameEN = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr + 'T00:00:00');
  return DAY_NAMES_EN[d.getDay()];
};

const BookingForm = ({ package: pkg, studioId, studioName, onSuccess, onCancel }) => {
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
  const [bookingResult, setBookingResult] = useState(null);

  const durationMinutes = parseDurationToMinutes(pkg.duration);
  const hasRestrictedDays = pkg.availableDays && pkg.availableDays.length > 0;

  const operatingStart = pkg.operatingStartTime || '08:00';
  const operatingEnd = pkg.operatingEndTime || '17:00';

  const selectedDayEN = getDayNameEN(formData.bookingDate);
  const selectedDayID = selectedDayEN ? DAY_NAMES_ID[selectedDayEN] : null;
  const isDayAllowed = !hasRestrictedDays || !selectedDayEN || pkg.availableDays.includes(selectedDayEN);

  const generateTimeSlots = () => {
    const slots = [];
    const startMinutes = timeStringToMinutes(operatingStart);
    const endMinutes = timeStringToMinutes(operatingEnd);

    if (startMinutes === null || endMinutes === null || startMinutes >= endMinutes) {
      return slots;
    }

    let current = startMinutes;
    while (current + durationMinutes <= endMinutes) {
      const h = Math.floor(current / 60);
      const m = current % 60;
      slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
      current += durationMinutes;
    }
    return slots;
  };

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

  useEffect(() => {
    if (!formData.bookingDate || !studioId || !isDayAllowed) {
      setBookedTimes([]);
      return;
    }
    setFetchingTimes(true);
    setFormData(prev => ({ ...prev, bookingTime: '' }));
    api.get(`/bookings/booked-times?packageId=${pkg.id}&date=${formData.bookingDate}&studioId=${studioId}`)
      .then(res => setBookedTimes(res.data.data || []))
      .catch(() => setBookedTimes([]))
      .finally(() => setFetchingTimes(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.bookingDate, pkg.id, studioId, isDayAllowed]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const findNearestAllowedDate = () => {
    if (!hasRestrictedDays) return null;
    const start = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const dayName = DAY_NAMES_EN[d.getDay()];
      if (pkg.availableDays.includes(dayName)) {
        return d.toISOString().split('T')[0];
      }
    }
    return null;
  };

  const jumpToNearestDate = () => {
    const nearest = findNearestAllowedDate();
    if (nearest) setFormData(prev => ({ ...prev, bookingDate: nearest, bookingTime: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!studioId) { alert('Studio tidak terdeteksi. Silakan tutup form dan coba lagi.'); return; }
    if (!formData.bookingDate) { alert('Tanggal wajib dipilih'); return; }
    if (!isDayAllowed) { alert(`Paket ini hanya tersedia pada hari: ${pkg.availableDays.map(d => DAY_NAMES_ID[d] || d).join(', ')}`); return; }
    if (!formData.bookingTime) { alert('Jam wajib dipilih'); return; }
    if (isTimeDisabled(formData.bookingTime)) { alert('Jam ini tidak tersedia'); return; }

    setLoading(true);
    try {
      const res = await bookingAPI.create({
        packageId: pkg.id,
        studioId,
        bookingDate: new Date(formData.bookingDate).toISOString(),
        bookingTime: formData.bookingTime,
        userName: formData.userName,
        userPhone: formData.userPhone,
        userEmail: formData.userEmail,
        notes: formData.notes,
      });

      const createdBooking = res.data ? res.data.data : null;
      setBookingResult({ booking: createdBooking });

      if (pkg.lynkUrl) {
        window.open(pkg.lynkUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      const msg = error.response && error.response.data && error.response.data.message
        ? error.response.data.message
        : 'Gagal membuat booking';
      alert('Error: ' + msg);
    } finally {
      setLoading(false);
    }
  };

  if (bookingResult) {
    return (
      <div className="booking-form">
        <div className="form-header">
          <h2>Booking Berhasil Dibuat</h2>
          <button className="btn-close" onClick={onSuccess}>x</button>
        </div>
        <div className="booking-success-body">
          <div className="success-icon">🎉</div>
          <h3>Terima kasih, {formData.userName}!</h3>
          <p className="success-desc">
            Booking untuk <strong>{pkg.name}</strong> di <strong>{studioName}</strong> pada{' '}
            <strong>
              {new Date(formData.bookingDate).toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </strong>{' '}
            pukul <strong>{formData.bookingTime}</strong> telah tercatat.
          </p>

          {pkg.lynkUrl ? (
            <div className="payment-redirect-box">
              <p>Untuk menyelesaikan pemesanan, silakan lakukan pembayaran melalui link berikut:</p>
              
                href={pkg.lynkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-go-payment"
              <a>
                Lanjutkan ke Pembayaran
              </a>
              <p className="payment-hint">
                Jika halaman pembayaran tidak otomatis terbuka, klik tombol di atas. Setelah pembayaran, tim kami akan mengonfirmasi booking kamu.
              </p>
            </div>
          ) : (
            <p className="payment-hint">
              Paket ini belum memiliki link pembayaran online. Silakan tunggu konfirmasi admin, atau hubungi kami melalui WhatsApp.
            </p>
          )}

          <button className="btn-submit" style={{ marginTop: 20, width: '100%' }} onClick={onSuccess}>
            Selesai
          </button>
        </div>
      </div>
    );
  }

  const allSlots = generateTimeSlots();

  // ✅ NEW: label yang ditampilkan di tiap opsi dropdown, termasuk keterangan status
  const getSlotLabel = (time) => {
    if (isTimeBooked(time)) return `${time} — Penuh`;
    if (isTimePast(time)) return `${time} — Sudah lewat`;
    return time;
  };

  return (
    <div className="booking-form">
      <div className="form-header">
        <h2>Pesan: {pkg.name}</h2>
        <button className="btn-close" onClick={onCancel}>x</button>
      </div>

      <div className="package-summary">
        <div className="summary-item">
          <span className="summary-label">Studio:</span>
          <span className="summary-value">🏢 {studioName}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Kategori:</span>
          <span className="summary-value">{pkg.categoryRef?.name || pkg.category}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Durasi:</span>
          <span className="summary-value">{pkg.duration}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Jam Operasional:</span>
          <span className="summary-value">{operatingStart} — {operatingEnd}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Harga:</span>
          <span className="summary-value price">Rp {pkg.price ? pkg.price.toLocaleString('id-ID') : ''}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>

        <div className="form-group">
          <label>Tanggal & Hari *</label>

          {hasRestrictedDays && (
            <div className="available-days-banner">
              <span className="available-days-label">Paket ini hanya tersedia pada:</span>
              <div className="available-days-chips">
                {pkg.availableDays.map(day => (
                  <span key={day} className="day-chip">{DAY_NAMES_ID[day] || day}</span>
                ))}
              </div>
              <button type="button" className="btn-jump-date" onClick={jumpToNearestDate}>
                Lompat ke tanggal terdekat yang tersedia
              </button>
            </div>
          )}

          <div className="date-input-row">
            <input
              type="date"
              name="bookingDate"
              value={formData.bookingDate}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              required
            />
            {selectedDayID && (
              <span className={`selected-day-badge ${isDayAllowed ? 'ok' : 'blocked'}`}>
                {selectedDayID}
              </span>
            )}
          </div>

          {formData.bookingDate && !isDayAllowed && (
            <p className="helper-text" style={{ color: '#dc2626', fontWeight: 600 }}>
              {selectedDayID} bukan hari operasional paket ini. Silakan pilih tanggal lain sesuai hari yang tersedia di atas.
            </p>
          )}
        </div>

        {/* ✅ CHANGED: pemilihan jam sekarang dropdown, bukan grid tombol */}
        <div className="form-group">
          <label>
            Jam *{' '}
            <small style={{ color: '#888', fontWeight: 'normal' }}>
              ({operatingStart}–{operatingEnd}, jeda {durationMinutes < 60
                ? `${durationMinutes} menit`
                : `${Math.floor(durationMinutes / 60)} jam${durationMinutes % 60 ? ` ${durationMinutes % 60} menit` : ''}`}
              {' '}per sesi)
            </small>
          </label>

          {!formData.bookingDate ? (
            <p className="helper-text" style={{ color: '#f59e0b' }}>Pilih tanggal dulu untuk melihat jam tersedia</p>
          ) : !isDayAllowed ? (
            <p className="helper-text" style={{ color: '#dc2626' }}>Pilih tanggal dengan hari yang sesuai terlebih dahulu</p>
          ) : fetchingTimes ? (
            <p className="helper-text">Mengecek ketersediaan jam...</p>
          ) : allSlots.length === 0 ? (
            <p className="helper-text" style={{ color: '#f87171' }}>
              Tidak ada slot tersedia. Jam operasional paket ini mungkin terlalu singkat untuk durasi sesi ({pkg.duration}).
            </p>
          ) : (
            <select
              name="bookingTime"
              value={formData.bookingTime}
              onChange={handleChange}
              className="time-select-dropdown"
              required
            >
              <option value="" disabled>Pilih jam...</option>
              {allSlots.map(time => (
                <option
                  key={time}
                  value={time}
                  disabled={isTimeDisabled(time)}
                >
                  {getSlotLabel(time)}
                </option>
              ))}
            </select>
          )}
        </div>

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
          <button
            type="submit"
            className="btn-submit"
            disabled={loading || !formData.bookingTime || !isDayAllowed}
          >
            {loading ? 'Processing...' : 'Konfirmasi Booking'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;