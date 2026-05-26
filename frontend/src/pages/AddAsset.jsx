import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiUploadCloud, FiX, FiArrowLeft, FiCheckCircle } from 'react-icons/fi'
import Navbar from '../components/Navbar.jsx'
import { createAsset } from '../api.js'
import { useToast } from '../components/ToastProvider.jsx'

const ASSET_TYPES = ['Display Stand', 'Shelf Display', 'Smart Kiosk', 'Promotional Counter']

export default function AddAsset() {
  const navigate = useNavigate()
  const toast = useToast()
  const fileRef = useRef()

  const [form, setForm] = useState({ asset_name: '', asset_type: '', store_name: '', description: '' })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)

  function handleField(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  function applyFile(file) {
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (e) => setImagePreview(e.target.result)
    reader.readAsDataURL(file)
  }

  function handleFileChange(e) { applyFile(e.target.files[0]) }

  function handleDrop(e) {
    e.preventDefault(); setDragging(false)
    applyFile(e.dataTransfer.files[0])
  }

  function clearImage(e) {
    e.stopPropagation()
    setImageFile(null); setImagePreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.asset_name || !form.asset_type || !form.store_name) {
      toast('Please fill in all required fields.', 'error'); return
    }
    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (imageFile) fd.append('image', imageFile)
      // Tell Flask to generate QR pointing to React app
      fd.append('host_url', window.location.origin + '/')
      await createAsset(fd)
      toast('Asset created with QR code!', 'success')
      navigate('/')
    } catch (err) {
      toast(err.message, 'error')
    } finally { setLoading(false) }
  }

  return (
    <div className="page">
      <Navbar />
      <main className="main-content" style={{ maxWidth: 680 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

          {/* Back + heading */}
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')} style={{ marginBottom: 24 }}>
            <FiArrowLeft size={14} /> Back to Dashboard
          </button>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 6 }}>
            New <span className="grad-text">Retail Asset</span>
          </h1>
          <p style={{ color: 'var(--text-3)', fontSize: '0.875rem', marginBottom: 32 }}>
            A unique QR code will be generated automatically and linked to this asset.
          </p>

          <form onSubmit={handleSubmit} className="glass" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 22 }}>

            {/* Asset name */}
            <div className="form-group">
              <label className="form-label">Asset Name *</label>
              <input className="form-input" name="asset_name" value={form.asset_name} onChange={handleField} placeholder="e.g. Summer Drinks Promo Stand" required />
            </div>

            {/* Asset type */}
            <div className="form-group">
              <label className="form-label">Asset Type *</label>
              <select className="form-input" name="asset_type" value={form.asset_type} onChange={handleField} required>
                <option value="">Select type…</option>
                {ASSET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Store name */}
            <div className="form-group">
              <label className="form-label">Store Name *</label>
              <input className="form-input" name="store_name" value={form.store_name} onChange={handleField} placeholder="e.g. Supermarket Central" required />
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-input" name="description" value={form.description} onChange={handleField} placeholder="Describe the asset, promotion, location…" rows={3} />
            </div>

            {/* Image upload */}
            <div className="form-group">
              <label className="form-label">Banner Image</label>
              {imagePreview ? (
                <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
                  <img src={imagePreview} alt="preview" className="img-preview" />
                  <button type="button" onClick={clearImage} style={{
                    position: 'absolute', top: 8, right: 8,
                    background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '50%',
                    width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: '#fff',
                  }}><FiX size={14} /></button>
                </div>
              ) : (
                <div
                  className={`drop-zone ${dragging ? 'drag-over' : ''}`}
                  onDragOver={e => { e.preventDefault(); setDragging(true) }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                >
                  <input type="file" accept="image/*" onChange={handleFileChange} ref={fileRef} />
                  <FiUploadCloud size={32} style={{ color: 'var(--primary)', marginBottom: 10 }} />
                  <p style={{ fontWeight: 600, marginBottom: 4 }}>Drop an image or click to browse</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>PNG, JPG, WEBP, GIF supported</p>
                </div>
              )}
            </div>

            {/* Submit */}
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ alignSelf: 'flex-end', minWidth: 180 }}>
              {loading ? <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Creating…</> : <><FiCheckCircle size={16} /> Create Asset & QR</>}
            </button>

          </form>
        </motion.div>
      </main>
    </div>
  )
}
