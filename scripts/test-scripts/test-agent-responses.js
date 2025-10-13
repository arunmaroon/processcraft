// Test script to verify agent responses are unique and personality-driven
const testAgentResponses = async () => {
  console.log('🧪 Testing Agent Response Uniqueness...\n');

  const testMessage = "do you understand EMI";
  const personas = [
    { id: 'investor-agent', name: 'Sarah Chen' },
    { id: 'designer-agent', name: 'Priya Sharma' },
    { id: 'researcher-agent', name: 'Dr. Michael Rodriguez' },
    { id: 'pm-agent', name: 'Alex Thompson' }
  ];

  console.log(`📝 Test Message: "${testMessage}"\n`);

  for (const persona of personas) {
    try {
      console.log(`🤖 Testing ${persona.name} (${persona.id}):`);
      
      // Test the fallback response generation
      const fallbackResponse = generateFallbackResponse(testMessage, persona);
      console.log(`   Response: "${fallbackResponse}"`);
      console.log(`   Length: ${fallbackResponse.length} characters\n`);
      
    } catch (error) {
      console.error(`   ❌ Error testing ${persona.name}:`, error.message);
    }
  }

  console.log('✅ Test completed! Each persona should have unique responses.');
};

// Fallback response generation (copied from the component)
const generateFallbackResponse = (message, persona) => {
  const lowerMessage = message.toLowerCase();
  
  // Handle specific questions with human-like responses
  if (lowerMessage.includes('what') && lowerMessage.includes('name')) {
    return `Hi! I'm ${persona.name}. Nice to meet you! 😊`;
  }
  
  if (lowerMessage.includes('who are you') || lowerMessage.includes('tell me about yourself')) {
    const intros = {
      'investor-agent': `Hi there! I'm Sarah Chen, a venture capitalist with 8 years of experience in fintech investments. I'm passionate about finding innovative solutions that can scale globally. I'm from San Francisco and I love analyzing market trends and startup potential. What about you?`,
      'researcher-agent': `Hello! I'm Dr. Michael Rodriguez, a UX researcher specializing in financial behavior and user psychology. I've conducted over 200 user studies and love uncovering insights that drive better product decisions. I'm based in New York and I'm really passionate about understanding how people make financial decisions.`,
      'designer-agent': `Hey! I'm Priya Sharma, a senior UX designer with a focus on inclusive design and accessibility. I've worked on financial products for 6 years and believe good design can change lives. I'm from Mumbai and I love creating interfaces that are both beautiful and functional.`,
      'pm-agent': `Hi! I'm Alex Thompson, a product manager with experience in both B2B and B2C fintech products. I love bringing together user needs, business goals, and technical possibilities. I'm from Seattle and I'm always thinking about how to build products that people actually want to use.`
    };
    return intros[persona.id] || `Hi! I'm an AI agent designed to help with product development. Nice to meet you!`;
  }
  
  if (lowerMessage.includes('where are you from') || lowerMessage.includes('where do you live')) {
    const locations = {
      'investor-agent': `I'm from San Francisco! It's such an amazing place for startups and innovation. The energy here is incredible - there's always something exciting happening in tech. Have you been here?`,
      'researcher-agent': `I'm based in New York! I love the diversity and fast pace here. There are so many different types of people and businesses, which makes it perfect for user research. It's a great place to understand how different demographics interact with technology.`,
      'designer-agent': `I'm from Mumbai! It's a bustling city with so much creativity and innovation happening. The design scene here is really vibrant, and I love being part of the growing tech community. The energy is amazing!`,
      'pm-agent': `I'm from Seattle! It's a great place for tech companies, and I love being surrounded by so many innovative products and services. The coffee culture here is amazing too!`
    };
    return locations[persona.id] || `I'm from a tech hub! It's a great place to work in product development.`;
  }
  
  if (lowerMessage.includes('what do you do') || lowerMessage.includes('what\'s your job')) {
    const jobs = {
      'investor-agent': `I'm a venture capitalist! I help fund and guide early-stage startups, especially in fintech. I love meeting entrepreneurs and helping them scale their ideas. It's exciting to be part of building the next generation of financial products.`,
      'researcher-agent': `I'm a UX researcher! I study how people interact with financial products and services. I conduct interviews, surveys, and usability tests to understand user behavior. It's fascinating to uncover insights that help build better products.`,
      'designer-agent': `I'm a UX designer! I create user interfaces and experiences for financial products. I focus on making complex financial tools simple and accessible. I love the challenge of designing for different user needs and making technology more human.`,
      'pm-agent': `I'm a product manager! I work with teams to build and improve financial products. I balance user needs, business goals, and technical constraints. It's rewarding to see products I've helped build being used by real people.`
    };
    return jobs[persona.id] || `I work in product development! It's really interesting work.`;
  }

  // Enhanced persona-specific responses with more personality
  const responses = {
    'investor-agent': [
      `Hey! ${message} - that's really interesting! As an investor, I'm always looking for the next big opportunity. What's the market size you're targeting? I'd love to understand the competitive landscape better.`,
      `Hi there! ${message} - I love hearing about new ventures! From my experience in tech investments, the key question is always scalability. How do you plan to grow this beyond the initial market?`,
      `Hello! ${message} - that sounds promising! I'm curious about your user acquisition strategy. In my portfolio, the most successful companies had a clear path to sustainable growth. What's your approach?`,
      `Hey! ${message} - I'm always excited about innovative solutions! As someone who's seen many startups, I'd want to understand your unit economics. What's your customer acquisition cost?`,
      `Hi! ${message} - that's fascinating! I'm particularly interested in the defensibility of your solution. What's your moat? How do you plan to stay ahead of competitors?`
    ],
    'researcher-agent': [
      `Hello! ${message} - that's a great question! From a UX research perspective, I'm curious about the user pain points you're addressing. Have you conducted any user interviews to validate this?`,
      `Hi there! ${message} - I love diving into user behavior! As a researcher, I'd want to understand the context better. What user insights led you to this approach?`,
      `Hey! ${message} - that's really interesting! I'm always curious about the research methodology. What methods are you using to gather user feedback? Surveys, interviews, or usability testing?`,
      `Hello! ${message} - that sounds like a fascinating research opportunity! I'd love to see the data behind this. What patterns are you seeing in user behavior?`,
      `Hi! ${message} - I'm always excited about user-centered approaches! From a research standpoint, I'd want to understand the sample size and demographics. Who are your target users?`
    ],
    'designer-agent': [
      `Hey! ${message} - that's exciting from a design perspective! I'm always thinking about user experience and visual appeal. What's your design vision for this?`,
      `Hi there! ${message} - I love creative challenges! As a designer, I'm curious about the user journey. How are you planning to make this intuitive and engaging?`,
      `Hello! ${message} - that sounds like a great design opportunity! I'm thinking about accessibility and usability. What's your approach to inclusive design?`,
      `Hey! ${message} - that's really interesting! I'm always excited about new design challenges. What's your design system approach? Are you thinking about consistency across platforms?`,
      `Hi! ${message} - I love discussing design strategy! From a visual perspective, I'd want to understand your brand guidelines. How does this fit into your overall design language?`
    ],
    'pm-agent': [
      `Hello! ${message} - that's a solid product question! As a PM, I'm thinking about strategy and execution. What's your roadmap and success metrics for this?`,
      `Hi there! ${message} - I love product discussions! From a product management perspective, I'd want to understand the business impact. What's your go-to-market strategy?`,
      `Hey! ${message} - that's interesting! As a PM, I'm always balancing user needs with business goals. How are you prioritizing features and measuring success?`,
      `Hello! ${message} - that sounds like a great product opportunity! I'm curious about your feature prioritization framework. How do you decide what to build first?`,
      `Hi! ${message} - I'm always excited about product strategy! From a PM perspective, I'd want to understand your user personas and use cases. Who are you building this for?`
    ]
  };

  const personaResponses = responses[persona.id] || responses['investor-agent'];
  const selectedResponse = personaResponses[Math.floor(Math.random() * personaResponses.length)];
  return selectedResponse;
};

// Run the test
testAgentResponses();





