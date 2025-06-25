import { motion } from 'framer-motion'
import { Gem, Coins, Hammer } from 'lucide-react'

const Items = () => {
  const itemCategories = [
    {
      name: 'Gems',
      icon: Gem,
      items: [
        { name: 'Premium Gems', description: 'Primary currency for summons', rarity: 'Epic' },
        { name: 'Event Gems', description: 'Special event currency', rarity: 'Legendary' },
      ]
    },
    {
      name: 'Gold',
      icon: Coins,
      items: [
        { name: 'Gold Coins', description: 'Used for upgrades and crafting', rarity: 'Common' },
        { name: 'Ancient Gold', description: 'Rare gold for premium upgrades', rarity: 'Epic' },
      ]
    },
    {
      name: 'Crafting Materials',
      icon: Hammer,
      items: [
        { name: 'Evolution Crystals', description: 'Evolve your units to higher forms', rarity: 'Rare' },
        { name: 'Trait Stones', description: 'Unlock and upgrade unit traits', rarity: 'Epic' },
        { name: 'Ascension Shards', description: 'Ascend units beyond normal limits', rarity: 'Legendary' },
      ]
    }
  ]

  const getRarityClass = (rarity: string) => {
    return `rarity-${rarity.toLowerCase()}`
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
              Items & Materials
            </h1>
            <p className="text-gray-300 text-lg">
              Discover all items, currencies, and crafting materials in Anime Vanguards
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {itemCategories.map((category, categoryIndex) => {
              const Icon = category.icon
              return (
                <motion.div
                  key={categoryIndex}
                  className="card p-6"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
                >
                  <div className="flex items-center mb-6">
                    <Icon className="h-8 w-8 text-primary-400 mr-3" />
                    <h2 className="text-2xl font-game font-bold text-white">{category.name}</h2>
                  </div>

                  <div className="space-y-4">
                    {category.items.map((item, itemIndex) => (
                      <motion.div
                        key={itemIndex}
                        className="bg-dark-300/50 rounded-lg p-4 hover:bg-dark-300/70 transition-colors duration-300"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: categoryIndex * 0.1 + itemIndex * 0.05 }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-game font-bold text-white">{item.name}</h3>
                          <span className={`text-sm font-medium ${getRarityClass(item.rarity)}`}>
                            {item.rarity}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm">{item.description}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )
            })}
          </div>

          <motion.div
            className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="card p-6">
              <h3 className="text-xl font-game font-bold text-gradient-accent mb-4">How to Obtain</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Complete daily quests and achievements</li>
                <li>• Participate in events and raids</li>
                <li>• Use redeem codes for free items</li>
                <li>• Purchase from the in-game shop</li>
                <li>• Defeat enemies in various game modes</li>
              </ul>
            </div>

            <div className="card p-6">
              <h3 className="text-xl font-game font-bold text-gradient-accent mb-4">Usage Tips</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Save premium gems for guaranteed summons</li>
                <li>• Prioritize evolving your strongest units first</li>
                <li>• Don't forget to claim daily login rewards</li>
                <li>• Check the shop daily for special offers</li>
                <li>• Participate in limited-time events</li>
              </ul>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default Items 