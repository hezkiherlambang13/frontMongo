import React, { useEffect, useRef, useId } from 'react';

/**
 * Tombol "Masuk dengan Google" resmi dari Google Identity Services.
 * Tidak butuh library tambahan — script GIS di-load lewat public/index.html.
 *
 * Props:
 * - onCredential(credentialJwt): dipanggil saat user berhasil pilih akun Google
 * - onError(message): dipanggil kalau script gagal load / client id kosong
 * - text: label tombol ('signin_with' | 'continue_with' | dst, default 'signin_with')
 */
const GoogleLoginButton = ({ onCredential, onError, text = 'signin_with' }) => {
  const containerRef = useRef(null);
  const uid = useId();

  useEffect(() => {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

    if (!clientId) {
      onError?.('Google Client ID belum dikonfigurasi di frontend (.env)');
      return;
    }

    let attempts = 0;
    const maxAttempts = 40; // ~10 detik nunggu script GIS ready

    const tryInit = () => {
      attempts += 1;

      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: (response) => {
              if (response?.credential) {
                onCredential(response.credential);
              } else {
                onError?.('Gagal mendapatkan kredensial Google');
              }
            },
            auto_select: false,
          });

          if (containerRef.current) {
            containerRef.current.innerHTML = ''; // hindari duplikasi render saat re-mount
            window.google.accounts.id.renderButton(containerRef.current, {
              type: 'standard',
              theme: 'outline',
              size: 'large',
              text,
              shape: 'pill',
              logo_alignment: 'left',
              width: 320,
            });
          }
        } catch (err) {
          onError?.('Gagal memuat tombol Google: ' + err.message);
        }
        return;
      }

      if (attempts < maxAttempts) {
        setTimeout(tryInit, 250);
      } else {
        onError?.('Script Google gagal dimuat. Cek koneksi internet atau ad-blocker.');
      }
    };

    tryInit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="google-btn-wrapper">
      <div ref={containerRef} id={`google-btn-${uid}`} />
    </div>
  );
};

export default GoogleLoginButton;