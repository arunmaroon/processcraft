import React from 'react';
import { Palette, FileText, MessageCircle, Bot, Plus, Search, Filter } from 'lucide-react';
import { EnhancedPRD } from '../../types/prd-enhanced';

interface PRDDesignProps {
  prd: EnhancedPRD;
  onPRDUpdate: (prd: EnhancedPRD) => void;
  onStageChange: (stage: string) => void;
}

export default function PRDDesign({ prd, onPRDUpdate, onStageChange }: PRDDesignProps) {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Design Phase</h1>
          <p className="text-gray-600">UX/UI design and prototyping for {prd.title}</p>
        </div>
        <button
          onClick={() => onStageChange('code')}
          className="btn-primary"
        >
          Move to Development →
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Design Activities</h3>
            <div className="space-y-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Wireframes</h4>
                <p className="text-sm text-gray-600 mb-3">Create low-fidelity wireframes to define layout and structure.</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Completed</span>
                  <span className="text-xs text-gray-500">12 screens designed</span>
                </div>
              </div>
              
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">High-Fidelity Mockups</h4>
                <p className="text-sm text-gray-600 mb-3">Create detailed visual designs with colors, typography, and spacing.</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">In Progress</span>
                  <span className="text-xs text-gray-500">8 of 12 completed</span>
                </div>
              </div>
              
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Interactive Prototypes</h4>
                <p className="text-sm text-gray-600 mb-3">Build clickable prototypes to test user flows and interactions.</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Pending</span>
                  <span className="text-xs text-gray-500">Waiting for mockups</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Design Tools</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <Palette className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium">Figma</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <FileText className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">Sketch</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <MessageCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">Adobe XD</span>
              </button>
            </div>
          </div>
          
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Assistant</h3>
            <div className="space-y-3">
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-900">Design Suggestions</span>
                </div>
                <p className="text-sm text-purple-700">Consider using a card-based layout for better mobile responsiveness.</p>
              </div>
              <button className="w-full btn-outline text-sm">
                Ask AI for Design Help
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
