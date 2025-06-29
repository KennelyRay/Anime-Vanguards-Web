# Anime Vanguards Backend

This is the Node.js/Express backend for the Anime Vanguards web application, using MongoDB for data storage.

## Setup Instructions

### 1. MongoDB Installation

#### Option A: Local MongoDB Installation
1. Download and install MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Start MongoDB service:
   - **Windows**: MongoDB should start automatically as a service
   - **macOS**: `brew services start mongodb/brew/mongodb-community`
   - **Linux**: `sudo systemctl start mongod`

#### Option B: MongoDB Atlas (Cloud)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string from the Atlas dashboard
4. Replace the `MONGODB_URI` in your environment variables

### 2. Environment Variables

Create a `.env` file in the project root (not in the server folder) with:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/anime-vanguards

# JWT Configuration  
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Configuration
NODE_ENV=development
PORT=5000

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

**Important**: Change the `JWT_SECRET` to a secure random string in production!

### 3. Running the Application

#### Development Mode (both frontend and backend):
```bash
npm run start
```

#### Backend only:
```bash
npm run server:dev
```

#### Frontend only:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (requires auth)
- `PUT /api/auth/profile` - Update user profile (requires auth)
- `PUT /api/auth/change-password` - Change password (requires auth)
- `POST /api/auth/logout` - Logout user (requires auth)

### Health Check
- `GET /api/health` - Server health check

## Database Schema

### User Collection
```javascript
{
  username: String (required, unique, 3-20 chars)
  email: String (optional, unique)
  password: String (required, hashed, min 6 chars)
  isAdmin: Boolean (default: false)
  profilePicture: String (base64 data URL)
  createdAt: Date (auto-generated)
  lastLogin: Date (auto-updated)
}
```

## Features

- **Secure Authentication**: JWT tokens with 7-day expiration
- **Password Hashing**: bcrypt with 12 salt rounds
- **Profile Management**: Update username, email, profile picture
- **Admin System**: Auto-admin for "admin" username
- **File Upload Support**: Base64 profile pictures (10MB limit)
- **Error Handling**: Comprehensive error responses
- **CORS Enabled**: Cross-origin requests allowed

## Production Deployment

1. Set `NODE_ENV=production` in environment variables
2. Use a strong `JWT_SECRET` (32+ random characters)
3. Use MongoDB Atlas or properly secured MongoDB instance
4. Enable MongoDB authentication and SSL
5. Use environment variables for all sensitive configuration
6. Consider implementing token blacklisting for logout
7. Add rate limiting for API endpoints
8. Use HTTPS in production

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation and sanitization
- MongoDB injection protection
- CORS configuration
- Environment variable protection
- Error message sanitization

## Development Tips

- MongoDB will automatically create the database and collections
- The first user with username "admin" becomes an admin automatically
- Profile pictures are stored as base64 strings in the database
- JWT tokens are stored in localStorage on the frontend
- The API automatically handles token validation and user sessions 