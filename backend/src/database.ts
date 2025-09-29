import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'DRAFT' | 'IN_PROGRESS' | 'PENDING_APPROVAL' | 'APPROVED' | 'COMPLETED';
  currentStage: string;
  createdAt: string;
  updatedAt: string;
  assignedUsers: Record<string, string[]>;
  prd: any;
  approvals: any[];
  version: number;
}

class Database {
  private projects: Project[] = [];

  constructor() {
    this.loadProjects();
  }

  private loadProjects(): void {
    try {
      if (fs.existsSync(PROJECTS_FILE)) {
        const data = fs.readFileSync(PROJECTS_FILE, 'utf8');
        this.projects = JSON.parse(data);
        console.log(`📁 Loaded ${this.projects.length} projects from database`);
      } else {
        // Initialize with sample data
        this.projects = [
          {
            id: '1',
            name: 'DigiGold Mobile App',
            description: 'A mobile banking app for digital gold investment',
            status: 'IN_PROGRESS',
            currentStage: 'USER_RESEARCH',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            assignedUsers: {
              PM: ['1'],
              RESEARCHER: ['2'],
              UX_DESIGNER: ['3'],
              UI_DESIGNER: ['4'],
              VISUAL_DESIGNER: ['5'],
              UX_WRITER: ['6'],
              DEVELOPER: ['7']
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
              businessContext: 'Digital gold is becoming increasingly popular as an investment option. We need to create a user-friendly mobile app that makes gold investment accessible to everyone.',
              constraints: [
                'Must comply with financial regulations',
                'Maximum 2-second load time',
                'Support for iOS and Android'
              ],
              status: 'COMPLETED',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            approvals: [],
            version: 1
          }
        ];
        this.saveProjects();
        console.log('📁 Initialized database with sample data');
      }
    } catch (error) {
      console.error('❌ Error loading projects:', error);
      this.projects = [];
    }
  }

  private saveProjects(): void {
    try {
      fs.writeFileSync(PROJECTS_FILE, JSON.stringify(this.projects, null, 2));
      console.log(`💾 Saved ${this.projects.length} projects to database`);
    } catch (error) {
      console.error('❌ Error saving projects:', error);
    }
  }

  // Project CRUD operations
  getAllProjects(): Project[] {
    return [...this.projects];
  }

  getProjectById(id: string): Project | undefined {
    return this.projects.find(p => p.id === id);
  }

  createProject(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Project {
    const newProject: Project = {
      id: Date.now().toString(),
      ...projectData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1
    };
    
    this.projects.push(newProject);
    this.saveProjects();
    console.log(`✅ Created project: ${newProject.name} (ID: ${newProject.id})`);
    return newProject;
  }

  updateProject(project: Project): Project {
    const index = this.projects.findIndex(p => p.id === project.id);
    if (index === -1) {
      throw new Error(`Project with ID ${project.id} not found`);
    }
    
    const updatedProject = {
      ...project,
      updatedAt: new Date().toISOString(),
      version: this.projects[index].version + 1
    };
    
    this.projects[index] = updatedProject;
    this.saveProjects();
    console.log(`✅ Updated project: ${updatedProject.name} (ID: ${updatedProject.id})`);
    return updatedProject;
  }

  deleteProject(id: string): boolean {
    const index = this.projects.findIndex(p => p.id === id);
    if (index === -1) {
      return false;
    }
    
    const project = this.projects[index];
    this.projects.splice(index, 1);
    this.saveProjects();
    console.log(`✅ Deleted project: ${project.name} (ID: ${project.id})`);
    return true;
  }

  // Force reload from file
  reload(): void {
    this.loadProjects();
  }

  // Get database stats
  getStats() {
    return {
      totalProjects: this.projects.length,
      lastUpdated: fs.existsSync(PROJECTS_FILE) ? fs.statSync(PROJECTS_FILE).mtime : null,
      filePath: PROJECTS_FILE
    };
  }
}

// Export singleton instance
export const db = new Database();
