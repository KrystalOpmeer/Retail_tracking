import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiUploadCloud, FiX, FiArrowLeft, FiCheckCircle, FiDollarSign } from 'react-icons/fi'
import Navbar from '../components/Navbar.jsx'
import { getAssets, createProduct } from '../api.js'
import { useToast } from '../components/ToastProvider.jsx'

export default function AddProduct() {
  const navigate = useNavigate()
  const toast = useToast()
  const { assetId } = useParams()
  const fileRef = useRef()

  const [assets, setAssets] = useState([])
  const [form, setForm] = useState({ name: '', description: '', price: '', asset_id: assetId || '' })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getAssets().then(setAssets).catch(() => {})
    if (assetId) setForm(f => ({ ...f, asset_id: assetId }))
  }, [assetId])

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

  function clearImage(e) {
    e.stopPropagation()
    setImageFile(null); setImagePreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name || !form.price || !form.asset_id) {
      toast('Please fill in name, price, and select an asset.', 'error'); return
    }
    if (isNaN(parseFloat(form.price)) || parseFloat(form.price) < 0) {
      toast('Please enter a valid price.', 'error'); return
    }
    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (imageFile) fd.append('image', imageFile)
      await createProduct(fd)
      toast('Product added successfully!', 'success')
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

          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')} style={{ marginBottom: 24 }}>
            <FiArrowLeft size={14} /> Back to Dashboard
          </button>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 6 }}>
            Add <span className="grad-text">Product</span>
          </h1>
          <p style={{ color: 'var(--text-3)', fontSize: '0.875rem', marginBottom: 32 }}>
            Link a product to a retail asset — customers will see it when they scan the QR code.
          </p>

          <form onSubmit={handleSubmit} className="glass" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 22 }}>

            {/* Asset selector */}
            <div className="form-group">
              <label className="form-label">Link to Asset *</label>
              <select className="form-input" name="asset_id" value={form.asset_id} onChange={handleField} required>
                <option value="">Select a retail asset…</option>
                {assets.map(a => (
                  <option key={a.id} value={a.id}>{a.asset_name} — {a.store_name}</option>
                ))}
              </select>
            </div>

            {/* Product name */}
            <div className="form-group">
              <label className="form-label">Product Name *</label>
              <input className="form-input" name="name" value={form.name} onChange={handleField} placeholder="e.g. Tropical Mango Soda 500ml" required />
            </div>

            {/* Price */}
            <div className="form-group">
              <label className="form-label">Price *</label>
              <div style={{ position: 'relative' }}>
                <FiDollarSign style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                <input className="form-input" name="price" type="number" step="0.01" min="0" value={form.price} onChange={handleField} placeholder="0.00" style={{ paddingLeft: 42 }} required />
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-input" name="description" value={form.description} onChange={handleField} placeholder="Product details, ingredients, offer…" rows={3} />
            </div>

            {/* Image upload */}
            <div className="form-group">
              <label className="form-label">Product Image</label>
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
                  onDrop={e => { e.preventDefault(); setDragging(false); applyFile(e.dataTransfer.files[0]) }}
                >
                  <input type="file" accept="image/*" onChange={e => applyFile(e.target.files[0])} ref={fileRef} />
                  <FiUploadCloud size={32} style={{ color: 'var(--primary)', marginBottom: 10 }} />
                  <p style={{ fontWeight: 600, marginBottom: 4 }}>Drop an image or click to browse</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>PNG, JPG, WEBP supported</p>
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ alignSelf: 'flex-end', minWidth: 180 }}>
              {loading
                ? <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Adding…</>
                : <><FiCheckCircle size={16} /> Add Product</>}
            </button>

          </form>
        </motion.div>
      </main>
    </div>
  )
}
