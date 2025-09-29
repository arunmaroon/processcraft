import { Project } from '../../types';

interface UIGenerationProps {
  project: Project;
  onProjectUpdate: (project: Project) => void;
}

export default function UIGeneration({}: UIGenerationProps) {
  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">UI Generation Stage</h2>
        <p className="text-gray-600">Persona-specific UI generation coming soon...</p>
      </div>
    </div>
  );
}
