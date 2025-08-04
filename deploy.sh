#!/bin/bash

# Attendance App Deployment Script
# This script builds and prepares the application for deployment

echo "🚀 Starting deployment process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    print_error "Node.js version 16 or higher is required. Current version: $(node -v)"
    exit 1
fi

print_status "Node.js version: $(node -v)"
print_status "npm version: $(npm -v)"

# Install dependencies
print_status "Installing dependencies..."
npm run install:all

if [ $? -ne 0 ]; then
    print_error "Failed to install dependencies"
    exit 1
fi

# Run tests
print_status "Running tests..."
npm run test

if [ $? -ne 0 ]; then
    print_warning "Tests failed, but continuing with deployment..."
fi

# Build frontend
print_status "Building frontend..."
npm run build:frontend

if [ $? -ne 0 ]; then
    print_error "Frontend build failed"
    exit 1
fi

# Build backend
print_status "Building backend..."
npm run build:backend

if [ $? -ne 0 ]; then
    print_error "Backend build failed"
    exit 1
fi

# Create deployment directory
DEPLOY_DIR="deployment-$(date +%Y%m%d-%H%M%S)"
print_status "Creating deployment directory: $DEPLOY_DIR"
mkdir -p "$DEPLOY_DIR"

# Copy frontend build
print_status "Copying frontend build..."
cp -r frontend/build "$DEPLOY_DIR/frontend"

# Copy backend files
print_status "Copying backend files..."
cp -r backend "$DEPLOY_DIR/"
rm -rf "$DEPLOY_DIR/backend/node_modules"

# Copy configuration files
print_status "Copying configuration files..."
cp package.json "$DEPLOY_DIR/"
cp README.md "$DEPLOY_DIR/"

# Create deployment info
print_status "Creating deployment info..."
cat > "$DEPLOY_DIR/deployment-info.txt" << EOF
Deployment Date: $(date)
Node.js Version: $(node -v)
npm Version: $(npm -v)
Frontend Build: $(ls -la frontend/build | head -1)
Backend Build: $(ls -la backend | head -1)
EOF

# Create start script for deployment
cat > "$DEPLOY_DIR/start.sh" << 'EOF'
#!/bin/bash
echo "Starting Attendance App..."

# Install production dependencies
npm install --production

# Start the backend server
cd backend
npm install --production
npm start
EOF

chmod +x "$DEPLOY_DIR/start.sh"

print_status "Deployment package created successfully!"
print_status "Deployment directory: $DEPLOY_DIR"
print_status ""
print_status "To deploy:"
print_status "1. Copy the '$DEPLOY_DIR' folder to your server"
print_status "2. Navigate to the deployment directory"
print_status "3. Run: ./start.sh"
print_status ""
print_status "Don't forget to:"
print_status "- Set up your environment variables"
print_status "- Configure your database connection"
print_status "- Set up your domain and SSL certificates"

echo ""
echo "✅ Deployment process completed successfully!" 