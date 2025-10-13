# ProcessCraft Advanced AI Agent System

## Overview

The ProcessCraft Advanced AI Agent System is a sophisticated platform for creating, managing, and testing hyper-realistic AI agents that mimic real users in research scenarios. Built with React, Node.js, PostgreSQL, and Redis, it leverages Grok AI for advanced agent generation and behavioral simulation.

## Features

### 🔐 Secure Admin Access
- Multi-factor authentication with passcode protection
- Role-based permissions (Super Admin, Admin, Viewer)
- Session management with automatic timeout
- Comprehensive audit logging

### 📁 Integrated Upload & Build Workflow
- **Seamless Single-Page Experience**: Upload documents and build agents in one unified interface
- **Drag-and-drop file upload** with validation for PDF, DOC, TXT, CSV, JSON, MP3, MP4, and image files
- **Automatic file processing** with real-time progress tracking
- **AI-powered insight extraction** from uploaded documents
- **Immediate agent generation** based on extracted insights
- **Multi-dimensional agent creation** with 500+ unique combinations
- **Sophisticated criteria configuration** for demographics, behavioral traits, psychological profiles, and financial behavior
- **Quality threshold controls** and batch generation capabilities

### 🧠 Grok-Powered Intelligence
- Primary AI provider: Grok-3 model
- Fallback to OpenAI GPT-4
- Whisper integration for audio transcription
- Advanced prompt engineering for realistic responses
- Behavioral consistency modeling

### 🧪 Comprehensive Testing Lab
- Interactive chat testing
- Predefined scenario testing
- Consistency testing across multiple sessions
- Emotional range testing
- Group dynamics simulation
- Real-time performance analytics

### 📚 Advanced Agent Library
- Multi-criteria search and filtering
- Visual clustering and similarity detection
- Performance metrics tracking
- Bulk operations and management
- Version control and evolution tracking

### 💾 Sophisticated Memory System
- Redis-based agent memory management
- Conversation history tracking
- Emotional state persistence
- Context awareness maintenance
- Cross-session consistency

## Architecture

### Backend (Node.js + Express)
```
backend/
├── src/
│   ├── models/           # Database models (Agent, Conversation, ResearchData)
│   ├── routes/           # API endpoints
│   ├── services/         # Business logic (Grok, Memory, Analytics)
│   ├── middleware/       # Authentication, validation, rate limiting
│   ├── config/           # Database, Redis configuration
│   └── utils/            # Helper functions
```

### Frontend (React + TypeScript)
```
frontend/
├── src/
│   ├── components/agents/    # Agent system components
│   ├── hooks/               # Custom React hooks
│   ├── types/               # TypeScript definitions
│   └── utils/               # Utility functions
```

### Database Schema

#### Agents Table
- Demographics (age, gender, location, education, occupation, income, family)
- Behavioral traits (personality, communication style, risk tolerance)
- Psychological profile (motivations, fears, values, aspirations)
- Financial profile (credit, banking, investment, spending patterns)
- Performance metrics (consistency, realism, engagement scores)
- Metadata (tags, notes, generation method, quality flags)

#### Conversations Table
- Agent and session tracking
- Message content and timestamps
- Response time and quality metrics
- Emotional state and context awareness
- Topics covered and decisions made

#### Research Data Table
- File metadata and content
- Processing status and insights
- Quality scores and error handling
- Version control and audit trails

## Installation

### Prerequisites
- Node.js 20+
- PostgreSQL 13+
- Redis 6+
- Grok API key

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure your environment variables
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Database Setup
```bash
# Create PostgreSQL database
createdb processcraft_agents

# Run migrations (if available)
npm run db:migrate
```

## Configuration

### Environment Variables
```env
# API Keys
GROK_API_KEY=your_grok_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=processcraft_agents
DB_USER=postgres
DB_PASSWORD=your_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Security
JWT_SECRET=your_jwt_secret
ADMIN_PASSCODE=01234
```

## Usage

### 1. Admin Authentication
- Access the system at `http://localhost:2000/agents`
- Login with admin credentials and passcode
- Multi-factor authentication available

### 2. Integrated Upload & Build Workflow
- **Upload Phase**: Drag and drop research documents (interviews, surveys, notes)
- **Processing Phase**: Files are automatically processed and analyzed by AI
- **Build Phase**: Configure agent criteria and generate agents based on extracted insights
- **Seamless Transition**: Automatically switches from upload to build after processing
- **Enhanced Quality**: Agents are generated with insights from your specific research data

### 4. Agent Testing
- Interactive chat testing
- Scenario-based testing
- Consistency testing across sessions
- Performance analytics and reporting

### 5. Agent Management
- Search and filter agents
- Bulk operations
- Performance monitoring
- Export and deployment

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/refresh` - Refresh token

### Agent Management
- `POST /api/agents/generate` - Generate agents
- `GET /api/agents` - List agents with filters
- `GET /api/agents/:id` - Get specific agent
- `PUT /api/agents/:id` - Update agent
- `DELETE /api/agents/:id` - Delete agent
- `POST /api/agents/:id/chat` - Chat with agent
- `GET /api/agents/:id/memory` - Get agent memory
- `POST /api/agents/:id/reset` - Reset agent state

### Data Management
- `POST /api/upload/research` - Upload research files
- `GET /api/upload/status/:id` - Processing status
- `POST /api/processing/start` - Begin processing
- `GET /api/processing/insights` - Get insights

## Advanced Features

### Multi-Dimensional Agent Creation
- 15+ demographic categories
- 20+ behavioral traits
- 30+ psychological factors
- 25+ financial characteristics
- 500+ unique combinations

### Behavioral Consistency Engine
- Response validation against agent profile
- Emotional continuity tracking
- Memory integration across sessions
- Personality drift simulation
- Cultural alignment verification

### Group Dynamics Simulation
- Multi-agent focus groups
- Peer influence modeling
- Social dynamics simulation
- Moderator AI guidance
- Real-time interaction analytics

### Performance Analytics
- Real-time performance dashboards
- Agent effectiveness tracking
- User satisfaction metrics
- System resource monitoring
- Error tracking and alerting

## Security & Compliance

### Data Protection
- Encryption at rest and in transit
- PII detection and anonymization
- Secure file upload with virus scanning
- Regular security audits
- GDPR compliance

### Access Control
- Multi-factor authentication
- Role-based permissions
- Session management
- API rate limiting
- Comprehensive audit logging

## Deployment

### Production Setup
```bash
# Build applications
npm run build

# Start production servers
npm start

# Configure reverse proxy (nginx)
# Set up SSL certificates
# Configure monitoring and logging
```

### Docker Deployment
```dockerfile
# Backend Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3002
CMD ["npm", "start"]
```

## Monitoring & Maintenance

### Health Checks
- Database connectivity
- Redis availability
- API endpoint status
- File system health
- Memory usage monitoring

### Backup Procedures
- Regular database backups
- Redis persistence configuration
- File storage backups
- Configuration backups
- Disaster recovery planning

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is proprietary software. All rights reserved.

## Support

For technical support or questions:
- Email: support@processcraft.com
- Documentation: [Internal Wiki]
- Issue Tracker: [GitHub Issues]

## Version History

### v1.07-sirius (Current)
- Advanced AI agent system implementation
- Grok integration for sophisticated agent generation
- Multi-dimensional agent creation
- Comprehensive testing and analytics
- Redis-based memory management
- Role-based authentication system

### Previous Versions
- v1.06: Enhanced research workflow
- v1.05: PRD generation improvements
- v1.04: UI/UX enhancements
- v1.03: Initial research features
- v1.02: Basic project management
- v1.01: Core platform foundation
