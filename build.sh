#!/bin/bash
set -e

echo "🐍 Installing Python dependencies..."
python3 -m pip install --upgrade pip
pip3 install -r python-engine/requirements.txt

echo "📦 Installing Node dependencies..."
npm ci

echo "🏗️  Building Next.js application..."
npm run build

echo "✅ Build completed successfully!"
