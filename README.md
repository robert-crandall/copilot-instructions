# Microblog App Template

A full-stack microblogging application with authentication, built with Hono (backend), React (frontend), and PostgreSQL. This template demonstrates best practices for end-to-end type safety, authentication flows, and testing.

## Features

- **Authentication**: User registration and login with JWT tokens
- **Microblogging**: Create, read, update, and delete posts (CRUD)
- **Type Safety**: Shared TypeScript types between backend and frontend
- **Mobile-First Design**: Responsive UI with TailwindCSS
- **Security**: Password hashing, JWT tokens, protected routes
- **Environment Controls**: Registration can be enabled/disabled

## Tech Stack

### Backend
- **Hono**: Fast, lightweight web framework
- **PostgreSQL**: Database with Drizzle ORM
- **JWT**: Authentication with hono/jwt
- **TypeScript**: Full type safety

### Frontend
- **React**: UI framework with hooks
- **TailwindCSS v4**: Utility-first CSS framework
- **Vite**: Fast build tool and dev server
- **TypeScript**: Full type safety

### Shared
- **Zod**: Runtime validation and type inference
- **TypeScript**: Shared types between backend/frontend

## Project Structure

```
├── backend/           # Hono API server
│   ├── src/
│   │   ├── db/        # Database schema and connection
│   │   ├── auth/      # Authentication utilities
│   │   ├── routes/    # API routes (auth, posts)
│   │   └── index.ts   # Main server file
│   └── drizzle/       # Database migrations
├── frontend/          # React SPA
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── pages/     # Page components
│   │   ├── contexts/  # React contexts
│   │   └── lib/       # API client and utilities
└── shared/            # Shared TypeScript types
    └── types.ts       # Zod schemas and TypeScript types
```

## Setup Instructions

### Prerequisites

- Node.js 18+ or Bun
- PostgreSQL database
- Git

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd microblog-template

# Install dependencies for all packages
cd backend && npm install  # or bun install
cd ../frontend && npm install  # or bun install
cd ../shared && npm install  # or bun install
```

### 2. Database Setup

```bash
# Start PostgreSQL (example using Docker)
docker run --name postgres-microblog -e POSTGRES_PASSWORD=password -e POSTGRES_DB=microblog -p 5432:5432 -d postgres:15

# Or use your existing PostgreSQL installation
createdb microblog
```

### 3. Environment Configuration

```bash
# Copy example environment file
cd backend
cp .env.example .env

# Edit .env with your database credentials
DATABASE_URL=postgresql://username:password@localhost:5432/microblog
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
ALLOW_REGISTRATION=true
NODE_ENV=development
PORT=3001
```

### 4. Database Migration

```bash
# Generate and run migrations
cd backend
npm run db:generate
npm run db:migrate
```

### 5. Start Development Servers

```bash
# Terminal 1: Start backend server
cd backend
npm run dev

# Terminal 2: Start frontend server  
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- API Health Check: http://localhost:3001/api/health

## Usage

### Authentication

1. **Registration**: Create a new account (when `ALLOW_REGISTRATION=true`)
   - Name (required, max 100 characters)
   - Email (required, valid format)
   - Password (required, min 6 characters)

2. **Login**: Sign in with existing credentials
   - Email and password
   - "Remember me" option for extended sessions

3. **Token Storage**:
   - "Remember me": 30-day token in localStorage
   - Regular login: 1-day token in sessionStorage

### Microblogging

1. **Create Posts**: Share thoughts up to 280 characters
2. **View Feed**: See all posts in chronological order
3. **Edit Posts**: Update your own posts
4. **Delete Posts**: Remove your own posts

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Sign in user

### Posts
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create new post (authenticated)
- `PUT /api/posts/:id` - Update post (authenticated, own posts only)
- `DELETE /api/posts/:id` - Delete post (authenticated, own posts only)

### Health
- `GET /api/health` - System health check

## Development

### Backend Development

```bash
cd backend

# Start development server with hot reload
npm run dev

# Generate database migrations
npm run db:generate

# Run migrations
npm run db:migrate

# Open Drizzle Studio (database GUI)
npm run db:studio

# Build for production
npm run build

# Start production server
npm run start
```

### Frontend Development

```bash
cd frontend

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## Environment Variables

### Backend (.env)

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | - |
| `JWT_SECRET` | Secret key for JWT signing | Yes | - |
| `ALLOW_REGISTRATION` | Enable/disable user registration | No | false |
| `NODE_ENV` | Environment (development/production) | No | development |
| `PORT` | Server port | No | 3001 |

### Frontend

The frontend automatically detects the environment:
- Development: API calls to `http://localhost:3001/api`
- Production: API calls to `/api` (same origin)

## Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Tokens**: Signed with secret, includes expiration
- **Protected Routes**: Authentication middleware for sensitive endpoints
- **Input Validation**: Client and server-side validation with Zod
- **CORS**: Configured for development and production
- **SQL Injection Prevention**: Drizzle ORM with parameterized queries

## Production Deployment

### Build the Application

```bash
# Build frontend
cd frontend
npm run build

# Build backend
cd ../backend
npm run build
```

### Environment Setup

1. Set up PostgreSQL database
2. Configure environment variables
3. Run database migrations
4. Start the server

### Single Server Deployment

The backend serves static files in production:

```bash
# Copy frontend build to backend
cp -r frontend/dist backend/dist/frontend

# Start production server
cd backend
npm run start
```

## Testing

The application is designed for comprehensive testing:

- **Backend**: Test API endpoints with real HTTP requests
- **Frontend**: Test user interactions with browser automation
- **Integration**: Test complete user flows

## Contributing

1. Follow the existing code style and patterns
2. Add appropriate error handling and validation
3. Update documentation for new features
4. Test thoroughly before submitting changes

## License

MIT License - see LICENSE file for details
