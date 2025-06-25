import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Gift, Check } from 'lucide-react'

const Codes = () => {
  const [copiedCode, setCopiedCode] = useState('')

  const codes = [
    { code: 'NEWUPDATE', reward: '1000 Gems + 50000 Gold', status: 'Active', expires: '2024-02-15' },
    { code: 'HOLIDAY2024', reward: '500 Gems + Holiday Unit', status: 'Active', expires: '2024-01-31' },
    { code: 'WELCOME', reward: '250 Gems + Starter Pack', status: 'Active', expires: 'Permanent' },
    { code: 'COMMUNITY50K', reward: '750 Gems + Materials', status: 'Active', expires: '2024-02-01' },
    { code: 'WINTEREVENT', reward: '300 Gems + Event Items', status: 'Expired', expires: '2024-01-15' },
  ]

  const copyToClipboard = async (code: string) => {
    await navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(''), 2000)
  }

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
              Redeem Codes
            </h1>
            <p className="text-gray-300 text-lg">
              Get free gems, units, and items with these working codes
            </p>
          </div>

          <div className="space-y-4">
            {codes.map((item, index) => (
              <motion.div
                key={index}
                className={`card p-6 ${item.status === 'Expired' ? 'opacity-50' : ''}`}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: item.status === 'Expired' ? 0.5 : 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                  <div className="flex-1 mb-4 sm:mb-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <code className="bg-dark-300/50 px-3 py-1 rounded font-mono text-primary-400 font-bold">
                        {item.code}
                      </code>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        item.status === 'Active' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="text-gray-300 mb-1">
                      <Gift className="inline h-4 w-4 mr-1" />
                      {item.reward}
                    </p>
                    <p className="text-gray-500 text-sm">
                      Expires: {item.expires}
                    </p>
                  </div>
                  
                  {item.status === 'Active' && (
                    <button
                      onClick={() => copyToClipboard(item.code)}
                      className={`btn-primary flex items-center space-x-2 ${
                        copiedCode === item.code ? 'bg-green-600 hover:bg-green-700' : ''
                      }`}
                    >
                      {copiedCode === item.code ? (
                        <>
                          <Check className="h-4 w-4" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
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
            <h3 className="text-xl font-game font-bold text-gradient-accent mb-4">How to Redeem</h3>
            <ol className="space-y-2 text-gray-300 list-decimal list-inside">
              <li>Open Anime Vanguards in Roblox</li>
              <li>Look for the "Codes" or "Settings" button in the game</li>
              <li>Copy a code from this page and paste it into the game</li>
              <li>Click "Redeem" to claim your rewards</li>
              <li>Check your inventory for the new items!</li>
            </ol>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default Codes 