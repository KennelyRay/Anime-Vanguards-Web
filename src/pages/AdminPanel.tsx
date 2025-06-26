import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, Save, X, Crown, Zap, Target, RotateCcw, Users, Upload, Download, AlertTriangle, CheckSquare, Square, Video, Tags, ArrowRight, TrendingUp, Shield } from 'lucide-react'
import Toast from '../components/Toast'
import { UnitData, StatGrade, getAvailableStatGrades, calculateBaseStats, formatStatDisplay } from '../data/unitsDatabase'
import { useUnits } from '../contexts/UnitsContext'

interface NewUnit extends Omit<UnitData, 'evolutions' | 'cost'> {
  evolutions?: Array<{
    name: string
    tier: string
    element: string
    rarity: string
    cost: number
    image?: string
    shinyImage?: string
    description?: string
    requirements: string[]
    bonuses: string[]
    upgradeStats?: {
      maxUpgrades: number
      levels: Array<{
        level: number
        yenCost: number
        atkDamage: number
        range: number
        spa: number
        critDamage: number
        critChance: number
      }>
    }
  }>
  videoUrl?: string
  tags?: string[]
  doesntEvolve?: boolean
}

// Helper function to get tier icon and label
const getTierData = (tier: string) => {
  const tierDataMap: { [key: string]: { icon: string; label: string } } = {
    'Monarch': { icon: '/images/Unit Tiers/Broken.webp', label: 'Broken' },
    'Godly': { icon: '/images/Unit Tiers/Meta.webp', label: 'Meta' },
    'Z+': { icon: '/images/Unit Tiers/SemiMeta.webp', label: 'SemiMeta' },
    'S+': { icon: '/images/Unit Tiers/MetaSupport.webp', label: 'MetaSupport' },
    'A+': { icon: '/images/Unit Tiers/Good.webp', label: 'Good' },
    'B+': { icon: '/images/Unit Tiers/Bad.webp', label: 'Bad' },
    // Legacy tiers fallback
    'S': { icon: '/images/Unit Tiers/Support.webp', label: 'Support' },
    'A': { icon: '/images/Unit Tiers/Good.webp', label: 'Good' },
    'B': { icon: '/images/Unit Tiers/Bad.webp', label: 'Bad' },
    'C': { icon: '/images/Unit Tiers/Bad.webp', label: 'Bad' },
    'D': { icon: '/images/Unit Tiers/Bad.webp', label: 'Bad' }
  }
  
  return tierDataMap[tier] || { icon: '/images/Unit Tiers/Bad.webp', label: 'Bad' }
}

// Legacy function for backward compatibility
const getTierIcon = (tier: string) => {
  return getTierData(tier).icon
}

// Confirmation Modal Component
interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  isDangerous?: boolean
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = false
}) => {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-dark-100 rounded-xl max-w-md w-full p-6"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center mb-4">
            {isDangerous && (
              <div className="bg-red-500/20 p-2 rounded-full mr-3">
                <AlertTriangle className="h-6 w-6 text-red-400" />
              </div>
            )}
            <h2 className="text-xl font-game font-bold text-white">{title}</h2>
          </div>
          
          <p className="text-gray-300 mb-6">{message}</p>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm()
                onClose()
              }}
              className={`flex-1 py-3 text-white rounded-lg transition-colors ${
                isDangerous 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-primary-600 hover:bg-primary-700'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

const AdminPanel = () => {
  const { units, addUnit, updateUnit, deleteUnit, resetToDefault } = useUnits()
  const [activeTab, setActiveTab] = useState<'add' | 'manage'>('add')
  const [editingUnit, setEditingUnit] = useState<UnitData | null>(null)
  const [selectedUnits, setSelectedUnits] = useState<Set<string>>(new Set())
  const [bulkDeleteMode, setBulkDeleteMode] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Toast notification state
  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error' | 'warning'
    isVisible: boolean
  }>({
    message: '',
    type: 'success',
    isVisible: false
  })

  // Confirmation modal state
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  })
  
  // Form state for new/edit unit
  const [newUnit, setNewUnit] = useState<NewUnit>({
    name: '',
    tier: 'A+',
    element: 'UnknownElement',
    rarity: 'Rare',
    description: '',
    obtainment: '',
    videoUrl: '',
    tags: [],
    isBaseForm: true,
    doesntEvolve: false,
    stats: {
      damage: 'D',
      speed: 'D',
      range: 'D'
    },
            upgradeStats: {
          maxUpgrades: 4,
          levels: [
            { level: 0, yenCost: 3500, atkDamage: 24, range: 5, spa: 5.0, critDamage: 300, critChance: 0.0 },
            { level: 1, yenCost: 4200, atkDamage: 26, range: 5, spa: 5.0, critDamage: 360, critChance: 0.0 },
            { level: 2, yenCost: 5700, atkDamage: 28, range: 5, spa: 5.0, critDamage: 420, critChance: 0.0 },
            { level: 3, yenCost: 6400, atkDamage: 30, range: 5, spa: 5.0, critDamage: 480, critChance: 0.0 }
          ]
        },
    skills: [],
    evolutions: [],
    traits: [],
    trivia: []
  })

  const tiers = ['Monarch', 'Godly', 'Z+', 'S+', 'A+', 'B+', 'S', 'A', 'B', 'C', 'D']
  const elements = ['Blast', 'Cosmic', 'Curse', 'Fire', 'Holy', 'Nature', 'Passion', 'Spark', 'Unbound', 'UnknownElement', 'Water']
  const rarities = ['Vanguard', 'Exclusive', 'Secret', 'Mythical', 'Legendary', 'Epic', 'Rare', 'Common', 'Mythic']
  const statGrades = getAvailableStatGrades()

  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToast({
      message,
      type,
      isVisible: true
    })
  }

  const handleInputChange = (field: string, value: any) => {
    setNewUnit(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleStatsChange = (stat: string, value: string) => {
    setNewUnit(prev => ({
      ...prev,
      stats: {
        ...prev.stats!,
        [stat]: value
      }
    }))
  }

  const handleMaxUpgradesChange = (maxUpgrades: number) => {
    setNewUnit(prev => {
      const currentLevels = prev.upgradeStats?.levels || []
      const newLevels = []
      
      // Create levels array based on maxUpgrades
      for (let i = 0; i < maxUpgrades; i++) {
        if (i < currentLevels.length) {
          // Keep existing level data
          newLevels.push(currentLevels[i])
        } else {
          // Add new level with default values
          newLevels.push({
            level: i,
            yenCost: 0,
            atkDamage: 0,
            range: 0,
            spa: 0,
            critDamage: 0,
            critChance: 0
          })
        }
      }
      
      return {
        ...prev,
        upgradeStats: {
          maxUpgrades,
          levels: newLevels
        }
      }
    })
  }

  const handleUpgradeStatChange = (levelIndex: number, statField: string, value: number) => {
    setNewUnit(prev => ({
      ...prev,
      upgradeStats: {
        ...prev.upgradeStats!,
        levels: prev.upgradeStats!.levels.map((level, index) =>
          index === levelIndex
            ? { ...level, [statField]: value }
            : level
        )
      }
    }))
  }

  const addSkill = () => {
    setNewUnit(prev => ({
      ...prev,
      skills: [
        ...(prev.skills || []),
        { name: '', description: '', type: 'Active' as const }
      ]
    }))
  }

  const updateSkill = (index: number, field: string, value: any) => {
    setNewUnit(prev => ({
      ...prev,
      skills: prev.skills?.map((skill, i) => 
        i === index ? { ...skill, [field]: value } : skill
      ) || []
    }))
  }

  const removeSkill = (index: number) => {
    setNewUnit(prev => ({
      ...prev,
      skills: prev.skills?.filter((_, i) => i !== index) || []
    }))
  }

  const addEvolution = () => {
    setNewUnit(prev => ({
      ...prev,
      evolutions: [
        ...(prev.evolutions || []),
        {
          name: '',
          tier: 'A+',
          element: 'UnknownElement',
          rarity: 'Rare',
          cost: 0,
          description: '',
          requirements: [],
          bonuses: [],
          upgradeStats: {
            maxUpgrades: 4,
            levels: [
              { level: 0, yenCost: 3500, atkDamage: 24, range: 5, spa: 5.0, critDamage: 300, critChance: 0.0 },
              { level: 1, yenCost: 4200, atkDamage: 26, range: 5, spa: 5.0, critDamage: 360, critChance: 0.0 },
              { level: 2, yenCost: 5700, atkDamage: 28, range: 5, spa: 5.0, critDamage: 420, critChance: 0.0 },
              { level: 3, yenCost: 6400, atkDamage: 30, range: 5, spa: 5.0, critDamage: 480, critChance: 0.0 }
            ]
          }
        }
      ]
    }))
  }

  const updateEvolution = (index: number, field: string, value: any) => {
    setNewUnit(prev => ({
      ...prev,
      evolutions: prev.evolutions?.map((evo, i) => 
        i === index ? { ...evo, [field]: value } : evo
      ) || []
    }))
  }

  const removeEvolution = (index: number) => {
    setNewUnit(prev => ({
      ...prev,
      evolutions: prev.evolutions?.filter((_, i) => i !== index) || []
    }))
  }

  const addEvolutionBonus = (evoIndex: number) => {
    setNewUnit(prev => ({
      ...prev,
      evolutions: prev.evolutions?.map((evo, i) => 
        i === evoIndex ? { ...evo, bonuses: [...evo.bonuses, ''] } : evo
      ) || []
    }))
  }

  const updateEvolutionBonus = (evoIndex: number, bonusIndex: number, value: string) => {
    setNewUnit(prev => ({
      ...prev,
      evolutions: prev.evolutions?.map((evo, i) => 
        i === evoIndex ? {
          ...evo,
          bonuses: evo.bonuses.map((bonus, j) => j === bonusIndex ? value : bonus)
        } : evo
      ) || []
    }))
  }

  const removeEvolutionBonus = (evoIndex: number, bonusIndex: number) => {
    setNewUnit(prev => ({
      ...prev,
      evolutions: prev.evolutions?.map((evo, i) => 
        i === evoIndex ? {
          ...evo,
          bonuses: evo.bonuses.filter((_, j) => j !== bonusIndex)
        } : evo
      ) || []
    }))
  }

  // Evolution requirement functions
  const addEvolutionRequirement = (evoIndex: number) => {
    setNewUnit(prev => ({
      ...prev,
      evolutions: prev.evolutions?.map((evo, i) => 
        i === evoIndex ? {
          ...evo,
          requirements: [...evo.requirements, '']
        } : evo
      ) || []
    }))
  }

  const updateEvolutionRequirement = (evoIndex: number, reqIndex: number, value: string) => {
    setNewUnit(prev => ({
      ...prev,
      evolutions: prev.evolutions?.map((evo, i) => 
        i === evoIndex ? {
          ...evo,
          requirements: evo.requirements.map((req, ri) => ri === reqIndex ? value : req)
        } : evo
      ) || []
    }))
  }

  const removeEvolutionRequirement = (evoIndex: number, reqIndex: number) => {
    setNewUnit(prev => ({
      ...prev,
      evolutions: prev.evolutions?.map((evo, i) => 
        i === evoIndex ? {
          ...evo,
          requirements: evo.requirements.filter((_, ri) => ri !== reqIndex)
        } : evo
      ) || []
    }))
  }

  // Evolution upgrade stats functions
  const handleEvolutionMaxUpgradesChange = (evoIndex: number, maxUpgrades: number) => {
    const currentLevels = newUnit.evolutions?.[evoIndex]?.upgradeStats?.levels || []
    const newLevels = Array.from({ length: maxUpgrades }, (_, i) => {
      if (i < currentLevels.length) {
        return { ...currentLevels[i], level: i }
      }
      return { level: i, yenCost: 0, atkDamage: 0, range: 0, spa: 0, critDamage: 0, critChance: 0 }
    })

    setNewUnit(prev => ({
      ...prev,
      evolutions: prev.evolutions?.map((evo, i) => 
        i === evoIndex ? {
          ...evo,
          upgradeStats: {
            maxUpgrades,
            levels: newLevels
          }
        } : evo
      ) || []
    }))
  }

  const handleEvolutionUpgradeStatChange = (evoIndex: number, levelIndex: number, statField: string, value: number) => {
    setNewUnit(prev => ({
      ...prev,
      evolutions: prev.evolutions?.map((evo, i) => 
        i === evoIndex ? {
          ...evo,
          upgradeStats: evo.upgradeStats ? {
            ...evo.upgradeStats,
            levels: evo.upgradeStats.levels.map((level, li) => 
              li === levelIndex ? { ...level, [statField]: value } : level
            )
          } : undefined
        } : evo
      ) || []
    }))
  }

  const clearForm = () => {
    setNewUnit({
      name: '',
      tier: 'A+',
      element: 'UnknownElement',
      rarity: 'Rare',
      description: '',
      obtainment: '',
      videoUrl: '',
      tags: [],
      isBaseForm: true,
      doesntEvolve: false,
      stats: {
        damage: 'D',
        speed: 'D',
        range: 'D'
      },
      upgradeStats: {
        maxUpgrades: 4,
        levels: [
          { level: 0, yenCost: 3500, atkDamage: 24, range: 5, spa: 5.0, critDamage: 300, critChance: 0.0 },
          { level: 1, yenCost: 4200, atkDamage: 26, range: 5, spa: 5.0, critDamage: 360, critChance: 0.0 },
          { level: 2, yenCost: 5700, atkDamage: 28, range: 5, spa: 5.0, critDamage: 420, critChance: 0.0 },
          { level: 3, yenCost: 6400, atkDamage: 30, range: 5, spa: 5.0, critDamage: 480, critChance: 0.0 }
        ]
      },
      skills: [],
      evolutions: [],
      traits: [],
      trivia: []
    })
    setEditingUnit(null)
  }

  const handleSaveUnit = () => {
    if (!newUnit.name.trim()) {
      showToast('Unit name is required', 'error')
      return
    }

    const unitToSave: UnitData = {
      ...newUnit,
      cost: 0, // Removed from UI but still required by interface
      traits: newUnit.tags || [],
      trivia: newUnit.trivia || [],
      evolutions: newUnit.doesntEvolve ? [] : newUnit.evolutions?.map(evo => ({
        name: evo.name,
        tier: evo.tier,
        element: evo.element,
        rarity: evo.rarity,
        cost: 0, // Removed from UI but still required by interface
        image: evo.image,
        shinyImage: evo.shinyImage,
        description: evo.description,
        requirements: Array.isArray(evo.requirements) ? evo.requirements.join(', ') : evo.requirements,
        bonuses: evo.bonuses
      }))
    }

    if (editingUnit) {
      // Update existing unit
      updateUnit(editingUnit.name, unitToSave)
      setEditingUnit(null)
      showToast('Unit updated successfully!', 'success')
    } else {
      // Add new unit
      addUnit(unitToSave)
      showToast('Unit added successfully!', 'success')
    }

    // Reset form
    setNewUnit({
      name: '',
      tier: 'A+',
      element: 'UnknownElement',
      rarity: 'Rare',
      description: '',
      obtainment: '',
      videoUrl: '',
      tags: [],
      isBaseForm: true,
      doesntEvolve: false,
      stats: {
        damage: 'D',
        speed: 'D',
        range: 'D'
      },
      skills: [],
      evolutions: [],
      traits: [],
      trivia: []
    })
  }

  const handleEditUnit = (unit: UnitData) => {
    setEditingUnit(unit)
    setNewUnit({
      ...unit,
      tags: unit.traits || [],
      videoUrl: '',
      upgradeStats: unit.upgradeStats || {
        maxUpgrades: 4,
        levels: [
          { level: 0, yenCost: 0, atkDamage: 0, range: 0, spa: 0, critDamage: 0, critChance: 0 },
          { level: 1, yenCost: 0, atkDamage: 0, range: 0, spa: 0, critDamage: 0, critChance: 0 },
          { level: 2, yenCost: 0, atkDamage: 0, range: 0, spa: 0, critDamage: 0, critChance: 0 },
          { level: 3, yenCost: 0, atkDamage: 0, range: 0, spa: 0, critDamage: 0, critChance: 0 }
        ]
      },
      evolutions: unit.evolutions?.map(evo => ({
        ...evo,
        requirements: typeof evo.requirements === 'string' 
          ? (evo.requirements ? [evo.requirements] : [])
          : (evo.requirements || []),
        upgradeStats: {
          maxUpgrades: 4,
          levels: [
            { level: 0, yenCost: 3500, atkDamage: 24, range: 5, spa: 5.0, critDamage: 300, critChance: 0.0 },
            { level: 1, yenCost: 4200, atkDamage: 26, range: 5, spa: 5.0, critDamage: 360, critChance: 0.0 },
            { level: 2, yenCost: 5700, atkDamage: 28, range: 5, spa: 5.0, critDamage: 420, critChance: 0.0 },
            { level: 3, yenCost: 6400, atkDamage: 30, range: 5, spa: 5.0, critDamage: 480, critChance: 0.0 }
          ]
        }
      }))
    })
    setActiveTab('add')
  }

  const handleDeleteUnit = (unitName: string) => {
    setConfirmationModal({
      isOpen: true,
      title: 'Confirm Deletion',
      message: `Are you sure you want to delete ${unitName}? This action cannot be undone.`,
      onConfirm: () => {
        deleteUnit(unitName)
      }
    })
  }

  const toggleUnitSelection = (unitName: string) => {
    const newSelected = new Set(selectedUnits)
    if (newSelected.has(unitName)) {
      newSelected.delete(unitName)
    } else {
      newSelected.add(unitName)
    }
    setSelectedUnits(newSelected)
  }

  const selectAllUnits = () => {
    setSelectedUnits(new Set(units.map(unit => unit.name)))
  }

  const deselectAllUnits = () => {
    setSelectedUnits(new Set())
  }

  const handleBulkDelete = () => {
    if (selectedUnits.size === 0) {
      showToast('No units selected for deletion', 'warning')
      return
    }

    const deleteCount = selectedUnits.size
    setConfirmationModal({
      isOpen: true,
      title: 'Confirm Bulk Deletion',
      message: `Are you sure you want to delete ${selectedUnits.size} selected units? This action cannot be undone.`,
      onConfirm: () => {
        selectedUnits.forEach(unitName => {
          deleteUnit(unitName)
        })
        setSelectedUnits(new Set())
        setBulkDeleteMode(false)
        showToast(`Successfully deleted ${deleteCount} units`, 'success')
      }
    })
  }

  // CSV Export functionality
  const exportToCSV = () => {
    try {
      const headers = [
        'name', 'tier', 'element', 'rarity', 'cost', 'image', 'shinyImage', 
        'description', 'obtainment', 'videoUrl', 'isBaseForm', 'baseForm', 
        'evolutionLine', 'doesntEvolve', 'damage', 'speed', 'range',
        'skills', 'evolutions', 'traits', 'trivia'
      ]

      const csvData = units.map(unit => [
        unit.name || '',
        unit.tier || '',
        unit.element || '',
        unit.rarity || '',
        unit.cost || 0,
        unit.image || '',
        unit.shinyImage || '',
        unit.description || '',
        unit.obtainment || '',
        unit.videoUrl || '',
        unit.isBaseForm || false,
        unit.baseForm || '',
        unit.evolutionLine ? unit.evolutionLine.join('|') : '',
        unit.doesntEvolve || false,
        unit.stats?.damage || '',
        unit.stats?.speed || '',
        unit.stats?.range || '',
        unit.skills ? JSON.stringify(unit.skills) : '',
        unit.evolutions ? JSON.stringify(unit.evolutions) : '',
        unit.traits ? unit.traits.join('|') : '',
        unit.trivia ? unit.trivia.join('|') : ''
      ])

      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.map(field => {
          // Escape quotes and wrap in quotes if contains comma, quote, or newline
          const stringField = String(field)
          if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
            return '"' + stringField.replace(/"/g, '""') + '"'
          }
          return stringField
        }).join(','))
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `anime-vanguards-units-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      showToast(`Exported ${units.length} units to CSV successfully!`, 'success')
    } catch (error) {
      console.error('Export error:', error)
      showToast('Failed to export CSV file', 'error')
    }
  }

  // CSV Import functionality
  const importFromCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string
        const lines = csvText.split('\n').filter(line => line.trim())
        
        if (lines.length < 2) {
          showToast('CSV file appears to be empty or invalid', 'error')
          return
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
        const dataLines = lines.slice(1)
        
        const importedUnits: UnitData[] = []
        let errorCount = 0

        dataLines.forEach((line, index) => {
          try {
            // Simple CSV parsing - handles quoted fields
            const fields: string[] = []
            let currentField = ''
            let inQuotes = false
            
            for (let i = 0; i < line.length; i++) {
              const char = line[i]
              const nextChar = line[i + 1]
              
              if (char === '"' && !inQuotes) {
                inQuotes = true
              } else if (char === '"' && inQuotes && nextChar === '"') {
                currentField += '"'
                i++ // Skip next quote
              } else if (char === '"' && inQuotes) {
                inQuotes = false
              } else if (char === ',' && !inQuotes) {
                fields.push(currentField.trim())
                currentField = ''
              } else {
                currentField += char
              }
            }
            fields.push(currentField.trim()) // Add last field

            const unitData: any = {}
            headers.forEach((header, i) => {
              const value = fields[i] || ''
              
              switch (header) {
                case 'name':
                case 'tier':
                case 'element':
                case 'rarity':
                case 'image':
                case 'shinyImage':
                case 'description':
                case 'obtainment':
                case 'videoUrl':
                case 'baseForm':
                  unitData[header] = value
                  break
                case 'cost':
                  unitData[header] = parseInt(value) || 0
                  break
                case 'isBaseForm':
                case 'doesntEvolve':
                  unitData[header] = value.toLowerCase() === 'true'
                  break
                case 'evolutionLine':
                  unitData[header] = value ? value.split('|').filter(v => v.trim()) : []
                  break
                case 'traits':
                case 'trivia':
                  unitData[header] = value ? value.split('|').filter(v => v.trim()) : []
                  break
                case 'damage':
                case 'speed':
                case 'range':
                  if (!unitData.stats) unitData.stats = {}
                  unitData.stats[header] = value
                  break
                case 'skills':
                case 'evolutions':
                  try {
                    unitData[header] = value ? JSON.parse(value) : []
                  } catch {
                    unitData[header] = []
                  }
                  break
              }
            })

            if (unitData.name) {
              importedUnits.push(unitData as UnitData)
            }
          } catch (error) {
            console.error(`Error parsing line ${index + 2}:`, error)
            errorCount++
          }
        })

        if (importedUnits.length === 0) {
          showToast('No valid units found in CSV file', 'error')
          return
        }

        setConfirmationModal({
          isOpen: true,
          title: 'Confirm CSV Import',
          message: `Found ${importedUnits.length} valid units in CSV file${errorCount > 0 ? ` (${errorCount} errors)` : ''}. This will ADD these units to your current database. Continue?`,
          onConfirm: () => {
            importedUnits.forEach(unit => {
              addUnit(unit)
            })
            showToast(`Successfully imported ${importedUnits.length} units!${errorCount > 0 ? ` ${errorCount} entries had errors.` : ''}`, 'success')
          }
        })

      } catch (error) {
        console.error('Import error:', error)
        showToast('Failed to parse CSV file', 'error')
      }
    }

    reader.readAsText(file)
    // Clear the input so the same file can be selected again
    event.target.value = ''
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-100 via-dark-200 to-dark-300">
      {/* Modern Header with Gradient */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-secondary-600 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Header Content */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Crown className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-game font-bold text-white mb-2">
                  Admin Dashboard
                </h1>
                <p className="text-primary-100 text-lg">
                  Manage units, content, and database operations
                </p>
                <div className="flex items-center gap-4 mt-2 text-sm text-primary-200">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {units.length} Total Units
                  </span>
                  <span className="flex items-center gap-1">
                    <Target className="h-4 w-4" />
                    {units.filter(u => u.isBaseForm).length} Base Units
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              {/* CSV Operations */}
              <div className="flex items-center gap-2 bg-white/10 rounded-xl p-2 backdrop-blur-sm">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={importFromCSV}
                  className="hidden"
                />
                <button
                  onClick={triggerFileInput}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 hover:scale-105 shadow-lg"
                  title="Import units from CSV file"
                >
                  <Upload className="h-4 w-4" />
                  Import
                </button>
                <button
                  onClick={exportToCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all duration-200 hover:scale-105 shadow-lg"
                  title="Export units to CSV file"
                >
                  <Download className="h-4 w-4" />
                  Export
                </button>
              </div>

              {/* Reset Button */}
              <button
                onClick={() => setConfirmationModal({
                  isOpen: true,
                  title: 'Reset Database',
                  message: 'Are you sure you want to reset all units to default? This will remove all custom units and modifications.',
                  onConfirm: resetToDefault
                })}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all duration-200 hover:scale-105 shadow-lg"
              >
                <RotateCcw className="h-4 w-4" />
                Reset Database
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Modern Tab Navigation */}
        <div className="mb-8">
          <div className="flex items-center space-x-1 bg-dark-200/50 rounded-xl p-1 backdrop-blur-sm border border-primary-500/20">
            <button
              onClick={() => setActiveTab('add')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'add' 
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg transform scale-[1.02]' 
                  : 'text-gray-400 hover:text-white hover:bg-dark-200/50'
              }`}
            >
              <Plus className="h-5 w-5" />
              {editingUnit ? 'Edit Unit' : 'Add New Unit'}
            </button>
            <button
              onClick={() => setActiveTab('manage')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'manage' 
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg transform scale-[1.02]' 
                  : 'text-gray-400 hover:text-white hover:bg-dark-200/50'
              }`}
            >
              <Users className="h-5 w-5" />
              Manage Units
              <span className="bg-white/20 text-xs px-2 py-1 rounded-full">
                {units.length}
              </span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        {activeTab === 'add' ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-8"
          >
            {/* Form Header */}
            <div className="bg-gradient-to-r from-dark-100 to-dark-200 rounded-2xl p-6 border border-primary-500/20 shadow-xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                  {editingUnit ? <Edit2 className="h-6 w-6 text-white" /> : <Plus className="h-6 w-6 text-white" />}
                </div>
                <div>
                  <h2 className="text-2xl font-game font-bold text-white">
                    {editingUnit ? 'Edit Unit Details' : 'Create New Unit'}
                  </h2>
                  <p className="text-gray-400">
                    {editingUnit ? 'Modify unit properties and save changes' : 'Fill in the details to add a new unit to the database'}
                  </p>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Basic Information Card */}
                <div className="bg-dark-200/30 rounded-xl p-6 border border-primary-500/10">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary-400" />
                    Basic Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Unit Name *
                      </label>
                      <input
                        type="text"
                        value={newUnit.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-4 py-3 bg-dark-300/50 border border-primary-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                        placeholder="Enter unit name"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Tier
                        </label>
                        <select
                          value={newUnit.tier}
                          onChange={(e) => handleInputChange('tier', e.target.value)}
                          className="w-full px-4 py-3 bg-dark-300/50 border border-primary-500/20 rounded-lg text-white focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                        >
                          {tiers.map(tier => (
                            <option key={tier} value={tier} className="bg-dark-300">
                              {tier}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Element
                        </label>
                        <select
                          value={newUnit.element}
                          onChange={(e) => handleInputChange('element', e.target.value)}
                          className="w-full px-4 py-3 bg-dark-300/50 border border-primary-500/20 rounded-lg text-white focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                        >
                          {elements.map(element => (
                            <option key={element} value={element} className="bg-dark-300">
                              {element}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Rarity
                      </label>
                      <select
                        value={newUnit.rarity}
                        onChange={(e) => handleInputChange('rarity', e.target.value)}
                        className="w-full px-4 py-3 bg-dark-300/50 border border-primary-500/20 rounded-lg text-white focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                      >
                        {rarities.map(rarity => (
                          <option key={rarity} value={rarity} className="bg-dark-300">
                            {rarity}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Description
                      </label>
                      <textarea
                        value={newUnit.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        className="w-full px-4 py-3 bg-dark-300/50 border border-primary-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all h-24 resize-none"
                        placeholder="Enter unit description"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        How to Obtain
                      </label>
                      <input
                        type="text"
                        value={newUnit.obtainment}
                        onChange={(e) => handleInputChange('obtainment', e.target.value)}
                        className="w-full px-4 py-3 bg-dark-300/50 border border-primary-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                        placeholder="e.g., Summon from Banner, Event Reward"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Video URL (Optional)
                      </label>
                      <input
                        type="url"
                        value={newUnit.videoUrl || ''}
                        onChange={(e) => handleInputChange('videoUrl', e.target.value)}
                        className="w-full px-4 py-3 bg-dark-300/50 border border-primary-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                        placeholder="https://youtube.com/watch?v=..."
                      />
                    </div>
                  </div>
                </div>

                {/* Stats & Properties Card */}
                <div className="bg-dark-200/30 rounded-xl p-6 border border-primary-500/10">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-400" />
                    Stats & Properties
                  </h3>
                  <div className="space-y-6">
                    {/* Base Stats */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Base Stats Grades
                      </label>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Damage Grade</label>
                          <select
                            value={newUnit.stats?.damage || 'D'}
                            onChange={(e) => handleStatsChange('damage', e.target.value)}
                            className="w-full px-3 py-2 bg-dark-300/50 border border-primary-500/20 rounded-lg text-white text-sm focus:outline-none focus:border-primary-400 transition-all"
                          >
                            {statGrades.map(grade => (
                              <option key={grade} value={grade} className="bg-dark-300">
                                {grade}
                              </option>
                            ))}
                          </select>
                          <div className="text-xs text-gray-400 mt-1">
                            {formatStatDisplay(newUnit.stats?.damage as StatGrade || 'D', 'damage')}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Speed (SPA) Grade</label>
                          <select
                            value={newUnit.stats?.speed || 'D'}
                            onChange={(e) => handleStatsChange('speed', e.target.value)}
                            className="w-full px-3 py-2 bg-dark-300/50 border border-primary-500/20 rounded-lg text-white text-sm focus:outline-none focus:border-primary-400 transition-all"
                          >
                            {statGrades.map(grade => (
                              <option key={grade} value={grade} className="bg-dark-300">
                                {grade}
                              </option>
                            ))}
                          </select>
                          <div className="text-xs text-gray-400 mt-1">
                            {formatStatDisplay(newUnit.stats?.speed as StatGrade || 'D', 'spa')}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Range Grade</label>
                          <select
                            value={newUnit.stats?.range || 'D'}
                            onChange={(e) => handleStatsChange('range', e.target.value)}
                            className="w-full px-3 py-2 bg-dark-300/50 border border-primary-500/20 rounded-lg text-white text-sm focus:outline-none focus:border-primary-400 transition-all"
                          >
                            {statGrades.map(grade => (
                              <option key={grade} value={grade} className="bg-dark-300">
                                {grade}
                              </option>
                            ))}
                          </select>
                          <div className="text-xs text-gray-400 mt-1">
                            {formatStatDisplay(newUnit.stats?.range as StatGrade || 'D', 'range')}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Calculated Stats Display */}
                    {newUnit.stats && (
                      <div className="bg-dark-300/20 rounded-lg p-4 border border-primary-500/10">
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                          Calculated Base Values
                        </label>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {(() => {
                            const calculatedStats = calculateBaseStats({
                              damage: newUnit.stats.damage as StatGrade || 'D',
                              speed: newUnit.stats.speed as StatGrade || 'D',
                              range: newUnit.stats.range as StatGrade || 'D'
                            })
                            return (
                              <>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Damage Bonus:</span>
                                  <span className="text-green-400 font-semibold">
                                    +{calculatedStats.damagePercentage.toFixed(1)}%
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">SPA Bonus:</span>
                                  <span className="text-blue-400 font-semibold">
                                    +{calculatedStats.spaPercentage.toFixed(1)}%
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Range Bonus:</span>
                                  <span className="text-purple-400 font-semibold">
                                    +{calculatedStats.rangePercentage.toFixed(1)}%
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Crit Chance:</span>
                                  <span className="text-yellow-400 font-semibold">
                                    {calculatedStats.critChance}%
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Potential:</span>
                                  <span className="text-orange-400 font-semibold">
                                    {calculatedStats.potential}%
                                  </span>
                                </div>
                              </>
                            )
                          })()}
                        </div>
                      </div>
                    )}

                    {/* Unit Properties */}
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-300">
                        Unit Properties
                      </label>
                      <div className="space-y-3">
                        <label className="flex items-center gap-3 p-3 bg-dark-300/30 rounded-lg border border-primary-500/10">
                          <input
                            type="checkbox"
                            checked={newUnit.isBaseForm || false}
                            onChange={(e) => handleInputChange('isBaseForm', e.target.checked)}
                            className="w-4 h-4 text-primary-600 bg-dark-200 border-primary-500/20 rounded focus:ring-primary-500 focus:ring-2"
                          />
                          <span className="text-sm text-gray-300">This is a base form unit</span>
                        </label>
                        <label className="flex items-center gap-3 p-3 bg-dark-300/30 rounded-lg border border-primary-500/10">
                          <input
                            type="checkbox"
                            checked={newUnit.doesntEvolve || false}
                            onChange={(e) => handleInputChange('doesntEvolve', e.target.checked)}
                            className="w-4 h-4 text-primary-600 bg-dark-200 border-primary-500/20 rounded focus:ring-primary-500 focus:ring-2"
                          />
                          <span className="text-sm text-gray-300">This unit doesn't evolve</span>
                        </label>
                      </div>
                    </div>

                    {/* Tags */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Tags (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={newUnit.tags?.join(', ') || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          const tags = value ? value.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
                          handleInputChange('tags', tags);
                        }}
                        className="w-full px-4 py-3 bg-dark-300/50 border border-primary-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                        placeholder="DPS, Tank, Support, etc."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Media & Images Section */}
              <div className="bg-gradient-to-r from-dark-100 to-dark-200 rounded-2xl p-6 border border-primary-500/20 shadow-xl mt-8">
                <h3 className="text-xl font-game font-bold text-white mb-6 flex items-center gap-2">
                  <Upload className="h-6 w-6 text-purple-400" />
                  Images & Media
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Normal Unit Image URL
                    </label>
                    <input
                      type="text"
                      value={newUnit.image || ''}
                      onChange={(e) => handleInputChange('image', e.target.value)}
                      className="w-full px-4 py-3 bg-dark-300/50 border border-primary-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                      placeholder="https://example.com/unit-image.webp"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Shiny Unit Image URL
                    </label>
                    <input
                      type="text"
                      value={newUnit.shinyImage || ''}
                      onChange={(e) => handleInputChange('shinyImage', e.target.value)}
                      className="w-full px-4 py-3 bg-dark-300/50 border border-primary-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                      placeholder="https://example.com/unit-shiny-image.webp"
                    />
                  </div>
                </div>
              </div>

              {/* Upgrade Stats Section */}
              <div className="bg-gradient-to-r from-dark-100 to-dark-200 rounded-2xl p-6 border border-primary-500/20 shadow-xl mt-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-game font-bold text-white flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-green-400" />
                    Level 60 Upgrade Stats
                  </h3>
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-300">Max Upgrades:</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={newUnit.upgradeStats?.maxUpgrades || 4}
                      onChange={(e) => handleMaxUpgradesChange(parseInt(e.target.value) || 4)}
                      className="w-20 px-3 py-2 bg-dark-300/50 border border-primary-500/20 rounded-lg text-white text-center focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                    />
                  </div>
                </div>
                
                <div className="bg-dark-200/30 rounded-xl p-4 border border-primary-500/10">
                  <div className="grid grid-cols-7 gap-3 mb-4 text-xs font-semibold text-gray-300 uppercase tracking-wide">
                    <div className="text-center p-2">Level</div>
                    <div className="text-center p-2">Yen Cost</div>
                    <div className="text-center p-2">ATK DMG</div>
                    <div className="text-center p-2">Range</div>
                    <div className="text-center p-2">SPA</div>
                    <div className="text-center p-2">Crit DMG</div>
                    <div className="text-center p-2">Crit %</div>
                  </div>
                  
                  {newUnit.upgradeStats?.levels.map((level, index) => (
                    <div key={index} className="grid grid-cols-7 gap-3 mb-3 items-center">
                      <div className="text-center text-white font-bold bg-gradient-to-r from-primary-500 to-secondary-500 py-3 rounded-lg shadow-lg">
                        Lv {level.level}
                      </div>
                      <input
                        type="number"
                        value={level.yenCost}
                        onChange={(e) => handleUpgradeStatChange(index, 'yenCost', parseInt(e.target.value) || 0)}
                        className="px-3 py-3 bg-dark-300/50 border border-primary-500/20 rounded-lg text-white text-center text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                        placeholder="0"
                      />
                      <input
                        type="number"
                        value={level.atkDamage}
                        onChange={(e) => handleUpgradeStatChange(index, 'atkDamage', parseInt(e.target.value) || 0)}
                        className="px-3 py-3 bg-dark-300/50 border border-primary-500/20 rounded-lg text-white text-center text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                        placeholder="0"
                      />
                      <input
                        type="number"
                        value={level.range}
                        onChange={(e) => handleUpgradeStatChange(index, 'range', parseInt(e.target.value) || 0)}
                        className="px-3 py-3 bg-dark-300/50 border border-primary-500/20 rounded-lg text-white text-center text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                        placeholder="0"
                      />
                      <input
                        type="number"
                        step="0.1"
                        value={level.spa}
                        onChange={(e) => handleUpgradeStatChange(index, 'spa', parseFloat(e.target.value) || 0)}
                        className="px-3 py-3 bg-dark-300/50 border border-primary-500/20 rounded-lg text-white text-center text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                        placeholder="0"
                      />
                      <input
                        type="number"
                        value={level.critDamage}
                        onChange={(e) => handleUpgradeStatChange(index, 'critDamage', parseInt(e.target.value) || 0)}
                        className="px-3 py-3 bg-dark-300/50 border border-primary-500/20 rounded-lg text-white text-center text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                        placeholder="0"
                      />
                      <input
                        type="number"
                        step="0.1"
                        value={level.critChance}
                        onChange={(e) => handleUpgradeStatChange(index, 'critChance', parseFloat(e.target.value) || 0)}
                        className="px-3 py-3 bg-dark-300/50 border border-primary-500/20 rounded-lg text-white text-center text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                        placeholder="0"
                      />
                    </div>
                  ))}
                  
                  <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <div className="text-xs text-blue-200 space-y-1">
                      <p className="font-semibold text-blue-100">Stats Guide:</p>
                      <p><span className="font-medium">Yen Cost:</span> Currency required for upgrade</p>
                      <p><span className="font-medium">SPA:</span> Speed/Attack Speed modifier</p>
                      <p><span className="font-medium">Crit DMG:</span> Critical damage multiplier</p>
                      <p><span className="font-medium">Crit %:</span> Critical hit probability</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills Section */}
              <div className="bg-gradient-to-r from-dark-100 to-dark-200 rounded-2xl p-6 border border-primary-500/20 shadow-xl mt-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-game font-bold text-white flex items-center gap-2">
                    <Zap className="h-6 w-6 text-yellow-400" />
                    Unit Skills & Abilities
                  </h3>
                  <button
                    onClick={addSkill}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-lg transition-all duration-200 hover:scale-105 shadow-lg"
                  >
                    <Plus className="h-4 w-4" />
                    Add Skill
                  </button>
                </div>
                
                <div className="space-y-4">
                  {newUnit.skills?.map((skill, index) => (
                    <div key={index} className="bg-dark-200/30 rounded-xl p-5 border border-primary-500/10">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-lg font-semibold text-white">Skill {index + 1}</h4>
                        <button
                          onClick={() => removeSkill(index)}
                          className="flex items-center gap-1 px-3 py-1 bg-red-500/80 hover:bg-red-500 text-white rounded-lg transition-all duration-200 text-sm"
                        >
                          <Trash2 className="h-3 w-3" />
                          Remove
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <input
                          type="text"
                          value={skill.name}
                          onChange={(e) => updateSkill(index, 'name', e.target.value)}
                          placeholder="Skill name"
                          className="px-4 py-3 bg-dark-300/50 border border-primary-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                        />
                        <select
                          value={skill.type}
                          onChange={(e) => updateSkill(index, 'type', e.target.value)}
                          className="px-4 py-3 bg-dark-300/50 border border-primary-500/20 rounded-lg text-white focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                        >
                          <option value="Active" className="bg-dark-300">Active Skill</option>
                          <option value="Passive" className="bg-dark-300">Passive Ability</option>
                        </select>
                      </div>
                      <textarea
                        value={skill.description}
                        onChange={(e) => updateSkill(index, 'description', e.target.value)}
                        placeholder="Describe the skill's effects and mechanics..."
                        className="w-full px-4 py-3 bg-dark-300/50 border border-primary-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all h-24 resize-none"
                      />
                    </div>
                  ))}
                  
                  {(!newUnit.skills || newUnit.skills.length === 0) && (
                    <div className="text-center py-8 text-gray-400">
                      <Zap className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No skills added yet. Click "Add Skill" to get started.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Evolution Section */}
              <div className="bg-gradient-to-r from-dark-100 to-dark-200 rounded-2xl p-6 border border-primary-500/20 shadow-xl mt-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-game font-bold text-white flex items-center gap-2">
                    <ArrowRight className="h-6 w-6 text-purple-400" />
                    Evolution Chain
                  </h3>
                  {!newUnit.doesntEvolve && (
                    <button
                      onClick={addEvolution}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all duration-200 hover:scale-105 shadow-lg"
                    >
                      <Plus className="h-4 w-4" />
                      Add Evolution
                    </button>
                  )}
                </div>
                
                {!newUnit.doesntEvolve ? (
                  <div className="space-y-6">
                    {newUnit.evolutions?.map((evolution, evoIndex) => (
                      <div key={evoIndex} className="bg-dark-200/30 rounded-xl p-5 border border-primary-500/10">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Crown className="h-5 w-5 text-yellow-400" />
                            Evolution Stage {evoIndex + 1}
                          </h4>
                          <button
                            onClick={() => removeEvolution(evoIndex)}
                            className="flex items-center gap-1 px-3 py-1 bg-red-500/80 hover:bg-red-500 text-white rounded-lg transition-all duration-200 text-sm"
                          >
                            <Trash2 className="h-3 w-3" />
                            Remove
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                          <input
                            type="text"
                            value={evolution.name}
                            onChange={(e) => updateEvolution(evoIndex, 'name', e.target.value)}
                            placeholder="Evolution name"
                            className="px-4 py-3 bg-dark-300/50 border border-primary-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                          />
                          <select
                            value={evolution.tier}
                            onChange={(e) => updateEvolution(evoIndex, 'tier', e.target.value)}
                            className="px-4 py-3 bg-dark-300/50 border border-primary-500/20 rounded-lg text-white focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                          >
                            {tiers.map(tier => (
                              <option key={tier} value={tier} className="bg-dark-300">{tier}</option>
                            ))}
                          </select>
                          <select
                            value={evolution.element}
                            onChange={(e) => updateEvolution(evoIndex, 'element', e.target.value)}
                            className="px-4 py-3 bg-dark-300/50 border border-primary-500/20 rounded-lg text-white focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                          >
                            {elements.map(element => (
                              <option key={element} value={element} className="bg-dark-300">{element}</option>
                            ))}
                          </select>
                          <select
                            value={evolution.rarity}
                            onChange={(e) => updateEvolution(evoIndex, 'rarity', e.target.value)}
                            className="px-4 py-3 bg-dark-300/50 border border-primary-500/20 rounded-lg text-white focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                          >
                            {rarities.map(rarity => (
                              <option key={rarity} value={rarity} className="bg-dark-300">{rarity}</option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <input
                            type="text"
                            value={evolution.image || ''}
                            onChange={(e) => updateEvolution(evoIndex, 'image', e.target.value)}
                            placeholder="Evolution image path (e.g., /images/units/unit_evo.webp)"
                            className="px-4 py-3 bg-dark-300/50 border border-primary-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                          />
                          <input
                            type="text"
                            value={evolution.shinyImage || ''}
                            onChange={(e) => updateEvolution(evoIndex, 'shinyImage', e.target.value)}
                            placeholder="Evolution shiny image path (e.g., /images/units/unit_evo_shiny.webp)"
                            className="px-4 py-3 bg-dark-300/50 border border-primary-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <input
                            type="number"
                            value={evolution.cost}
                            onChange={(e) => updateEvolution(evoIndex, 'cost', parseInt(e.target.value) || 0)}
                            placeholder="Evolution cost"
                            className="px-4 py-3 bg-dark-300/50 border border-primary-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                            min="0"
                          />
                          <textarea
                            value={evolution.description || ''}
                            onChange={(e) => updateEvolution(evoIndex, 'description', e.target.value)}
                            placeholder="Evolution description"
                            className="px-4 py-3 bg-dark-300/50 border border-primary-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all h-20 resize-none"
                          />
                        </div>

                        {/* Evolution Requirements */}
                        <div className="mb-6">
                          <div className="flex justify-between items-center mb-3">
                            <label className="text-sm font-semibold text-gray-300">Evolution Requirements</label>
                            <button
                              onClick={() => addEvolutionRequirement(evoIndex)}
                              className="flex items-center gap-1 px-3 py-1 bg-blue-500/80 hover:bg-blue-500 text-white rounded-lg transition-all duration-200 text-sm"
                            >
                              <Plus className="h-3 w-3" />
                              Add Requirement
                            </button>
                          </div>
                          <div className="space-y-2">
                            {evolution.requirements.map((requirement, reqIndex) => (
                              <div key={reqIndex} className="bg-dark-300/30 rounded-lg p-3 border border-blue-500/20">
                                <div className="flex gap-2 items-center">
                                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                                    {reqIndex + 1}
                                  </div>
                                  <input
                                    type="text"
                                    value={requirement}
                                    onChange={(e) => updateEvolutionRequirement(evoIndex, reqIndex, e.target.value)}
                                    placeholder="Enter requirement (e.g., Level 50, Mystic Core x3, 100k Gold)"
                                    className="flex-1 px-3 py-2 bg-dark-300/50 border border-primary-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all text-sm"
                                  />
                                  <button
                                    onClick={() => removeEvolutionRequirement(evoIndex, reqIndex)}
                                    className="px-2 py-2 bg-red-500/80 hover:bg-red-500 text-white rounded-lg transition-all duration-200"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            ))}
                            {evolution.requirements.length === 0 && (
                              <div className="text-center py-4 text-gray-400 text-sm">
                                No requirements added. Click "Add Requirement" to add evolution requirements.
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Evolution Level 60 Upgrade Stats */}
                        <div className="mb-6">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                              <TrendingUp className="h-5 w-5 text-green-400" />
                              Evolution Level 60 Upgrade Stats
                            </h4>
                            <div className="flex items-center gap-3">
                              <label className="text-sm font-medium text-gray-300">Max Upgrades:</label>
                              <input
                                type="number"
                                min="1"
                                max="10"
                                value={evolution.upgradeStats?.maxUpgrades || 4}
                                onChange={(e) => handleEvolutionMaxUpgradesChange(evoIndex, parseInt(e.target.value) || 4)}
                                className="w-20 px-3 py-2 bg-dark-300/50 border border-primary-500/20 rounded-lg text-white text-center focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                              />
                            </div>
                          </div>
                          
                          <div className="bg-dark-200/30 rounded-xl p-4 border border-primary-500/10">
                            <div className="grid grid-cols-7 gap-3 mb-4 text-xs font-semibold text-gray-300 uppercase tracking-wide">
                              <div className="text-center p-2">Level</div>
                              <div className="text-center p-2">Yen Cost</div>
                              <div className="text-center p-2">ATK DMG</div>
                              <div className="text-center p-2">Range</div>
                              <div className="text-center p-2">SPA</div>
                              <div className="text-center p-2">Crit DMG</div>
                              <div className="text-center p-2">Crit %</div>
                            </div>
                            
                            {evolution.upgradeStats?.levels.map((level, levelIndex) => (
                              <div key={levelIndex} className="grid grid-cols-7 gap-3 mb-3 items-center">
                                <div className="text-center text-white font-bold bg-gradient-to-r from-primary-500 to-secondary-500 py-3 rounded-lg shadow-lg">
                                  Lv {level.level}
                                </div>
                                <input
                                  type="number"
                                  value={level.yenCost}
                                  onChange={(e) => handleEvolutionUpgradeStatChange(evoIndex, levelIndex, 'yenCost', parseInt(e.target.value) || 0)}
                                  className="px-3 py-3 bg-dark-300/50 border border-primary-500/20 rounded-lg text-white text-center text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                                  placeholder="0"
                                />
                                <input
                                  type="number"
                                  value={level.atkDamage}
                                  onChange={(e) => handleEvolutionUpgradeStatChange(evoIndex, levelIndex, 'atkDamage', parseInt(e.target.value) || 0)}
                                  className="px-3 py-3 bg-dark-300/50 border border-primary-500/20 rounded-lg text-white text-center text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                                  placeholder="0"
                                />
                                <input
                                  type="number"
                                  value={level.range}
                                  onChange={(e) => handleEvolutionUpgradeStatChange(evoIndex, levelIndex, 'range', parseInt(e.target.value) || 0)}
                                  className="px-3 py-3 bg-dark-300/50 border border-primary-500/20 rounded-lg text-white text-center text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                                  placeholder="0"
                                />
                                <input
                                  type="number"
                                  step="0.1"
                                  value={level.spa}
                                  onChange={(e) => handleEvolutionUpgradeStatChange(evoIndex, levelIndex, 'spa', parseFloat(e.target.value) || 0)}
                                  className="px-3 py-3 bg-dark-300/50 border border-primary-500/20 rounded-lg text-white text-center text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                                  placeholder="0"
                                />
                                <input
                                  type="number"
                                  value={level.critDamage}
                                  onChange={(e) => handleEvolutionUpgradeStatChange(evoIndex, levelIndex, 'critDamage', parseInt(e.target.value) || 0)}
                                  className="px-3 py-3 bg-dark-300/50 border border-primary-500/20 rounded-lg text-white text-center text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                                  placeholder="0"
                                />
                                <input
                                  type="number"
                                  step="0.1"
                                  value={level.critChance}
                                  onChange={(e) => handleEvolutionUpgradeStatChange(evoIndex, levelIndex, 'critChance', parseFloat(e.target.value) || 0)}
                                  className="px-3 py-3 bg-dark-300/50 border border-primary-500/20 rounded-lg text-white text-center text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                                  placeholder="0"
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Evolution Bonuses */}
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-3">
                            <label className="text-sm font-semibold text-gray-300">Evolution Bonuses</label>
                            <button
                              onClick={() => addEvolutionBonus(evoIndex)}
                              className="flex items-center gap-1 px-3 py-1 bg-emerald-500/80 hover:bg-emerald-500 text-white rounded-lg transition-all duration-200 text-sm"
                            >
                              <Plus className="h-3 w-3" />
                              Add Bonus
                            </button>
                          </div>
                          <div className="space-y-2">
                            {evolution.bonuses.map((bonus, bonusIndex) => (
                              <div key={bonusIndex} className="flex gap-2">
                                <input
                                  type="text"
                                  value={bonus}
                                  onChange={(e) => updateEvolutionBonus(evoIndex, bonusIndex, e.target.value)}
                                  placeholder="Evolution bonus (e.g., +50% damage, new ability)"
                                  className="flex-1 px-4 py-2 bg-dark-300/50 border border-primary-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                                />
                                <button
                                  onClick={() => removeEvolutionBonus(evoIndex, bonusIndex)}
                                  className="px-3 py-2 bg-red-500/80 hover:bg-red-500 text-white rounded-lg transition-all duration-200"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {(!newUnit.evolutions || newUnit.evolutions.length === 0) && (
                      <div className="text-center py-8 text-gray-400">
                        <ArrowRight className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No evolutions added yet. Click "Add Evolution" to create evolution stages.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400 bg-dark-200/20 rounded-xl border border-orange-500/20">
                    <Shield className="h-12 w-12 mx-auto mb-3 text-orange-400" />
                    <p className="text-orange-200">This unit is marked as non-evolving.</p>
                    <p className="text-sm">Uncheck "This unit doesn't evolve" to add evolution stages.</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-4 mt-8">
                <button
                  onClick={() => {
                    setActiveTab('manage');
                    setEditingUnit(null);
                    clearForm();
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all duration-200 hover:scale-105"
                >
                  <X className="h-5 w-5" />
                  Cancel
                </button>
                <button
                  onClick={handleSaveUnit}
                  className="px-8 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white rounded-lg transition-all duration-200 hover:scale-105 shadow-lg font-semibold"
                >
                  <Save className="h-5 w-5" />
                  {editingUnit ? 'Update Unit' : 'Create Unit'}
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {/* Management Header */}
            <div className="bg-gradient-to-r from-dark-100 to-dark-200 rounded-2xl p-6 border border-primary-500/20 shadow-xl">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-game font-bold text-white">
                      Unit Management
                    </h2>
                    <p className="text-gray-400">
                      {units.length} total units • {units.filter(u => u.isBaseForm).length} base forms
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => {
                      setBulkDeleteMode(!bulkDeleteMode)
                      setSelectedUnits(new Set())
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 ${
                      bulkDeleteMode 
                        ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg' 
                        : 'bg-gray-600 hover:bg-gray-700 text-white'
                    }`}
                  >
                    {bulkDeleteMode ? <X className="h-4 w-4" /> : <CheckSquare className="h-4 w-4" />}
                    {bulkDeleteMode ? 'Cancel Selection' : 'Bulk Delete'}
                  </button>
                  
                  {bulkDeleteMode && (
                    <>
                      <button
                        onClick={selectAllUnits}
                        className="flex items-center gap-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 text-sm hover:scale-105"
                      >
                        <CheckSquare className="h-3 w-3" />
                        Select All
                      </button>
                      <button
                        onClick={deselectAllUnits}
                        className="flex items-center gap-1 px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-all duration-200 text-sm hover:scale-105"
                      >
                        <Square className="h-3 w-3" />
                        Deselect All
                      </button>
                      <button
                        onClick={handleBulkDelete}
                        disabled={selectedUnits.size === 0}
                        className="flex items-center gap-1 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-800 disabled:opacity-50 text-white rounded-lg transition-all duration-200 font-medium hover:scale-105 disabled:hover:scale-100"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete Selected ({selectedUnits.size})
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Units Grid */}
            <div className="bg-gradient-to-r from-dark-100 to-dark-200 rounded-2xl p-6 border border-primary-500/20 shadow-xl">
              {units.length > 0 ? (
                <div className="space-y-3">
                  {units.map((unit, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`group p-4 rounded-xl flex items-center justify-between transition-all duration-200 hover:scale-[1.02] ${
                        selectedUnits.has(unit.name) 
                          ? 'bg-blue-500/20 border border-blue-400/50 shadow-lg shadow-blue-500/20' 
                          : 'bg-dark-200/30 hover:bg-dark-200/50 border border-primary-500/10'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {bulkDeleteMode && (
                          <button
                            onClick={() => toggleUnitSelection(unit.name)}
                            className="text-white hover:text-blue-400 transition-colors p-1 hover:bg-blue-500/20 rounded"
                          >
                            {selectedUnits.has(unit.name) ? (
                              <CheckSquare className="h-5 w-5 text-blue-400" />
                            ) : (
                              <Square className="h-5 w-5" />
                            )}
                          </button>
                        )}
                        
                        <div className="relative w-16 h-16 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-xl flex items-center justify-center overflow-hidden border border-primary-500/20">
                          {unit.image ? (
                            <img src={unit.image} alt={unit.name} className="w-full h-full object-cover rounded-xl" />
                          ) : (
                            <div className="text-primary-400 text-xs font-medium">No Image</div>
                          )}
                          {unit.isBaseForm && (
                            <div className="absolute top-0 right-0 w-3 h-3 bg-yellow-400 rounded-full border border-dark-200"></div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-game font-bold text-white text-lg">{unit.name}</h3>
                            {unit.isBaseForm && (
                              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-200 text-xs font-semibold rounded-full border border-yellow-500/30">
                                BASE
                              </span>
                            )}
                          </div>
                          <div className="flex gap-3 text-sm items-center">
                            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-dark-300/50 border border-primary-500/20">
                              <img 
                                src={getTierData(unit.tier).icon} 
                                alt={getTierData(unit.tier).label}
                                className="w-4 h-4 object-contain"
                              />
                              <span className="text-xs font-bold text-white">{getTierData(unit.tier).label}</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-dark-300/50 border border-primary-500/20">
                              <span className="text-xs font-medium text-gray-300">{unit.element}</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-dark-300/50 border border-primary-500/20">
                              <span className="text-xs font-medium text-gray-300">{unit.rarity}</span>
                            </div>
                            {unit.skills && unit.skills.length > 0 && (
                              <div className="flex items-center gap-1 px-2 py-1 rounded bg-yellow-500/20 border border-yellow-500/30">
                                <Zap className="h-3 w-3 text-yellow-400" />
                                <span className="text-xs font-medium text-yellow-200">{unit.skills.length} Skills</span>
                              </div>
                            )}
                            {unit.evolutions && unit.evolutions.length > 0 && (
                              <div className="flex items-center gap-1 px-2 py-1 rounded bg-purple-500/20 border border-purple-500/30">
                                <ArrowRight className="h-3 w-3 text-purple-400" />
                                <span className="text-xs font-medium text-purple-200">{unit.evolutions.length} Evolutions</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {!bulkDeleteMode && (
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            onClick={() => handleEditUnit(unit)}
                            className="flex items-center gap-1 px-3 py-2 bg-blue-500/80 hover:bg-blue-500 text-white rounded-lg transition-all duration-200 hover:scale-105"
                            title="Edit unit"
                          >
                            <Edit2 className="h-4 w-4" />
                            <span className="text-sm">Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteUnit(unit.name)}
                            className="flex items-center gap-1 px-3 py-2 bg-red-500/80 hover:bg-red-500 text-white rounded-lg transition-all duration-200 hover:scale-105"
                            title="Delete unit"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="text-sm">Delete</span>
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 mx-auto mb-4 text-gray-400 opacity-50" />
                  <h3 className="text-xl font-semibold text-gray-300 mb-2">No Units Found</h3>
                  <p className="text-gray-400 mb-6">Start by adding your first unit in the "Add New Unit" tab.</p>
                  <button
                    onClick={() => setActiveTab('add')}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white rounded-lg transition-all duration-200 hover:scale-105 shadow-lg mx-auto"
                  >
                    <Plus className="h-5 w-5" />
                    Add First Unit
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

             {/* Confirmation Modal */}
       <ConfirmationModal
         isOpen={confirmationModal.isOpen}
         onClose={() => setConfirmationModal({ ...confirmationModal, isOpen: false })}
         onConfirm={confirmationModal.onConfirm}
         title={confirmationModal.title}
         message={confirmationModal.message}
         confirmText="Delete"
         cancelText="Cancel"
         isDangerous={true}
       />

       {/* Toast Notification */}
       <Toast
         message={toast.message}
         type={toast.type}
         isVisible={toast.isVisible}
         onClose={() => setToast({ ...toast, isVisible: false })}
       />
    </div>
  )
}

export default AdminPanel 