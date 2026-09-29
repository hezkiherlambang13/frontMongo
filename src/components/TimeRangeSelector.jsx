import React from 'react';

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const MINUTES = ['00', '15', '30', '45'];

// Dropdown jam:menit custom (24 jam) — menggantikan <input type="time"> bawaan browser
// supaya tampilannya konsisten di semua browser/OS dan admin benar-benar full kontrol.
const TimeDropdown = ({ value, onChange, label }) => {
  const [hour, minute] = (value || '00:00').split(':');

  const handleHourChange = (e) => {
    onChange(`${e.target.value}:${minute}`);
  };
  const handleMinuteChange = (e) => {
    onChange(`${hour}:${e.target.value}`);
  };

  return (
    <div className="time-dropdown-field">
      <span className="time-dropdown-label">{label}</span>
      <div className="time-dropdown-row">
        <select value={hour} onChange={handleHourChange} className="time-dropdown-select">
          {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
        </select>
        <span className="time-dropdown-colon">:</span>
        <select value={minute} onChange={handleMinuteChange} className="time-dropdown-select">
          {MINUTES.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
    </div>
  );
};

const TimeRangeSelector = ({ startTime, endTime, onStartChange, onEndChange }) => {
  return (
    <div className="time-range-selector">
      <TimeDropdown value={startTime} onChange={onStartChange} label="Jam Buka" />
      <span className="time-range-sep">—</span>
      <TimeDropdown value={endTime} onChange={onEndChange} label="Jam Tutup" />
    </div>
  );
};

export default TimeRangeSelector;