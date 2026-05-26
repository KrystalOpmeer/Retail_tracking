import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiUser, FiMail, FiLock, FiArrowRight, FiBriefcase } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/ToastProvider'

export default function Register() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { registerBrand } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validations
    if (!username || !email || !password || !confirmPassword) return

    if (password !== confirmPassword) {
      toast('Passwords do not match.', 'error')
      return
    }

    if (password.length < 6) {
      toast('Password must be at least 6 characters long.', 'error')
      return
    }

    setSubmitting(true)
    const success = await registerBrand(username.trim(), email.trim(), password)
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
        top: '15%',
        right: '20%',
        width: 350,
        height: 350,
        borderRadius: '50%',
        background: 'rgba(168, 85, 247, 0.12)',
        filter: 'blur(90px)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '15%',
        left: '20%',
        width: 350,
        height: 350,
        borderRadius: '50%',
        background: 'rgba(99, 102, 241, 0.15)',
        filter: 'blur(90px)',
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
          maxWidth: 440,
          padding: '40px 32px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 30px rgba(99, 102, 241, 0.05)',
          zIndex: 1,
          border: '1px solid rgba(255, 255, 255, 0.07)'
        }}
      >
        {/* Header / Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 48,
            height: 48,
            borderRadius: 14,
            background: 'linear-gradient(135deg, #a855f7, #6366f1)',
            color: '#fff',
            marginBottom: 16,
            boxShadow: '0 8px 20px rgba(168,85,247,0.3)'
          }}>
            <FiBriefcase size={24} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 4 }}>
            Register <span className="grad-text">Brand</span>
          </h2>
          <p style={{ color: '#8e919e', fontSize: '0.85rem' }}>
            Register your brand to start tracking physical display scans
          </p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">Brand Name</label>
            <div style={{ position: 'relative' }}>
              <FiUser style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748b',
                pointerEvents: 'none'
              }} />
              <input
                id="username"
                type="text"
                className="form-input"
                placeholder="e.g. Acme Corp"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{ paddingLeft: 42 }}
                disabled={submitting}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Brand Email</label>
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
                placeholder="info@brand.com"
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
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingLeft: 42 }}
                disabled={submitting}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
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
                id="confirmPassword"
                type="password"
                className="form-input"
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{ paddingLeft: 42 }}
                disabled={submitting}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={submitting || !username || !email || !password || !confirmPassword}
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
                Create Brand Account <FiArrowRight />
              </>
            )}
          </button>
        </form>

        {/* Login Link */}
        <div style={{
          textAlign: 'center',
          marginTop: 28,
          fontSize: '0.85rem',
          color: '#8e919e'
        }}>
          Already have a brand account?{' '}
          <Link
            to="/login"
            style={{
              color: '#a855f7',
              fontWeight: 600,
              transition: 'color 0.15s ease'
            }}
            onMouseOver={(e) => e.target.style.color = '#6366f1'}
            onMouseOut={(e) => e.target.style.color = '#a855f7'}
          >
            Log In
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
