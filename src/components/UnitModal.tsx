import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Star, Sword, Shield, Zap, Gift, Crown, Target, Sparkles } from 'lucide-react'

interface UnitData {
  name: string
  tier: string
  element: string
  rarity: string
  cost: number
  image?: string
  shinyImage?: string
  description?: string
  obtainment?: string
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
  skills?: Array<{
    name: string
    description: string
    type: 'Active' | 'Passive'
  }>
  traits?: string[]
  trivia?: string[]
}

interface UnitModalProps {
  unit: UnitData | null
  isOpen: boolean
  onClose: () => void
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

const UnitModal: React.FC<UnitModalProps> = ({ unit, isOpen, onClose }) => {
  const [isShiny, setIsShiny] = useState(false)
  const [isImageEnlarged, setIsImageEnlarged] = useState(false)

  // Reset shiny state and image enlargement when unit changes
  useEffect(() => {
    setIsShiny(false)
    setIsImageEnlarged(false)
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

  return (
    <>
      {/* Main Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            <motion.div
              className="bg-gradient-to-br from-dark-100 to-dark-200 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden relative shadow-2xl border border-primary-500/30"
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-dark-100/95 to-dark-200/95 backdrop-blur-sm border-b border-primary-500/30 p-6 z-10">
                <motion.button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-3 hover:bg-red-500/20 rounded-xl transition-all duration-200 group border border-transparent hover:border-red-500/30"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="h-6 w-6 text-gray-400 group-hover:text-red-400 transition-colors" />
                </motion.button>
                
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Unit Image */}
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <div 
                        className={`w-32 h-32 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-lg flex items-center justify-center overflow-hidden cursor-pointer transition-all duration-300 ${isShiny ? 'ring-2 ring-yellow-400 shadow-lg shadow-yellow-400/50' : ''}`}
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

                  {/* Unit Info */}
                  <div className="flex-1">
                    <motion.h1 
                      className="text-4xl font-game font-bold text-white mb-3 flex items-center gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      {unit.name}
                      {isShiny && (
                        <motion.span 
                          className="text-yellow-400 flex items-center gap-2 bg-yellow-500/20 px-3 py-1 rounded-full border border-yellow-400/30"
                          initial={{ opacity: 0, scale: 0, rotate: -180 }}
                          animate={{ opacity: 1, scale: 1, rotate: 0 }}
                          transition={{ duration: 0.5, type: "spring" }}
                        >
                          <Sparkles className="h-5 w-5 animate-pulse" />
                          <span className="text-sm font-bold">SHINY</span>
                        </motion.span>
                      )}
                    </motion.h1>
                    <motion.div 
                      className="flex flex-wrap gap-3 mb-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <motion.div 
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-300/50 shadow-lg border border-white/10"
                        whileHover={{ scale: 1.05 }}
                      >
                        <img 
                          src={getTierData(unit.tier).icon} 
                          alt={getTierData(unit.tier).label}
                          className="w-6 h-6 object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <span className="text-sm font-bold text-white">{getTierData(unit.tier).label}</span>
                      </motion.div>
                      <motion.div 
                        className={`flex items-center space-x-2 px-4 py-2 rounded-xl ${elementStyle.bg} border border-white/10 shadow-lg`}
                        whileHover={{ scale: 1.05 }}
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
                        <span className={`text-sm font-bold ${elementStyle.color}`}>{unit.element}</span>
                      </motion.div>
                      <motion.span 
                        className={`px-4 py-2 rounded-xl text-sm font-bold border border-white/10 shadow-lg rarity-${unit.rarity.toLowerCase()}`}
                        whileHover={{ scale: 1.05 }}
                      >
                        {unit.rarity}
                      </motion.span>
                      <motion.span 
                        className="px-4 py-2 bg-gradient-to-r from-accent-500/20 to-accent-600/20 text-accent-400 rounded-xl text-sm font-bold flex items-center gap-2 border border-accent-400/30 shadow-lg"
                        whileHover={{ scale: 1.05 }}
                      >
                        <Crown className="h-4 w-4" />
                        {unit.cost.toLocaleString()} gems
                      </motion.span>
                    </motion.div>
                    {unit.description && (
                      <motion.p 
                        className="text-gray-300 mb-4 leading-relaxed text-base"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        {unit.description}
                      </motion.p>
                    )}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-8 overflow-y-auto max-h-[60vh] scrollbar-thin scrollbar-thumb-primary-500/50 scrollbar-track-dark-200/50">
                {/* Upgrade Stats */}
                {unit.upgradeStats && unit.upgradeStats.levels.length > 0 && (
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <h2 className="text-2xl font-game font-bold text-gradient-primary mb-6 flex items-center">
                      <Zap className="h-6 w-6 mr-3 text-yellow-400" />
                      Level 60 Upgrade Stats
                    </h2>
                    <div className="bg-gradient-to-br from-dark-200/50 to-dark-300/50 backdrop-blur-sm rounded-2xl p-6 border border-primary-500/20 shadow-xl">
                      <div className="overflow-x-auto rounded-xl border border-primary-500/20">
                        <table className="w-full min-w-[600px]">
                          <thead>
                            <tr className="bg-gradient-to-r from-primary-600/20 to-secondary-600/20 border-b border-primary-500/30">
                              <th className="text-left py-4 px-4 text-sm font-bold text-white">Level</th>
                              <th className="text-center py-4 px-4 text-sm font-bold text-yellow-400">Yen Cost</th>
                              <th className="text-center py-4 px-4 text-sm font-bold text-red-400">ATK DMG</th>
                              <th className="text-center py-4 px-4 text-sm font-bold text-blue-400">Range</th>
                              <th className="text-center py-4 px-4 text-sm font-bold text-cyan-400">SPA</th>
                              <th className="text-center py-4 px-4 text-sm font-bold text-orange-400">Crit DMG</th>
                              <th className="text-center py-4 px-4 text-sm font-bold text-green-400">Crit %</th>
                            </tr>
                          </thead>
                          <tbody>
                            {unit.upgradeStats.levels.map((level, index) => (
                              <motion.tr 
                                key={index} 
                                className={`border-b border-gray-700/30 hover:bg-primary-500/10 transition-all duration-200 ${index % 2 === 0 ? 'bg-dark-200/20' : 'bg-dark-300/20'}`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + index * 0.1 }}
                                whileHover={{ scale: 1.02, backgroundColor: 'rgba(139, 92, 246, 0.15)' }}
                              >
                                <td className="py-3 px-3">
                                  <div className="flex items-center">
                                    <div className="w-8 h-8 bg-primary-600/30 rounded-full flex items-center justify-center text-sm font-bold text-primary-400 mr-2">
                                      {level.level}
                                    </div>
                                    <span className="text-white font-medium">Level {level.level}</span>
                                  </div>
                                </td>
                                <td className="text-center py-3 px-3">
                                  <span className="text-yellow-400 font-mono">
                                    {level.yenCost.toLocaleString()}¥
                                  </span>
                                </td>
                                <td className="text-center py-3 px-3">
                                  <span className="text-red-400 font-mono flex items-center justify-center gap-1">
                                    <Sword className="h-3 w-3" />
                                    {level.atkDamage}
                                  </span>
                                </td>
                                <td className="text-center py-3 px-3">
                                  <span className="text-blue-400 font-mono flex items-center justify-center gap-1">
                                    <Target className="h-3 w-3" />
                                    {level.range}
                                  </span>
                                </td>
                                <td className="text-center py-3 px-3">
                                  <span className="text-cyan-400 font-mono flex items-center justify-center gap-1">
                                    <Zap className="h-3 w-3" />
                                    {level.spa}
                                  </span>
                                </td>
                                <td className="text-center py-3 px-3">
                                  <span className="text-orange-400 font-mono">
                                    {level.critDamage}
                                  </span>
                                </td>
                                <td className="text-center py-3 px-3">
                                  <span className="text-green-400 font-mono">
                                    {level.critChance}%
                                  </span>
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="mt-4 text-xs text-gray-400 bg-dark-200/30 p-3 rounded-lg">
                        <p><strong>Note:</strong> These are the base stats for a Level 60 unit at each upgrade level.</p>
                        <div className="flex flex-wrap gap-4 mt-2">
                          <span>• <strong>Yen Cost:</strong> Currency cost to upgrade</span>
                          <span>• <strong>SPA:</strong> Speed/Attack Speed</span>
                          <span>• <strong>Crit DMG:</strong> Critical damage multiplier</span>
                          <span>• <strong>Crit %:</strong> Critical hit chance</span>
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
                    <h2 className="text-2xl font-game font-bold text-gradient-secondary mb-6 flex items-center">
                      <Gift className="h-6 w-6 mr-3 text-pink-400" />
                      How to Obtain
                    </h2>
                    <div className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 backdrop-blur-sm rounded-2xl p-6 border border-pink-500/20 shadow-xl">
                      <p className="text-gray-300 text-lg leading-relaxed">{unit.obtainment}</p>
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
                    <h2 className="text-2xl font-game font-bold text-gradient-accent mb-6 flex items-center">
                      <Star className="h-6 w-6 mr-3 text-orange-400" />
                      Skills & Abilities
                    </h2>
                    <div className="grid gap-4">
                      {unit.skills.map((skill, index) => (
                        <motion.div 
                          key={index} 
                          className="bg-gradient-to-br from-orange-500/10 to-yellow-500/10 backdrop-blur-sm rounded-2xl p-6 border border-orange-500/20 shadow-xl hover:shadow-orange-500/20 transition-all duration-300"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.8 + index * 0.1 }}
                          whileHover={{ scale: 1.02, y: -2 }}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-game font-bold text-white text-lg">{skill.name}</h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-bold border ${
                              skill.type === 'Active' 
                                ? 'bg-green-500/20 text-green-400 border-green-400/30' 
                                : 'bg-blue-500/20 text-blue-400 border-blue-400/30'
                            }`}>
                              {skill.type}
                            </span>
                          </div>
                          <p className="text-gray-300 leading-relaxed">{skill.description}</p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.section>
                )}

                {/* Evolutions */}
                {unit.evolutions && unit.evolutions.length > 0 && (
                  <section>
                    <h2 className="text-xl font-game font-bold text-gradient-primary mb-4 flex items-center">
                      <Crown className="h-5 w-5 mr-2" />
                      Evolution Path
                    </h2>
                    <div className="space-y-4">
                      {unit.evolutions.map((evo, index) => (
                        <div key={index} className="card p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h3 className="font-game font-bold text-white">{evo.name}</h3>
                              <div className="flex gap-2 mt-1">
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
                                <span className="px-2 py-1 bg-accent-500/20 text-accent-400 rounded text-xs flex items-center gap-1">
                                  <Crown className="h-3 w-3" />
                                  {evo.cost} gems
                                </span>
                              </div>
                            </div>
                            <Shield className="h-5 w-5 text-primary-400" />
                          </div>
                          {evo.description && (
                            <p className="text-gray-300 text-sm mb-3">{evo.description}</p>
                          )}
                          <p className="text-gray-400 text-sm mb-3">
                            <strong>Requirements:</strong> {evo.requirements}
                          </p>
                          {evo.bonuses.length > 0 && (
                            <div>
                              <h4 className="text-sm font-bold text-secondary-400 mb-2">Bonuses:</h4>
                              <ul className="space-y-1">
                                {evo.bonuses.map((bonus, bonusIndex) => (
                                  <li key={bonusIndex} className="text-gray-300 text-sm flex items-start">
                                    <Star className="h-3 w-3 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
                                    {bonus}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Traits */}
                {unit.traits && unit.traits.length > 0 && (
                  <section>
                    <h2 className="text-xl font-game font-bold text-gradient-accent mb-4">Special Traits</h2>
                    <div className="flex flex-wrap gap-2">
                      {unit.traits.map((trait, index) => (
                        <span key={index} className="px-3 py-1 bg-accent-500/20 text-accent-400 rounded-lg text-sm">
                          {trait}
                        </span>
                      ))}
                    </div>
                  </section>
                )}

                {/* Trivia */}
                {unit.trivia && unit.trivia.length > 0 && (
                  <section>
                    <h2 className="text-xl font-game font-bold text-gradient-secondary mb-4">Trivia</h2>
                    <div className="card p-4">
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