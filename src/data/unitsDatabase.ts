export interface UnitData {
  name: string
  tier: string
  element: string
  rarity: string
  cost: number
  image?: string
  shinyImage?: string
  description?: string
  obtainment?: string
  isBaseForm?: boolean
  baseForm?: string
  evolutionLine?: string[]
  stats?: {
    damage: string
    speed: string
    range: string
  }
  upgradeStats?: {
    maxUpgrades: number
    levels: Array<{
      level: number
      yenCost: number
      atkDamage: number
      range: number
      spa: number // Speed/Attack Speed
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

export const unitsDatabase: UnitData[] = [
  // S-Tier Base Units with Evolutions
  {
    name: 'Koguro',
    tier: 'S+',
    element: 'Curse',
    rarity: 'Legendary',
    cost: 800,
    image: '/images/units/koguro-normal.webp',
    shinyImage: '/images/units/koguro-shiny.webp',
    description: 'A powerful ninja with mysterious curse abilities. Can be evolved to unleash ultimate power.',
    obtainment: 'Summon from Curse Banner',
    isBaseForm: true,
    evolutionLine: ['Koguro', 'Koguro (Unsealed)'],
    upgradeStats: {
      maxUpgrades: 4,
      levels: [
        { level: 0, yenCost: 3500, atkDamage: 24, range: 5, spa: 5.0, critDamage: 300, critChance: 0.0 },
        { level: 1, yenCost: 4200, atkDamage: 26, range: 5, spa: 5.0, critDamage: 360, critChance: 0.0 },
        { level: 2, yenCost: 5700, atkDamage: 28, range: 5, spa: 5.0, critDamage: 420, critChance: 0.0 },
        { level: 3, yenCost: 6400, atkDamage: 30, range: 5, spa: 5.0, critDamage: 480, critChance: 0.0 }
      ]
    },
    evolutions: [
      {
        name: 'Koguro (Unsealed)',
        tier: 'Godly',
        element: 'Curse',
        rarity: 'Mythical',
        cost: 1200,
        image: '/images/units/koguro-normal.webp',
        shinyImage: '/images/units/koguro-shiny.webp',
        description: 'Inspired by Kaguya Ōtsutsuki from Naruto Shippuden. A legendary Vanguard unit with incredible dimensional powers.',
        requirements: 'Level 15 + Dimension Core x3 + 50,000 Gold',
        bonuses: [
          'Unlock Master of Dimensions ability',
          'God-tier stats across all categories',
          'Elemental Affinity with team synergy',
          'Vanguard unit classification'
        ]
      }
    ],
    skills: [
      {
        name: 'Curse Strike',
        description: 'Deals curse damage with chance to inflict status effects.',
        type: 'Active'
      },
      {
        name: 'Shadow Step',
        description: 'Teleports to optimal attack position.',
        type: 'Active'
      }
    ],
    traits: ['DPS', 'Curse Master']
  },
  {
    name: 'Song Jinwu',
    tier: 'A+',
    element: 'Shadow',
    rarity: 'Epic', 
    cost: 750,
    description: 'The Shadow Hunter with growing power. Can evolve with Igros for ultimate combination.',
    obtainment: 'Summon from Shadow Banner',
    isBaseForm: true,
    evolutionLine: ['Song Jinwu', 'Song Jinwu (Monarch)', 'Song Jinwu and Igros'],
    upgradeStats: {
      maxUpgrades: 5,
      levels: [
        { level: 0, yenCost: 2800, atkDamage: 22, range: 6, spa: 4.5, critDamage: 280, critChance: 5.0 },
        { level: 1, yenCost: 3200, atkDamage: 24, range: 6, spa: 4.8, critDamage: 320, critChance: 7.5 },
        { level: 2, yenCost: 4100, atkDamage: 26, range: 6, spa: 5.1, critDamage: 360, critChance: 10.0 },
        { level: 3, yenCost: 5000, atkDamage: 28, range: 7, spa: 5.4, critDamage: 400, critChance: 12.5 },
        { level: 4, yenCost: 6200, atkDamage: 32, range: 7, spa: 5.8, critDamage: 450, critChance: 15.0 }
      ]
    },
    evolutions: [
      {
        name: 'Song Jinwu (Monarch)',
        tier: 'Z+',
        element: 'Shadow',
        rarity: 'Legendary',
        cost: 950,
        description: 'The Shadow Monarch with enhanced shadow army capabilities.',
        requirements: 'Level 10 + Shadow Core x5',
        bonuses: [
          'Shadow Army ability unlocked',
          '+40% damage boost',
          'Enhanced shadow element mastery'
        ]
      },
      {
        name: 'Song Jinwu and Igros',
        tier: 'Monarch',
        element: 'Curse',
        rarity: 'Secret',
        cost: 1150,
        description: 'The Shadow Monarch alongside his loyal knight. A devastating combination unit.',
        requirements: 'Song Jinwu (Monarch) + Igros (Elite Knight) + Monarch\'s Bond',
        bonuses: [
          'Duo unit with combined abilities',
          'Shadow Army with Elite Knight support',
          'Mythic tier power scaling',
          'Curse element mastery'
        ]
      }
    ],
    skills: [
      {
        name: 'Shadow Extraction',
        description: 'Extracts shadows from defeated enemies to strengthen attacks.',
        type: 'Passive'
      },
      {
        name: 'Hunter\'s Instinct',
        description: 'Increases damage based on enemy count.',
        type: 'Passive'
      }
    ],
    traits: ['DPS', 'Shadow Master', 'Monarch']
  },
  {
    name: 'Slime',
    tier: 'B+',
    element: 'Water',
    rarity: 'Rare',
    cost: 25,
    image: '/images/units/Slime_29_Pose.webp',
    shinyImage: '/images/units/Slime_29_Shiny_Pose.webp',
    description: 'A humble slime that can evolve into the mighty Slime King.',
    obtainment: 'Common summon or story mode',
    isBaseForm: true,
    evolutionLine: ['Slime', 'Slime (King)'],
    stats: {
      damage: 'D',
      speed: 'C',
      range: 'C'
    },
    evolutions: [
      {
        name: 'Slime (King)',
        tier: 'Godly',
        element: 'Water',
        rarity: 'Exclusive',
        cost: 1000,
        image: '/images/units/Slime_29_Pose.webp',
        shinyImage: '/images/units/Slime_29_Shiny_Pose.webp',
        description: 'The ultimate evolution of slime with royal water mastery.',
        requirements: 'Level 20 + Royal Jelly x10 + Water Crown',
        bonuses: [
          'Massive stat boost across all categories',
          'Royal Water abilities',
          'Area damage capabilities',
          'Self-regeneration abilities'
        ]
      }
    ],
    skills: [
      {
        name: 'Bounce Attack',
        description: 'Basic bouncing attack that can hit multiple enemies.',
        type: 'Active'
      },
      {
        name: 'Slime Body',
        description: 'Reduces physical damage taken.',
        type: 'Passive'
      }
    ],
    traits: ['Tank', 'Evolution Potential']
  },
  {
    name: 'Astolfo',
    tier: 'B',
    element: 'Holy',
    rarity: 'Rare',
    cost: 400,
    description: 'A cheerful knight with hidden potential.',
    obtainment: 'Fate Banner summon',
    isBaseForm: true,
    evolutionLine: ['Astolfo', 'Astolfo (Rider of Black)'],
    stats: {
      damage: 'B',
      speed: 'A',
      range: 'B'
    },
    evolutions: [
      {
        name: 'Astolfo (Rider of Black)',
        tier: 'S',
        element: 'Holy',
        rarity: 'Mythic',
        cost: 800,
        description: 'The legendary Rider of Black with divine powers.',
        requirements: 'Level 12 + Noble Phantasm Fragment x5',
        bonuses: [
          'Noble Phantasm abilities',
          'Enhanced holy element attacks',
          'Rider class bonuses',
          'Increased mobility and range'
        ]
      }
    ],
    skills: [
      {
        name: 'Lance Charge',
        description: 'Charges forward dealing damage to enemies in path.',
        type: 'Active'
      },
      {
        name: 'Knight\'s Honor',
        description: 'Boosts nearby allies\' attack speed.',
        type: 'Passive'
      }
    ],
    traits: ['Support', 'Mobility', 'Holy Knight']
  },
  {
    name: 'Conqueror',
    tier: 'A',
    element: 'Willpower',
    rarity: 'Legendary',
    cost: 900,
    image: '/images/units/Conqueror_vs_Invulnerable_Pose.webp',
    shinyImage: '/images/units/Conqueror_vs_Invulnerable_Shiny_Pose.webp',
    description: 'A powerful warrior with unstoppable will.',
    obtainment: 'Legendary Banner summon',
    isBaseForm: true,
    evolutionLine: ['Conqueror', 'Conqueror vs Invulnerable'],
    stats: {
      damage: 'A+',
      speed: 'B+',
      range: 'A'
    },
    evolutions: [
      {
        name: 'Conqueror vs Invulnerable',
        tier: 'S',
        element: 'Willpower',
        rarity: 'Mythic',
        cost: 1300,
        image: '/images/units/Conqueror_vs_Invulnerable_Pose.webp',
        shinyImage: '/images/units/Conqueror_vs_Invulnerable_Shiny_Pose.webp',
        description: 'The ultimate clash between unstoppable force and immovable object.',
        requirements: 'Level 18 + Conqueror\'s Will + Invulnerable Shield',
        bonuses: [
          'Dual-nature abilities',
          'Both offensive and defensive capabilities',
          'Willpower element mastery',
          'Unstoppable attacks'
        ]
      }
    ],
    skills: [
      {
        name: 'Conquering Strike',
        description: 'Deals damage that ignores enemy defenses.',
        type: 'Active'
      },
      {
        name: 'Indomitable Will',
        description: 'Immune to debuffs and status effects.',
        type: 'Passive'
      }
    ],
    traits: ['DPS', 'Tank', 'Willpower Master']
  },

  // A-Tier Base Units
  {
    name: 'Valentine',
    tier: 'B',
    element: 'Time',
    rarity: 'Epic',
    cost: 500,
    description: 'A time manipulator with the potential for ultimate evolution.',
    obtainment: 'Valentine Event Banner',
    isBaseForm: true,
    evolutionLine: ['Valentine', 'Valentine (Love Train)'],
    stats: {
      damage: 'B+',
      speed: 'A',
      range: 'B+'
    },
    evolutions: [
      {
        name: 'Valentine (Love Train)',
        tier: 'A',
        element: 'Time',
        rarity: 'Legendary',
        cost: 850,
        description: 'Valentine with Love Train ability, manipulating fortune itself.',
        requirements: 'Level 12 + Love Train Ticket + Valentine\'s Heart',
        bonuses: [
          'Love Train dimensional ability',
          'Fortune manipulation',
          'Enhanced time control',
          'Redirect damage abilities'
        ]
      }
    ],
    skills: [
      {
        name: 'Time Skip',
        description: 'Briefly stops time to land critical hits.',
        type: 'Active'
      },
      {
        name: 'Temporal Awareness',
        description: 'Predicts enemy attacks and dodges them.',
        type: 'Passive'
      }
    ],
    traits: ['DPS', 'Time Master', 'Evasion']
  },
  {
    name: 'Gujo',
    tier: 'B',
    element: 'Psychic',
    rarity: 'Epic',
    cost: 550,
    description: 'A powerful sorcerer with limitless potential.',
    obtainment: 'Jujutsu Banner',
    isBaseForm: true,
    evolutionLine: ['Gujo', 'Gujo (Infinity)'],
    stats: {
      damage: 'B+',
      speed: 'A',
      range: 'A+'
    },
    evolutions: [
      {
        name: 'Gujo (Infinity)',
        tier: 'A',
        element: 'Psychic',
        rarity: 'Legendary',
        cost: 900,
        description: 'Gujo with Infinity technique, controlling space itself.',
        requirements: 'Level 15 + Six Eyes + Infinity Manual',
        bonuses: [
          'Infinity barrier technique',
          'Unlimited Void domain',
          'Enhanced psychic abilities',
          'Area control mastery'
        ]
      }
    ],
    skills: [
      {
        name: 'Blue',
        description: 'Creates attractive force that pulls enemies together.',
        type: 'Active'
      },
      {
        name: 'Six Eyes',
        description: 'Enhanced perception and energy efficiency.',
        type: 'Passive'
      }
    ],
    traits: ['DPS', 'Area Control', 'Psychic Master']
  },
  {
    name: 'Vogita',
    tier: 'C',
    element: 'Fire',
    rarity: 'Rare',
    cost: 300,
    description: 'A Saiyan warrior with multiple evolution paths.',
    obtainment: 'Saiyan Banner',
    isBaseForm: true,
    evolutionLine: ['Vogita', 'Vogita Super', 'Vogita Super (Awakened)', 'Super Vogito', 'Vogita (Angel)'],
    stats: {
      damage: 'C+',
      speed: 'B',
      range: 'B'
    },
    evolutions: [
      {
        name: 'Vogita Super',
        tier: 'B',
        element: 'Fire',
        rarity: 'Epic',
        cost: 500,
        description: 'Super Saiyan transformation with enhanced power.',
        requirements: 'Level 8 + Saiyan Pride',
        bonuses: [
          'Super Saiyan transformation',
          '+50% damage boost',
          'Enhanced fire attacks',
          'Increased attack speed'
        ]
      },
      {
        name: 'Vogita Super (Awakened)',
        tier: 'A',
        element: 'Fire',
        rarity: 'Legendary',
        cost: 750,
        description: 'Awakened Super Saiyan with mastered power.',
        requirements: 'Vogita Super Level 12 + Awakening Stone',
        bonuses: [
          'Mastered Super Saiyan power',
          '+100% damage boost',
          'Fire element mastery',
          'Energy wave attacks'
        ]
      },
      {
        name: 'Super Vogito',
        tier: 'A',
        element: 'Fire',
        rarity: 'Legendary',
        cost: 850,
        description: 'Fusion warrior with incredible power.',
        requirements: 'Vogita + Roku + Potara Earrings',
        bonuses: [
          'Fusion warrior abilities',
          'Combined techniques',
          'Enhanced stats',
          'Unique fusion attacks'
        ]
      },
      {
        name: 'Vogita (Angel)',
        tier: 'A',
        element: 'Holy',
        rarity: 'Legendary',
        cost: 800,
        description: 'Angelic transformation with divine powers.',
        requirements: 'Vogita Super + Angel Halo + Divine Energy',
        bonuses: [
          'Angel transformation',
          'Holy element conversion',
          'Divine protection abilities',
          'Healing support skills'
        ]
      }
    ],
    skills: [
      {
        name: 'Kamehameha',
        description: 'Powerful energy beam attack.',
        type: 'Active'
      },
      {
        name: 'Saiyan Pride',
        description: 'Increases damage when health is low.',
        type: 'Passive'
      }
    ],
    traits: ['DPS', 'Evolution Master', 'Saiyan']
  },

  // More Base Units
  {
    name: 'Boo',
    tier: 'C',
    element: 'Dark',
    rarity: 'Rare',
    cost: 250,
    description: 'An ancient evil with multiple dangerous evolutions.',
    obtainment: 'Dark Banner',
    isBaseForm: true,
    evolutionLine: ['Boo', 'Super Boo (Evil)', 'Kid Boo (Evil)', 'Boo (Evil)', 'Boockleo (Evil)', 'Boohon (Evil)', 'Bootenks (Evil)'],
    stats: {
      damage: 'C',
      speed: 'C+',
      range: 'B'
    },
    evolutions: [
      {
        name: 'Boo (Evil)',
        tier: 'B',
        element: 'Dark',
        rarity: 'Epic',
        cost: 400,
        description: 'Evil form of Boo with enhanced dark powers.',
        requirements: 'Level 8 + Evil Energy',
        bonuses: [
          'Evil transformation',
          'Enhanced dark attacks',
          '+40% damage boost'
        ]
      },
      {
        name: 'Super Boo (Evil)',
        tier: 'A',
        element: 'Dark',
        rarity: 'Legendary',
        cost: 700,
        description: 'Super evolution with absorption abilities.',
        requirements: 'Boo (Evil) Level 12 + Absorption Core',
        bonuses: [
          'Absorption abilities',
          'Super form power',
          'Dark mastery',
          'Regeneration skills'
        ]
      },
      {
        name: 'Kid Boo (Evil)',
        tier: 'A',
        element: 'Dark',
        rarity: 'Legendary',
        cost: 750,
        description: 'Pure evil form with devastating power.',
        requirements: 'Boo (Evil) + Pure Evil Essence',
        bonuses: [
          'Pure evil form',
          'Unlimited destruction',
          'Planet-buster attacks',
          'Chaotic abilities'
        ]
      }
    ],
    skills: [
      {
        name: 'Candy Beam',
        description: 'Turns enemies into candy temporarily.',
        type: 'Active'
      },
      {
        name: 'Regeneration',
        description: 'Slowly recovers health over time.',
        type: 'Passive'
      }
    ],
    traits: ['Tank', 'Dark Master', 'Regeneration']
  },
  {
    name: 'Igros',
    tier: 'B',
    element: 'Death',
    rarity: 'Epic',
    cost: 600,
    description: 'A loyal knight who can become elite or join forces.',
    obtainment: 'Death Banner',
    isBaseForm: true,
    evolutionLine: ['Igros', 'Igros (Elite Knight)'],
    stats: {
      damage: 'B+',
      speed: 'B',
      range: 'B+'
    },
    evolutions: [
      {
        name: 'Igros (Elite Knight)',
        tier: 'A',
        element: 'Death',
        rarity: 'Legendary',
        cost: 850,
        description: 'Elite knight form with mastered death abilities.',
        requirements: 'Level 12 + Knight\'s Honor + Death Mastery',
        bonuses: [
          'Elite knight status',
          'Death element mastery',
          'Enhanced loyalty abilities',
          'Can combine with Song Jinwu'
        ]
      }
    ],
    skills: [
      {
        name: 'Death Strike',
        description: 'Attack that deals extra damage to weakened enemies.',
        type: 'Active'
      },
      {
        name: 'Knight\'s Loyalty',
        description: 'Gains bonuses when fighting alongside allies.',
        type: 'Passive'
      }
    ],
    traits: ['DPS', 'Support', 'Death Knight']
  },

  // Additional base units to represent the full roster
  {
    name: 'Noruto',
    tier: 'C',
    element: 'Wind',
    rarity: 'Rare',
    cost: 200,
    description: 'A ninja with the potential for multiple transformations.',
    obtainment: 'Ninja Banner',
    isBaseForm: true,
    evolutionLine: ['Noruto', 'Noruto (Sage)', 'Noruto (Six Tails)'],
    stats: {
      damage: 'C+',
      speed: 'B+',
      range: 'B'
    },
    evolutions: [
      {
        name: 'Noruto (Sage)',
        tier: 'B',
        element: 'Nature',
        rarity: 'Epic',
        cost: 450,
        description: 'Sage mode with enhanced nature powers.',
        requirements: 'Level 10 + Sage Training',
        bonuses: [
          'Sage mode transformation',
          'Nature element mastery',
          'Enhanced sensory abilities'
        ]
      },
      {
        name: 'Noruto (Six Tails)',
        tier: 'A',
        element: 'Chakra',
        rarity: 'Legendary',
        cost: 800,
        description: 'Six-tailed form with immense chakra.',
        requirements: 'Noruto (Sage) + Tailed Beast Chakra',
        bonuses: [
          'Six-tailed transformation',
          'Massive chakra boost',
          'Beast-mode abilities',
          'Area devastation'
        ]
      }
    ],
    skills: [
      {
        name: 'Shadow Clone',
        description: 'Creates shadow clones to fight alongside.',
        type: 'Active'
      },
      {
        name: 'Will of Fire',
        description: 'Never gives up, gaining power as health decreases.',
        type: 'Passive'
      }
    ],
    traits: ['DPS', 'Clone Master', 'Ninja']
  },
  {
    name: 'Ichiga',
    tier: 'C',
    element: 'Soul',
    rarity: 'Rare',
    cost: 180,
    description: 'A soul reaper with incredible potential.',
    obtainment: 'Soul Society Banner',
    isBaseForm: true,
    evolutionLine: ['Ichiga', 'Ichiga (True Release)', 'Ichiga (Savior)'],
    stats: {
      damage: 'C+',
      speed: 'B',
      range: 'B+'
    },
    evolutions: [
      {
        name: 'Ichiga (True Release)',
        tier: 'B',
        element: 'Soul',
        rarity: 'Epic',
        cost: 400,
        description: 'True zanpakuto release form.',
        requirements: 'Level 10 + Zanpakuto Spirit',
        bonuses: [
          'True zanpakuto release',
          'Enhanced soul reaper abilities',
          'Spiritual pressure mastery'
        ]
      },
      {
        name: 'Ichiga (Savior)',
        tier: 'A',
        element: 'Soul',
        rarity: 'Legendary',
        cost: 750,
        description: 'The savior form with ultimate soul powers.',
        requirements: 'Ichiga (True Release) + Savior\'s Will',
        bonuses: [
          'Savior transformation',
          'Ultimate soul mastery',
          'World-saving abilities',
          'Divine soul powers'
        ]
      }
    ],
    skills: [
      {
        name: 'Getsuga Tensho',
        description: 'Spiritual energy slash attack.',
        type: 'Active'
      },
      {
        name: 'Soul Reaper',
        description: 'Deals extra damage to spiritual enemies.',
        type: 'Passive'
      }
    ],
    traits: ['DPS', 'Soul Master', 'Reaper']
  },
  {
    name: 'Luffo',
    tier: 'C',
    element: 'Rubber',
    rarity: 'Rare',
    cost: 220,
    description: 'A rubber pirate with stretchy abilities and big dreams.',
    obtainment: 'Pirate Banner',
    isBaseForm: true,
    stats: {
      damage: 'C+',
      speed: 'B+',
      range: 'B'
    },
    skills: [
      {
        name: 'Gum-Gum Pistol',
        description: 'Stretchy punch attack with extended range.',
        type: 'Active'
      },
      {
        name: 'Rubber Body',
        description: 'Immune to lightning attacks, reduces physical damage.',
        type: 'Passive'
      }
    ],
    traits: ['DPS', 'Rubber Master', 'Pirate']
  },
  {
    name: 'Saber',
    tier: 'B',
    element: 'Holy',
    rarity: 'Epic',
    cost: 500,
    description: 'A legendary knight with multiple forms.',
    obtainment: 'Fate Banner',
    isBaseForm: true,
    evolutionLine: ['Saber', 'Saber (King of Knights)', 'Saber (Alternate)', 'Saber (Black Tyrant)'],
    stats: {
      damage: 'B+',
      speed: 'B+',
      range: 'B'
    },
    evolutions: [
      {
        name: 'Saber (King of Knights)',
        tier: 'A',
        element: 'Holy',
        rarity: 'Legendary',
        cost: 800,
        description: 'The legendary King of Knights with Excalibur.',
        requirements: 'Level 12 + Excalibur Fragment',
        bonuses: [
          'Excalibur Noble Phantasm',
          'King of Knights authority',
          'Enhanced holy attacks',
          'Leadership bonuses'
        ]
      },
      {
        name: 'Saber (Alternate)',
        tier: 'A',
        element: 'Dark',
        rarity: 'Legendary',
        cost: 750,
        description: 'Alternate universe Saber with dark powers.',
        requirements: 'Saber + Alternate Reality Stone',
        bonuses: [
          'Dark element conversion',
          'Alternate reality abilities',
          'Enhanced combat skills',
          'Corrupted Excalibur'
        ]
      },
      {
        name: 'Saber (Black Tyrant)',
        tier: 'A',
        element: 'Dark',
        rarity: 'Legendary',
        cost: 850,
        description: 'Corrupted tyrant form with overwhelming power.',
        requirements: 'Saber (Alternate) + Tyrant\'s Crown',
        bonuses: [
          'Tyrant transformation',
          'Overwhelming dark power',
          'Fear-inducing presence',
          'Absolute authority'
        ]
      }
    ],
    skills: [
      {
        name: 'Excalibur',
        description: 'Holy sword beam that pierces through enemies.',
        type: 'Active'
      },
      {
        name: 'Chivalry',
        description: 'Protects nearby allies and boosts their defense.',
        type: 'Passive'
      }
    ],
    traits: ['DPS', 'Support', 'Holy Knight']
  }
]

// Helper functions
export const getUnitByName = (name: string): UnitData | undefined => {
  return unitsDatabase.find(unit => unit.name === name)
}

export const getUnitsByTier = (tier: string): UnitData[] => {
  return unitsDatabase.filter(unit => unit.tier === tier)
}

export const getUnitsByElement = (element: string): UnitData[] => {
  return unitsDatabase.filter(unit => unit.element === element)
}

export const getBaseUnits = (): UnitData[] => {
  return unitsDatabase.filter(unit => unit.isBaseForm === true)
}

export const getEvolutionsByBaseName = (baseName: string): UnitData['evolutions'] => {
  const unit = getUnitByName(baseName)
  return unit?.evolutions || []
}

// Export element types for filtering
export const elementTypes = [
  'Water', 'Fire', 'Wind', 'Earth', 'Lightning', 'Nature', 'Dark', 'Light', 
  'Holy', 'Curse', 'Shadow', 'Death', 'Soul', 'Psychic', 'Time', 'Space',
  'Blood', 'Tech', 'Cosmic', 'Rubber', 'Willpower', 'Chakra', 'Passion',
  'Blast', 'Unbound', 'Unknown', 'Spark'
]

// Export tier list for easy access
export const tierList = {
  'S': unitsDatabase.filter(unit => unit.tier === 'S' || (unit.evolutions && unit.evolutions.some(evo => evo.tier === 'S'))),
  'A': unitsDatabase.filter(unit => unit.tier === 'A' || (unit.evolutions && unit.evolutions.some(evo => evo.tier === 'A'))),
  'B': unitsDatabase.filter(unit => unit.tier === 'B' || (unit.evolutions && unit.evolutions.some(evo => evo.tier === 'B'))),
  'C': unitsDatabase.filter(unit => unit.tier === 'C'),
  'D': unitsDatabase.filter(unit => unit.tier === 'D')
} 