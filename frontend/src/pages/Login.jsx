import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiMail, FiLock, FiArrowRight, FiShield } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { loginBrand } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) return

    setSubmitting(true)
    const success = await loginBrand(email, password)
    setSubmitting(false)
    if (success) {
      navigate('/')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#030712',
      position: 'relative',
      overflow: 'hidden',
      padding: '24px'
    }}>
      {/* Background neon glow blobs */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '25%',
        width: 300,
        height: 300,
        borderRadius: '50%',
        background: 'rgba(99, 102, 241, 0.15)',
        filter: 'blur(80px)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '20%',
        right: '25%',
        width: 300,
        height: 300,
        borderRadius: '50%',
        background: 'rgba(168, 85, 247, 0.12)',
        filter: 'blur(80px)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="glass"
        style={{
          width: '100%',
          maxWidth: 420,
          padding: '40px 32px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 30px rgba(99, 102, 241, 0.05)',
          zIndex: 1,
          border: '1px solid rgba(255, 255, 255, 0.07)'
        }}
      >
        {/* Header / Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 48,
            height: 48,
            borderRadius: 14,
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            color: '#fff',
            marginBottom: 16,
            boxShadow: '0 8px 20px rgba(99,102,241,0.3)'
          }}>
            <FiShield size={24} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 4 }}>
            Brand <span className="grad-text">Login</span>
          </h2>
          <p style={{ color: '#8e919e', fontSize: '0.85rem' }}>
            Enter your credentials to access your IBTSO workspace
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <FiMail style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748b',
                pointerEvents: 'none'
              }} />
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="brand@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ paddingLeft: 42 }}
                disabled={submitting}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <FiLock style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748b',
                pointerEvents: 'none'
              }} />
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingLeft: 42 }}
                disabled={submitting}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={submitting || !email || !password}
            style={{
              justifyContent: 'center',
              marginTop: 10,
              width: '100%',
              boxShadow: '0 8px 25px rgba(99, 102, 241, 0.25)'
            }}
          >
            {submitting ? (
              <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
            ) : (
              <>
                Access Dashboard <FiArrowRight />
              </>
            )}
          </button>
        </form>

        {/* Register Link */}
        <div style={{
          textAlign: 'center',
          marginTop: 28,
          fontSize: '0.85rem',
          color: '#8e919e'
        }}>
          Don't have a registered brand?{' '}
          <Link
            to="/register"
            style={{
              color: '#6366f1',
              fontWeight: 600,
              transition: 'color 0.15s ease'
            }}
            onMouseOver={(e) => e.target.style.color = '#a855f7'}
            onMouseOut={(e) => e.target.style.color = '#6366f1'}
          >
            Register Brand
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
