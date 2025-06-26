import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Star, Sword, Shield, Zap, Gift, Crown, Target, Sparkles, Play, Award, TrendingUp, Eye } from 'lucide-react'
import { UnitData, StatGrade, calculateBaseStats, formatStatDisplay, getAvailableStatGrades, getStatRange, calculateCustomStatValue, applyStatBonuses, STAT_RANGES } from '../data/unitsDatabase'

interface UnitModalProps {
  unit: UnitData | null
  isOpen: boolean
  onClose: () => void
  onUnitSelect?: (unit: UnitData) => void
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

const UnitModal: React.FC<UnitModalProps> = ({ unit, isOpen, onClose, onUnitSelect }) => {
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

  // Reset shiny state and image enlargement when unit changes
  useEffect(() => {
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
  }, [unit])

  // Move the early return after all hooks have been declared
  if (!unit) return null

  // Handle shiny toggle with image enlargement
  const handleShinyToggle = () => {
    setIsShiny(!isShiny)
    if (unit.shinyImage) {
      setIsImageEnlarged(true)
    }
  }

  // Element icon mapping
  const getElementIcon = (element: string) => {
    const elementStyles: { [key: string]: { icon: string; color: string; bg: string } } = {
      Water: { icon: '/images/Elements/Water.webp', color: 'text-blue-400', bg: 'bg-blue-500/20' },
      Passion: { icon: '/images/Elements/Passion.webp', color: 'text-pink-400', bg: 'bg-pink-500/20' },
      Blast: { icon: '/images/Elements/Blast.webp', color: 'text-orange-400', bg: 'bg-orange-500/20' },
      Unbound: { icon: '/images/Elements/Unbound.webp', color: 'text-red-400', bg: 'bg-red-500/20' },
      Unknown: { icon: '/images/Elements/UnknownElement.webp', color: 'text-gray-400', bg: 'bg-gray-500/20' },
      Holy: { icon: '/images/Elements/Holy (1).webp', color: 'text-yellow-300', bg: 'bg-yellow-500/20' },
      Cosmic: { icon: '/images/Elements/Cosmic.webp', color: 'text-purple-400', bg: 'bg-purple-500/20' },
      Nature: { icon: '/images/Elements/Nature.webp', color: 'text-green-400', bg: 'bg-green-500/20' },
      Curse: { icon: '/images/Elements/Curse.webp', color: 'text-purple-600', bg: 'bg-purple-700/20' },
      Fire: { icon: '/images/Elements/Fire.webp', color: 'text-red-400', bg: 'bg-red-500/20' },
      Spark: { icon: '/images/Elements/Spark.webp', color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
    }

    return elementStyles[element] || { icon: '/images/Elements/UnknownElement.webp', color: 'text-gray-400', bg: 'bg-gray-500/20' }
  }

  const elementStyle = getElementIcon(unit.element)
  
  // Determine which image to show
  const currentImage = isShiny && unit.shinyImage ? unit.shinyImage : unit.image

  // Helper function to convert evolution to UnitData for modal display
  const evolutionToUnitData = (evolution: any, baseUnit: UnitData): UnitData => {
    // Handle requirements array or string
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
      skills: baseUnit.skills, // Inherit skills from base unit
      traits: baseUnit.traits, // Inherit traits from base unit
      upgradeStats: evolution.upgradeStats || baseUnit.upgradeStats, // Use evolution stats if available
      stats: baseUnit.stats, // Inherit base stats
      // Note: Evolution units typically don't have their own evolutions
      // but if they do, they would be handled separately
    }
  }

  const handleEvolutionClick = (evolution: any) => {
    if (onUnitSelect && unit) {
      const evolutionUnit = evolutionToUnitData(evolution, unit)
      onUnitSelect(evolutionUnit)
    }
  }

  return (
    <>
      {/* Main Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            <motion.div
              className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl rounded-3xl max-w-[95vw] w-full h-[95vh] overflow-hidden relative shadow-2xl border border-white/10 ring-1 ring-white/5"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <motion.button
                onClick={onClose}
                className="absolute top-8 right-8 p-3 hover:bg-red-500/20 rounded-2xl transition-all duration-300 group border border-white/10 hover:border-red-500/30 z-20 backdrop-blur-sm bg-black/20"
                whileHover={{ scale: 1.05, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="h-6 w-6 text-white/70 group-hover:text-red-400 transition-colors" />
              </motion.button>

              {/* Main Landscape Layout */}
              <div className="flex h-full">
                {/* Left Panel - Unit Info & Image */}
                <div className="w-96 p-8 border-r border-white/10 bg-gradient-to-br from-slate-800/50 to-slate-700/30 backdrop-blur-sm flex flex-col">
                  {/* Unit Image */}
                  <div className="flex justify-center mb-8">
                    <div className="relative group">
                      <div 
                        className={`w-48 h-48 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl flex items-center justify-center overflow-hidden cursor-pointer transition-all duration-500 backdrop-blur-sm border ${isShiny ? 'ring-4 ring-yellow-400/80 shadow-2xl shadow-yellow-400/30 border-yellow-400/20' : 'ring-2 ring-white/20 shadow-xl shadow-black/20 border-white/10'} group-hover:scale-105 group-hover:shadow-2xl`}
                        onClick={() => currentImage && setIsImageEnlarged(true)}
                      >
                        {currentImage ? (
                          <img 
                            src={currentImage} 
                            alt={`${unit.name}${isShiny ? ' (Shiny)' : ''}`} 
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <Sword className="h-16 w-16 text-primary-400" style={{ display: currentImage ? 'none' : 'block' }} />
                      </div>
                      
                      {/* Shiny Toggle Button */}
                      {unit.shinyImage && (
                        <motion.button
                          className={`absolute -bottom-3 -right-3 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                            isShiny 
                              ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-xl shadow-yellow-500/60 border-yellow-300 ring-2 ring-yellow-300/50' 
                              : 'bg-gradient-to-r from-gray-600 to-gray-700 text-gray-300 hover:from-gray-500 hover:to-gray-600 border-gray-500 shadow-lg hover:shadow-yellow-400/30 hover:border-yellow-400/50'
                          }`}
                          onClick={handleShinyToggle}
                          whileHover={{ scale: 1.15, rotate: 360 }}
                          whileTap={{ scale: 0.9 }}
                          transition={{ duration: 0.3 }}
                          title={isShiny ? 'Switch to Normal' : 'Switch to Shiny'}
                        >
                          <Sparkles className={`h-6 w-6 ${isShiny ? 'animate-pulse' : ''}`} />
                          {isShiny && (
                            <motion.div
                              className="absolute inset-0 rounded-full bg-yellow-400"
                              initial={{ scale: 0, opacity: 0.8 }}
                              animate={{ scale: 1.5, opacity: 0 }}
                              transition={{ duration: 1, repeat: Infinity }}
                            />
                          )}
                        </motion.button>
                      )}
                    </div>
                  </div>

                  {/* Unit Name */}
                  <motion.h1 
                    className="text-2xl font-game font-bold text-white mb-4 text-center"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    {unit.name}
                    {isShiny && (
                      <motion.span 
                        className="block text-yellow-400 text-sm mt-1 flex items-center justify-center gap-2 bg-yellow-500/20 px-3 py-1 rounded-full border border-yellow-400/30 mx-auto w-fit"
                        initial={{ opacity: 0, scale: 0, rotate: -180 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ duration: 0.5, type: "spring" }}
                      >
                        <Sparkles className="h-4 w-4 animate-pulse" />
                        <span className="font-bold">SHINY</span>
                      </motion.span>
                    )}
                  </motion.h1>
                  
                  {/* Unit Badges */}
                  <motion.div 
                    className="space-y-3 mb-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <motion.div 
                      className={`w-full px-4 py-3 rounded-xl text-base font-bold border-2 shadow-2xl flex items-center justify-center gap-2 rarity-${unit.rarity.toLowerCase()}`}
                      whileHover={{ scale: 1.02, y: -2 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <Crown className="h-5 w-5" />
                      <span className="tracking-wider">{unit.rarity}</span>
                      {unit.rarity === 'Mythical' && (
                        <Sparkles className="h-5 w-5 animate-pulse" />
                      )}
                    </motion.div>
                    
                    <motion.div 
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-dark-300/50 border border-white/10 shadow-lg"
                      whileHover={{ scale: 1.02, y: -2 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <img 
                        src={getTierData(unit.tier).icon} 
                        alt={getTierData(unit.tier).label}
                        className="w-5 h-5 object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <span className="text-base font-bold text-white">{getTierData(unit.tier).label}</span>
                    </motion.div>
                    
                    <motion.div 
                      className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl ${elementStyle.bg} border border-white/10 shadow-lg`}
                      whileHover={{ scale: 1.02, y: -2 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <img 
                        src={elementStyle.icon} 
                        alt={unit.element}
                        className="w-5 h-5 object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                      <span className={`text-base font-bold ${elementStyle.color}`}>{unit.element}</span>
                    </motion.div>
                  </motion.div>

                  {/* Description */}
                  {unit.description && (
                    <motion.div
                      className="bg-dark-200/30 rounded-xl p-4 border border-primary-500/20 flex-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <h3 className="text-sm font-bold text-primary-400 mb-2 uppercase tracking-wider">Description</h3>
                      <p className="text-gray-300 leading-relaxed text-sm">
                        {unit.description}
                      </p>
                    </motion.div>
                  )}
                </div>

                {/* Right Panel - Content Sections */}
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent p-8 space-y-8">
                
                {/* Interactive Base Stats Section */}
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl border border-blue-500/30">
                      <TrendingUp className="h-6 w-6 text-blue-400" />
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      Interactive Stats Calculator
                    </h2>
                  </div>
                  <div className="bg-gradient-to-br from-slate-800/40 to-slate-700/20 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl ring-1 ring-white/5">
                    
                    <div className="mb-6 p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl border border-blue-500/20 backdrop-blur-sm">
                      <div className="flex items-start gap-3">
                        <div className="p-1 bg-blue-500/20 rounded-lg">
                          <Award className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-blue-100 text-sm font-medium">
                            <strong>Base Unit Stats:</strong> All units start with D-D-D stats. Use the selectors below to see how this unit would perform with different stat grades!
                          </p>
                          <p className="text-blue-200/80 text-xs mt-2">
                            <strong>Note:</strong> Higher stat grades increase Damage & Range, but <em>reduce</em> SPA (making attacks faster).
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Interactive Stat Grade Selectors */}
                    <div className="grid grid-cols-3 gap-6 mb-6">
                      {/* Damage Grade Selector */}
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

                      {/* Speed Grade Selector */}
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

                      {/* Range Grade Selector */}
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
                  </div>
                </motion.section>

                {/* Upgrade Stats */}
                {unit.upgradeStats && unit.upgradeStats.levels.length > 0 && (
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl border border-yellow-500/30">
                        <Zap className="h-6 w-6 text-yellow-400" />
                      </div>
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                        Level 60 Upgrade Stats
                      </h2>
                    </div>
                    <div className="bg-gradient-to-br from-slate-800/40 to-slate-700/20 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl ring-1 ring-white/5">
                      {/* Level Selector */}
                      <div className="mb-4">
                        <label className="block text-sm font-bold text-white mb-2">Select Upgrade Level:</label>
                        <div className="flex flex-wrap gap-2">
                          {unit.upgradeStats.levels.map((level, index) => (
                            <motion.button
                              key={index}
                              onClick={() => setSelectedLevel(index)}
                              className={`px-3 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                                selectedLevel === index
                                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/50'
                                  : 'bg-dark-300/50 text-gray-300 hover:bg-dark-300/80 hover:text-white'
                              }`}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Level {level.level}
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      {/* Selected Level Stats with Stat Bonuses Applied */}
                      {unit.upgradeStats.levels[selectedLevel] && (
                        <motion.div
                          key={`${selectedLevel}-${selectedPercentages.damage}-${selectedPercentages.speed}-${selectedPercentages.range}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className="bg-gradient-to-r from-primary-600/20 to-secondary-600/20 rounded-lg p-4 border border-primary-500/30"
                        >
                          <div className="flex items-center mb-4">
                            <div className="w-10 h-10 bg-primary-600/50 rounded-full flex items-center justify-center text-lg font-bold text-primary-300 mr-3">
                              {unit.upgradeStats.levels[selectedLevel].level}
                            </div>
                            <h3 className="text-lg font-game font-bold text-white">
                              Level {unit.upgradeStats.levels[selectedLevel].level} Stats (With Stat Bonuses)
                            </h3>
                          </div>

                          {(() => {
                            const baseLevel = unit.upgradeStats.levels[selectedLevel]
                            const bonusedStats = {
                              atkDamage: Math.round(baseLevel.atkDamage * (1 + selectedPercentages.damage / 100)),
                              spa: parseFloat((baseLevel.spa * (1 - selectedPercentages.speed / 100)).toFixed(1)),
                              range: parseFloat((baseLevel.range * (1 + selectedPercentages.range / 100)).toFixed(1))
                            }

                            return (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                  <div className="bg-yellow-500/20 rounded-lg p-3 border border-yellow-500/30">
                                    <div className="text-yellow-400 text-xs font-bold uppercase tracking-wider mb-1">Yen Cost</div>
                                    <div className="text-yellow-300 text-lg font-mono font-bold">
                                      {baseLevel.yenCost.toLocaleString()}¥
                                    </div>
                                  </div>

                                  <div className="bg-red-500/20 rounded-lg p-3 border border-red-500/30">
                                    <div className="text-red-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                                      <Sword className="h-3 w-3" />
                                      ATK DMG
                                    </div>
                                    <div className="text-red-300 text-lg font-mono font-bold">
                                      {bonusedStats.atkDamage}
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
                                      Range
                                    </div>
                                    <div className="text-blue-300 text-lg font-mono font-bold">
                                      {bonusedStats.range}
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
                                      {bonusedStats.spa}
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
                        </motion.div>
                      )}

                      <div className="mt-3 text-xs text-gray-400 bg-dark-200/30 p-2 rounded-lg">
                        <p><strong>Note:</strong> Base stats at Level 60 per upgrade level.</p>
                        <div className="flex flex-wrap gap-3 mt-1 text-xs">
                          <span>• <strong>SPA:</strong> Speed/Attack Speed</span>
                          <span>• <strong>Crit DMG:</strong> Critical damage multiplier</span>
                        </div>
                      </div>
                    </div>
                  </motion.section>
                )}

                {/* Obtainment */}
                {unit.obtainment && (
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
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
                  </motion.section>
                )}

                {/* Video Section */}
                {unit.videoUrl && (
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.65 }}
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
                  </motion.section>
                )}

                {/* Skills */}
                {unit.skills && unit.skills.length > 0 && (
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 rounded-xl border border-orange-500/30">
                        <Star className="h-6 w-6 text-orange-400" />
                      </div>
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
                        Skills & Abilities
                      </h2>
                    </div>
                    <div className="grid gap-3">
                      {unit.skills.map((skill, index) => (
                        <motion.div 
                          key={index} 
                          className="bg-gradient-to-br from-orange-500/10 to-yellow-500/10 backdrop-blur-sm rounded-xl p-4 border border-orange-500/20 shadow-xl hover:shadow-orange-500/20 transition-all duration-300"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.8 + index * 0.1 }}
                          whileHover={{ scale: 1.01, y: -2 }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-game font-bold text-white text-base">{skill.name}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-bold border ${
                              skill.type === 'Active' 
                                ? 'bg-green-500/20 text-green-400 border-green-400/30' 
                                : 'bg-blue-500/20 text-blue-400 border-blue-400/30'
                            }`}>
                              {skill.type}
                            </span>
                          </div>
                          <p className="text-gray-300 leading-relaxed text-sm">{skill.description}</p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.section>
                )}

                {/* Evolutions */}
                {unit.evolutions && unit.evolutions.length > 0 && !unit.doesntEvolve && (
                  <section>
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
                                      src={getElementIcon(evo.element).icon} 
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

                          {/* Evolution Bonuses */}
                          {evo.bonuses && evo.bonuses.length > 0 && (
                            <div className="mb-4">
                              <h4 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-1">
                                <Gift className="h-4 w-4" />
                                Evolution Bonuses
                              </h4>
                              <div className="space-y-1">
                                {evo.bonuses.map((bonus, bonusIndex) => (
                                  <div key={bonusIndex} className="flex items-start gap-2">
                                    <Star className="h-3 w-3 text-green-400 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-300 text-sm">{bonus}</span>
                                  </div>
                                ))}
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
                  </section>
                )}

                {/* Traits */}
                {unit.traits && unit.traits.length > 0 && (
                  <section>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30">
                        <Award className="h-6 w-6 text-green-400" />
                      </div>
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                        Special Traits
                      </h2>
                    </div>
                    <div className="bg-gradient-to-br from-slate-800/40 to-slate-700/20 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl ring-1 ring-white/5">
                      <div className="flex flex-wrap gap-2">
                                                  {unit.traits.map((trait, index) => (
                            <motion.span 
                              key={index} 
                              className="px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 rounded-xl text-sm font-medium border border-green-500/30 hover:border-green-400/50 transition-all duration-300 backdrop-blur-sm"
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.1 }}
                              whileHover={{ scale: 1.05, y: -2 }}
                            >
                              {trait}
                            </motion.span>
                          ))}
                      </div>
                    </div>
                  </section>
                )}

                {/* Trivia */}
                {unit.trivia && unit.trivia.length > 0 && (
                  <section>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-gradient-to-r from-indigo-500/20 to-blue-500/20 rounded-xl border border-indigo-500/30">
                        <Star className="h-6 w-6 text-indigo-400" />
                      </div>
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
                        Trivia
                      </h2>
                    </div>
                    <div className="bg-gradient-to-br from-slate-800/40 to-slate-700/20 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl ring-1 ring-white/5">
                      <ul className="space-y-2">
                        {unit.trivia.map((fact, index) => (
                          <li key={index} className="text-gray-300 text-sm flex items-start">
                            <Star className="h-3 w-3 text-secondary-400 mr-2 mt-0.5 flex-shrink-0" />
                            {fact}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </section>
                )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enlarged Image Overlay */}
      <AnimatePresence>
        {isImageEnlarged && currentImage && (
          <motion.div
            className="fixed inset-0 bg-black/95 flex items-center justify-center z-[60] p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsImageEnlarged(false)}
          >
            <motion.div
              className="relative max-w-3xl max-h-[90vh] w-full h-full flex items-center justify-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setIsImageEnlarged(false)}
                className="absolute top-4 right-4 p-3 bg-black/50 hover:bg-black/70 rounded-full transition-colors z-10"
              >
                <X className="h-6 w-6 text-white" />
              </button>

              {/* Unit name and shiny indicator */}
              <div className="absolute top-4 left-4 z-10">
                <div className="bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2">
                  <h3 className="text-xl font-game font-bold text-white flex items-center gap-2">
                    {unit.name}
                    {isShiny && (
                      <span className="text-yellow-400 flex items-center gap-1">
                        <Sparkles className="h-5 w-5" />
                        <span className="text-sm font-medium">Shiny</span>
                      </span>
                    )}
                  </h3>
                </div>
              </div>

              {/* Enlarged Image */}
              <div className={`relative rounded-xl overflow-hidden ${isShiny ? 'ring-4 ring-yellow-400 shadow-2xl shadow-yellow-400/50' : 'ring-2 ring-primary-500/50'}`}>
                <img
                  src={currentImage}
                  alt={`${unit.name}${isShiny ? ' (Shiny)' : ''} - Enlarged`}
                  className="max-w-full max-h-[80vh] object-contain"
                  onError={() => setIsImageEnlarged(false)}
                />
              </div>

              {/* Toggle between normal and shiny if both exist */}
              {unit.shinyImage && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-4">
                    <button
                      onClick={() => setIsShiny(false)}
                      className={`px-3 py-2 rounded-lg transition-all duration-300 ${
                        !isShiny 
                          ? 'bg-white text-dark-100 shadow-lg' 
                          : 'text-white hover:bg-white/20'
                      }`}
                    >
                      Normal
                    </button>
                    <button
                      onClick={() => setIsShiny(true)}
                      className={`px-3 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 ${
                        isShiny 
                          ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/50' 
                          : 'text-white hover:bg-yellow-500/20'
                      }`}
                    >
                      <Sparkles className="h-4 w-4" />
                      Shiny
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default UnitModal 