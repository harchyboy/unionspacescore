import { useState } from 'react';

interface CopyButtonProps {
  value: string;
  className?: string;
  onCopy?: () => void;
}

export function CopyButton({ value, className = '', onCopy }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`text-secondary hover:text-primary transition-all-smooth ${className}`}
      title={copied ? 'Copied!' : 'Copy to clipboard'}
      aria-label="Copy to clipboard"
    >
      <i className={`fa-solid ${copied ? 'fa-check' : 'fa-copy'} text-xs`}></i>
    </button>
  );
}

