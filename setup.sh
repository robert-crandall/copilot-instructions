#!/bin/bash

echo "🚀 Setting up Microblog App Template..."
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
echo "Installing shared dependencies..."
cd shared && bun install
echo "Installing backend dependencies..."
cd ../backend && bun install
echo "Installing frontend dependencies..."
cd ../frontend && bun install
cd ..

echo ""
echo "✅ Dependencies installed successfully!"
echo ""
echo "🔧 Next steps:"
echo "1. Set up your PostgreSQL database"
echo "2. Update backend/.env with your database credentials"
echo "3. Run database migrations: cd backend && bun run db:generate && bun run db:migrate"
echo "4. Start the backend: cd backend && bun run dev"
echo "5. Start the frontend: cd frontend && bun run dev"
echo ""
echo "📖 See README.md for detailed setup instructions"
