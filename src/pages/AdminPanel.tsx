import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Save, Trash2, Edit, Upload, Video, Target, Tags, Zap, X, AlertTriangle, RotateCcw, CheckSquare, Square } from 'lucide-react'
import { UnitData } from '../data/unitsDatabase'
import { useUnits } from '../contexts/UnitsContext'
import Toast from '../components/Toast'

interface NewUnit extends Omit<UnitData, 'evolutions'> {
  evolutions?: Array<{
    name: string
    tier: string
    element: string
    rarity: string
    cost: number
    image?: string
    shinyImage?: string
    description?: string
    requirements: string
    bonuses: string[]
  }>
  videoUrl?: string
  tags?: string[]
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
    element: 'Unknown',
    rarity: 'Rare',
    cost: 100,
    description: '',
    obtainment: '',
    videoUrl: '',
    tags: [],
    isBaseForm: true,
    stats: {
      damage: 'C',
      speed: 'C',
      range: 'C'
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
  const elements = ['Water', 'Fire', 'Wind', 'Earth', 'Lightning', 'Nature', 'Dark', 'Light', 'Holy', 'Curse', 'Shadow', 'Death', 'Soul', 'Psychic', 'Time', 'Space', 'Blood', 'Tech', 'Cosmic', 'Rubber', 'Willpower', 'Chakra', 'Passion', 'Blast', 'Unbound', 'Unknown', 'Spark']
  const rarities = ['Vanguard', 'Exclusive', 'Secret', 'Mythical', 'Legendary', 'Epic', 'Rare', 'Common', 'Mythic']
  const statGrades = ['S', 'A', 'B', 'C', 'D']

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
          element: 'Unknown',
          rarity: 'Rare',
          cost: 100,
          description: '',
          requirements: '',
          bonuses: []
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

  const clearForm = () => {
    setNewUnit({
      name: '',
      tier: 'A+',
      element: 'Unknown',
      rarity: 'Rare',
      cost: 100,
      description: '',
      obtainment: '',
      videoUrl: '',
      tags: [],
      isBaseForm: true,
      stats: {
        damage: 'C',
        speed: 'C',
        range: 'C'
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
      traits: newUnit.tags || [],
      trivia: newUnit.trivia || []
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
      element: 'Unknown',
      rarity: 'Rare',
      cost: 100,
      description: '',
      obtainment: '',
      videoUrl: '',
      tags: [],
      isBaseForm: true,
      stats: {
        damage: 'C',
        speed: 'C',
        range: 'C'
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
        }
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

  return (
    <div className="min-h-screen pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-game font-bold text-gradient-primary mb-2">
              Admin Panel
            </h1>
            <p className="text-gray-300">Manage units and content</p>
          </div>
          <button
            onClick={() => setConfirmationModal({
              isOpen: true,
              title: 'Reset Database',
              message: 'Are you sure you want to reset all units to default? This will remove all custom units and modifications.',
              onConfirm: resetToDefault
            })}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Reset to Default
          </button>
        </div>

        {/* Tabs */}
        <div className="flex mb-8">
          <button
            onClick={() => setActiveTab('add')}
            className={`px-6 py-3 rounded-t-lg transition-colors ${
              activeTab === 'add' 
                ? 'bg-primary-600 text-white' 
                : 'bg-dark-200 text-gray-400 hover:text-white'
            }`}
          >
            {editingUnit ? 'Edit Unit' : 'Add Unit'}
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`px-6 py-3 rounded-t-lg transition-colors ${
              activeTab === 'manage' 
                ? 'bg-primary-600 text-white' 
                : 'bg-dark-200 text-gray-400 hover:text-white'
            }`}
          >
            Manage Units ({units.length})
          </button>
        </div>

        {/* Content */}
        {activeTab === 'add' ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="card p-6">
              <h2 className="text-2xl font-game font-bold text-white mb-6 flex items-center">
                <Plus className="h-6 w-6 mr-2" />
                {editingUnit ? 'Edit Unit' : 'Add New Unit'}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Unit Name *
                    </label>
                    <input
                      type="text"
                      value={newUnit.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-4 py-3 bg-dark-200/50 border border-primary-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-400"
                      placeholder="Enter unit name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tier
                    </label>
                    <select
                      value={newUnit.tier}
                      onChange={(e) => handleInputChange('tier', e.target.value)}
                      className="w-full px-4 py-3 bg-dark-200/50 border border-primary-500/20 rounded-lg text-white focus:outline-none focus:border-primary-400"
                    >
                      {tiers.map(tier => (
                        <option key={tier} value={tier}>Tier {tier}</option>
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
                      className="w-full px-4 py-3 bg-dark-200/50 border border-primary-500/20 rounded-lg text-white focus:outline-none focus:border-primary-400"
                    >
                      {elements.map(element => (
                        <option key={element} value={element}>{element}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Rarity
                    </label>
                    <select
                      value={newUnit.rarity}
                      onChange={(e) => handleInputChange('rarity', e.target.value)}
                      className="w-full px-4 py-3 bg-dark-200/50 border border-primary-500/20 rounded-lg text-white focus:outline-none focus:border-primary-400"
                    >
                      {rarities.map(rarity => (
                        <option key={rarity} value={rarity}>{rarity}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Cost (Gems)
                    </label>
                    <input
                      type="number"
                      value={newUnit.cost}
                      onChange={(e) => handleInputChange('cost', parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-3 bg-dark-200/50 border border-primary-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-400"
                      min="0"
                    />
                  </div>
                </div>

                {/* Images and Media */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Upload className="h-4 w-4 inline mr-1" />
                      Unit Image URL
                    </label>
                    <input
                      type="text"
                      value={newUnit.image || ''}
                      onChange={(e) => handleInputChange('image', e.target.value)}
                      className="w-full px-4 py-3 bg-dark-200/50 border border-primary-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-400"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Upload className="h-4 w-4 inline mr-1" />
                      Shiny Image URL
                    </label>
                    <input
                      type="text"
                      value={newUnit.shinyImage || ''}
                      onChange={(e) => handleInputChange('shinyImage', e.target.value)}
                      className="w-full px-4 py-3 bg-dark-200/50 border border-primary-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-400"
                      placeholder="https://example.com/shiny-image.jpg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Video className="h-4 w-4 inline mr-1" />
                      YouTube Video URL
                    </label>
                    <input
                      type="text"
                      value={newUnit.videoUrl || ''}
                      onChange={(e) => handleInputChange('videoUrl', e.target.value)}
                      className="w-full px-4 py-3 bg-dark-200/50 border border-primary-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-400"
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Tags className="h-4 w-4 inline mr-1" />
                      Unit Tags (comma separated)
                    </label>
                    <input
                      type="text"
                      value={newUnit.tags?.join(', ') || ''}
                      onChange={(e) => handleInputChange('tags', e.target.value.split(',').map(tag => tag.trim()).filter(Boolean))}
                      className="w-full px-4 py-3 bg-dark-200/50 border border-primary-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-400"
                      placeholder="DPS, Tank, Support"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newUnit.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-4 py-3 bg-dark-200/50 border border-primary-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-400 h-24 resize-none"
                  placeholder="Describe the unit's lore and abilities..."
                />
              </div>

              {/* How to Obtain */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  How to Obtain
                </label>
                <input
                  type="text"
                  value={newUnit.obtainment || ''}
                  onChange={(e) => handleInputChange('obtainment', e.target.value)}
                  className="w-full px-4 py-3 bg-dark-200/50 border border-primary-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-400"
                  placeholder="Banner summon, event, etc."
                />
              </div>

              {/* Combat Stats */}
              <div className="mt-6">
                <h3 className="text-lg font-game font-bold text-white mb-4 flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Combat Stats
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Damage</label>
                    <select
                      value={newUnit.stats?.damage || 'C'}
                      onChange={(e) => handleStatsChange('damage', e.target.value)}
                      className="w-full px-4 py-3 bg-dark-200/50 border border-primary-500/20 rounded-lg text-white focus:outline-none focus:border-primary-400"
                    >
                      {statGrades.map(grade => (
                        <option key={grade} value={grade}>{grade}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Speed</label>
                    <select
                      value={newUnit.stats?.speed || 'C'}
                      onChange={(e) => handleStatsChange('speed', e.target.value)}
                      className="w-full px-4 py-3 bg-dark-200/50 border border-primary-500/20 rounded-lg text-white focus:outline-none focus:border-primary-400"
                    >
                      {statGrades.map(grade => (
                        <option key={grade} value={grade}>{grade}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Range</label>
                    <select
                      value={newUnit.stats?.range || 'C'}
                      onChange={(e) => handleStatsChange('range', e.target.value)}
                      className="w-full px-4 py-3 bg-dark-200/50 border border-primary-500/20 rounded-lg text-white focus:outline-none focus:border-primary-400"
                    >
                      {statGrades.map(grade => (
                        <option key={grade} value={grade}>{grade}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Upgrade Stats Progression */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-game font-bold text-white flex items-center">
                    <Zap className="h-5 w-5 mr-2" />
                    Level 60 Upgrade Stats (Per Upgrade Level)
                  </h3>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-300">Max Upgrades:</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={newUnit.upgradeStats?.maxUpgrades || 4}
                      onChange={(e) => handleMaxUpgradesChange(parseInt(e.target.value) || 4)}
                      className="w-16 px-2 py-1 bg-dark-200/50 border border-primary-500/20 rounded text-white text-center focus:outline-none focus:border-primary-400"
                    />
                  </div>
                </div>
                
                <div className="bg-dark-200/20 p-4 rounded-lg">
                  <div className="grid grid-cols-7 gap-2 mb-3 text-xs font-medium text-gray-300">
                    <div className="text-center">Level</div>
                    <div className="text-center">Yen Cost</div>
                    <div className="text-center">ATK Damage</div>
                    <div className="text-center">Range</div>
                    <div className="text-center">SPA</div>
                    <div className="text-center">Crit DMG</div>
                    <div className="text-center">Crit Chance</div>
                  </div>
                  
                                      {newUnit.upgradeStats?.levels.map((level, index) => (
                      <div key={index} className="grid grid-cols-7 gap-2 mb-2 items-center">
                        <div className="text-center text-white font-medium bg-primary-600/20 py-2 rounded">
                          {level.level}
                        </div>
                        <input
                          type="number"
                          value={level.yenCost}
                          onChange={(e) => handleUpgradeStatChange(index, 'yenCost', parseInt(e.target.value) || 0)}
                          className="px-2 py-2 bg-dark-200/50 border border-primary-500/20 rounded text-white text-center text-sm focus:outline-none focus:border-primary-400"
                          placeholder="0"
                        />
                        <input
                          type="number"
                          value={level.atkDamage}
                          onChange={(e) => handleUpgradeStatChange(index, 'atkDamage', parseInt(e.target.value) || 0)}
                          className="px-2 py-2 bg-dark-200/50 border border-primary-500/20 rounded text-white text-center text-sm focus:outline-none focus:border-primary-400"
                          placeholder="0"
                        />
                        <input
                          type="number"
                          value={level.range}
                          onChange={(e) => handleUpgradeStatChange(index, 'range', parseInt(e.target.value) || 0)}
                          className="px-2 py-2 bg-dark-200/50 border border-primary-500/20 rounded text-white text-center text-sm focus:outline-none focus:border-primary-400"
                          placeholder="0"
                        />
                        <input
                          type="number"
                          step="0.1"
                          value={level.spa}
                          onChange={(e) => handleUpgradeStatChange(index, 'spa', parseFloat(e.target.value) || 0)}
                          className="px-2 py-2 bg-dark-200/50 border border-primary-500/20 rounded text-white text-center text-sm focus:outline-none focus:border-primary-400"
                          placeholder="0"
                        />
                        <input
                          type="number"
                          value={level.critDamage}
                          onChange={(e) => handleUpgradeStatChange(index, 'critDamage', parseInt(e.target.value) || 0)}
                          className="px-2 py-2 bg-dark-200/50 border border-primary-500/20 rounded text-white text-center text-sm focus:outline-none focus:border-primary-400"
                          placeholder="0"
                        />
                        <input
                          type="number"
                          step="0.1"
                          value={level.critChance}
                          onChange={(e) => handleUpgradeStatChange(index, 'critChance', parseFloat(e.target.value) || 0)}
                          className="px-2 py-2 bg-dark-200/50 border border-primary-500/20 rounded text-white text-center text-sm focus:outline-none focus:border-primary-400"
                          placeholder="0"
                        />
                      </div>
                    ))}
                  
                  <div className="mt-4 text-xs text-gray-400">
                    <p><strong>Note:</strong> These are the base stats for a Level 60 unit at each upgrade level.</p>
                    <p>• <strong>Yen Cost:</strong> Cost in yen currency to upgrade to this level</p>
                    <p>• <strong>SPA:</strong> Speed/Attack Speed stat</p>
                    <p>• <strong>Crit DMG:</strong> Critical hit damage multiplier</p>
                    <p>• <strong>Crit Chance:</strong> Critical hit chance percentage</p>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-game font-bold text-white flex items-center">
                    <Zap className="h-5 w-5 mr-2" />
                    Unit Skills
                  </h3>
                  <button
                    onClick={addSkill}
                    className="px-4 py-2 bg-secondary-600 hover:bg-secondary-700 text-white rounded-lg transition-colors"
                  >
                    Add Skill
                  </button>
                </div>
                {newUnit.skills?.map((skill, index) => (
                  <div key={index} className="bg-dark-200/30 p-4 rounded-lg mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <input
                        type="text"
                        value={skill.name}
                        onChange={(e) => updateSkill(index, 'name', e.target.value)}
                        placeholder="Skill name"
                        className="px-4 py-2 bg-dark-200/50 border border-primary-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-400"
                      />
                      <select
                        value={skill.type}
                        onChange={(e) => updateSkill(index, 'type', e.target.value)}
                        className="px-4 py-2 bg-dark-200/50 border border-primary-500/20 rounded-lg text-white focus:outline-none focus:border-primary-400"
                      >
                        <option value="Active">Active</option>
                        <option value="Passive">Passive</option>
                      </select>
                      <button
                        onClick={() => removeSkill(index)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                    <textarea
                      value={skill.description}
                      onChange={(e) => updateSkill(index, 'description', e.target.value)}
                      placeholder="Skill description"
                      className="w-full px-4 py-2 bg-dark-200/50 border border-primary-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-400 h-20 resize-none"
                    />
                  </div>
                ))}
              </div>

              {/* Evolutions */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-game font-bold text-white">Unit Evolutions</h3>
                  <button
                    onClick={addEvolution}
                    className="px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded-lg transition-colors"
                  >
                    Add Evolution
                  </button>
                </div>
                {newUnit.evolutions?.map((evolution, evoIndex) => (
                  <div key={evoIndex} className="bg-dark-200/30 p-4 rounded-lg mb-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-md font-bold text-white">Evolution {evoIndex + 1}</h4>
                      <button
                        onClick={() => removeEvolution(evoIndex)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded transition-colors text-sm"
                      >
                        Remove Evolution
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <input
                        type="text"
                        value={evolution.name}
                        onChange={(e) => updateEvolution(evoIndex, 'name', e.target.value)}
                        placeholder="Evolution name"
                        className="px-4 py-2 bg-dark-200/50 border border-primary-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-400"
                      />
                      <select
                        value={evolution.tier}
                        onChange={(e) => updateEvolution(evoIndex, 'tier', e.target.value)}
                        className="px-4 py-2 bg-dark-200/50 border border-primary-500/20 rounded-lg text-white focus:outline-none focus:border-primary-400"
                      >
                        {tiers.map(tier => (
                          <option key={tier} value={tier}>Tier {tier}</option>
                        ))}
                      </select>
                      <select
                        value={evolution.element}
                        onChange={(e) => updateEvolution(evoIndex, 'element', e.target.value)}
                        className="px-4 py-2 bg-dark-200/50 border border-primary-500/20 rounded-lg text-white focus:outline-none focus:border-primary-400"
                      >
                        {elements.map(element => (
                          <option key={element} value={element}>{element}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        value={evolution.cost}
                        onChange={(e) => updateEvolution(evoIndex, 'cost', parseInt(e.target.value) || 0)}
                        placeholder="Evolution cost"
                        className="px-4 py-2 bg-dark-200/50 border border-primary-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-400"
                        min="0"
                      />
                    </div>

                    <textarea
                      value={evolution.requirements}
                      onChange={(e) => updateEvolution(evoIndex, 'requirements', e.target.value)}
                      placeholder="Evolution requirements"
                      className="w-full px-4 py-2 bg-dark-200/50 border border-primary-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-400 h-16 resize-none mb-4"
                    />

                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-gray-300">Evolution Bonuses</label>
                        <button
                          onClick={() => addEvolutionBonus(evoIndex)}
                          className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors"
                        >
                          Add Bonus
                        </button>
                      </div>
                      {evolution.bonuses.map((bonus, bonusIndex) => (
                        <div key={bonusIndex} className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={bonus}
                            onChange={(e) => updateEvolutionBonus(evoIndex, bonusIndex, e.target.value)}
                            placeholder="Evolution bonus"
                            className="flex-1 px-4 py-2 bg-dark-200/50 border border-primary-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-400"
                          />
                          <button
                            onClick={() => removeEvolutionBonus(evoIndex, bonusIndex)}
                            className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Save Button */}
              <div className="mt-8 flex justify-end gap-4">
                <button
                  onClick={clearForm}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <X className="h-5 w-5" />
                  Clear Form
                </button>
                <button
                  onClick={handleSaveUnit}
                  className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Save className="h-5 w-5" />
                  {editingUnit ? 'Update Unit' : 'Save Unit'}
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-game font-bold text-white">
                Manage Units ({units.length} total)
              </h2>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setBulkDeleteMode(!bulkDeleteMode)
                    setSelectedUnits(new Set())
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    bulkDeleteMode 
                      ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                      : 'bg-gray-600 hover:bg-gray-700 text-white'
                  }`}
                >
                  {bulkDeleteMode ? 'Cancel Selection' : 'Bulk Delete'}
                </button>
                
                {bulkDeleteMode && (
                  <>
                    <button
                      onClick={selectAllUnits}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                    >
                      Select All
                    </button>
                    <button
                      onClick={deselectAllUnits}
                      className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
                    >
                      Deselect All
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      disabled={selectedUnits.size === 0}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:opacity-50 text-white rounded-lg transition-colors font-medium"
                    >
                      Delete Selected ({selectedUnits.size})
                    </button>
                  </>
                )}
              </div>
            </div>
            
            <div className="grid gap-4">
              {units.map((unit, index) => (
                <div 
                  key={index} 
                  className={`p-4 rounded-lg flex items-center justify-between transition-colors ${
                    selectedUnits.has(unit.name) 
                      ? 'bg-blue-600/20 border border-blue-500/50' 
                      : 'bg-dark-200/30 hover:bg-dark-200/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {bulkDeleteMode && (
                      <button
                        onClick={() => toggleUnitSelection(unit.name)}
                        className="text-white hover:text-blue-400 transition-colors"
                      >
                        {selectedUnits.has(unit.name) ? (
                          <CheckSquare className="h-5 w-5" />
                        ) : (
                          <Square className="h-5 w-5" />
                        )}
                      </button>
                    )}
                    
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-lg flex items-center justify-center overflow-hidden">
                      {unit.image ? (
                        <img src={unit.image} alt={unit.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-primary-400 text-xs">No Image</div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-game font-bold text-white">{unit.name}</h3>
                      <div className="flex gap-2 text-sm items-center">
                        <div className="flex items-center gap-1 px-2 py-1 rounded bg-dark-300/50">
                          <img 
                            src={getTierData(unit.tier).icon} 
                            alt={getTierData(unit.tier).label}
                            className="w-3 h-3 object-contain"
                          />
                          <span className="text-xs font-bold text-white">{getTierData(unit.tier).label}</span>
                        </div>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-400">{unit.element}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-yellow-400">{unit.cost} gems</span>
                      </div>
                    </div>
                  </div>
                  
                  {!bulkDeleteMode && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditUnit(unit)}
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUnit(unit.name)}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
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