#!/bin/bash

# Create required directories
mkdir -p "/Users/arun.murugesan/AI Projects/E-E UXD POC/processcraft-poc/exports/research-insights"
mkdir -p "/Users/arun.murugesan/AI Projects/E-E UXD POC/processcraft-poc/exports/designs"
mkdir -p "/Users/arun.murugesan/AI Projects/E-E UXD POC/processcraft-poc/exports/ui-variants"
mkdir -p "/Users/arun.murugesan/AI Projects/E-E UXD POC/processcraft-poc/exports/code"
mkdir -p "/Users/arun.murugesan/AI Projects/E-E UXD POC/processcraft-poc/data/training"
mkdir -p "/Users/arun.murugesan/AI Projects/E-E UXD POC/processcraft-poc/data/research-central"

# Set environment variables
export OPENAI_API_KEY=dummy-key
export NODE_ENV=development
export PORT=3001

cd "/Users/arun.murugesan/AI Projects/E-E UXD POC/processcraft-poc/backend"
npm run build
node dist/server.js
