import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Filter, Sword } from 'lucide-react'
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

const Units = () => {
  const { units } = useUnits()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTier, setSelectedTier] = useState('all')
  const [selectedElement, setSelectedElement] = useState('all')
  const [selectedRarity, setSelectedRarity] = useState('all')


  // Element icon mapping based on the provided image
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



  const filteredUnits = units.filter(unit => {
    // Only show base units (units with isBaseForm: true or no isBaseForm property for legacy units)
    const isBaseUnit = unit.isBaseForm === true || unit.isBaseForm === undefined
    const matchesSearch = unit.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTier = selectedTier === 'all' || unit.tier === selectedTier
    const matchesElement = selectedElement === 'all' || unit.element === selectedElement
    const matchesRarity = selectedRarity === 'all' || unit.rarity === selectedRarity
    return isBaseUnit && matchesSearch && matchesTier && matchesElement && matchesRarity
  })

  return (
    <div className="min-h-screen pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-game font-bold text-gradient-primary mb-4">
            Unit Database
          </h1>
          <p className="text-gray-300 text-lg mb-8">
            Discover all available units, their stats, and optimal strategies
          </p>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search units..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-dark-200/50 border border-primary-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-400 transition-colors"
              />
            </div>
            
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="px-4 py-3 bg-dark-200/50 border border-primary-500/20 rounded-lg text-white focus:outline-none focus:border-primary-400 transition-colors"
            >
              <option value="all">All Tiers</option>
              <option value="Monarch">Monarch (Broken)</option>
              <option value="Godly">Godly (Meta)</option>
              <option value="Z+">Z+ (Semi Meta)</option>
              <option value="S+">S+ (Meta Support)</option>
              <option value="A+">A+ (Good)</option>
              <option value="B+">B+ (Bad)</option>
              {/* Legacy tiers */}
              <option value="S">S Tier</option>
              <option value="A">A Tier</option>
              <option value="B">B Tier</option>
              <option value="C">C Tier</option>
              <option value="D">D Tier</option>
            </select>

            <select
              value={selectedElement}
              onChange={(e) => setSelectedElement(e.target.value)}
              className="px-4 py-3 bg-dark-200/50 border border-primary-500/20 rounded-lg text-white focus:outline-none focus:border-primary-400 transition-colors"
            >
              <option value="all">All Elements</option>
              <option value="Water">Water</option>
              <option value="Passion">Passion</option>
              <option value="Blast">Blast</option>
              <option value="Unbound">Unbound</option>
              <option value="Unknown">Unknown</option>
              <option value="Holy">Holy</option>
              <option value="Cosmic">Cosmic</option>
              <option value="Nature">Nature</option>
              <option value="Curse">Curse</option>
              <option value="Fire">Fire</option>
              <option value="Spark">Spark</option>
            </select>

            <select
              value={selectedRarity}
              onChange={(e) => setSelectedRarity(e.target.value)}
              className="px-4 py-3 bg-dark-200/50 border border-primary-500/20 rounded-lg text-white focus:outline-none focus:border-primary-400 transition-colors"
            >
              <option value="all">All Rarities</option>
              <option value="Vanguard">Vanguard</option>
              <option value="Exclusive">Exclusive</option>
              <option value="Secret">Secret</option>
              <option value="Mythical">Mythical</option>
              <option value="Legendary">Legendary</option>
              <option value="Epic">Epic</option>
              <option value="Rare">Rare</option>
              <option value="Common">Common</option>
              <option value="Mythic">Mythic</option>
            </select>
          </div>

          {/* Units Grid */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {filteredUnits.map((unit, index) => {
              const elementStyle = getElementIcon(unit.element)
              return (
                <Link to={`/units/${encodeURIComponent(unit.name)}`} key={index}>
                  <motion.div
                    className="card-glow p-6 group hover:scale-105 transition-transform duration-300 cursor-pointer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                  <div className="aspect-square bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                    {unit.image ? (
                      <img 
                        src={unit.image} 
                        alt={unit.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <Sword className={`h-12 w-12 text-primary-400 ${unit.image ? 'hidden' : ''}`} />
                  </div>
                  
                  <h3 className="font-game font-bold text-white mb-2 group-hover:text-primary-400 transition-colors">
                    {unit.name}
                  </h3>
                  
                                      <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1 px-2 py-1 rounded bg-dark-300/50">
                        <img 
                          src={getTierData(unit.tier).icon} 
                          alt={getTierData(unit.tier).label}
                          className="w-4 h-4 object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                        <span className="text-xs font-bold text-white">{getTierData(unit.tier).label}</span>
                      </div>
                      <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg ${elementStyle.bg}`}>
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
                    </div>
                    
                    <div className="flex justify-center">
                      <span className={`rarity-${unit.rarity.toLowerCase()} text-sm`}>{unit.rarity}</span>
                    </div>
                  </div>
                  </motion.div>
                </Link>
              )
            })}
          </motion.div>

          {filteredUnits.length === 0 && (
            <div className="text-center py-12">
              <Filter className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-game text-gray-400 mb-2">No units found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          )}
        </motion.div>
      </div>

    </div>
  )
}

export default Units 