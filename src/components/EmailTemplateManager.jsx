import React, { useState, useEffect } from 'react';
import { emailTemplateAPI } from '../services/api';

const PLACEHOLDERS = [
  { tag: '{{customerName}}', desc: 'Nama pelanggan' },
  { tag: '{{bookingId}}', desc: 'Nomor booking' },
  { tag: '{{packageName}}', desc: 'Nama paket' },
  { tag: '{{studioName}}', desc: 'Nama studio' },
  { tag: '{{bookingDate}}', desc: 'Tanggal pemotretan' },
  { tag: '{{bookingTime}}', desc: 'Jam pemotretan' },
  { tag: '{{location}}', desc: 'Alamat studio' },
  { tag: '{{totalPrice}}', desc: 'Total harga (tanpa "Rp")' },
  { tag: '{{lynkUrl}}', desc: 'Link pembayaran paket' },
];

const EmailTemplateManager = () => {
  const [form, setForm] = useState({ subject: '', bodyHtml: '', footerHtml: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const fetchTemplate = async () => {
    setLoading(true);
    try {
      const res = await emailTemplateAPI.get();
      const tpl = res.data?.data;
      setForm({ subject: tpl.subject || '', bodyHtml: tpl.bodyHtml || '', footerHtml: tpl.footerHtml || '' });
    } catch (e) {
      setMsg({ type: 'err', text: 'Gagal memuat template email' });
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchTemplate(); }, []);

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 4000);
  };

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await emailTemplateAPI.update(form);
      showMsg('ok', '✅ Template email berhasil disimpan');
    } catch (err) {
      showMsg('err', err.response?.data?.message || 'Gagal menyimpan template');
    } finally { setSaving(false); }
  };

  const handleReset = async () => {
    if (!window.confirm('Kembalikan template ke default? Perubahan yang belum disimpan akan hilang.')) return;
    setSaving(true);
    try {
      await emailTemplateAPI.reset();
      showMsg('ok', 'Template dikembalikan ke default');
      fetchTemplate();
    } catch (err) {
      showMsg('err', 'Gagal reset template');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="loading">Memuat template email...</div>;

  return (
    <div className="email-template-manager">
      <div className="bg-info-banner">
        <span>ℹ️</span>
        <span>Email ini otomatis terkirim ke customer setiap kali booking baru dibuat. Gunakan placeholder di bawah untuk menyisipkan data booking secara otomatis.</span>
      </div>

      {msg.text && (
        <div className={`bg-alert ${msg.type === 'ok' ? 'bg-alert-success' : 'bg-alert-error'}`}>
          {msg.type === 'ok' ? '✅' : '⚠️'} {msg.text}
          <button onClick={() => setMsg({ type: '', text: '' })}>✕</button>
        </div>
      )}

      <div className="placeholder-legend">
        {PLACEHOLDERS.map(p => (
          <div key={p.tag} className="placeholder-chip" title={p.desc}>
            <code>{p.tag}</code>
            <span>{p.desc}</span>
          </div>
        ))}
      </div>

      <div className="email-form-group">
        <label>Subject Email</label>
        <input type="text" name="subject" value={form.subject} onChange={handleChange}
          placeholder="Konfirmasi Booking #{{bookingId}} — Digibox Studio" />
      </div>

      <div className="email-form-group">
        <label>Isi Email (HTML diperbolehkan)</label>
        <textarea name="bodyHtml" value={form.bodyHtml} onChange={handleChange} rows={14}
          placeholder="<p>Halo {{customerName}}, ...</p>" />
      </div>

      <div className="email-form-group">
        <label>Footer Email</label>
        <textarea name="footerHtml" value={form.footerHtml} onChange={handleChange} rows={3}
          placeholder="<p>Digibox Studio — Terima kasih.</p>" />
      </div>

      <div className="email-form-actions">
        <button className="btn-reset-template" onClick={handleReset} disabled={saving}>↺ Reset ke Default</button>
        <button className="btn-save-template" onClick={handleSave} disabled={saving}>
          {saving ? 'Menyimpan...' : '💾 Simpan Template'}
        </button>
      </div>
    </div>
  );
};

export default EmailTemplateManager;