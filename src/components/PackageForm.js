// src/components/PackageForm.js
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
    isActive: true,
  });
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const BASE_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

  useEffect(() => {
    if (editPackage) {
      setFormData({
        name: editPackage.name || '',
        description: editPackage.description || '',
        price: editPackage.price || '',
        duration: editPackage.duration || '',
        category: editPackage.category || 'portrait',
        // ✅ FIX: features bisa null/undefined dari DB, default ke ['']
        features: editPackage.features?.length > 0 ? editPackage.features : [''],
        availableDays: editPackage.availableDays || [],
        isActive: editPackage.isActive !== undefined ? editPackage.isActive : true,
      });
      // ✅ FIX: images adalah String[] bukan Object[], langsung pakai string
      if (editPackage.images?.length > 0) {
        setPreviewImages(editPackage.images.map(img =>
          img.startsWith('http') ? img : `${BASE_URL}${img}`
        ));
      }
    }
  }, [editPackage]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData(prev => ({ ...prev, features: newFeatures }));
  };

  const addFeature = () => {
    setFormData(prev => ({ ...prev, features: [...prev.features, ''] }));
  };

  const removeFeature = (index) => {
    setFormData(prev => ({ ...prev, features: prev.features.filter((_, i) => i !== index) }));
  };

  const handleDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day],
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setPreviewImages(files.map(file => URL.createObjectURL(file)));
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
    formDataToSend.append('isActive', formData.isActive);
    images.forEach(image => formDataToSend.append('images', image));

    try {
      if (editPackage) {
        // ✅ FIX: editPackage.id bukan editPackage._id
        await packageAPI.update(editPackage.id, formDataToSend);
        alert('Paket berhasil diupdate!');
      } else {
        await packageAPI.create(formDataToSend);
        alert('Paket berhasil dibuat!');
      }
      onSuccess();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || 'Gagal menyimpan paket'));
    } finally {
      setLoading(false);
    }
  };
// pengaturan waktu
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 8; hour <= 17; hour++) {
      times.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < 17) times.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return times;
  };

  return (
    <div className="package-form">
      <div className="form-header">
        <h2>{editPackage ? '✏️ Edit Paket' : ' Tambah Paket Baru'}</h2>
        <button className="btn-close" onClick={onCancel}>✕</button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label>Nama Paket *</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange}
              placeholder="e.g., Wedding Premium Package" required />
          </div>

          <div className="form-group">
            <label>Kategori *</label>
            <select name="category" value={formData.category} onChange={handleChange}>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Harga (Rp) *</label>
            <input type="number" name="price" value={formData.price} onChange={handleChange}
              placeholder="e.g., 500000" required />
          </div>

          <div className="form-group">
            <label>Durasi *</label>
            <input type="text" name="duration" value={formData.duration} onChange={handleChange}
              placeholder="e.g., 2 jam" required />
          </div>
        </div>

        <div className="form-group">
          <label>Deskripsi *</label>
          <textarea name="description" value={formData.description} onChange={handleChange}
            rows="4" placeholder="Deskripsikan paket..." required />
        </div>

        <div className="form-group">
          <label>Fitur</label>
          {formData.features.map((feature, index) => (
            <div key={index} className="feature-input-group">
              <input type="text" value={feature}
                onChange={(e) => handleFeatureChange(index, e.target.value)}
                placeholder="e.g., 10 foto diedit" />
              {formData.features.length > 1 && (
                <button type="button" className="btn-remove-feature" onClick={() => removeFeature(index)}>✕</button>
              )}
            </div>
          ))}
          <button type="button" className="btn-add-feature" onClick={addFeature}>➕ Tambah Fitur</button>
        </div>

        <div className="form-group">
          <label>Hari Tersedia</label>
          <div className="days-selector">
            {DAYS.map(day => (
              <button key={day} type="button"
                className={`day-btn ${formData.availableDays.includes(day) ? 'active' : ''}`}
                onClick={() => handleDayToggle(day)}>
                {day.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Upload Gambar (Maks 5)</label>
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
                <img key={index} src={preview} alt={`Preview ${index + 1}`}
                  style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, margin: 4 }} />
              ))}
            </div>
          )}
        </div>

        <div className="form-group checkbox-group">
          <label>
            <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} />
            <span> Aktif (Tersedia untuk dipesan)</span>
          </label>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={onCancel}>Batal</button>
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Menyimpan...' : (editPackage ? 'Update Paket' : 'Buat Paket')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PackageForm;