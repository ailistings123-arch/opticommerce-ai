import { useState } from 'react';
import { Edit3, Save, X, RotateCcw, Sparkles } from 'lucide-react';
import Button from '@/components/ui/Button';
import CharacterCounter from '@/components/ui/CharacterCounter';
import { useToast } from '@/lib/hooks/useToast';

interface EditableContentProps {
  label: string;
  content: string;
  maxLength?: number;
  optimal?: { min: number; max: number };
  multiline?: boolean;
  onSave: (newContent: string) => void;
  onRegenerate?: () => void;
  placeholder?: string;
}

export default function EditableContent({
  label,
  content,
  maxLength = 200,
  optimal,
  multiline = false,
  onSave,
  onRegenerate,
  placeholder
}: EditableContentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [originalContent] = useState(content);
  const { success } = useToast();

  const handleSave = () => {
    onSave(editedContent);
    setIsEditing(false);
    success('Saved!', `${label} has been updated`);
  };

  const handleCancel = () => {
    setEditedContent(content);
    setIsEditing(false);
  };

  const handleRestore = () => {
    setEditedContent(originalContent);
    success('Restored', `${label} restored to AI-generated version`);
  };

  const handleRegenerate = () => {
    if (onRegenerate) {
      onRegenerate();
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-3">
        <div className="relative">
          {multiline ? (
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              maxLength={maxLength}
              placeholder={placeholder}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={6}
            />
          ) : (
            <input
              type="text"
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              maxLength={maxLength}
              placeholder={placeholder}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          )}
        </div>

        <CharacterCounter
          current={editedContent.length}
          max={maxLength}
          optimal={optimal}
        />

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleSave}
            size="sm"
            className="flex items-center gap-2"
          >
            <Save size={14} />
            Save Changes
          </Button>
          
          <Button
            onClick={handleCancel}
            size="sm"
            variant="outline"
            className="flex items-center gap-2"
          >
            <X size={14} />
            Cancel
          </Button>

          <Button
            onClick={handleRestore}
            size="sm"
            variant="ghost"
            className="flex items-center gap-2"
          >
            <RotateCcw size={14} />
            Restore Original
          </Button>

          {onRegenerate && (
            <Button
              onClick={handleRegenerate}
              size="sm"
              variant="ghost"
              className="flex items-center gap-2 text-purple-600 hover:text-purple-700"
            >
              <Sparkles size={14} />
              Regenerate
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="group">
      <div 
        className="p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border-2 border-blue-200 cursor-pointer hover:border-blue-300 transition-colors"
        onClick={() => setIsEditing(true)}
      >
        <p className="text-sm text-gray-900 font-medium whitespace-pre-wrap">
          {content}
        </p>
        
        <div className="flex items-center justify-between mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <CharacterCounter
            current={content.length}
            max={maxLength}
            optimal={optimal}
            className="text-xs"
          />
          
          <div className="flex items-center gap-1 text-xs text-blue-600">
            <Edit3 size={12} />
            Click to edit
          </div>
        </div>
      </div>
    </div>
  );
}