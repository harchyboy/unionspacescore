import { Link, useNavigate } from 'react-router-dom';
import type { Contact } from '../../types/contact';
import { Badge } from '../ui/Badge';
import { ContactActionsMenu } from './ContactActionsMenu';
import { useDeleteContact } from '../../api/contacts';
import { ConfirmModal } from '../ui/Modal';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface ContactRowProps {
  contact: Contact;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}

const typeLabels: Record<Contact['type'], string> = {
  'flex-broker': 'Flex Broker',
  'disposal-agent': 'Disposal Agent',
  tenant: 'Tenant',
  landlord: 'Landlord',
  supplier: 'Supplier',
  internal: 'Internal',
};

const typeIcons: Record<Contact['type'], string> = {
  'flex-broker': 'fa-handshake',
  'disposal-agent': 'fa-user-tie',
  tenant: 'fa-building',
  landlord: 'fa-key',
  supplier: 'fa-truck',
  internal: 'fa-user',
};

const healthColors: Record<Contact['relationshipHealth'], 'success' | 'warning' | 'destructive' | 'default'> = {
  excellent: 'success',
  good: 'success',
  fair: 'warning',
  'needs-attention': 'destructive',
};

export function ContactRow({ contact, isSelected, onSelect }: ContactRowProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const deleteContact = useDeleteContact();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const initials = `${contact.firstName[0]}${contact.lastName[0]}`.toUpperCase();

  const handleDelete = async () => {
    try {
      await deleteContact.mutateAsync(contact.id);
      setShowDeleteModal(false);
      // Invalidate queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  return (
    <tr
      className={`hover:bg-muted transition-all-smooth cursor-pointer ${
        isSelected ? 'bg-muted' : ''
      }`}
      onClick={() => onSelect?.(contact.id)}
    >
      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          className="w-4 h-4 text-primary border-[#E6E6E6] rounded focus:ring-primary"
          checked={isSelected}
          onChange={() => onSelect?.(contact.id)}
        />
      </td>
      <td className="px-6 py-4">
        <Link
          to={`/contacts/${contact.id}`}
          className="flex items-center space-x-3"
          onClick={(e) => e.stopPropagation()}
        >
          {contact.avatar ? (
            <img
              src={contact.avatar}
              alt={contact.fullName}
              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
              {initials}
            </div>
          )}
          <div>
            <div className="font-semibold text-primary text-sm">{contact.fullName}</div>
            {contact.role && <div className="text-xs text-secondary">{contact.role}</div>}
          </div>
        </Link>
      </td>
      <td className="px-6 py-4">
        <Badge variant="primary" size="sm">
          <i className={`fa-solid ${typeIcons[contact.type]} mr-1.5`}></i>
          {typeLabels[contact.type]}
        </Badge>
      </td>
      <td className="px-6 py-4 text-sm text-primary">{contact.company || '-'}</td>
      <td className="px-6 py-4 text-sm text-primary">{contact.email}</td>
      <td className="px-6 py-4 text-sm text-secondary">{contact.phone || '-'}</td>
      <td className="px-6 py-4 text-sm text-secondary">{contact.lastActivity || '-'}</td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-2">
          {contact.openDeals ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-primary">
              <i className="fa-solid fa-chart-line mr-1"></i>
              {contact.openDeals} deals
            </span>
          ) : null}
          {contact.openViewings ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-primary">
              <i className="fa-solid fa-eye mr-1"></i>
              {contact.openViewings} viewings
            </span>
          ) : null}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-2">
          <div className="flex-1 bg-muted rounded-full h-2 w-20">
            <div
              className={`h-2 rounded-full ${
                contact.relationshipHealthScore && contact.relationshipHealthScore >= 80
                  ? 'bg-primary'
                  : contact.relationshipHealthScore && contact.relationshipHealthScore >= 60
                    ? 'bg-yellow-500'
                    : 'bg-destructive'
              }`}
              style={{
                width: `${contact.relationshipHealthScore || 0}%`,
              }}
            ></div>
          </div>
          <span className="text-xs text-secondary capitalize">{contact.relationshipHealth}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
        <ContactActionsMenu
          contact={contact}
          onDelete={() => setShowDeleteModal(true)}
        />
      </td>
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Contact"
        message={`Are you sure you want to delete ${contact.fullName}? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        variant="destructive"
      />
    </tr>
  );
}

