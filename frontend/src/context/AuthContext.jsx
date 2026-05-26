import { createContext, useContext, useState, useEffect } from 'react'
import { login as apiLogin, register as apiRegister, getMe } from '../api'
import { useToast } from '../components/ToastProvider'

const AuthContext = createContext(null)

export function useAuth() {
  return useContext(AuthContext)
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('ibtso_token'))
  const [loading, setLoading] = useState(true)
  const toast = useToast()

  useEffect(() => {
    async function verifyToken() {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const profile = await getMe()
        setUser(profile)
      } catch (err) {
        console.error('Failed to verify token:', err)
        // Token is invalid or expired
        localStorage.removeItem('ibtso_token')
        setToken(null)
        setUser(null)
        toast('Session expired. Please log in again.', 'error')
      } finally {
        setLoading(false)
      }
    }

    verifyToken()
  }, [token, toast])

  const loginBrand = async (email, password) => {
    try {
      const data = await apiLogin(email, password)
      localStorage.setItem('ibtso_token', data.token)
      setToken(data.token)
      setUser(data.user)
      toast(`Welcome back, ${data.user.username}!`, 'success')
      return true
    } catch (err) {
      toast(err.message || 'Login failed. Please check credentials.', 'error')
      return false
    }
  };

  const registerBrand = async (username, email, password) => {
    try {
      const data = await apiRegister(username, email, password)
      localStorage.setItem('ibtso_token', data.token)
      setToken(data.token)
      setUser(data.user)
      toast(`Registration successful! Welcome to IBTSO, ${data.user.username}.`, 'success')
      return true
    } catch (err) {
      toast(err.message || 'Registration failed.', 'error')
      return false
    }
  };

  const logoutBrand = () => {
    localStorage.removeItem('ibtso_token')
    setToken(null)
    setUser(null)
    toast('Logged out successfully.', 'success')
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, loginBrand, registerBrand, logoutBrand }}>
      {children}
    </AuthContext.Provider>
  )
}
