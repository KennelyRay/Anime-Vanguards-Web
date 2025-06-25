
import { motion } from 'framer-motion'
import { Heart, ExternalLink, Github, Twitter, MessageCircle } from 'lucide-react'

const Footer = () => {
  return (
    <motion.footer 
      className="bg-dark-300/80 backdrop-blur-md border-t border-primary-500/20 mt-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-game font-bold text-gradient-primary mb-4">
              About Anime Vanguards Hub
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              A fanmade webapp dedicated to helping Anime Vanguards players master the game. 
              Find comprehensive unit guides, tier lists, and stay updated with the latest game information.
            </p>
            <div className="flex items-center mt-3 text-sm text-gray-400">
              <span>Made with</span>
              <Heart className="h-4 w-4 mx-1 text-red-500" fill="currentColor" />
              <span>by the community</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-game font-bold text-gradient-primary mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://animevanguards.fandom.com/wiki/Anime_Vanguards_Wiki" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-primary-400 transition-colors duration-300 flex items-center text-sm"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Official Wiki
                </a>
              </li>
              <li>
                <a 
                  href="https://www.roblox.com/games/17398840088/Anime-Vanguards" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-primary-400 transition-colors duration-300 flex items-center text-sm"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Play on Roblox
                </a>
              </li>
              <li>
                <a 
                  href="/tier-list" 
                  className="text-gray-300 hover:text-primary-400 transition-colors duration-300 text-sm"
                >
                  Unit Tier List
                </a>
              </li>
              <li>
                <a 
                  href="/codes" 
                  className="text-gray-300 hover:text-primary-400 transition-colors duration-300 text-sm"
                >
                  Latest Codes
                </a>
              </li>
            </ul>
          </div>

          {/* Community & Updates */}
          <div>
            <h3 className="text-lg font-game font-bold text-gradient-primary mb-4">
              Community
            </h3>
            <div className="space-y-3">
              <p className="text-gray-300 text-sm">
                Join the community and stay updated with the latest news!
              </p>
              <div className="flex space-x-4">
                <a 
                  href="#" 
                  className="text-gray-400 hover:text-primary-400 transition-colors duration-300"
                  aria-label="Discord"
                >
                  <MessageCircle className="h-5 w-5" />
                </a>
                <a 
                  href="#" 
                  className="text-gray-400 hover:text-primary-400 transition-colors duration-300"
                  aria-label="Twitter"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a 
                  href="#" 
                  className="text-gray-400 hover:text-primary-400 transition-colors duration-300"
                  aria-label="GitHub"
                >
                  <Github className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-500/20 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 Anime Vanguards Hub. Fanmade project - Not affiliated with the official game.
            </p>
            <p className="text-gray-500 text-xs mt-2 md:mt-0">
              Built with React & Tailwind CSS
            </p>
          </div>
        </div>
      </div>
    </motion.footer>
  )
}

export default Footer 