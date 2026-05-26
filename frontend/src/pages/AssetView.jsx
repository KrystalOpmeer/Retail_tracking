import { useState, useEffect, useRef } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiShoppingCart, FiTag, FiMapPin, FiArrowLeft, FiAlertTriangle } from 'react-icons/fi'
import { getAsset, getAssetScan } from '../api.js'

export default function AssetView() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const isPreview = searchParams.get('preview') === 'true'

  const [asset, setAsset] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Guard: ensures the scan API is only called ONCE per page load.
  // React StrictMode intentionally double-invokes effects in dev — without
  // this ref the scan endpoint would fire twice and count 2 instead of 1.
  const scanFired = useRef(false)

  useEffect(() => {
    // For real scans: only fire once ever, even across StrictMode double-mount
    if (!isPreview && scanFired.current) return
    if (!isPreview) scanFired.current = true

    const fetcher = isPreview ? getAsset : getAssetScan
    fetcher(id)
      .then(setAsset)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [id, isPreview])

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: '#64748b', fontFamily: 'Inter, sans-serif' }}>Loading…</p>
      </div>
    </div>
  )

  if (error) return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', gap: 12 }}>
      <FiAlertTriangle size={40} color="#ef4444" />
      <p style={{ color: '#1e293b', fontWeight: 700 }}>Asset not found</p>
      <p style={{ color: '#64748b', fontSize: '0.875rem' }}>{error}</p>
    </div>
  )

  return (
    <div className="customer-page" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* Admin Preview Banner */}
      {isPreview && (
        <div style={{
          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
          padding: '10px 20px',
          display: 'flex', alignItems: 'center', gap: 10,
          position: 'sticky', top: 0, zIndex: 50,
        }}>
          <FiAlertTriangle size={16} color="#1c1917" />
          <div style={{ flex: 1 }}>
            <span style={{ color: '#1c1917', fontWeight: 800, fontSize: '0.8rem', display: 'block', lineHeight: 1.2 }}>PREVIEW MODE</span>
            <span style={{ color: '#44403c', fontSize: '0.72rem' }}>This view does <strong>not</strong> count as a customer scan</span>
          </div>
          <Link to="/" style={{ color: '#1c1917', fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', border: '1px solid rgba(0,0,0,0.2)', borderRadius: 8 }}>
            ← Dashboard
          </Link>
        </div>
      )}

      {/* Hero Banner */}
      <div className="customer-hero">
        {asset.image_url
          ? <img src={asset.image_url} alt={asset.asset_name} />
          : null}
        <div className="customer-hero-overlay" />
        <div className="customer-hero-text">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <span style={{
              display: 'inline-block', background: 'rgba(99,102,241,0.85)',
              color: '#fff', fontSize: '0.7rem', fontWeight: 700,
              padding: '3px 10px', borderRadius: 99, marginBottom: 8, letterSpacing: '0.06em',
            }}>
              {asset.asset_type}
            </span>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              {asset.asset_name}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
              <FiMapPin size={12} color="rgba(255,255,255,0.7)" />
              <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>{asset.store_name}</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '20px 16px 40px', maxWidth: 600, margin: '0 auto' }}>

        {/* Description */}
        {asset.description && (
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
            style={{ color: '#475569', fontSize: '0.875rem', marginBottom: 20, lineHeight: 1.7 }}
          >
            {asset.description}
          </motion.p>
        )}

        {/* Promo strip */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            borderRadius: 14, padding: '14px 18px', marginBottom: 24,
            display: 'flex', alignItems: 'center', gap: 12,
          }}
        >
          <div style={{
            background: 'rgba(255,255,255,0.2)', borderRadius: '50%',
            width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <FiTag size={16} color="#fff" />
          </div>
          <div>
            <p style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem', margin: 0 }}>Exclusive Stand Offer</p>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.78rem', margin: 0 }}>Get 10% off items at this display today!</p>
          </div>
        </motion.div>

        {/* Products section */}
        <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <FiShoppingCart size={15} color="#64748b" />
          <h2 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
            Products at this Display
          </h2>
        </div>

        {asset.products && asset.products.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {asset.products.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + i * 0.08 }}
              >
                <Link to={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
                  <div className="product-card-customer">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                      {/* Product image */}
                      <div style={{ width: 100, height: 100, flexShrink: 0, overflow: 'hidden' }}>
                        {product.image_url
                          ? <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <FiShoppingCart size={24} color="#6366f1" />
                            </div>
                        }
                      </div>
                      {/* Info */}
                      <div style={{ padding: '14px 16px', flex: 1 }}>
                        <p style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem', margin: '0 0 4px', lineHeight: 1.3 }}>
                          {product.name}
                        </p>
                        {product.description && (
                          <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 10px', lineHeight: 1.5,
                            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                          }}>
                            {product.description}
                          </p>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#6366f1' }}>
                            ${parseFloat(product.price).toFixed(2)}
                          </span>
                          <span style={{
                            fontSize: '0.7rem', fontWeight: 700,
                            background: '#f0fdf4', color: '#16a34a',
                            padding: '3px 10px', borderRadius: 99,
                          }}>In Stock</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
            <FiShoppingCart size={36} style={{ marginBottom: 12, opacity: 0.4 }} />
            <p style={{ fontWeight: 600 }}>No products linked yet</p>
            <p style={{ fontSize: '0.8rem' }}>Check back soon!</p>
          </div>
        )}

      </div>
    </div>
  )
}
