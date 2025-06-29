import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, Crown, Sparkles, ExternalLink, Info, Swords, Star, 
  TrendingUp, Gift, Play, Award, Target, Eye, X, Zap, Sword
} from 'lucide-react'
import { useUnits } from '../contexts/UnitsContext'
import { 
  UnitData, StatGrade, calculateBaseStats, formatStatDisplay, 
  getAvailableStatGrades, getStatRange, calculateCustomStatValue, 
  applyStatBonuses, STAT_RANGES 
} from '../data/unitsDatabase'
import { Dialog } from '@headlessui/react'

const getTierData = (tier: string) => {
  const tierMap: { [key: string]: { icon: string; label: string } } = {
    Broken: { icon: '/images/Unit Tiers/Broken.webp', label: 'Broken' },
    Meta: { icon: '/images/Unit Tiers/Meta.webp', label: 'Meta' },
    SemiMeta: { icon: '/images/Unit Tiers/SemiMeta.webp', label: 'Semi-Meta' },
    MetaSupport: { icon: '/images/Unit Tiers/MetaSupport.webp', label: 'Meta Support' },
    Support: { icon: '/images/Unit Tiers/Support.webp', label: 'Support' },
    Good: { icon: '/images/Unit Tiers/Good.webp', label: 'Good' },
    Bad: { icon: '/images/Unit Tiers/Bad.webp', label: 'Bad' }
  }
  return tierMap[tier] || { icon: '/images/Unit Tiers/Bad.webp', label: tier }
}

const getElementIcon = (element: string) => {
  const elementMap: { [key: string]: string } = {
    Water: '/images/Elements/Water.webp',
    Fire: '/images/Elements/Fire.webp',
    Nature: '/images/Elements/Nature.webp',
    Passion: '/images/Elements/Passion.webp',
    Blast: '/images/Elements/Blast.webp',
    Cosmic: '/images/Elements/Cosmic.webp',
    Curse: '/images/Elements/Curse.webp',
    Holy: '/images/Elements/Holy (1).webp',
    Spark: '/images/Elements/Spark.webp',
    Unbound: '/images/Elements/Unbound.webp',
    UnknownElement: '/images/Elements/UnknownElement.webp'
  }
  return elementMap[element] || '/images/Elements/UnknownElement.webp'
}

// TRAIT DATA
const TRAITS = [
  {
    key: 'Monarch',
    name: 'Monarch',
    icon: '/images/traits/Monarch.webp',
    description: 'Damage +300%, SPA -10%, Range +5%, ONE PLACEMENT',
    bonus: { damage: 300, spa: 10, range: 5, critChance: 0, critDamage: 0 }
  },
  {
    key: 'Ethereal',
    name: 'Ethereal',
    icon: '/images/traits/Ethereal.webp',
    description: 'Damage +20%, SPA -20%, Range +5%',
    bonus: { damage: 20, spa: 20, range: 5, critChance: 0, critDamage: 0 }
  },
  {
    key: 'Deadeye',
    name: 'Deadeye',
    icon: '/images/traits/Deadeye.webp',
    description: 'Crit Chance +45%, Crit Damage +50%',
    bonus: { damage: 0, spa: 0, range: 0, critChance: 45, critDamage: 50 }
  },
  {
    key: 'Solar',
    name: 'Solar',
    icon: '/images/traits/Solar.webp',
    description: 'Damage +10%, SPA -5%, Range +25%',
    bonus: { damage: 10, spa: 5, range: 25, critChance: 0, critDamage: 0 }
  },
  {
    key: 'Blitz',
    name: 'Blitz',
    icon: '/images/traits/Blitz.webp',
    description: 'SPA -20%',
    bonus: { damage: 0, spa: 20, range: 0, critChance: 0, critDamage: 0 }
  },
  {
    key: 'Fortune',
    name: 'Fortune',
    icon: '/images/traits/Fortune.webp',
    description: 'Farm: +20% Cash income. Non-farm: -10% upgrade cost.',
    bonus: { damage: 0, spa: 0, range: 0, critChance: 0, critDamage: 0 }
  },
  {
    key: 'Marksman',
    name: 'Marksman',
    icon: '/images/traits/Marksman.webp',
    description: 'Range +30%',
    bonus: { damage: 0, spa: 0, range: 30, critChance: 0, critDamage: 0 }
  },
  {
    key: 'Scholar',
    name: 'Scholar',
    icon: '/images/traits/Scholar.webp',
    description: 'EXP +50%',
    bonus: { damage: 0, spa: 0, range: 0, critChance: 0, critDamage: 0 }
  },
  // Vigor with levels
  {
    key: 'Vigor',
    name: 'Vigor',
    icon: '/images/traits/Vigor.webp',
    levels: [
      { label: 'I', description: 'Damage +5%', bonus: { damage: 5, spa: 0, range: 0, critChance: 0, critDamage: 0 } },
      { label: 'II', description: 'Damage +10%', bonus: { damage: 10, spa: 0, range: 0, critChance: 0, critDamage: 0 } },
      { label: 'III', description: 'Damage +15%', bonus: { damage: 15, spa: 0, range: 0, critChance: 0, critDamage: 0 } }
    ]
  },
  // Swift with levels
  {
    key: 'Swift',
    name: 'Swift',
    icon: '/images/traits/Swift.webp',
    levels: [
      { label: 'I', description: 'SPA -5%', bonus: { damage: 0, spa: 5, range: 0, critChance: 0, critDamage: 0 } },
      { label: 'II', description: 'SPA -7.5%', bonus: { damage: 0, spa: 7.5, range: 0, critChance: 0, critDamage: 0 } },
      { label: 'III', description: 'SPA -12.5%', bonus: { damage: 0, spa: 12.5, range: 0, critChance: 0, critDamage: 0 } }
    ]
  },
  // Range with levels
  {
    key: 'Range',
    name: 'Range',
    icon: '/images/traits/Range.webp',
    levels: [
      { label: 'I', description: 'Range +5%', bonus: { damage: 0, spa: 0, range: 5, critChance: 0, critDamage: 0 } },
      { label: 'II', description: 'Range +10%', bonus: { damage: 0, spa: 0, range: 10, critChance: 0, critDamage: 0 } },
      { label: 'III', description: 'Range +15%', bonus: { damage: 0, spa: 0, range: 15, critChance: 0, critDamage: 0 } }
    ]
  }
]

// Helper type guard
function hasLevels(trait: any): trait is { levels: any[] } {
  return Array.isArray(trait?.levels);
}

const UnitDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { units } = useUnits()
  
  const unitName = decodeURIComponent(id || '')
  const unit = units.find(u => u.name === unitName)

  // Advanced modal features state
  const [isShiny, setIsShiny] = useState(false)
  const [isImageEnlarged, setIsImageEnlarged] = useState(false)
  const [selectedLevel, setSelectedLevel] = useState(0)
  const [selectedStats, setSelectedStats] = useState<{damage: StatGrade, speed: StatGrade, range: StatGrade}>({
    damage: 'D',
    speed: 'D', 
    range: 'D'
  })
  const [selectedPercentages, setSelectedPercentages] = useState<{damage: number, speed: number, range: number}>({
    damage: 0,
    speed: 0,
    range: 0
  })

  // Trait preview state
  const [previewTraitKey, setPreviewTraitKey] = useState<string | null>(null)
  const [traitModalOpen, setTraitModalOpen] = useState(false)
  const [traitLevel, setTraitLevel] = useState<{ [traitKey: string]: number }>({})
  // Determine the trait to use for calculations (preview or actual)
  let selectedTrait: any = null;
  let traitBonus: { damage: number; spa: number; range: number; critChance: number; critDamage: number } = { damage: 0, spa: 0, range: 0, critChance: 0, critDamage: 0 };
  if (previewTraitKey) {
    const [baseKey, levelLabel] = previewTraitKey.split(' ');
    const trait = TRAITS.find(t => t.key === baseKey);
    if (trait && hasLevels(trait)) {
      const level = trait.levels.find((lvl: any) => lvl.label === levelLabel) || trait.levels[2];
      selectedTrait = { ...trait, ...level };
      traitBonus = level?.bonus ?? traitBonus;
    } else if (trait) {
      selectedTrait = trait;
      traitBonus = trait.bonus ?? traitBonus;
    }
  } else if (unit && Array.isArray(unit.traits) && unit.traits.length > 0) {
    const actualTraitKey = unit.traits[0];
    const [baseKey, levelLabel] = actualTraitKey.split(' ');
    const trait = TRAITS.find(t => t.key === baseKey);
    if (trait && hasLevels(trait)) {
      const level = trait.levels.find((lvl: any) => lvl.label === levelLabel) || trait.levels[2];
      selectedTrait = { ...trait, ...level };
      traitBonus = level?.bonus ?? traitBonus;
    } else if (trait) {
      selectedTrait = trait;
      traitBonus = trait.bonus ?? traitBonus;
    }
  }

  // Reset states when unit changes
  useEffect(() => {
    if (unit) {
      setIsShiny(false)
      setIsImageEnlarged(false)
      setSelectedLevel(0)
      // Reset to unit's actual stats or D if none exist
      setSelectedStats({
        damage: (unit?.stats?.damage as StatGrade) || 'D',
        speed: (unit?.stats?.speed as StatGrade) || 'D',
        range: (unit?.stats?.range as StatGrade) || 'D'
      })
      // Reset percentages to minimum of each grade
      const damageGrade = (unit?.stats?.damage as StatGrade) || 'D'
      const speedGrade = (unit?.stats?.speed as StatGrade) || 'D'
      const rangeGrade = (unit?.stats?.range as StatGrade) || 'D'
      
      setSelectedPercentages({
        damage: getStatRange(damageGrade, 'damage')[0],
        speed: getStatRange(speedGrade, 'spa')[0],
        range: getStatRange(rangeGrade, 'range')[0]
      })
    }
  }, [unit])

  if (!unit) {
    return (
      <div className="min-h-screen pt-24 pb-8 px-4 bg-dark-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Unit not found</h1>
            <Link to="/units" className="text-primary-400 hover:text-primary-300">
              Return to Units
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const tierData = getTierData(unit.tier)

  // Helper functions
  const handleShinyToggle = () => {
    setIsShiny(!isShiny)
    if (unit.shinyImage) {
      setIsImageEnlarged(true)
    }
  }

  const handleImageClick = (imageSrc: string) => {
    setIsImageEnlarged(true)
  }

  const closeEnlargedImage = () => {
    setIsImageEnlarged(false)
  }

  // Helper function to convert evolution to UnitData for display
  const evolutionToUnitData = (evolution: any, baseUnit: UnitData): UnitData => {
    const requirementsText = Array.isArray(evolution.requirements) 
      ? evolution.requirements.join(', ')
      : (evolution.requirements || '')

    return {
      name: evolution.name,
      tier: evolution.tier,
      element: evolution.element,
      rarity: evolution.rarity,
      cost: evolution.cost,
      image: evolution.image || baseUnit.image,
      shinyImage: evolution.shinyImage || baseUnit.shinyImage,
      description: evolution.description,
      obtainment: `Evolution of ${baseUnit.name}${requirementsText ? `: ${requirementsText}` : ''}`,
      isBaseForm: false,
      baseForm: baseUnit.name,
      skills: baseUnit.skills,
      traits: baseUnit.traits,
      upgradeStats: evolution.upgradeStats || baseUnit.upgradeStats,
      stats: baseUnit.stats,
    }
  }

  const handleEvolutionClick = (evolution: any) => {
    const evolutionUnit = evolutionToUnitData(evolution, unit)
    // Navigate to the evolution unit
    navigate(`/units/${encodeURIComponent(evolutionUnit.name)}`)
  }

  // Determine which image to show
  const currentImage = isShiny && unit.shinyImage ? unit.shinyImage : unit.image

  return (
    <div className="min-h-screen pt-16 pb-8 px-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="animated-gradient-bg"></div>
      <div className="animated-gradient-overlay"></div>
      <div className="floating-particles"></div>
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          {/* Back Button */}
          <button
            onClick={() => navigate('/units')}
            className="group flex items-center gap-2 text-gray-400 hover:text-white transition-all duration-300 mb-8 hover:translate-x-1"
          >
            <ArrowLeft className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1" />
            <span className="font-medium">Back to Units</span>
          </button>
          
          {/* Hero Header Card */}
          <div className="bg-gradient-to-r from-slate-800/60 to-slate-700/40 backdrop-blur-xl rounded-3xl p-8 ring-1 ring-white/10 shadow-2xl border border-white/5">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Title and Badges */}
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-game font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                  {unit.name}
                </h1>
                
                {/* Enhanced Badge Row */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Tier Badge */}
                  <div className="group flex items-center gap-3 bg-gradient-to-r from-slate-700/50 to-slate-600/50 backdrop-blur-xl rounded-2xl px-4 py-3 ring-1 ring-white/20 hover:ring-white/30 transition-all duration-300 hover:scale-105">
                    <img 
                      src={tierData.icon} 
                      alt={tierData.label}
                      className="w-8 h-8 object-contain group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = '/images/Unit Tiers/Bad.webp'
                      }}
                    />
                    <div>
                      <div className="text-xs text-gray-400 uppercase tracking-wider">Tier</div>
                      <div className="text-sm font-bold text-white">{tierData.label}</div>
                    </div>
                  </div>

                  {/* Rarity Badge */}
                  <div className="group flex items-center gap-3 bg-gradient-to-r from-yellow-500/30 to-amber-500/30 backdrop-blur-xl rounded-2xl px-4 py-3 ring-1 ring-yellow-500/40 hover:ring-yellow-500/60 transition-all duration-300 hover:scale-105">
                    <Crown className="h-6 w-6 text-yellow-400 group-hover:scale-110 transition-transform duration-300" />
                    <div>
                      <div className="text-xs text-yellow-300/70 uppercase tracking-wider">Rarity</div>
                      <div className="text-sm font-bold text-yellow-100">{unit.rarity}</div>
                    </div>
                  </div>

                  {/* Element Badge */}
                  <div className="group flex items-center gap-3 bg-gradient-to-r from-slate-700/50 to-slate-600/50 backdrop-blur-xl rounded-2xl px-4 py-3 ring-1 ring-white/20 hover:ring-white/30 transition-all duration-300 hover:scale-105">
                    <img 
                      src={getElementIcon(unit.element)} 
                      alt={unit.element}
                      className="w-6 h-6 object-contain group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = '/images/Elements/UnknownElement.webp'
                      }}
                    />
                    <div>
                      <div className="text-xs text-gray-400 uppercase tracking-wider">Element</div>
                      <div className="text-sm font-bold text-white">{unit.element}</div>
                    </div>
                  </div>

                  {/* Cost Badge */}
                  <div className="group flex items-center gap-3 bg-gradient-to-r from-green-500/30 to-emerald-500/30 backdrop-blur-xl rounded-2xl px-4 py-3 ring-1 ring-green-500/40 hover:ring-green-500/60 transition-all duration-300 hover:scale-105">
                    <div className="w-6 h-6 rounded-full bg-green-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <span className="text-xs font-bold text-green-900">¥</span>
                    </div>
                    <div>
                      <div className="text-xs text-green-300/70 uppercase tracking-wider">Cost</div>
                      <div className="text-sm font-bold text-green-100">{unit.cost || 'Unknown'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Trait Display and Selector */}
        {unit && selectedTrait && (
          <div className="mb-4 flex items-center gap-4 bg-dark-200/40 p-4 rounded-xl border border-primary-500/20">
            <img src={selectedTrait.icon} alt="Current Trait" className="w-10 h-10 rounded-lg" />
            <div>
              <div className="text-base font-bold text-white">Current Trait</div>
              <div className="text-sm text-white font-bold">{selectedTrait.name}</div>
              <div className="text-xs text-gray-300">{selectedTrait.description}</div>
            </div>
          </div>
        )}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-bold text-white">Preview Trait</span>
          </div>
          <button
            className="px-4 py-2 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 transition"
            onClick={() => setTraitModalOpen(true)}
          >
            Select Trait
          </button>
          {traitModalOpen && <div className="fixed inset-0 bg-black/60 z-40"></div>}
          <Dialog open={traitModalOpen} onClose={() => setTraitModalOpen(false)} className="fixed z-50 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
              {/* Blurred glass overlay */}
              {traitModalOpen && <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-[4px]" style={{ WebkitBackdropFilter: 'blur(4px)' }}></div>}
              <Dialog.Panel className="relative bg-gradient-to-br from-dark-200/90 to-dark-400/90 rounded-3xl p-6 max-w-2xl w-full z-50 border border-primary-500/20 shadow-2xl backdrop-blur-[8px] max-h-[80vh] overflow-y-auto">
                {/* Close (X) button */}
                <button
                  onClick={() => setTraitModalOpen(false)}
                  aria-label="Close"
                  className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-dark-100/40 hover:bg-primary-500/80 text-white text-2xl font-bold shadow-md focus:outline-none focus:ring-2 focus:ring-primary-400/40 z-10 transition"
                >
                  &times;
                </button>
                <Dialog.Title className="text-2xl font-extrabold text-white mb-6 tracking-wide drop-shadow-lg">Select a Trait</Dialog.Title>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mb-5">
                  {TRAITS.map(trait => {
                    const isLevelTrait = hasLevels(trait);
                    const selectedLevelIdx = traitLevel[trait.key] ?? (isLevelTrait ? 2 : 0); // Default to III if levels exist
                    const level = isLevelTrait ? trait.levels[selectedLevelIdx] : null;
                    const isSelected = (previewTraitKey === (isLevelTrait ? `${trait.key} ${level?.label}` : trait.key)) ||
                      (!previewTraitKey && selectedTrait && selectedTrait.key === (isLevelTrait ? `${trait.key} ${level?.label}` : trait.key));
                    return (
                      <div
                        key={trait.key}
                        className={`flex flex-col items-center justify-between w-48 h-56 bg-gradient-to-br from-dark-300/80 to-dark-500/80 rounded-2xl p-4 border transition-all duration-200 shadow-xl relative
                          ${isSelected ? 'border-primary-400 shadow-primary-500/30 ring-2 ring-primary-400/40' : 'border-dark-100/20 hover:border-primary-400/40 hover:shadow-primary-400/10'}
                        `}
                        style={{ backdropFilter: 'blur(8px)' }}
                      >
                        <button
                          type="button"
                          className={`flex flex-col items-center flex-1 w-full focus:outline-none group`}
                          onClick={() => {
                            const traitKey = isLevelTrait ? `${trait.key} ${level?.label}` : trait.key;
                            if (previewTraitKey === traitKey) {
                              setPreviewTraitKey(null);
                            } else {
                              setPreviewTraitKey(traitKey);
                              setTraitModalOpen(false);
                            }
                          }}
                        >
                          <div className={`rounded-full bg-dark-100/30 p-3 mb-2 shadow-lg group-hover:scale-110 transition-transform duration-200 ${isSelected ? 'ring-2 ring-primary-400/80' : ''}`}>
                            <img src={trait.icon} alt={trait.name} className="w-12 h-12 object-contain" />
                          </div>
                          <span className="text-base text-white font-extrabold mb-1 tracking-wide drop-shadow-lg">{trait.name}{isLevelTrait ? ` ${level?.label}` : ''}</span>
                          <span className="text-xs text-gray-300 text-center font-medium mb-2 min-h-[32px]">{isLevelTrait ? level?.description : trait.description}</span>
                        </button>
                        {isLevelTrait && Array.isArray(trait.levels) && (
                          <div className="flex gap-2 mt-2 justify-center w-full">
                            {trait.levels.map((lvl, idx) => (
                              <button
                                key={lvl.label}
                                className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-150 border-2
                                  ${selectedLevelIdx === idx ? 'bg-primary-500/90 text-white border-primary-400 shadow-primary-400/30 shadow-md' : 'bg-dark-200/60 text-gray-200 border-dark-100/30 hover:bg-primary-700/60 hover:text-white'}
                                `}
                                onClick={() => {
                                  setTraitLevel(prev => ({ ...prev, [trait.key]: idx }));
                                  const traitKey = `${trait.key} ${lvl.label}`;
                                  if (previewTraitKey === traitKey) {
                                    setPreviewTraitKey(null);
                                  } else {
                                    setPreviewTraitKey(traitKey);
                                    setTraitModalOpen(false);
                                  }
                                }}
                              >
                                {lvl.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </Dialog.Panel>
            </div>
          </Dialog>
        </div>

        {/* Improved Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Left Sidebar - Enhanced */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="xl:col-span-1 space-y-6"
          >
            {/* Unit Image Card */}
            <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/40 backdrop-blur-xl rounded-3xl p-6 ring-1 ring-white/10 shadow-2xl border border-white/5">
              <div className="relative">
                {/* Unit Image */}
                <div className="relative w-full aspect-square max-w-xs mx-auto mb-6">
                  <div 
                    className={`w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl flex items-center justify-center overflow-hidden cursor-pointer transition-all duration-500 backdrop-blur-sm border-2 ${isShiny ? 'ring-4 ring-yellow-400/80 shadow-2xl shadow-yellow-400/30 border-yellow-400/40 bg-gradient-to-br from-yellow-500/20 to-amber-500/20' : 'ring-2 ring-white/30 shadow-xl shadow-black/20 border-white/20'} hover:scale-105 hover:shadow-2xl group`}
                    onClick={() => currentImage && handleImageClick(currentImage)}
                  >
                    {currentImage ? (
                      <img 
                        src={currentImage} 
                        alt={`${unit.name}${isShiny ? ' (Shiny)' : ''}`} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          e.currentTarget.src = '/images/units/default.webp'
                        }}
                      />
                    ) : (
                      <Swords className="h-20 w-20 text-primary-400 opacity-50" />
                    )}
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl flex items-center justify-center">
                      <Eye className="h-8 w-8 text-white drop-shadow-lg" />
                    </div>
                  </div>
                  
                  {/* Enhanced Shiny Toggle */}
                  {unit.shinyImage && (
                    <button
                      onClick={handleShinyToggle}
                      className={`absolute -top-2 -right-2 p-3 rounded-2xl backdrop-blur-xl transition-all duration-300 hover:scale-110 shadow-lg ${
                        isShiny 
                          ? 'bg-gradient-to-r from-yellow-500/80 to-amber-500/80 ring-2 ring-yellow-400/80 text-yellow-100 shadow-yellow-400/30' 
                          : 'bg-slate-800/80 ring-1 ring-white/30 text-gray-300 hover:text-yellow-300 hover:bg-yellow-500/20'
                      }`}
                    >
                      <Sparkles className="h-6 w-6" />
                    </button>
                  )}
                  
                  {/* Image Status Indicator */}
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                    <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isShiny ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-yellow-100' : 'bg-slate-600/80 text-gray-300'} backdrop-blur-xl border border-white/20`}>
                      {isShiny ? 'Shiny' : 'Normal'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Info Cards */}
            <div className="space-y-4">
              {/* Description Card */}
              {unit.description && (
                <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/40 backdrop-blur-xl rounded-2xl p-6 ring-1 ring-white/10 shadow-xl border border-white/5">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                      <Info className="h-5 w-5 text-white" />
                    </div>
                    About
                  </h3>
                  <p className="text-gray-300 leading-relaxed text-sm">{unit.description}</p>
                </div>
              )}

              {/* Video Card */}
              {unit.videoUrl && (
                <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/40 backdrop-blur-xl rounded-2xl p-6 ring-1 ring-white/10 shadow-xl border border-white/5">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center shadow-lg">
                      <Play className="h-5 w-5 text-white ml-0.5" />
                    </div>
                    Showcase
                  </h3>
                  <div className="aspect-video rounded-xl overflow-hidden ring-1 ring-white/20 shadow-lg">
                    <iframe
                      src={`https://www.youtube.com/embed/${unit.videoUrl.includes('watch?v=') 
                        ? unit.videoUrl.split('watch?v=')[1].split('&')[0]
                        : unit.videoUrl.split('/').pop()?.split('?')[0] || ''
                      }`}
                      title={`${unit.name} showcase`}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>

                     {/* Main Content Area - Enhanced */}
           <motion.div
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             className="xl:col-span-3 space-y-8"
           >
             {/* Interactive Stats Calculator */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-800/40 backdrop-blur-xl rounded-2xl p-6 ring-1 ring-white/10 shadow-xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl border border-blue-500/30">
                  <TrendingUp className="h-6 w-6 text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Interactive Stats Calculator
                </h2>
              </div>

              {/* Trait Display */}
              {selectedTrait && (
                <div className="mb-6 flex items-center gap-4 bg-dark-200/40 p-4 rounded-xl border border-primary-500/20">
                  <img src={selectedTrait.icon} alt={selectedTrait.name} className="w-12 h-12 rounded-lg" />
                  <div>
                    <div className="text-lg font-bold text-white">{selectedTrait.name}</div>
                    <div className="text-xs text-gray-300">{selectedTrait.description}</div>
                  </div>
                </div>
              )}

              <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl p-4 mb-6 border border-blue-500/20">
                <div className="flex items-center gap-2 text-blue-300 mb-2">
                  <Info className="h-5 w-5" />
                  <span className="font-medium">Base Unit Stats</span>
                </div>
                <p className="text-blue-200 text-sm">
                  All units start with D-D-D stats. Use the selectors below to see how this unit would perform with different stat grades.
                </p>
                <p className="text-blue-200 text-sm mt-1">
                  <strong>Note:</strong> Higher stat grades increase Damage & Range, but <em>reduce</em> SPA (making attacks faster).
                </p>
              </div>

              {/* Grade Selectors */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Damage Grade */}
                <div className="bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-xl p-4 border border-red-500/30 backdrop-blur-sm shadow-lg hover:shadow-red-500/20 transition-all duration-300">
                  <div className="text-red-400 text-xs font-bold uppercase tracking-wider mb-2 text-center">Damage Grade</div>
                  <select
                    value={selectedStats.damage}
                    onChange={(e) => {
                      const newGrade = e.target.value as StatGrade
                      const [min] = getStatRange(newGrade, 'damage')
                      setSelectedStats(prev => ({...prev, damage: newGrade}))
                      setSelectedPercentages(prev => ({...prev, damage: min}))
                    }}
                    className="w-full px-2 py-1 bg-dark-300/80 border border-red-500/40 rounded text-white text-center text-sm font-mono font-bold focus:outline-none focus:border-red-400 mb-2"
                  >
                    {getAvailableStatGrades().map(grade => (
                      <option key={grade} value={grade} className="bg-dark-300">
                        {grade}
                      </option>
                    ))}
                  </select>
                  
                  {/* Percentage Slider */}
                  {(() => {
                    const [min, max] = getStatRange(selectedStats.damage, 'damage')
                    return (
                      <div className="mb-2">
                        <input
                          type="range"
                          min={min}
                          max={max}
                          step={0.1}
                          value={selectedPercentages.damage}
                          onChange={(e) => setSelectedPercentages(prev => ({...prev, damage: parseFloat(e.target.value)}))}
                          className="w-full h-2 bg-red-500/30 rounded-lg appearance-none cursor-pointer slider-red"
                        />
                        <div className="text-red-300 text-sm font-mono font-bold text-center mt-1">
                          {selectedPercentages.damage.toFixed(1)}%
                        </div>
                      </div>
                    )
                  })()}
                  
                  <div className="text-red-400/70 text-xs text-center">
                    Range: {formatStatDisplay(selectedStats.damage, 'damage')}
                  </div>
                </div>

                {/* Speed Grade */}
                <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 rounded-xl p-4 border border-cyan-500/30 backdrop-blur-sm shadow-lg hover:shadow-cyan-500/20 transition-all duration-300">
                  <div className="text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2 text-center">Speed (SPA) Grade</div>
                  <select
                    value={selectedStats.speed}
                    onChange={(e) => {
                      const newGrade = e.target.value as StatGrade
                      const [min] = getStatRange(newGrade, 'spa')
                      setSelectedStats(prev => ({...prev, speed: newGrade}))
                      setSelectedPercentages(prev => ({...prev, speed: min}))
                    }}
                    className="w-full px-2 py-1 bg-dark-300/80 border border-cyan-500/40 rounded text-white text-center text-sm font-mono font-bold focus:outline-none focus:border-cyan-400 mb-2"
                  >
                    {getAvailableStatGrades().map(grade => (
                      <option key={grade} value={grade} className="bg-dark-300">
                        {grade}
                      </option>
                    ))}
                  </select>
                  
                  {/* Percentage Slider */}
                  {(() => {
                    const [min, max] = getStatRange(selectedStats.speed, 'spa')
                    return (
                      <div className="mb-2">
                        <input
                          type="range"
                          min={min}
                          max={max}
                          step={0.1}
                          value={selectedPercentages.speed}
                          onChange={(e) => setSelectedPercentages(prev => ({...prev, speed: parseFloat(e.target.value)}))}
                          className="w-full h-2 bg-cyan-500/30 rounded-lg appearance-none cursor-pointer slider-cyan"
                        />
                        <div className="text-cyan-300 text-sm font-mono font-bold text-center mt-1">
                          {selectedPercentages.speed.toFixed(1)}%
                        </div>
                      </div>
                    )
                  })()}
                  
                  <div className="text-cyan-400/70 text-xs text-center">
                    Range: {formatStatDisplay(selectedStats.speed, 'spa')}
                  </div>
                </div>

                {/* Range Grade */}
                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl p-4 border border-blue-500/30 backdrop-blur-sm shadow-lg hover:shadow-blue-500/20 transition-all duration-300">
                  <div className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-2 text-center">Range Grade</div>
                  <select
                    value={selectedStats.range}
                    onChange={(e) => {
                      const newGrade = e.target.value as StatGrade
                      const [min] = getStatRange(newGrade, 'range')
                      setSelectedStats(prev => ({...prev, range: newGrade}))
                      setSelectedPercentages(prev => ({...prev, range: min}))
                    }}
                    className="w-full px-2 py-1 bg-dark-300/80 border border-blue-500/40 rounded text-white text-center text-sm font-mono font-bold focus:outline-none focus:border-blue-400 mb-2"
                  >
                    {getAvailableStatGrades().map(grade => (
                      <option key={grade} value={grade} className="bg-dark-300">
                        {grade}
                      </option>
                    ))}
                  </select>
                  
                  {/* Percentage Slider */}
                  {(() => {
                    const [min, max] = getStatRange(selectedStats.range, 'range')
                    return (
                      <div className="mb-2">
                        <input
                          type="range"
                          min={min}
                          max={max}
                          step={0.1}
                          value={selectedPercentages.range}
                          onChange={(e) => setSelectedPercentages(prev => ({...prev, range: parseFloat(e.target.value)}))}
                          className="w-full h-2 bg-blue-500/30 rounded-lg appearance-none cursor-pointer slider-blue"
                        />
                        <div className="text-blue-300 text-sm font-mono font-bold text-center mt-1">
                          {selectedPercentages.range.toFixed(1)}%
                        </div>
                      </div>
                    )
                  })()}
                  
                  <div className="text-blue-400/70 text-xs text-center">
                    Range: {formatStatDisplay(selectedStats.range, 'range')}
                  </div>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="mb-6">
                <div className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Eye className="h-4 w-4 text-purple-400" />
                  Quick Presets:
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      const newStats = {damage: 'D' as StatGrade, speed: 'D' as StatGrade, range: 'D' as StatGrade}
                      setSelectedStats(newStats)
                      setSelectedPercentages({
                        damage: getStatRange('D', 'damage')[0],
                        speed: getStatRange('D', 'spa')[0],
                        range: getStatRange('D', 'range')[0]
                      })
                    }}
                    className="px-3 py-1 bg-gray-600/50 hover:bg-gray-600/80 text-white rounded text-sm transition-all duration-200 border border-gray-500/30"
                  >
                    Base (D-D-D)
                  </button>
                  <button
                    onClick={() => {
                      const newStats = {damage: 'B' as StatGrade, speed: 'B' as StatGrade, range: 'B' as StatGrade}
                      setSelectedStats(newStats)
                      setSelectedPercentages({
                        damage: getStatRange('B', 'damage')[0],
                        speed: getStatRange('B', 'spa')[0],
                        range: getStatRange('B', 'range')[0]
                      })
                    }}
                    className="px-3 py-1 bg-blue-600/50 hover:bg-blue-600/80 text-white rounded text-sm transition-all duration-200 border border-blue-500/30"
                  >
                    Good (B-B-B)
                  </button>
                  <button
                    onClick={() => {
                      const newStats = {damage: 'A' as StatGrade, speed: 'A' as StatGrade, range: 'A' as StatGrade}
                      setSelectedStats(newStats)
                      setSelectedPercentages({
                        damage: getStatRange('A', 'damage')[0],
                        speed: getStatRange('A', 'spa')[0],
                        range: getStatRange('A', 'range')[0]
                      })
                    }}
                    className="px-3 py-1 bg-green-600/50 hover:bg-green-600/80 text-white rounded text-sm transition-all duration-200 border border-green-500/30"
                  >
                    Great (A-A-A)
                  </button>
                  <button
                    onClick={() => {
                      const newStats = {damage: 'S' as StatGrade, speed: 'S' as StatGrade, range: 'S' as StatGrade}
                      setSelectedStats(newStats)
                      setSelectedPercentages({
                        damage: getStatRange('S', 'damage')[0],
                        speed: getStatRange('S', 'spa')[0],
                        range: getStatRange('S', 'range')[0]
                      })
                    }}
                    className="px-3 py-1 bg-purple-600/50 hover:bg-purple-600/80 text-white rounded text-sm transition-all duration-200 border border-purple-500/30"
                  >
                    High (S-S-S)
                  </button>
                  <button
                    onClick={() => {
                      const newStats = {damage: 'Z+' as StatGrade, speed: 'Z+' as StatGrade, range: 'Z+' as StatGrade}
                      setSelectedStats(newStats)
                      setSelectedPercentages({
                        damage: getStatRange('Z+', 'damage')[0],
                        speed: getStatRange('Z+', 'spa')[0],
                        range: getStatRange('Z+', 'range')[0]
                      })
                    }}
                    className="px-3 py-1 bg-gradient-to-r from-emerald-600/50 to-green-600/50 hover:from-emerald-600/80 hover:to-green-600/80 text-white rounded text-sm transition-all duration-200 border border-emerald-400/30"
                  >
                    Elite (Z+-Z+-Z+)
                  </button>
                  <button
                    onClick={() => {
                      const newStats = {damage: '神' as StatGrade, speed: '神' as StatGrade, range: '神' as StatGrade}
                      setSelectedStats(newStats)
                      setSelectedPercentages({
                        damage: getStatRange('神', 'damage')[0],
                        speed: getStatRange('神', 'spa')[0],
                        range: getStatRange('神', 'range')[0]
                      })
                    }}
                    className="px-3 py-1 bg-gradient-to-r from-yellow-500/50 to-orange-500/50 hover:from-yellow-500/80 hover:to-orange-500/80 text-white rounded text-sm transition-all duration-200 border border-yellow-400/30"
                  >
                    Godly (神-神-神)
                  </button>
                </div>
              </div>

              <div className="mt-3 text-xs text-gray-400 bg-dark-200/30 p-2 rounded-lg">
                <p><strong>Note:</strong> This calculator shows how {unit.name} would perform with different stat grades. All units start at D-D-D base stats in-game.</p>
              </div>
            </motion.div>

            {/* Level 60 Upgrade Stats */}
            {unit.upgradeStats && unit.upgradeStats.levels && unit.upgradeStats.levels.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-slate-800/40 backdrop-blur-xl rounded-2xl p-6 ring-1 ring-white/10 shadow-xl"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30">
                    <TrendingUp className="h-6 w-6 text-green-400" />
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    Level 60 Upgrade Stats
                  </h2>
                </div>
                
                <div className="mb-4">
                  <div className="flex gap-2 mb-4 flex-wrap">
                    {unit.upgradeStats.levels.map((level, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedLevel(index)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          selectedLevel === index
                            ? 'bg-primary-600 text-white'
                            : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                        }`}
                      >
                        Lv {level.level}
                      </button>
                    ))}
                  </div>
                </div>

                {unit.upgradeStats.levels[selectedLevel] && (() => {
                  const baseLevel = unit.upgradeStats!.levels[selectedLevel]
                  
                  // Apply stat bonuses
                  const statBonuses = {
                    damage: selectedPercentages.damage / 100,
                    spa: selectedPercentages.speed / 100,
                    range: selectedPercentages.range / 100
                  }

                  // Apply trait bonus
                  const traitBonus = selectedTrait ? selectedTrait.bonus : { damage: 0, spa: 0, range: 0, critChance: 0, critDamage: 0 }

                  const bonusedStats = {
                    atkDamage: baseLevel.atkDamage * (1 + statBonuses.damage + (traitBonus.damage || 0) / 100),
                    spa: baseLevel.spa * (1 - statBonuses.spa - (traitBonus.spa || 0) / 100),
                    range: baseLevel.range * (1 + statBonuses.range + (traitBonus.range || 0) / 100),
                    critDamage: baseLevel.critDamage + (traitBonus.critDamage || 0),
                    critChance: baseLevel.critChance + (traitBonus.critChance || 0)
                  }

                  return (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                        <div className="bg-red-500/20 rounded-lg p-3 border border-red-500/30">
                          <div className="text-red-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                            <Sword className="h-3 w-3" />
                            ATK DMG
                          </div>
                          <div className="text-red-300 text-lg font-mono font-bold">
                            {bonusedStats.atkDamage.toFixed(1)}
                            {baseLevel.atkDamage !== bonusedStats.atkDamage && (
                              <span className="text-xs text-red-400/70 ml-1">
                                (Base: {baseLevel.atkDamage})
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="bg-blue-500/20 rounded-lg p-3 border border-blue-500/30">
                          <div className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            RANGE
                          </div>
                          <div className="text-blue-300 text-lg font-mono font-bold">
                            {bonusedStats.range.toFixed(1)}
                            {baseLevel.range !== bonusedStats.range && (
                              <span className="text-xs text-blue-400/70 ml-1">
                                (Base: {baseLevel.range})
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="bg-cyan-500/20 rounded-lg p-3 border border-cyan-500/30">
                          <div className="text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                            <Zap className="h-3 w-3" />
                            SPA
                          </div>
                          <div className="text-cyan-300 text-lg font-mono font-bold">
                            {bonusedStats.spa.toFixed(1)}
                            {baseLevel.spa !== bonusedStats.spa && (
                              <span className="text-xs text-cyan-400/70 ml-1">
                                (Base: {baseLevel.spa})
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="bg-orange-500/20 rounded-lg p-3 border border-orange-500/30">
                          <div className="text-orange-400 text-xs font-bold uppercase tracking-wider mb-1">Crit DMG</div>
                          <div className="text-orange-300 text-lg font-mono font-bold">
                            {baseLevel.critDamage}
                          </div>
                        </div>

                        <div className="bg-green-500/20 rounded-lg p-3 border border-green-500/30">
                          <div className="text-green-400 text-xs font-bold uppercase tracking-wider mb-1">Crit %</div>
                          <div className="text-green-300 text-lg font-mono font-bold">
                            {baseLevel.critChance}%
                          </div>
                        </div>
                      </div>

                      {/* Bonus Summary */}
                      {(selectedPercentages.damage > 0 || selectedPercentages.speed > 0 || selectedPercentages.range > 0) && (
                        <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-lg p-3 border border-green-500/30">
                          <h4 className="text-sm font-bold text-green-400 mb-2 uppercase tracking-wider">Active Stat Bonuses</h4>
                          <div className="grid grid-cols-3 gap-3 text-xs">
                            <div className="text-center">
                              <div className="text-red-400 font-bold">Damage</div>
                              <div className="text-red-300">+{selectedPercentages.damage.toFixed(1)}%</div>
                            </div>
                            <div className="text-center">
                              <div className="text-cyan-400 font-bold">Speed</div>
                              <div className="text-cyan-300">-{selectedPercentages.speed.toFixed(1)}%</div>
                            </div>
                            <div className="text-center">
                              <div className="text-blue-400 font-bold">Range</div>
                              <div className="text-blue-300">+{selectedPercentages.range.toFixed(1)}%</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })()}

                <div className="mt-3 text-xs text-gray-400 bg-dark-200/30 p-2 rounded-lg">
                  <p><strong>Note:</strong> Base stats at Level 60 per upgrade level.</p>
                  <div className="flex flex-wrap gap-3 mt-1 text-xs">
                    <span>• <strong>SPA:</strong> Speed/Attack Speed</span>
                    <span>• <strong>Crit DMG:</strong> Critical damage multiplier</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Skills */}
            {unit.skills && unit.skills.length > 0 && (
              <div className="bg-slate-800/40 backdrop-blur-xl rounded-2xl p-6 ring-1 ring-white/10 shadow-xl">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <Swords className="h-5 w-5 text-white" />
                  </div>
                  Skills & Abilities
                </h3>
                <div className="space-y-3">
                  {unit.skills.map((skill, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-500/20"
                    >
                      <h4 className="font-semibold text-purple-300 mb-2">{skill.name}</h4>
                      <p className="text-gray-300 text-sm leading-relaxed">{skill.description}</p>
                      <span className="inline-block mt-2 px-2 py-1 bg-purple-500/20 rounded text-xs text-purple-300">
                        {skill.type}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Traits */}
            {unit.traits && unit.traits.length > 0 && (
              <div className="bg-slate-800/40 backdrop-blur-xl rounded-2xl p-6 ring-1 ring-white/10 shadow-xl">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center">
                    <Star className="h-5 w-5 text-white" />
                  </div>
                  Traits
                </h3>
                <div className="flex flex-wrap gap-2">
                  {unit.traits.map((trait, index) => (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 px-3 py-2 rounded-xl text-amber-200 text-sm font-medium border border-amber-500/30"
                    >
                      {trait}
                    </motion.span>
                  ))}
                </div>
              </div>
            )}

            {/* Video Section */}
            {unit.videoUrl && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
                className="bg-slate-800/40 backdrop-blur-xl rounded-2xl p-6 ring-1 ring-white/10 shadow-xl"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-xl border border-red-500/30">
                    <Play className="h-6 w-6 text-red-400" />
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                    Gameplay Video
                  </h2>
                </div>
                <div className="bg-gradient-to-br from-slate-800/40 to-slate-700/20 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl ring-1 ring-white/5">
                  <div className="aspect-video rounded-xl overflow-hidden bg-dark-300/50 border border-red-500/30">
                    {(() => {
                      // Extract video ID from YouTube URL
                      const getYouTubeVideoId = (url: string) => {
                        const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
                        const match = url.match(regex);
                        return match ? match[1] : null;
                      };
                      
                      const videoId = getYouTubeVideoId(unit.videoUrl || '');
                      
                      if (videoId) {
                        return (
                          <iframe
                            src={`https://www.youtube.com/embed/${videoId}`}
                            title={`${unit.name} Gameplay Video`}
                            className="w-full h-full"
                            allowFullScreen
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          />
                        );
                      } else {
                        return (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <div className="text-center">
                              <div className="w-16 h-16 mx-auto mb-4 text-red-500 opacity-50">
                                <svg className="w-full h-full fill-current" viewBox="0 0 24 24">
                                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                </svg>
                              </div>
                              <p className="text-sm">Invalid video URL</p>
                            </div>
                          </div>
                        );
                      }
                    })()}
                  </div>
                  <p className="text-gray-400 text-sm mt-3 text-center">
                    Watch {unit.name} in action and learn optimal strategies
                  </p>
                </div>
              </motion.div>
            )}

            {/* Obtainment */}
            {unit.obtainment && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-slate-800/40 backdrop-blur-xl rounded-2xl p-6 ring-1 ring-white/10 shadow-xl"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-xl border border-pink-500/30">
                    <Gift className="h-6 w-6 text-pink-400" />
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                    How to Obtain
                  </h2>
                </div>
                <div className="bg-gradient-to-br from-slate-800/40 to-slate-700/20 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl ring-1 ring-white/5">
                  <p className="text-gray-300 text-base leading-relaxed">{unit.obtainment}</p>
                </div>
              </motion.div>
            )}

            {/* Evolutions */}
            {unit.evolutions && unit.evolutions.length > 0 && !unit.doesntEvolve && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-slate-800/40 backdrop-blur-xl rounded-2xl p-6 ring-1 ring-white/10 shadow-xl"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-xl border border-purple-500/30">
                    <Crown className="h-6 w-6 text-purple-400" />
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                    Evolution Path
                  </h2>
                </div>
                <div className="space-y-6">
                  {unit.evolutions.map((evo, index) => (
                    <motion.div
                      key={index}
                      className="bg-gradient-to-br from-slate-800/60 to-slate-700/40 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl ring-1 ring-white/5 hover:ring-white/10 transition-all duration-300"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -5, scale: 1.02 }}
                    >
                      {/* Evolution Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-primary-500/30 to-secondary-500/30 rounded-xl flex items-center justify-center">
                            <Crown className="h-8 w-8 text-primary-400" />
                          </div>
                          <div>
                            <h3 className="font-game font-bold text-white text-xl">
                              {evo.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex items-center gap-1 px-2 py-1 rounded bg-dark-300/50">
                                <img 
                                  src={getTierData(evo.tier).icon} 
                                  alt={getTierData(evo.tier).label}
                                  className="w-4 h-4 object-contain"
                                />
                                <span className="text-xs font-bold text-white">{getTierData(evo.tier).label}</span>
                              </div>
                              <span className={`px-2 py-1 rounded text-xs rarity-${evo.rarity.toLowerCase()}`}>
                                {evo.rarity}
                              </span>
                              <div className="flex items-center gap-1 px-2 py-1 rounded bg-dark-300/50">
                                <img 
                                  src={getElementIcon(evo.element)} 
                                  alt={evo.element}
                                  className="w-4 h-4 object-contain"
                                />
                                <span className="text-xs font-bold text-white">{evo.element}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Evolution Description */}
                      {evo.description && (
                        <div className="mb-4">
                          <p className="text-gray-300 text-sm leading-relaxed">{evo.description}</p>
                        </div>
                      )}

                      {/* Evolution Requirements */}
                      {((Array.isArray(evo.requirements) && evo.requirements.length > 0) || 
                        (typeof evo.requirements === 'string' && evo.requirements.trim())) && (
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                            <Target className="h-4 w-4 text-blue-400" />
                            Evolution Requirements
                          </h4>
                          <div className="space-y-2">
                            {(() => {
                              // Parse requirements - handle both array and comma-separated string
                              let reqArray: string[] = []
                              if (Array.isArray(evo.requirements)) {
                                reqArray = evo.requirements.filter(req => req.trim())
                              } else if (typeof evo.requirements === 'string' && evo.requirements.trim()) {
                                // Split by comma and clean up each requirement
                                reqArray = evo.requirements.split(',').map(req => req.trim()).filter(req => req)
                              }

                              return reqArray.map((req, reqIndex) => (
                                <motion.div 
                                  key={reqIndex} 
                                  className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-lg p-3 border border-blue-500/30 backdrop-blur-sm shadow-md"
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: reqIndex * 0.1 }}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg">
                                      {reqIndex + 1}
                                    </div>
                                    <span className="text-gray-200 text-sm font-medium">{req}</span>
                                  </div>
                                </motion.div>
                              ))
                            })()}
                          </div>
                        </div>
                      )}

                      {/* Evolution Action Button */}
                      <motion.button
                        className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 group flex items-center justify-center gap-2"
                        onClick={() => handleEvolutionClick(evo)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Crown className="h-5 w-5 group-hover:scale-110 transition-transform" />
                        <span>Click to Evolve</span>
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Trivia */}
            {unit.trivia && unit.trivia.length > 0 && (
              <div className="bg-slate-800/40 backdrop-blur-xl rounded-2xl p-6 ring-1 ring-white/10 shadow-xl">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                    <Info className="h-5 w-5 text-white" />
                  </div>
                  Trivia
                </h3>
                <div className="space-y-3">
                  {unit.trivia.map((fact, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3 text-gray-300"
                    >
                      <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                      <span className="text-sm leading-relaxed">{fact}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}




          </motion.div>
        </div>
      </div>

      {/* Enlarged Image Overlay */}
      <AnimatePresence>
        {isImageEnlarged && currentImage && (
          <motion.div
            className="fixed inset-0 bg-black/95 flex items-center justify-center z-[110] p-2 sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsImageEnlarged(false)}
          >
            <motion.div
              className="relative max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsImageEnlarged(false)}
                className="absolute top-4 right-4 p-2 hover:bg-red-500/20 rounded-xl transition-all duration-300 group border border-white/10 hover:border-red-500/30 z-20 backdrop-blur-sm bg-black/20"
              >
                <X className="h-6 w-6 text-white/70 group-hover:text-red-400 transition-colors" />
              </button>
              <img
                src={currentImage}
                alt={`${unit.name}${isShiny ? ' (Shiny)' : ''}`}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.src = '/images/units/default.webp'
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default UnitDetails 