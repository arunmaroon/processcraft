class VectorSearchService {
  constructor() {
    this.embeddings = new Map();
    this.personaVectors = new Map();
  }

  // Generate embeddings for persona attributes
  generatePersonaEmbedding(persona) {
    const attributes = [
      persona.name,
      persona.demographics?.occupation || '',
      persona.demographics?.location || '',
      persona.demographics?.education || '',
      persona.personality || '',
      persona.culturalContext?.region || '',
      persona.culturalContext?.language || '',
      persona.financialProfile?.banking_preference || '',
      persona.financialProfile?.investment_style || ''
    ].join(' ').toLowerCase();

    // Simple TF-IDF based embedding (in production, use OpenAI embeddings or similar)
    const words = attributes.split(/\s+/);
    const wordCount = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    // Create a simple vector representation
    const vector = this.createSimpleVector(wordCount);
    return vector;
  }

  createSimpleVector(wordCount) {
    // Create a 50-dimensional vector based on word frequencies
    const vector = new Array(50).fill(0);
    const words = Object.keys(wordCount);
    
    words.forEach((word, index) => {
      const hash = this.simpleHash(word);
      const dimension = hash % 50;
      vector[dimension] += wordCount[word];
    });

    // Normalize the vector
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return vector.map(val => val / magnitude);
  }

  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // Calculate cosine similarity between two vectors
  calculateSimilarity(vector1, vector2) {
    if (vector1.length !== vector2.length) return 0;

    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;

    for (let i = 0; i < vector1.length; i++) {
      dotProduct += vector1[i] * vector2[i];
      magnitude1 += vector1[i] * vector1[i];
      magnitude2 += vector2[i] * vector2[i];
    }

    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);

    if (magnitude1 === 0 || magnitude2 === 0) return 0;

    return dotProduct / (magnitude1 * magnitude2);
  }

  // Find similar personas
  findSimilarPersonas(targetPersona, allPersonas, threshold = 0.7) {
    const targetVector = this.generatePersonaEmbedding(targetPersona);
    const similarities = [];

    allPersonas.forEach(persona => {
      if (persona.id === targetPersona.id) return; // Skip self

      const personaVector = this.generatePersonaEmbedding(persona);
      const similarity = this.calculateSimilarity(targetVector, personaVector);
      
      if (similarity >= threshold) {
        similarities.push({
          persona: persona,
          similarity: similarity
        });
      }
    });

    return similarities.sort((a, b) => b.similarity - a.similarity);
  }

  // Group personas by similarity
  groupPersonasBySimilarity(personas, threshold = 0.6) {
    const groups = [];
    const processed = new Set();

    personas.forEach(persona => {
      if (processed.has(persona.id)) return;

      const group = [persona];
      processed.add(persona.id);

      const similarPersonas = this.findSimilarPersonas(persona, personas, threshold);
      similarPersonas.forEach(({ persona: similarPersona }) => {
        if (!processed.has(similarPersona.id)) {
          group.push(similarPersona);
          processed.add(similarPersona.id);
        }
      });

      groups.push({
        id: `group_${groups.length + 1}`,
        personas: group,
        size: group.length,
        representative: group[0] // First persona as representative
      });
    });

    return groups;
  }

  // Find personas with specific attributes
  findPersonasByAttributes(personas, attributes) {
    const queryVector = this.generatePersonaEmbedding(attributes);
    const results = [];

    personas.forEach(persona => {
      const personaVector = this.generatePersonaEmbedding(persona);
      const similarity = this.calculateSimilarity(queryVector, personaVector);
      
      results.push({
        persona: persona,
        similarity: similarity
      });
    });

    return results.sort((a, b) => b.similarity - a.similarity);
  }

  // Analyze persona diversity
  analyzePersonaDiversity(personas) {
    if (personas.length < 2) return { diversity: 0, groups: [] };

    const groups = this.groupPersonasBySimilarity(personas, 0.7);
    const diversity = 1 - (groups.length / personas.length);

    return {
      diversity: diversity,
      groups: groups,
      totalPersonas: personas.length,
      uniqueGroups: groups.length,
      averageGroupSize: personas.length / groups.length
    };
  }

  // Find complementary personas (opposite characteristics)
  findComplementaryPersonas(targetPersona, allPersonas) {
    const targetVector = this.generatePersonaEmbedding(targetPersona);
    const complementaries = [];

    allPersonas.forEach(persona => {
      if (persona.id === targetPersona.id) return;

      const personaVector = this.generatePersonaEmbedding(persona);
      const similarity = this.calculateSimilarity(targetVector, personaVector);
      
      // Look for personas with low similarity (complementary)
      if (similarity < 0.3) {
        complementaries.push({
          persona: persona,
          complementarity: 1 - similarity
        });
      }
    });

    return complementaries.sort((a, b) => b.complementarity - a.complementarity);
  }

  // Generate persona recommendations
  generatePersonaRecommendations(existingPersonas, targetCount = 5) {
    const diversity = this.analyzePersonaDiversity(existingPersonas);
    const recommendations = [];

    if (diversity.groups.length < targetCount) {
      // Need more diverse personas
      const underrepresentedGroups = diversity.groups.filter(group => group.size === 1);
      
      underrepresentedGroups.forEach(group => {
        const complementary = this.findComplementaryPersonas(group.representative, existingPersonas);
        if (complementary.length > 0) {
          recommendations.push({
            type: 'complementary',
            basePersona: group.representative,
            suggestedAttributes: this.extractComplementaryAttributes(complementary[0].persona)
          });
        }
      });
    }

    return recommendations;
  }

  extractComplementaryAttributes(persona) {
    return {
      region: persona.culturalContext?.region,
      occupation: persona.demographics?.occupation,
      ageGroup: this.getAgeGroup(persona.age),
      techSavviness: persona.demographics?.tech_savviness,
      incomeRange: persona.demographics?.income_range
    };
  }

  getAgeGroup(age) {
    if (age < 25) return '18-24';
    if (age < 35) return '25-34';
    if (age < 45) return '35-44';
    if (age < 55) return '45-54';
    return '55+';
  }

  // Store persona vector for future use
  storePersonaVector(personaId, vector) {
    this.personaVectors.set(personaId, vector);
  }

  // Get stored persona vector
  getPersonaVector(personaId) {
    return this.personaVectors.get(personaId);
  }

  // Clear all stored vectors
  clearVectors() {
    this.personaVectors.clear();
  }
}

module.exports = VectorSearchService;
