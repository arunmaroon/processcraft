import { Project } from '../../types';

interface DesignStageProps {
  project: Project;
  onProjectUpdate: (project: Project) => void;
}

export default function DesignStage({}: DesignStageProps) {
  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">UX Design Stage</h2>
        <p className="text-gray-600">Wireframe generation and user flow design coming soon...</p>
      </div>
    </div>
  );
}
