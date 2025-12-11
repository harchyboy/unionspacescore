import { useState, useRef, useEffect } from 'react';

interface InlineEditFieldProps {
  label: string;
  value: string | number | undefined;
  onSave: (value: string) => Promise<void> | void;
  type?: 'text' | 'email' | 'tel' | 'number' | 'textarea' | 'select';
  options?: { value: string; label: string }[];
  placeholder?: string;
  format?: (value: string | number | undefined) => string;
  copyable?: boolean;
  onCopy?: () => void;
  className?: string;
  required?: boolean;
  multiline?: boolean;
}

export function InlineEditField({
  label,
  value,
  onSave,
  type = 'text',
  options = [],
  placeholder = '-',
  format,
  copyable = false,
  onCopy,
  className = '',
  required = false,
  multiline = false,
}: InlineEditFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(null);

  // Format the display value
  const displayValue = format ? format(value) : (value?.toString() || placeholder);
  const hasValue = value !== undefined && value !== null && value !== '';

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (inputRef.current instanceof HTMLInputElement || inputRef.current instanceof HTMLTextAreaElement) {
        inputRef.current.select();
      }
    }
  }, [isEditing]);

  const handleEdit = () => {
    setEditValue(value?.toString() || '');
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (required && !editValue.trim()) {
      return; // Don't save if required and empty
    }

    if (editValue === (value?.toString() || '')) {
      setIsEditing(false);
      return; // No change
    }

    setIsSaving(true);
    try {
      await onSave(editValue);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving field:', error);
      // Keep editing mode open on error
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className={className}>
        <label className="block text-xs font-medium text-secondary uppercase tracking-wider mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="flex items-start space-x-2">
          <div className="flex-1">
            {type === 'select' ? (
              <select
                ref={inputRef as React.RefObject<HTMLSelectElement>}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                disabled={isSaving}
                className="w-full px-3 py-2 border border-primary rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white disabled:opacity-50"
              >
                <option value="">Select...</option>
                {options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : multiline || type === 'textarea' ? (
              <textarea
                ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                disabled={isSaving}
                rows={3}
                className="w-full px-3 py-2 border border-primary rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none disabled:opacity-50"
              />
            ) : (
              <input
                ref={inputRef as React.RefObject<HTMLInputElement>}
                type={type}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                disabled={isSaving}
                className="w-full px-3 py-2 border border-primary rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              />
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="p-2 text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
            title="Save"
          >
            {isSaving ? (
              <i className="fa-solid fa-spinner fa-spin text-sm"></i>
            ) : (
              <i className="fa-solid fa-check text-sm"></i>
            )}
          </button>
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className="p-2 text-secondary hover:text-primary transition-colors disabled:opacity-50"
            title="Cancel"
          >
            <i className="fa-solid fa-times text-sm"></i>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <label className="block text-xs font-medium text-secondary uppercase tracking-wider mb-2">
        {label}
      </label>
      <div
        onClick={handleEdit}
        className="group cursor-pointer relative flex items-center space-x-2 py-1 px-2 -mx-2 rounded hover:bg-muted transition-all"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleEdit();
          }
        }}
      >
        <span className={`text-sm flex-1 ${hasValue ? 'text-primary' : 'text-secondary'}`}>
          {displayValue}
        </span>
        
        <div className="flex items-center space-x-1">
          {copyable && hasValue && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onCopy) {
                  onCopy();
                } else if (value) {
                  navigator.clipboard.writeText(value.toString());
                }
              }}
              className="text-secondary hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
            >
              <i className="fa-solid fa-copy text-xs"></i>
            </button>
          )}
          {isHovered && (
            <div className="text-secondary">
              <i className="fa-solid fa-pencil text-xs"></i>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
