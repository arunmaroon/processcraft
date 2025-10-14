import React from 'react';
import { 
  Edit, 
  Share, 
  Download, 
  Star, 
  Archive,
  Users,
  Palette,
  Code,
  CheckCircle,
  Clock,
  FileText,
  MessageCircle,
  Bot,
  ArrowRight,
  Plus,
  BarChart3,
  Target,
  AlertCircle,
  Calendar,
  User
} from 'lucide-react';
import { EnhancedPRD } from '../../types/prd-enhanced';

interface PRDOverviewProps {
  prd: EnhancedPRD;
  onEdit: () => void;
  onStageChange: (stage: string) => void;
}

export default function PRDOverview({ prd, onEdit, onStageChange }: PRDOverviewProps) {
  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Research': return 'text-blue-600 bg-blue-50';
      case 'Design': return 'text-purple-600 bg-purple-50';
      case 'Code': return 'text-green-600 bg-green-50';
      case 'Complete': return 'text-gray-600 bg-gray-50';
      default: return 'text-yellow-600 bg-yellow-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'text-red-600 bg-red-50';
      case 'High': return 'text-orange-600 bg-orange-50';
      case 'Medium': return 'text-yellow-600 bg-yellow-50';
      case 'Low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const workflowStages = [
    { id: 'research', name: 'Research', icon: Users, description: 'User research and requirements gathering' },
    { id: 'design', name: 'Design', icon: Palette, description: 'UX/UI design and prototyping' },
    { id: 'code', name: 'Code', icon: Code, description: 'Development and implementation' },
    { id: 'complete', name: 'Complete', icon: CheckCircle, description: 'Testing and deployment' }
  ];

  const stats = {
    sections: prd.sections.length,
    comments: prd.sections.reduce((acc, section) => acc + section.comments.length, 0),
    aiSuggestions: prd.aiSuggestions.length,
    wordCount: prd.sections.reduce((acc, section) => acc + section.wordCount, 0),
    readingTime: prd.sections.reduce((acc, section) => acc + section.readingTime, 0)
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">{prd.title}</h1>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(prd.priority)}`}>
              {prd.priority}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full ${getStageColor(prd.stage)}`}>
              {prd.stage}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="btn-outline flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit PRD
          </button>
          <button className="btn-ghost flex items-center gap-2">
            <Share className="w-4 h-4" />
            Share
          </button>
          <button className="btn-ghost flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Description */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
        <p className="text-gray-600">{prd.description}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="card">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Sections</p>
              <p className="text-2xl font-bold text-gray-900">{stats.sections}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Comments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.comments}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center gap-3">
            <Bot className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">AI Suggestions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.aiSuggestions}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-orange-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Words</p>
              <p className="text-2xl font-bold text-gray-900">{stats.wordCount.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-gray-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Read Time</p>
              <p className="text-2xl font-bold text-gray-900">{stats.readingTime} min</p>
            </div>
          </div>
        </div>
      </div>

      {/* Workflow Stages */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Workflow Stages</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {workflowStages.map((stage) => (
            <button
              key={stage.id}
              onClick={() => onStageChange(stage.id)}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all group text-left"
            >
              <div className="flex items-center gap-3 mb-2">
                <stage.icon className="w-6 h-6 text-gray-600 group-hover:text-blue-600" />
                <h4 className="font-medium text-gray-900 group-hover:text-blue-600">{stage.name}</h4>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 ml-auto" />
              </div>
              <p className="text-sm text-gray-600">{stage.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Edit className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">PRD updated</p>
              <p className="text-xs text-gray-500">2 hours ago by {prd.owner}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">New comment added</p>
              <p className="text-xs text-gray-500">4 hours ago by Team Member</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">AI suggestion generated</p>
              <p className="text-xs text-gray-500">6 hours ago</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => onStageChange('research')}
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all group"
          >
            <Users className="w-6 h-6 text-blue-600" />
            <div className="text-left">
              <h4 className="font-medium text-gray-900 group-hover:text-blue-600">Start Research</h4>
              <p className="text-sm text-gray-600">Begin user research phase</p>
            </div>
          </button>
          
          <button
            onClick={() => onStageChange('design')}
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all group"
          >
            <Palette className="w-6 h-6 text-purple-600" />
            <div className="text-left">
              <h4 className="font-medium text-gray-900 group-hover:text-purple-600">Start Design</h4>
              <p className="text-sm text-gray-600">Begin design phase</p>
            </div>
          </button>
          
          <button
            onClick={() => onStageChange('code')}
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all group"
          >
            <Code className="w-6 h-6 text-green-600" />
            <div className="text-left">
              <h4 className="font-medium text-gray-900 group-hover:text-green-600">Start Development</h4>
              <p className="text-sm text-gray-600">Begin development phase</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
