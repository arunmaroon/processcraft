# Dual-Agent Chat System Setup Guide

## Overview

This guide covers the complete setup of the dual-agent chatting system for UX research. The system features two AI agents that mimic human personas realistically, using GPT-4o with custom prompts, memory management with LangChain/Redis, and ethical guardrails.

## 🏗️ Architecture

```
Frontend (React + TypeScript)
├── AgentPreview.tsx          # Main dual-agent interface
├── ChatPanel.tsx             # Individual agent chat panel
├── useAgentChat.ts           # State management hook
└── types/agent.types.ts      # TypeScript definitions

Backend (Node.js + Express)
├── routes/agent-chat.ts      # Chat API endpoints
├── services/
│   ├── AgentChatService.ts   # Core chat logic
│   ├── MemoryService.ts      # LangChain + Redis memory
│   └── EthicalGuardrailsService.ts # Bias detection
└── simple-backend.js         # Main server with mock endpoints
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Frontend dependencies
cd frontend
npm install framer-motion zustand

# Backend dependencies (if using full TypeScript backend)
cd ../backend
npm install openai ioredis langchain @langchain/core @langchain/openai
```

### 2. Environment Variables

Create `.env` file in project root:

```env
# OpenAI API Key (required for GPT-4o)
OPENAI_API_KEY=your_openai_api_key_here

# Redis Configuration (for memory management)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Optional: Claude API Key (for enhanced responses)
CLAUDE_API_KEY=your_claude_api_key_here
```

### 3. Start Services

```bash
# Terminal 1: Backend (port 7501)
cd /Users/arun.murugesan/AI\ Projects/E-E\ UXD\ POC/processcraft-poc
node simple-backend.js

# Terminal 2: Frontend (port 7500)
cd frontend
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:7500
- **Backend API**: http://localhost:7501
- **Agent Chat**: http://localhost:7500 (navigate to Agent Chat section)

## 🎯 Features Implemented

### ✅ Core Features

1. **Split-Screen Chat Interface**
   - Two independent chat panels
   - Real-time typing indicators
   - Message history with timestamps
   - Agent avatars and status

2. **Realistic Agent Personas**
   - Tech-Savvy Professional (Priya Sharma)
   - Novice Business Owner (Rajesh Kumar)
   - Detailed demographics and personality traits
   - Context-aware responses

3. **Multimodal Input Support**
   - Text messages
   - Image upload and analysis
   - Context-aware prompts

4. **Memory Management**
   - Conversation history tracking
   - Key insights extraction
   - User preference learning
   - Design feedback aggregation

5. **Ethical Guardrails**
   - Bias detection (gender, age, cultural, socioeconomic)
   - Inappropriate content filtering
   - Cultural sensitivity checks
   - Accessibility compliance

### ✅ Advanced Features

1. **Human-Like Behavior**
   - Natural hesitations and fillers
   - Emotional responses
   - Confidence levels
   - Personality-consistent language

2. **Session Management**
   - Session creation and tracking
   - Export functionality
   - Memory persistence
   - Context switching

3. **Design Feedback**
   - Usability scoring
   - Aesthetic evaluation
   - Functionality assessment
   - Accessibility review

## 🔧 Configuration

### Agent Configuration

Edit `simple-backend.js` to modify agent personas:

```javascript
const agents = [
  {
    id: 'tech-savvy-1',
    name: 'Priya Sharma',
    persona: 'Tech-savvy professional...',
    demographics: {
      age: 28,
      techSavviness: 'expert',
      englishLiteracy: 'native'
      // ... other properties
    }
    // ... rest of agent definition
  }
];
```

### Response Customization

Modify response patterns in `AgentChatService.ts`:

```typescript
private createPersonaPrompt(agent: Agent, input: ChatInput): string {
  // Customize prompt based on agent personality
  return `You are ${agent.name}...`;
}
```

### Memory Settings

Configure Redis memory in `MemoryService.ts`:

```typescript
constructor() {
  this.redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    // ... other settings
  });
}
```

## 🎨 UI Customization

### Styling

The components use Tailwind CSS. Key classes:

```tsx
// Main container
<div className="flex flex-col h-full bg-gray-50">

// Chat panel
<div className="flex-1 flex flex-col h-full bg-white rounded-lg shadow-sm border">

// Message bubbles
<div className="px-4 py-3 rounded-2xl bg-blue-500 text-white">
```

### Animations

Framer Motion animations:

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.3 }}
>
```

## 🔌 API Endpoints

### Chat Endpoints

```bash
# Get available agents
GET /api/agents

# Create chat session
POST /api/chat/session
{
  "agentIds": ["agent1", "agent2"],
  "context": { "topic": "UX Research" }
}

# Send message
POST /api/chat/message
{
  "sessionId": "session_123",
  "agentId": "agent1",
  "input": {
    "text": "What do you think about this design?",
    "image": "base64_image_data"
  }
}
```

### Memory Endpoints

```bash
# Get session memory
GET /api/chat/session/:sessionId/memory

# Update context
PUT /api/chat/session/:sessionId/context
{
  "context": { "designPhase": "prototype" }
}
```

## 🧪 Testing

### Manual Testing

1. **Agent Selection**
   - Select two different agents
   - Verify personality differences in responses

2. **Message Flow**
   - Send text messages
   - Upload images
   - Check typing indicators

3. **Memory Persistence**
   - Continue conversation across messages
   - Verify context retention

### Unit Testing

```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd backend
npm test
```

## 🚨 Troubleshooting

### Common Issues

1. **Agents not loading**
   - Check backend is running on port 7501
   - Verify `/api/agents` endpoint

2. **Messages not sending**
   - Check network tab for API errors
   - Verify session is created

3. **Memory not persisting**
   - Check Redis connection
   - Verify environment variables

4. **Styling issues**
   - Ensure Tailwind CSS is loaded
   - Check for CSS conflicts

### Debug Mode

Enable debug logging:

```javascript
// In simple-backend.js
console.log('Debug: Session created', session);
console.log('Debug: Message received', input);
```

## 📈 Performance Optimization

### Frontend

1. **Message Virtualization**
   - Implement for large conversation histories
   - Use `react-window` or similar

2. **Image Optimization**
   - Compress images before upload
   - Use WebP format

3. **State Management**
   - Consider Redux for complex state
   - Implement message caching

### Backend

1. **Response Caching**
   - Cache common responses
   - Use Redis for session data

2. **Rate Limiting**
   - Implement per-user limits
   - Add request throttling

3. **Memory Management**
   - Limit conversation history
   - Implement cleanup jobs

## 🔒 Security Considerations

1. **Input Validation**
   - Sanitize all user inputs
   - Validate image uploads

2. **API Security**
   - Implement authentication
   - Add rate limiting

3. **Data Privacy**
   - Encrypt sensitive data
   - Implement data retention policies

## 🚀 Production Deployment

### Frontend

```bash
# Build for production
cd frontend
npm run build

# Serve with nginx
sudo nginx -s reload
```

### Backend

```bash
# Use PM2 for process management
npm install -g pm2
pm2 start simple-backend.js --name "agent-chat"
pm2 save
pm2 startup
```

### Database

```bash
# Setup Redis cluster
redis-cli --cluster create node1:7000 node2:7000 node3:7000
```

## 📚 Additional Resources

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [LangChain Documentation](https://python.langchain.com/)
- [Redis Documentation](https://redis.io/documentation)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Add tests for new features
4. Submit pull request

## 📄 License

MIT License - see LICENSE file for details

---

## 🎉 You're Ready!

The dual-agent chat system is now fully functional. Start by selecting two agents and begin your UX research conversations. The system will provide realistic, persona-driven feedback that mimics real user interactions.

For questions or issues, check the troubleshooting section or create an issue in the repository.



