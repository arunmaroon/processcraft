import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  List, 
  ListOrdered, 
  Quote, 
  Undo, 
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Save,
  CheckCircle
} from 'lucide-react';
import Button from '../shared/Button';

interface PRDRichEditorProps {
  content: string;
  onSave: (content: string) => void;
  onFinalize: (content: string) => void;
  isEditing?: boolean;
  onEditToggle?: () => void;
}

const PRDRichEditor: React.FC<PRDRichEditorProps> = ({
  content,
  onSave,
  onFinalize,
  isEditing = false,
  onEditToggle
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Placeholder.configure({
        placeholder: 'Start writing your PRD content...',
      }),
      TextStyle,
      Color,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:text-blue-800 underline',
        },
      }),
    ],
    content: content,
    editable: isEditing,
    onUpdate: ({ editor }) => {
      // Auto-save functionality could be added here
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const handleSave = async () => {
    if (!editor) return;
    
    setIsSaving(true);
    const htmlContent = editor.getHTML();
    
    try {
      await onSave(htmlContent);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving PRD:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFinalize = async () => {
    if (!editor) return;
    
    setIsSaving(true);
    const htmlContent = editor.getHTML();
    
    try {
      await onFinalize(htmlContent);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error finalizing PRD:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const MenuButton = ({ 
    onClick, 
    isActive = false, 
    children, 
    title 
  }: { 
    onClick: () => void; 
    isActive?: boolean; 
    children: React.ReactNode; 
    title: string;
  }) => (
    <button
      onClick={onClick}
      className={`p-2 rounded hover:bg-gray-100 transition-colors ${
        isActive ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
      }`}
      title={title}
    >
      {children}
    </button>
  );

  if (!editor) {
    return <div className="p-8 text-center text-gray-500">Loading editor...</div>;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Toolbar */}
      {isEditing && (
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              {/* Text Formatting */}
              <MenuButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                isActive={editor.isActive('bold')}
                title="Bold"
              >
                <Bold className="w-4 h-4" />
              </MenuButton>
              
              <MenuButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                isActive={editor.isActive('italic')}
                title="Italic"
              >
                <Italic className="w-4 h-4" />
              </MenuButton>
              
              <MenuButton
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                isActive={editor.isActive('underline')}
                title="Underline"
              >
                <UnderlineIcon className="w-4 h-4" />
              </MenuButton>

              <div className="w-px h-6 bg-gray-300 mx-2" />

              {/* Lists */}
              <MenuButton
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                isActive={editor.isActive('bulletList')}
                title="Bullet List"
              >
                <List className="w-4 h-4" />
              </MenuButton>
              
              <MenuButton
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                isActive={editor.isActive('orderedList')}
                title="Numbered List"
              >
                <ListOrdered className="w-4 h-4" />
              </MenuButton>

              <div className="w-px h-6 bg-gray-300 mx-2" />

              {/* Headings */}
              <MenuButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                isActive={editor.isActive('heading', { level: 1 })}
                title="Heading 1"
              >
                H1
              </MenuButton>
              
              <MenuButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                isActive={editor.isActive('heading', { level: 2 })}
                title="Heading 2"
              >
                H2
              </MenuButton>
              
              <MenuButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                isActive={editor.isActive('heading', { level: 3 })}
                title="Heading 3"
              >
                H3
              </MenuButton>

              <div className="w-px h-6 bg-gray-300 mx-2" />

              {/* Alignment */}
              <MenuButton
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                isActive={editor.isActive({ textAlign: 'left' })}
                title="Align Left"
              >
                <AlignLeft className="w-4 h-4" />
              </MenuButton>
              
              <MenuButton
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                isActive={editor.isActive({ textAlign: 'center' })}
                title="Align Center"
              >
                <AlignCenter className="w-4 h-4" />
              </MenuButton>
              
              <MenuButton
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                isActive={editor.isActive({ textAlign: 'right' })}
                title="Align Right"
              >
                <AlignRight className="w-4 h-4" />
              </MenuButton>

              <div className="w-px h-6 bg-gray-300 mx-2" />

              {/* Undo/Redo */}
              <MenuButton
                onClick={() => editor.chain().focus().undo().run()}
                title="Undo"
              >
                <Undo className="w-4 h-4" />
              </MenuButton>
              
              <MenuButton
                onClick={() => editor.chain().focus().redo().run()}
                title="Redo"
              >
                <Redo className="w-4 h-4" />
              </MenuButton>
            </div>

            <div className="flex items-center space-x-2">
              {onEditToggle && (
                <Button
                  onClick={onEditToggle}
                  variant="outline"
                  className="text-sm"
                >
                  View Mode
                </Button>
              )}
              
              <Button
                onClick={handleSave}
                loading={isSaving}
                leftIcon={<Save className="w-4 h-4" />}
                variant="outline"
                className="text-sm"
              >
                Save
              </Button>
              
              <Button
                onClick={handleFinalize}
                loading={isSaving}
                leftIcon={<CheckCircle className="w-4 h-4" />}
                className="text-sm bg-green-600 hover:bg-green-700"
              >
                Finalize
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {showSuccess && (
        <div className="bg-green-50 border-b border-green-200 px-4 py-2">
          <div className="flex items-center text-green-800 text-sm">
            <CheckCircle className="w-4 h-4 mr-2" />
            PRD saved successfully!
          </div>
        </div>
      )}

      {/* Editor Content */}
      <div className="p-6">
        <EditorContent 
          editor={editor} 
          className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700 focus:outline-none"
        />
      </div>

      {/* View Mode Actions */}
      {!isEditing && onEditToggle && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Click "Edit" to modify the PRD content
            </p>
            <Button
              onClick={onEditToggle}
              leftIcon={<Edit className="w-4 h-4" />}
              className="text-sm"
            >
              Edit PRD
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PRDRichEditor;

