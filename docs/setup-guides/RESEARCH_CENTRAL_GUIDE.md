# 🧠 Research Central - AI User Research Setup System

## Overview
Research Central is an integrated admin system that allows you to set up AI-powered user research by uploading past research data, synthesizing insights, and creating AI agents that mimic real users. This system is designed to work seamlessly with ProcessCraft's main dashboard.

## 🚀 Quick Start

### 1. Access Research Central
- **From Main Dashboard**: Click "Research Central Admin" in the sidebar
- **Direct URL**: http://localhost:3000/admin/login
- **Admin Passcode**: `admin123` (demo)

### 2. Complete Setup Workflow
1. **Upload Data** → Upload past research files (CSV, JSON, PDF, TXT)
2. **Synthesize Insights** → AI analyzes data and generates insights
3. **Organize Configs** → Set up personas, demographics, and cohorts
4. **Map Products** → Link products to specific configurations
5. **Build Agents** → Create AI agents that mimic real users
6. **Check Bias** → Ensure ethical and unbiased research data
7. **Preview Agents** → Test agents with chat interface

## 🎯 Key Features

### 📊 Data Upload & Processing
- **Supported Formats**: CSV, JSON, PDF, TXT, XLSX
- **File Size Limit**: 10MB per file
- **Secure Storage**: Files stored in `/data/training/`
- **AI Processing**: Automatic content analysis and extraction

### 🧠 AI Insight Synthesis
- **GPT-4 Powered**: Uses OpenAI for intelligent analysis
- **Categorization**: Usability, Security, Performance, Behavior, Preference
- **Confidence Scoring**: Each insight includes confidence level
- **Evidence Tracking**: Links insights to source data

### 👥 Configuration Management
- **Personas**: Detailed user profiles with goals, pain points, behaviors
- **Demographics**: Age, gender, location, income, education
- **Cohorts**: Research groups with specific characteristics
- **Visual Editor**: Easy-to-use forms for all configurations

### 🤖 AI Agent Builder
- **Personality Sliders**: Fine-tune communication style, response length, emotional tone
- **Realistic Mimicry**: Agents respond like real users based on research data
- **Testing Interface**: Chat with agents to verify behavior
- **Accuracy Metrics**: Track how well agents mimic real users

### 🛡️ Ethical Bias Detection
- **Automated Scanning**: AI checks for gender, race, age, income biases
- **Severity Levels**: Critical, High, Medium, Low
- **Actionable Suggestions**: Specific recommendations for bias mitigation
- **Compliance Ready**: Helps ensure ethical research practices

## 📁 Data Structure

```
processcraft-poc/
├── data/
│   ├── training/                      # Uploaded research files
│   │   ├── user-research-q1-2024.csv
│   │   ├── survey-responses.json
│   │   └── interview-transcripts.pdf
│   └── research-central/              # Centralized outputs
│       ├── insights.json              # AI-generated insights
│       ├── personas.json              # User personas
│       ├── demographics.json          # Demographic profiles
│       ├── cohorts.json               # Research cohorts
│       ├── mappings.json              # Product-to-config mappings
│       ├── agents.json                # AI agent models
│       └── bias-issues.json           # Bias detection results
```

## 🔧 Technical Implementation

### Frontend Components
- **AdminLogin.tsx**: Passcode authentication
- **ResearchCentralDashboard.tsx**: Main admin interface
- **DataUploader.tsx**: File upload with drag-and-drop
- **InsightSynthesizer.tsx**: AI-powered insight generation
- **ConfigOrganizer.tsx**: Personas, demographics, cohorts management
- **ProductMapper.tsx**: Product-to-configuration mapping
- **AgentBuilder.tsx**: AI agent creation and testing
- **BiasChecker.tsx**: Ethical bias detection
- **AgentPreview.tsx**: Chat interface for agent testing

### Backend Services
- **admin-research.ts**: API routes for all admin functions
- **adminResearchService.ts**: Core business logic and AI integration
- **File Processing**: Multer for secure file uploads
- **AI Integration**: OpenAI GPT-4 for synthesis and agent building
- **Data Persistence**: JSON files for configuration storage

### API Endpoints
```
POST /api/admin-research/login          # Admin authentication
POST /api/admin-research/upload         # File upload
POST /api/admin-research/synthesize     # AI insight generation
POST /api/admin-research/organize-configs # Save configurations
POST /api/admin-research/map-products   # Save product mappings
POST /api/admin-research/build-agents   # Create AI agents
POST /api/admin-research/check-bias     # Bias detection
POST /api/admin-research/preview-agent  # Agent chat testing
GET  /api/research-central              # Shared data access
```

## 🎨 User Interface

### Design Philosophy
- **Airbnb-Style**: Clean, modern, user-friendly interface
- **Card-Based Layout**: Easy navigation and visual organization
- **Progressive Disclosure**: Show information as needed
- **Responsive Design**: Works on desktop and mobile

### Key UI Elements
- **Grid Dashboard**: Overview cards with metrics and status
- **Tabbed Navigation**: Easy switching between functions
- **Drag-and-Drop**: Intuitive file uploads
- **Real-Time Feedback**: Progress bars and status indicators
- **Chat Interface**: Natural agent testing experience

## 🔒 Security & Privacy

### Data Protection
- **Localhost Only**: No external access, runs on localhost:3000
- **File Isolation**: All operations confined to project root
- **No OS Access**: Cannot access core system files
- **Secure Uploads**: File type validation and size limits

### Authentication
- **Passcode Protection**: Simple but effective admin access
- **Session Management**: Token-based authentication
- **Role Separation**: Admin vs. regular user access

## 🚀 Usage Workflow

### Step 1: Upload Research Data
1. Go to "Data Upload" tab
2. Drag and drop research files or click to browse
3. Supported formats: CSV, JSON, PDF, TXT, XLSX
4. Files are automatically processed and stored

### Step 2: Generate AI Insights
1. Go to "Insight Synthesis" tab
2. Click "Start Synthesis" to analyze uploaded data
3. AI generates categorized insights with confidence scores
4. Review and organize insights by category

### Step 3: Organize Configurations
1. Go to "Config Organization" tab
2. Create personas with goals, pain points, and behaviors
3. Set up demographic profiles (age, gender, location, income)
4. Define research cohorts with specific characteristics

### Step 4: Map Products
1. Go to "Product Mapping" tab
2. Link each product to relevant personas, cohorts, and demographics
3. This determines which AI agents will be available for each product

### Step 5: Build AI Agents
1. Go to "Agent Builder" tab
2. Click "Build Agents" to create AI agents from configurations
3. Agents are automatically generated based on your data
4. Test agents using the preview interface

### Step 6: Check for Bias
1. Go to "Bias Checker" tab
2. Run bias analysis on your data and configurations
3. Review detected issues and implement suggestions
4. Ensure ethical and inclusive research practices

### Step 7: Test Agents
1. Go to "Agent Preview" tab
2. Select an agent and start chatting
3. Ask questions to see how agents respond
4. Verify that agents mimic real user behavior

## 🎯 Integration with ProcessCraft

### Shared Data Access
- **Central Repository**: All research data stored in `/data/research-central/`
- **Project Access**: Regular users can access shared personas and insights
- **Real-Time Updates**: Changes in admin system reflect in main dashboard
- **Cross-Project Sharing**: Agents and insights available across all projects

### Workflow Integration
- **Research Stage**: Use shared personas and insights for project research
- **Design Stage**: Apply demographic data and user preferences
- **Testing Stage**: Use AI agents for virtual user testing
- **Validation Stage**: Leverage bias-checked data for ethical design

## 🔧 Configuration

### Environment Variables
```bash
# Required
OPENAI_API_KEY=your_openai_api_key_here
ADMIN_PASSCODE=admin123

# Optional
PORT=3001
NODE_ENV=development
```

### File Permissions
- Ensure write access to `/data/` directory
- Backend needs access to create and modify JSON files
- Frontend needs access to upload files via API

## 🐛 Troubleshooting

### Common Issues
1. **Upload Fails**: Check file size (max 10MB) and format
2. **AI Synthesis Fails**: Verify OpenAI API key is valid
3. **Agents Not Building**: Ensure personas and mappings are configured
4. **Bias Check Fails**: Check that data files are properly formatted

### Debug Mode
- Check browser console for frontend errors
- Check backend logs for API errors
- Verify file permissions in `/data/` directory
- Test API endpoints directly with curl or Postman

## 🎉 Success Metrics

### System Health
- **Upload Success Rate**: 95%+ successful file uploads
- **AI Synthesis Time**: < 30 seconds for typical datasets
- **Agent Accuracy**: 85%+ realistic responses
- **Bias Detection**: 100% coverage of uploaded data

### User Experience
- **Setup Time**: Complete workflow in < 30 minutes
- **Ease of Use**: Intuitive interface requiring no training
- **Data Quality**: High-quality insights and realistic agents
- **Ethical Compliance**: Zero critical bias issues

## 🚀 Future Enhancements

### Planned Features
- **Advanced Analytics**: Detailed metrics and reporting
- **Custom AI Models**: Fine-tuned models for specific industries
- **Collaboration Tools**: Multi-admin access and permissions
- **Export Options**: Generate reports and documentation
- **API Integration**: Connect with external research tools

### Scalability
- **Database Integration**: Move from JSON to proper database
- **Cloud Storage**: Support for cloud file storage
- **Microservices**: Break down into smaller, scalable services
- **Real-Time Updates**: WebSocket support for live collaboration

---

**Research Central transforms how you conduct user research by making AI-powered virtual users available for testing and validation. Start with uploading your past research data and watch as AI creates realistic user personas that can participate in virtual research studies!** 🎨✨
