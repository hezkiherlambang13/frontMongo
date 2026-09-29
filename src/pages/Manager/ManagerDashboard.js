import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BookingManagement, StudioManager } from '../Admin/AdminDashboard';
import { managerStatsAPI } from '../../services/api';
import usePolling from '../../hooks/usePolling';
import './ManagerDashboard.css';

const ManagerDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('monitoring');

  return (
    <div className="manager-dashboard">
      <nav className="manager-navbar">
        <div className="navbar-brand">
          <h2>📸 Studio Bion</h2>
          <span className="manager-badge">Manager</span>
        </div>
        <div className="navbar-user">
          <div className="user-avatar">{user?.name?.charAt(0)}</div>
          <div className="user-info">
            <span className="user-name">{user?.name}</span>
            <span className="user-role">Manager</span>
          </div>
          <button className="btn-logout" onClick={logout}>Logout</button>
        </div>
      </nav>

      <div className="manager-content">
        <div className="page-header">
          <h1>
            {activeTab === 'monitoring' && '📊 Dashboard Monitoring'}
            {activeTab === 'bookings' && '📋 Booking Management'}
            {activeTab === 'studios' && '🏢 Kelola Studio'}
          </h1>
          <p>
            {activeTab === 'monitoring' && 'Monitoring paket dipesan secara realtime'}
            {activeTab === 'bookings' && 'Review dan kelola booking pelanggan'}
            {activeTab === 'studios' && 'Kontrol buka/tutup Studio 1 & Studio 2'}
          </p>
        </div>

        <div className="manager-tabs">
          <button className={activeTab === 'monitoring' ? 'active' : ''} onClick={() => setActiveTab('monitoring')}>
            📊 Monitoring
          </button>
          <button className={activeTab === 'bookings' ? 'active' : ''} onClick={() => setActiveTab('bookings')}>
            📅 Bookings
          </button>
          <button className={activeTab === 'studios' ? 'active' : ''} onClick={() => setActiveTab('studios')}>
            🏢 Studio
          </button>
        </div>

        {activeTab === 'monitoring' && <MonitoringDashboard />}
        {activeTab === 'bookings' && <BookingManagement role="manager" />}
        {activeTab === 'studios' && <StudioManager />}
      </div>
    </div>
  );
};

// ===== MONITORING DASHBOARD ===== ✅ NEW
// const MonitoringDashboard = () => {
//   const [stats, setStats] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [rangeType, setRangeType] = useState('days'); // 'days' | 'months'
//   const [rangeValue, setRangeValue] = useState(30);
//   const [lastUpdated, setLastUpdated] = useState(null);

//   const fetchStats = useCallback(async () => {
//     try {
//       const res = await managerStatsAPI.get({ rangeType, rangeValue });
//       setStats(res.data?.data ?? null);
//       setLastUpdated(new Date());
//     } catch (e) {
//       console.error('Gagal memuat statistik manager:', e);
//     } finally {
//       setLoading(false);
//     }
//   }, [rangeType, rangeValue]);

//   useEffect(() => { fetchStats(); }, [fetchStats]);

//   // ✅ Realtime via polling — refresh setiap 10 detik tanpa perlu reload halaman
//   usePolling(fetchStats, 10000, true);

//   const handleRangeTypeChange = (type) => {
//     setRangeType(type);
//     setRangeValue(type === 'days' ? 30 : 12);
//   };

//   if (loading) return <div className="loading">Memuat dashboard...</div>;
//   if (!stats) return <div className="loading">Gagal memuat data statistik.</div>;

//   const summaryCards = [
//     { label: 'HARI INI', value: stats.todayCount, unit: 'paket' },
//     { label: '7 HARI', value: stats.last7DaysCount, unit: 'paket' },
//     { label: '30 HARI', value: stats.last30DaysCount, unit: 'paket' },
//     { label: 'BULAN INI', value: stats.thisMonthCount, unit: 'paket' },
//     { label: '12 BULAN', value: stats.last12MonthsCount, unit: 'paket' },
//     { label: 'TAHUN INI', value: stats.thisYearCount, unit: 'paket' },
//   ];

//   return (
//     <div className="monitoring-dashboard">
//       <div className="realtime-indicator">
//         <span className="realtime-dot"></span>
//         Realtime — diperbarui otomatis {lastUpdated ? lastUpdated.toLocaleTimeString('id-ID') : ''}
//       </div>

//       <div className="summary-grid">
//         {summaryCards.map(card => (
//           <div key={card.label} className="summary-card">
//             <span className="summary-label">{card.label}</span>
//             <span className="summary-value">{card.value.toLocaleString('id-ID')}</span>
//             <span className="summary-unit">{card.unit}</span>
//           </div>
//         ))}
//       </div>

//       <div className="filter-periode-box">
//         <div className="filter-periode-header">
//           <h3>Filter Periode</h3>
//           <span className="filter-periode-hint">Maks. 30 hari / 12 bulan</span>
//         </div>

//         <div className="filter-periode-controls">
//           <div className="filter-group">
//             <label>Rentang Harian</label>
//             <select
//               value={rangeType === 'days' ? rangeValue : ''}
//               onChange={(e) => { handleRangeTypeChange('days'); setRangeValue(parseInt(e.target.value)); }}
//             >
//               <option value="7">7 hari terakhir</option>
//               <option value="14">14 hari terakhir</option>
//               <option value="30">30 hari terakhir</option>
//             </select>
//           </div>

//           <div className="filter-group">
//             <label>Rentang Bulanan</label>
//             <select
//               value={rangeType === 'months' ? rangeValue : ''}
//               onChange={(e) => { handleRangeTypeChange('months'); setRangeValue(parseInt(e.target.value)); }}
//             >
//               <option value="3">3 bulan terakhir</option>
//               <option value="6">6 bulan terakhir</option>
//               <option value="12">12 bulan terakhir</option>
//             </select>
//           </div>
//         </div>

//         <div className="filter-result-bar">
//           <div className="filter-result-item">
//             <span>Total paket dipesan (periode ini)</span>
//             <strong>{stats.filteredCount.toLocaleString('id-ID')} paket</strong>
//           </div>
//         </div>
//       </div>

//       <div className="revenue-summary-box">
//         <h3>Ringkasan Pendapatan</h3>
//         <p className="revenue-hint">Berdasarkan booking approved/completed pada periode dipilih</p>

//         <div className="revenue-grid">
//           <div className="revenue-item">
//             <span className="revenue-label">Total pendapatan periode dipilih</span>
//             <span className="revenue-value">Rp {stats.filteredRevenue.toLocaleString('id-ID')}</span>
//           </div>
//           <div className="revenue-item">
//             <span className="revenue-label">Rata-rata per hari</span>
//             <span className="revenue-value">Rp {stats.avgRevenuePerDay.toLocaleString('id-ID')}</span>
//           </div>
//           <div className="revenue-item">
//             <span className="revenue-label">Paket terlaris</span>
//             <span className="revenue-value">
//               {stats.topPackage ? `${stats.topPackage.name} (${stats.topPackage.count}x)` : '-'}
//             </span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };
// ===== MONITORING DASHBOARD =====
const MonitoringDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rangeType, setRangeType] = useState('days'); // 'days' | 'months'
  const [rangeValue, setRangeValue] = useState(30);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await managerStatsAPI.get({ rangeType, rangeValue });
      setStats(res.data?.data ?? null);
      setLastUpdated(new Date());
    } catch (e) {
      console.error('Gagal memuat statistik manager:', e);
    } finally {
      setLoading(false);
    }
  }, [rangeType, rangeValue]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Realtime via polling — refresh setiap 10 detik
  usePolling(fetchStats, 10000, true);

  const handleRangeTypeChange = (type) => {
    setRangeType(type);
    setRangeValue(type === 'days' ? 30 : 12);
  };

  if (loading) return <div className="loading">Memuat dashboard...</div>;
  if (!stats) return <div className="loading">Gagal memuat data statistik.</div>;

  const summaryCards = [
    { label: 'HARI INI', value: stats.todayCount ?? 0, unit: 'paket' },
    { label: '7 HARI', value: stats.last7DaysCount ?? 0, unit: 'paket' },
    { label: '30 HARI', value: stats.last30DaysCount ?? 0, unit: 'paket' },
    { label: 'BULAN INI', value: stats.thisMonthCount ?? 0, unit: 'paket' },
    { label: '12 BULAN', value: stats.last12MonthsCount ?? 0, unit: 'paket' },
    { label: 'TAHUN INI', value: stats.thisYearCount ?? 0, unit: 'paket' },
  ];

  return (
    <div className="monitoring-dashboard">
      <div className="realtime-indicator">
        <span className="realtime-dot"></span>
        Realtime — diperbarui otomatis{' '}
        {lastUpdated ? lastUpdated.toLocaleTimeString('id-ID') : ''}
      </div>

      <div className="summary-grid">
        {summaryCards.map((card) => (
          <div key={card.label} className="summary-card">
            <span className="summary-label">{card.label}</span>
            <span className="summary-value">
              {(card.value ?? 0).toLocaleString('id-ID')}
            </span>
            <span className="summary-unit">{card.unit}</span>
          </div>
        ))}
      </div>

      <div className="filter-periode-box">
        <div className="filter-periode-header">
          <h3>Filter Periode</h3>
          <span className="filter-periode-hint">Maks. 30 hari / 12 bulan</span>
        </div>

        <div className="filter-periode-controls">
          <div className="filter-group">
            <label>Rentang Harian</label>
            <select
              value={rangeType === 'days' ? rangeValue : ''}
              onChange={(e) => {
                handleRangeTypeChange('days');
                setRangeValue(parseInt(e.target.value));
              }}
            >
              <option value="7">7 hari terakhir</option>
              <option value="14">14 hari terakhir</option>
              <option value="30">30 hari terakhir</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Rentang Bulanan</label>
            <select
              value={rangeType === 'months' ? rangeValue : ''}
              onChange={(e) => {
                handleRangeTypeChange('months');
                setRangeValue(parseInt(e.target.value));
              }}
            >
              <option value="3">3 bulan terakhir</option>
              <option value="6">6 bulan terakhir</option>
              <option value="12">12 bulan terakhir</option>
            </select>
          </div>
        </div>

        <div className="filter-result-bar">
          <div className="filter-result-item">
            <span>Total paket dipesan (periode ini)</span>
            <strong>
              {(stats.filteredCount ?? 0).toLocaleString('id-ID')} paket
            </strong>
          </div>
        </div>
      </div>

      <div className="revenue-summary-box">
        <h3>Ringkasan Pendapatan</h3>
        <p className="revenue-hint">
          Berdasarkan booking approved/completed pada periode dipilih
        </p>

        <div className="revenue-grid">
          <div className="revenue-item">
            <span className="revenue-label">
              Total pendapatan periode dipilih
            </span>
            <span className="revenue-value">
              Rp {(stats.filteredRevenue ?? 0).toLocaleString('id-ID')}
            </span>
          </div>
          <div className="revenue-item">
            <span className="revenue-label">Rata-rata per hari</span>
            <span className="revenue-value">
              Rp {(stats.avgRevenuePerDay ?? 0).toLocaleString('id-ID')}
            </span>
          </div>
          <div className="revenue-item">
            <span className="revenue-label">Paket terlaris</span>
            <span className="revenue-value">
              {stats.topPackage
                ? `${stats.topPackage.name} (${stats.topPackage.count}x)`
                : '-'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;