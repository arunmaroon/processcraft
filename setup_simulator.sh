#!/bin/bash

echo "🚀 Setting up Discussion Guide Simulator"
echo "========================================"

# Check if Python 3.8+ is installed
python_version=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
required_version="3.8"

if [ "$(printf '%s\n' "$required_version" "$python_version" | sort -V | head -n1)" = "$required_version" ]; then
    echo "✅ Python $python_version detected"
else
    echo "❌ Python 3.8+ required. Current version: $python_version"
    exit 1
fi

# Create virtual environment
echo "📦 Creating virtual environment..."
python3 -m venv venv
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Make script executable
chmod +x discussion_guide_simulator.py

echo ""
echo "✅ Setup complete!"
echo ""
echo "To run the simulator:"
echo "1. Set your OpenAI API key: export OPENAI_API_KEY='your-key-here'"
echo "2. Activate virtual environment: source venv/bin/activate"
echo "3. Run simulator: python discussion_guide_simulator.py --sessions 5"
echo ""
echo "Options:"
echo "  --sessions N    Number of interview sessions (default: 3)"
echo "  --api-key KEY   OpenAI API key (or set OPENAI_API_KEY env var)"
echo "  --output FILE   Output filename for results"




