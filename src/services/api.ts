const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 
  ((import.meta as any).env?.DEV ? 'http://localhost:5000/api' : '/api');

interface User {
  id: string;
  username: string;
  email?: string;
  isAdmin: boolean;
  profilePicture?: string;
  createdAt: string;
  lastLogin?: string;
}

interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

interface ApiResponse<T = any> {
  message: string;
  user?: User;
  token?: string;
  data?: T;
}

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get stored token
  private getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  // Set token
  private setToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  // Remove token
  private removeToken(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAdmin');
  }

  // Make authenticated request
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          // Token expired or invalid
          this.removeToken();
          window.location.href = '/login';
          throw new Error('Authentication failed');
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error or server unavailable');
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.makeRequest('/health');
  }

  // Register user
  async register(userData: {
    username: string;
    email?: string;
    password: string;
  }): Promise<AuthResponse> {
    const response = await this.makeRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    // Store token and user data
    if (response.token) {
      this.setToken(response.token);
      localStorage.setItem('currentUser', JSON.stringify(response.user));
      localStorage.setItem('isAdmin', response.user.isAdmin.toString());
    }

    return response;
  }

  // Login user
  async login(credentials: {
    username: string;
    password: string;
  }): Promise<AuthResponse> {
    const response = await this.makeRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // Store token and user data
    if (response.token) {
      this.setToken(response.token);
      localStorage.setItem('currentUser', JSON.stringify(response.user));
      localStorage.setItem('isAdmin', response.user.isAdmin.toString());
    }

    return response;
  }

  // Get user profile
  async getProfile(): Promise<{ user: User }> {
    return this.makeRequest('/auth/profile');
  }

  // Update user profile
  async updateProfile(profileData: {
    username?: string;
    email?: string;
    profilePicture?: string;
  }): Promise<{ message: string; user: User }> {
    const response = await this.makeRequest<{ message: string; user: User }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });

    // Update stored user data
    if (response.user) {
      localStorage.setItem('currentUser', JSON.stringify(response.user));
      localStorage.setItem('isAdmin', response.user.isAdmin.toString());
    }

    return response;
  }

  // Change password
  async changePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ message: string }> {
    return this.makeRequest('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  }

  // Logout
  async logout(): Promise<{ message: string }> {
    try {
      const response = await this.makeRequest<{ message: string }>('/auth/logout', {
        method: 'POST',
      });
      return response;
    } catch (error) {
      // Even if logout fails on server, clear local data
      console.warn('Logout request failed, but clearing local data anyway');
      return { message: 'Logged out locally' };
    } finally {
      this.removeToken();
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getToken();
    const userData = localStorage.getItem('currentUser');
    return !!(token && userData);
  }

  // Get current user from localStorage (for immediate access)
  getCurrentUser(): User | null {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
        this.removeToken();
        return null;
      }
    }
    return null;
  }

  // Refresh user data from server
  async refreshUserData(): Promise<User | null> {
    if (!this.isAuthenticated()) {
      return null;
    }

    try {
      const response = await this.getProfile();
      localStorage.setItem('currentUser', JSON.stringify(response.user));
      localStorage.setItem('isAdmin', response.user.isAdmin.toString());
      return response.user;
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      this.removeToken();
      return null;
    }
  }

  // Units API Methods

  // Get all units
  async getUnits(): Promise<{ data: any[] }> {
    return this.makeRequest('/units');
  }

  // Get unit by ID
  async getUnit(id: string): Promise<{ data: any }> {
    return this.makeRequest(`/units/${id}`);
  }

  // Add new unit (Admin only)
  async createUnit(unitData: any): Promise<{ message: string; data: any }> {
    return this.makeRequest('/units', {
      method: 'POST',
      body: JSON.stringify(unitData),
    });
  }

  // Update unit (Admin only)
  async updateUnit(id: string, unitData: any): Promise<{ message: string; data: any }> {
    return this.makeRequest(`/units/${id}`, {
      method: 'PUT',
      body: JSON.stringify(unitData),
    });
  }

  // Delete unit (Admin only)
  async deleteUnit(id: string): Promise<{ message: string }> {
    return this.makeRequest(`/units/${id}`, {
      method: 'DELETE',
    });
  }

  // Migrate units from local database to MongoDB (Admin only)
  async migrateUnits(units: any[]): Promise<{ message: string; results: any }> {
    return this.makeRequest('/units/migrate', {
      method: 'POST',
      body: JSON.stringify({ units }),
    });
  }
}

// Create and export singleton instance
export const apiService = new ApiService();
export type { User, AuthResponse, ApiResponse }; 