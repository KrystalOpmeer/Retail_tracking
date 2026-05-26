import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#09090b',
        color: '#ffffff'
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          style={{
            width: 50,
            height: 50,
            borderRadius: '50%',
            border: '3px solid rgba(99, 102, 241, 0.15)',
            borderTopColor: '#6366f1',
            marginBottom: 16,
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.25)'
          }}
        />
        <span style={{
          fontSize: '0.9rem',
          color: '#a1a1aa',
          letterSpacing: '0.05em',
          fontWeight: 500
        }}>
          Verifying credentials...
        </span>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}
