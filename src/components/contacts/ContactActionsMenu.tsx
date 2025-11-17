import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Contact } from '../../types/contact';

interface ContactActionsMenuProps {
  contact: Contact;
  onDelete?: () => void;
}

export function ContactActionsMenu({ contact, onDelete }: ContactActionsMenuProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-secondary hover:text-primary transition-all-smooth"
        aria-label="Actions menu"
      >
        <i className="fa-solid fa-ellipsis-vertical"></i>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg border border-[#E6E6E6] shadow-lg z-10">
          <div className="py-1">
            <button
              onClick={() => {
                navigate(`/contacts/${contact.id}/edit`);
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-primary hover:bg-muted transition-all-smooth"
            >
              <i className="fa-solid fa-pencil mr-2"></i>
              Edit Contact
            </button>
            <button
              onClick={() => {
                window.location.href = `mailto:${contact.email}`;
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-primary hover:bg-muted transition-all-smooth"
            >
              <i className="fa-solid fa-envelope mr-2"></i>
              Send Email
            </button>
            {contact.phone && (
              <button
                onClick={() => {
                  window.location.href = `tel:${contact.phone}`;
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-primary hover:bg-muted transition-all-smooth"
              >
                <i className="fa-solid fa-phone mr-2"></i>
                Call
              </button>
            )}
            <div className="border-t border-[#E6E6E6] my-1"></div>
            {onDelete && (
              <button
                onClick={() => {
                  onDelete();
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-muted transition-all-smooth"
              >
                <i className="fa-solid fa-trash mr-2"></i>
                Delete Contact
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

