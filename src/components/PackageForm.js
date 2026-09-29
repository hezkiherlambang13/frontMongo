// src/components/PackageForm.js
import React, { useState, useEffect } from 'react';
import { packageAPI, studioAPI, categoryAPI } from '../services/api';
import TimeRangeSelector from './TimeRangeSelector';
import './PackageForm.css';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const PackageForm = ({ package: editPackage, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    categoryId: '',
    features: [''],
    availableDays: [],
    isActive: true,
    lynkUrl: '',
    operatingStartTime: '08:00',
    operatingEndTime: '17:00',
  });
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const [studios, setStudios] = useState([]);
  const [studiosLoading, setStudiosLoading] = useState(true);
  const [selectedStudioIds, setSelectedStudioIds] = useState([]);

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // ✅ NEW: state untuk tambah kategori baru langsung dari form ini
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [categoryError, setCategoryError] = useState('');

  const BASE_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

  const loadCategories = async () => {
    setCategoriesLoading(true);
    try {
      const res = await categoryAPI.getAll();
      const cats = res.data?.data ?? [];
      setCategories(cats);
      return cats;
    } catch {
      setCategories([]);
      return [];
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    studioAPI.getAll()
      .then(res => setStudios(res.data?.data ?? []))
      .catch(() => setStudios([]))
      .finally(() => setStudiosLoading(false));

    loadCategories().then(cats => {
      setFormData(prev => prev.categoryId ? prev : { ...prev, categoryId: cats[0]?.id ?? '' });
    });
  }, []);

  useEffect(() => {
    if (editPackage) {
      setFormData({
        name: editPackage.name || '',
        description: editPackage.description || '',
        price: editPackage.price || '',
        duration: editPackage.duration || '',
        categoryId: editPackage.categoryId || editPackage.categoryRef?.id || '',
        features: editPackage.features?.length > 0 ? editPackage.features : [''],
        availableDays: editPackage.availableDays || [],
        isActive: editPackage.isActive !== undefined ? editPackage.isActive : true,
        lynkUrl: editPackage.lynkUrl || '',
        operatingStartTime: editPackage.operatingStartTime || '08:00',
        operatingEndTime: editPackage.operatingEndTime || '17:00',
      });
      if (editPackage.images?.length > 0) {
        setPreviewImages(editPackage.images.map(img =>
          img.startsWith('http') ? img : `${BASE_URL}${img}`
        ));
      }
      if (editPackage.studios?.length > 0) {
        setSelectedStudioIds(editPackage.studios.map(s => s.id));
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

  const handleStudioToggle = (studioId) => {
    setSelectedStudioIds(prev =>
      prev.includes(studioId) ? prev.filter(id => id !== studioId) : [...prev, studioId]
    );
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setPreviewImages(files.map(file => URL.createObjectURL(file)));
  };

  const isValidUrl = (str) => {
    if (!str) return true;
    try {
      const u = new URL(str);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const timeToMinutes = (str) => {
    const [h, m] = str.split(':').map(Number);
    return h * 60 + m;
  };

  // ✅ NEW: buat kategori baru tanpa keluar dari form paket ini
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    setCreatingCategory(true);
    setCategoryError('');
    try {
      const res = await categoryAPI.create(newCategoryName.trim());
      const newCat = res.data?.data;
      const cats = await loadCategories();
      const found = cats.find(c => c.id === newCat.id) || newCat;
      setFormData(prev => ({ ...prev, categoryId: found.id }));
      setNewCategoryName('');
      setShowNewCategoryInput(false);
    } catch (err) {
      setCategoryError(err.response?.data?.message || 'Gagal membuat kategori');
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.categoryId) {
      alert('Pilih kategori untuk paket ini');
      return;
    }
    if (selectedStudioIds.length === 0) {
      alert('Pilih minimal satu studio untuk paket ini');
      return;
    }
    if (formData.lynkUrl && !isValidUrl(formData.lynkUrl)) {
      alert('Link Pembayaran tidak valid. Pastikan diawali dengan https:// atau http://');
      return;
    }
    if (timeToMinutes(formData.operatingStartTime) >= timeToMinutes(formData.operatingEndTime)) {
      alert('Jam buka harus lebih awal dari jam tutup');
      return;
    }

    setLoading(true);

    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('price', formData.price);
    formDataToSend.append('duration', formData.duration);
    formDataToSend.append('categoryId', formData.categoryId);
    formDataToSend.append('features', JSON.stringify(formData.features.filter(f => f.trim())));
    formDataToSend.append('availableDays', JSON.stringify(formData.availableDays));
    formDataToSend.append('isActive', formData.isActive);
    formDataToSend.append('studioIds', JSON.stringify(selectedStudioIds));
    formDataToSend.append('lynkUrl', formData.lynkUrl.trim());
    formDataToSend.append('operatingStartTime', formData.operatingStartTime);
    formDataToSend.append('operatingEndTime', formData.operatingEndTime);
    images.forEach(image => formDataToSend.append('images', image));

    try {
      if (editPackage) {
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

          {/* ✅ CHANGED: kategori dinamis + opsi tambah baru langsung di sini */}
          <div className="form-group">
            <label>Kategori *</label>
            {categoriesLoading ? (
              <p className="form-hint">⏳ Memuat kategori...</p>
            ) : (
              <>
                {!showNewCategoryInput ? (
                  <div className="category-select-row">
                    {categories.length === 0 ? (
                      <p className="form-hint form-hint-error" style={{ margin: 0 }}>
                        ⚠️ Belum ada kategori.
                      </p>
                    ) : (
                      <select name="categoryId" value={formData.categoryId} onChange={handleChange} required>
                        <option value="" disabled>Pilih kategori...</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    )}
                    <button
                      type="button"
                      className="btn-new-category-toggle"
                      onClick={() => setShowNewCategoryInput(true)}
                    >
                      + Baru
                    </button>
                  </div>
                ) : (
                  <div className="new-category-inline">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Nama kategori baru, misal: Prewedding"
                      autoFocus
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleCreateCategory(); } }}
                    />
                    <button
                      type="button"
                      className="btn-save-mini"
                      onClick={handleCreateCategory}
                      disabled={creatingCategory || !newCategoryName.trim()}
                    >
                      {creatingCategory ? '...' : 'Simpan'}
                    </button>
                    <button
                      type="button"
                      className="btn-cancel-mini"
                      onClick={() => { setShowNewCategoryInput(false); setNewCategoryName(''); setCategoryError(''); }}
                    >
                      Batal
                    </button>
                  </div>
                )}
                {categoryError && <p className="form-hint form-hint-error">{categoryError}</p>}
                <p className="form-hint">
                  Kategori juga bisa diganti nama atau dihapus di menu "Kategori" pada sidebar admin.
                </p>
              </>
            )}
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

        {/* ✅ CHANGED: dropdown jam custom, bukan <input type="time"> bawaan browser */}
        <div className="form-group">
          <label>Jam Operasional Booking *</label>
          <TimeRangeSelector
            startTime={formData.operatingStartTime}
            endTime={formData.operatingEndTime}
            onStartChange={(val) => setFormData(prev => ({ ...prev, operatingStartTime: val }))}
            onEndChange={(val) => setFormData(prev => ({ ...prev, operatingEndTime: val }))}
          />
          <p className="form-hint">
            Slot waktu yang ditawarkan ke customer akan dihitung otomatis dalam rentang jam ini, sesuai durasi paket ({formData.duration || '...'}).
          </p>
        </div>

        <div className="form-group">
          <label>Link Pembayaran (Lynk.id / lainnya)</label>
          <input
            type="url"
            name="lynkUrl"
            value={formData.lynkUrl}
            onChange={handleChange}
            placeholder="https://lynk.id/namastudio/produk-ini"
          />
          <p className="form-hint">
            Setelah customer mengonfirmasi booking untuk paket ini, mereka akan diarahkan ke link ini untuk melakukan pembayaran.
            Kosongkan jika paket ini belum punya link pembayaran.
          </p>
        </div>

        <div className="form-group">
          <label>Studio Tersedia *</label>
          {studiosLoading ? (
            <p className="form-hint">⏳ Memuat daftar studio...</p>
          ) : studios.length === 0 ? (
            <p className="form-hint form-hint-error">
              ⚠️ Belum ada studio terdaftar. Buka menu "Studio" di sidebar untuk membuat Studio 1 & 2 terlebih dahulu.
            </p>
          ) : (
            <>
              <div className="studio-checkbox-grid">
                {studios.map(studio => {
                  const checked = selectedStudioIds.includes(studio.id);
                  return (
                    <label
                      key={studio.id}
                      className={`studio-checkbox-card ${checked ? 'checked' : ''} ${!studio.isActive ? 'studio-currently-off' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleStudioToggle(studio.id)}
                      />
                      <span className="studio-checkbox-icon">🏢</span>
                      <span className="studio-checkbox-name">{studio.name}</span>
                      <span className={`studio-checkbox-status ${studio.isActive ? 'on' : 'off'}`}>
                        {studio.isActive ? '● Sedang Buka' : '● Sedang Tutup'}
                      </span>
                    </label>
                  );
                })}
              </div>
              <p className="form-hint">
                Centang studio tempat paket ini bisa dipesan.
              </p>
            </>
          )}
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
          <p className="form-hint">Kosongkan jika paket ini tersedia setiap hari.</p>
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

