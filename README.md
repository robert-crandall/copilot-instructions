# T3 Stack App

A full-stack TypeScript application built with the T3 stack principles, featuring Next.js, tRPC, Prisma, and Material UI.

## 🚀 Tech Stack

- **Next.js 14** with App Router
- **tRPC** for type-safe API routes
- **Prisma** ORM with PostgreSQL
- **Zod** for schema validation
- **Material UI v5** with dark/light/system themes
- **NextAuth.js** for authentication
- **TypeScript** for end-to-end type safety

## ✨ Features

- 🔐 **Authentication** - Email/password with NextAuth
- 📝 **Post Management** - Create, read, update, delete posts
- 🌙 **Theme Support** - Dark, light, and system preference modes
- 📱 **Responsive Design** - Material Design with 2-column + sidebar layout
- 🎨 **Modern UI** - Gradient text effects and "pop" styling
- 🔒 **Protected Routes** - Session-aware UI and route protection
- 📊 **Type Safety** - End-to-end TypeScript with tRPC and Zod

## 🛠 Getting Started

### Prerequisites

- Node.js 18+ or Bun
- PostgreSQL database running locally

### Setup

1. **Clone and install dependencies:**
   ```bash
   git clone <repo-url>
   cd copilot-instructions
   bun install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your database URL and NextAuth secret:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/database_name
   NEXTAUTH_SECRET=your-secret-key-here
   NEXTAUTH_URL=http://localhost:3000
   ```

3. **Set up the database:**
   ```bash
   bun run db:push    # Create tables
   bun run db:seed    # Add test data
   ```

4. **Start the development server:**
   ```bash
   bun dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Test Account

You can sign in with the seeded test account:
- **Email:** test@example.com
- **Password:** password123

## 📚 Available Scripts

- `bun dev` - Start development server
- `bun build` - Build for production
- `bun start` - Start production server
- `bun lint` - Run ESLint
- `bun run db:push` - Push schema changes to database
- `bun run db:generate` - Generate Prisma client
- `bun run db:seed` - Seed database with test data
- `bun run db:studio` - Open Prisma Studio
- `bun run db:reset` - Reset database and reseed

## 🏗 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes (NextAuth, tRPC)
│   ├── auth/              # Authentication pages
│   ├── posts/             # Post management pages
│   └── layout.tsx         # Root layout with providers
├── components/            # React components
│   ├── Layout.tsx         # Main layout component
│   ├── Navbar.tsx         # Navigation with theme toggle
│   └── ThemeProvider.tsx  # Material UI theme provider
├── lib/                   # Shared utilities
│   ├── auth.ts           # NextAuth configuration
│   ├── prisma.ts         # Prisma client setup
│   ├── schemas.ts        # Zod validation schemas
│   └── trpc.ts           # tRPC client setup
├── server/               # tRPC server code
│   ├── routers/          # API route handlers
│   ├── trpc.ts          # tRPC context and procedures
│   └── index.ts         # Main router
└── types/               # TypeScript type definitions
```

## 🎨 Features Walkthrough

### Authentication
- Sign up and sign in with email/password
- Protected routes and session management
- User-specific content and permissions

### Post Management
- Create new posts with rich text content
- Edit your own posts with real-time updates
- Publish/unpublish posts
- Delete posts with confirmation

### Theme System
- Toggle between light, dark, and system themes
- Persistent theme preference in localStorage
- Material UI integration with gradient effects
- Responsive design with 2-column + sidebar layout

### Type Safety
- End-to-end TypeScript with no `any` types
- Zod schemas shared across client and server
- tRPC for fully type-safe API calls
- Prisma for type-safe database operations

## 🤝 Contributing

This is a personal development project optimized for co-development with AI assistants like GitHub Copilot. The codebase prioritizes:

- Clarity and simplicity over abstraction
- Type safety and consistency
- Developer velocity and flow
- Minimal code duplication

## 📄 License

MIT License - feel free to use this as a starting point for your own T3 stack projects!
