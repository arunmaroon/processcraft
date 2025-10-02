import React, { useState, useRef, useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  List, 
  ListOrdered, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Indent,
  Outdent,
  Link,
  Image,
  Table,
  Code,
  Save,
  Download,
  Eye,
  Edit3,
  CheckCircle,
  X
} from 'lucide-react';

interface PRDEditorProps {
  content: string;
  onContentChange: (content: string) => void;
  onSave: () => void;
  onFinalize: () => void;
  isEditing?: boolean;
  onToggleEdit?: () => void;
}

export default function PRDEditor({ 
  content, 
  onContentChange, 
  onSave, 
  onFinalize, 
  isEditing = true,
  onToggleEdit 
}: PRDEditorProps) {
  const [isPreview, setIsPreview] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const insertTable = () => {
    const rows = prompt('Number of rows:', '3');
    const cols = prompt('Number of columns:', '3');
    if (rows && cols) {
      let tableHTML = '<table border="1" style="border-collapse: collapse; width: 100%;">';
      for (let i = 0; i < parseInt(rows); i++) {
        tableHTML += '<tr>';
        for (let j = 0; j < parseInt(cols); j++) {
          tableHTML += `<td style="padding: 8px; border: 1px solid #ccc;">Cell ${i + 1},${j + 1}</td>`;
        }
        tableHTML += '</tr>';
      }
      tableHTML += '</table>';
      execCommand('insertHTML', tableHTML);
    }
  };

  const insertCodeBlock = () => {
    execCommand('insertHTML', '<pre style="background: #f4f4f4; padding: 10px; border-radius: 4px; border-left: 4px solid #007acc;"><code>// Your code here</code></pre>');
  };

  const handleContentChange = () => {
    if (editorRef.current) {
      onContentChange(editorRef.current.innerHTML);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          execCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          execCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          execCommand('underline');
          break;
        case 's':
          e.preventDefault();
          execCommand('strikeThrough');
          break;
        case 'k':
          e.preventDefault();
          insertLink();
          break;
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-1">
          {/* Text Formatting */}
          <div className="flex items-center space-x-1 pr-2 border-r border-gray-300">
            <button
              onClick={() => execCommand('bold')}
              className="p-2 hover:bg-gray-200 rounded"
              title="Bold (Ctrl+B)"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={() => execCommand('italic')}
              className="p-2 hover:bg-gray-200 rounded"
              title="Italic (Ctrl+I)"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              onClick={() => execCommand('underline')}
              className="p-2 hover:bg-gray-200 rounded"
              title="Underline (Ctrl+U)"
            >
              <Underline className="w-4 h-4" />
            </button>
            <button
              onClick={() => execCommand('strikeThrough')}
              className="p-2 hover:bg-gray-200 rounded"
              title="Strikethrough (Ctrl+S)"
            >
              <Strikethrough className="w-4 h-4" />
            </button>
          </div>

          {/* Lists */}
          <div className="flex items-center space-x-1 pr-2 border-r border-gray-300">
            <button
              onClick={() => execCommand('insertUnorderedList')}
              className="p-2 hover:bg-gray-200 rounded"
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => execCommand('insertOrderedList')}
              className="p-2 hover:bg-gray-200 rounded"
              title="Numbered List"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
          </div>

          {/* Alignment */}
          <div className="flex items-center space-x-1 pr-2 border-r border-gray-300">
            <button
              onClick={() => execCommand('justifyLeft')}
              className="p-2 hover:bg-gray-200 rounded"
              title="Align Left"
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => execCommand('justifyCenter')}
              className="p-2 hover:bg-gray-200 rounded"
              title="Align Center"
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              onClick={() => execCommand('justifyRight')}
              className="p-2 hover:bg-gray-200 rounded"
              title="Align Right"
            >
              <AlignRight className="w-4 h-4" />
            </button>
          </div>

          {/* Indentation */}
          <div className="flex items-center space-x-1 pr-2 border-r border-gray-300">
            <button
              onClick={() => execCommand('indent')}
              className="p-2 hover:bg-gray-200 rounded"
              title="Indent"
            >
              <Indent className="w-4 h-4" />
            </button>
            <button
              onClick={() => execCommand('outdent')}
              className="p-2 hover:bg-gray-200 rounded"
              title="Outdent"
            >
              <Outdent className="w-4 h-4" />
            </button>
          </div>

          {/* Insert Elements */}
          <div className="flex items-center space-x-1">
            <button
              onClick={insertLink}
              className="p-2 hover:bg-gray-200 rounded"
              title="Insert Link (Ctrl+K)"
            >
              <Link className="w-4 h-4" />
            </button>
            <button
              onClick={insertTable}
              className="p-2 hover:bg-gray-200 rounded"
              title="Insert Table"
            >
              <Table className="w-4 h-4" />
            </button>
            <button
              onClick={insertCodeBlock}
              className="p-2 hover:bg-gray-200 rounded"
              title="Insert Code Block"
            >
              <Code className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsPreview(!isPreview)}
            className="flex items-center space-x-1 px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
          >
            {isPreview ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{isPreview ? 'Edit' : 'Preview'}</span>
          </button>
          
          {onToggleEdit && (
            <button
              onClick={onToggleEdit}
              className="flex items-center space-x-1 px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
            >
              {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
              <span>{isEditing ? 'Cancel' : 'Edit'}</span>
            </button>
          )}
          
          <button
            onClick={onSave}
            className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Save className="w-4 h-4" />
            <span>Save</span>
          </button>
          
          <button
            onClick={onFinalize}
            className="flex items-center space-x-1 px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Finalize PRD</span>
          </button>
        </div>
      </div>

      {/* Editor/Preview Area */}
      <div className="flex-1 overflow-hidden">
        {isPreview ? (
          <div className="h-full overflow-y-auto p-6">
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        ) : (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleContentChange}
            onKeyDown={handleKeyDown}
            className="h-full overflow-y-auto p-6 focus:outline-none"
            style={{ minHeight: '500px' }}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}
      </div>
    </div>
  );
}








