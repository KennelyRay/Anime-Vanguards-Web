import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sword } from 'lucide-react'
import UnitModal from '../components/UnitModal'
import { UnitData } from '../data/unitsDatabase'
import { useUnits } from '../contexts/UnitsContext'

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

const TierList = () => {
  const { getUnitByName } = useUnits()
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

  const tierData = {
    S: [
      { name: 'Koguro (Unsealed)', element: 'Curse' },
      { name: 'Song Jinwu and Igros', element: 'Curse' },
      { name: 'Divalo (Requiem)', element: 'Curse' },
      { name: 'Rogita (Super 4)', element: 'Fire' },
      { name: 'Arc (True Ancestor)', element: 'Unbound' },
      { name: 'Slime (King)', element: 'Water' },
      { name: 'Song Jinwu (Monarch)', element: 'Curse' },
      { name: 'Astolfo (Rider of Black)', element: 'Holy' },
    ],
    A: [
      { name: 'Byeken (Ronin)', element: 'Unknown' },
      { name: 'Lfelt (Love)', element: 'Passion' },
      { name: 'Marlin (Gluttony)', element: 'Curse' },
      { name: 'Smith John', element: 'Unknown' },
      { name: 'Lord of Shadows', element: 'Curse' },
      { name: 'Delusional Boy', element: 'Cosmic' },
      { name: 'Super Vogito', element: 'Fire' },
      { name: 'Yehowach (Almighty)', element: 'Holy' },
      { name: 'Valentine (Love Train)', element: 'Cosmic' },
      { name: 'Gujo (Infinity)', element: 'Cosmic' },
      { name: 'Alocard (Vampire King)', element: 'Unbound' },
      { name: 'Saber (Black Tyrant)', element: 'Curse' },
    ],
    B: [
      { name: 'Hebano (Clematis)', element: 'Nature' },
      { name: 'Rudie (Prodigy)', element: 'Holy' },
      { name: 'Brisket (Yo-yo)', element: 'Unknown' },
      { name: 'Al (Good)', element: 'Holy' },
      { name: 'Dark Mage (Evil)', element: 'Curse' },
      { name: 'Dawntay (Jackpot)', element: 'Holy' },
      { name: 'Dave (Cyber Psycho)', element: 'Spark' },
      { name: 'Foboko (Hellish)', element: 'Fire' },
      { name: 'Kazzy (Queen)', element: 'Curse' },
      { name: 'Gilgamesh (King of Heroes)', element: 'Holy' },
      { name: 'Mimi (Psychic)', element: 'Cosmic' },
    ],
    C: [
      { name: 'Tuji (Sorcerer Killer)', element: 'Curse' },
      { name: 'Julias (Eisplosion)', element: 'Water' },
      { name: 'Renguko (Purgatory)', element: 'Fire' },
      { name: 'Ultimate Rohan', element: 'Unknown' },
      { name: 'Ichiga (Savior)', element: 'Holy' },
      { name: 'Yuruicha (Raijin)', element: 'Spark' },
    ]
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'S': return 'from-red-500 to-red-600'
      case 'A': return 'from-orange-500 to-orange-600'
      case 'B': return 'from-yellow-500 to-yellow-600'
      case 'C': return 'from-green-500 to-green-600'
      default: return 'from-gray-500 to-gray-600'
    }
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
            {Object.entries(tierData).map(([tier, units], tierIndex) => (
              <motion.div
                key={tier}
                className="card p-6"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: tierIndex * 0.1 }}
              >
                                  <div className="flex items-center mb-6">
                    <div className={`w-20 h-20 rounded-lg bg-gradient-to-r ${getTierColor(tier)} flex items-center justify-center mr-6 p-2`}>
                      <img src={getTierIcon(tier)} alt={tier} className="w-full h-full object-contain" />
                    </div>
                  <div>
                    <h2 className="text-2xl font-game font-bold text-white">{getTierData(tier).label}</h2>
                    <p className="text-gray-400">
                      {tier === 'S' && 'Overpowered - Best units in the game'}
                      {tier === 'A' && 'Excellent - Very strong and reliable'}
                      {tier === 'B' && 'Good - Solid choice for most content'}
                      {tier === 'C' && 'Average - Decent but outclassed'}
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