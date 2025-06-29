import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react'
import { UnitData } from '../data/unitsDatabase'
import { apiService } from '../services/api'
import { fetchUnitsFromMongoDB } from '../utils/migration'

// Helper function to convert numerical stats to letter grades
const convertNumToGrade = (num: number | undefined): string => {
  if (num === undefined || num === null) return 'C'
  
  // Convert numerical values to letter grades based on typical ranges
  if (num >= 2000) return 'S'
  if (num >= 1500) return 'A'
  if (num >= 1000) return 'B'
  if (num >= 500) return 'C'
  return 'D'
}

// Helper function to convert letter grades back to numerical values
const convertGradeToNum = (grade: string | undefined): number => {
  if (!grade) return 500
  
  switch (grade.toUpperCase()) {
    case 'S': return 2000
    case 'A': return 1500
    case 'B': return 1000
    case 'C': return 500
    case 'D': return 200
    default: return 500
  }
}

// Helper function to transform UnitData to MongoDB format
const transformUnitDataToMongo = (unit: UnitData) => {
  const unitId = unit.name.toLowerCase().replace(/[^a-z0-9]/g, '-')
  
  return {
    id: unitId,
    name: unit.name,
    rarity: unit.rarity || 'Rare',
    element: unit.element || 'Unknown',
    tier: unit.tier || 'Good',
    cost: unit.cost || 100,
    category: 'Ground', // Default category
    image: unit.image || '/images/units/default.webp',
    shinyImage: unit.shinyImage || '/images/units/default-shiny.webp',
    description: unit.description || 'No description available',
    videoUrl: unit.videoUrl,
    baseStats: unit.stats ? {
      damage: convertGradeToNum(unit.stats.damage),
      range: convertGradeToNum(unit.stats.range),
      speed: convertGradeToNum(unit.stats.speed)
    } : {
      damage: 500,
      range: 10,
      speed: 1
    },
    level60Stats: unit.upgradeStats?.levels ? {
      damage: unit.upgradeStats.levels[unit.upgradeStats.levels.length - 1]?.atkDamage || 1500,
      range: unit.upgradeStats.levels[unit.upgradeStats.levels.length - 1]?.range || 15,
      speed: unit.upgradeStats.levels[unit.upgradeStats.levels.length - 1]?.spa || 1.5
    } : {
      damage: 1500,
      range: 15,
      speed: 1.5
    },
    skills: unit.skills?.map(skill => ({
      name: skill.name,
      description: skill.description
    })) || [],
    traits: unit.traits?.map(trait => ({
      name: trait,
      description: `${trait} trait`
    })) || [],
    howToObtain: unit.obtainment || 'Available in summons',
    evolution: {
      canEvolve: Boolean(unit.evolutions && unit.evolutions.length > 0),
      evolutionRequirements: unit.evolutions?.[0]?.requirements || '',
      evolvesTo: unit.evolutions?.[0]?.name || ''
    },
    isBaseForm: unit.isBaseForm !== false,
    baseForm: unit.baseForm,
    evolutionLine: unit.evolutionLine || [],
    doesntEvolve: unit.doesntEvolve || false,
    upgradeStats: unit.upgradeStats,
    evolutions: unit.evolutions || [],
    trivia: unit.trivia || [],
    obtainment: unit.obtainment
  }
}

interface UnitsContextType {
  units: UnitData[]
  setUnits: React.Dispatch<React.SetStateAction<UnitData[]>>
  addUnit: (unit: UnitData) => Promise<void>
  updateUnit: (oldName: string, updatedUnit: UnitData) => Promise<void>
  deleteUnit: (unitName: string) => Promise<void>
  getUnitByName: (name: string) => UnitData | undefined
  getUnitsByTier: (tier: string) => UnitData[]
  getUnitsByElement: (element: string) => UnitData[]
  resetToDefault: () => void
  refreshFromMongoDB: () => Promise<void>
  isLoading: boolean
  error: string | null
}

const UnitsContext = createContext<UnitsContextType | undefined>(undefined)

export const useUnits = () => {
  const context = useContext(UnitsContext)
  if (context === undefined) {
    throw new Error('useUnits must be used within a UnitsProvider')
  }
  return context
}

// Add displayName for better debugging and HMR
useUnits.displayName = 'useUnits'

interface UnitsProviderProps {
  children: ReactNode
}

export const UnitsProvider: React.FC<UnitsProviderProps> = ({ children }) => {
  const [units, setUnits] = useState<UnitData[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize units from MongoDB on component mount
  useEffect(() => {
    const initializeUnits = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        // Try to fetch from MongoDB first
        const mongoResult = await fetchUnitsFromMongoDB()
        
        if (mongoResult.success && mongoResult.units && mongoResult.units.length > 0) {
          console.log('Raw MongoDB units:', mongoResult.units)
          
          // Transform MongoDB units to UnitData structure
          const transformedUnits = mongoResult.units.map((unit: any) => ({
            mongoId: unit.id, // Store the actual MongoDB ID
            name: unit.name,
            tier: unit.tier,
            element: unit.element,
            rarity: unit.rarity,
            cost: unit.cost,
            image: unit.image,
            shinyImage: unit.shinyImage,
            description: unit.description,
            obtainment: unit.howToObtain || unit.obtainment,
            videoUrl: unit.videoUrl,
            isBaseForm: unit.isBaseForm,
            baseForm: unit.baseForm,
            evolutionLine: unit.evolutionLine,
            doesntEvolve: unit.doesntEvolve,
            // Convert MongoDB numerical stats to letter grades
            stats: unit.baseStats ? {
              damage: convertNumToGrade(unit.baseStats.damage) || 'C',
              speed: convertNumToGrade(unit.baseStats.speed) || 'C',
              range: convertNumToGrade(unit.baseStats.range) || 'C'
            } : {
              damage: 'C',
              speed: 'C', 
              range: 'C'
            },
            upgradeStats: unit.upgradeStats,
            evolutions: unit.evolutions || [],
            skills: unit.skills?.map((skill: any) => ({
              name: skill.name,
              description: skill.description,
              type: 'Active' as 'Active' | 'Passive' // Default to Active, can be updated in admin panel
            })) || [],
            traits: unit.traits?.map((trait: any) => trait.name || trait) || [],
            trivia: unit.trivia || []
          }))
          
          setUnits(transformedUnits)
          console.log('Loaded', transformedUnits.length, 'units from MongoDB')
        } else {
          // Show the MongoDB result for debugging
          console.log('MongoDB result:', mongoResult)
          console.log('No units found in MongoDB')
          setUnits([])
          setError('No units found in database')
        }
      } catch (err) {
        console.error('Failed to load units from MongoDB:', err)
        console.error('Error details:', err)
        setUnits([])
        setError(`Failed to load units from database: ${err instanceof Error ? err.message : 'Unknown error'}`)
      } finally {
        setIsLoading(false)
      }
    }

    initializeUnits()
  }, [])

  // MongoDB-integrated CRUD operations

  const addUnit = async (unit: UnitData) => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Transform UnitData to MongoDB format
      const mongoUnit = transformUnitDataToMongo(unit)
      
             // Send to MongoDB via API
       const result = await apiService.createUnit(mongoUnit)
       
       if (result.message && result.data) {
         // Add to local state
         setUnits(prev => [...prev, unit])
         console.log('Unit added successfully:', unit.name)
       } else {
         setError('Failed to add unit')
       }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add unit'
      setError(errorMessage)
      console.error('Add unit error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const updateUnit = async (oldName: string, updatedUnit: UnitData) => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Find the unit to get its MongoDB ID
      const unitToUpdate = units.find(unit => unit.name === oldName)
      if (!unitToUpdate || !unitToUpdate.mongoId) {
        setError('Unit not found or missing MongoDB ID')
        return
      }
      
      // Transform UnitData to MongoDB format
      const mongoUnit = transformUnitDataToMongo(updatedUnit)
      
             // Send to MongoDB via API using the actual MongoDB ID
       const result = await apiService.updateUnit(unitToUpdate.mongoId, mongoUnit)
       
       if (result.message && result.data) {
         // Update local state
         setUnits(prev => prev.map(unit => 
           unit.name === oldName ? updatedUnit : unit
         ))
         console.log('Unit updated successfully:', updatedUnit.name)
       } else {
         setError('Failed to update unit')
       }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update unit'
      setError(errorMessage)
      console.error('Update unit error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteUnit = async (unitName: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Find the unit to get its MongoDB ID
      const unitToDelete = units.find(unit => unit.name === unitName)
      if (!unitToDelete || !unitToDelete.mongoId) {
        setError('Unit not found or missing MongoDB ID')
        return
      }
      
      // Delete from MongoDB via API using the actual MongoDB ID
      const result = await apiService.deleteUnit(unitToDelete.mongoId)
      
      if (result.message) {
        // Remove from local state
        setUnits(prev => prev.filter(unit => unit.name !== unitName))
        console.log('Unit deleted successfully:', unitName)
      } else {
        setError('Failed to delete unit')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete unit'
      setError(errorMessage)
      console.error('Delete unit error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const getUnitByName = (name: string): UnitData | undefined => {
    return units.find(unit => unit.name === name)
  }

  const getUnitsByTier = (tier: string): UnitData[] => {
    return units.filter(unit => unit.tier === tier)
  }

  const getUnitsByElement = (element: string): UnitData[] => {
    return units.filter(unit => unit.element === element)
  }

  const resetToDefault = () => {
    // Reset by refetching from MongoDB
    refreshFromMongoDB()
  }

  const refreshFromMongoDB = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const mongoResult = await fetchUnitsFromMongoDB()
      
      if (mongoResult.success && mongoResult.units) {
          // Transform MongoDB units to UnitData structure
          const transformedUnits = mongoResult.units.map((unit: any) => ({
            mongoId: unit.id, // Store the actual MongoDB ID
            name: unit.name,
            tier: unit.tier,
            element: unit.element,
            rarity: unit.rarity,
            cost: unit.cost,
            image: unit.image,
            shinyImage: unit.shinyImage,
            description: unit.description,
            obtainment: unit.howToObtain || unit.obtainment,
            videoUrl: unit.videoUrl,
            isBaseForm: unit.isBaseForm,
            baseForm: unit.baseForm,
            evolutionLine: unit.evolutionLine,
            doesntEvolve: unit.doesntEvolve,
            // Convert MongoDB numerical stats to letter grades
            stats: unit.baseStats ? {
              damage: convertNumToGrade(unit.baseStats.damage) || 'C',
              speed: convertNumToGrade(unit.baseStats.speed) || 'C',
              range: convertNumToGrade(unit.baseStats.range) || 'C'
            } : {
              damage: 'C',
              speed: 'C', 
              range: 'C'
            },
            upgradeStats: unit.upgradeStats,
            evolutions: unit.evolutions || [],
            skills: unit.skills?.map((skill: any) => ({
              name: skill.name,
              description: skill.description,
              type: 'Active' as 'Active' | 'Passive' // Default to Active
            })) || [],
            traits: unit.traits?.map((trait: any) => trait.name || trait) || [],
            trivia: unit.trivia || []
          }))
        
        setUnits(transformedUnits)
        console.log('Refreshed', transformedUnits.length, 'units from MongoDB')
      } else {
        setError(mongoResult.error || 'Failed to refresh units')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh units'
      setError(errorMessage)
      console.error('Refresh error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const value: UnitsContextType = useMemo(() => ({
    units,
    setUnits,
    addUnit,
    updateUnit,
    deleteUnit,
    getUnitByName,
    getUnitsByTier,
    getUnitsByElement,
    resetToDefault,
    refreshFromMongoDB,
    isLoading,
    error
  }), [units, isLoading, error])

  return (
    <UnitsContext.Provider value={value}>
      {children}
    </UnitsContext.Provider>
  )
}

// Add displayName for better debugging and HMR
UnitsProvider.displayName = 'UnitsProvider' 