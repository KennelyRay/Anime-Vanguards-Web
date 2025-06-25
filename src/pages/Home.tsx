import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Sword, Star, Gift, Gamepad2, Zap, ArrowRight, Users, Trophy, Clock } from 'lucide-react'
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

const Home = () => {
  const { getUnitByName, units } = useUnits()
  const [selectedUnit, setSelectedUnit] = useState<UnitData | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleUnitClick = (unit: UnitData) => {
    setSelectedUnit(unit)
    setIsModalOpen(true)
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

  // Get featured units from database
  const featuredUnitNames = [
    'Koguro (Unsealed)',
    'Song Jinwu and Igros', 
    'Divalo (Requiem)',
    'Arc (True Ancestor)',
    'Slime (King)',
    'Valentine (Love Train)',
    'Gujo (Infinity)',
    'Super Vogito'
  ]
  
  const featuredUnits = featuredUnitNames
    .map(name => getUnitByName(name))
    .filter((unit): unit is UnitData => unit !== undefined)

  const latestUpdates = [
    {
      version: 'Update 6.5',
      title: 'Conqueror vs Invulnerable',
      description: 'New powerful units and game mechanics introduced',
      date: '2024-01-15'
    },
    {
      version: 'Update 6.0',
      title: 'Major Unit Overhaul',
      description: 'Balance changes and new evolutions for existing units',
      date: '2024-01-10'
    },
    {
      version: 'Winter Event',
      title: 'Seasonal Units Released',
      description: 'Limited-time winter themed units and cosmetics',
      date: '2024-01-05'
    }
  ]

  const quickStats = [
    { icon: Users, label: 'Total Units', value: `${units.length}+` },
    { icon: Trophy, label: 'Game Modes', value: '15+' },
    { icon: Clock, label: 'Last Updated', value: 'Today' },
  ]

  return (
    <div className="min-h-screen pt-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-secondary-900/20 to-accent-900/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-game font-bold mb-6">
              <span className="text-gradient-primary">Anime Vanguards</span>
              <br />
              <span className="text-white">Ultimate Hub</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Master the ultimate anime tower defense game with comprehensive unit guides, 
              tier lists, and real-time game information.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/units" className="btn-primary inline-flex items-center">
                <Sword className="h-5 w-5 mr-2" />
                Explore Units
              </Link>
              <Link to="/tier-list" className="btn-secondary inline-flex items-center">
                <Star className="h-5 w-5 mr-2" />
                View Tier List
              </Link>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {quickStats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="card-glow p-6 text-center">
                  <Icon className="h-8 w-8 text-primary-400 mx-auto mb-3" />
                  <div className="text-2xl font-game font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-gray-400">{stat.label}</div>
                </div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Featured Units Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h2 className="text-3xl md:text-4xl font-game font-bold text-gradient-primary mb-4">
              Featured Units
            </h2>
            <p className="text-gray-300 text-lg">
              Discover the most powerful units from the latest updates
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {featuredUnits.map((unit, index) => {
              const elementStyle = getElementIcon(unit.element)
              return (
                <div 
                  key={index} 
                  className="card-glow p-6 group hover:scale-105 transition-transform duration-300 cursor-pointer"
                  onClick={() => handleUnitClick(unit)}
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
                  <h3 className="font-game font-bold text-white mb-2">{unit.name}</h3>
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
                </div>
              )
            })}
          </motion.div>

          <div className="text-center mt-8">
            <Link to="/units" className="inline-flex items-center text-primary-400 hover:text-primary-300 transition-colors duration-300">
              View All Units
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Updates Section */}
      <section className="py-16 bg-dark-200/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-game font-bold text-gradient-accent mb-4">
              Latest Updates
            </h2>
            <p className="text-gray-300 text-lg">
              Stay informed with the newest game updates and patches
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {latestUpdates.map((update, index) => (
              <div key={index} className="card p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-accent-500/20 text-accent-400 px-3 py-1 rounded-full text-sm font-medium">
                    {update.version}
                  </span>
                  <span className="text-gray-500 text-sm">{update.date}</span>
                </div>
                <h3 className="font-game font-bold text-white mb-2">{update.title}</h3>
                <p className="text-gray-300 text-sm mb-4">{update.description}</p>
                <Link to="/updates" className="text-primary-400 hover:text-primary-300 text-sm font-medium">
                  Read More →
                </Link>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Quick Actions Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <Link to="/tier-list" className="card-glow p-8 text-center group hover:scale-105 transition-transform duration-300">
              <Star className="h-12 w-12 text-primary-400 mx-auto mb-4 group-hover:animate-pulse" />
              <h3 className="font-game font-bold text-white mb-2">Tier List</h3>
              <p className="text-gray-400 text-sm">Rankings of all units</p>
            </Link>

            <Link to="/items" className="card-glow p-8 text-center group hover:scale-105 transition-transform duration-300">
              <Gift className="h-12 w-12 text-secondary-400 mx-auto mb-4 group-hover:animate-pulse" />
              <h3 className="font-game font-bold text-white mb-2">Items</h3>
              <p className="text-gray-400 text-sm">Crafting & equipment</p>
            </Link>

            <Link to="/gamemodes" className="card-glow p-8 text-center group hover:scale-105 transition-transform duration-300">
              <Gamepad2 className="h-12 w-12 text-accent-400 mx-auto mb-4 group-hover:animate-pulse" />
              <h3 className="font-game font-bold text-white mb-2">Game Modes</h3>
              <p className="text-gray-400 text-sm">Story, raids & more</p>
            </Link>

            <Link to="/codes" className="card-glow p-8 text-center group hover:scale-105 transition-transform duration-300">
              <Zap className="h-12 w-12 text-yellow-400 mx-auto mb-4 group-hover:animate-pulse" />
              <h3 className="font-game font-bold text-white mb-2">Codes</h3>
              <p className="text-gray-400 text-sm">Free rewards & gems</p>
            </Link>
          </motion.div>
        </div>
      </section>
      
      {/* Unit Detail Modal */}
      <UnitModal 
        unit={selectedUnit} 
        isOpen={isModalOpen} 
        onClose={closeModal} 
      />
    </div>
  )
}

export default Home 