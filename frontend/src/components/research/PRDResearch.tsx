import React from 'react';
import { Users, FileText, MessageCircle, Bot, Plus, Search, Filter } from 'lucide-react';
import { EnhancedPRD } from '../../types/prd-enhanced';

interface PRDResearchProps {
  prd: EnhancedPRD;
  onPRDUpdate: (prd: EnhancedPRD) => void;
  onStageChange: (stage: string) => void;
}

export default function PRDResearch({ prd, onPRDUpdate, onStageChange }: PRDResearchProps) {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Research Phase</h1>
          <p className="text-gray-600">User research and requirements gathering for {prd.title}</p>
        </div>
        <button
          onClick={() => onStageChange('design')}
          className="btn-primary"
        >
          Move to Design →
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Research Activities</h3>
            <div className="space-y-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">User Interviews</h4>
                <p className="text-sm text-gray-600 mb-3">Conduct interviews with target users to understand their needs and pain points.</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">In Progress</span>
                  <span className="text-xs text-gray-500">3 of 5 completed</span>
                </div>
              </div>
              
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Competitive Analysis</h4>
                <p className="text-sm text-gray-600 mb-3">Analyze competitors and market landscape to identify opportunities.</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Completed</span>
                  <span className="text-xs text-gray-500">5 competitors analyzed</span>
                </div>
              </div>
              
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">User Personas</h4>
                <p className="text-sm text-gray-600 mb-3">Create detailed user personas based on research findings.</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Pending</span>
                  <span className="text-xs text-gray-500">Waiting for interview data</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Research Tools</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">User Interviews</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <FileText className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">Surveys</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <MessageCircle className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium">Focus Groups</span>
              </button>
            </div>
          </div>
          
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Assistant</h3>
            <div className="space-y-3">
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-900">Research Suggestions</span>
                </div>
                <p className="text-sm text-purple-700">Based on your PRD, I recommend focusing on mobile-first user experience research.</p>
              </div>
              <button className="w-full btn-outline text-sm">
                Ask AI for Research Help
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
