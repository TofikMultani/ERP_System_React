#!/bin/bash

# ERP System Backend Setup Script

echo "================================"
echo "ERP System Backend Setup"
echo "================================"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js $(node --version)"
echo "✅ npm $(npm --version)"

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL might not be installed or not in PATH"
else
    echo "✅ PostgreSQL $(psql --version)"
fi

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "✅ Setup completed!"
echo ""
echo "Next steps:"
echo "1. Create .env file with PostgreSQL credentials"
echo "2. Create PostgreSQL database: CREATE DATABASE erp_system;"
echo "3. Run database setup: psql -U postgres -d erp_system -f setup.sql"
echo "4. Start server: npm run dev"
echo ""
echo "Documentation:"
echo "- QUICK_START.md - Getting started guide"
echo "- DATABASE_SETUP.md - Database schema and setup"
echo ""
