import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increased limit for profile pictures
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (for profile pictures if using file storage)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static files from the dist directory (built frontend)
app.use(express.static(path.join(__dirname, '../dist')));

// Serve static files from the public/images directory at the /images route
app.use('/images', express.static(path.join(__dirname, '../public/images')));

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/anime-vanguards');
    console.log('MongoDB Connected Successfully');
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    process.exit(1);
  }
};

// User Schema
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
    sparse: true, // Allows multiple null values
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
    type: String, // Base64 string or file path
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

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

// JWT Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

// Test route to debug routing issues
app.get('/api/test', (req, res) => {
  res.json({ message: 'Test route works', timestamp: new Date().toISOString() });
});



// Register User
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({ message: 'Username must be between 3 and 20 characters' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { username: username },
        ...(email ? [{ email: email }] : [])
      ]
    });

    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(400).json({ message: 'Username already exists' });
      }
      if (existingUser.email === email) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    // Create new user
    const user = new User({
      username,
      email: email || undefined,
      password,
      isAdmin: username.toLowerCase() === 'admin' // Auto-admin for 'admin' username
    });

    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { 
        userId: user._id,
        username: user.username,
        isAdmin: user.isAdmin
      },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login User
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { 
        userId: user._id,
        username: user.username,
        isAdmin: user.isAdmin
      },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get User Profile
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

// Update User Profile
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const { username, email, profilePicture } = req.body;
    const userId = req.user.userId;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validation
    if (username && (username.length < 3 || username.length > 20)) {
      return res.status(400).json({ message: 'Username must be between 3 and 20 characters' });
    }

    // Check if new username/email already exists (excluding current user)
    if (username && username !== user.username) {
      const existingUsername = await User.findOne({ username, _id: { $ne: userId } });
      if (existingUsername) {
        return res.status(400).json({ message: 'Username already exists' });
      }
    }

    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email, _id: { $ne: userId } });
      if (existingEmail) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    // Update user
    if (username) user.username = username;
    if (email !== undefined) user.email = email || undefined;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

// Change Password
app.put('/api/auth/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ message: 'Server error changing password' });
  }
});

// Logout (mainly for token blacklisting in the future)
app.post('/api/auth/logout', authenticateToken, (req, res) => {
  // In a production app, you might want to blacklist the token
  res.json({ message: 'Logged out successfully' });
});

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
  // Additional fields to match frontend structure
  isBaseForm: {
    type: Boolean,
    default: true
  },
  baseForm: String,
  evolutionLine: [String],
  doesntEvolve: Boolean,
  upgradeStats: {
    maxUpgrades: Number,
    levels: [{
      level: Number,
      yenCost: Number,
      atkDamage: Number,
      range: Number,
      spa: Number,
      critDamage: Number,
      critChance: Number
    }]
  },
  evolutions: [{
    name: String,
    tier: String,
    element: String,
    rarity: String,
    cost: Number,
    image: String,
    shinyImage: String,
    description: String,
    requirements: String,
    bonuses: [String]
  }],
  trivia: [String],
  obtainment: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Unit = mongoose.model('Unit', unitSchema);

// Units API Routes
console.log('Registering units routes...');

// Get all units
app.get('/api/units', async (req, res) => {
  console.log('GET /api/units route hit');
  try {
    const units = await Unit.find().sort({ name: 1 });
    res.json({ data: units });
  } catch (error) {
    console.error('Error fetching units:', error);
    res.status(500).json({ message: 'Server error fetching units' });
  }
});

// Get unit by ID
app.get('/api/units/:id', async (req, res) => {
  try {
    const unit = await Unit.findOne({ id: req.params.id });
    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }
    res.json({ data: unit });
  } catch (error) {
    console.error('Error fetching unit:', error);
    res.status(500).json({ message: 'Server error fetching unit' });
  }
});

// Add new unit (Admin only)
app.post('/api/units', authenticateToken, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const unit = new Unit(req.body);
    await unit.save();
    res.status(201).json({ message: 'Unit created successfully', data: unit });
  } catch (error) {
    console.error('Error creating unit:', error);
    if (error.code === 11000) {
      res.status(400).json({ message: 'Unit with this ID already exists' });
    } else {
      res.status(500).json({ message: 'Server error creating unit' });
    }
  }
});

// Update unit (Admin only)
app.put('/api/units/:id', authenticateToken, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const unit = await Unit.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }

    res.json({ message: 'Unit updated successfully', data: unit });
  } catch (error) {
    console.error('Error updating unit:', error);
    res.status(500).json({ message: 'Server error updating unit' });
  }
});

// Delete unit (Admin only)
app.delete('/api/units/:id', authenticateToken, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const unit = await Unit.findOneAndDelete({ id: req.params.id });
    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }

    res.json({ message: 'Unit deleted successfully' });
  } catch (error) {
    console.error('Error deleting unit:', error);
    res.status(500).json({ message: 'Server error deleting unit' });
  }
});

// Bulk migrate units from frontend database (Admin only)
app.post('/api/units/migrate', authenticateToken, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { units } = req.body;
    if (!Array.isArray(units)) {
      return res.status(400).json({ message: 'Units must be an array' });
    }

    const results = {
      created: 0,
      updated: 0,
      errors: []
    };

    for (const unitData of units) {
      try {
        // Generate unique ID from name
        const unitId = unitData.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        
        const existingUnit = await Unit.findOne({ id: unitId });
        
        const mongoUnit = {
          id: unitId,
          name: unitData.name,
          rarity: unitData.rarity || 'Rare',
          element: unitData.element || 'Unknown',
          tier: unitData.tier || 'Good',
          cost: unitData.cost || 100,
          category: 'Ground', // Default category
          image: unitData.image || '/images/units/default.webp',
          shinyImage: unitData.shinyImage || '/images/units/default-shiny.webp',
          description: unitData.description || 'No description available',
          videoUrl: unitData.videoUrl,
          baseStats: unitData.stats ? {
            damage: parseInt(unitData.stats.damage) || 100,
            range: parseInt(unitData.stats.range) || 10,
            speed: parseFloat(unitData.stats.speed) || 1.0
          } : {
            damage: 100,
            range: 10,
            speed: 1.0
          },
          level60Stats: unitData.upgradeStats?.levels ? {
            damage: unitData.upgradeStats.levels[unitData.upgradeStats.levels.length - 1]?.atkDamage || 300,
            range: unitData.upgradeStats.levels[unitData.upgradeStats.levels.length - 1]?.range || 15,
            speed: unitData.upgradeStats.levels[unitData.upgradeStats.levels.length - 1]?.spa || 1.5
          } : {
            damage: 300,
            range: 15,
            speed: 1.5
          },
          skills: unitData.skills?.map(skill => ({
            name: skill.name,
            description: skill.description
          })) || [],
          traits: unitData.traits?.map(trait => ({
            name: trait,
            description: `${trait} trait`
          })) || [],
          howToObtain: unitData.obtainment || 'Available in summons',
          evolution: {
            canEvolve: Boolean(unitData.evolutions && unitData.evolutions.length > 0),
            evolutionRequirements: unitData.evolutions?.[0]?.requirements || '',
            evolvesTo: unitData.evolutions?.[0]?.name || ''
          },
          isBaseForm: unitData.isBaseForm !== false,
          baseForm: unitData.baseForm,
          evolutionLine: unitData.evolutionLine || [],
          doesntEvolve: unitData.doesntEvolve || false,
          upgradeStats: unitData.upgradeStats,
          evolutions: unitData.evolutions || [],
          trivia: unitData.trivia || [],
          obtainment: unitData.obtainment
        };

        if (existingUnit) {
          await Unit.findOneAndUpdate({ id: unitId }, mongoUnit);
          results.updated++;
        } else {
          const unit = new Unit(mongoUnit);
          await unit.save();
          results.created++;
        }
      } catch (error) {
        results.errors.push({
          unit: unitData.name,
          error: error.message
        });
      }
    }

    res.json({
      message: 'Migration completed',
      results
    });
  } catch (error) {
    console.error('Error migrating units:', error);
    res.status(500).json({ message: 'Server error during migration' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// Handle API routes that don't exist
app.all('/api/*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Catch-all handler: send back React's index.html file for non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Start server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Access from network: http://[YOUR_IP]:${PORT}`);
  });
};

startServer(); 