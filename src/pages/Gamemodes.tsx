
import { motion } from 'framer-motion'
import { Gamepad2, Trophy, Target, Clock } from 'lucide-react'

const Gamemodes = () => {
  const gamemodes = [
    {
      name: 'Story Mode',
      icon: Gamepad2,
      description: 'Progress through the main storyline and unlock new content',
      difficulty: 'Easy to Hard',
      rewards: 'Units, Gold, Experience'
    },
    {
      name: 'Legend Stages',
      icon: Trophy,
      description: 'Challenge legendary bosses for rare rewards',
      difficulty: 'Very Hard',
      rewards: 'Legendary Units, Gems'
    },
    {
      name: 'Raids',
      icon: Target,
      description: 'Team up to defeat powerful raid bosses',
      difficulty: 'Extreme',
      rewards: 'Exclusive Items, Materials'
    },
    {
      name: 'Boss Events',
      icon: Clock,
      description: 'Limited-time events with unique challenges',
      difficulty: 'Variable',
      rewards: 'Event Units, Special Items'
    }
  ]

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
              Game Modes
            </h1>
            <p className="text-gray-300 text-lg">
              Explore all the exciting game modes Anime Vanguards has to offer
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {gamemodes.map((mode, index) => {
              const Icon = mode.icon
              return (
                <motion.div
                  key={index}
                  className="card-glow p-8"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Icon className="h-12 w-12 text-primary-400 mb-4" />
                  <h2 className="text-2xl font-game font-bold text-white mb-3">{mode.name}</h2>
                  <p className="text-gray-300 mb-4">{mode.description}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Difficulty:</span>
                      <span className="text-accent-400">{mode.difficulty}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Rewards:</span>
                      <span className="text-secondary-400">{mode.rewards}</span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Gamemodes 