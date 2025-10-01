#!/usr/bin/env python3
"""
Discussion Guide Simulator using LangChain
Simulates user research interviews with AI moderators and participants
"""

import os
import json
import asyncio
from datetime import datetime
from typing import List, Dict, Any
from dataclasses import dataclass
from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage, SystemMessage
from langchain.prompts import ChatPromptTemplate
from langchain.chains import LLMChain
import argparse

@dataclass
class Participant:
    name: str
    age: int
    background: str
    experience_level: str
    pain_points: List[str]
    goals: List[str]

@dataclass
class DiscussionGuide:
    title: str
    introduction: str
    sections: List[Dict[str, Any]]
    objectives: List[str]

class DiscussionGuideSimulator:
    def __init__(self, openai_api_key: str):
        self.llm = ChatOpenAI(
            model="gpt-4",
            temperature=0.7,
            openai_api_key=openai_api_key
        )
        self.moderator_prompt = self._create_moderator_prompt()
        self.participant_prompt = self._create_participant_prompt()
        
    def _create_moderator_prompt(self) -> str:
        return """You are an expert UX researcher conducting a user interview. 
        Your role is to:
        1. Follow the discussion guide systematically
        2. Ask follow-up questions to get deeper insights
        3. Probe for specific examples and stories
        4. Keep the conversation natural and engaging
        5. Ensure all research objectives are covered
        
        Be professional, empathetic, and curious. Ask open-ended questions and listen actively."""
    
    def _create_participant_prompt(self) -> str:
        return """You are a real user participating in a research interview. 
        Based on your persona, respond naturally and authentically to the moderator's questions.
        Share personal experiences, frustrations, and preferences. Be specific with examples.
        Don't be overly positive - share real challenges and pain points you face."""
    
    def create_sample_participants(self) -> List[Participant]:
        """Create diverse participant personas for simulation"""
        return [
            Participant(
                name="Sarah Chen",
                age=28,
                background="Marketing Manager at a tech startup",
                experience_level="Novice",
                pain_points=["Complex forms", "Too many steps", "Unclear instructions"],
                goals=["Quick signup", "Easy navigation", "Clear benefits"]
            ),
            Participant(
                name="Michael Rodriguez",
                age=35,
                background="Financial advisor with 8 years experience",
                experience_level="Expert",
                pain_points=["Poor mobile experience", "Lack of advanced features"],
                goals=["Efficiency", "Professional tools", "Data security"]
            ),
            Participant(
                name="Emma Thompson",
                age=42,
                background="Small business owner",
                experience_level="Intermediate",
                pain_points=["Time constraints", "Technical complexity"],
                goals=["Time saving", "Reliability", "Customer support"]
            ),
            Participant(
                name="David Kim",
                age=31,
                background="Software engineer",
                experience_level="Expert",
                pain_points=["Poor UX design", "Inconsistent interfaces"],
                goals=["Intuitive design", "Fast performance", "Modern interface"]
            ),
            Participant(
                name="Lisa Johnson",
                age=26,
                background="Recent college graduate, first job",
                experience_level="Novice",
                pain_points=["Overwhelming options", "Financial jargon"],
                goals=["Learning", "Guidance", "Simple processes"]
            )
        ]
    
    def create_sample_discussion_guide(self) -> DiscussionGuide:
        """Create a comprehensive discussion guide for fintech signup form research"""
        return DiscussionGuide(
            title="Fintech Signup Form Usability Research",
            introduction="This research aims to understand user experiences with fintech signup forms and identify opportunities to improve completion rates by 25%.",
            objectives=[
                "Understand current signup pain points",
                "Identify key decision factors",
                "Test form usability and flow",
                "Validate target user needs",
                "Gather improvement recommendations"
            ],
            sections=[
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
                        "What information were you comfortable sharing vs. hesitant about?",
                        "How did you verify your identity during signup?"
                    ]
                },
                {
                    "name": "Pain Points & Challenges",
                    "duration": "10 minutes",
                    "questions": [
                        "What typically makes you abandon a signup process?",
                        "What security concerns do you have when signing up for financial services?",
                        "How do you prefer to receive verification codes or confirmations?",
                        "What would make you trust a new fintech service more?"
                    ]
                },
                {
                    "name": "Ideal Experience",
                    "duration": "10 minutes",
                    "questions": [
                        "If you could design the perfect signup experience, what would it look like?",
                        "What information would you want to see upfront before starting signup?",
                        "How would you prefer to complete identity verification?",
                        "What would make you feel confident about completing the signup?"
                    ]
                },
                {
                    "name": "Wrap-up",
                    "duration": "5 minutes",
                    "questions": [
                        "Is there anything else about signup experiences you'd like to share?",
                        "What questions do you have about our research?",
                        "Would you be interested in participating in future research?"
                    ]
                }
            ]
        )
    
    async def simulate_interview(self, participant: Participant, guide: DiscussionGuide) -> Dict[str, Any]:
        """Simulate a complete interview session"""
        print(f"\n{'='*60}")
        print(f"INTERVIEW SESSION: {participant.name}")
        print(f"Background: {participant.background} ({participant.experience_level})")
        print(f"{'='*60}\n")
        
        conversation_log = []
        insights = []
        
        # Set up participant context
        participant_context = f"""
        Name: {participant.name}
        Age: {participant.age}
        Background: {participant.background}
        Experience Level: {participant.experience_level}
        Pain Points: {', '.join(participant.pain_points)}
        Goals: {', '.join(participant.goals)}
        """
        
        for section in guide.sections:
            print(f"\n📋 SECTION: {section['name']} ({section['duration']})")
            print("-" * 50)
            
            section_insights = []
            
            for question in section['questions']:
                # Moderator asks question
                moderator_message = f"Moderator: {question}"
                print(f"\n🔍 {moderator_message}")
                conversation_log.append(moderator_message)
                
                # Generate participant response
                response = await self._generate_participant_response(
                    question, participant_context, section['name']
                )
                
                participant_message = f"Participant: {response}"
                print(f"👤 {participant_message}")
                conversation_log.append(participant_message)
                
                # Generate follow-up if needed
                follow_up = await self._generate_follow_up(question, response, section['name'])
                if follow_up:
                    follow_up_message = f"Moderator: {follow_up}"
                    print(f"🔍 {follow_up_message}")
                    conversation_log.append(follow_up_message)
                    
                    follow_up_response = await self._generate_participant_response(
                        follow_up, participant_context, section['name']
                    )
                    follow_up_participant_message = f"Participant: {follow_up_response}"
                    print(f"👤 {follow_up_participant_message}")
                    conversation_log.append(follow_up_participant_message)
                
                # Extract insights from this exchange
                insight = await self._extract_insight(question, response, participant)
                if insight:
                    section_insights.append(insight)
                    print(f"💡 Insight: {insight}")
            
            insights.extend(section_insights)
        
        return {
            "participant": participant,
            "conversation_log": conversation_log,
            "insights": insights,
            "session_summary": await self._generate_session_summary(participant, insights)
        }
    
    async def _generate_participant_response(self, question: str, context: str, section: str) -> str:
        """Generate realistic participant response using LLM"""
        prompt = f"""
        {self.participant_prompt}
        
        Context: {context}
        Current Section: {section}
        
        Question: {question}
        
        Respond as this participant would, based on their background and experience level.
        Be authentic, specific, and share personal examples. Keep responses conversational but detailed.
        """
        
        messages = [
            SystemMessage(content=prompt),
            HumanMessage(content=question)
        ]
        
        response = await self.llm.ainvoke(messages)
        return response.content.strip()
    
    async def _generate_follow_up(self, original_question: str, response: str, section: str) -> str:
        """Generate relevant follow-up questions"""
        prompt = f"""
        As a UX researcher, generate a relevant follow-up question based on:
        
        Original Question: {original_question}
        Participant Response: {response}
        Section: {section}
        
        Generate a follow-up that:
        - Probes deeper into the response
        - Asks for specific examples
        - Explores underlying motivations
        - Stays relevant to the research objectives
        
        If no follow-up is needed, respond with "NONE"
        """
        
        messages = [
            SystemMessage(content=prompt),
            HumanMessage(content=f"Original: {original_question}\nResponse: {response}")
        ]
        
        response = await self.llm.ainvoke(messages)
        follow_up = response.content.strip()
        
        return None if follow_up == "NONE" else follow_up
    
    async def _extract_insight(self, question: str, response: str, participant: Participant) -> str:
        """Extract key insights from the conversation"""
        prompt = f"""
        Extract a key insight from this research exchange:
        
        Question: {question}
        Response: {response}
        Participant: {participant.name} ({participant.experience_level})
        
        Focus on insights that relate to:
        - User pain points
        - Behavioral patterns
        - Design implications
        - Business opportunities
        
        Provide a concise, actionable insight.
        """
        
        messages = [
            SystemMessage(content=prompt),
            HumanMessage(content=f"Q: {question}\nA: {response}")
        ]
        
        response = await self.llm.ainvoke(messages)
        return response.content.strip()
    
    async def _generate_session_summary(self, participant: Participant, insights: List[str]) -> str:
        """Generate a summary of the interview session"""
        prompt = f"""
        Summarize this research session:
        
        Participant: {participant.name} ({participant.experience_level})
        Background: {participant.background}
        
        Key Insights:
        {chr(10).join(f"- {insight}" for insight in insights)}
        
        Provide a 2-3 paragraph summary highlighting:
        - Main themes and patterns
        - Key pain points identified
        - Design implications
        - Participant's unique perspective
        """
        
        messages = [
            SystemMessage(content=prompt),
            HumanMessage(content="Generate session summary")
        ]
        
        response = await self.llm.ainvoke(messages)
        return response.content.strip()
    
    async def run_simulation(self, num_sessions: int = 3) -> Dict[str, Any]:
        """Run the complete simulation"""
        print("🚀 Starting Discussion Guide Simulation")
        print("=" * 60)
        
        # Create participants and guide
        participants = self.create_sample_participants()
        guide = self.create_sample_discussion_guide()
        
        # Select participants for simulation
        selected_participants = participants[:num_sessions]
        
        # Run interviews
        sessions = []
        for participant in selected_participants:
            session = await self.simulate_interview(participant, guide)
            sessions.append(session)
        
        # Generate overall insights
        all_insights = []
        for session in sessions:
            all_insights.extend(session['insights'])
        
        overall_insights = await self._generate_overall_insights(all_insights, guide)
        
        return {
            "guide": guide,
            "sessions": sessions,
            "overall_insights": overall_insights,
            "generated_at": datetime.now().isoformat()
        }
    
    async def _generate_overall_insights(self, insights: List[str], guide: DiscussionGuide) -> str:
        """Generate overall insights from all sessions"""
        prompt = f"""
        Analyze these research insights from multiple interview sessions:
        
        Research Objectives: {', '.join(guide.objectives)}
        
        All Insights:
        {chr(10).join(f"- {insight}" for insight in insights)}
        
        Provide a comprehensive analysis including:
        1. Key themes and patterns across participants
        2. Priority pain points and opportunities
        3. Design recommendations
        4. Business implications
        5. Next steps for the research team
        
        Format as a detailed research report.
        """
        
        messages = [
            SystemMessage(content=prompt),
            HumanMessage(content="Generate overall insights report")
        ]
        
        response = await self.llm.ainvoke(messages)
        return response.content.strip()

def save_results(results: Dict[str, Any], filename: str = None):
    """Save simulation results to file"""
    if not filename:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"discussion_guide_simulation_{timestamp}.md"
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write("# Discussion Guide Simulation Results\n\n")
        f.write(f"Generated: {results['generated_at']}\n\n")
        
        # Guide overview
        f.write("## Research Guide Overview\n\n")
        f.write(f"**Title:** {results['guide'].title}\n\n")
        f.write(f"**Introduction:** {results['guide'].introduction}\n\n")
        f.write("**Objectives:**\n")
        for obj in results['guide'].objectives:
            f.write(f"- {obj}\n")
        f.write("\n")
        
        # Individual sessions
        f.write("## Interview Sessions\n\n")
        for i, session in enumerate(results['sessions'], 1):
            f.write(f"### Session {i}: {session['participant'].name}\n\n")
            f.write(f"**Background:** {session['participant'].background}\n")
            f.write(f"**Experience Level:** {session['participant'].experience_level}\n\n")
            
            f.write("**Conversation:**\n")
            for message in session['conversation_log']:
                f.write(f"{message}\n")
            f.write("\n")
            
            f.write("**Key Insights:**\n")
            for insight in session['insights']:
                f.write(f"- {insight}\n")
            f.write("\n")
            
            f.write("**Session Summary:**\n")
            f.write(f"{session['session_summary']}\n\n")
            f.write("---\n\n")
        
        # Overall insights
        f.write("## Overall Research Insights\n\n")
        f.write(results['overall_insights'])
    
    print(f"\n💾 Results saved to: {filename}")

async def main():
    """Main execution function"""
    parser = argparse.ArgumentParser(description='Simulate Discussion Guide Interviews')
    parser.add_argument('--sessions', type=int, default=3, help='Number of interview sessions to simulate')
    parser.add_argument('--api-key', type=str, help='OpenAI API key (or set OPENAI_API_KEY env var)')
    parser.add_argument('--output', type=str, help='Output filename for results')
    
    args = parser.parse_args()
    
    # Get API key
    api_key = args.api_key or os.getenv('OPENAI_API_KEY')
    if not api_key:
        print("❌ Error: OpenAI API key required. Set OPENAI_API_KEY env var or use --api-key")
        return
    
    # Run simulation
    simulator = DiscussionGuideSimulator(api_key)
    results = await simulator.run_simulation(args.sessions)
    
    # Save results
    save_results(results, args.output)
    
    print(f"\n✅ Simulation complete! {args.sessions} sessions simulated.")
    print("📊 Check the generated markdown file for detailed results.")

if __name__ == "__main__":
    asyncio.run(main())







