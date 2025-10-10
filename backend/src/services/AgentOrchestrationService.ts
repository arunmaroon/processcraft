import { AdvancedAIModelService } from './AdvancedAIModelService';
import { MemoryManagementService } from './MemoryManagementService';
import { PersonaExtractionService, ExtractedPersona } from './PersonaExtractionService';
import { Pool } from 'pg';

interface AgentSession {
  id: string;
  personaId: string;
  isActive: boolean;
  lastActivity: Date;
  conversationCount: number;
  emotionalState: string;
  preferences: Record<string, any>;
}

interface MultiAgentScenario {
  id: string;
  name: string;
  description: string;
  agents: string[]; // Persona IDs
  scenarioType: 'debate' | 'collaboration' | 'interview' | 'focus_group' | 'roleplay';
  rules: {
    turnOrder: 'sequential' | 'random' | 'moderated';
    maxTurns: number;
    allowInterruption: boolean;
    requireModeration: boolean;
  };
  context: string;
  objectives: string[];
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

interface AgentResponse {
  agentId: string;
  agentName: string;
  content: string;
  timestamp: Date;
  metadata: {
    confidence: number;
    emotionalTone: string;
    reasoning: string;
    responseTime: number;
  };
}

interface ScenarioResponse {
  scenarioId: string;
  responses: AgentResponse[];
  turnNumber: number;
  isComplete: boolean;
  nextAgent?: string;
  summary?: string;
}

export class AgentOrchestrationService {
  private aiService: AdvancedAIModelService;
  private memoryService: MemoryManagementService;
  private personaService: PersonaExtractionService;
  private db: Pool;
  private activeSessions: Map<string, AgentSession> = new Map();
  private activeScenarios: Map<string, MultiAgentScenario> = new Map();

  constructor() {
    this.aiService = new AdvancedAIModelService();
    this.memoryService = new MemoryManagementService();
    this.personaService = new PersonaExtractionService();
    
    this.db = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  // Single Agent Management
  async createAgentSession(personaId: string, userId?: string): Promise<string> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session: AgentSession = {
      id: sessionId,
      personaId,
      isActive: true,
      lastActivity: new Date(),
      conversationCount: 0,
      emotionalState: 'neutral',
      preferences: {},
    };

    this.activeSessions.set(sessionId, session);
    
    // Store in database
    await this.storeAgentSession(session);
    
    return sessionId;
  }

  async getAgentResponse(
    sessionId: string,
    userMessage: string,
    options?: any
  ): Promise<AgentResponse> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const persona = await this.personaService.getPersonaById(session.personaId);
    if (!persona) {
      throw new Error(`Persona ${session.personaId} not found`);
    }

    // Generate response
    const response = await this.aiService.generateResponse(
      session.personaId,
      userMessage,
      sessionId,
      options
    );

    // Update session
    session.lastActivity = new Date();
    session.conversationCount++;
    session.emotionalState = response.metadata.emotionalTone;

    // Store updated session
    await this.updateAgentSession(session);

    return {
      agentId: session.personaId,
      agentName: persona.name,
      content: response.content,
      timestamp: new Date(),
      metadata: {
        confidence: response.metadata.confidence,
        emotionalTone: response.metadata.emotionalTone,
        reasoning: response.metadata.reasoning,
        responseTime: response.metadata.responseTime,
      },
    };
  }

  // Multi-Agent Scenarios
  async createMultiAgentScenario(
    name: string,
    description: string,
    agentIds: string[],
    scenarioType: MultiAgentScenario['scenarioType'],
    rules: MultiAgentScenario['rules'],
    context: string,
    objectives: string[]
  ): Promise<string> {
    const scenarioId = `scenario_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const scenario: MultiAgentScenario = {
      id: scenarioId,
      name,
      description,
      agents: agentIds,
      scenarioType,
      rules,
      context,
      objectives,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.activeScenarios.set(scenarioId, scenario);
    
    // Store in database
    await this.storeMultiAgentScenario(scenario);
    
    return scenarioId;
  }

  async runMultiAgentScenario(
    scenarioId: string,
    initialMessage: string,
    maxTurns: number = 10
  ): Promise<ScenarioResponse> {
    const scenario = this.activeScenarios.get(scenarioId);
    if (!scenario) {
      throw new Error(`Scenario ${scenarioId} not found`);
    }

    const responses: AgentResponse[] = [];
    let currentTurn = 0;
    let currentMessage = initialMessage;

    // Create sessions for all agents
    const agentSessions = new Map<string, string>();
    for (const agentId of scenario.agents) {
      const sessionId = await this.createAgentSession(agentId);
      agentSessions.set(agentId, sessionId);
    }

    // Run scenario based on type
    switch (scenario.scenarioType) {
      case 'debate':
        return await this.runDebateScenario(scenario, agentSessions, currentMessage, maxTurns);
      case 'collaboration':
        return await this.runCollaborationScenario(scenario, agentSessions, currentMessage, maxTurns);
      case 'interview':
        return await this.runInterviewScenario(scenario, agentSessions, currentMessage, maxTurns);
      case 'focus_group':
        return await this.runFocusGroupScenario(scenario, agentSessions, currentMessage, maxTurns);
      case 'roleplay':
        return await this.runRoleplayScenario(scenario, agentSessions, currentMessage, maxTurns);
      default:
        throw new Error(`Unknown scenario type: ${scenario.scenarioType}`);
    }
  }

  private async runDebateScenario(
    scenario: MultiAgentScenario,
    agentSessions: Map<string, string>,
    initialMessage: string,
    maxTurns: number
  ): Promise<ScenarioResponse> {
    const responses: AgentResponse[] = [];
    const agentIds = scenario.agents;
    let currentTurn = 0;
    let currentMessage = initialMessage;

    // Assign positions (for/against)
    const positions = this.assignDebatePositions(agentIds);

    while (currentTurn < maxTurns && currentTurn < agentIds.length * 2) {
      const agentId = agentIds[currentTurn % agentIds.length];
      const sessionId = agentSessions.get(agentId);
      
      if (!sessionId) continue;

      // Add position context to message
      const contextualMessage = this.addDebateContext(currentMessage, positions[agentId], currentTurn);

      const response = await this.getAgentResponse(sessionId, contextualMessage);
      responses.push(response);
      
      currentMessage = response.content;
      currentTurn++;
    }

    return {
      scenarioId: scenario.id,
      responses,
      turnNumber: currentTurn,
      isComplete: currentTurn >= maxTurns,
      summary: this.generateDebateSummary(responses),
    };
  }

  private async runCollaborationScenario(
    scenario: MultiAgentScenario,
    agentSessions: Map<string, string>,
    initialMessage: string,
    maxTurns: number
  ): Promise<ScenarioResponse> {
    const responses: AgentResponse[] = [];
    const agentIds = scenario.agents;
    let currentTurn = 0;
    let currentMessage = initialMessage;

    while (currentTurn < maxTurns) {
      const agentId = agentIds[currentTurn % agentIds.length];
      const sessionId = agentSessions.get(agentId);
      
      if (!sessionId) continue;

      // Add collaboration context
      const contextualMessage = this.addCollaborationContext(currentMessage, currentTurn, agentIds.length);

      const response = await this.getAgentResponse(sessionId, contextualMessage);
      responses.push(response);
      
      currentMessage = response.content;
      currentTurn++;
    }

    return {
      scenarioId: scenario.id,
      responses,
      turnNumber: currentTurn,
      isComplete: currentTurn >= maxTurns,
      summary: this.generateCollaborationSummary(responses),
    };
  }

  private async runInterviewScenario(
    scenario: MultiAgentScenario,
    agentSessions: Map<string, string>,
    initialMessage: string,
    maxTurns: number
  ): Promise<ScenarioResponse> {
    const responses: AgentResponse[] = [];
    const agentIds = scenario.agents;
    let currentTurn = 0;
    let currentMessage = initialMessage;

    // First agent is interviewer, rest are interviewees
    const interviewerId = agentIds[0];
    const intervieweeIds = agentIds.slice(1);

    while (currentTurn < maxTurns) {
      const isInterviewerTurn = currentTurn % 2 === 0;
      const agentId = isInterviewerTurn ? interviewerId : intervieweeIds[Math.floor(currentTurn / 2) % intervieweeIds.length];
      const sessionId = agentSessions.get(agentId);
      
      if (!sessionId) continue;

      const contextualMessage = this.addInterviewContext(currentMessage, isInterviewerTurn, currentTurn);

      const response = await this.getAgentResponse(sessionId, contextualMessage);
      responses.push(response);
      
      currentMessage = response.content;
      currentTurn++;
    }

    return {
      scenarioId: scenario.id,
      responses,
      turnNumber: currentTurn,
      isComplete: currentTurn >= maxTurns,
      summary: this.generateInterviewSummary(responses),
    };
  }

  private async runFocusGroupScenario(
    scenario: MultiAgentScenario,
    agentSessions: Map<string, string>,
    initialMessage: string,
    maxTurns: number
  ): Promise<ScenarioResponse> {
    const responses: AgentResponse[] = [];
    const agentIds = scenario.agents;
    let currentTurn = 0;
    let currentMessage = initialMessage;

    while (currentTurn < maxTurns) {
      const agentId = agentIds[currentTurn % agentIds.length];
      const sessionId = agentSessions.get(agentId);
      
      if (!sessionId) continue;

      const contextualMessage = this.addFocusGroupContext(currentMessage, currentTurn, agentIds.length);

      const response = await this.getAgentResponse(sessionId, contextualMessage);
      responses.push(response);
      
      currentMessage = response.content;
      currentTurn++;
    }

    return {
      scenarioId: scenario.id,
      responses,
      turnNumber: currentTurn,
      isComplete: currentTurn >= maxTurns,
      summary: this.generateFocusGroupSummary(responses),
    };
  }

  private async runRoleplayScenario(
    scenario: MultiAgentScenario,
    agentSessions: Map<string, string>,
    initialMessage: string,
    maxTurns: number
  ): Promise<ScenarioResponse> {
    const responses: AgentResponse[] = [];
    const agentIds = scenario.agents;
    let currentTurn = 0;
    let currentMessage = initialMessage;

    while (currentTurn < maxTurns) {
      const agentId = agentIds[currentTurn % agentIds.length];
      const sessionId = agentSessions.get(agentId);
      
      if (!sessionId) continue;

      const contextualMessage = this.addRoleplayContext(currentMessage, currentTurn, scenario.context);

      const response = await this.getAgentResponse(sessionId, contextualMessage);
      responses.push(response);
      
      currentMessage = response.content;
      currentTurn++;
    }

    return {
      scenarioId: scenario.id,
      responses,
      turnNumber: currentTurn,
      isComplete: currentTurn >= maxTurns,
      summary: this.generateRoleplaySummary(responses),
    };
  }

  // Context builders
  private assignDebatePositions(agentIds: string[]): Record<string, string> {
    const positions: Record<string, string> = {};
    agentIds.forEach((agentId, index) => {
      positions[agentId] = index % 2 === 0 ? 'for' : 'against';
    });
    return positions;
  }

  private addDebateContext(message: string, position: string, turn: number): string {
    return `[DEBATE CONTEXT: You are arguing ${position} this topic. This is turn ${turn + 1}. Be persuasive and use evidence.]\n\n${message}`;
  }

  private addCollaborationContext(message: string, turn: number, totalAgents: number): string {
    return `[COLLABORATION CONTEXT: You are working with ${totalAgents - 1} other people. This is your turn ${Math.floor(turn / totalAgents) + 1}. Build on previous ideas and contribute constructively.]\n\n${message}`;
  }

  private addInterviewContext(message: string, isInterviewer: boolean, turn: number): string {
    const role = isInterviewer ? 'INTERVIEWER' : 'INTERVIEWEE';
    return `[INTERVIEW CONTEXT: You are the ${role}. This is turn ${turn + 1}. ${isInterviewer ? 'Ask thoughtful questions.' : 'Provide detailed, honest answers.'}]\n\n${message}`;
  }

  private addFocusGroupContext(message: string, turn: number, totalAgents: number): string {
    return `[FOCUS GROUP CONTEXT: You are participating in a focus group with ${totalAgents - 1} other people. This is your turn ${Math.floor(turn / totalAgents) + 1}. Share your honest opinions and experiences.]\n\n${message}`;
  }

  private addRoleplayContext(message: string, turn: number, context: string): string {
    return `[ROLEPLAY CONTEXT: ${context}. This is turn ${turn + 1}. Stay in character and respond naturally.]\n\n${message}`;
  }

  // Summary generators
  private generateDebateSummary(responses: AgentResponse[]): string {
    const forResponses = responses.filter((_, index) => index % 2 === 0);
    const againstResponses = responses.filter((_, index) => index % 2 === 1);
    
    return `Debate completed with ${forResponses.length} arguments for and ${againstResponses.length} arguments against. Key points discussed and positions maintained throughout.`;
  }

  private generateCollaborationSummary(responses: AgentResponse[]): string {
    const uniqueAgents = new Set(responses.map(r => r.agentId)).size;
    return `Collaboration completed with ${uniqueAgents} participants contributing ${responses.length} total responses. Ideas were built upon and developed collectively.`;
  }

  private generateInterviewSummary(responses: AgentResponse[]): string {
    const interviewerResponses = responses.filter((_, index) => index % 2 === 0);
    const intervieweeResponses = responses.filter((_, index) => index % 2 === 1);
    
    return `Interview completed with ${interviewerResponses.length} questions asked and ${intervieweeResponses.length} responses given. Comprehensive discussion of the topic.`;
  }

  private generateFocusGroupSummary(responses: AgentResponse[]): string {
    const uniqueAgents = new Set(responses.map(r => r.agentId)).size;
    return `Focus group completed with ${uniqueAgents} participants providing ${responses.length} total insights. Diverse perspectives and experiences shared.`;
  }

  private generateRoleplaySummary(responses: AgentResponse[]): string {
    const uniqueAgents = new Set(responses.map(r => r.agentId)).size;
    return `Roleplay scenario completed with ${uniqueAgents} participants in ${responses.length} total interactions. Characters maintained throughout the scenario.`;
  }

  // Database operations
  private async storeAgentSession(session: AgentSession): Promise<void> {
    const query = `
      INSERT INTO agent_sessions 
      (id, persona_id, is_active, last_activity, conversation_count, emotional_state, preferences, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      ON CONFLICT (id) DO UPDATE SET
      is_active = EXCLUDED.is_active,
      last_activity = EXCLUDED.last_activity,
      conversation_count = EXCLUDED.conversation_count,
      emotional_state = EXCLUDED.emotional_state,
      preferences = EXCLUDED.preferences,
      updated_at = NOW()
    `;

    await this.db.query(query, [
      session.id,
      session.personaId,
      session.isActive,
      session.lastActivity,
      session.conversationCount,
      session.emotionalState,
      JSON.stringify(session.preferences),
    ]);
  }

  private async updateAgentSession(session: AgentSession): Promise<void> {
    const query = `
      UPDATE agent_sessions 
      SET last_activity = $2, conversation_count = $3, emotional_state = $4, preferences = $5, updated_at = NOW()
      WHERE id = $1
    `;

    await this.db.query(query, [
      session.id,
      session.lastActivity,
      session.conversationCount,
      session.emotionalState,
      JSON.stringify(session.preferences),
    ]);
  }

  private async storeMultiAgentScenario(scenario: MultiAgentScenario): Promise<void> {
    const query = `
      INSERT INTO multi_agent_scenarios 
      (id, name, description, agents, scenario_type, rules, context, objectives, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      description = EXCLUDED.description,
      agents = EXCLUDED.agents,
      scenario_type = EXCLUDED.scenario_type,
      rules = EXCLUDED.rules,
      context = EXCLUDED.context,
      objectives = EXCLUDED.objectives,
      status = EXCLUDED.status,
      updated_at = NOW()
    `;

    await this.db.query(query, [
      scenario.id,
      scenario.name,
      scenario.description,
      JSON.stringify(scenario.agents),
      scenario.scenarioType,
      JSON.stringify(scenario.rules),
      scenario.context,
      JSON.stringify(scenario.objectives),
      scenario.status,
    ]);
  }

  // Utility methods
  async getActiveSessions(): Promise<AgentSession[]> {
    return Array.from(this.activeSessions.values());
  }

  async getActiveScenarios(): Promise<MultiAgentScenario[]> {
    return Array.from(this.activeScenarios.values());
  }

  async endSession(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.isActive = false;
      await this.updateAgentSession(session);
      this.activeSessions.delete(sessionId);
    }
  }

  async endScenario(scenarioId: string): Promise<void> {
    const scenario = this.activeScenarios.get(scenarioId);
    if (scenario) {
      scenario.status = 'completed';
      await this.storeMultiAgentScenario(scenario);
      this.activeScenarios.delete(scenarioId);
    }
  }
}






