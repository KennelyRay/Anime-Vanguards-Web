import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Sword, Shield, Star, Gamepad2, Gift, Zap, LogOut, Home, Trophy, ChevronLeft, ChevronRight, LogIn, User } from 'lucide-react'
import { useSidebar } from '../App'
import { apiService } from '../services/api'

interface UserType {
  id: string
  username: string
  email?: string
  createdAt: string
  isAdmin: boolean
  profilePicture?: string
  lastLogin?: string
}

const Navbar = () => {
  const { isCollapsed, setIsCollapsed } = useSidebar()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState<UserType | null>(null)
  const location = useLocation()

  // Function to update user data from localStorage and optionally refresh from server
  const updateUserData = async (refreshFromServer = false) => {
    const adminStatus = localStorage.getItem('isAdmin') === 'true'
    const userJson = localStorage.getItem('currentUser')
    
    if (refreshFromServer && apiService.isAuthenticated()) {
      try {
        const freshUser = await apiService.refreshUserData()
        if (freshUser) {
          setCurrentUser(freshUser)
          setIsAdmin(freshUser.isAdmin)
          setIsLoggedIn(true)
          return
        }
      } catch (error) {
        console.error('Failed to refresh user data:', error)
      }
    }
    
    setIsAdmin(adminStatus)
    setIsLoggedIn(!!userJson)
    
    if (userJson) {
      try {
        const user = JSON.parse(userJson)
        setCurrentUser(user)
      } catch (error) {
        console.error('Error parsing user data:', error)
        setCurrentUser(null)
      }
    } else {
      setCurrentUser(null)
    }
  }

  // Check admin status and user login on mount
  useEffect(() => {
    updateUserData()
  }, [])

  // Listen for storage changes (when user data is updated in other tabs or components)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'currentUser' || e.key === 'isAdmin') {
        updateUserData()
      }
    }

    // Also listen for custom events from the same tab
    const handleCustomStorageChange = () => {
      updateUserData()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('userDataUpdated', handleCustomStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('userDataUpdated', handleCustomStorageChange)
    }
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false)
  }, [location.pathname])

  const baseNavItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Units', path: '/units', icon: Sword },
    { name: 'Tier List', path: '/tier-list', icon: Trophy },
    { name: 'Items', path: '/items', icon: Gift },
    { name: 'Gamemodes', path: '/gamemodes', icon: Gamepad2 },
    { name: 'Codes', path: '/codes', icon: Zap },
    { name: 'Updates', path: '/updates', icon: Star },
  ]

  // Dynamic navigation based on user state
  const getNavItems = () => {
    let items = [...baseNavItems]
    
    if (isLoggedIn) {
      // User is logged in, show Logout
      items.push({ name: 'Logout', path: '#', icon: LogOut })
      
      // If admin, also show Admin Panel
      if (isAdmin) {
        items.push({ name: 'Admin Panel', path: '/admin', icon: Shield })
      }
    } else {
      // User not logged in, show Login
      items.push({ name: 'Login', path: '/login', icon: LogIn })
    }
    
    return items
  }

  const navItems = getNavItems()

  const isActive = (path: string) => location.pathname === path

  const handleAdminLogin = (adminStatus: boolean) => {
    setIsAdmin(adminStatus)
    if (adminStatus) {
      window.location.href = '/admin'
    }
  }

  const handleLogout = async () => {
    try {
      await apiService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsAdmin(false)
      setIsLoggedIn(false)
      setCurrentUser(null)
      window.dispatchEvent(new Event('userDataUpdated'))
      window.location.href = '/'
    }
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.div 
        className={`fixed top-0 left-0 h-full z-40 hidden lg:flex flex-col transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-72'
        }`}
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Sidebar Background */}
        <div className="h-full bg-gradient-to-b from-dark-100/95 via-dark-200/95 to-dark-300/95 backdrop-blur-xl border-r border-primary-500/20 shadow-2xl shadow-primary-500/10">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-primary-500/20">
            <div className="flex items-center justify-between">
              {!isCollapsed ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center space-x-3"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl blur-md opacity-75"></div>
                    <div className="relative bg-gradient-to-r from-primary-600 to-secondary-600 p-2.5 rounded-xl">
                      <Sword className="h-7 w-7 text-white" />
                    </div>
                  </div>
                  <div>
                    <span className="text-lg font-game font-black bg-gradient-to-r from-primary-400 via-secondary-400 to-accent-400 bg-clip-text text-transparent">
                      Anime Vanguards
                    </span>
                    <div className="text-xs font-medium text-gray-400 -mt-1">Ultimate Hub</div>
                  </div>
                </motion.div>
              ) : (
                <div className="mx-auto">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl blur-md opacity-75"></div>
                    <div className="relative bg-gradient-to-r from-primary-600 to-secondary-600 p-2.5 rounded-xl">
                      <Sword className="h-7 w-7 text-white" />
                    </div>
                  </div>
                </div>
              )}
              
              <motion.button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-2 rounded-lg bg-dark-200/50 border border-primary-500/20 text-gray-400 hover:text-white hover:bg-dark-200/70 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </motion.button>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map((item, index) => {
              const Icon = item.icon
              const active = isActive(item.path)
              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  {item.name === 'Logout' ? (
                    <button
                      onClick={handleLogout}
                      className={`group relative flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 w-full text-left ${
                        active
                          ? 'bg-gradient-to-r from-primary-500/20 to-secondary-500/20 text-white border border-primary-500/30'
                          : 'text-gray-300 hover:text-white hover:bg-white/5'
                      }`}
                      title={isCollapsed ? item.name : undefined}
                    >
                      <Icon className={`h-5 w-5 flex-shrink-0 transition-colors duration-300 ${
                        active ? 'text-primary-400' : 'text-gray-400 group-hover:text-primary-400'
                      }`} />
                      
                      {!isCollapsed && (
                        <motion.span 
                          className="font-medium"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          {item.name}
                        </motion.span>
                      )}
                      
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
                    </button>
                  ) : (
                    <Link
                      to={item.path}
                      className={`group relative flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                        active
                          ? 'bg-gradient-to-r from-primary-500/20 to-secondary-500/20 text-white border border-primary-500/30'
                          : 'text-gray-300 hover:text-white hover:bg-white/5'
                      }`}
                      title={isCollapsed ? item.name : undefined}
                    >
                      <Icon className={`h-5 w-5 flex-shrink-0 transition-colors duration-300 ${
                        active ? 'text-primary-400' : 'text-gray-400 group-hover:text-primary-400'
                      }`} />
                      
                      {!isCollapsed && (
                        <motion.span 
                          className="font-medium"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          {item.name}
                        </motion.span>
                      )}
                      
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
                  )}
                </motion.div>
              )
            })}
          </div>

          {/* User Profile Section - Only show if logged in */}
          {isLoggedIn && currentUser && (
            <div className="p-4 border-t border-primary-500/20">
              <Link
                to="/profile"
                className={`group relative flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-primary-600/20 to-secondary-600/20 border border-primary-500/30 text-white rounded-xl hover:from-primary-600/30 hover:to-secondary-600/30 hover:border-primary-400/40 transition-all duration-300 ${
                  isCollapsed ? 'justify-center' : 'w-full'
                }`}
                title={isCollapsed ? `${currentUser.username} Profile` : undefined}
              >
                <div className="relative flex-shrink-0">
                  {currentUser.profilePicture ? (
                    <img
                      src={currentUser.profilePicture}
                      alt={`${currentUser.username}'s profile`}
                      className="w-8 h-8 rounded-full object-cover border-2 border-primary-400/30"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500/30 to-secondary-500/30 border-2 border-primary-400/30 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary-300" />
                    </div>
                  )}
                  {currentUser.isAdmin && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                      <Shield className="h-2.5 w-2.5 text-white" />
                    </div>
                  )}
                </div>
                {!isCollapsed && (
                  <motion.div 
                    className="flex flex-col min-w-0 flex-1"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="font-medium text-white truncate">{currentUser.username}</span>
                    <span className="text-xs text-gray-300 truncate">
                      {currentUser.isAdmin ? 'Administrator' : 'User'}
                    </span>
                  </motion.div>
                )}
              </Link>
            </div>
          )}


        </div>
      </motion.div>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-dark-100/80 backdrop-blur-xl border-b border-primary-500/20 shadow-lg">
        <div className="flex items-center justify-between p-4">
          <Link to="/" className="flex items-center space-x-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl blur-md opacity-75"></div>
              <div className="relative bg-gradient-to-r from-primary-600 to-secondary-600 p-2 rounded-xl">
                <Sword className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <span className="text-lg font-game font-black bg-gradient-to-r from-primary-400 via-secondary-400 to-accent-400 bg-clip-text text-transparent">
                Anime Vanguards
              </span>
              <div className="text-xs font-medium text-gray-400 -mt-1">Ultimate Hub</div>
            </div>
          </Link>
          
          <motion.button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-3 rounded-xl bg-dark-200/50 border border-primary-500/20 text-gray-300 hover:text-white hover:bg-dark-200/70 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <AnimatePresence mode="wait">
              {isMobileOpen ? (
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

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileOpen && (
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
              onClick={() => setIsMobileOpen(false)}
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
                  <div className="flex items-center gap-3">
                    {isLoggedIn && currentUser ? (
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          {currentUser.profilePicture ? (
                            <img
                              src={currentUser.profilePicture}
                              alt={`${currentUser.username}'s profile`}
                              className="w-10 h-10 rounded-full object-cover border-2 border-primary-400/30"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500/30 to-secondary-500/30 border-2 border-primary-400/30 flex items-center justify-center">
                              <User className="h-5 w-5 text-primary-300" />
                            </div>
                          )}
                          {currentUser.isAdmin && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                              <Shield className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h2 className="text-lg font-game font-bold text-white">{currentUser.username}</h2>
                          <p className="text-sm text-gray-400">{currentUser.isAdmin ? 'Administrator' : 'User'}</p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h2 className="text-xl font-game font-bold text-white">Navigation</h2>
                        <p className="text-sm text-gray-400">Anime Vanguards Hub</p>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setIsMobileOpen(false)}
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
                        {item.name === 'Logout' ? (
                          <button
                            onClick={() => {
                              handleLogout()
                              setIsMobileOpen(false)
                            }}
                            className={`flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-300 w-full text-left ${
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
                          </button>
                        ) : (
                          <Link
                            to={item.path}
                            onClick={() => setIsMobileOpen(false)}
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
                        )}
                      </motion.div>
                    )
                  })}
                </div>


              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      

    </>
  )
}

export default Navbar 