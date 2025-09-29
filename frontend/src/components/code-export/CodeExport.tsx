import { Project } from '../../types';

interface CodeExportProps {
  project: Project;
  onProjectUpdate: (project: Project) => void;
}

export default function CodeExport({}: CodeExportProps) {
  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Code Export Stage</h2>
        <p className="text-gray-600">Production-ready code generation coming soon...</p>
      </div>
    </div>
  );
}
