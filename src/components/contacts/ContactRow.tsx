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
      } catch (error) {
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

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'flex-broker': return 'Broker';
      case 'disposal-agent': return 'Disposal Agent';
      case 'tenant': return 'Tenant';
      case 'landlord': return 'Landlord';
      case 'supplier': return 'Supplier';
      case 'internal': return 'Internal';
      default: return type;
    }
  };

  const getHealthBadgeColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'fair': return 'bg-yellow-100 text-yellow-800';
      case 'needs-attention': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <TableRow onClick={onSelect} className="group">
      <TableCell>
        <input
          type="checkbox"
          className="w-4 h-4 text-primary border-[#E6E6E6] rounded focus:ring-primary"
          onClick={(e) => e.stopPropagation()}
        />
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-3">
          {contact.avatar ? (
            <img
              src={contact.avatar}
              alt={contact.fullName}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-semibold">
              {contact.firstName?.[0]}
              {contact.lastName?.[0]}
            </div>
          )}
          <div>
            <div className="font-medium text-primary">{contact.fullName}</div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
          contact.type === 'flex-broker' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'
        }`}>
          {contact.type === 'flex-broker' && <i className="fa-solid fa-briefcase text-[10px]"></i>}
          {getTypeLabel(contact.type)}
        </span>
      </TableCell>
      <TableCell>{contact.company || '—'}</TableCell>
      <TableCell>{contact.email}</TableCell>
      <TableCell>{contact.phone || contact.mobile || '—'}</TableCell>
      <TableCell>{contact.lastActivity || 'Never'}</TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
           <span>{contact.openDeals || 0} deals</span>
        </div>
      </TableCell>
      <TableCell>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getHealthBadgeColor(contact.relationshipHealth)} capitalize`}>
          {contact.relationshipHealth.replace('-', ' ')}
        </span>
      </TableCell>
      <TableCell align="right">
        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
            className="text-secondary hover:text-primary p-1 rounded-md hover:bg-gray-100"
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

