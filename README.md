# ProcessCraft POC: AI-Powered UX Design Workflow Platform

**Version 1.0**  
**Date: September 19, 2025**  

ProcessCraft is an end-to-end AI-powered UX design platform that empowers teams to focus on strategic thinking rather than manual tooling. It automates workflows from business problem definition to production-ready code, ensuring designers have full control while leveraging AI for efficiency.

## 🚀 Key Features

- **AI-Powered Research**: Virtual quant/qual studies in minutes instead of weeks
- **Context-Preserving Handoffs**: Integrated approvals and versioning preserve all decisions
- **Persona-Specific UIs**: Generates tailored interfaces for different user types
- **Role-Based Workflows**: Complete permission system with approval chains
- **Production-Ready Code**: Generates deployable React/TypeScript code
- **MCP Simulation**: Live preview of deployment without external dependencies

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **State Management**: React Context with localStorage persistence
- **Routing**: React Router v6
- **Build Tool**: Vite for fast development

### Backend (Node.js + Express)
- **Runtime**: Node.js 20
- **Framework**: Express.js
- **AI Integration**: OpenAI GPT-4 for all AI operations
- **Security**: File access restricted to project root only
- **Storage**: File-based storage (no external database)

## 📁 Project Structure

```
processcraft-poc/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── layout/      # Layout components
│   │   │   ├── shared/      # Shared components
│   │   │   ├── research/    # Research stage components
│   │   │   ├── design/      # UX design components
│   │   │   ├── ui-generation/ # UI generation components
│   │   │   └── code-export/ # Code export components
│   │   ├── context/         # React Context providers
│   │   ├── types/           # TypeScript type definitions
│   │   └── utils/           # Utility functions
│   └── package.json
├── backend/                 # Node.js backend API
│   ├── src/
│   │   ├── routes/          # API route handlers
│   │   ├── services/        # Business logic services
│   │   └── server.ts        # Express server setup
│   └── package.json
├── data/                    # User-provided training data
│   ├── training/            # CSV/JSON training files
│   └── assets/              # Design system tokens, brand assets
├── exports/                 # Generated outputs
│   ├── research-insights/   # AI-generated research reports
│   ├── wireframes/          # Generated wireframes
│   ├── ui-variants/         # Persona-specific UI variants
│   └── code/                # Production-ready code
└── package.json             # Root package configuration
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 20 or higher
- npm or yarn
- OpenAI API key

### 1. Clone and Install Dependencies

```bash
# Navigate to the project directory
cd processcraft-poc

# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies
cd ../backend && npm install

# Return to root directory
cd ..
```

### 2. Environment Configuration

```bash
# Copy the environment template
cp env.example .env

# Edit the .env file with your OpenAI API key
# OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Start Development Servers

```bash
# Start both frontend and backend concurrently
npm run dev

# Or start them separately:
# Frontend (http://localhost:3000)
cd frontend && npm run dev

# Backend (http://localhost:3001)
cd backend && npm run dev
```

## 🎯 Usage Guide

### 1. Login and Role Selection
- Open http://localhost:3000
- Select your role (PM, Designer, Design Head, etc.)
- Enter your name and email

### 2. Create a New Project
- Click "New Project" on the dashboard
- Fill in project details:
  - Project name and description
  - Objectives and target users
  - Success metrics
  - Business context and constraints

### 3. Workflow Stages

#### Stage 1: Product Thinking (PM)
- Define product requirements document (PRD)
- Submit for PM Manager approval
- Iterate based on feedback

#### Stage 2: Research (Designer)
- Set up virtual research lab
- Define cohorts and personas
- Run AI-powered research
- Generate insights report

#### Stage 3: UX Design (Designer)
- Create wireframes based on research
- Design user flows
- Add annotations and feedback
- Submit for Design Head approval

#### Stage 4: UI Generation (Designer + UX Writer)
- Generate persona-specific UI variants
- Adapt design systems per persona
- Merge UI with content
- Create final prototypes

#### Stage 5: Code Export (Developer)
- Generate production-ready code
- Simulate MCP deployment
- Download complete codebase
- Deploy to production

### 4. Role-Based Permissions

- **PM**: Create projects, define PRDs, request approvals
- **PM Manager**: Approve/reject PRDs, provide feedback
- **Designer**: Conduct research, create wireframes, generate UIs
- **Design Head**: Approve design decisions, provide guidance
- **UX Writer**: Create content and microcopy
- **Developer**: Review prototypes, generate code, simulate deployment

## 🔧 API Endpoints

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Research
- `POST /api/research/plan` - Create research plan
- `POST /api/research/run` - Run AI research
- `POST /api/research/insights` - Generate insights

### Design
- `POST /api/design/wireframes` - Generate wireframes
- `POST /api/design/flows` - Create user flows
- `POST /api/design/annotate` - Add annotations

### UI Generation
- `POST /api/ui-generation/variants` - Generate UI variants
- `POST /api/ui-generation/adapt-design-system` - Adapt design system
- `POST /api/ui-generation/merge` - Merge UI with content

### Code Export
- `POST /api/code-export/generate` - Generate production code
- `POST /api/code-export/simulate-mcp` - Simulate MCP deployment
- `GET /api/code-export/:id/download` - Download code

## 🔒 Security Features

- **File Access Restriction**: All file operations limited to project root
- **CORS Protection**: Restricted to localhost:3000
- **Rate Limiting**: 30 requests per minute for AI calls
- **Input Validation**: All inputs validated and sanitized
- **No OS Access**: No system-level operations allowed

## 🎨 Design System

### Colors
- Primary: Blue (#3B82F6)
- Success: Green (#10B981)
- Warning: Yellow (#F59E0B)
- Error: Red (#EF4444)
- Gray Scale: 50-900

### Typography
- Font Family: Inter
- Headings: 24px, 20px, 18px
- Body: 16px, 14px
- Caption: 12px

### Components
- Cards: Rounded corners (12px), subtle shadows
- Buttons: Primary, secondary, outline variants
- Forms: Consistent input styling with focus states
- Modals: Centered with backdrop blur

## 🚀 Innovative Features

### AI Feedback Simulator
- Suggests improvements during approvals
- Provides accessibility recommendations
- Identifies usability issues

### Persona Design System Adapter
- Automatically modifies design tokens per persona
- Adjusts complexity and interaction patterns
- Maintains brand consistency

### Virtual Lab Preview
- Interactive simulation of research setups
- Preview before running AI agents
- Adjust parameters in real-time

### Cross-Stage Impact Analyzer
- Shows how changes affect downstream stages
- Estimates timeline impact
- Provides risk assessment

## 🐛 Troubleshooting

### Common Issues

1. **OpenAI API Errors**
   - Verify API key in .env file
   - Check API key permissions
   - Ensure sufficient credits

2. **Port Conflicts**
   - Frontend: Change port in vite.config.ts
   - Backend: Change PORT in .env

3. **File Permission Errors**
   - Ensure write permissions to exports directory
   - Check project root path configuration

4. **Build Errors**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility
   - Verify TypeScript configuration

### Debug Mode

```bash
# Enable debug logging
DEBUG=processcraft:* npm run dev

# Check server logs
cd backend && npm run dev

# Check frontend logs
cd frontend && npm run dev
```

## 📊 Performance

- **Frontend**: Vite provides fast HMR and builds
- **Backend**: Express with optimized middleware
- **AI Calls**: Rate limited and cached where possible
- **File I/O**: Asynchronous operations with error handling

## 🔮 Future Enhancements

- [ ] Real-time collaboration
- [ ] Advanced AI models (GPT-5)
- [ ] Integration with design tools (Figma API)
- [ ] Advanced analytics and reporting
- [ ] Multi-language support
- [ ] Cloud deployment options
- [ ] Advanced version control
- [ ] Team management features

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation

---

**ProcessCraft POC** - Transforming UX design workflows with AI intelligence.
