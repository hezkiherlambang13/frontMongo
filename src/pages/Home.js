// src/pages/Home.js
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import api from "../services/api";
import "./Home.css";

const BASE_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

// ===== SLIDESHOW COMPONENT =====
const HeroSlideshow = ({ backgrounds }) => {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (backgrounds.length <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrent(prev => (prev + 1) % backgrounds.length);
    }, 5000);
    return () => clearInterval(timerRef.current);
  }, [backgrounds.length]);

  if (backgrounds.length === 0) return null;

  const bg = backgrounds[current];

  return (
    <div className="hero-slideshow">
      {backgrounds.map((b, i) => (
        <div key={b.id} className={`slide ${i === current ? 'active' : ''}`}>
          {b.type === 'video' ? (
            <video
              src={`${BASE_URL}${b.url}`}
              autoPlay muted loop playsInline
              className="slide-media"
            />
          ) : (
            <img src={`${BASE_URL}${b.url}`} alt={`Background ${i + 1}`} className="slide-media" />
          )}
        </div>
      ))}
      <div className="slide-overlay" />
      {backgrounds.length > 1 && (
        <div className="slide-dots">
          {backgrounds.map((_, i) => (
            <button
              key={i}
              className={`dot ${i === current ? 'active' : ''}`}
              onClick={() => setCurrent(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function Home() {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [backgrounds, setBackgrounds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch packages
    api.get("/packages")
      .then((res) => {
        const data = res.data?.data ?? res.data;
        setPackages(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error("GAGAL AMBIL PACKAGES:", err))
      .finally(() => setLoading(false));

    // Fetch active backgrounds untuk slideshow
    api.get("/login-backgrounds")
      .then((res) => {
        const data = res.data?.data ?? res.data;
        const active = Array.isArray(data) ? data.filter(b => b.isActive) : [];
        setBackgrounds(active);
      })
      .catch(() => setBackgrounds([]));
  }, []);

  return (
    <div className="home-page">
      {/* Navbar */}
      <nav className="home-navbar">
        <div className="navbar-brand">
          <h2>📸 Digibox Studio</h2>
        </div>
        <div className="navbar-actions">
          <button className="btn-login" onClick={() => navigate("/login")}>
            Login
          </button>
        </div>
      </nav>

      {/* Hero dengan Slideshow */}
      <div className="home-hero">
        <HeroSlideshow backgrounds={backgrounds} />
        <div className="hero-content">
          <h1>Selamat Datang di <span>Digibox Studio</span></h1>
          <p>Abadikan momen berharga Anda bersama fotografer profesional kami.</p>
          {/* <button className="btn-hero-cta" onClick={() => navigate("/login")}>
            Pesan Sekarang
          </button> */}
        </div>
      </div>



      {/* Maps */}
      <div className="home-maps">
        <h2 className="section-title">📍 Lokasi Kami</h2>
        <div className="maps-wrapper">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.527!2d124.8464083!3d1.4618297!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x328774c5abcae595%3A0xe69d12f0d40dc55b!2sDigibox%20Studio!5e0!3m2!1sid!2sid!4v1"
            width="100%"
            height="380"
            style={{ border: 0, borderRadius: '16px' }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Lokasi Digibox Studio"
          />
        </div>
      </div>

      {/* Packages */}
      <div className="home-content">
        ...

        <h2 className="section-title">📦 Paket Tersedia</h2>
        {loading ? (
          <div className="loading">Loading packages...</div>
        ) : packages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>Belum ada paket tersedia</h3>
            <p>Cek kembali nanti</p>
          </div>
        ) : (
          <div className="package-grid">
            {packages.map((pkg) => (
              <div key={pkg.id} className="package-card-customer">
                <div className="package-image">
                  {pkg.images && pkg.images.length > 0 ? (
                    <img src={`${BASE_URL}${pkg.images[0]}`} alt={pkg.name} />
                  ) : (
                    <div className="no-image">📸</div>
                  )}
                  {pkg.category && <div className="package-badge">{pkg.category}</div>}
                </div>

                <div className="package-content">
                  <h3>{pkg.name}</h3>
                  {pkg.description && <p className="package-description">{pkg.description}</p>}

                  {pkg.features && pkg.features.length > 0 && (
                    <div className="package-features">
                      {pkg.features.slice(0, 4).map((feature, index) => (
                        <div key={index} className="feature-item">
                          <span className="check-icon">✓</span>
                          {feature}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="package-info">
                    {pkg.duration && (
                      <div className="info-item">
                        <span className="icon">⏱️</span>
                        <span>{pkg.duration}</span>
                      </div>
                    )}
                    {pkg.availableDays && (
                      <div className="info-item">
                        <span className="icon">📅</span>
                        <span>{pkg.availableDays.length} hari tersedia</span>
                      </div>
                    )}
                  </div>

                  <div className="package-footer">
                    <div className="package-price">
                      <span className="price-label">Mulai dari</span>
                      <span className="price-value">Rp {pkg.price?.toLocaleString('id-ID') ?? "-"}</span>
                    </div>
                    <button className="btn-book-now" onClick={() => navigate("/login")}>
                      Pesan Sekarang
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="home-footer">
        <p>© 2025 Digibox Studio. All rights reserved.</p>
      </footer>
    </div>
  );
}