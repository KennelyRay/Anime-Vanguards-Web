 
import { motion } from 'framer-motion'
import { Calendar, Star, Zap } from 'lucide-react'

const Updates = () => {
  const updates = [
    {
      version: 'Update 6.5',
      date: '2024-01-15',
      title: 'Conqueror vs Invulnerable',
      changes: [
        'Added Koguro (Unsealed) - New S-Tier unit',
        'Added Arc (True Ancestor) - Powerful Unbound element unit', 
        'Added Slime (King) - Water element powerhouse',
        'Balance changes to existing units',
        'New game mechanics introduced'
      ]
    },
    {
      version: 'Update 6.0',
      date: '2024-01-10',
      title: 'Major Unit Overhaul',
      changes: [
        'Added Astolfo (Rider of Black)',
        'Added Byeken (Ronin)',
        'Added Lfelt (Love)',
        'Major balance changes across all tiers',
        'Improved UI and animations'
      ]
    },
    {
      version: 'Winter Event',
      date: '2024-01-05',
      title: 'Seasonal Celebration',
      changes: [
        'Limited-time winter units released',
        'Special holiday cosmetics added',
        'Winter-themed stages and challenges',
        'Exclusive event rewards',
        'Double XP weekend events'
      ]
    }
  ]

  return (
    <div className="min-h-screen pt-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-game font-bold text-gradient-primary mb-4">
              Game Updates
            </h1>
            <p className="text-gray-300 text-lg">
              Stay up to date with the latest changes and additions to Anime Vanguards
            </p>
          </div>

          <div className="space-y-8">
            {updates.map((update, index) => (
              <motion.article
                key={index}
                className="card p-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-game font-bold text-gradient-accent mb-2">
                      {update.version}
                    </h2>
                    <h3 className="text-xl text-white mb-2">{update.title}</h3>
                    <div className="flex items-center text-gray-400 text-sm">
                      <Calendar className="h-4 w-4 mr-1" />
                      {update.date}
                    </div>
                  </div>
                  <div className="bg-primary-500/20 p-3 rounded-lg">
                    <Zap className="h-8 w-8 text-primary-400" />
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-game font-bold text-white mb-3">What's New:</h4>
                  <ul className="space-y-2">
                    {update.changes.map((change, changeIndex) => (
                      <li key={changeIndex} className="flex items-start text-gray-300">
                        <Star className="h-4 w-4 text-accent-400 mr-2 mt-0.5 flex-shrink-0" />
                        {change}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.article>
            ))}
          </div>

          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <p className="text-gray-400">
              Want to stay updated? Follow the official Anime Vanguards social media for the latest news!
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default Updates 