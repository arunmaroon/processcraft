-- Advanced AI Agent System Database Schema
-- This schema supports comprehensive user simulation with personas, memory, and multi-agent scenarios

-- User data collection and preprocessing
CREATE TABLE IF NOT EXISTS user_data (
    id VARCHAR(255) PRIMARY KEY,
    source VARCHAR(50) NOT NULL CHECK (source IN ('interview', 'survey', 'session', 'feedback', 'analytics')),
    raw_data JSONB NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Processed user data after cleaning and anonymization
CREATE TABLE IF NOT EXISTS processed_user_data (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    text TEXT NOT NULL,
    audio_transcription TEXT,
    sentiment VARCHAR(20) NOT NULL CHECK (sentiment IN ('positive', 'negative', 'neutral')),
    topics JSONB NOT NULL,
    language VARCHAR(50) NOT NULL,
    confidence DECIMAL(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    anonymized BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- User clusters for persona extraction
CREATE TABLE IF NOT EXISTS user_clusters (
    id VARCHAR(255) PRIMARY KEY,
    cluster_key VARCHAR(255) NOT NULL,
    traits JSONB NOT NULL,
    size INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Extracted personas with comprehensive traits
CREATE TABLE IF NOT EXISTS personas (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    traits JSONB NOT NULL, -- Contains demographics, psychographics, behaviors, knowledge, conversational
    prompt_template TEXT NOT NULL,
    fidelity_score DECIMAL(3,2) NOT NULL CHECK (fidelity_score >= 0 AND fidelity_score <= 1),
    source_data JSONB NOT NULL, -- Array of processed data IDs used to create this persona
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Agent sessions for single-agent interactions
CREATE TABLE IF NOT EXISTS agent_sessions (
    id VARCHAR(255) PRIMARY KEY,
    persona_id VARCHAR(255) NOT NULL REFERENCES personas(id),
    is_active BOOLEAN DEFAULT TRUE,
    last_activity TIMESTAMP NOT NULL,
    conversation_count INTEGER DEFAULT 0,
    emotional_state VARCHAR(50) DEFAULT 'neutral',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Multi-agent scenarios
CREATE TABLE IF NOT EXISTS multi_agent_scenarios (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    agents JSONB NOT NULL, -- Array of persona IDs
    scenario_type VARCHAR(50) NOT NULL CHECK (scenario_type IN ('debate', 'collaboration', 'interview', 'focus_group', 'roleplay')),
    rules JSONB NOT NULL, -- Turn order, max turns, etc.
    context TEXT NOT NULL,
    objectives JSONB NOT NULL, -- Array of objectives
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Short-term memory (Redis is primary, this is backup)
CREATE TABLE IF NOT EXISTS short_term_memory (
    id VARCHAR(255) PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    persona_id VARCHAR(255) NOT NULL REFERENCES personas(id),
    type VARCHAR(50) NOT NULL CHECK (type IN ('conversation', 'preference', 'fact', 'emotion', 'goal')),
    content TEXT NOT NULL,
    metadata JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Long-term memory with vector embeddings
CREATE TABLE IF NOT EXISTS long_term_memory (
    id VARCHAR(255) PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    persona_id VARCHAR(255) NOT NULL REFERENCES personas(id),
    type VARCHAR(50) NOT NULL CHECK (type IN ('conversation', 'preference', 'fact', 'emotion', 'goal')),
    content TEXT NOT NULL,
    metadata JSONB NOT NULL,
    embedding JSONB, -- Vector embedding for semantic search
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Conversation history for context
CREATE TABLE IF NOT EXISTS conversation_history (
    id VARCHAR(255) PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    persona_id VARCHAR(255) NOT NULL REFERENCES personas(id),
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Response quality tracking
CREATE TABLE IF NOT EXISTS response_quality (
    id VARCHAR(255) PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    persona_id VARCHAR(255) NOT NULL REFERENCES personas(id),
    user_message TEXT NOT NULL,
    agent_response TEXT NOT NULL,
    quality_metrics JSONB NOT NULL, -- Overall score, persona alignment, naturalness, relevance
    suggestions JSONB, -- Array of improvement suggestions
    created_at TIMESTAMP DEFAULT NOW()
);

-- Multi-agent scenario responses
CREATE TABLE IF NOT EXISTS scenario_responses (
    id VARCHAR(255) PRIMARY KEY,
    scenario_id VARCHAR(255) NOT NULL REFERENCES multi_agent_scenarios(id),
    agent_id VARCHAR(255) NOT NULL REFERENCES personas(id),
    agent_name VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    turn_number INTEGER NOT NULL,
    metadata JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- System monitoring and analytics
CREATE TABLE IF NOT EXISTS system_metrics (
    id VARCHAR(255) PRIMARY KEY,
    metric_type VARCHAR(50) NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(10,4) NOT NULL,
    metadata JSONB,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- User feedback for RLHF
CREATE TABLE IF NOT EXISTS user_feedback (
    id VARCHAR(255) PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    persona_id VARCHAR(255) NOT NULL REFERENCES personas(id),
    user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
    feedback_text TEXT,
    improvement_suggestions TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_processed_user_data_user_id ON processed_user_data(user_id);
CREATE INDEX IF NOT EXISTS idx_processed_user_data_sentiment ON processed_user_data(sentiment);
CREATE INDEX IF NOT EXISTS idx_processed_user_data_topics ON processed_user_data USING GIN(topics);

CREATE INDEX IF NOT EXISTS idx_personas_fidelity_score ON personas(fidelity_score);
CREATE INDEX IF NOT EXISTS idx_personas_created_at ON personas(created_at);

CREATE INDEX IF NOT EXISTS idx_agent_sessions_persona_id ON agent_sessions(persona_id);
CREATE INDEX IF NOT EXISTS idx_agent_sessions_is_active ON agent_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_agent_sessions_last_activity ON agent_sessions(last_activity);

CREATE INDEX IF NOT EXISTS idx_short_term_memory_session_id ON short_term_memory(session_id);
CREATE INDEX IF NOT EXISTS idx_short_term_memory_persona_id ON short_term_memory(persona_id);
CREATE INDEX IF NOT EXISTS idx_short_term_memory_type ON short_term_memory(type);

CREATE INDEX IF NOT EXISTS idx_long_term_memory_persona_id ON long_term_memory(persona_id);
CREATE INDEX IF NOT EXISTS idx_long_term_memory_type ON long_term_memory(type);
CREATE INDEX IF NOT EXISTS idx_long_term_memory_created_at ON long_term_memory(created_at);

CREATE INDEX IF NOT EXISTS idx_conversation_history_session_id ON conversation_history(session_id);
CREATE INDEX IF NOT EXISTS idx_conversation_history_persona_id ON conversation_history(persona_id);
CREATE INDEX IF NOT EXISTS idx_conversation_history_created_at ON conversation_history(created_at);

CREATE INDEX IF NOT EXISTS idx_scenario_responses_scenario_id ON scenario_responses(scenario_id);
CREATE INDEX IF NOT EXISTS idx_scenario_responses_agent_id ON scenario_responses(agent_id);
CREATE INDEX IF NOT EXISTS idx_scenario_responses_turn_number ON scenario_responses(turn_number);

CREATE INDEX IF NOT EXISTS idx_system_metrics_metric_type ON system_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_system_metrics_timestamp ON system_metrics(timestamp);

CREATE INDEX IF NOT EXISTS idx_user_feedback_persona_id ON user_feedback(persona_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_created_at ON user_feedback(created_at);

-- Views for common queries
CREATE OR REPLACE VIEW persona_summary AS
SELECT 
    p.id,
    p.name,
    p.description,
    p.fidelity_score,
    p.traits->>'demographics' as demographics,
    p.traits->>'psychographics' as psychographics,
    p.traits->>'behaviors' as behaviors,
    p.traits->>'knowledge' as knowledge,
    p.traits->>'conversational' as conversational,
    p.created_at,
    COUNT(DISTINCT s.id) as active_sessions,
    COUNT(DISTINCT ltm.id) as long_term_memories
FROM personas p
LEFT JOIN agent_sessions s ON p.id = s.persona_id AND s.is_active = true
LEFT JOIN long_term_memory ltm ON p.id = ltm.persona_id
GROUP BY p.id, p.name, p.description, p.fidelity_score, p.traits, p.created_at;

CREATE OR REPLACE VIEW session_activity AS
SELECT 
    s.id as session_id,
    p.name as persona_name,
    s.conversation_count,
    s.emotional_state,
    s.last_activity,
    s.created_at,
    COUNT(ch.id) as message_count
FROM agent_sessions s
JOIN personas p ON s.persona_id = p.id
LEFT JOIN conversation_history ch ON s.id = ch.session_id
WHERE s.is_active = true
GROUP BY s.id, p.name, s.conversation_count, s.emotional_state, s.last_activity, s.created_at;

CREATE OR REPLACE VIEW response_quality_summary AS
SELECT 
    p.name as persona_name,
    AVG(rq.quality_metrics->>'overall_score')::DECIMAL(3,2) as avg_overall_score,
    AVG(rq.quality_metrics->>'persona_alignment')::DECIMAL(3,2) as avg_persona_alignment,
    AVG(rq.quality_metrics->>'naturalness')::DECIMAL(3,2) as avg_naturalness,
    AVG(rq.quality_metrics->>'relevance')::DECIMAL(3,2) as avg_relevance,
    COUNT(rq.id) as total_responses
FROM response_quality rq
JOIN personas p ON rq.persona_id = p.id
GROUP BY p.id, p.name;

-- Functions for common operations
CREATE OR REPLACE FUNCTION cleanup_old_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM agent_sessions 
    WHERE is_active = false 
    AND last_activity < NOW() - INTERVAL '7 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION cleanup_old_memory()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM short_term_memory 
    WHERE created_at < NOW() - INTERVAL '24 hours';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_personas_updated_at 
    BEFORE UPDATE ON personas 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_sessions_updated_at 
    BEFORE UPDATE ON agent_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_long_term_memory_updated_at 
    BEFORE UPDATE ON long_term_memory 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_multi_agent_scenarios_updated_at 
    BEFORE UPDATE ON multi_agent_scenarios 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data for testing
INSERT INTO personas (id, name, description, traits, prompt_template, fidelity_score, source_data) VALUES
('persona_1', 'Sarah Chen', 'A 28-year-old UX Designer from Mumbai with a passion for inclusive design', 
 '{"demographics": {"age": 28, "gender": "Female", "location": "Mumbai, India", "education": "Master\'s in Design", "occupation": "UX Designer", "income": "8L-12L"}, "psychographics": {"personality": {"openness": 0.8, "conscientiousness": 0.7, "extraversion": 0.6, "agreeableness": 0.9, "neuroticism": 0.3}, "values": ["Creativity", "Accessibility", "User-centered design"], "interests": ["Design systems", "User research", "Accessibility"], "motivations": ["Creating inclusive products", "Improving user experience"]}, "behaviors": {"techProficiency": "advanced", "communicationStyle": "conversational", "decisionMaking": "collaborative", "riskTolerance": "medium"}, "knowledge": {"domains": ["UI/UX Design", "User Research", "Accessibility"], "expertise": {"UI/UX Design": "expert", "User Research": "advanced", "Accessibility": "expert"}, "painPoints": ["Complex interfaces", "Poor mobile experience", "Inconsistent design patterns"], "goals": ["Create accessible products", "Improve design systems", "Mentor junior designers"]}, "conversational": {"languagePatterns": ["Uses design terminology", "Asks clarifying questions", "Provides examples"], "commonPhrases": ["From a UX perspective", "I think", "What do you think about"], "responseStyle": "Collaborative and thoughtful", "emotionalTone": "Enthusiastic"}}',
 'You are Sarah Chen, a 28-year-old UX Designer from Mumbai...', 0.85, '["processed_1", "processed_2"]'),
 
('persona_2', 'Rajesh Kumar', 'A 35-year-old Small Business Owner from Delhi focused on growth and efficiency',
 '{"demographics": {"age": 35, "gender": "Male", "location": "Delhi, India", "education": "B.Com", "occupation": "Small Business Owner", "income": "15L-25L"}, "psychographics": {"personality": {"openness": 0.4, "conscientiousness": 0.9, "extraversion": 0.7, "agreeableness": 0.6, "neuroticism": 0.4}, "values": ["Growth", "Efficiency", "Customer satisfaction"], "interests": ["Business strategy", "Technology", "Networking"], "motivations": ["Growing business", "Improving efficiency", "Customer retention"]}, "behaviors": {"techProficiency": "intermediate", "communicationStyle": "direct", "decisionMaking": "decisive", "riskTolerance": "medium"}, "knowledge": {"domains": ["Business", "Finance", "Technology"], "expertise": {"Business": "expert", "Finance": "advanced", "Technology": "intermediate"}, "painPoints": ["Time management", "Technology complexity", "Competition"], "goals": ["Scale business", "Improve efficiency", "Customer satisfaction"]}, "conversational": {"languagePatterns": ["Direct communication", "Focuses on ROI", "Asks about costs"], "commonPhrases": ["What\'s the cost", "How does this help", "I need to see results"], "responseStyle": "Direct and business-focused", "emotionalTone": "Professional"}}',
 'You are Rajesh Kumar, a 35-year-old Small Business Owner from Delhi...', 0.82, '["processed_3", "processed_4"]');






