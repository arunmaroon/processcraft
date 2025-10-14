import React from 'react';
import { CheckCircle, FileText, MessageCircle, Bot, Download, Share, Archive } from 'lucide-react';
import { EnhancedPRD } from '../../types/prd-enhanced';

interface PRDCompleteProps {
  prd: EnhancedPRD;
  onPRDUpdate: (prd: EnhancedPRD) => void;
  onStageChange: (stage: string) => void;
}

export default function PRDComplete({ prd, onPRDUpdate, onStageChange }: PRDCompleteProps) {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Complete Phase</h1>
          <p className="text-gray-600">Testing and deployment for {prd.title}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-outline flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="btn-outline flex items-center gap-2">
            <Share className="w-4 h-4" />
            Share
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Completion Activities</h3>
            <div className="space-y-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Quality Assurance</h4>
                <p className="text-sm text-gray-600 mb-3">Comprehensive testing across all platforms and devices.</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Completed</span>
                  <span className="text-xs text-gray-500">All tests passed</span>
                </div>
              </div>
              
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Deployment</h4>
                <p className="text-sm text-gray-600 mb-3">Deploy to production environment with monitoring.</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Completed</span>
                  <span className="text-xs text-gray-500">Live in production</span>
                </div>
              </div>
              
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Documentation</h4>
                <p className="text-sm text-gray-600 mb-3">Create user guides and technical documentation.</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">In Progress</span>
                  <span className="text-xs text-gray-500">80% completed</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Total Development Time</span>
                <span className="text-sm font-medium">6 weeks</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Team Size</span>
                <span className="text-sm font-medium">5 members</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Features Delivered</span>
                <span className="text-sm font-medium">12 features</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600">Success Rate</span>
                <span className="text-sm font-medium text-green-600">95%</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Next Steps</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <FileText className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">Create New PRD</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <MessageCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">Gather Feedback</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <Archive className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium">Archive Project</span>
              </button>
            </div>
          </div>
          
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Assistant</h3>
            <div className="space-y-3">
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-900">Completion Summary</span>
                </div>
                <p className="text-sm text-purple-700">Great work! The project has been successfully completed with high user satisfaction.</p>
              </div>
              <button className="w-full btn-outline text-sm">
                Generate Project Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
