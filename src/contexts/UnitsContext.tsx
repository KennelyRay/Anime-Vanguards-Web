import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { UnitData, unitsDatabase as initialUnitsDatabase } from '../data/unitsDatabase'

interface UnitsContextType {
  units: UnitData[]
  setUnits: React.Dispatch<React.SetStateAction<UnitData[]>>
  addUnit: (unit: UnitData) => void
  updateUnit: (oldName: string, updatedUnit: UnitData) => void
  deleteUnit: (unitName: string) => void
  getUnitByName: (name: string) => UnitData | undefined
  getUnitsByTier: (tier: string) => UnitData[]
  getUnitsByElement: (element: string) => UnitData[]
  resetToDefault: () => void
}

const UnitsContext = createContext<UnitsContextType | undefined>(undefined)

export const useUnits = () => {
  const context = useContext(UnitsContext)
  if (context === undefined) {
    throw new Error('useUnits must be used within a UnitsProvider')
  }
  return context
}

interface UnitsProviderProps {
  children: ReactNode
}

export const UnitsProvider: React.FC<UnitsProviderProps> = ({ children }) => {
  // Initialize units from localStorage or default database
  const [units, setUnits] = useState<UnitData[]>(() => {
    const savedUnits = localStorage.getItem('animeVanguardsUnits')
    if (savedUnits) {
      try {
        return JSON.parse(savedUnits)
      } catch (error) {
        console.error('Error parsing saved units:', error)
        return [...initialUnitsDatabase]
      }
    }
    return [...initialUnitsDatabase]
  })

  // Save to localStorage whenever units change
  useEffect(() => {
    localStorage.setItem('animeVanguardsUnits', JSON.stringify(units))
  }, [units])

  const addUnit = (unit: UnitData) => {
    setUnits(prev => [...prev, unit])
  }

  const updateUnit = (oldName: string, updatedUnit: UnitData) => {
    setUnits(prev => prev.map(unit => 
      unit.name === oldName ? updatedUnit : unit
    ))
  }

  const deleteUnit = (unitName: string) => {
    setUnits(prev => prev.filter(unit => unit.name !== unitName))
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
    setUnits([...initialUnitsDatabase])
    localStorage.removeItem('animeVanguardsUnits')
  }

  const value: UnitsContextType = {
    units,
    setUnits,
    addUnit,
    updateUnit,
    deleteUnit,
    getUnitByName,
    getUnitsByTier,
    getUnitsByElement,
    resetToDefault
  }

  return (
    <UnitsContext.Provider value={value}>
      {children}
    </UnitsContext.Provider>
  )
} 