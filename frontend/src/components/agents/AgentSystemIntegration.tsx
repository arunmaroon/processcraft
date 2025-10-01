import React from 'react';
import { Brain, ArrowRight } from 'lucide-react';
import AgentSystemDashboard from './AgentSystemDashboard';

interface AgentSystemIntegrationProps {
  onClose: () => void;
}

const AgentSystemIntegration: React.FC<AgentSystemIntegrationProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full h-full max-w-7xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">ProcessCraft Agent System</h2>
              <p className="text-sm text-gray-500">Advanced AI Agent Management Platform</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content */}
        <div className="h-full overflow-hidden">
          <AgentSystemDashboard />
        </div>
      </div>
    </div>
  );
};

export default AgentSystemIntegration;



