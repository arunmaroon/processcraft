import React, { useState, useEffect } from 'react';
import { EnhancedPRD } from '../../types/prd-enhanced';
import { enhancedPRDService } from '../../services/enhancedPRDService';
import PRDLayout from '../layout/PRDLayout';
import PRDDashboard from './PRDDashboard';
import PRDOverview from './PRDOverview';
import PRDResearch from './PRDResearch';
import PRDDesign from './PRDDesign';
import PRDCode from './PRDCode';
import PRDComplete from './PRDComplete';
import PRDCreate from './PRDCreate';
import PRDEditor from './PRDEditor';

export default function PRDWorkspace() {
  const [currentPRD, setCurrentPRD] = useState<EnhancedPRD | null>(null);
  const [currentStage, setCurrentStage] = useState<string>('overview');
  const [showCreate, setShowCreate] = useState(false);
  const [showEditor, setShowEditor] = useState(false);

  const handlePRDSelect = (prd: EnhancedPRD) => {
    setCurrentPRD(prd);
    setCurrentStage('overview');
    setShowCreate(false);
    setShowEditor(false);
  };

  const handleCreatePRD = () => {
    setCurrentPRD(null);
    setCurrentStage('overview');
    setShowCreate(true);
    setShowEditor(false);
  };

  const handleStageChange = (stage: string) => {
    setCurrentStage(stage);
  };

  const handlePRDCreated = (prd: EnhancedPRD) => {
    setCurrentPRD(prd);
    setCurrentStage('overview');
    setShowCreate(false);
    setShowEditor(false);
  };

  const handleEditPRD = () => {
    setShowEditor(true);
  };

  const handleBackToDashboard = () => {
    setCurrentPRD(null);
    setCurrentStage('overview');
    setShowCreate(false);
    setShowEditor(false);
  };

  const renderStageContent = () => {
    if (showCreate) {
      return (
        <PRDCreate
          onPRDCreated={handlePRDCreated}
          onCancel={handleBackToDashboard}
        />
      );
    }

    if (showEditor && currentPRD) {
      return (
        <PRDEditor
          prd={currentPRD}
          onSave={(updatedPRD) => {
            setCurrentPRD(updatedPRD);
            setShowEditor(false);
          }}
          onCancel={() => setShowEditor(false)}
        />
      );
    }

    if (!currentPRD) {
      return (
        <PRDDashboard
          onPRDSelect={handlePRDSelect}
          onCreatePRD={handleCreatePRD}
        />
      );
    }

    switch (currentStage) {
      case 'overview':
        return (
          <PRDOverview
            prd={currentPRD}
            onEdit={handleEditPRD}
            onStageChange={handleStageChange}
          />
        );
      case 'research':
        return (
          <PRDResearch
            prd={currentPRD}
            onPRDUpdate={setCurrentPRD}
            onStageChange={handleStageChange}
          />
        );
      case 'design':
        return (
          <PRDDesign
            prd={currentPRD}
            onPRDUpdate={setCurrentPRD}
            onStageChange={handleStageChange}
          />
        );
      case 'code':
        return (
          <PRDCode
            prd={currentPRD}
            onPRDUpdate={setCurrentPRD}
            onStageChange={handleStageChange}
          />
        );
      case 'complete':
        return (
          <PRDComplete
            prd={currentPRD}
            onPRDUpdate={setCurrentPRD}
            onStageChange={handleStageChange}
          />
        );
      default:
        return (
          <PRDOverview
            prd={currentPRD}
            onEdit={handleEditPRD}
            onStageChange={handleStageChange}
          />
        );
    }
  };

  return (
    <PRDLayout
      currentPRD={currentPRD}
      onPRDSelect={handlePRDSelect}
      onCreatePRD={handleCreatePRD}
      onStageChange={handleStageChange}
      currentStage={currentStage}
    >
      {renderStageContent()}
    </PRDLayout>
  );
}
