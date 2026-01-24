import React from 'react';
import './PackageList.css';

const PackageList = ({ packages, onEdit, onDelete, isAdmin }) => {
  if (packages.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📦</div>
        <h3>No packages found</h3>
        <p>Start by creating your first package</p>
      </div>
    );
  }

  return (
    <div className="package-grid">
      {packages.map(pkg => (
        <div key={pkg._id} className="package-card">
          <div className="package-image">
            {pkg.images && pkg.images.length > 0 ? (
              <img 
                src={`http://localhost:5000${pkg.images[0].url}`} 
                alt={pkg.name}
              />
            ) : (
              <div className="no-image">📸</div>
            )}
            <div className="package-badge">{pkg.category}</div>
          </div>

          <div className="package-content">
            <h3>{pkg.name}</h3>
            <p className="package-description">{pkg.description}</p>

            <div className="package-features">
              {pkg.features && pkg.features.slice(0, 3).map((feature, index) => (
                <div key={index} className="feature-tag">
                  ✓ {feature}
                </div>
              ))}
            </div>

            <div className="package-details">
              <div className="detail-item">
                <span className="detail-icon">⏱️</span>
                <span>{pkg.duration}</span>
              </div>
              <div className="detail-item">
                <span className="detail-icon">📅</span>
                <span>{pkg.availableDays?.length || 0} days</span>
              </div>
              <div className="detail-item">
                <span className="detail-icon">🕒</span>
                <span>{pkg.availableTimeStart} - {pkg.availableTimeEnd}</span>
              </div>
            </div>

            <div className="package-footer">
              <div className="package-price">
                Rp {pkg.price?.toLocaleString()}
              </div>
              <div className={`package-status ${pkg.isActive ? 'active' : 'inactive'}`}>
                {pkg.isActive ? '✓ Active' : '✕ Inactive'}
              </div>
            </div>

            {isAdmin && (
              <div className="package-actions">
                <button 
                  className="btn-edit"
                  onClick={() => onEdit(pkg)}
                >
                  ✏️ Edit
                </button>
                <button 
                  className="btn-delete"
                  onClick={() => onDelete(pkg._id)}
                >
                  🗑️ Delete
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