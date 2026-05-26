import { motion } from 'framer-motion'

export default function StatCard({ icon, label, value, color = '#6366f1', delay = 0 }) {
  return (
    <motion.div
      className="glass"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}
    >
      {/* Background glow blob */}
      <div style={{
        position: 'absolute', top: -20, right: -20,
        width: 100, height: 100, borderRadius: '50%',
        background: color,
        opacity: 0.07,
        filter: 'blur(30px)',
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
            {label}
          </p>
          <motion.p
            key={value}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            style={{ fontSize: '2.4rem', fontWeight: 800, lineHeight: 1, color: 'var(--text)', letterSpacing: '-0.03em' }}
          >
            {value ?? '—'}
          </motion.p>
        </div>
        <div style={{
          width: 46, height: 46, borderRadius: 12,
          background: `${color}18`,
          border: `1px solid ${color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: color, fontSize: 20, flexShrink: 0,
        }}>
          {icon}
        </div>
      </div>
    </motion.div>
  )
}
