import { apiService } from '../services/api';
import { unitsDatabase } from '../data/unitsDatabase';

// Migration utility to help transition from localStorage to MongoDB
export const migrateUserData = async (): Promise<boolean> => {
  try {
    // Check if user is already authenticated with the new system
    if (apiService.isAuthenticated()) {
      console.log('User already authenticated with MongoDB backend');
      return true;
    }

    // Check for old localStorage data
    const oldUserData = localStorage.getItem('currentUser');
    if (!oldUserData) {
      console.log('No old user data found to migrate');
      return false;
    }

    console.log('Found old localStorage user data - migration needed');
    console.log('Please create a new account as data structure has changed');
    
    // Clear old data to prevent conflicts
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAdmin');
    
    // Dispatch event to update UI
    window.dispatchEvent(new Event('userDataUpdated'));
    
    return false;
  } catch (error) {
    console.error('Migration error:', error);
    return false;
  }
};

// Clean up any old localStorage data
export const cleanupOldData = (): void => {
  // Remove old localStorage keys that are no longer needed
  const oldKeys = ['userData', 'users', 'adminStatus'];
  
  oldKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      console.log(`Cleaned up old localStorage key: ${key}`);
    }
  });
};

// Initialize the migration process
export const initializeMigration = async (): Promise<void> => {
  try {
    cleanupOldData();
    
    // If no auth token, try to migrate
    if (!apiService.isAuthenticated()) {
      await migrateUserData();
    }
  } catch (error) {
    console.error('Failed to initialize migration:', error);
  }
};

export const migrateUnitsToMongoDB = async (): Promise<{ success: boolean; results?: any; error?: string }> => {
  try {
    console.log('Starting migration of', unitsDatabase.length, 'units to MongoDB...');
    
    // Filter to only base units to avoid duplicates
    const baseUnits = unitsDatabase.filter(unit => unit.isBaseForm === true || unit.isBaseForm === undefined);
    
    console.log('Migrating', baseUnits.length, 'base units to MongoDB...');
    
    const response = await apiService.migrateUnits(baseUnits);
    
    console.log('Migration completed:', response.results);
    
    return {
      success: true,
      results: response.results
    };
  } catch (error) {
    console.error('Migration failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const fetchUnitsFromMongoDB = async (): Promise<{ success: boolean; units?: any[]; error?: string }> => {
  try {
    const response = await apiService.getUnits();
    
    return {
      success: true,
      units: response.data
    };
  } catch (error) {
    console.error('Failed to fetch units from MongoDB:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}; 