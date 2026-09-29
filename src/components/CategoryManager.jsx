import React, { useState, useEffect } from 'react';
import { categoryAPI } from '../services/api';

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await categoryAPI.getAll();
      setCategories(res.data?.data ?? []);
    } catch (e) {
      setMsg({ type: 'err', text: 'Gagal memuat kategori' });
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchCategories(); }, []);

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 3500);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await categoryAPI.create(newName.trim());
      setNewName('');
      showMsg('ok', 'Kategori berhasil ditambahkan');
      fetchCategories();
    } catch (err) {
      showMsg('err', err.response?.data?.message || 'Gagal menambah kategori');
    } finally { setCreating(false); }
  };

  const startEdit = (cat) => { setEditingId(cat.id); setEditName(cat.name); };
  const cancelEdit = () => { setEditingId(null); setEditName(''); };

  const saveEdit = async (id) => {
    if (!editName.trim()) return;
    setBusyId(id);
    try {
      await categoryAPI.update(id, editName.trim());
      showMsg('ok', 'Kategori berhasil diupdate');
      setEditingId(null);
      fetchCategories();
    } catch (err) {
      showMsg('err', err.response?.data?.message || 'Gagal update kategori');
    } finally { setBusyId(null); }
  };

  const handleDelete = async (cat) => {
    if (!window.confirm(`Hapus kategori "${cat.name}"?`)) return;
    setBusyId(cat.id);
    try {
      await categoryAPI.delete(cat.id);
      showMsg('ok', 'Kategori berhasil dihapus');
      fetchCategories();
    } catch (err) {
      showMsg('err', err.response?.data?.message || 'Gagal menghapus kategori');
    } finally { setBusyId(null); }
  };

  if (loading) return <div className="loading">Memuat kategori...</div>;

  return (
    <div className="category-manager">
      <div className="bg-info-banner">
        <span>ℹ️</span>
        <span>Kategori dipakai untuk mengelompokkan paket saat customer memilih paket. Kategori yang masih dipakai paket tidak bisa dihapus — pindahkan paket ke kategori lain terlebih dahulu.</span>
      </div>

      {msg.text && (
        <div className={`bg-alert ${msg.type === 'ok' ? 'bg-alert-success' : 'bg-alert-error'}`}>
          {msg.type === 'ok' ? '✅' : '⚠️'} {msg.text}
          <button onClick={() => setMsg({ type: '', text: '' })}>✕</button>
        </div>
      )}

      <form onSubmit={handleCreate} className="category-add-form">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nama kategori baru, misal: Prewedding"
        />
        <button type="submit" disabled={creating || !newName.trim()}>
          {creating ? '⏳' : '+ Tambah'}
        </button>
      </form>

      {categories.length === 0 ? (
        <div className="category-empty">
          <span>📁</span>
          <p>Belum ada kategori. Tambahkan kategori pertama di atas.</p>
        </div>
      ) : (
        <div className="category-list">
          {categories.map(cat => (
            <div key={cat.id} className="category-row">
              {editingId === cat.id ? (
                <>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="category-edit-input"
                    autoFocus
                  />
                  <div className="category-row-actions">
                    <button className="btn-cancel-mini" onClick={cancelEdit}>Batal</button>
                    <button className="btn-save-mini" onClick={() => saveEdit(cat.id)} disabled={busyId === cat.id}>
                      {busyId === cat.id ? '...' : 'Simpan'}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="category-row-info">
                    <span className="category-name">{cat.name}</span>
                    <span className="category-count">{cat._count?.packages ?? 0} paket</span>
                  </div>
                  <div className="category-row-actions">
                    <button className="btn-edit-studio" onClick={() => startEdit(cat)}>✎ Edit</button>
                    <button
                      className="btn-delete-category"
                      onClick={() => handleDelete(cat)}
                      disabled={busyId === cat.id || (cat._count?.packages ?? 0) > 0}
                      title={(cat._count?.packages ?? 0) > 0 ? 'Masih dipakai oleh paket, tidak bisa dihapus' : 'Hapus kategori'}
                    >
                      🗑️
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryManager;