import { useState } from 'react';
import { Copy, Check, Edit3 } from 'lucide-react';
import Button from './Button';

interface CopyButtonProps {
  text: string;
  label: string;
  onCopy?: (text: string, label: string) => void;
  showEdit?: boolean;
  onEdit?: () => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'outline' | 'ghost';
  className?: string;
}

export default function CopyButton({ 
  text, 
  label, 
  onCopy, 
  showEdit = false, 
  onEdit,
  size = 'sm',
  variant = 'outline',
  className = ''
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      onCopy?.(text, label);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <Button
        size={size}
        variant={variant}
        onClick={handleCopy}
        className="flex-1"
        disabled={copied}
      >
        {copied ? (
          <span className="flex items-center gap-2">
            <Check size={14} className="text-green-600" />
            Copied!
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Copy size={14} />
            Copy {label}
          </span>
        )}
      </Button>
      
      {showEdit && onEdit && (
        <Button
          size={size}
          variant="ghost"
          onClick={onEdit}
          className="px-3"
        >
          <Edit3 size={14} />
        </Button>
      )}
    </div>
  );
}