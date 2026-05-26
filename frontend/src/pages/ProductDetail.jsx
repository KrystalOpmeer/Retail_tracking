import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiArrowLeft, FiShoppingBag, FiAlertTriangle,
  FiCheck, FiShare2, FiHeart, FiStar, FiMapPin, FiZap
} from 'react-icons/fi'
import { getProduct } from '../api.js'

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [liked, setLiked] = useState(false)
  const [added, setAdded] = useState(false)
  const [qty, setQty] = useState(1)

  useEffect(() => {
    getProduct(id)
      .then(setProduct)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  function handleAddToCart() {
    setAdded(true)
    setTimeout(() => setAdded(false), 2500)
  }

  /* ── Loading ────────────────────────────────────── */
  if (loading) return (
    <div style={{
      minHeight: '100vh', background: '#f8fafc',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 44, height: 44,
          border: '3px solid #e2e8f0', borderTopColor: '#6366f1',
          borderRadius: '50%', animation: 'spin 0.7s linear infinite',
          margin: '0 auto 16px',
        }} />
        <p style={{ color: '#94a3b8', fontSize: '0.875rem', fontWeight: 500 }}>Loading product…</p>
      </div>
    </div>
  )

  /* ── Error ──────────────────────────────────────── */
  if (error || !product) return (
    <div style={{
      minHeight: '100vh', background: '#f8fafc',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Inter, sans-serif', gap: 12,
    }}>
      <FiAlertTriangle size={44} color="#ef4444" />
      <p style={{ color: '#1e293b', fontWeight: 700, fontSize: '1.1rem' }}>Product not found</p>
      <Link to="/" style={{ color: '#6366f1', fontSize: '0.875rem', fontWeight: 600 }}>← Back to store</Link>
    </div>
  )

  const discountedPrice = (parseFloat(product.price) * 0.9).toFixed(2)
  const originalPrice   = parseFloat(product.price).toFixed(2)

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, sans-serif', paddingBottom: 100 }}>

      {/* ── Hero image ─────────────────────────────── */}
      <div style={{ position: 'relative', width: '100%', height: 340, overflow: 'hidden', background: 'linear-gradient(135deg, #e0e7ff 0%, #ede9fe 50%, #fce7f3 100%)' }}>
        {product.image_url
          ? <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
              <FiShoppingBag size={72} color="#6366f1" style={{ opacity: 0.2 }} />
            </div>
          )
        }
        {/* Gradient overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(248,250,252,0.9) 0%, transparent 55%)' }} />

        {/* Top nav: back + share + like */}
        <div style={{ position: 'absolute', top: 16, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', padding: '0 16px' }}>
          <Link
            to={product.asset_id ? `/asset/${product.asset_id}` : '/'}
            style={{
              background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.6)',
              borderRadius: 99, padding: '8px 16px',
              display: 'flex', alignItems: 'center', gap: 6,
              color: '#1e293b', fontSize: '0.82rem', fontWeight: 700,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
          >
            <FiArrowLeft size={14} /> Back
          </Link>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setLiked(l => !l)}
              style={{
                background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.6)',
                borderRadius: 99, width: 38, height: 38,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                transition: 'all 0.2s',
              }}
            >
              <FiHeart size={16} fill={liked ? '#ef4444' : 'none'} color={liked ? '#ef4444' : '#64748b'} />
            </button>
            <button
              onClick={() => navigator.share?.({ title: product.name, url: window.location.href }).catch(() => {})}
              style={{
                background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.6)',
                borderRadius: 99, width: 38, height: 38,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              }}
            >
              <FiShare2 size={15} color="#64748b" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Content card ───────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{ maxWidth: 600, margin: '0 auto', padding: '0 16px' }}
      >

        {/* Category / badge row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 20, marginBottom: 12 }}>
          <span style={{
            fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
            background: 'rgba(99,102,241,0.1)', color: '#6366f1',
            padding: '4px 12px', borderRadius: 99,
            border: '1px solid rgba(99,102,241,0.2)',
          }}>
            In Store Now
          </span>
          <span style={{
            fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
            background: 'rgba(239,68,68,0.08)', color: '#ef4444',
            padding: '4px 12px', borderRadius: 99,
            border: '1px solid rgba(239,68,68,0.2)',
          }}>
            <FiZap size={10} style={{ marginRight: 3, verticalAlign: 'middle' }} />
            10% Off Today
          </span>
        </div>

        {/* Product name */}
        <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.025em', lineHeight: 1.25, marginBottom: 16 }}>
          {product.name}
        </h1>

        {/* Star rating (decorative) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 2 }}>
            {[1,2,3,4,5].map(s => (
              <FiStar key={s} size={14} fill={s <= 4 ? '#f59e0b' : 'none'} color={s <= 4 ? '#f59e0b' : '#cbd5e1'} />
            ))}
          </div>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b' }}>4.0 · 128 reviews</span>
        </div>

        {/* Price block */}
        <div style={{
          background: '#fff', borderRadius: 16,
          padding: '16px 20px', marginBottom: 20,
          boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
          border: '1px solid #f1f5f9',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span style={{ fontSize: '2rem', fontWeight: 900, color: '#6366f1', letterSpacing: '-0.03em' }}>
                ${discountedPrice}
              </span>
              <span style={{ fontSize: '1rem', color: '#94a3b8', textDecoration: 'line-through', fontWeight: 500 }}>
                ${originalPrice}
              </span>
            </div>
            <p style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700, margin: '2px 0 0' }}>
              You save ${(parseFloat(originalPrice) - parseFloat(discountedPrice)).toFixed(2)} with today's stand offer!
            </p>
          </div>
          {/* Qty picker */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, background: '#f8fafc', borderRadius: 99, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <button
              onClick={() => setQty(q => Math.max(1, q - 1))}
              style={{ width: 36, height: 36, border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.1rem', color: '#64748b', fontWeight: 700 }}
            >−</button>
            <span style={{ minWidth: 28, textAlign: 'center', fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>{qty}</span>
            <button
              onClick={() => setQty(q => q + 1)}
              style={{ width: 36, height: 36, border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.1rem', color: '#6366f1', fontWeight: 700 }}
            >+</button>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <div style={{
            background: '#fff', borderRadius: 16, padding: '18px 20px', marginBottom: 20,
            boxShadow: '0 1px 8px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9',
          }}>
            <h3 style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>
              About this product
            </h3>
            <p style={{ color: '#475569', lineHeight: 1.8, fontSize: '0.9rem', margin: 0 }}>
              {product.description}
            </p>
          </div>
        )}

        {/* Feature highlights */}
        <div style={{
          background: '#fff', borderRadius: 16, padding: '18px 20px', marginBottom: 20,
          boxShadow: '0 1px 8px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9',
        }}>
          <h3 style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>
            Why buy this?
          </h3>
          {[
            'Exclusive in-store only pricing today',
            'Available at this display stand right now',
            'No waiting — pick up instantly',
          ].map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: i < 2 ? 10 : 0 }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <FiCheck size={12} color="#10b981" strokeWidth={3} />
              </div>
              <span style={{ fontSize: '0.85rem', color: '#475569' }}>{f}</span>
            </div>
          ))}
        </div>

        {/* Store location chip */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#fff', borderRadius: 12, padding: '12px 16px',
          marginBottom: 20, border: '1px solid #f1f5f9',
          boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
        }}>
          <FiMapPin size={14} color="#6366f1" />
          <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 500 }}>
            Pick up from the display stand in-store
          </span>
          <span style={{
            marginLeft: 'auto', fontSize: '0.7rem', fontWeight: 700,
            background: '#f0fdf4', color: '#16a34a', padding: '3px 10px', borderRadius: 99,
          }}>In Stock</span>
        </div>

      </motion.div>

      {/* ── Sticky CTA bar ─────────────────────────── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        padding: '12px 16px 24px',
        background: 'rgba(248,250,252,0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid #e2e8f0',
        zIndex: 50,
      }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <AnimatePresence mode="wait">
            {added ? (
              <motion.button
                key="added"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                style={{
                  width: '100%', padding: '16px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  border: 'none', borderRadius: 14,
                  color: '#fff', fontSize: '1rem', fontWeight: 800,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  boxShadow: '0 4px 20px rgba(16,185,129,0.35)',
                }}
              >
                <FiCheck size={18} strokeWidth={3} /> Added to Cart!
              </motion.button>
            ) : (
              <motion.button
                key="add"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={handleAddToCart}
                style={{
                  width: '100%', padding: '16px',
                  background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                  border: 'none', borderRadius: 14,
                  color: '#fff', fontSize: '1rem', fontWeight: 800,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
                  transition: 'transform 0.15s',
                }}
                whileTap={{ scale: 0.97 }}
              >
                <FiShoppingBag size={18} /> Add {qty > 1 ? `${qty}x ` : ''}to Cart · ${(parseFloat(discountedPrice) * qty).toFixed(2)}
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

    </div>
  )
}
