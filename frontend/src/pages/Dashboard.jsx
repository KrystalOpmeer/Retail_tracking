import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { FiGrid, FiPackage, FiActivity, FiMaximize2, FiRefreshCw, FiClock } from 'react-icons/fi'
import Navbar from '../components/Navbar.jsx'
import StatCard from '../components/StatCard.jsx'
import ScanChart from '../components/ScanChart.jsx'
import AssetTable from '../components/AssetTable.jsx'
import QrModal from '../components/QrModal.jsx'
import { getDashboard } from '../api.js'

const POLL_INTERVAL = 15000 // refresh every 15 seconds

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [qrAsset, setQrAsset] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const pollingRef = useRef(null)

  const load = useCallback(async (silent = false) => {
    try {
      if (!silent) setError(null)
      const d = await getDashboard()
      setData(d)
      setLastUpdated(new Date())
    } catch (e) {
      if (!silent) setError(e.message)
    } finally {
      if (!silent) setLoading(false)
    }
  }, [])

  // Initial load + start polling
  useEffect(() => {
    load(false)
    pollingRef.current = setInterval(() => load(true), POLL_INTERVAL)
    return () => clearInterval(pollingRef.current)
  }, [load])

  // Called when test-scan AJAX completes — merge updated stats live
  function handleScanUpdate(res) {
    if (!res) { load(false); return }
    setData(prev => {
      if (!prev) return prev
      return {
        ...prev,
        total_scans: res.total_scans,
        total_assets: res.total_assets,
        total_products: res.total_products,
        chart_dates: res.chart_dates,
        chart_counts: res.chart_counts,
        assets: prev.assets.map(a =>
          a.id === res.asset_id ? { ...a, scan_count: res.asset_scan_count } : a
        ),
      }
    })
    setLastUpdated(new Date())
  }

  function formatTime(date) {
    if (!date) return '—'
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  if (loading) return (
    <div className="page">
      <Navbar />
      <div className="loading-center"><div className="spinner" /><p style={{ color: 'var(--text-3)' }}>Loading dashboard…</p></div>
    </div>
  )

  if (error) return (
    <div className="page">
      <Navbar />
      <div className="loading-center">
        <p style={{ color: 'var(--danger)' }}>⚠ {error}</p>
        <button className="btn btn-ghost" onClick={load}><FiRefreshCw /> Retry</button>
      </div>
    </div>
  )

  return (
    <div className="page">
      <Navbar />
      <main className="main-content">

        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 32, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}
        >
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 4 }}>
              Brand <span className="grad-text">Dashboard</span>
            </h1>
            <p style={{ color: 'var(--text-3)', fontSize: '0.875rem' }}>
              Manage retail display assets and track QR scan engagement
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => load(false)}>
              <FiRefreshCw size={13} /> Refresh
            </button>
            {lastUpdated && (
              <span style={{ fontSize: '0.7rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <FiClock size={11} /> Updated {formatTime(lastUpdated)} · auto-refreshes every 15s
              </span>
            )}
          </div>
        </motion.div>

        {/* Stat cards */}
        <div className="stat-grid" style={{ marginBottom: 32 }}>
          <StatCard icon={<FiGrid />}     label="Total Assets"   value={data.total_assets}   color="#6366f1" delay={0} />
          <StatCard icon={<FiPackage />}  label="Products"       value={data.total_products}  color="#a855f7" delay={0.08} />
          <StatCard icon={<FiActivity />} label="Total Scans"    value={data.total_scans}     color="#10b981" delay={0.16} />
        </div>

        {/* Chart + quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass"
          style={{ padding: 28, marginBottom: 28 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontWeight: 800, fontSize: '1rem', marginBottom: 2 }}>Scan Activity</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>Daily QR code scans across all assets</p>
            </div>
            <span className="badge badge-success"><span className="pulse-dot" style={{ width: 6, height: 6 }} /> Live</span>
          </div>
          <ScanChart dates={data.chart_dates} counts={data.chart_counts} />
        </motion.div>

        {/* Assets table */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass"
          style={{ padding: 28 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontWeight: 800, fontSize: '1rem', marginBottom: 2 }}>Retail Assets</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>
                Click <FiMaximize2 style={{ verticalAlign: 'middle' }} /> on the QR thumbnail to zoom, download or regenerate
              </p>
            </div>
          </div>
          <AssetTable
            assets={data.assets}
            onUpdate={handleScanUpdate}
            onQrClick={setQrAsset}
          />
        </motion.div>

      </main>

      {/* QR Modal */}
      {qrAsset && (
        <QrModal
          asset={qrAsset}
          onClose={() => setQrAsset(null)}
          onRegenerated={() => { setQrAsset(null); load() }}
        />
      )}
    </div>
  )
}
