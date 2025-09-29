const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Projects endpoint
app.get('/api/projects', (req, res) => {
  res.json([
    {
      id: '1',
      name: 'DigiGold Mobile App',
      description: 'A mobile banking app for digital gold investment',
      status: 'IN_PROGRESS',
      currentStage: 'RESEARCH',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignedUsers: {
        PM: ['1'],
        DESIGNER: ['2'],
        DESIGN_HEAD: ['3']
      },
      prd: {
        id: 'prd-1',
        objectives: [
          'Enable users to buy and sell digital gold',
          'Provide real-time gold price tracking',
          'Offer secure wallet functionality'
        ],
        targetUsers: [
          'Tech-savvy millennials (25-35)',
          'Investment enthusiasts',
          'Mobile-first users'
        ],
        successMetrics: [
          'User acquisition rate > 1000/month',
          'Transaction volume > $100K/month',
          'User retention > 80% after 3 months'
        ],
        businessContext: 'Digital gold is becoming increasingly popular as an investment option.',
        constraints: [
          'Must comply with financial regulations',
          'Maximum 2-second load time',
          'Support for iOS and Android'
        ],
        status: 'APPROVED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      approvals: [],
      version: 1
    }
  ]);
});

// Notifications endpoint
app.get('/api/notifications', (req, res) => {
  res.json([]);
});

// Versions endpoint
app.get('/api/versions', (req, res) => {
  res.json([]);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Simple Backend running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📋 Projects: http://localhost:${PORT}/api/projects`);
});
