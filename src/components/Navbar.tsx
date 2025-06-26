import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Sword, Shield, Star, Gamepad2, Gift, Zap, LogOut, Home, Trophy } from 'lucide-react'
import AdminLogin from './AdminLogin'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  // Check admin status on mount
  useEffect(() => {
    const adminStatus = localStorage.getItem('isAdmin') === 'true'
    setIsAdmin(adminStatus)
  }, [])

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Units', path: '/units', icon: Sword },
    { name: 'Tier List', path: '/tier-list', icon: Trophy },
    { name: 'Items', path: '/items', icon: Gift },
    { name: 'Gamemodes', path: '/gamemodes', icon: Gamepad2 },
    { name: 'Codes', path: '/codes', icon: Zap },
    { name: 'Updates', path: '/updates', icon: Star },
  ]

  const isActive = (path: string) => location.pathname === path

  const handleAdminLogin = (adminStatus: boolean) => {
    setIsAdmin(adminStatus)
    if (adminStatus) {
      // Redirect to admin panel after login
      window.location.href = '/admin'
    }
  }

  const handleAdminLogout = () => {
    localStorage.removeItem('isAdmin')
    setIsAdmin(false)
    window.location.href = '/'
  }

  return (
    <>
      <motion.nav 
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
          scrolled 
            ? 'bg-dark-100/80 backdrop-blur-xl border-b border-primary-500/20 shadow-lg shadow-primary-500/10' 
            : 'bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl blur-md opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative bg-gradient-to-r from-primary-600 to-secondary-600 p-2.5 rounded-xl">
                    <Sword className="h-7 w-7 text-white" />
                  </div>
                </div>
                <div>
                  <span className="text-2xl font-game font-black bg-gradient-to-r from-primary-400 via-secondary-400 to-accent-400 bg-clip-text text-transparent">
                    Anime Vanguards
                  </span>
                  <div className="text-xs font-medium text-gray-400 -mt-1">Ultimate Hub</div>
                </div>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navItems.map((item, index) => {
                const Icon = item.icon
                const active = isActive(item.path)
                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                  >
                    <Link
                      to={item.path}
                      className={`group relative flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-300 ${
                        active
                          ? 'bg-gradient-to-r from-primary-500/20 to-secondary-500/20 text-white border border-primary-500/30'
                          : 'text-gray-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon className={`h-4 w-4 transition-colors duration-300 ${
                        active ? 'text-primary-400' : 'text-gray-400 group-hover:text-primary-400'
                      }`} />
                      <span className="font-medium text-sm">{item.name}</span>
                      
                      {/* Active indicator */}
                      {active && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 rounded-xl"
                          layoutId="activeTab"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                      
                      {/* Hover glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-primary-500/0 to-secondary-500/0 group-hover:from-primary-500/10 group-hover:to-secondary-500/10 rounded-xl transition-all duration-300" />
                    </Link>
                  </motion.div>
                )
              })}
              
              {/* Admin Controls */}
              <div className="ml-4 pl-4 border-l border-gray-700">
                {!isAdmin ? (
                  <motion.button
                    onClick={() => setIsAdminLoginOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-500/30 text-purple-300 rounded-xl hover:from-purple-600/30 hover:to-indigo-600/30 hover:border-purple-400/40 transition-all duration-300 group"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Shield className="h-4 w-4 group-hover:text-purple-200 transition-colors" />
                    <span className="font-medium text-sm">Admin</span>
                  </motion.button>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link to="/admin">
                      <motion.button
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 group ${
                          isActive('/admin')
                            ? 'bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 text-white'
                            : 'bg-gradient-to-r from-red-600/20 to-orange-600/20 border border-red-500/30 text-red-300 hover:from-red-600/30 hover:to-orange-600/30 hover:border-red-400/40'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Shield className="h-4 w-4 group-hover:text-red-200 transition-colors" />
                        <span className="font-medium text-sm">Admin Panel</span>
                      </motion.button>
                    </Link>
                    <motion.button
                      onClick={handleAdminLogout}
                      className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600/20 to-orange-600/20 border border-red-500/30 text-red-300 rounded-xl hover:from-red-600/30 hover:to-orange-600/30 hover:border-red-400/40 transition-all duration-300 group"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <LogOut className="h-4 w-4 group-hover:text-red-200 transition-colors" />
                      <span className="font-medium text-sm">Logout</span>
                    </motion.button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="p-3 rounded-xl bg-dark-200/50 border border-primary-500/20 text-gray-300 hover:text-white hover:bg-dark-200/70 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <AnimatePresence mode="wait">
                  {isOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="h-6 w-6" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="h-6 w-6" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-30 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            
            {/* Mobile menu panel */}
            <motion.div
              className="relative w-full max-w-sm ml-auto h-full bg-dark-100/95 backdrop-blur-xl border-l border-primary-500/20 shadow-2xl"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="p-6 space-y-6">
                {/* Mobile Header */}
                <div className="flex items-center justify-between pb-6 border-b border-primary-500/20">
                  <div>
                    <h2 className="text-xl font-game font-bold text-white">Navigation</h2>
                    <p className="text-sm text-gray-400">Anime Vanguards Hub</p>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-lg bg-dark-200/50 text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Mobile Navigation Items */}
                <div className="space-y-2">
                  {navItems.map((item, index) => {
                    const Icon = item.icon
                    const active = isActive(item.path)
                    return (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.3 }}
                      >
                        <Link
                          to={item.path}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-300 ${
                            active
                              ? 'bg-gradient-to-r from-primary-500/20 to-secondary-500/20 text-white border border-primary-500/30'
                              : 'text-gray-300 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <Icon className={`h-5 w-5 ${
                            active ? 'text-primary-400' : 'text-gray-400'
                          }`} />
                          <span className="font-medium">{item.name}</span>
                          {active && (
                            <div className="ml-auto w-2 h-2 bg-primary-400 rounded-full" />
                          )}
                        </Link>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Mobile Admin Controls */}
                <div className="pt-6 border-t border-primary-500/20 space-y-2">
                  {!isAdmin ? (
                    <motion.button
                      onClick={() => {
                        setIsAdminLoginOpen(true)
                        setIsOpen(false)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3.5 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-500/30 text-purple-300 rounded-xl hover:from-purple-600/30 hover:to-indigo-600/30 transition-all duration-300"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.3 }}
                    >
                      <Shield className="h-5 w-5" />
                      <span className="font-medium">Admin Login</span>
                    </motion.button>
                  ) : (
                    <>
                      <Link to="/admin" onClick={() => setIsOpen(false)}>
                        <motion.button
                          className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 ${
                            isActive('/admin')
                              ? 'bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 text-white'
                              : 'bg-gradient-to-r from-red-600/20 to-orange-600/20 border border-red-500/30 text-red-300 hover:from-red-600/30 hover:to-orange-600/30'
                          }`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4, duration: 0.3 }}
                        >
                          <Shield className="h-5 w-5" />
                          <span className="font-medium">Admin Panel</span>
                          {isActive('/admin') && (
                            <div className="ml-auto w-2 h-2 bg-red-400 rounded-full" />
                          )}
                        </motion.button>
                      </Link>
                      <motion.button
                        onClick={() => {
                          handleAdminLogout()
                          setIsOpen(false)
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3.5 bg-gradient-to-r from-red-600/20 to-orange-600/20 border border-red-500/30 text-red-300 rounded-xl hover:from-red-600/30 hover:to-orange-600/30 transition-all duration-300"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.3 }}
                      >
                        <LogOut className="h-5 w-5" />
                        <span className="font-medium">Admin Logout</span>
                      </motion.button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Admin Login Modal */}
      <AdminLogin
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLogin={handleAdminLogin}
      />
    </>
  )
}

export default Navbar 