// src/pages/Login.js
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import GoogleLoginButton from "../components/GoogleLoginButton";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();

  const [mode, setMode] = useState("login");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    name: "", email: "", password: "", confirmPassword: "", phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [backgrounds, setBackgrounds] = useState([]);
  const [currentBg, setCurrentBg] = useState(0);

  useEffect(() => {
    api.get("/login-backgrounds")
      .then((res) => {
        const data = res.data?.data ?? res.data;
        if (Array.isArray(data) && data.length > 0) {
          setBackgrounds(data.filter((bg) => bg.isActive));
        }
      })
      .catch(() => setBackgrounds([]));
  }, []);

  useEffect(() => {
    if (backgrounds.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % backgrounds.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [backgrounds]);

  const redirectByRole = (user) => {
    if (user.role === "admin") navigate("/admin/dashboard");
    else if (user.role === "manager") navigate("/manager/dashboard");
    else {
      sessionStorage.removeItem("pendingPackage");
      navigate("/customer/dashboard");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const user = await login(loginForm.email, loginForm.password);
      redirectByRole(user);
    } catch (err) {
      setError(err.response?.data?.message ?? "Email atau password salah.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    if (registerForm.password !== registerForm.confirmPassword) {
      setError("Password dan konfirmasi password tidak sama.");
      setLoading(false);
      return;
    }
    if (registerForm.password.length < 6) {
      setError("Password minimal 6 karakter.");
      setLoading(false);
      return;
    }
    try {
      await api.post("/auth/register", {
        name: registerForm.name,
        email: registerForm.email,
        password: registerForm.password,
        phone: registerForm.phone,
        role: "user",
      });
      setSuccess("Registrasi berhasil! Silakan login dengan akun baru kamu.");
      setRegisterForm({ name: "", email: "", password: "", confirmPassword: "", phone: "" });
      setTimeout(() => { setMode("login"); setSuccess(""); }, 2000);
    } catch (err) {
      setError(err.response?.data?.message ?? "Registrasi gagal. Email mungkin sudah terdaftar.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: handler Google Sign-In (dipakai baik di tab Masuk maupun Daftar)
  const handleGoogleCredential = async (credential) => {
    setGoogleLoading(true);
    setError("");
    setSuccess("");
    try {
      const user = await loginWithGoogle(credential);
      redirectByRole(user);
    } catch (err) {
      setError(err.response?.data?.message ?? "Gagal masuk dengan Google. Coba lagi.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = (msg) => {
    setError(msg);
  };

  const activeBg = backgrounds[currentBg];
  const bgStyle = activeBg && activeBg.type !== "video"
    ? { backgroundImage: `url(${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000'}${activeBg.url})` }
    : {};

  const switchMode = (newMode) => { setMode(newMode); setError(""); setSuccess(""); };

  return (
    <div className="login-page" style={bgStyle}>
      {activeBg?.type === "video" && (
        <video key={activeBg.url} className="login-video-bg" autoPlay muted loop playsInline>
          <source
            src={`${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000'}${activeBg.url}`}
            type="video/mp4"
          />
        </video>
      )}

      {!activeBg && (
        <div className="particles">
          {[...Array(15)].map((_, i) => (
            <div key={i} className={`particle particle-${i + 1}`}></div>
          ))}
        </div>
      )}

      <div className="login-overlay"></div>

      {backgrounds.length > 1 && (
        <div className="bg-dots">
          {backgrounds.map((_, i) => (
            <button key={i} className={`bg-dot ${i === currentBg ? "active" : ""}`} onClick={() => setCurrentBg(i)} />
          ))}
        </div>
      )}

      <div className="login-container">
        <div className={`login-card ${mode === "register" ? "login-card-register" : ""}`}>
          <div className="login-logo">
            <span>📸</span>
            <h1>Digibox Studio</h1>
          </div>

          <div className="auth-tabs">
            <button className={`auth-tab ${mode === "login" ? "active" : ""}`} onClick={() => switchMode("login")}>
              Masuk
            </button>
            <button className={`auth-tab ${mode === "register" ? "active" : ""}`} onClick={() => switchMode("register")}>
              Daftar
            </button>
          </div>

          {error && <div className="auth-alert auth-alert-error"><span>⚠️</span> {error}</div>}
          {success && <div className="auth-alert auth-alert-success"><span>✅</span> {success}</div>}

          {/* FORM LOGIN */}
          {mode === "login" && (
            <>
              <form onSubmit={handleLogin} className="auth-form">
                <p className="form-subtitle">
                  Masuk sebagai <strong>Customer</strong>, <strong>Admin</strong>, atau <strong>Manager</strong>
                </p>

                <div className="form-group">
                  <label>Email</label>
                  <div className="input-wrapper">
                    <span className="input-icon"></span>
                    <input type="email" placeholder="email@contoh.com"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      required />
                  </div>
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <div className="input-wrapper">
                    <span className="input-icon"></span>
                    <input type={showPassword ? "text" : "password"} placeholder="Masukkan password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      required />
                    <button type="button" className="btn-show-password" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>

                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? <span className="btn-loading"><span className="spinner-small"></span> Memproses...</span> : "Masuk"}
                </button>
              </form>

              {/* ✅ NEW: divider + Google */}
              <div className="auth-divider"><span>atau</span></div>
              <div className="google-section">
                {googleLoading ? (
                  <div className="google-loading">
                    <span className="spinner-small spinner-dark"></span> Memproses login Google...
                  </div>
                ) : (
                  <GoogleLoginButton onCredential={handleGoogleCredential} onError={handleGoogleError} text="signin_with" />
                )}
              </div>
            </>
          )}

          {/* FORM REGISTER */}
          {mode === "register" && (
            <>
              <form onSubmit={handleRegister} className="auth-form">
                <p className="form-subtitle">
                  Daftar akun <strong>Customer</strong>. Akun Admin & Manager dibuat oleh sistem.
                </p>

                <div className="form-group">
                  <label>Nama Lengkap</label>
                  <div className="input-wrapper">
                    <span className="input-icon"> </span>
                    <input type="text" placeholder="Nama lengkap kamu"
                      value={registerForm.name}
                      onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                      required />
                  </div>
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <div className="input-wrapper">
                    <span className="input-icon"></span>
                    <input type="email" placeholder="email@contoh.com"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                      required />
                  </div>
                </div>

                <div className="form-group">
                  <label>No. Telepon</label>
                  <div className="input-wrapper">
                    <span className="input-icon"></span>
                    <input type="tel" placeholder="08xxxxxxxxxx"
                      value={registerForm.phone}
                      onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })} />
                  </div>
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <div className="input-wrapper">
                    <span className="input-icon"></span>
                    <input type={showPassword ? "text" : "password"} placeholder="Minimal 6 karakter"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      required />
                    <button type="button" className="btn-show-password" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>Konfirmasi Password</label>
                  <div className="input-wrapper">
                    <span className="input-icon"></span>
                    <input type={showPassword ? "text" : "password"} placeholder="Ulangi password"
                      value={registerForm.confirmPassword}
                      onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                      required />
                  </div>
                </div>

                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? <span className="btn-loading"><span className="spinner-small"></span> Mendaftarkan...</span> : "Daftar Sekarang"}
                </button>
              </form>

              {/* ✅ NEW: divider + Google (register = auto masuk/daftar sekaligus) */}
              <div className="auth-divider"><span>atau daftar cepat dengan</span></div>
              <div className="google-section">
                {googleLoading ? (
                  <div className="google-loading">
                    <span className="spinner-small spinner-dark"></span> Memproses login Google...
                  </div>
                ) : (
                  <GoogleLoginButton onCredential={handleGoogleCredential} onError={handleGoogleError} text="signup_with" />
                )}
              </div>
            </>
          )}

          <div className="login-footer">
            <button className="btn-back-home" onClick={() => navigate("/")}>← Kembali ke Beranda</button>
          </div>
        </div>
      </div>
    </div>
  );
}