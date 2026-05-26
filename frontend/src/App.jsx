import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard.jsx'
import AddAsset from './pages/AddAsset.jsx'
import AddProduct from './pages/AddProduct.jsx'
import AssetView from './pages/AssetView.jsx'
import ProductDetail from './pages/ProductDetail.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import ToastProvider from './components/ToastProvider.jsx'
import AuthProvider from './context/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Routes>
          {/* Brand Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/add-asset" element={
            <ProtectedRoute>
              <AddAsset />
            </ProtectedRoute>
          } />
          <Route path="/add-product" element={
            <ProtectedRoute>
              <AddProduct />
            </ProtectedRoute>
          } />
          <Route path="/add-product/:assetId" element={
            <ProtectedRoute>
              <AddProduct />
            </ProtectedRoute>
          } />

          {/* Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Public Customer Scan Routes */}
          <Route path="/asset/:id"      element={<AssetView />} />
          <Route path="/product/:id"    element={<ProductDetail />} />
        </Routes>
      </AuthProvider>
    </ToastProvider>
  )
}
