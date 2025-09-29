# 🤖 Discussion Guide Simulator

An AI-powered tool that simulates user research interviews using LangChain and OpenAI to test discussion guides before conducting real user research.

## 🎯 What It Does

- **Simulates realistic user interviews** with AI moderators and participants
- **Tests discussion guides** before real user research
- **Generates diverse personas** (novice, expert, intermediate users)
- **Extracts actionable insights** from simulated conversations
- **Creates comprehensive reports** with findings and recommendations

## 🚀 Quick Start

### Option 1: Demo (No API Key Required)
```bash
python3 demo_simulator.py
```

### Option 2: Full AI Simulation (Requires OpenAI API Key)
```bash
# Setup
chmod +x setup_simulator.sh
./setup_simulator.sh

# Set API key
export OPENAI_API_KEY="your-openai-api-key-here"

# Run simulation
python discussion_guide_simulator.py --sessions 5
```

## 📋 Features

### 🎭 Realistic Personas
- **Sarah Chen** (28, Marketing Manager) - Novice user
- **Michael Rodriguez** (35, Financial Advisor) - Expert user  
- **Emma Thompson** (42, Small Business Owner) - Intermediate user
- **David Kim** (31, Software Engineer) - Expert user
- **Lisa Johnson** (26, Recent Graduate) - Novice user

### 📊 Comprehensive Discussion Guide
- **Introduction & Warm-up** (5 min)
- **Current Experience Deep Dive** (15 min)
- **Pain Points & Challenges** (10 min)
- **Ideal Experience Vision** (10 min)
- **Specific Feature Testing** (10 min)
- **Wrap-up & Next Steps** (5 min)

### 🤖 AI-Powered Features
- **Smart Moderator**: Asks follow-up questions, probes deeper
- **Realistic Participants**: Respond based on persona and experience
- **Insight Extraction**: Automatically identifies key findings
- **Session Summaries**: Generates comprehensive reports
- **Pattern Analysis**: Finds themes across multiple sessions

## 📁 Files

- `discussion_guide_simulator.py` - Main AI simulation script
- `demo_simulator.py` - Quick demo without API key
- `sample_discussion_guide.md` - Example discussion guide
- `requirements.txt` - Python dependencies
- `setup_simulator.sh` - Setup script

## 🎯 Example Use Cases

### 1. Fintech Signup Form Research
```bash
python discussion_guide_simulator.py --sessions 5 --output fintech_research.md
```

### 2. E-commerce Checkout Flow
```bash
python discussion_guide_simulator.py --sessions 3 --output checkout_research.md
```

### 3. Mobile App Onboarding
```bash
python discussion_guide_simulator.py --sessions 4 --output onboarding_research.md
```

## 📊 Output Example

```markdown
# Discussion Guide Simulation Results

## Research Guide Overview
**Title:** Fintech Signup Form Usability Research
**Introduction:** This research aims to understand user experiences...

## Interview Sessions

### Session 1: Sarah Chen
**Background:** Marketing Manager at a tech startup (Novice)

**Conversation:**
Moderator: Walk me through the last time you signed up for a new financial service.
Participant: The last time I signed up for a fintech app, it was really frustrating. I had to enter my social security number three times because the form kept timing out...

**Key Insights:**
- Users prefer progressive disclosure over upfront data collection
- Form timeouts are a major abandonment factor
- Clear explanations build trust and confidence

## Overall Research Insights
1. **Progressive Disclosure**: Users want to see value before sharing sensitive data
2. **Security Communication**: Clear explanations of data usage build trust
3. **Technical Reliability**: Form stability is crucial for completion
4. **Mobile Experience**: Mobile-first design is essential
5. **Social Proof**: Recommendations from friends increase completion rates
```

## 🔧 Customization

### Adding New Personas
Edit `create_sample_participants()` in the simulator:

```python
Participant(
    name="Your Persona",
    age=30,
    background="Your background",
    experience_level="Novice/Intermediate/Expert",
    pain_points=["Pain point 1", "Pain point 2"],
    goals=["Goal 1", "Goal 2"]
)
```

### Modifying Discussion Guide
Edit `create_sample_discussion_guide()` or create your own:

```python
DiscussionGuide(
    title="Your Research Title",
    introduction="Your research goals...",
    objectives=["Objective 1", "Objective 2"],
    sections=[
        {
            "name": "Section Name",
            "duration": "10 minutes",
            "questions": ["Question 1", "Question 2"]
        }
    ]
)
```

## 🎯 Research Objectives Supported

- **Usability Testing**: Form flows, navigation, error handling
- **User Experience**: Pain points, preferences, expectations
- **Trust & Security**: Data sharing comfort, verification methods
- **Feature Validation**: New features, improvements, priorities
- **Market Research**: Competitive analysis, positioning

## 📈 Success Metrics

- **Completion Rate**: Target improvements (e.g., 25% increase)
- **Time to Complete**: Efficiency gains (e.g., 30% reduction)
- **User Satisfaction**: Rating improvements (e.g., 4.5+ stars)
- **Trust Score**: Confidence levels (e.g., 80%+ trust)
- **Abandonment Points**: Identify and address top issues

## 🚀 Advanced Usage

### Custom API Keys
```bash
python discussion_guide_simulator.py --api-key sk-your-key-here
```

### Multiple Sessions
```bash
python discussion_guide_simulator.py --sessions 10
```

### Custom Output
```bash
python discussion_guide_simulator.py --output my_research_2024.md
```

### Environment Variables
```bash
export OPENAI_API_KEY="your-key"
export SIMULATION_SESSIONS="5"
python discussion_guide_simulator.py
```

## 🔍 Troubleshooting

### Common Issues
1. **API Key Error**: Ensure OpenAI API key is set correctly
2. **Import Error**: Run `pip install -r requirements.txt`
3. **Permission Error**: Run `chmod +x *.py`

### Debug Mode
```bash
python discussion_guide_simulator.py --sessions 1 --debug
```

## 📚 Dependencies

- `langchain==0.1.0` - LLM framework
- `langchain-openai==0.0.5` - OpenAI integration
- `openai==1.3.0` - OpenAI API client
- `python-dotenv==1.0.0` - Environment variables

## 🎯 Best Practices

1. **Start with Demo**: Use `demo_simulator.py` to understand the flow
2. **Test with Few Sessions**: Start with 2-3 sessions before running more
3. **Customize Personas**: Match your target user segments
4. **Iterate on Questions**: Refine based on initial results
5. **Validate with Real Users**: Use simulation to prepare, not replace real research

## 📞 Support

For issues or questions:
1. Check the demo output first
2. Verify API key configuration
3. Review the sample discussion guide
4. Test with different session counts

---

**Happy Researching! 🎉**

This tool helps you validate discussion guides and generate insights before conducting real user research, saving time and improving research quality.




