#!/usr/bin/env python3
"""
Quick demo of the Discussion Guide Simulator
This runs a simplified version without requiring API keys
"""

import asyncio
import json
from datetime import datetime

class MockLLM:
    """Mock LLM for demo purposes"""
    
    async def ainvoke(self, messages):
        class MockResponse:
            def __init__(self, content):
                self.content = content
        
        # Extract the last human message
        human_message = messages[-1].content if messages else "Hello"
        
        # Generate mock responses based on context
        if "moderator" in str(messages[0].content).lower():
            return MockResponse("I understand. Can you tell me more about that specific experience?")
        elif "participant" in str(messages[0].content).lower():
            if "signup" in human_message.lower():
                return MockResponse("The last time I signed up for a fintech app, it was really frustrating. I had to enter my social security number three times because the form kept timing out. I almost gave up, but my friend recommended the app so I stuck with it.")
            elif "pain" in human_message.lower():
                return MockResponse("I hate when they ask for too much personal information upfront. I want to see what the app can do before I give them my bank account details. Also, the verification process is always confusing.")
            elif "ideal" in human_message.lower():
                return MockResponse("My ideal signup would be super simple - just email and password to start, then gradually ask for more info as I use the app. I'd want clear progress indicators and explanations for why they need each piece of information.")
            else:
                return MockResponse("That's an interesting question. Let me think about my experience with that...")
        elif "insight" in str(messages[0].content).lower():
            return MockResponse("Key insight: Users prefer progressive disclosure over upfront data collection, with clear explanations of why information is needed.")
        elif "summary" in str(messages[0].content).lower():
            return MockResponse("This participant showed strong preference for gradual onboarding with clear value communication before requesting sensitive information.")
        else:
            return MockResponse("I'd like to know more about your specific experience with that.")

class DemoSimulator:
    def __init__(self):
        self.llm = MockLLM()
        
    def create_sample_participants(self):
        return [
            {
                "name": "Sarah Chen",
                "age": 28,
                "background": "Marketing Manager at a tech startup",
                "experience_level": "Novice",
                "pain_points": ["Complex forms", "Too many steps", "Unclear instructions"],
                "goals": ["Quick signup", "Easy navigation", "Clear benefits"]
            },
            {
                "name": "Michael Rodriguez", 
                "age": 35,
                "background": "Financial advisor with 8 years experience",
                "experience_level": "Expert",
                "pain_points": ["Poor mobile experience", "Lack of advanced features"],
                "goals": ["Efficiency", "Professional tools", "Data security"]
            },
            {
                "name": "Emma Thompson",
                "age": 42,
                "background": "Small business owner",
                "experience_level": "Intermediate", 
                "pain_points": ["Time constraints", "Technical complexity"],
                "goals": ["Time saving", "Reliability", "Customer support"]
            }
        ]
    
    def create_sample_guide(self):
        return {
            "title": "Fintech Signup Form Usability Research",
            "introduction": "This research aims to understand user experiences with fintech signup forms and identify opportunities to improve completion rates by 25%.",
            "objectives": [
                "Understand current signup pain points",
                "Identify key decision factors", 
                "Test form usability and flow",
                "Validate target user needs",
                "Gather improvement recommendations"
            ],
            "sections": [
                {
                    "name": "Introduction & Warm-up",
                    "duration": "5 minutes",
                    "questions": [
                        "Tell me about yourself and your current financial management approach.",
                        "What fintech apps or services do you currently use?",
                        "How do you typically research and choose new financial products?"
                    ]
                },
                {
                    "name": "Current Experience",
                    "duration": "15 minutes",
                    "questions": [
                        "Walk me through the last time you signed up for a new financial service.",
                        "What was the most frustrating part of that signup process?",
                        "What information were you comfortable sharing vs. hesitant about?"
                    ]
                },
                {
                    "name": "Pain Points & Challenges", 
                    "duration": "10 minutes",
                    "questions": [
                        "What typically makes you abandon a signup process?",
                        "What security concerns do you have when signing up for financial services?",
                        "What would make you trust a new fintech service more?"
                    ]
                },
                {
                    "name": "Ideal Experience",
                    "duration": "10 minutes", 
                    "questions": [
                        "If you could design the perfect signup experience, what would it look like?",
                        "What information would you want to see upfront before starting signup?",
                        "What would make you feel confident about completing the signup?"
                    ]
                }
            ]
        }
    
    async def simulate_interview(self, participant, guide):
        print(f"\n{'='*60}")
        print(f"INTERVIEW SESSION: {participant['name']}")
        print(f"Background: {participant['background']} ({participant['experience_level']})")
        print(f"{'='*60}\n")
        
        conversation_log = []
        insights = []
        
        for section in guide['sections']:
            print(f"\n📋 SECTION: {section['name']} ({section['duration']})")
            print("-" * 50)
            
            for question in section['questions']:
                # Moderator asks question
                moderator_message = f"Moderator: {question}"
                print(f"\n🔍 {moderator_message}")
                conversation_log.append(moderator_message)
                
                # Generate participant response
                response = await self.llm.ainvoke([
                    type('Message', (), {'content': f"You are {participant['name']}, a {participant['experience_level']} user. {question}"})()
                ])
                
                participant_message = f"Participant: {response.content}"
                print(f"👤 {participant_message}")
                conversation_log.append(participant_message)
                
                # Generate insight
                insight = await self.llm.ainvoke([
                    type('Message', (), {'content': f"Extract insight from: {question} -> {response.content}"})()
                ])
                insights.append(insight.content)
                print(f"💡 Insight: {insight.content}")
        
        return {
            "participant": participant,
            "conversation_log": conversation_log,
            "insights": insights
        }
    
    async def run_demo(self):
        print("🚀 Discussion Guide Simulator Demo")
        print("=" * 60)
        print("This is a simplified demo using mock responses.")
        print("For full AI simulation, use the main script with OpenAI API key.\n")
        
        participants = self.create_sample_participants()
        guide = self.create_sample_guide()
        
        print(f"📋 Research Guide: {guide['title']}")
        print(f"🎯 Objectives: {', '.join(guide['objectives'])}")
        print(f"👥 Participants: {len(participants)}")
        print(f"📊 Sections: {len(guide['sections'])}")
        
        sessions = []
        for participant in participants:
            session = await self.simulate_interview(participant, guide)
            sessions.append(session)
        
        # Generate summary
        print(f"\n{'='*60}")
        print("📊 SIMULATION SUMMARY")
        print(f"{'='*60}")
        
        all_insights = []
        for session in sessions:
            all_insights.extend(session['insights'])
        
        print(f"\n✅ Completed {len(sessions)} interview sessions")
        print(f"💡 Generated {len(all_insights)} insights")
        print(f"📝 Total conversation length: {sum(len(s['conversation_log']) for s in sessions)} exchanges")
        
        print(f"\n🎯 Key Research Findings:")
        for i, insight in enumerate(all_insights[:5], 1):
            print(f"{i}. {insight}")
        
        print(f"\n📋 Next Steps:")
        print("1. Analyze patterns across all sessions")
        print("2. Prioritize pain points by frequency and impact")
        print("3. Design solutions based on user feedback")
        print("4. Create prototype improvements")
        print("5. Test with real users")
        
        return {
            "guide": guide,
            "sessions": sessions,
            "total_insights": len(all_insights),
            "generated_at": datetime.now().isoformat()
        }

async def main():
    simulator = DemoSimulator()
    results = await simulator.run_demo()
    
    print(f"\n💾 Demo completed at {results['generated_at']}")
    print("🚀 To run with real AI, use: python discussion_guide_simulator.py --api-key YOUR_KEY")

if __name__ == "__main__":
    asyncio.run(main())



















