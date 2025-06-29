import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// User Schema (same as in app.js)
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  email: {
    type: String,
    required: false,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  profilePicture: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const saltRounds = 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model('User', userSchema);

// Unit Schema
const unitSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  rarity: {
    type: String,
    required: true,
    enum: ['Rare', 'Epic', 'Legendary', 'Mythic', 'Mythical', 'Secret']
  },
  element: {
    type: String,
    required: true
  },
  tier: {
    type: String,
    required: true
  },
  cost: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  shinyImage: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  videoUrl: String,
  baseStats: {
    damage: Number,
    range: Number,
    speed: Number
  },
  level60Stats: {
    damage: Number,
    range: Number,
    speed: Number
  },
  skills: [{
    name: String,
    description: String
  }],
  traits: [{
    name: String,
    description: String
  }],
  howToObtain: String,
  evolution: {
    canEvolve: Boolean,
    evolutionRequirements: String,
    evolvesTo: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Unit = mongoose.model('Unit', unitSchema);

// Seed data
const seedUsers = [
  {
    username: 'admin',
    email: 'admin@animevanguards.com',
    password: 'admin123',
    isAdmin: true
  },
  {
    username: 'demo',
    email: 'demo@animevanguards.com', 
    password: 'demo123',
    isAdmin: false
  }
];

const seedUnits = [
  {
    id: 'slime',
    name: 'Slime',
    rarity: 'Rare',
    element: 'Nature',
    tier: 'Good',
    cost: 50,
    category: 'Ground',
    image: '/images/units/Slime_Pose.webp',
    shinyImage: '/images/units/Slime_Shiny_Pose.webp',
    description: 'A basic slime unit with decent stats for early game.',
    baseStats: {
      damage: 150,
      range: 15,
      speed: 2.5
    },
    level60Stats: {
      damage: 450,
      range: 15,
      speed: 2.5
    },
    skills: [
      {
        name: 'Bounce Attack',
        description: 'Deals damage to nearby enemies'
      }
    ],
    traits: [
      {
        name: 'Slimy',
        description: 'Has a chance to slow enemies'
      }
    ],
    howToObtain: 'Summoned from Basic Banner',
    evolution: {
      canEvolve: true,
      evolutionRequirements: 'Level 50 + Evolution Material',
      evolvesTo: 'Slime King'
    }
  },
  {
    id: 'slime-evo',
    name: 'Slime King',
    rarity: 'Epic',
    element: 'Nature',
    tier: 'Meta',
    cost: 100,
    category: 'Ground',
    image: '/images/units/Slime_EVO_Pose.webp',
    shinyImage: '/images/units/Slime_EVO_Shiny_Pose.webp',
    description: 'Evolved form of Slime with enhanced abilities and stats.',
    baseStats: {
      damage: 350,
      range: 18,
      speed: 2.0
    },
    level60Stats: {
      damage: 850,
      range: 18,
      speed: 2.0
    },
    skills: [
      {
        name: 'Royal Bounce',
        description: 'Deals massive damage in an area'
      },
      {
        name: 'Slime Army',
        description: 'Summons smaller slimes to assist'
      }
    ],
    traits: [
      {
        name: 'Royal Aura',
        description: 'Boosts nearby unit damage by 15%'
      }
    ],
    howToObtain: 'Evolve from Slime',
    evolution: {
      canEvolve: false,
      evolutionRequirements: '',
      evolvesTo: ''
    }
  },
  {
    id: 'koguro',
    name: 'Koguro',
    rarity: 'Legendary',
    element: 'Fire',
    tier: 'Broken',
    cost: 200,
    category: 'Ground',
    image: '/images/units/koguro-normal.webp',
    shinyImage: '/images/units/koguro-shiny.webp',
    description: 'A powerful fire-based unit with incredible damage output.',
    baseStats: {
      damage: 800,
      range: 20,
      speed: 1.5
    },
    level60Stats: {
      damage: 1800,
      range: 20,
      speed: 1.5
    },
    skills: [
      {
        name: 'Flame Burst',
        description: 'Unleashes a devastating fire attack'
      },
      {
        name: 'Inferno',
        description: 'Burns all enemies in range over time'
      }
    ],
    traits: [
      {
        name: 'Fire Master',
        description: 'Immune to fire damage and deals extra damage to nature units'
      }
    ],
    howToObtain: 'Legendary Banner (0.5% chance)',
    evolution: {
      canEvolve: false,
      evolutionRequirements: '',
      evolvesTo: ''
    }
  },
  {
    id: 'conqueror',
    name: 'Conqueror vs Invulnerable',
    rarity: 'Mythic',
    element: 'Unbound',
    tier: 'Broken',
    cost: 500,
    category: 'Ground',
    image: '/images/units/Conqueror_vs_Invulnerable_Pose.webp',
    shinyImage: '/images/units/Conqueror_vs_Invulnerable_Shiny_Pose.webp',
    description: 'The ultimate clash between two legendary powers.',
    baseStats: {
      damage: 2000,
      range: 25,
      speed: 1.0
    },
    level60Stats: {
      damage: 5000,
      range: 25,
      speed: 1.0
    },
    skills: [
      {
        name: 'Ultimate Clash',
        description: 'Deals massive damage to all enemies'
      },
      {
        name: 'Power Overload',
        description: 'Temporarily doubles damage output'
      }
    ],
    traits: [
      {
        name: 'Legendary Presence',
        description: 'Boosts all allied units by 25%'
      },
      {
        name: 'Unstoppable',
        description: 'Immune to all debuffs'
      }
    ],
    howToObtain: 'Secret Banner (0.1% chance) or Special Events',
    evolution: {
      canEvolve: false,
      evolutionRequirements: '',
      evolvesTo: ''
    }
  }
];

// Connect to MongoDB and seed data
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/anime-vanguards');
    console.log('Connected to MongoDB for seeding');

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Unit.deleteMany({});

    // Seed users
    console.log('Seeding users...');
    for (const userData of seedUsers) {
      const user = new User(userData);
      await user.save();
      console.log(`Created user: ${userData.username}`);
    }

    // Seed units
    console.log('Seeding units...');
    for (const unitData of seedUnits) {
      const unit = new Unit(unitData);
      await unit.save();
      console.log(`Created unit: ${unitData.name}`);
    }

    console.log('Database seeding completed successfully!');
    console.log('\nDefault Accounts Created:');
    console.log('- Admin: username "admin", password "admin123"');
    console.log('- Demo: username "demo", password "demo123"');
    console.log('\nUnits added to database:');
    seedUnits.forEach(unit => {
      console.log(`- ${unit.name} (${unit.rarity})`);
    });

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    process.exit(0);
  }
};

// Run the seeding
seedDatabase(); 