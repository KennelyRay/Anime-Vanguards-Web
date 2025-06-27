import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Lock, Camera, Save, Eye, EyeOff, ArrowLeft, Shield, Calendar, LogOut } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

interface UserType {
  id: string
  username: string
  password: string
  email?: string
  createdAt: string
  isAdmin: boolean
  profilePicture?: string
}

const Profile = () => {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  // Form states
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [profilePicture, setProfilePicture] = useState('')

  // Active section state
  const [activeSection, setActiveSection] = useState<'basic' | 'security' | 'picture'>('basic')

  useEffect(() => {
    // Get current user from localStorage
    const userJson = localStorage.getItem('currentUser')
    if (userJson) {
      try {
        const user = JSON.parse(userJson)
        setCurrentUser(user)
        setUsername(user.username)
        setEmail(user.email || '')
        setProfilePicture(user.profilePicture || '')
      } catch (error) {
        console.error('Error parsing user data:', error)
        navigate('/login')
      }
    } else {
      // No user logged in, redirect to login
      navigate('/login')
    }
  }, [navigate])

  const handleUpdateBasicInfo = async () => {
    if (!currentUser) return

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // In a real app, this would be an API call
      const updatedUser = {
        ...currentUser,
        username: username.trim(),
        email: email.trim() || undefined,
        profilePicture: profilePicture.trim() || undefined
      }

      // Update localStorage
      localStorage.setItem('currentUser', JSON.stringify(updatedUser))
      setCurrentUser(updatedUser)
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event('userDataUpdated'))
      
      setSuccess('Profile updated successfully!')
    } catch (error) {
      setError('Failed to update profile')
    }

    setIsLoading(false)
  }

  const handleChangePassword = async () => {
    if (!currentUser) return

    setIsLoading(true)
    setError('')
    setSuccess('')

    if (!currentPassword) {
      setError('Current password is required')
      setIsLoading(false)
      return
    }

    if (currentPassword !== currentUser.password) {
      setError('Current password is incorrect')
      setIsLoading(false)
      return
    }

    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters')
      setIsLoading(false)
      return
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match')
      setIsLoading(false)
      return
    }

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // In a real app, this would be an API call
      const updatedUser = {
        ...currentUser,
        password: newPassword
      }

      // Update localStorage
      localStorage.setItem('currentUser', JSON.stringify(updatedUser))
      setCurrentUser(updatedUser)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setSuccess('Password changed successfully!')
    } catch (error) {
      setError('Failed to change password')
    }

    setIsLoading(false)
  }

  const handleProfilePictureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setProfilePicture(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('isAdmin')
    localStorage.removeItem('currentUser')
    navigate('/')
    window.location.reload()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/"
            className="flex items-center gap-2 px-4 py-2 bg-dark-200/50 backdrop-blur-xl border border-primary-500/20 text-gray-300 hover:text-white hover:bg-dark-200/70 rounded-lg transition-all duration-300 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Home</span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600/20 border border-red-500/30 text-red-300 hover:bg-red-600/30 rounded-lg transition-all duration-300"
          >
            <LogOut className="h-4 w-4" />
            <span className="font-medium">Logout</span>
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-game font-black bg-gradient-to-r from-primary-400 via-secondary-400 to-accent-400 bg-clip-text text-transparent mb-2">
            My Profile
          </h1>
          <p className="text-gray-400">Manage your account settings and preferences</p>
        </motion.div>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <motion.div
              className="bg-gradient-to-br from-dark-100/80 to-dark-200/80 backdrop-blur-xl border border-primary-500/20 rounded-2xl p-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {/* Profile Preview */}
              <div className="text-center mb-6 pb-6 border-b border-primary-500/20">
                <div className="relative w-20 h-20 mx-auto mb-4">
                  {profilePicture ? (
                    <img
                      src={profilePicture}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover border-2 border-primary-500/30"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-primary-500/20 to-secondary-500/20 border-2 border-primary-500/30 flex items-center justify-center">
                      <User className="h-8 w-8 text-primary-400" />
                    </div>
                  )}
                  {currentUser.isAdmin && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                      <Shield className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-white">{currentUser.username}</h3>
                <p className="text-sm text-gray-400">{currentUser.email || 'No email'}</p>
                {currentUser.isAdmin && (
                  <span className="inline-block mt-2 px-2 py-1 bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-xs rounded-full">
                    Admin
                  </span>
                )}
              </div>

              {/* Navigation Menu */}
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveSection('basic')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    activeSection === 'basic'
                      ? 'bg-gradient-to-r from-primary-500/20 to-secondary-500/20 text-white border border-primary-500/30'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <User className="h-4 w-4" />
                  <span className="font-medium">Basic Info</span>
                </button>
                <button
                  onClick={() => setActiveSection('picture')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    activeSection === 'picture'
                      ? 'bg-gradient-to-r from-primary-500/20 to-secondary-500/20 text-white border border-primary-500/30'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Camera className="h-4 w-4" />
                  <span className="font-medium">Profile Picture</span>
                </button>
                <button
                  onClick={() => setActiveSection('security')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    activeSection === 'security'
                      ? 'bg-gradient-to-r from-primary-500/20 to-secondary-500/20 text-white border border-primary-500/30'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Lock className="h-4 w-4" />
                  <span className="font-medium">Security</span>
                </button>
              </nav>

              {/* Account Info */}
              <div className="mt-6 pt-6 border-t border-primary-500/20">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {formatDate(currentUser.createdAt)}</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <motion.div
              className="bg-gradient-to-br from-dark-100/80 to-dark-200/80 backdrop-blur-xl border border-primary-500/20 rounded-2xl p-8"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {/* Basic Info Section */}
              {activeSection === 'basic' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Basic Information</h2>
                  
                  <div className="space-y-6">
                    {/* Username */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Username
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-dark-200/50 border border-primary-500/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400/20 transition-all duration-300"
                          placeholder="Enter username"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-dark-200/50 border border-primary-500/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400/20 transition-all duration-300"
                          placeholder="Enter email address"
                        />
                      </div>
                    </div>

                    {/* Save Button */}
                    <motion.button
                      onClick={handleUpdateBasicInfo}
                      disabled={isLoading}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-medium rounded-xl transition-all duration-300 disabled:opacity-50"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Save className="h-4 w-4" />
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </motion.button>
                  </div>
                </div>
              )}

              {/* Profile Picture Section */}
              {activeSection === 'picture' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Profile Picture</h2>
                  
                  <div className="space-y-6">
                    {/* Current Picture */}
                    <div className="text-center">
                      <div className="relative w-32 h-32 mx-auto mb-4">
                        {profilePicture ? (
                          <img
                            src={profilePicture}
                            alt="Profile"
                            className="w-full h-full rounded-full object-cover border-4 border-primary-500/30"
                          />
                        ) : (
                          <div className="w-full h-full rounded-full bg-gradient-to-br from-primary-500/20 to-secondary-500/20 border-4 border-primary-500/30 flex items-center justify-center">
                            <User className="h-16 w-16 text-primary-400" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Upload Button */}
                    <div>
                      <label className="block">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProfilePictureUpload}
                          className="hidden"
                        />
                        <div className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-500/30 text-purple-300 rounded-xl hover:from-purple-600/30 hover:to-indigo-600/30 cursor-pointer transition-all duration-300">
                          <Camera className="h-4 w-4" />
                          <span className="font-medium">Upload Picture</span>
                        </div>
                      </label>
                    </div>

                    {/* Remove Picture */}
                    {profilePicture && (
                      <motion.button
                        onClick={() => setProfilePicture('')}
                        className="w-full px-6 py-3 bg-red-600/20 border border-red-500/30 text-red-300 rounded-xl hover:bg-red-600/30 transition-all duration-300"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Remove Picture
                      </motion.button>
                    )}

                    {/* Save Button */}
                    <motion.button
                      onClick={handleUpdateBasicInfo}
                      disabled={isLoading}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-medium rounded-xl transition-all duration-300 disabled:opacity-50"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Save className="h-4 w-4" />
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </motion.button>
                  </div>
                </div>
              )}

              {/* Security Section */}
              {activeSection === 'security' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Change Password</h2>
                  
                  <div className="space-y-6">
                    {/* Current Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full pl-10 pr-12 py-3 bg-dark-200/50 border border-primary-500/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400/20 transition-all duration-300"
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                        >
                          {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full pl-10 pr-12 py-3 bg-dark-200/50 border border-primary-500/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400/20 transition-all duration-300"
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                        >
                          {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm New Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full pl-10 pr-12 py-3 bg-dark-200/50 border border-primary-500/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400/20 transition-all duration-300"
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                        >
                          {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Change Password Button */}
                    <motion.button
                      onClick={handleChangePassword}
                      disabled={isLoading}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium rounded-xl transition-all duration-300 disabled:opacity-50"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Lock className="h-4 w-4" />
                      {isLoading ? 'Changing...' : 'Change Password'}
                    </motion.button>
                  </div>
                </div>
              )}

              {/* Error/Success Messages */}
              {error && (
                <motion.div
                  className="mt-6 bg-red-500/20 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {error}
                </motion.div>
              )}

              {success && (
                <motion.div
                  className="mt-6 bg-green-500/20 border border-green-500/30 rounded-xl p-4 text-green-400 text-sm"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {success}
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
