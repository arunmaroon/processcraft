import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface AgentAttributes {
  id: string;
  name: string;
  avatar_url?: string;
  
  // Demographics
  age?: number;
  gender?: string;
  location?: {
    city: string;
    state: string;
    country: string;
    tier: string;
  };
  education?: string;
  occupation?: string;
  industry?: string;
  income_range?: string;
  family_status?: string;
  
  // Behavioral Traits
  personality?: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
    [key: string]: any;
  };
  communication_style?: {
    directness: number;
    formality: number;
    emotional_expression: number;
    detail_level: number;
    [key: string]: any;
  };
  risk_tolerance?: string;
  tech_comfort?: string;
  financial_behavior?: {
    spending_pattern: string;
    saving_habits: string;
    investment_approach: string;
    [key: string]: any;
  };
  decision_making_style?: string;
  
  // Financial Profile
  credit_score_range?: string;
  banking_history?: any;
  loan_history?: any;
  investment_behavior?: any;
  spending_patterns?: any;
  
  // Psychological Profile
  motivations?: string[];
  fears?: string[];
  values?: string[];
  aspirations?: string[];
  pain_points?: string[];
  
  // Interaction Patterns
  response_patterns?: any;
  emotional_triggers?: any;
  conversation_style?: any;
  typical_phrases?: string[];
  
  // Performance Metrics
  consistency_score?: number;
  realism_score?: number;
  engagement_score?: number;
  usage_count?: number;
  
  // Metadata
  created_from?: string;
  generation_method?: string;
  quality_flags?: any;
  tags?: string[];
  notes?: string;
  
  created_at?: Date;
  updated_at?: Date;
}

export interface AgentCreationAttributes extends Optional<AgentAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class Agent extends Model<AgentAttributes, AgentCreationAttributes> implements AgentAttributes {
  public id!: string;
  public name!: string;
  public avatar_url?: string;
  
  // Demographics
  public age?: number;
  public gender?: string;
  public location?: any;
  public education?: string;
  public occupation?: string;
  public industry?: string;
  public income_range?: string;
  public family_status?: string;
  
  // Behavioral Traits
  public personality?: any;
  public communication_style?: any;
  public risk_tolerance?: string;
  public tech_comfort?: string;
  public financial_behavior?: any;
  public decision_making_style?: string;
  
  // Financial Profile
  public credit_score_range?: string;
  public banking_history?: any;
  public loan_history?: any;
  public investment_behavior?: any;
  public spending_patterns?: any;
  
  // Psychological Profile
  public motivations?: string[];
  public fears?: string[];
  public values?: string[];
  public aspirations?: string[];
  public pain_points?: string[];
  
  // Interaction Patterns
  public response_patterns?: any;
  public emotional_triggers?: any;
  public conversation_style?: any;
  public typical_phrases?: string[];
  
  // Performance Metrics
  public consistency_score?: number;
  public realism_score?: number;
  public engagement_score?: number;
  public usage_count?: number;
  
  // Metadata
  public created_from?: string;
  public generation_method?: string;
  public quality_flags?: any;
  public tags?: string[];
  public notes?: string;
  
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Agent.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    avatar_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    
    // Demographics
    age: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    gender: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    location: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    education: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    occupation: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    industry: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    income_range: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    family_status: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    
    // Behavioral Traits
    personality: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    communication_style: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    risk_tolerance: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    tech_comfort: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    financial_behavior: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    decision_making_style: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    
    // Financial Profile
    credit_score_range: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    banking_history: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    loan_history: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    investment_behavior: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    spending_patterns: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    
    // Psychological Profile
    motivations: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    fears: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    values: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    aspirations: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    pain_points: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    
    // Interaction Patterns
    response_patterns: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    emotional_triggers: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    conversation_style: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    typical_phrases: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    
    // Performance Metrics
    consistency_score: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true,
    },
    realism_score: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true,
    },
    engagement_score: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true,
    },
    usage_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    
    // Metadata
    created_from: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    generation_method: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    quality_flags: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'agents',
    timestamps: true,
    indexes: [
      {
        fields: ['name'],
      },
      {
        fields: ['age'],
      },
      {
        fields: ['income_range'],
      },
      {
        fields: ['occupation'],
      },
      {
        fields: ['tags'],
      },
    ],
  }
);

export default Agent;

