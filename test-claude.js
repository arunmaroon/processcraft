const axios = require('axios');
require('dotenv').config();

// Disable SSL verification for testing
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

async function testClaude() {
  console.log('🧪 Testing Claude API...');
  console.log('API Key available:', process.env.CLAUDE_API_KEY ? 'YES' : 'NO');
  console.log('API Key preview:', process.env.CLAUDE_API_KEY ? `${process.env.CLAUDE_API_KEY.substring(0, 10)}...` : 'NOT SET');
  
  if (!process.env.CLAUDE_API_KEY) {
    console.log('❌ No Claude API key found');
    return;
  }

  try {
    const response = await axios.post('https://api.anthropic.com/v1/messages', {
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 100,
      temperature: 0.3,
      messages: [
        {
          role: "user",
          content: "Write a short test PRD for a mobile app called 'TestApp' that helps users track their daily habits."
        }
      ],
      system: "You are an expert Product Manager. Write a concise PRD."
    }, {
      headers: {
        'x-api-key': process.env.CLAUDE_API_KEY,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      timeout: 30000
    });

    console.log('✅ Claude API working!');
    console.log('Response preview:', response.data.content[0].text.substring(0, 200) + '...');
    
  } catch (error) {
    console.log('❌ Claude API error:', error.response?.data || error.message);
  }
}

testClaude();