// src/components/RescheduleModal.js
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './RescheduleModal.css';

const DAY_NAMES_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_NAMES_ID = {
  Sunday: 'Minggu', Monday: 'Senin', Tuesday: 'Selasa',
  Wednesday: 'Rabu', Thursday: 'Kamis', Friday: 'Jumat', Saturday: 'Sabtu',
};

const getDayNameEN = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr + 'T00:00:00');
  return DAY_NAMES_EN[d.getDay()];
};

const timeStringToMinutes = (str) => {
  if (!str || !/^\d{1,2}:\d{2}$/.test(str)) return null;
  const [h, m] = str.split(':').map(Number);
  return h * 60 + m;
};

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

const RescheduleModal = ({ booking, onSuccess, onCancel }) => {
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [bookedTimes, setBookedTimes] = useState([]);
  const [fetchingTimes, setFetchingTimes] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const pkg = booking.package || {};
  const durationMinutes = parseDurationToMinutes(pkg.duration);
  const hasRestrictedDays = pkg.availableDays && pkg.availableDays.length > 0;
  const operatingStart = pkg.operatingStartTime || '08:00';
  const operatingEnd = pkg.operatingEndTime || '17:00';

  const selectedDayEN = getDayNameEN(newDate);
  const selectedDayID = selectedDayEN ? DAY_NAMES_ID[selectedDayEN] : null;
  const isDayAllowed = !hasRestrictedDays || !selectedDayEN || pkg.availableDays.includes(selectedDayEN);

  const generateTimeSlots = () => {
    const slots = [];
    const startMinutes = timeStringToMinutes(operatingStart);
    const endMinutes = timeStringToMinutes(operatingEnd);
    if (startMinutes === null || endMinutes === null || startMinutes >= endMinutes) return slots;
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
    return dateStr === new Date().toISOString().split('T')[0];
  };

  const isTimePast = (time) => {
    if (!isToday(newDate)) return false;
    return time <= getNowTime();
  };

  const isTimeBooked = (time) => bookedTimes.includes(time);
  const isTimeDisabled = (time) => isTimePast(time) || isTimeBooked(time);

  // Fetch booked times saat tanggal berubah
  useEffect(() => {
    if (!newDate || !isDayAllowed || !pkg.id) {
      setBookedTimes([]);
      return;
    }
    setFetchingTimes(true);
    setNewTime('');
    api.get(`/bookings/booked-times?packageId=${pkg.id}&date=${newDate}&excludeBookingId=${booking.id}`)
      .then(res => setBookedTimes(res.data.data || []))
      .catch(() => setBookedTimes([]))
      .finally(() => setFetchingTimes(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newDate, isDayAllowed]);

  const findNearestAllowedDate = () => {
    if (!hasRestrictedDays) return null;
    const start = new Date();
    for (let i = 1; i <= 30; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const dayName = DAY_NAMES_EN[d.getDay()];
      if (pkg.availableDays.includes(dayName)) {
        return d.toISOString().split('T')[0];
      }
    }
    return null;
  };

  const handleSubmit = async () => {
    if (!newDate) return alert('Pilih tanggal baru terlebih dahulu');
    if (!isDayAllowed) return alert(`Paket hanya tersedia: ${pkg.availableDays?.map(d => DAY_NAMES_ID[d] || d).join(', ')}`);
    if (!newTime) return alert('Pilih jam baru terlebih dahulu');
    if (isTimeDisabled(newTime)) return alert('Jam ini tidak tersedia');

    // Cek apakah tanggal & jam sama dengan sebelumnya
    const currentDate = booking.bookingDate
      ? new Date(booking.bookingDate).toISOString().split('T')[0]
      : '';
    if (newDate === currentDate && newTime === booking.bookingTime) {
      return alert('Tanggal dan jam baru sama dengan yang sekarang. Pilih jadwal berbeda.');
    }

    setLoading(true);
    try {
      await api.patch(`/bookings/${booking.id}/reschedule`, {
        bookingDate: new Date(newDate).toISOString(),
        bookingTime: newTime,
      });
      setSuccess(true);
    } catch (error) {
      alert('Gagal reschedule: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const allSlots = generateTimeSlots();
  const currentDate = booking.bookingDate
    ? new Date(booking.bookingDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : '-';

  // ── Tampilan sukses ────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="reschedule-modal">
        <div className="rm-header">
          <h2>✅ Reschedule Berhasil</h2>
        </div>
        <div className="rm-success-body">
          <div className="rm-success-icon">🗓️</div>
          <p>Jadwal booking <strong>{pkg.name}</strong> berhasil diubah ke:</p>
          <div className="rm-new-schedule">
            <span>📅 {new Date(newDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <span>🕐 {newTime}</span>
          </div>
          <p className="rm-note">Kalender manager & studio akan diperbarui otomatis.</p>
          <button className="rm-btn-primary" onClick={onSuccess}>Selesai</button>
        </div>
      </div>
    );
  }

  // ── Form reschedule ────────────────────────────────────────────────────────
  return (
    <div className="reschedule-modal">
      <div className="rm-header">
        <h2>🗓️ Ubah Jadwal Booking</h2>
        <button className="rm-btn-close" onClick={onCancel}>✕</button>
      </div>

      {/* Info jadwal lama */}
      <div className="rm-current-schedule">
        <span className="rm-current-label">Jadwal sekarang:</span>
        <span className="rm-current-value">
          {currentDate} pukul <strong>{booking.bookingTime || '-'}</strong>
        </span>
      </div>

      <div className="rm-divider">
        <span>Ganti ke jadwal baru</span>
      </div>

      {/* Pilih tanggal */}
      <div className="rm-form-group">
        <label>Tanggal Baru *</label>

        {hasRestrictedDays && (
          <div className="rm-days-banner">
            <span>Tersedia: </span>
            {pkg.availableDays.map(day => (
              <span key={day} className="rm-day-chip">{DAY_NAMES_ID[day] || day}</span>
            ))}
            <button
              type="button"
              className="rm-btn-jump"
              onClick={() => {
                const nearest = findNearestAllowedDate();
                if (nearest) setNewDate(nearest);
              }}
            >
              Tanggal terdekat →
            </button>
          </div>
        )}

        <div className="rm-date-row">
          <input
            type="date"
            value={newDate}
            onChange={e => setNewDate(e.target.value)}
            min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
          />
          {selectedDayID && (
            <span className={`rm-day-badge ${isDayAllowed ? 'ok' : 'blocked'}`}>
              {selectedDayID}
            </span>
          )}
        </div>

        {newDate && !isDayAllowed && (
          <p className="rm-helper-error">{selectedDayID} bukan hari operasional paket ini.</p>
        )}
      </div>

      {/* Pilih jam */}
      <div className="rm-form-group">
        <label>Jam Baru *</label>

        {!newDate ? (
          <p className="rm-helper-warn">Pilih tanggal dulu</p>
        ) : !isDayAllowed ? (
          <p className="rm-helper-error">Pilih hari yang sesuai</p>
        ) : fetchingTimes ? (
          <p className="rm-helper-info">Mengecek ketersediaan jam...</p>
        ) : allSlots.length === 0 ? (
          <p className="rm-helper-error">Tidak ada slot tersedia untuk durasi {pkg.duration}</p>
        ) : (
          <div className="rm-time-slots">
            {allSlots.map(time => {
              const past = isTimePast(time);
              const booked = isTimeBooked(time);
              const disabled = past || booked;
              const selected = newTime === time;
              return (
                <button
                  key={time}
                  type="button"
                  className={`rm-slot ${selected ? 'selected' : ''} ${disabled ? 'disabled' : 'available'}`}
                  onClick={() => !disabled && setNewTime(time)}
                  disabled={disabled}
                  title={booked ? 'Sudah dipesan' : past ? 'Waktu sudah lewat' : ''}
                >
                  {time}
                  {booked && <span className="rm-slot-label">penuh</span>}
                  {past && !booked && <span className="rm-slot-label">lewat</span>}
                </button>
              );
            })}
          </div>
        )}

        {newTime && !isTimeDisabled(newTime) && (
          <div className="rm-selected-time">
            Jam dipilih: <strong>{newTime}</strong>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="rm-actions">
        <button className="rm-btn-cancel" onClick={onCancel} disabled={loading}>
          Batal
        </button>
        <button
          className="rm-btn-primary"
          onClick={handleSubmit}
          disabled={loading || !newDate || !newTime || !isDayAllowed || isTimeDisabled(newTime)}
        >
          {loading ? 'Menyimpan...' : '✓ Konfirmasi Jadwal Baru'}
        </button>
      </div>
    </div>
  );
};

export default RescheduleModal;