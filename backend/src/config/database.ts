import { Sequelize } from 'sequelize';
import Agent from '../models/Agent';
import Conversation from '../models/Conversation';
import ResearchData from '../models/ResearchData';

// Database configuration
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'processcraft_agents',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 20,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true,
    underscored: true,
  },
});

// Initialize models
const models = {
  Agent: Agent.init(Agent.rawAttributes, Agent.options),
  Conversation: Conversation.init(Conversation.rawAttributes, Conversation.options),
  ResearchData: ResearchData.init(ResearchData.rawAttributes, ResearchData.options),
};

// Define associations
Object.keys(models).forEach(modelName => {
  if (models[modelName as keyof typeof models].associate) {
    models[modelName as keyof typeof models].associate(models);
  }
});

// Export sequelize instance and models
export { sequelize };
export default models;



