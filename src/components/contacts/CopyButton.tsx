import { useState } from 'react';

interface CopyButtonProps {
  value: string;
  onCopy?: () => void;
}

export function CopyButton({ value, onCopy }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="text-secondary hover:text-primary transition-all-smooth p-1"
      title={copied ? 'Copied!' : 'Copy to clipboard'}
    >
      <i className={`fa-solid ${copied ? 'fa-check' : 'fa-copy'} text-xs`}></i>
    </button>
  );
}

