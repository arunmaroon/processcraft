#!/bin/bash

echo "🚀 Setting up ProcessCraft Advanced AI Agent System"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js version 20+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL is not installed. Please install PostgreSQL 13+ for full functionality."
    echo "   You can continue without it, but database features will be limited."
fi

# Check if Redis is installed
if ! command -v redis-server &> /dev/null; then
    echo "⚠️  Redis is not installed. Please install Redis 6+ for full functionality."
    echo "   You can continue without it, but memory features will be limited."
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

if [ $? -eq 0 ]; then
    echo "✅ Backend dependencies installed successfully"
else
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

if [ $? -eq 0 ]; then
    echo "✅ Frontend dependencies installed successfully"
else
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

# Create environment file if it doesn't exist
cd ..
if [ ! -f .env ]; then
    echo "📝 Creating environment configuration..."
    cat > .env << EOF
# ProcessCraft Environment Configuration

# API Keys
GROK_API_KEY=your_grok_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
CLAUDE_API_KEY=your_claude_api_key_here

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=processcraft_agents
DB_USER=postgres
DB_PASSWORD=your_password_here

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=24h

# Admin Configuration
ADMIN_PASSCODE=01234

# Server Configuration
PORT=3002
NODE_ENV=development

# Grok Configuration
GROK_BASE_URL=https://api.x.ai/v1
GROK_MODEL=grok-3
EOF
    echo "✅ Environment file created (.env)"
    echo "⚠️  Please update the .env file with your actual API keys and configuration"
else
    echo "✅ Environment file already exists"
fi

# Create data directories
echo "📁 Creating data directories..."
mkdir -p data/{uploads,processed,agents,exports}
mkdir -p backend/uploads/research-data
echo "✅ Data directories created"

# Build backend
echo "🔨 Building backend..."
cd backend
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Backend built successfully"
else
    echo "❌ Failed to build backend"
    exit 1
fi

cd ..

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Update the .env file with your API keys"
echo "2. Start PostgreSQL and Redis (if available)"
echo "3. Run the backend: cd backend && npm run dev"
echo "4. Run the frontend: cd frontend && npm run dev"
echo "5. Access the agent system at: http://localhost:2000/admin/agents"
echo ""
echo "Default admin credentials:"
echo "Email: admin@processcraft.com"
echo "Password: admin123"
echo "Passcode: 01234"
echo ""
echo "For more information, see AGENT_SYSTEM_README.md"















