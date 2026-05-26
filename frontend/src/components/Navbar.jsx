import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiGrid, FiPlusCircle, FiPackage, FiRefreshCw, FiLogOut } from 'react-icons/fi'
import { regenerateAllQrs } from '../api.js'
import { useToast } from './ToastProvider.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function Navbar() {
  const location = useLocation()
  const toast = useToast()
  const { user, logoutBrand } = useAuth()

  const isActive = (path) => location.pathname === path

  async function handleRegenAll() {
    const host = window.location.origin + '/'
    try {
      const res = await regenerateAllQrs(host)
      toast(`Regenerated ${res.regenerated} QR codes for ${host}`, 'success')
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(3,7,18,0.85)',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
    }}>
      <div style={{
        maxWidth: 1300, margin: '0 auto',
        padding: '0 24px',
        display: 'flex', alignItems: 'center', gap: 8, height: 64,
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 24 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 800, color: '#fff',
            boxShadow: '0 4px 15px rgba(99,102,241,0.4)',
          }}>I</div>
          <span style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.02em' }}>
            IB<span style={{ color: '#6366f1' }}>TSO</span>
          </span>
        </Link>

        {/* Nav links */}
        {[
          { to: '/', icon: <FiGrid size={15} />, label: 'Dashboard' },
          { to: '/add-asset', icon: <FiPlusCircle size={15} />, label: 'Add Asset' },
          { to: '/add-product', icon: <FiPackage size={15} />, label: 'Add Product' },
        ].map(({ to, icon, label }) => (
          <Link key={to} to={to} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 14px', borderRadius: 8,
            fontSize: '0.85rem', fontWeight: 600,
            color: isActive(to) ? '#fff' : 'var(--text-3)',
            background: isActive(to) ? 'rgba(99,102,241,0.15)' : 'transparent',
            border: isActive(to) ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
            transition: 'all 0.2s',
          }}>
            {icon} {label}
          </Link>
        ))}

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-ghost btn-sm hide-mobile" onClick={handleRegenAll} title="Regenerate all QR codes to point to this browser's URL">
            <FiRefreshCw size={14} /> Regen QRs
          </button>
          {user && (
            <>
              <div style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '5px 12px',
                borderRadius: 99,
                color: '#cbd5e1',
                textTransform: 'capitalize'
              }}>
                {user.username}
              </div>
              <button
                className="btn btn-danger btn-sm"
                onClick={logoutBrand}
                title="Log out from platform"
                style={{ padding: '6px 12px' }}
              >
                <FiLogOut size={14} /> <span className="hide-mobile">Logout</span>
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
