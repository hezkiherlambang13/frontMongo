import React, { useState } from 'react';
import { bookingAPI } from '../services/api';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './BookingForm.css';

const BookingForm = ({ package: pkg, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    bookingDate: new Date(),
    bookingTime: pkg.availableTimeStart || '09:00',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDateChange = (date) => {
    setFormData({ ...formData, bookingDate: date });
  };

  const generateTimeSlots = () => {
    const slots = [];
    const start = parseInt(pkg.availableTimeStart?.split(':')[0] || 8);
    const end = parseInt(pkg.availableTimeEnd?.split(':')[0] || 17);
    
    for (let hour = start; hour <= end; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < end) {
        slots.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }
    return slots;
  };

  const isDateAvailable = (date) => {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    return pkg.availableDays?.includes(dayName);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await bookingAPI.create({
        packageId: pkg._id,
        ...formData,
        bookingDate: formData.bookingDate.toISOString()
      });
      onSuccess();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || 'Failed to create booking'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-form">
      <div className="form-header">
        <h2>📅 Book: {pkg.name}</h2>
        <button className="btn-close" onClick={onCancel}>✕</button>
      </div>

      <div className="package-summary">
        <div className="summary-item">
          <span className="summary-label">Category:</span>
          <span className="summary-value">{pkg.category}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Duration:</span>
          <span className="summary-value">{pkg.duration}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Price:</span>
          <span className="summary-value price">Rp {pkg.price?.toLocaleString()}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Select Date *</label>
          <DatePicker
            selected={formData.bookingDate}
            onChange={handleDateChange}
            minDate={new Date()}
            filterDate={isDateAvailable}
            dateFormat="dd/MM/yyyy"
            className="date-picker"
            placeholderText="Choose a date"
            inline
          />
          <p className="helper-text">
            Available days: {pkg.availableDays?.join(', ')}
          </p>
        </div>

        <div className="form-group">
          <label>Select Time *</label>
          <div className="time-slots">
            {generateTimeSlots().map(time => (
              <button
                key={time}
                type="button"
                className={`time-slot ${formData.bookingTime === time ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, bookingTime: time })}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Full Name *</label>
          <input
            type="text"
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            placeholder="Enter your full name"
            required
          />
        </div>

        <div className="form-group">
          <label>Phone Number *</label>
          <input
            type="tel"
            name="customerPhone"
            value={formData.customerPhone}
            onChange={handleChange}
            placeholder="08xxxxxxxxxx"
            required
          />
        </div>

        <div className="form-group">
          <label>Email Address *</label>
          <input
            type="email"
            name="customerEmail"
            value={formData.customerEmail}
            onChange={handleChange}
            placeholder="your@email.com"
            required
          />
        </div>

        <div className="form-group">
          <label>Additional Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="4"
            placeholder="Any special requests or notes..."
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Processing...' : 'Confirm Booking'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;