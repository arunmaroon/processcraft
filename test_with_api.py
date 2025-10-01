#!/usr/bin/env python3
"""
Test script to run the discussion guide simulator with a real API key
This shows how to use the full AI-powered version
"""

import os
import asyncio
import sys

# Add the current directory to Python path
sys.path.append('.')

async def test_with_api():
    """Test the simulator with API key"""
    
    # Check for API key
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        print("❌ No OpenAI API key found!")
        print("Set your API key: export OPENAI_API_KEY='your-key-here'")
        return
    
    print("🚀 Testing Discussion Guide Simulator with OpenAI API")
    print("=" * 60)
    
    try:
        # Import the main simulator
        from discussion_guide_simulator import DiscussionGuideSimulator
        
        # Create simulator
        simulator = DiscussionGuideSimulator(api_key)
        
        # Run a quick test with 2 sessions
        print("Running simulation with 2 sessions...")
        results = await simulator.run_simulation(num_sessions=2)
        
        print(f"\n✅ Simulation completed!")
        print(f"📊 Sessions: {len(results['sessions'])}")
        print(f"💡 Total insights: {sum(len(s['insights']) for s in results['sessions'])}")
        
        # Show sample insights
        print(f"\n🎯 Sample Insights:")
        for i, session in enumerate(results['sessions'], 1):
            print(f"\nSession {i} ({session['participant'].name}):")
            for insight in session['insights'][:2]:  # Show first 2 insights
                print(f"  • {insight}")
        
        print(f"\n💾 Full results saved to markdown file")
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("Make sure you have installed the requirements:")
        print("pip install -r requirements.txt")
    except Exception as e:
        print(f"❌ Error: {e}")
        print("Check your API key and try again")

if __name__ == "__main__":
    asyncio.run(test_with_api())







