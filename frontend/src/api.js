// Centralised API client for all Flask REST calls.
// The Vite proxy forwards /api/* and /static/* to http://127.0.0.1:5000

const BASE = import.meta.env.VITE_API_URL || '/api'

async function request(path, options = {}) {
  const token = localStorage.getItem('ibtso_token')
  const headers = { ...options.headers }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers
  })

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('ibtso_token')
      const path = window.location.pathname
      if (!path.startsWith('/asset/') && !path.startsWith('/product/') && path !== '/login' && path !== '/register') {
        window.location.href = '/login'
      }
    }
    let err
    try { err = await res.json() } catch { err = { error: res.statusText } }
    throw new Error(err.error || `Request failed: ${res.status}`)
  }
  return res.json()
}

// ── Authentication ──────────────────────────────────────────
export const login = (email, password) =>
  request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })

export const register = (username, email, password) =>
  request('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password })
  })

export const getMe = () => request('/auth/me')

// ── Dashboard ──────────────────────────────────────────────
export const getDashboard = () => request('/dashboard')

// ── Assets ────────────────────────────────────────────────
export const getAssets   = () => request('/assets')
export const getAsset    = (id) => request(`/assets/${id}`)

export const createAsset = (formData) =>
  request('/assets', { method: 'POST', body: formData })

export const deleteAsset = (id) =>
  request(`/assets/${id}`, { method: 'DELETE' })

// Customer scan — RECORDS the scan event
export const getAssetScan = (id) => request(`/assets/${id}/scan`)

// Admin test scan via AJAX (increments count intentionally for testing)
export const simulateScan = (id) =>
  request(`/assets/${id}/simulate-scan`, { method: 'POST' })

export const regenerateQr = (id, hostUrl) =>
  request(`/assets/${id}/regenerate-qr`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ host_url: hostUrl }),
  })

export const regenerateAllQrs = (hostUrl) =>
  request('/regenerate-all-qrs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ host_url: hostUrl }),
  })

// ── Products ──────────────────────────────────────────────
export const getProduct    = (id) => request(`/products/${id}`)

export const createProduct = (formData) =>
  request('/products', { method: 'POST', body: formData })

export const deleteProduct = (id) =>
  request(`/products/${id}`, { method: 'DELETE' })
