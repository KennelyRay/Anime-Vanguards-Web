import { useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, User, Eye, EyeOff, Shield, ArrowLeft, UserPlus, LogIn, Mail } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { createUser, authenticateUser, userExists } from '../utils/userDatabase'

const Login = () => {
  const [isSignup, setIsSignup] = useState(false)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    try {
      const authResult = authenticateUser({ username, password })
      
      if (authResult.success && authResult.user) {
        if (authResult.user.isAdmin) {
          localStorage.setItem('isAdmin', 'true')
          localStorage.setItem('currentUser', JSON.stringify(authResult.user))
          setSuccess('Admin login successful! Redirecting to admin panel...')
          setTimeout(() => {
            navigate('/admin')
            window.location.reload() // Refresh to update navbar state
          }, 1500)
        } else {
          localStorage.setItem('currentUser', JSON.stringify(authResult.user))
          setSuccess('Login successful! Redirecting to home...')
          setTimeout(() => {
            navigate('/')
            window.location.reload() // Refresh to update navbar state
          }, 1500)
        }
      } else {
        setError(authResult.error || 'Login failed')
      }
    } catch (error) {
      setError('An unexpected error occurred')
    }
    
    setIsLoading(false)
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    try {
      const createResult = createUser({ 
        username, 
        password, 
        email: email || undefined 
      })
      
      if (createResult.success) {
        setSuccess('Account created successfully! You can now login with your credentials.')
        setIsSignup(false)
        setUsername('')
        setEmail('')
        setPassword('')
        setConfirmPassword('')
      } else {
        setError(createResult.error || 'Failed to create account')
      }
    } catch (error) {
      setError('An unexpected error occurred')
    }
    
    setIsLoading(false)
  }

  const resetForm = () => {
    setUsername('')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setError('')
    setSuccess('')
    setShowPassword(false)
    setShowConfirmPassword(false)
  }

  const toggleMode = () => {
    setIsSignup(!isSignup)
    resetForm()
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Back to Home Button */}
      <Link
        to="/"
        className="absolute top-8 left-8 z-10 flex items-center gap-2 px-4 py-2 bg-dark-200/50 backdrop-blur-xl border border-primary-500/20 text-gray-300 hover:text-white hover:bg-dark-200/70 rounded-lg transition-all duration-300 group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">Back to Home</span>
      </Link>

      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            className="bg-gradient-to-r from-primary-500/20 to-secondary-500/20 border border-primary-500/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            {isSignup ? (
              <UserPlus className="h-10 w-10 text-primary-400" />
            ) : (
              <LogIn className="h-10 w-10 text-primary-400" />
            )}
          </motion.div>
          <h1 className="text-4xl font-game font-black bg-gradient-to-r from-primary-400 via-secondary-400 to-accent-400 bg-clip-text text-transparent mb-2">
            {isSignup ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-gray-400">
            {isSignup 
              ? 'Join the Anime Vanguards community' 
              : 'Sign in to your account'
            }
          </p>
        </div>

        {/* Form Card */}
        <motion.div
          className="bg-gradient-to-br from-dark-100/80 to-dark-200/80 backdrop-blur-xl border border-primary-500/20 rounded-2xl p-8 shadow-2xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <form onSubmit={isSignup ? handleSignup : handleLogin} className="space-y-6">
            {/* Username Field */}
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
                  required
                />
              </div>
            </div>

            {/* Email Field (Signup only) */}
            {isSignup && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email <span className="text-gray-500">(optional)</span>
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
            )}

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-dark-200/50 border border-primary-500/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400/20 transition-all duration-300"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field (Signup only) */}
            {isSignup && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-dark-200/50 border border-primary-500/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400/20 transition-all duration-300"
                    placeholder="Confirm password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <motion.div
                className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
              </motion.div>
            )}

            {/* Success Message */}
            {success && (
              <motion.div
                className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 text-green-400 text-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {success}
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-medium rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/25"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading 
                ? (isSignup ? 'Creating Account...' : 'Logging in...') 
                : (isSignup ? 'Create Account' : 'Login')
              }
            </motion.button>
          </form>

          {/* Toggle Mode */}
          <div className="mt-6 pt-6 border-t border-primary-500/20 text-center">
            <p className="text-gray-400 text-sm mb-3">
              {isSignup ? 'Already have an account?' : "Don't have an account?"}
            </p>
            <button
              onClick={toggleMode}
              className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
            >
              {isSignup ? 'Login here' : 'Sign up here'}
            </button>
          </div>

          {/* Demo Information (Login only) */}
          {!isSignup && (
            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <p className="text-blue-400 text-xs text-center mb-2">
                <strong>Getting Started:</strong>
              </p>
              <p className="text-blue-300 text-xs text-center mb-1">
                • Create an account using the signup form above
              </p>
              <p className="text-blue-300 text-xs text-center">
                • Admin access: <strong>admin / admin123</strong>
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Login 