import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { UnitsProvider } from './contexts/UnitsContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Units from './pages/Units'
import TierList from './pages/TierList'
import Items from './pages/Items'
import Gamemodes from './pages/Gamemodes'
import Codes from './pages/Codes'
import Updates from './pages/Updates'
import AdminPanel from './pages/AdminPanel'

// Protected Route Component for Admin
const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAdmin = localStorage.getItem('isAdmin') === 'true'
  
  if (!isAdmin) {
    return <Navigate to="/" replace />
  }
  
  return <>{children}</>
}

// Simple Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-dark-200">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Something went wrong</h1>
            <p className="text-gray-400 mb-6">Please refresh the page to continue</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

function App() {
  return (
    <ErrorBoundary>
      <UnitsProvider>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          
          <main className="flex-1">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/units" element={<Units />} />
                <Route path="/tier-list" element={<TierList />} />
                <Route path="/items" element={<Items />} />
                <Route path="/gamemodes" element={<Gamemodes />} />
                <Route path="/codes" element={<Codes />} />
                <Route path="/updates" element={<Updates />} />
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedAdminRoute>
                      <AdminPanel />
                    </ProtectedAdminRoute>
                  } 
                />
              </Routes>
            </motion.div>
          </main>
          
          <Footer />
        </div>
      </UnitsProvider>
    </ErrorBoundary>
  )
}

export default App 