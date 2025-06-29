import React, { createContext, useContext, useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { UnitsProvider } from './contexts/UnitsContext'
import { initializeMigration } from './utils/migration'
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
import UnitDetails from './pages/UnitDetails'
import Login from './pages/Login'
import Profile from './pages/Profile'

// Sidebar Context for managing collapse state
interface SidebarContextType {
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export const useSidebar = () => {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider')
  }
  return context
}

const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      {children}
    </SidebarContext.Provider>
  )
}

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

const AppContent = () => {
  const { isCollapsed } = useSidebar()
  
  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="animated-gradient-bg"></div>
        <div className="animated-gradient-overlay"></div>
        <div className="floating-particles"></div>
      </div>
      
      <Navbar />
      
      {/* Main Content Area with Dynamic Sidebar Spacing */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        isCollapsed ? 'lg:ml-20' : 'lg:ml-72'
      }`}>
        {/* Mobile Header Spacing */}
        <div className="lg:hidden h-20"></div>
        
        <main className="flex-1 relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/units" element={<Units />} />
              <Route path="/units/:id" element={<UnitDetails />} />
              <Route path="/tier-list" element={<TierList />} />
              <Route path="/items" element={<Items />} />
              <Route path="/gamemodes" element={<Gamemodes />} />
              <Route path="/codes" element={<Codes />} />
              <Route path="/updates" element={<Updates />} />
              <Route path="/login" element={<Login />} />
              <Route path="/profile" element={<Profile />} />
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
    </div>
  )
}

function App() {
  useEffect(() => {
    // Initialize migration from localStorage to MongoDB on app startup
    initializeMigration().catch(console.error)
  }, [])

  return (
    <ErrorBoundary>
      <UnitsProvider>
        <SidebarProvider>
          <AppContent />
        </SidebarProvider>
      </UnitsProvider>
    </ErrorBoundary>
  )
}

export default App 