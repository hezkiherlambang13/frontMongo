// src/components/PackageList.js
import React from 'react';
import './PackageList.css';

const BASE_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

const PackageList = ({ packages, onEdit, onDelete, isAdmin }) => {
  if (!packages || packages.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📦</div>
        <h3>Belum ada paket</h3>
        <p>Mulai dengan membuat paket pertama</p>
      </div>
    );
  }

  return (
    <div className="package-grid">
      {packages.map(pkg => (
        // ✅ FIX: pkg.id bukan pkg._id (PostgreSQL)
        <div key={pkg.id} className="package-card">
          <div className="package-image">
            {pkg.images && pkg.images.length > 0 ? (
              // ✅ FIX: images adalah String[] bukan Object[], jadi langsung pkg.images[0]
              <img
                src={`${BASE_URL}${pkg.images[0]}`}
                alt={pkg.name}
              />
            ) : (
              <div className="no-image">📸</div>
            )}
            {pkg.category && <div className="package-badge">{pkg.category}</div>}
          </div>

          <div className="package-content">
            <h3>{pkg.name}</h3>
            <p className="package-description">{pkg.description}</p>

            {pkg.features && pkg.features.length > 0 && (
              <div className="package-features">
                {pkg.features.slice(0, 3).map((feature, index) => (
                  <div key={index} className="feature-tag">✓ {feature}</div>
                ))}
              </div>
            )}

            <div className="package-details">
              {pkg.duration && (
                <div className="detail-item">
                  <span className="detail-icon">⏱️</span>
                  <span>{pkg.duration}</span>
                </div>
              )}
              {pkg.availableDays && (
                <div className="detail-item">
                  <span className="detail-icon">📅</span>
                  <span>{pkg.availableDays.length} hari tersedia</span>
                </div>
              )}
            </div>

            <div className="package-footer">
              <div className="package-price">
                Rp {pkg.price?.toLocaleString('id-ID')}
              </div>
              <div className={`package-status ${pkg.isActive ? 'active' : 'inactive'}`}>
                {pkg.isActive ? '✓ Aktif' : '✕ Nonaktif'}
              </div>
            </div>

            {isAdmin && (
              <div className="package-actions">
                <button className="btn-edit" onClick={() => onEdit(pkg)}>
                  ✏️ Edit
                </button>
                {/* ✅ FIX: onDelete(pkg.id) bukan onDelete(pkg._id) */}
                <button className="btn-delete" onClick={() => onDelete(pkg.id)}>
                  🗑️ Hapus
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PackageList;