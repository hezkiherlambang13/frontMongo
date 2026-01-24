import React, { useState, useEffect } from 'react';
import { packageAPI } from '../services/api';
import './PackageForm.css';

const CATEGORIES = ['wedding', 'portrait', 'graduation', 'family', 'product', 'event'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const PackageForm = ({ package: editPackage, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    category: 'portrait',
    features: [''],
    availableDays: [],
    availableTimeStart: '08:00',
    availableTimeEnd: '17:00',
    isActive: true
  });
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editPackage) {
      setFormData({
        name: editPackage.name || '',
        description: editPackage.description || '',
        price: editPackage.price || '',
        duration: editPackage.duration || '',
        category: editPackage.category || 'portrait',
        features: editPackage.features || [''],
        availableDays: editPackage.availableDays || [],
        availableTimeStart: editPackage.availableTimeStart || '08:00',
        availableTimeEnd: editPackage.availableTimeEnd || '17:00',
        isActive: editPackage.isActive !== undefined ? editPackage.isActive : true
      });
      if (editPackage.images) {
        setPreviewImages(editPackage.images.map(img => img.url));
      }
    }
  }, [editPackage]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData(prev => ({ ...prev, features: newFeatures }));
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const removeFeature = (index) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, features: newFeatures }));
  };

  const handleDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day]
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    
    const previews = files.map(file => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('price', formData.price);
    formDataToSend.append('duration', formData.duration);
    formDataToSend.append('category', formData.category);
    formDataToSend.append('features', JSON.stringify(formData.features.filter(f => f.trim())));
    formDataToSend.append('availableDays', JSON.stringify(formData.availableDays));
    formDataToSend.append('availableTimeStart', formData.availableTimeStart);
    formDataToSend.append('availableTimeEnd', formData.availableTimeEnd);
    formDataToSend.append('isActive', formData.isActive);

    images.forEach(image => {
      formDataToSend.append('images', image);
    });

    try {
      if (editPackage) {
        await packageAPI.update(editPackage._id, formDataToSend);
        alert('Package updated successfully!');
      } else {
        await packageAPI.create(formDataToSend);
        alert('Package created successfully!');
      }
      onSuccess();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || 'Failed to save package'));
    } finally {
      setLoading(false);
    }
  };

  // Generate time options
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 8; hour <= 17; hour++) {
      times.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < 17) {
        times.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }
    return times;
  };

  return (
    <div className="package-form">
      <div className="form-header">
        <h2>{editPackage ? '✏️ Edit Package' : '➕ Add New Package'}</h2>
        <button className="btn-close" onClick={onCancel}>✕</button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label>Package Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Wedding Premium Package"
              required
            />
          </div>

          <div className="form-group">
            <label>Category *</label>
            <select name="category" value={formData.category} onChange={handleChange}>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Price (Rp) *</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="e.g., 500000"
              required
            />
          </div>

          <div className="form-group">
            <label>Duration *</label>
            <input
              type="text"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              placeholder="e.g., 2 hours"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            placeholder="Describe your package..."
            required
          />
        </div>

        <div className="form-group">
          <label>Features</label>
          {formData.features.map((feature, index) => (
            <div key={index} className="feature-input-group">
              <input
                type="text"
                value={feature}
                onChange={(e) => handleFeatureChange(index, e.target.value)}
                placeholder="e.g., 10 edited photos"
              />
              {formData.features.length > 1 && (
                <button 
                  type="button" 
                  className="btn-remove-feature"
                  onClick={() => removeFeature(index)}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button type="button" className="btn-add-feature" onClick={addFeature}>
            ➕ Add Feature
          </button>
        </div>

        <div className="form-group">
          <label>Available Days</label>
          <div className="days-selector">
            {DAYS.map(day => (
              <button
                key={day}
                type="button"
                className={`day-btn ${formData.availableDays.includes(day) ? 'active' : ''}`}
                onClick={() => handleDayToggle(day)}
              >
                {day.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>Available Time Start</label>
            <select 
              name="availableTimeStart" 
              value={formData.availableTimeStart}
              onChange={handleChange}
            >
              {generateTimeOptions().map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Available Time End</label>
            <select 
              name="availableTimeEnd" 
              value={formData.availableTimeEnd}
              onChange={handleChange}
            >
              {generateTimeOptions().map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Upload Images (Max 5)</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="file-input"
          />
          {previewImages.length > 0 && (
            <div className="image-previews">
              {previewImages.map((preview, index) => (
                <img key={index} src={preview} alt={`Preview ${index + 1}`} />
              ))}
            </div>
          )}
        </div>

        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
            />
            <span>Active (Available for booking)</span>
          </label>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Saving...' : (editPackage ? 'Update Package' : 'Create Package')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PackageForm;