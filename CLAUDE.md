# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TuDestino is an Airbnb-like accommodation booking platform built as a monorepo with:
- **Backend API** (Node.js/Express)
- **Web Frontend** (React/Vite) - Public-facing booking site
- **Admin Panel** (React/Vite) - Property and user management
- **Mobile App** (Flutter) - iOS/Android app
- **Shared Package** - Common constants, validators, and utilities

## Development Commands

### Start All Apps in Development
```bash
npm run dev              # Starts API, Web, and Admin concurrently
npm run dev:api          # Backend API only (port 3000)
npm run dev:web          # Web frontend only (port 5173)
npm run dev:admin        # Admin panel only (port 5174)
```

### Database Setup
```bash
npm run seed:mysql       # Initialize MySQL database with schema (first time only)
npm run seed             # Seed test data (MongoDB - legacy)
```

### Build & Test
```bash
npm run build:api        # Build API for production
npm run build:web        # Build web app
npm run build:admin      # Build admin panel
npm run lint             # Lint all workspaces
npm run test             # Run tests in all workspaces
```

### Working with Workspaces
```bash
npm install <package> --workspace=apps/api
npm run <script> --workspace=apps/web
```

## Architecture

### Monorepo Structure
- `apps/api/` - Backend API with modular architecture
- `apps/web/` - Public web application
- `apps/admin/` - Admin dashboard
- `apps/mobile/` - Flutter mobile app
- `packages/shared/` - Shared code (roles, property types, booking statuses, validators, formatters)

### Backend Architecture (apps/api/)

**Module Pattern**: Each feature is a self-contained module with:
- `*.routes.js` - API endpoint definitions
- `*.controller.js` - Request/response handling
- `*.service.js` - Business logic (if present)
- `*.model.js` - Database schema (Mongoose or Sequelize)

**Available Modules**:
- `auth/` - Authentication (JWT-based)
- `users/` - User profiles and management
- `properties/` - Property CRUD and listings
- `bookings/` - Reservations (currently disabled - check [index.js:37](apps/api/src/index.js#L37))
- `payments/` - Payment processing (Stripe)
- `reviews/` - Property and host reviews
- `messaging/` - Chat functionality
- `search/` - Property search and filters
- `admin/` - Admin operations
- `notifications/` - Push notifications

**Key Files**:
- [apps/api/src/index.js](apps/api/src/index.js) - Main entry point, route registration
- [apps/api/src/config/database-mysql.js](apps/api/src/config/database-mysql.js) - MySQL/Sequelize connection
- [apps/api/src/middleware/auth.middleware.js](apps/api/src/middleware/auth.middleware.js) - JWT authentication middleware
- [apps/api/src/middleware/errorHandler.js](apps/api/src/middleware/errorHandler.js) - Centralized error handling

### Frontend Architecture (apps/web/ & apps/admin/)

**Feature-Based Organization**: Code organized by feature modules in `src/modules/`
- `components/` - Module-specific React components
- `hooks/` - Custom React hooks
- `services/` - API integration functions
- `pages/` - Route components

**Global Structure**:
- `src/services/api.js` - Axios instance with JWT interceptors
- `src/store/` - Zustand state management stores
- `src/layouts/` - Layout wrapper components
- `src/components/` - Shared components

**State Management**: Uses Zustand for global state and React Query for server state

### Database

**Current Setup**: Dual database support with MySQL as primary
- **MySQL/Sequelize**: Primary database (configured for Laragon)
  - Connection: [apps/api/src/config/database-mysql.js](apps/api/src/config/database-mysql.js)
  - Auto-syncs models in development mode
- **MongoDB/Mongoose**: Legacy support (some models still use Mongoose schema)
  - Models in `modules/*/model.js` use Mongoose but can be migrated

**Important**: The codebase is in transition from MongoDB to MySQL. Some models (like [user.model.js](apps/api/src/modules/users/user.model.js)) still use Mongoose schemas but need Sequelize equivalents.

### Authentication Flow

1. User logs in via `/api/auth/login`
2. Backend generates JWT token
3. Frontend stores token in localStorage
4. [api.js](apps/web/src/services/api.js) automatically attaches token to all requests via interceptor
5. Backend middleware verifies token on protected routes
6. 401 responses automatically redirect to login

## Environment Configuration

### API (.env in apps/api/)
```
DB_NAME=tudestino          # MySQL database name
DB_USER=root               # Laragon default
DB_PASSWORD=               # Empty for Laragon
DB_HOST=localhost
DB_PORT=3306
JWT_SECRET=your-secret
PORT=3000
```

### Web & Admin (.env files)
```
VITE_API_URL=http://localhost:3000/api
```

**Laragon Support**: The project supports custom .test domains via Laragon (see environment variables comments)

## Development Workflow

1. **Database**: Ensure MySQL is running (Laragon) and create `tudestino` database
2. **First Time**: Run `npm run seed:mysql` to create tables
3. **Start Dev**: Run `npm run dev` (single terminal) or individual commands
4. **Hot Reload**: All apps support hot module replacement
5. **API Testing**: Health check at `http://localhost:3000/health`

## Common Patterns

### Adding a New API Module
1. Create folder in `apps/api/src/modules/<module-name>/`
2. Add `*.routes.js`, `*.controller.js`, `*.model.js`
3. Register routes in [apps/api/src/index.js](apps/api/src/index.js)
4. Use middleware from `apps/api/src/middleware/auth.middleware.js` for protected routes

### Shared Code
Import from `@tudestino/shared`:
```javascript
import { ROLES, PROPERTY_TYPES, BOOKING_STATUS } from '@tudestino/shared';
```

Available in [packages/shared/](packages/shared/):
- Constants: roles, propertyTypes, bookingStatus
- Utilities: validators, formatters

### API Integration in Frontend
Use the configured axios instance from `src/services/api.js` which handles:
- Base URL configuration
- JWT token injection
- 401 redirect handling
- Response data extraction

## Important Notes

- **Bookings Module**: Currently commented out in main app ([index.js:37](apps/api/src/index.js#L37))
- **Model Associations**: `setupAssociations()` temporarily disabled ([index.js:30](apps/api/src/index.js#L30))
- **Database Migration**: Transitioning from MongoDB to MySQL - some models may need conversion
- **User Roles**: guest, host, admin (defined in shared package)
- **File Uploads**: Configured with 50MB limit, uses multer

## Ports

- API: 3000
- Web: 5173
- Admin: 5174
- MySQL: 3306

## Tech Stack Summary

**Backend**: Node.js 18+, Express, Sequelize (MySQL), Mongoose (MongoDB legacy), JWT, Socket.io, Stripe
**Frontend**: React 18, Vite, React Router, Zustand, React Query, Tailwind CSS, Leaflet
**Mobile**: Flutter 3+, Provider, Go Router, Dio
**Tools**: npm workspaces, nodemon, concurrently
