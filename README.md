# Quit Smoking App

A React Native mobile application with Node.js backend to help users quit smoking through gradual reduction, progress tracking, and behavioral support.

> **Note**: Currently using Expo SDK 52 and React Native 0.76. See `client/UPGRADE_NOTES.md` for version details.

## Project Structure

```
├── client/          # React Native Expo app
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── screens/      # App screens
│   │   ├── store/        # Redux store and slices
│   │   ├── navigation/   # Navigation configuration
│   │   ├── types/        # TypeScript type definitions
│   │   └── utils/        # Utility functions
│   ├── App.tsx          # Main app component
│   └── package.json
├── server/          # Node.js Express API
│   ├── src/
│   │   ├── models/       # Mongoose data models
│   │   ├── routes/       # API route handlers
│   │   ├── middleware/   # Express middleware
│   │   └── utils/        # Utility functions
│   ├── index.js         # Server entry point
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- MongoDB Atlas account (for database)

### Setup

1. **Install dependencies:**

   ```bash
   # Install client dependencies
   cd client
   npm install

   # Install server dependencies
   cd ../server
   npm install
   ```

2. **Configure environment variables:**

   ```bash
   cd server
   cp .env.example .env
   # Edit .env with your MongoDB URI and JWT secret
   ```

3. **Start the development servers:**

   ```bash
   # Terminal 1: Start backend server (from server directory)
   cd server
   npm run dev

   # Terminal 2: Start React Native app (from client directory)
   cd client
   npm start
   ```

   After running `npm start`, you can:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your phone

## Features

- User authentication and account management
- Customizable quit plan with gradual reduction
- Daily cigarette logging and tracking
- Progress visualization and statistics
- Mood and craving journal
- SOS features for craving support
- Achievement system with rewards and consequences
- Offline support with data synchronization

## Development Status

Currently in development. See `.kiro/specs/quit-smoking-app/tasks.md` for implementation progress.
