import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sword } from 'lucide-react'
import UnitModal from '../components/UnitModal'
import { UnitData } from '../data/unitsDatabase'
import { useUnits } from '../contexts/UnitsContext'

// Helper function to get tier icon and label
const getTierData = (tier: string) => {
  const tierDataMap: { [key: string]: { icon: string; label: string } } = {
    // New tier system
    'Broken': { icon: '/images/Unit Tiers/Broken.webp', label: 'Broken' },
    'Meta': { icon: '/images/Unit Tiers/Meta.webp', label: 'Meta' },
    'SemiMeta': { icon: '/images/Unit Tiers/SemiMeta.webp', label: 'SemiMeta' },
    'MetaSupport': { icon: '/images/Unit Tiers/MetaSupport.webp', label: 'MetaSupport' },
    'Support': { icon: '/images/Unit Tiers/Support.webp', label: 'Support' },
    'Good': { icon: '/images/Unit Tiers/Good.webp', label: 'Good' },
    'Bad': { icon: '/images/Unit Tiers/Bad.webp', label: 'Bad' },
    // Legacy mapping for units database compatibility
    'Monarch': { icon: '/images/Unit Tiers/Broken.webp', label: 'Broken' },
    'Godly': { icon: '/images/Unit Tiers/Meta.webp', label: 'Meta' },
    'Z+': { icon: '/images/Unit Tiers/SemiMeta.webp', label: 'SemiMeta' },
    'S+': { icon: '/images/Unit Tiers/MetaSupport.webp', label: 'MetaSupport' },
    'A+': { icon: '/images/Unit Tiers/Good.webp', label: 'Good' },
    'B+': { icon: '/images/Unit Tiers/Bad.webp', label: 'Bad' },
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

const TierList = () => {
  const { getUnitByName, units } = useUnits()
  const [selectedUnit, setSelectedUnit] = useState<UnitData | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleUnitClick = (unitName: string) => {
    const unit = getUnitByName(unitName)
    if (unit) {
      setSelectedUnit(unit)
      setIsModalOpen(true)
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedUnit(null)
  }

  // Generate tier data from database units
  const generateTierData = () => {
    const tierData: { [key: string]: Array<{ name: string; element: string; tier: string; rarity: string }> } = {
      Broken: [],
      Meta: [],
      SemiMeta: [],
      MetaSupport: [],
      Support: [],
      Good: [],
      Bad: []
    }

    // Process all units and their evolutions
    units.forEach(unit => {
      // Add base unit based on its tier
      const mappedTier = mapToNewTierSystem(unit.tier)
      if (tierData[mappedTier]) {
        tierData[mappedTier].push({
          name: unit.name,
          element: unit.element,
          tier: unit.tier,
          rarity: unit.rarity
        })
      }

      // Add evolutions based on their tiers
      if (unit.evolutions) {
        unit.evolutions.forEach(evolution => {
          const evolutionTier = mapToNewTierSystem(evolution.tier)
          if (tierData[evolutionTier]) {
            tierData[evolutionTier].push({
              name: evolution.name,
              element: evolution.element,
              tier: evolution.tier,
              rarity: evolution.rarity
            })
          }
        })
      }
    })

    // Sort units within each tier by name
    Object.keys(tierData).forEach(tier => {
      tierData[tier].sort((a, b) => a.name.localeCompare(b.name))
    })

    return tierData
  }

  // Map old tier system to new tier system
  const mapToNewTierSystem = (oldTier: string): string => {
    const tierMapping: { [key: string]: string } = {
      'Monarch': 'Broken',
      'Godly': 'Meta',
      'Z+': 'SemiMeta',
      'S+': 'MetaSupport',
      'S': 'Support',
      'A+': 'Good',
      'A': 'Good',
      'B+': 'Bad',
      'B': 'Bad',
      'C': 'Bad',
      'D': 'Bad'
    }
    return tierMapping[oldTier] || 'Bad'
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
      // Additional elements from database
      Shadow: { icon: '/images/Elements/Curse.webp', color: 'text-purple-800', bg: 'bg-purple-900/20' },
      Death: { icon: '/images/Elements/Curse.webp', color: 'text-gray-800', bg: 'bg-gray-900/20' },
      Soul: { icon: '/images/Elements/Holy (1).webp', color: 'text-cyan-300', bg: 'bg-cyan-500/20' },
      Psychic: { icon: '/images/Elements/Cosmic.webp', color: 'text-purple-300', bg: 'bg-purple-500/20' },
      Time: { icon: '/images/Elements/Cosmic.webp', color: 'text-indigo-400', bg: 'bg-indigo-500/20' },
      Willpower: { icon: '/images/Elements/Fire.webp', color: 'text-red-300', bg: 'bg-red-600/20' },
      Rubber: { icon: '/images/Elements/UnknownElement.webp', color: 'text-yellow-400', bg: 'bg-yellow-600/20' },
      Wind: { icon: '/images/Elements/Nature.webp', color: 'text-green-300', bg: 'bg-green-600/20' },
      Dark: { icon: '/images/Elements/Curse.webp', color: 'text-gray-600', bg: 'bg-gray-800/20' },
      Chakra: { icon: '/images/Elements/Spark.webp', color: 'text-blue-300', bg: 'bg-blue-600/20' },
    }

    return elementStyles[element] || { icon: '/images/Elements/UnknownElement.webp', color: 'text-gray-400', bg: 'bg-gray-500/20' }
  }

  const tierData = generateTierData()

  const getTierColor = (tier: string) => {
    // Return transparent background for all tiers
    return 'bg-transparent'
  }

  return (
    <div className="min-h-screen pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-game font-bold text-gradient-primary mb-4">
              Unit Tier List
            </h1>
            <p className="text-gray-300 text-lg">
              Official community rankings based on performance and utility
            </p>
          </div>

          <div className="space-y-8">
            {Object.entries(tierData)
              .filter(([_, units]) => units.length > 0) // Only show tiers with units
              .map(([tier, units], tierIndex) => (
              <motion.div
                key={tier}
                className="card p-6"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: tierIndex * 0.1 }}
              >
                                  <div className="flex items-center mb-6">
                    <div className={`w-20 h-20 rounded-lg ${getTierColor(tier)} flex items-center justify-center mr-6 p-2`}>
                      <img 
                        src={getTierData(tier).icon} 
                        alt={getTierData(tier).label} 
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  <div>
                    <h2 className="text-2xl font-game font-bold text-white">{getTierData(tier).label}</h2>
                    <p className="text-gray-400">
                      {tier === 'Broken' && 'Game-breaking - Completely overpowered units'}
                      {tier === 'Meta' && 'Meta defining - Top tier units dominating the meta'}
                      {tier === 'SemiMeta' && 'Semi-meta - Strong units with specific niches'}
                      {tier === 'MetaSupport' && 'Meta support - Essential support units for meta teams'}
                      {tier === 'Support' && 'Support - Reliable support units for various teams'}
                      {tier === 'Good' && 'Good - Solid units for most content'}
                      {tier === 'Bad' && 'Underperforming - Weak units that need buffs'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {units.map((unit, unitIndex) => {
                    const elementStyle = getElementIcon(unit.element)
                    return (
                      <motion.div
                        key={unitIndex}
                        className="bg-dark-300/50 rounded-lg p-4 hover:bg-dark-300/70 transition-colors duration-300 cursor-pointer"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: tierIndex * 0.1 + unitIndex * 0.05 }}
                        onClick={() => handleUnitClick(unit.name)}
                      >
                        <div className="aspect-square bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                          {(() => {
                            const fullUnit = getUnitByName(unit.name)
                            return fullUnit?.image ? (
                              <img 
                                src={fullUnit.image} 
                                alt={unit.name} 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null
                          })()}
                          <Sword className={`h-8 w-8 text-primary-400 ${getUnitByName(unit.name)?.image ? 'hidden' : ''}`} />
                        </div>
                        <h3 className="font-game font-bold text-white text-sm mb-1">{unit.name}</h3>
                        <div className="flex flex-col space-y-1">
                          <div className={`flex items-center justify-center space-x-1 px-2 py-1 rounded-lg ${elementStyle.bg}`}>
                            <img 
                              src={elementStyle.icon} 
                              alt={unit.element}
                              className="w-4 h-4 object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                            <span className={`text-xs font-medium ${elementStyle.color}`}>{unit.element}</span>
                          </div>
                          <div className={`text-center px-2 py-1 rounded text-xs font-medium rarity-${unit.rarity.toLowerCase()}`}>
                            {unit.rarity}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="mt-12 card p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <h3 className="text-xl font-game font-bold text-gradient-accent mb-4">Tier List Notes</h3>
            <ul className="space-y-2 text-gray-300">
              <li>• Rankings are based on overall performance across all game modes</li>
              <li>• Unit placement considers both evolved and base forms</li>
              <li>• Meta shifts may affect rankings - check for updates regularly</li>
              <li>• Individual playstyle and team composition can affect unit effectiveness</li>
            </ul>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Unit Detail Modal */}
      <UnitModal 
        unit={selectedUnit} 
        isOpen={isModalOpen} 
        onClose={closeModal} 
      />
    </div>
  )
}

export default TierList 