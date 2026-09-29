import React, { useEffect } from 'react';

const FeatureModal = ({ packageName, features, onClose }) => {
  // Tutup modal dengan tombol Escape (aksesibilitas ringan)
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className="feature-modal-overlay" onClick={onClose}>
      <div className="feature-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="feature-modal-header">
          <h3>Semua Fitur — {packageName}</h3>
          <button className="feature-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="feature-modal-body">
          {features.map((feature, index) => (
            <div key={index} className="feature-modal-item">
              <span className="feature-modal-check">✓</span>
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeatureModal;