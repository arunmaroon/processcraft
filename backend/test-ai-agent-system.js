/**
 * Test script for the AI Agent System
 * This demonstrates how to use the persona generation and agent system
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3001/api/ai-agent-system';

// Sample research transcript
const sampleTranscript = `
R: My name is Abdul Yasser, my age is 24, currently I'm doing Stock Market Trading. I'm from Mumbai, Maharashtra. I have completed my graduation in B.Com and I'm currently working as a stock market trader.

R: I prefer using UPI for payments because it's convenient and fast. I don't trust apps that ask for too many permissions. I usually check reviews before downloading any financial app.

R: I'm looking for a loan app that can give me quick approval for small amounts like 10,000 to 50,000 rupees. I need it for trading purposes sometimes when I need quick capital.

R: I don't like apps that have complex interfaces. I want something simple where I can just enter the amount and get the money quickly. The interest rates should be reasonable.

R: I'm comfortable with digital processes but I want to make sure my data is secure. I usually read the privacy policy before using any financial service.
`;

async function testPersonaGeneration() {
  console.log('🧪 Testing Persona Generation...');
  
  try {
    const response = await axios.post(`${API_BASE}/personas/generate`, {
      transcripts: [sampleTranscript],
      filename: 'test_personas'
    });
    
    console.log('✅ Persona generated successfully!');
    console.log('Persona:', JSON.stringify(response.data.personas[0], null, 2));
    
    return response.data.personas[0];
  } catch (error) {
    console.error('❌ Error generating persona:', error.response?.data || error.message);
    throw error;
  }
}

async function testAgentCreation(persona) {
  console.log('\n🤖 Testing Agent Creation...');
  
  try {
    const response = await axios.post(`${API_BASE}/agents/create`, {
      persona: persona
    });
    
    console.log('✅ Agent created successfully!');
    console.log('Agent Name:', response.data.agentName);
    
    return response.data.agentName;
  } catch (error) {
    console.error('❌ Error creating agent:', error.response?.data || error.message);
    throw error;
  }
}

async function testAgentResponse(agentName) {
  console.log('\n💬 Testing Agent Response...');
  
  const testQuestions = [
    "How do you prefer to make payments?",
    "What do you look for in a loan app?",
    "What's your biggest concern when using financial apps?",
    "Tell me about your trading experience."
  ];
  
  for (const question of testQuestions) {
    try {
      console.log(`\nQuestion: ${question}`);
      
      const response = await axios.post(`${API_BASE}/agents/${agentName}/chat`, {
        message: question,
        threadId: 'test_chat'
      });
      
      console.log(`Answer: ${response.data.response.content}`);
      console.log(`Confidence: ${(response.data.response.confidence * 100).toFixed(1)}%`);
      console.log(`Emotions: ${response.data.response.emotions?.join(', ') || 'None detected'}`);
      
    } catch (error) {
      console.error(`❌ Error getting response for question "${question}":`, error.response?.data || error.message);
    }
  }
}

async function testDualAgentChat(agent1Name, agent2Name) {
  console.log('\n👥 Testing Dual Agent Chat...');
  
  try {
    const response = await axios.post(`${API_BASE}/agents/dual-chat`, {
      agent1Name: agent1Name,
      agent2Name: agent2Name,
      message: "What do you think about digital lending apps?",
      threadId: 'dual_test'
    });
    
    console.log('✅ Dual agent chat completed!');
    response.data.messages.forEach((message, index) => {
      console.log(`\n${message.agentName}: ${message.content}`);
    });
    
  } catch (error) {
    console.error('❌ Error in dual agent chat:', error.response?.data || error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting AI Agent System Tests...\n');
  
  try {
    // Test 1: Generate persona from transcript
    const persona = await testPersonaGeneration();
    
    // Test 2: Create agent from persona
    const agentName = await testAgentCreation(persona);
    
    // Test 3: Test agent responses
    await testAgentResponse(agentName);
    
    // Test 4: Create a second agent for dual chat
    const persona2 = {
      ...persona,
      name: 'Raghu Kumar',
      demographics: {
        ...persona.demographics,
        age: 35,
        occupation: 'Pet Shop Owner'
      },
      character_behavior: {
        ...persona.character_behavior,
        speech_style: 'More cautious and traditional',
        personality_traits: ['conservative', 'risk-averse', 'traditional']
      },
      financial_attitudes: {
        ...persona.financial_attitudes,
        risk_tolerance: 'LOW',
        investment_style: 'Very conservative, prefers traditional banking'
      }
    };
    
    const agent2Name = await testAgentCreation(persona2);
    
    // Test 5: Dual agent chat
    await testDualAgentChat(agentName, agent2Name);
    
    console.log('\n🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('\n💥 Test suite failed:', error.message);
    process.exit(1);
  }
}

// Run the tests
runTests();




