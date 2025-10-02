import express from 'express';
import { Project, PRD, PRDChange } from '../types';
import { db } from '../database';

const router = express.Router();

// GET /api/multi-prd/:projectId - Get all PRDs for a project
router.get('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = db.getProjectById(projectId);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const prds = project.prds || [];
    res.json({
      success: true,
      prds,
      activePRDId: project.activePRDId,
      total: prds.length
    });
  } catch (error) {
    console.error('Error fetching PRDs:', error);
    res.status(500).json({ error: 'Failed to fetch PRDs' });
  }
});

// POST /api/multi-prd/:projectId - Create a new PRD for a project
router.post('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const prdData: Partial<PRD> = req.body;
    
    const project = db.getProjectById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Generate new PRD ID and set defaults
    const newPRD: PRD = {
      id: `prd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: prdData.title || 'Untitled PRD',
      description: prdData.description || '',
      objectives: prdData.objectives || [],
      targetUsers: prdData.targetUsers || [],
      successMetrics: prdData.successMetrics || [],
      businessContext: prdData.businessContext || '',
      constraints: prdData.constraints || [],
      status: prdData.status || 'DRAFT',
      feedback: prdData.feedback,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: prdData.createdBy || 'current-user',
      lastModifiedBy: prdData.lastModifiedBy || 'current-user',
      version: prdData.version || '1.0',
      isActive: prdData.isActive || false,
      tags: prdData.tags || [],
      generatedContent: prdData.generatedContent,
      sections: prdData.sections,
      parentPRDId: prdData.parentPRDId,
      changeLog: [{
        id: `change_${Date.now()}`,
        timestamp: new Date().toISOString(),
        changedBy: prdData.createdBy || 'current-user',
        changeType: 'CREATED',
        description: 'PRD created'
      }]
    };

    // Add PRD to project
    const updatedProject = {
      ...project,
      prds: [...(project.prds || []), newPRD],
      updatedAt: new Date().toISOString()
    };

    db.updateProject(updatedProject);

    res.json({
      success: true,
      prd: newPRD,
      message: 'PRD created successfully'
    });
  } catch (error) {
    console.error('Error creating PRD:', error);
    res.status(500).json({ error: 'Failed to create PRD' });
  }
});

// PUT /api/multi-prd/:projectId/:prdId - Update a specific PRD
router.put('/:projectId/:prdId', async (req, res) => {
  try {
    const { projectId, prdId } = req.params;
    const updates: Partial<PRD> = req.body;
    
    const project = db.getProjectById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const prds = project.prds || [];
    const prdIndex = prds.findIndex(prd => prd.id === prdId);
    
    if (prdIndex === -1) {
      return res.status(404).json({ error: 'PRD not found' });
    }

    const currentPRD = prds[prdIndex];
    const updatedPRD = {
      ...currentPRD,
      ...updates,
      id: prdId, // Ensure ID doesn't change
      updatedAt: new Date().toISOString(),
      lastModifiedBy: updates.lastModifiedBy || currentPRD.lastModifiedBy,
      changeLog: [
        ...(currentPRD.changeLog || []),
        {
          id: `change_${Date.now()}`,
          timestamp: new Date().toISOString(),
          changedBy: updates.lastModifiedBy || currentPRD.lastModifiedBy,
          changeType: 'UPDATED',
          description: 'PRD updated',
          field: Object.keys(updates).join(', ')
        }
      ]
    };

    // Update the PRD in the array
    prds[prdIndex] = updatedPRD;

    const updatedProject = {
      ...project,
      prds,
      updatedAt: new Date().toISOString()
    };

    db.updateProject(updatedProject);

    res.json({
      success: true,
      prd: updatedPRD,
      message: 'PRD updated successfully'
    });
  } catch (error) {
    console.error('Error updating PRD:', error);
    res.status(500).json({ error: 'Failed to update PRD' });
  }
});

// DELETE /api/multi-prd/:projectId/:prdId - Delete a specific PRD
router.delete('/:projectId/:prdId', async (req, res) => {
  try {
    const { projectId, prdId } = req.params;
    
    const project = db.getProjectById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const prds = project.prds || [];
    const prdIndex = prds.findIndex(prd => prd.id === prdId);
    
    if (prdIndex === -1) {
      return res.status(404).json({ error: 'PRD not found' });
    }

    // Remove the PRD from the array
    const updatedPrds = prds.filter(prd => prd.id !== prdId);
    
    // If this was the active PRD, clear the active PRD ID
    const activePRDId = project.activePRDId === prdId ? undefined : project.activePRDId;

    const updatedProject = {
      ...project,
      prds: updatedPrds,
      activePRDId,
      updatedAt: new Date().toISOString()
    };

    db.updateProject(updatedProject);

    res.json({
      success: true,
      message: 'PRD deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting PRD:', error);
    res.status(500).json({ error: 'Failed to delete PRD' });
  }
});

// PUT /api/multi-prd/:projectId/:prdId/set-active - Set a PRD as active
router.put('/:projectId/:prdId/set-active', async (req, res) => {
  try {
    const { projectId, prdId } = req.params;
    
    const project = db.getProjectById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const prds = project.prds || [];
    const prd = prds.find(p => p.id === prdId);
    
    if (!prd) {
      return res.status(404).json({ error: 'PRD not found' });
    }

    // Set all PRDs as inactive first
    const updatedPrds = prds.map(p => ({
      ...p,
      isActive: p.id === prdId
    }));

    const updatedProject = {
      ...project,
      prds: updatedPrds,
      activePRDId: prdId,
      updatedAt: new Date().toISOString()
    };

    db.updateProject(updatedProject);

    res.json({
      success: true,
      message: 'PRD set as active',
      activePRDId: prdId
    });
  } catch (error) {
    console.error('Error setting active PRD:', error);
    res.status(500).json({ error: 'Failed to set active PRD' });
  }
});

// POST /api/multi-prd/:projectId/:prdId/copy - Copy a PRD
router.post('/:projectId/:prdId/copy', async (req, res) => {
  try {
    const { projectId, prdId } = req.params;
    const { newTitle } = req.body;
    
    const project = db.getProjectById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const prds = project.prds || [];
    const originalPRD = prds.find(p => p.id === prdId);
    
    if (!originalPRD) {
      return res.status(404).json({ error: 'PRD not found' });
    }

    // Create a copy of the PRD
    const copiedPRD: PRD = {
      ...originalPRD,
      id: `prd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: newTitle || `${originalPRD.title} (Copy)`,
      isActive: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastModifiedBy: 'current-user',
      changeLog: [{
        id: `change_${Date.now()}`,
        timestamp: new Date().toISOString(),
        changedBy: 'current-user',
        changeType: 'CREATED',
        description: `PRD copied from ${originalPRD.title}`
      }]
    };

    // Add the copied PRD to the project
    const updatedProject = {
      ...project,
      prds: [...prds, copiedPRD],
      updatedAt: new Date().toISOString()
    };

    db.updateProject(updatedProject);

    res.json({
      success: true,
      prd: copiedPRD,
      message: 'PRD copied successfully'
    });
  } catch (error) {
    console.error('Error copying PRD:', error);
    res.status(500).json({ error: 'Failed to copy PRD' });
  }
});

// GET /api/multi-prd/:projectId/:prdId/versions - Get version history for a PRD
router.get('/:projectId/:prdId/versions', async (req, res) => {
  try {
    const { projectId, prdId } = req.params;
    
    const project = db.getProjectById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const prds = project.prds || [];
    const prd = prds.find(p => p.id === prdId);
    
    if (!prd) {
      return res.status(404).json({ error: 'PRD not found' });
    }

    // Find all versions of this PRD (including parent and children)
    const versions = prds.filter(p => 
      p.id === prdId || 
      p.parentPRDId === prdId || 
      (prd.parentPRDId && p.id === prd.parentPRDId)
    ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    res.json({
      success: true,
      versions,
      currentVersion: prd
    });
  } catch (error) {
    console.error('Error fetching PRD versions:', error);
    res.status(500).json({ error: 'Failed to fetch PRD versions' });
  }
});

// POST /api/multi-prd/:projectId/:prdId/create-version - Create a new version of a PRD
router.post('/:projectId/:prdId/create-version', async (req, res) => {
  try {
    const { projectId, prdId } = req.params;
    const { versionNumber, changes } = req.body;
    
    const project = db.getProjectById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const prds = project.prds || [];
    const originalPRD = prds.find(p => p.id === prdId);
    
    if (!originalPRD) {
      return res.status(404).json({ error: 'PRD not found' });
    }

    // Create a new version
    const newVersion: PRD = {
      ...originalPRD,
      id: `prd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      version: versionNumber || incrementVersion(originalPRD.version),
      parentPRDId: originalPRD.parentPRDId || originalPRD.id,
      isActive: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastModifiedBy: 'current-user',
      changeLog: [
        ...(originalPRD.changeLog || []),
        {
          id: `change_${Date.now()}`,
          timestamp: new Date().toISOString(),
          changedBy: 'current-user',
          changeType: 'VERSION_CREATED',
          description: `Version ${versionNumber || incrementVersion(originalPRD.version)} created`,
          field: changes || 'version'
        }
      ]
    };

    // Add the new version to the project
    const updatedProject = {
      ...project,
      prds: [...prds, newVersion],
      updatedAt: new Date().toISOString()
    };

    db.updateProject(updatedProject);

    res.json({
      success: true,
      prd: newVersion,
      message: 'PRD version created successfully'
    });
  } catch (error) {
    console.error('Error creating PRD version:', error);
    res.status(500).json({ error: 'Failed to create PRD version' });
  }
});

// Helper function to increment version number
function incrementVersion(version: string): string {
  const parts = version.split('.');
  const major = parseInt(parts[0]) || 1;
  const minor = parseInt(parts[1]) || 0;
  return `${major}.${minor + 1}`;
}

export default router;
