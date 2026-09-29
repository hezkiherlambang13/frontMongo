// src/pages/Home.js
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import api from "../services/api";
import "./Home.css";

const BASE_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

const DEFAULT_CMS = {
  heroPreTitle: "MINIMALIST SPACE",
  heroTitle: "Studio Kreatif Untuk",
  heroTitleItalic: "Momen Anda",
  heroWaLink: "https://wa.me/6285291569777",
  aboutPreTitle: "OUR PHILOSOPHY",
  aboutTitle: "Ruang Tanpa Batas untuk Imajinasi Anda.",
  aboutDesc1: "Kami menyediakan ruang yang fleksibel dan terkurasi, dirancang khusus untuk mendukung sesi foto profesional.",
  aboutDesc2: "Dengan pencahayaan alami yang melimpah dan desain interior yang bersih, setiap sudut studio kami adalah kanvas kosong.",
  servicesPreTitle: "OUR SERVICES",
  servicesTitle: "Fasilitas & Layanan",
  service1Icon: "📷", service1Title: "Studio Hire", service1Desc: "Penyewaan ruang studio dengan kontrol cahaya penuh dan berbagai pilihan backdrop premium.",
  service2Icon: "💡", service2Title: "Equipment Rental", service2Desc: "Akses ke koleksi pencahayaan terbaru, kamera high-end, dan berbagai modifier.",
  service3Icon: "✨", service3Title: "Post-Production", service3Desc: "Layanan retouching profesional dan color grading untuk hasil karya terbaik.",
  ctaTitle: "Pesan Sesi Anda Sekarang",
  ctaDesc: "Jadwalkan konsultasi atau langsung pesan ruang studio kami.",
  ctaWaLink: "https://wa.me/6285291569777",
  footerInstagram: "",
  footerWaLink: "https://wa.me/6285291569777",
};

// ===== HERO SLIDESHOW =====
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

  if (backgrounds.length === 0) {
    return <div className="hero-slideshow hero-empty" />;
  }

  return (
    <div className="hero-slideshow">
      {backgrounds.map((b, i) => (
        <div key={b.id} className={`slide ${i === current ? 'active' : ''}`}>
          {b.type === 'video' ? (
            <video src={`${BASE_URL}${b.url}`} autoPlay muted loop playsInline className="slide-media" />
          ) : (
            <img src={`${BASE_URL}${b.url}`} alt={`Slide ${i + 1}`} className="slide-media" />
          )}
        </div>
      ))}
      <div className="slide-overlay" />
      {backgrounds.length > 1 && (
        <div className="slide-dots">
          {backgrounds.map((_, i) => (
            <button key={i} className={`dot ${i === current ? 'active' : ''}`} onClick={() => setCurrent(i)} />
          ))}
        </div>
      )}
    </div>
  );
};

// ===== WA ICON =====
const WaIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{flexShrink:0}}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.55no8 4.122 1.532 5.849L.057 23.535a.75.75 0 00.908.908l5.686-1.475A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.967 0-3.809-.524-5.398-1.44l-.387-.225-4.017 1.043 1.063-3.903-.249-.401A9.953 9.953 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
  </svg>
);

// ===== MAIN =====
export default function Home() {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [backgrounds, setBackgrounds] = useState([]);
  const [cms, setCms] = useState(DEFAULT_CMS);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    api.get("/packages")
      .then(res => {
        const data = res.data?.data ?? res.data;
        setPackages(Array.isArray(data) ? data.filter(p => p.isActive !== false) : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    api.get("/login-backgrounds")
      .then(res => {
        const data = res.data?.data ?? res.data;
        setBackgrounds(Array.isArray(data) ? data.filter(b => b.isActive) : []);
      })
      .catch(() => setBackgrounds([]));

    api.get("/cms/settings")
      .then(res => {
        const data = res.data?.data ?? res.data;
        if (data && typeof data === 'object') setCms(prev => ({ ...prev, ...data }));
      })
      .catch(() => {});
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  const services = [
    { icon: cms.service1Icon, title: cms.service1Title, desc: cms.service1Desc },
    { icon: cms.service2Icon, title: cms.service2Title, desc: cms.service2Desc },
    { icon: cms.service3Icon, title: cms.service3Title, desc: cms.service3Desc },
  ];

  return (
    <div className="home-page">

      {/* NAVBAR */}
      <nav className="home-navbar">
        <div className="navbar-brand" onClick={() => scrollTo('hero')}>
           Digibox Studio
        </div>
        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <button onClick={() => scrollTo('portfolio')}>GALLERY</button>
          <button onClick={() => scrollTo('services')}>SERVICES</button>
          <button onClick={() => scrollTo('about')}>ABOUT</button>
          <button className="nav-login" onClick={() => navigate("/login")}>Login</button>
        </div>
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </nav>

      {/* HERO */}
      <section id="hero" className="home-hero">
        <HeroSlideshow backgrounds={backgrounds} />
        <div className="hero-content">
          <p className="hero-pretitle">{cms.heroPreTitle}</p>
          <h1 className="hero-title">
            {cms.heroTitle}
            <br /><em>{cms.heroTitleItalic}</em>
          </h1>
          <div className="cta-group">
            <button className="btn-primary" onClick={() => navigate("/login")}>Booking Sekarang</button>
            <a className="btn-secondary" href={cms.heroWaLink} target="_blank" rel="noopener noreferrer">
              <WaIcon /> Hubungi Kami
            </a>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="home-about">
        <div className="about-left">
          <p className="pre-title">{cms.aboutPreTitle}</p>
          <h2 className="about-title">{cms.aboutTitle}</h2>
          <p className="about-desc">{cms.aboutDesc1}</p>
          <p className="about-desc">{cms.aboutDesc2}</p>
        </div>
        <div className="about-right">
          <div className="about-grid">
            <div className="about-img-box box1"><span>📸</span></div>
            <div className="about-img-box box2"><span>🎬</span></div>
          </div>
        </div>
      </section>

      {/* PORTFOLIO */}
      <section id="portfolio" className="home-portfolio">
        <p className="pre-title">THE PORTFOLIO</p>
        <h2 className="section-h2">Karya Terpilih</h2>
        <div className="portfolio-grid">
          <div className="port-item port-large"><div className="port-placeholder"><span>🖼️</span></div></div>
          <div className="port-item"><div className="port-placeholder"><span>📷</span></div></div>
          <div className="port-item"><div className="port-placeholder"><span>🎞️</span></div></div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="home-services">
        <p className="pre-title center">{cms.servicesPreTitle}</p>
        <h2 className="section-h2 center">{cms.servicesTitle}</h2>
        <div className="services-grid">
          {services.map((s, i) => (
            <div key={i} className="service-card">
              <div className="svc-icon">{s.icon}</div>
              <h3 className="svc-title">{s.title}</h3>
              <p className="svc-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PACKAGES */}
      <section id="packages" className="home-packages">
        <p className="pre-title">OUR PACKAGES</p>
        <h2 className="section-h2">Paket Tersedia</h2>
        {loading ? (
          <p className="pkg-state">Memuat paket...</p>
        ) : packages.length === 0 ? (
          <div className="pkg-state"><span>📦</span><p>Belum ada paket tersedia</p></div>
        ) : (
          <div className="packages-grid">
            {packages.map(pkg => (
              <div key={pkg.id} className="pkg-card">
                <div className="pkg-img">
                  {pkg.images?.length > 0
                    ? <img src={`${BASE_URL}${pkg.images[0]}`} alt={pkg.name} />
                    : <div className="pkg-no-img"><span>📸</span></div>
                  }
                  {pkg.category && <span className="pkg-badge">{pkg.category}</span>}
                </div>
                <div className="pkg-body">
                  <h3 className="pkg-name">{pkg.name}</h3>
                  {pkg.description && <p className="pkg-desc">{pkg.description}</p>}
                  {pkg.features?.length > 0 && (
                    <ul className="pkg-features">
                      {pkg.features.slice(0, 4).map((f, i) => (
                        <li key={i}><span>✓</span>{f}</li>
                      ))}
                    </ul>
                  )}
                  <div className="pkg-footer">
                    <div className="pkg-price">
                      <span className="price-label">Mulai dari</span>
                      <span className="price-val">Rp {pkg.price?.toLocaleString('id-ID') ?? '-'}</span>
                    </div>
                    <button className="btn-pesan" onClick={() => navigate("/login")}>Pesan Sekarang</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* MAPS */}
      <section className="home-maps">
        <p className="pre-title">FIND US</p>
        <h2 className="section-h2">Lokasi Kami</h2>
        <div className="maps-wrap">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.527!2d124.8464083!3d1.4618297!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x328774c5abcae595%3A0xe69d12f0d40dc55b!2sDigibox%20Studio!5e0!3m2!1sid!2sid!4v1"
            width="100%" height="380"
            style={{ border: 0, borderRadius: 16 }}
            allowFullScreen loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Lokasi Digibox Studio"
          />
        </div>
      </section>

      {/* CTA */}
      <section className="home-cta">
        <div className="cta-inner">
          <h2 className="cta-title">{cms.ctaTitle}</h2>
          <p className="cta-desc">{cms.ctaDesc}</p>
          <div className="cta-group">
            <button className="btn-primary" onClick={() => navigate("/login")}>Booking Online</button>
            <a className="btn-secondary" href={cms.ctaWaLink} target="_blank" rel="noopener noreferrer">
              <WaIcon /> Hubungi Kami
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="home-footer">
        <div className="footer-inner">
          <span className="footer-brand">📸 Digibox Studio</span>
          <div className="footer-links">
            {cms.footerInstagram && <a href={cms.footerInstagram} target="_blank" rel="noopener noreferrer">Instagram</a>}
            <a href={cms.footerWaLink} target="_blank" rel="noopener noreferrer">WhatsApp</a>
            <button onClick={() => scrollTo('packages')}>Paket</button>
            <button onClick={() => navigate("/login")}>Login</button>
          </div>
        </div>
        <p className="footer-copy">© 2025 Digibox Studio. All rights reserved.</p>
      </footer>

    </div>
  );
}