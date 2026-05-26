import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiEye, FiZap, FiTrash2, FiSearch, FiPackage, FiPlusCircle } from 'react-icons/fi'
import { simulateScan, deleteAsset } from '../api.js'
import { useToast } from './ToastProvider.jsx'

const TYPE_BADGE = {
  'Display Stand': 'badge-primary',
  'Shelf Display': 'badge-cyan',
  'Smart Kiosk': 'badge-purple',
  'Promotional Counter': 'badge-amber',
}

export default function AssetTable({ assets = [], onUpdate, onQrClick }) {
  const [query, setQuery] = useState('')
  const [scanning, setScanning] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const toast = useToast()

  const filtered = assets.filter(a =>
    a.asset_name.toLowerCase().includes(query.toLowerCase()) ||
    a.store_name.toLowerCase().includes(query.toLowerCase()) ||
    a.asset_type.toLowerCase().includes(query.toLowerCase())
  )

  async function handleSimulate(id) {
    setScanning(id)
    try {
      const res = await simulateScan(id)
      toast(`Test scan recorded! Total: ${res.total_scans}`, 'success')
      onUpdate && onUpdate(res)
    } catch (e) {
      toast(e.message, 'error')
    } finally { setScanning(null) }
  }

  async function handleDelete(asset) {
    if (!confirm(`Delete "${asset.asset_name}" and all its products?`)) return
    setDeleting(asset.id)
    try {
      await deleteAsset(asset.id)
      toast(`"${asset.asset_name}" deleted`, 'success')
      onUpdate && onUpdate()
    } catch (e) {
      toast(e.message, 'error')
    } finally { setDeleting(null) }
  }

  return (
    <div>
      {/* Search bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <FiSearch style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }} />
          <input
            className="form-input"
            placeholder="Search assets, stores, types…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ paddingLeft: 42 }}
          />
        </div>
        <Link to="/add-asset" className="btn btn-primary btn-sm">
          <FiPlusCircle size={14} /> New Asset
        </Link>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid var(--border)' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Asset</th>
              <th>Type</th>
              <th className="hide-mobile">Store</th>
              <th className="hide-mobile">Products</th>
              <th>Scans</th>
              <th className="hide-mobile">QR</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-3)' }}>
                    {query ? 'No assets match your search.' : 'No assets yet — create your first one!'}
                  </td>
                </tr>
              ) : filtered.map((asset, i) => (
                <motion.tr
                  key={asset.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  {/* Asset name + thumbnail */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {asset.image_url
                        ? <img src={asset.image_url} alt="" className="asset-avatar" />
                        : <div className="asset-avatar-placeholder">{asset.asset_name[0]}</div>
                      }
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{asset.asset_name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>ID #{asset.id}</div>
                      </div>
                    </div>
                  </td>

                  {/* Type badge */}
                  <td>
                    <span className={`badge ${TYPE_BADGE[asset.asset_type] || 'badge-primary'}`}>
                      {asset.asset_type}
                    </span>
                  </td>

                  {/* Store */}
                  <td className="hide-mobile" style={{ color: 'var(--text-2)', fontSize: '0.85rem' }}>
                    {asset.store_name}
                  </td>

                  {/* Products count */}
                  <td className="hide-mobile">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-2)', fontSize: '0.85rem' }}>
                      <FiPackage size={13} style={{ color: 'var(--text-3)' }} />
                      {(asset.products || []).length}
                      <Link to={`/add-product/${asset.id}`} style={{ marginLeft: 4 }}>
                        <FiPlusCircle size={13} style={{ color: 'var(--primary)', opacity: 0.7 }} />
                      </Link>
                    </div>
                  </td>

                  {/* Scan count */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className="pulse-dot" />
                      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{asset.scan_count}</span>
                    </div>
                  </td>

                  {/* QR Code preview — click to open modal */}
                  <td className="hide-mobile">
                    {asset.qr_code_url ? (
                      <div
                        onClick={() => onQrClick && onQrClick(asset)}
                        title="Click to zoom, download or regenerate QR"
                        style={{
                          cursor: 'pointer', display: 'inline-block',
                          borderRadius: 8, padding: 3, background: '#fff',
                          border: '2px solid transparent',
                          transition: 'border-color 0.2s, box-shadow 0.2s',
                          boxShadow: '0 0 0 0 rgba(99,102,241,0)',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = '#6366f1'
                          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.25)'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = 'transparent'
                          e.currentTarget.style.boxShadow = '0 0 0 0 rgba(99,102,241,0)'
                        }}
                      >
                        <img
                          src={asset.qr_code_url}
                          alt="QR"
                          style={{ width: 40, height: 40, borderRadius: 4, display: 'block' }}
                        />
                      </div>
                    ) : (
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ fontSize: '0.72rem', opacity: 0.6 }}
                        onClick={() => onQrClick && onQrClick(asset)}
                      >Gen QR</button>
                    )}
                  </td>

                  {/* Actions */}
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                      <button
                        className="btn btn-amber btn-sm btn-icon"
                        onClick={() => handleSimulate(asset.id)}
                        disabled={scanning === asset.id}
                        title="Test scan (AJAX, increments count)"
                      >
                        <FiZap size={14} />
                      </button>
                      <Link
                        to={`/asset/${asset.id}?preview=true`}
                        target="_blank"
                        className="btn btn-cyan btn-sm btn-icon"
                        title="Preview customer page (no scan count)"
                      >
                        <FiEye size={14} />
                      </Link>
                      <button
                        className="btn btn-danger btn-sm btn-icon"
                        onClick={() => handleDelete(asset)}
                        disabled={deleting === asset.id}
                        title="Delete asset"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {filtered.length > 0 && (
        <p style={{ marginTop: 12, fontSize: '0.75rem', color: 'var(--text-3)', textAlign: 'right' }}>
          {filtered.length} asset{filtered.length !== 1 ? 's' : ''} shown
        </p>
      )}
    </div>
  )
}
