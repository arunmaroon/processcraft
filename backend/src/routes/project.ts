import express from 'express';
import { db } from '../database';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// GET /api/projects - Get all projects
router.get('/', (req, res) => {
  try {
    const projects = db.getAllProjects();
    console.log(`📋 Returning ${projects.length} projects`);
    res.json(projects);
  } catch (error) {
    console.error('❌ Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// GET /api/projects/:id - Get project by ID
router.get('/:id', (req, res) => {
  try {
    const project = db.getProjectById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    console.log(`📋 Returning project: ${project.name} (ID: ${project.id})`);
    res.json(project);
  } catch (error) {
    console.error('❌ Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// POST /api/projects - Create new project
router.post('/', (req, res) => {
  try {
    const projectData = req.body;
    console.log('📝 Creating new project:', projectData.name);
    
    const newProject = db.createProject(projectData);
    console.log(`✅ Project created successfully: ${newProject.name} (ID: ${newProject.id})`);
    
    res.status(201).json(newProject);
  } catch (error) {
    console.error('❌ Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// PUT /api/projects/:id - Update project
router.put('/:id', (req, res) => {
  try {
    const projectId = req.params.id;
    const projectData = req.body;
    
    console.log(`📝 Updating project: ${projectId}`);
    
    const updatedProject = db.updateProject({
      ...projectData,
      id: projectId
    });
    
    console.log(`✅ Project updated successfully: ${updatedProject.name} (ID: ${updatedProject.id})`);
    res.json(updatedProject);
  } catch (error) {
    console.error('❌ Error updating project:', error);
    if (error instanceof Error && error.message.includes('not found')) {
      res.status(404).json({ error: 'Project not found' });
    } else {
      res.status(500).json({ error: 'Failed to update project' });
    }
  }
});

// DELETE /api/projects/:id - Delete project
router.delete('/:id', (req, res) => {
  try {
    const projectId = req.params.id;
    console.log(`🗑️ Deleting project: ${projectId}`);
    
    const success = db.deleteProject(projectId);
    if (!success) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    console.log(`✅ Project deleted successfully: ${projectId}`);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// GET /api/projects/stats - Get database stats
router.get('/stats', (req, res) => {
  try {
    const stats = db.getStats();
    console.log('📊 Database stats:', stats);
    res.json(stats);
  } catch (error) {
    console.error('❌ Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// POST /api/projects/reload - Force reload database
router.post('/reload', (req, res) => {
  try {
    console.log('🔄 Reloading database...');
    db.reload();
    const stats = db.getStats();
    console.log('✅ Database reloaded successfully');
    res.json({ message: 'Database reloaded successfully', stats });
  } catch (error) {
    console.error('❌ Error reloading database:', error);
    res.status(500).json({ error: 'Failed to reload database' });
  }
});

// Mock endpoints for compatibility
router.get('/notifications', (req, res) => {
  res.json([]);
});

router.get('/versions', (req, res) => {
  res.json([]);
});

export default router;