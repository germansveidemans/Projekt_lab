import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
import Users from './pages/Users'
import Cars from './pages/Cars'
import Clients from './pages/Clients'
import Orders from './pages/Orders'
import WorkAreas from './pages/WorkAreas'
import RoutesPage from './pages/Routes'
import Optimize from './pages/Optimize'
import './styles.css'

console.log('🚀 Main.jsx loaded')

const root = createRoot(document.getElementById('root'))

console.log('📦 Rendering React app...')

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
        <div style={{ padding: '20px' }}>
          <Routes>
            <Route path="/" element={<Users />} />
            <Route path="/cars" element={<Cars />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/work-areas" element={<WorkAreas />} />
            <Route path="/routes" element={<RoutesPage />} />
            <Route path="/optimize" element={<Optimize />} />
          </Routes>
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
)

console.log('✅ React app rendered')
