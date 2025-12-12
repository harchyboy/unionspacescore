import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { TableRow, TableCell } from '../ui/Table';
import { useDeleteContact } from '../../api/contacts';
import { useToast } from '../../hooks/useToast';
import type { Contact } from '../../types/contact';

interface ContactRowProps {
  contact: Contact;
  onSelect: () => void;
}

export function ContactRow({ contact, onSelect }: ContactRowProps) {
  const navigate = useNavigate();
  const deleteContact = useDeleteContact();
  const { showToast } = useToast();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const initials = `${contact.firstName?.[0] ?? ''}${contact.lastName?.[0] ?? ''}`.trim() || contact.fullName?.[0] || '?';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await deleteContact.mutateAsync(contact.id);
        showToast('Contact deleted', 'success');
      } catch {
        showToast('Failed to delete contact', 'error');
      }
    }
    setIsMenuOpen(false);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/contacts/${contact.id}/edit`);
    setIsMenuOpen(false);
  };

  const handleViewZoho = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Construct Zoho URL (using standard URL structure)
    window.open(`https://crm.zoho.eu/crm/org20066258959/tab/Contacts/${contact.id}`, '_blank');
    setIsMenuOpen(false);
  };

  // Type metadata matching HTML version
  const getTypeMeta = (type: string) => {
    switch (type) {
      case 'Broker':
        return { label: 'Broker', icon: 'fa-briefcase', badgeClass: 'bg-[#252525] text-white' };
      case 'Disposal Agent':
        return { label: 'Disposal Agent', icon: 'fa-building', badgeClass: 'bg-secondary text-white' };
      case 'Tenant':
        return { label: 'Tenant', icon: 'fa-user-tie', badgeClass: 'bg-accent text-white' };
      case 'Landlord':
        return { label: 'Landlord', icon: 'fa-landmark', badgeClass: 'bg-muted text-primary' };
      case 'Supplier':
        return { label: 'Supplier', icon: 'fa-wrench', badgeClass: 'bg-muted text-primary' };
      default:
        return { label: type || 'Contact', icon: 'fa-user', badgeClass: 'bg-muted text-primary' };
    }
  };

  const getHealthBadgeColor = (health: string) => {
    switch (health) {
      // Excellent/Good -> Active style (Slate background, Stone text)
      case 'excellent': return 'bg-primary text-[#F0F0F0]';
      case 'good': return 'bg-primary text-[#F0F0F0]';
      
      // Fair -> Pending style (Stone background, Slate text, Concrete border)
      case 'fair': return 'bg-[#F0F0F0] text-primary border border-secondary';
      
      // Needs Attention -> Confirmed style (White background, Slate text, Concrete border)
      // using border-primary to emphasize "attention" within monochromatic constraints
      case 'needs-attention': return 'bg-white text-primary border border-primary';
      
      default: return 'bg-[#F0F0F0] text-primary';
    }
  };

  const typeMeta = getTypeMeta(contact.type);

  return (
    <TableRow onClick={onSelect} className="group">
      {/* Checkbox */}
      <TableCell>
        <input
          type="checkbox"
          className="w-4 h-4 text-primary border-[#E6E6E6] rounded focus:ring-primary"
          onClick={(e) => e.stopPropagation()}
        />
      </TableCell>
      
      {/* Name + Last Activity (under name, not separate column) */}
      <TableCell>
        <div className="flex items-center space-x-3">
          <div className="relative w-10 h-10 flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-[#3d3d3d] flex items-center justify-center text-white font-semibold">
              {initials}
            </div>
            {contact.avatar && (
              <img
                src={contact.avatar}
                alt={contact.fullName}
                className="absolute inset-0 w-10 h-10 rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
          </div>
            <div>
              <div className="font-semibold text-primary text-sm">{contact.fullName}</div>
              {/* Hide timestamp; show dash */}
              <div className="text-xs text-secondary">—</div>
            </div>
        </div>
      </TableCell>
      
      {/* Type badge - rounded with uppercase text (no icon) */}
      <TableCell>
        <span className={`inline-flex items-center px-3 py-1 rounded text-[11px] font-bold uppercase tracking-wider ${typeMeta.badgeClass}`}>
          {typeMeta.label}
        </span>
      </TableCell>
      
      {/* Company */}
      <TableCell>{contact.company || '—'}</TableCell>
      
      {/* Email */}
      <TableCell>{contact.email}</TableCell>
      
      {/* Phone */}
      <TableCell className="text-secondary">{contact.phone || contact.mobile || '—'}</TableCell>
      
      {/* Open Items - "Not tracked" badge style */}
      <TableCell>
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-primary">
          <i className="fa-solid fa-chart-line mr-1"></i>
          Not tracked
        </span>
      </TableCell>
      
      {/* Health badge with circle indicator */}
      <TableCell>
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getHealthBadgeColor(contact.relationshipHealth)}`}>
          <i className="fa-solid fa-circle mr-1.5 text-[6px]"></i>
          {contact.relationshipHealth === 'needs-attention' ? 'Needs Attention' : 
           contact.relationshipHealth.charAt(0).toUpperCase() + contact.relationshipHealth.slice(1)}
        </span>
      </TableCell>
      
      {/* Actions menu */}
      <TableCell align="right">
        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
            className="text-secondary hover:text-primary"
          >
            <i className="fa-solid fa-ellipsis-vertical"></i>
          </button>
          
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200 py-1 text-left">
              <button
                onClick={handleEdit}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <i className="fa-solid fa-pencil mr-2 w-4"></i> Edit
              </button>
              <button
                onClick={handleViewZoho}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <i className="fa-solid fa-external-link-alt mr-2 w-4"></i> View in Zoho
              </button>
              <button
                onClick={handleDelete}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                <i className="fa-solid fa-trash mr-2 w-4"></i> Delete
              </button>
            </div>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

