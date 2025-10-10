import * as XLSX from 'xlsx';
import { Agent } from '../../types/agent.types';

interface ExcelSheetData {
  sheetName: string;
  headers: string[];
  rows: any[][];
  data: any[];
}

interface AgentTemplate {
  name: string;
  persona: string;
  demographics: {
    age: number;
    location: string;
    occupation: string;
    income: string;
    education: string;
    familyStatus: string;
    techSavviness: 'low' | 'medium' | 'high' | 'expert';
    englishLiteracy: 'basic' | 'intermediate' | 'fluent' | 'native';
  };
  personality: {
    traits: string[];
    communicationStyle: 'direct' | 'conversational' | 'formal' | 'casual';
    decisionMaking: 'analytical' | 'intuitive' | 'collaborative' | 'independent';
    riskTolerance: 'low' | 'medium' | 'high';
    emotionalTendency: 'reserved' | 'expressive' | 'balanced';
  };
  knowledge: {
    fintechLevel: 'novice' | 'intermediate' | 'advanced' | 'expert';
    domainExpertise: string[];
    commonMisconceptions: string[];
    learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  };
  behaviors: {
    responsePatterns: string[];
    hesitationTriggers: string[];
    confidenceLevel: number;
    typicalQuestions: string[];
    painPoints: string[];
  };
  preferences: {
    interfaceStyle: 'simple' | 'detailed' | 'minimal' | 'comprehensive';
    informationDensity: 'low' | 'medium' | 'high';
    interactionMode: 'guided' | 'exploratory' | 'efficient';
  };
  background: {
    workExperience: string;
    family: string;
    lifestyle: string;
    goals: string[];
    concerns: string[];
  };
  quote: string;
}

export class ExcelAgentService {
  private agentTemplates: Map<string, AgentTemplate> = new Map();

  constructor() {
    this.initializeDefaultTemplates();
  }

  private initializeDefaultTemplates() {
    // Default templates for different agent types
    this.agentTemplates.set('tech_savvy', {
      name: 'Tech Professional',
      persona: 'Tech-savvy professional who loves explaining complex concepts',
      demographics: {
        age: 28,
        location: 'Bangalore',
        occupation: 'Software Engineer',
        income: '₹8L-₹12L',
        education: 'B.Tech Computer Science',
        familyStatus: 'Single',
        techSavviness: 'expert',
        englishLiteracy: 'native'
      },
      personality: {
        traits: ['analytical', 'curious', 'helpful', 'detail-oriented'],
        communicationStyle: 'conversational',
        decisionMaking: 'analytical',
        riskTolerance: 'medium',
        emotionalTendency: 'expressive'
      },
      knowledge: {
        fintechLevel: 'expert',
        domainExpertise: ['mobile apps', 'fintech', 'UX design'],
        commonMisconceptions: ['thinking all users are tech-savvy'],
        learningStyle: 'visual'
      },
      behaviors: {
        responsePatterns: ['explains step-by-step', 'asks clarifying questions', 'provides examples'],
        hesitationTriggers: ['complex financial terms', 'unclear requirements'],
        confidenceLevel: 0.9,
        typicalQuestions: ['What specific feature are you asking about?', 'How does this compare to other apps?'],
        painPoints: ['overly complex interfaces', 'lack of customization']
      },
      preferences: {
        interfaceStyle: 'detailed',
        informationDensity: 'high',
        interactionMode: 'exploratory'
      },
      background: {
        workExperience: '5+ years in fintech startups',
        family: 'Single, lives with roommates',
        lifestyle: 'Work-focused, enjoys learning new technologies',
        goals: ['career growth', 'learning new skills', 'building innovative products'],
        concerns: ['work-life balance', 'keeping up with technology trends']
      },
      quote: "I love when apps make complex things simple. The best UX is when you don't have to think about how to use it."
    });

    this.agentTemplates.set('novice', {
      name: 'Small Business Owner',
      persona: 'Small business owner who prefers simple, clear explanations',
      demographics: {
        age: 45,
        location: 'Mumbai',
        occupation: 'Small Business Owner',
        income: '₹4L-₹6L',
        education: 'High School',
        familyStatus: 'Married with 2 children',
        techSavviness: 'low',
        englishLiteracy: 'basic'
      },
      personality: {
        traits: ['cautious', 'practical', 'family-oriented', 'traditional'],
        communicationStyle: 'direct',
        decisionMaking: 'collaborative',
        riskTolerance: 'low',
        emotionalTendency: 'reserved'
      },
      knowledge: {
        fintechLevel: 'novice',
        domainExpertise: ['traditional business', 'cash transactions'],
        commonMisconceptions: ['digital payments are unsafe', 'apps are too complicated'],
        learningStyle: 'kinesthetic'
      },
      behaviors: {
        responsePatterns: ['asks for clarification', 'expresses concerns', 'wants step-by-step guidance'],
        hesitationTriggers: ['technical jargon', 'complex processes', 'unclear benefits'],
        confidenceLevel: 0.4,
        typicalQuestions: ['Is this safe?', 'What if I make a mistake?', 'Can someone help me?'],
        painPoints: ['complex interfaces', 'unclear instructions', 'fear of making mistakes']
      },
      preferences: {
        interfaceStyle: 'simple',
        informationDensity: 'low',
        interactionMode: 'guided'
      },
      background: {
        workExperience: '20+ years running small business',
        family: 'Married with 2 children',
        lifestyle: 'Family-focused, traditional values',
        goals: ['provide for family', 'grow business safely', 'learn new skills gradually'],
        concerns: ['data security', 'making mistakes', 'wasting money']
      },
      quote: "मुझे कुछ सरल चाहिए जो मैं आसानी से समझ सकूं। मैं गलती नहीं करना चाहता।"
    });
  }

  async parseExcelFile(filePath: string): Promise<ExcelSheetData[]> {
    try {
      const workbook = XLSX.readFile(filePath);
      const sheets: ExcelSheetData[] = [];

      workbook.SheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length === 0) return;

        const headers = jsonData[0] as string[];
        const rows = jsonData.slice(1) as any[][];
        
        // Convert to objects
        const data = rows.map(row => {
          const obj: any = {};
          headers.forEach((header, index) => {
            obj[header] = row[index] || '';
          });
          return obj;
        });

        sheets.push({
          sheetName,
          headers,
          rows,
          data
        });
      });

      return sheets;
    } catch (error) {
      console.error('Error parsing Excel file:', error);
      throw new Error('Failed to parse Excel file');
    }
  }

  async createAgentsFromExcel(filePath: string): Promise<Agent[]> {
    try {
      const sheets = await this.parseExcelFile(filePath);
      const agents: Agent[] = [];

      sheets.forEach(sheet => {
        if (sheet.data.length === 0) return;

        // Create agents from each row in the sheet
        sheet.data.forEach((rowData, index) => {
          const agent = this.createAgentFromRowData(rowData, sheet.sheetName, index);
          if (agent) {
            agents.push(agent);
          }
        });
      });

      return agents;
    } catch (error) {
      console.error('Error creating agents from Excel:', error);
      throw new Error('Failed to create agents from Excel file');
    }
  }

  private createAgentFromRowData(rowData: any, sheetName: string, index: number): Agent | null {
    try {
      // Required fields for agent creation
      const requiredFields = ['name', 'age', 'occupation', 'location'];
      const hasRequiredFields = requiredFields.every(field => rowData[field]);

      if (!hasRequiredFields) {
        console.warn(`Skipping row ${index + 1} in sheet "${sheetName}" - missing required fields`);
        return null;
      }

      // Determine agent template based on sheet name or data
      const templateKey = this.determineTemplateKey(rowData, sheetName);
      const template = this.agentTemplates.get(templateKey) || this.agentTemplates.get('novice')!;

      // Create agent with data from Excel row
      const agent: Agent = {
        id: `excel_${sheetName}_${index}_${Date.now()}`,
        name: rowData.name || `Agent ${index + 1}`,
        persona: rowData.persona || template.persona,
        demographics: {
          age: parseInt(rowData.age) || template.demographics.age,
          location: rowData.location || template.demographics.location,
          occupation: rowData.occupation || template.demographics.occupation,
          income: rowData.income || template.demographics.income,
          education: rowData.education || template.demographics.education,
          familyStatus: rowData.familyStatus || template.demographics.familyStatus,
          techSavviness: this.mapTechSavviness(rowData.techSavviness) || template.demographics.techSavviness,
          englishLiteracy: this.mapEnglishLiteracy(rowData.englishLiteracy) || template.demographics.englishLiteracy
        },
        personality: {
          traits: this.parseArrayField(rowData.traits) || template.personality.traits,
          communicationStyle: this.mapCommunicationStyle(rowData.communicationStyle) || template.personality.communicationStyle,
          decisionMaking: this.mapDecisionMaking(rowData.decisionMaking) || template.personality.decisionMaking,
          riskTolerance: this.mapRiskTolerance(rowData.riskTolerance) || template.personality.riskTolerance,
          emotionalTendency: this.mapEmotionalTendency(rowData.emotionalTendency) || template.personality.emotionalTendency
        },
        knowledge: {
          fintechLevel: this.mapFintechLevel(rowData.fintechLevel) || template.knowledge.fintechLevel,
          domainExpertise: this.parseArrayField(rowData.domainExpertise) || template.knowledge.domainExpertise,
          commonMisconceptions: this.parseArrayField(rowData.commonMisconceptions) || template.knowledge.commonMisconceptions,
          learningStyle: this.mapLearningStyle(rowData.learningStyle) || template.knowledge.learningStyle
        },
        behaviors: {
          responsePatterns: this.parseArrayField(rowData.responsePatterns) || template.behaviors.responsePatterns,
          hesitationTriggers: this.parseArrayField(rowData.hesitationTriggers) || template.behaviors.hesitationTriggers,
          confidenceLevel: parseFloat(rowData.confidenceLevel) || template.behaviors.confidenceLevel,
          typicalQuestions: this.parseArrayField(rowData.typicalQuestions) || template.behaviors.typicalQuestions,
          painPoints: this.parseArrayField(rowData.painPoints) || template.behaviors.painPoints
        },
        preferences: {
          interfaceStyle: this.mapInterfaceStyle(rowData.interfaceStyle) || template.preferences.interfaceStyle,
          informationDensity: this.mapInformationDensity(rowData.informationDensity) || template.preferences.informationDensity,
          interactionMode: this.mapInteractionMode(rowData.interactionMode) || template.preferences.interactionMode
        },
        background: {
          workExperience: rowData.workExperience || template.background.workExperience,
          family: rowData.family || template.background.family,
          lifestyle: rowData.lifestyle || template.background.lifestyle,
          goals: this.parseArrayField(rowData.goals) || template.background.goals,
          concerns: this.parseArrayField(rowData.concerns) || template.background.concerns
        },
        quote: rowData.quote || template.quote,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return agent;
    } catch (error) {
      console.error(`Error creating agent from row data:`, error);
      return null;
    }
  }

  private determineTemplateKey(rowData: any, sheetName: string): string {
    // Determine template based on sheet name or data
    const sheetLower = sheetName.toLowerCase();
    
    if (sheetLower.includes('tech') || sheetLower.includes('expert') || sheetLower.includes('professional')) {
      return 'tech_savvy';
    }
    
    if (sheetLower.includes('novice') || sheetLower.includes('beginner') || sheetLower.includes('basic')) {
      return 'novice';
    }

    // Check data for indicators
    const occupation = (rowData.occupation || '').toLowerCase();
    const techSavviness = (rowData.techSavviness || '').toLowerCase();
    
    if (occupation.includes('engineer') || occupation.includes('developer') || techSavviness.includes('expert')) {
      return 'tech_savvy';
    }

    return 'novice'; // Default
  }

  private parseArrayField(field: any): string[] | null {
    if (!field) return null;
    if (Array.isArray(field)) return field;
    if (typeof field === 'string') {
      return field.split(',').map(item => item.trim()).filter(item => item);
    }
    return null;
  }

  private mapTechSavviness(value: any): 'low' | 'medium' | 'high' | 'expert' | null {
    if (!value) return null;
    const val = value.toString().toLowerCase();
    if (val.includes('expert') || val.includes('4')) return 'expert';
    if (val.includes('high') || val.includes('3')) return 'high';
    if (val.includes('medium') || val.includes('2')) return 'medium';
    if (val.includes('low') || val.includes('1')) return 'low';
    return null;
  }

  private mapEnglishLiteracy(value: any): 'basic' | 'intermediate' | 'fluent' | 'native' | null {
    if (!value) return null;
    const val = value.toString().toLowerCase();
    if (val.includes('native')) return 'native';
    if (val.includes('fluent')) return 'fluent';
    if (val.includes('intermediate')) return 'intermediate';
    if (val.includes('basic')) return 'basic';
    return null;
  }

  private mapCommunicationStyle(value: any): 'direct' | 'conversational' | 'formal' | 'casual' | null {
    if (!value) return null;
    const val = value.toString().toLowerCase();
    if (val.includes('direct')) return 'direct';
    if (val.includes('conversational')) return 'conversational';
    if (val.includes('formal')) return 'formal';
    if (val.includes('casual')) return 'casual';
    return null;
  }

  private mapDecisionMaking(value: any): 'analytical' | 'intuitive' | 'collaborative' | 'independent' | null {
    if (!value) return null;
    const val = value.toString().toLowerCase();
    if (val.includes('analytical')) return 'analytical';
    if (val.includes('intuitive')) return 'intuitive';
    if (val.includes('collaborative')) return 'collaborative';
    if (val.includes('independent')) return 'independent';
    return null;
  }

  private mapRiskTolerance(value: any): 'low' | 'medium' | 'high' | null {
    if (!value) return null;
    const val = value.toString().toLowerCase();
    if (val.includes('high')) return 'high';
    if (val.includes('medium')) return 'medium';
    if (val.includes('low')) return 'low';
    return null;
  }

  private mapEmotionalTendency(value: any): 'reserved' | 'expressive' | 'balanced' | null {
    if (!value) return null;
    const val = value.toString().toLowerCase();
    if (val.includes('expressive')) return 'expressive';
    if (val.includes('reserved')) return 'reserved';
    if (val.includes('balanced')) return 'balanced';
    return null;
  }

  private mapFintechLevel(value: any): 'novice' | 'intermediate' | 'advanced' | 'expert' | null {
    if (!value) return null;
    const val = value.toString().toLowerCase();
    if (val.includes('expert')) return 'expert';
    if (val.includes('advanced')) return 'advanced';
    if (val.includes('intermediate')) return 'intermediate';
    if (val.includes('novice')) return 'novice';
    return null;
  }

  private mapLearningStyle(value: any): 'visual' | 'auditory' | 'kinesthetic' | 'reading' | null {
    if (!value) return null;
    const val = value.toString().toLowerCase();
    if (val.includes('visual')) return 'visual';
    if (val.includes('auditory')) return 'auditory';
    if (val.includes('kinesthetic')) return 'kinesthetic';
    if (val.includes('reading')) return 'reading';
    return null;
  }

  private mapInterfaceStyle(value: any): 'simple' | 'detailed' | 'minimal' | 'comprehensive' | null {
    if (!value) return null;
    const val = value.toString().toLowerCase();
    if (val.includes('simple')) return 'simple';
    if (val.includes('detailed')) return 'detailed';
    if (val.includes('minimal')) return 'minimal';
    if (val.includes('comprehensive')) return 'comprehensive';
    return null;
  }

  private mapInformationDensity(value: any): 'low' | 'medium' | 'high' | null {
    if (!value) return null;
    const val = value.toString().toLowerCase();
    if (val.includes('high')) return 'high';
    if (val.includes('medium')) return 'medium';
    if (val.includes('low')) return 'low';
    return null;
  }

  private mapInteractionMode(value: any): 'guided' | 'exploratory' | 'efficient' | null {
    if (!value) return null;
    const val = value.toString().toLowerCase();
    if (val.includes('guided')) return 'guided';
    if (val.includes('exploratory')) return 'exploratory';
    if (val.includes('efficient')) return 'efficient';
    return null;
  }

  generateExcelTemplate(): Buffer {
    const templateData = [
      {
        name: 'Priya Sharma',
        age: 28,
        occupation: 'Software Engineer',
        location: 'Bangalore',
        income: '₹8L-₹12L',
        education: 'B.Tech Computer Science',
        familyStatus: 'Single',
        techSavviness: 'expert',
        englishLiteracy: 'native',
        persona: 'Tech-savvy professional who loves explaining complex concepts',
        traits: 'analytical,curious,helpful,detail-oriented',
        communicationStyle: 'conversational',
        decisionMaking: 'analytical',
        riskTolerance: 'medium',
        emotionalTendency: 'expressive',
        fintechLevel: 'expert',
        domainExpertise: 'mobile apps,fintech,UX design',
        commonMisconceptions: 'thinking all users are tech-savvy',
        learningStyle: 'visual',
        responsePatterns: 'explains step-by-step,asks clarifying questions,provides examples',
        hesitationTriggers: 'complex financial terms,unclear requirements',
        confidenceLevel: 0.9,
        typicalQuestions: 'What specific feature are you asking about?,How does this compare to other apps?',
        painPoints: 'overly complex interfaces,lack of customization',
        interfaceStyle: 'detailed',
        informationDensity: 'high',
        interactionMode: 'exploratory',
        workExperience: '5+ years in fintech startups',
        family: 'Single, lives with roommates',
        lifestyle: 'Work-focused, enjoys learning new technologies',
        goals: 'career growth,learning new skills,building innovative products',
        concerns: 'work-life balance,keeping up with technology trends',
        quote: "I love when apps make complex things simple. The best UX is when you don't have to think about how to use it."
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Agents');
    
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }
}



