export interface User {
  id: string
  username: string
  password: string
  email?: string
  createdAt: string
  isAdmin: boolean
}

export interface CreateUserData {
  username: string
  password: string
  email?: string
}

export interface LoginCredentials {
  username: string
  password: string
}

class UserDatabase {
  private readonly STORAGE_KEY = 'anime_vanguards_users'
  private readonly ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
  }

  constructor() {
    // Initialize with admin user if database is empty
    this.initializeAdminUser()
  }

  private initializeAdminUser(): void {
    const users = this.getAllUsers()
    const adminExists = users.some(user => user.username === this.ADMIN_CREDENTIALS.username)
    
    if (!adminExists) {
      const adminUser: User = {
        id: 'admin-' + Date.now(),
        username: this.ADMIN_CREDENTIALS.username,
        password: this.ADMIN_CREDENTIALS.password,
        createdAt: new Date().toISOString(),
        isAdmin: true
      }
      this.saveUser(adminUser)
    }
  }

  private getAllUsers(): User[] {
    try {
      const usersJson = localStorage.getItem(this.STORAGE_KEY)
      return usersJson ? JSON.parse(usersJson) : []
    } catch (error) {
      console.error('Error reading users from localStorage:', error)
      return []
    }
  }

  private saveUsers(users: User[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users))
    } catch (error) {
      console.error('Error saving users to localStorage:', error)
      throw new Error('Failed to save user data')
    }
  }

  private saveUser(user: User): void {
    const users = this.getAllUsers()
    const existingIndex = users.findIndex(u => u.id === user.id)
    
    if (existingIndex >= 0) {
      users[existingIndex] = user
    } else {
      users.push(user)
    }
    
    this.saveUsers(users)
  }

  private generateUserId(): string {
    return 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
  }

  private validateUsername(username: string): { isValid: boolean; error?: string } {
    if (!username || username.trim().length === 0) {
      return { isValid: false, error: 'Username is required' }
    }
    
    if (username.length < 3) {
      return { isValid: false, error: 'Username must be at least 3 characters' }
    }
    
    if (username.length > 20) {
      return { isValid: false, error: 'Username must be less than 20 characters' }
    }
    
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return { isValid: false, error: 'Username can only contain letters, numbers, hyphens, and underscores' }
    }
    
    return { isValid: true }
  }

  private validatePassword(password: string): { isValid: boolean; error?: string } {
    if (!password) {
      return { isValid: false, error: 'Password is required' }
    }
    
    if (password.length < 6) {
      return { isValid: false, error: 'Password must be at least 6 characters' }
    }
    
    if (password.length > 50) {
      return { isValid: false, error: 'Password must be less than 50 characters' }
    }
    
    return { isValid: true }
  }

  public userExists(username: string): boolean {
    const users = this.getAllUsers()
    return users.some(user => user.username.toLowerCase() === username.toLowerCase())
  }

  public createUser(userData: CreateUserData): { success: boolean; error?: string; user?: User } {
    try {
      // Validate username
      const usernameValidation = this.validateUsername(userData.username)
      if (!usernameValidation.isValid) {
        return { success: false, error: usernameValidation.error }
      }

      // Validate password
      const passwordValidation = this.validatePassword(userData.password)
      if (!passwordValidation.isValid) {
        return { success: false, error: passwordValidation.error }
      }

      // Check if username already exists
      if (this.userExists(userData.username)) {
        return { success: false, error: 'Username already exists' }
      }

      // Create new user
      const newUser: User = {
        id: this.generateUserId(),
        username: userData.username.trim(),
        password: userData.password, // In production, this should be hashed
        email: userData.email?.trim(),
        createdAt: new Date().toISOString(),
        isAdmin: false
      }

      this.saveUser(newUser)
      
      return { success: true, user: newUser }
    } catch (error) {
      console.error('Error creating user:', error)
      return { success: false, error: 'Failed to create user account' }
    }
  }

  public authenticateUser(credentials: LoginCredentials): { 
    success: boolean; 
    error?: string; 
    user?: User 
  } {
    try {
      const users = this.getAllUsers()
      const user = users.find(u => 
        u.username.toLowerCase() === credentials.username.toLowerCase() &&
        u.password === credentials.password
      )

      if (!user) {
        return { success: false, error: 'Invalid username or password' }
      }

      return { success: true, user }
    } catch (error) {
      console.error('Error authenticating user:', error)
      return { success: false, error: 'Authentication failed' }
    }
  }

  public getUserById(id: string): User | null {
    const users = this.getAllUsers()
    return users.find(user => user.id === id) || null
  }

  public getUserByUsername(username: string): User | null {
    const users = this.getAllUsers()
    return users.find(user => user.username.toLowerCase() === username.toLowerCase()) || null
  }

  public getUserStats(): { totalUsers: number; adminUsers: number; regularUsers: number } {
    const users = this.getAllUsers()
    return {
      totalUsers: users.length,
      adminUsers: users.filter(u => u.isAdmin).length,
      regularUsers: users.filter(u => !u.isAdmin).length
    }
  }

  public getAllUsernames(): string[] {
    const users = this.getAllUsers()
    return users.map(user => user.username)
  }

  // Development/Admin helper methods
  public clearAllUsers(): void {
    localStorage.removeItem(this.STORAGE_KEY)
    this.initializeAdminUser()
  }

  public exportUsers(): User[] {
    return this.getAllUsers()
  }
}

// Create and export a singleton instance
export const userDatabase = new UserDatabase()

// Helper functions for easier usage
export const createUser = (userData: CreateUserData) => userDatabase.createUser(userData)
export const authenticateUser = (credentials: LoginCredentials) => userDatabase.authenticateUser(credentials)
export const userExists = (username: string) => userDatabase.userExists(username)
export const getUserStats = () => userDatabase.getUserStats() 