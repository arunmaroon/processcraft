class AnalyticsService {
  constructor() {
    this.metrics = {
      personaGenerations: 0,
      totalPersonas: 0,
      regionalDistribution: {},
      occupationDistribution: {},
      ageDistribution: {},
      techSavvinessDistribution: {},
      interactionCounts: {},
      qualityScores: []
    };
    this.realTimeData = [];
  }

  // Track persona generation
  trackPersonaGeneration(personas, source = 'unknown') {
    this.metrics.personaGenerations++;
    this.metrics.totalPersonas += personas.length;

    personas.forEach(persona => {
      // Regional distribution
      const region = persona.culturalContext?.region || 'Unknown';
      this.metrics.regionalDistribution[region] = (this.metrics.regionalDistribution[region] || 0) + 1;

      // Occupation distribution
      const occupation = persona.demographics?.occupation || 'Unknown';
      this.metrics.occupationDistribution[occupation] = (this.metrics.occupationDistribution[occupation] || 0) + 1;

      // Age distribution
      const ageGroup = this.getAgeGroup(persona.age);
      this.metrics.ageDistribution[ageGroup] = (this.metrics.ageDistribution[ageGroup] || 0) + 1;

      // Tech savviness distribution
      const techLevel = persona.demographics?.tech_savviness || 'Unknown';
      this.metrics.techSavvinessDistribution[techLevel] = (this.metrics.techSavvinessDistribution[techLevel] || 0) + 1;

      // Quality score
      const qualityScore = this.calculateQualityScore(persona);
      this.metrics.qualityScores.push({
        personaId: persona.id,
        score: qualityScore,
        timestamp: new Date().toISOString()
      });
    });

    // Store real-time data
    this.realTimeData.push({
      timestamp: new Date().toISOString(),
      event: 'persona_generation',
      count: personas.length,
      source: source,
      metrics: this.getCurrentMetrics()
    });

    // Keep only last 1000 entries
    if (this.realTimeData.length > 1000) {
      this.realTimeData = this.realTimeData.slice(-1000);
    }
  }

  // Track persona interactions
  trackPersonaInteraction(personaId, interactionType, details = {}) {
    const key = `${personaId}_${interactionType}`;
    this.metrics.interactionCounts[key] = (this.metrics.interactionCounts[key] || 0) + 1;

    this.realTimeData.push({
      timestamp: new Date().toISOString(),
      event: 'persona_interaction',
      personaId: personaId,
      interactionType: interactionType,
      details: details
    });
  }

  // Calculate quality score for a persona
  calculateQualityScore(persona) {
    let score = 0;
    let maxScore = 0;

    // Name completeness (10 points)
    maxScore += 10;
    if (persona.name && persona.name.length > 0) score += 10;

    // Demographics completeness (30 points)
    maxScore += 30;
    const demographics = persona.demographics || {};
    if (demographics.occupation) score += 5;
    if (demographics.location) score += 5;
    if (demographics.education) score += 5;
    if (demographics.income_range) score += 5;
    if (demographics.tech_savviness) score += 5;
    if (demographics.family_status) score += 5;

    // Cultural context (20 points)
    maxScore += 20;
    const culturalContext = persona.culturalContext || {};
    if (culturalContext.region) score += 10;
    if (culturalContext.language) score += 5;
    if (culturalContext.traditions) score += 5;

    // Personality and traits (20 points)
    maxScore += 20;
    if (persona.personality) score += 5;
    if (persona.uniqueTraits && persona.uniqueTraits.length > 0) score += 5;
    if (persona.goals && persona.goals.length > 0) score += 5;
    if (persona.painPoints && persona.painPoints.length > 0) score += 5;

    // Financial profile (10 points)
    maxScore += 10;
    const financialProfile = persona.financialProfile || {};
    if (financialProfile.banking_preference) score += 3;
    if (financialProfile.investment_style) score += 3;
    if (financialProfile.emi_experience) score += 2;
    if (financialProfile.digital_payment_usage) score += 2;

    // Quote and authenticity (10 points)
    maxScore += 10;
    if (persona.quote && persona.quote.length > 10) score += 10;

    return maxScore > 0 ? (score / maxScore) * 100 : 0;
  }

  getAgeGroup(age) {
    if (age < 25) return '18-24';
    if (age < 35) return '25-34';
    if (age < 45) return '35-44';
    if (age < 55) return '45-54';
    return '55+';
  }

  // Get current metrics
  getCurrentMetrics() {
    return {
      ...this.metrics,
      averageQualityScore: this.getAverageQualityScore(),
      topRegions: this.getTopRegions(5),
      topOccupations: this.getTopOccupations(5),
      ageDistribution: this.metrics.ageDistribution,
      techSavvinessDistribution: this.metrics.techSavvinessDistribution
    };
  }

  getAverageQualityScore() {
    if (this.metrics.qualityScores.length === 0) return 0;
    const total = this.metrics.qualityScores.reduce((sum, item) => sum + item.score, 0);
    return total / this.metrics.qualityScores.length;
  }

  getTopRegions(limit = 5) {
    return Object.entries(this.metrics.regionalDistribution)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([region, count]) => ({ region, count }));
  }

  getTopOccupations(limit = 5) {
    return Object.entries(this.metrics.occupationDistribution)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([occupation, count]) => ({ occupation, count }));
  }

  // Get real-time analytics
  getRealTimeAnalytics(timeWindow = 3600000) { // 1 hour default
    const now = new Date();
    const cutoff = new Date(now.getTime() - timeWindow);

    const recentData = this.realTimeData.filter(entry => 
      new Date(entry.timestamp) > cutoff
    );

    const analytics = {
      timeWindow: timeWindow,
      totalEvents: recentData.length,
      personaGenerations: recentData.filter(e => e.event === 'persona_generation').length,
      personaInteractions: recentData.filter(e => e.event === 'persona_interaction').length,
      eventsByHour: this.getEventsByHour(recentData),
      topInteractionTypes: this.getTopInteractionTypes(recentData),
      qualityTrends: this.getQualityTrends(timeWindow)
    };

    return analytics;
  }

  getEventsByHour(data) {
    const hourly = {};
    data.forEach(entry => {
      const hour = new Date(entry.timestamp).getHours();
      hourly[hour] = (hourly[hour] || 0) + 1;
    });
    return hourly;
  }

  getTopInteractionTypes(data) {
    const types = {};
    data.forEach(entry => {
      if (entry.event === 'persona_interaction') {
        types[entry.interactionType] = (types[entry.interactionType] || 0) + 1;
      }
    });
    return Object.entries(types)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([type, count]) => ({ type, count }));
  }

  getQualityTrends(timeWindow) {
    const now = new Date();
    const cutoff = new Date(now.getTime() - timeWindow);

    const recentScores = this.metrics.qualityScores.filter(score => 
      new Date(score.timestamp) > cutoff
    );

    // Group by hour
    const hourlyScores = {};
    recentScores.forEach(score => {
      const hour = new Date(score.timestamp).getHours();
      if (!hourlyScores[hour]) hourlyScores[hour] = [];
      hourlyScores[hour].push(score.score);
    });

    // Calculate average for each hour
    const trends = {};
    Object.entries(hourlyScores).forEach(([hour, scores]) => {
      const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      trends[hour] = average;
    });

    return trends;
  }

  // Detect bias in persona generation
  detectBias() {
    const biasReport = {
      regionalBias: this.detectRegionalBias(),
      genderBias: this.detectGenderBias(),
      ageBias: this.detectAgeBias(),
      occupationBias: this.detectOccupationBias(),
      overallBiasScore: 0
    };

    // Calculate overall bias score (0 = no bias, 100 = high bias)
    const biasScores = [
      biasReport.regionalBias.score,
      biasReport.genderBias.score,
      biasReport.ageBias.score,
      biasReport.occupationBias.score
    ];
    biasReport.overallBiasScore = biasScores.reduce((sum, score) => sum + score, 0) / biasScores.length;

    return biasReport;
  }

  detectRegionalBias() {
    const total = Object.values(this.metrics.regionalDistribution).reduce((sum, count) => sum + count, 0);
    const regions = Object.keys(this.metrics.regionalDistribution);
    const expected = total / regions.length;
    
    let variance = 0;
    regions.forEach(region => {
      const actual = this.metrics.regionalDistribution[region];
      variance += Math.pow(actual - expected, 2);
    });
    
    const standardDeviation = Math.sqrt(variance / regions.length);
    const coefficientOfVariation = standardDeviation / expected;
    
    return {
      score: Math.min(coefficientOfVariation * 100, 100),
      distribution: this.metrics.regionalDistribution,
      recommendation: coefficientOfVariation > 0.5 ? 'Consider generating more diverse regional personas' : 'Regional distribution looks balanced'
    };
  }

  detectGenderBias() {
    // This would need gender data in the metrics
    return {
      score: 0,
      distribution: {},
      recommendation: 'Gender data not available in current metrics'
    };
  }

  detectAgeBias() {
    const total = Object.values(this.metrics.ageDistribution).reduce((sum, count) => sum + count, 0);
    const ageGroups = Object.keys(this.metrics.ageDistribution);
    const expected = total / ageGroups.length;
    
    let variance = 0;
    ageGroups.forEach(group => {
      const actual = this.metrics.ageDistribution[group];
      variance += Math.pow(actual - expected, 2);
    });
    
    const standardDeviation = Math.sqrt(variance / ageGroups.length);
    const coefficientOfVariation = standardDeviation / expected;
    
    return {
      score: Math.min(coefficientOfVariation * 100, 100),
      distribution: this.metrics.ageDistribution,
      recommendation: coefficientOfVariation > 0.5 ? 'Consider generating personas across more age groups' : 'Age distribution looks balanced'
    };
  }

  detectOccupationBias() {
    const total = Object.values(this.metrics.occupationDistribution).reduce((sum, count) => sum + count, 0);
    const occupations = Object.keys(this.metrics.occupationDistribution);
    const expected = total / occupations.length;
    
    let variance = 0;
    occupations.forEach(occupation => {
      const actual = this.metrics.occupationDistribution[occupation];
      variance += Math.pow(actual - expected, 2);
    });
    
    const standardDeviation = Math.sqrt(variance / occupations.length);
    const coefficientOfVariation = standardDeviation / expected;
    
    return {
      score: Math.min(coefficientOfVariation * 100, 100),
      distribution: this.metrics.occupationDistribution,
      recommendation: coefficientOfVariation > 0.5 ? 'Consider generating personas from more diverse occupations' : 'Occupation distribution looks balanced'
    };
  }

  // Export analytics data
  exportAnalytics() {
    return {
      metrics: this.getCurrentMetrics(),
      realTimeData: this.realTimeData,
      biasReport: this.detectBias(),
      exportTimestamp: new Date().toISOString()
    };
  }

  // Reset analytics
  reset() {
    this.metrics = {
      personaGenerations: 0,
      totalPersonas: 0,
      regionalDistribution: {},
      occupationDistribution: {},
      ageDistribution: {},
      techSavvinessDistribution: {},
      interactionCounts: {},
      qualityScores: []
    };
    this.realTimeData = [];
  }
}

module.exports = AnalyticsService;
