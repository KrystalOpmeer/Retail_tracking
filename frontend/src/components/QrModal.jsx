import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiDownload, FiCopy, FiRefreshCw, FiExternalLink } from 'react-icons/fi'
import { regenerateQr } from '../api.js'
import { useToast } from './ToastProvider.jsx'

export default function QrModal({ asset, onClose, onRegenerated }) {
  const [loading, setLoading] = useState(false)
  const [customHost, setCustomHost] = useState(window.location.origin + '/')
  const toast = useToast()

  const qrUrl = asset.qr_code_url
  const targetUrl = `${window.location.origin}/asset/${asset.id}`

  function handleCopy() {
    navigator.clipboard.writeText(targetUrl)
      .then(() => toast('URL copied to clipboard!', 'success'))
      .catch(() => toast('Failed to copy', 'error'))
  }

  function handleDownload() {
    const a = document.createElement('a')
    a.href = qrUrl
    a.download = `QR_${asset.asset_name.replace(/\s+/g, '_')}.png`
    a.click()
  }

  async function handleRegen() {
    setLoading(true)
    try {
      const res = await regenerateQr(asset.id, customHost)
      toast('QR code regenerated!', 'success')
      onRegenerated && onRegenerated(res)
    } catch (e) {
      toast(e.message, 'error')
    } finally { setLoading(false) }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="modal-box"
          initial={{ scale: 0.85, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
            <div>
              <h3 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: 4 }}>{asset.asset_name}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>{asset.store_name} · {asset.asset_type}</p>
            </div>
            <button className="btn btn-ghost btn-icon" onClick={onClose}><FiX size={16} /></button>
          </div>

          {/* QR Code */}
          {qrUrl ? (
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{
                display: 'inline-block', padding: 16,
                background: '#fff', borderRadius: 16,
                boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
              }}>
                <img src={qrUrl} alt="QR Code" style={{ width: 200, height: 200, display: 'block' }} />
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-3)', marginBottom: 24 }}>
              No QR code yet — regenerate below.
            </div>
          )}

          {/* Target URL */}
          <div style={{
            background: 'rgba(255,255,255,0.04)', borderRadius: 8,
            padding: '10px 14px', marginBottom: 20,
            display: 'flex', alignItems: 'center', gap: 8,
            border: '1px solid var(--border)',
          }}>
            <FiExternalLink size={13} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
            <code style={{ fontSize: '0.75rem', color: 'var(--text-2)', flex: 1, wordBreak: 'break-all' }}>
              {targetUrl}
            </code>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            <button className="btn btn-ghost btn-sm" onClick={handleCopy} style={{ flex: 1 }}>
              <FiCopy size={13} /> Copy URL
            </button>
            {qrUrl && (
              <button className="btn btn-ghost btn-sm" onClick={handleDownload} style={{ flex: 1 }}>
                <FiDownload size={13} /> Download QR
              </button>
            )}
          </div>

          {/* Regenerate section */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginBottom: 8 }}>
              Regenerate QR for a different host (e.g. network IP for phone scanning):
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className="form-input"
                value={customHost}
                onChange={e => setCustomHost(e.target.value)}
                placeholder="http://192.168.x.x:5173/"
                style={{ flex: 1, fontSize: '0.8rem' }}
              />
              <button className="btn btn-primary btn-sm" onClick={handleRegen} disabled={loading}>
                <FiRefreshCw size={13} className={loading ? 'spin' : ''} />
                {loading ? 'Regen…' : 'Regen'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
