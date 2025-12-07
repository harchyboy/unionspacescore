import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useDeleteContact } from '../../api/contacts';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { KeyValue } from '../../components/ui/KeyValue';
import { EmptyState } from '../../components/ui/EmptyState';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { ConfirmModal } from '../../components/ui/Modal';
import { CopyButton } from '../../components/contacts/CopyButton';
import { CommunicationLog, type Communication } from '../../components/contacts/CommunicationLog';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/ui/Toast';
import type { Contact } from '../../types/contact';

const typeLabels: Record<string, string> = {
  'flex-broker': 'Broker',
  'Flex Broker': 'Broker',
  'Broker': 'Broker',
  'broker': 'Broker',
  'disposal-agent': 'Disposal Agent',
  'Disposal Agent': 'Disposal Agent',
  tenant: 'Tenant',
  Tenant: 'Tenant',
  landlord: 'Landlord',
  Landlord: 'Landlord',
  supplier: 'Supplier',
  Supplier: 'Supplier',
  internal: 'Internal',
  Internal: 'Internal',
};

const typeColors: Record<string, string> = {
  'flex-broker': 'bg-black text-white',
  'Flex Broker': 'bg-black text-white',
  'Broker': 'bg-black text-white',
  'broker': 'bg-black text-white',
  'disposal-agent': 'bg-secondary text-white',
  'Disposal Agent': 'bg-secondary text-white',
  tenant: 'bg-accent text-white',
  Tenant: 'bg-accent text-white',
  landlord: 'bg-muted text-primary',
  Landlord: 'bg-muted text-primary',
  supplier: 'bg-muted text-primary',
  Supplier: 'bg-muted text-primary',
};

const typeIcons: Record<string, string> = {
  'flex-broker': 'fa-briefcase',
  'Flex Broker': 'fa-briefcase',
  'Broker': 'fa-briefcase',
  'broker': 'fa-briefcase',
  'disposal-agent': 'fa-building',
  'Disposal Agent': 'fa-building',
  tenant: 'fa-user-tie',
  Tenant: 'fa-user-tie',
  landlord: 'fa-landmark',
  Landlord: 'fa-landmark',
  supplier: 'fa-wrench',
  Supplier: 'fa-wrench',
};

interface ContactDetailsProps {
  contact: Contact;
}

export function ContactDetails({ contact }: ContactDetailsProps) {
  const navigate = useNavigate();
  const deleteContact = useDeleteContact();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { toasts, showToast, removeToast } = useToast();

  // Communications - empty until connected to Zoho
  const communications: Communication[] = [];

  const handleDelete = async () => {
    if (!contact.id) return;
    try {
      await deleteContact.mutateAsync(contact.id);
      showToast('Contact deleted successfully', 'success');
      setTimeout(() => {
        navigate('/contacts');
      }, 500);
    } catch (error) {
      console.error('Error deleting contact:', error);
      showToast('Failed to delete contact', 'error');
    }
  };

  if (!contact) {
    return (
      <div className="p-8">
        <EmptyState
          title="Contact not found"
          description="The contact you're looking for doesn't exist"
          icon="fa-user-slash"
        />
      </div>
    );
  }

  // Generate display values
  const displayName = contact.fullName || `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'Unnamed Contact';
  const initials = displayName.split(' ').map(n => n?.[0] || '').join('').toUpperCase().slice(0, 2);
  const healthScore = contact.relationshipHealthScore || 0;
  const contactType = contact.type || 'internal';
  const typeLabel = typeLabels[contactType] || contactType;
  const typeColor = typeColors[contactType] || 'bg-muted text-primary';
  const typeIcon = typeIcons[contactType] || '';

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          {contact.avatar ? (
            <img
              src={contact.avatar}
              alt={displayName}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 bg-muted border border-[#E6E6E6] rounded-full flex items-center justify-center text-primary text-2xl font-semibold">
              {initials}
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-1">
              <h1 className="text-2xl font-semibold text-primary">{displayName}</h1>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${typeColor}`}>
                {typeIcon && <i className={`fa-solid ${typeIcon} text-[10px]`}></i>}
                {typeLabel}
              </span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-secondary">
              {contact.company && (
                <span className="flex items-center space-x-1">
                  <i className="fa-solid fa-building"></i>
                  <span>{contact.company}</span>
                </span>
              )}
              {contact.territory && (
                <span className="flex items-center space-x-1">
                  <i className="fa-solid fa-location-dot"></i>
                  <span>{contact.territory}</span>
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              icon="fa-envelope"
              size="sm"
              onClick={() => (window.location.href = `mailto:${contact.email}`)}
            >
              New Email
            </Button>
            <Button
              variant="outline"
              icon="fa-phone"
              size="sm"
              onClick={() => {
                if (contact.phone) {
                  window.location.href = `tel:${contact.phone}`;
                } else {
                  showToast('No phone number available', 'error');
                }
              }}
            >
              Log Call
            </Button>
            <Button
              variant="outline"
              icon="fa-calendar"
              size="sm"
              onClick={() => showToast('Create viewing feature coming soon', 'info')}
            >
              Create Viewing
            </Button>
            <Button
              variant="outline"
              icon="fa-plus"
              size="sm"
              onClick={() => showToast('Add to deal feature coming soon', 'info')}
            >
              Add to Deal
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultTab="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="communications">Communications</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Contact Information</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon="fa-pencil"
                        onClick={() => navigate(`/contacts/${contact.id}/edit`)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon="fa-trash"
                        onClick={() => setShowDeleteModal(true)}
                        className="text-destructive hover:text-destructive"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-medium text-secondary uppercase tracking-wider mb-2">
                        Email
                      </label>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-primary">{contact.email}</span>
                        <CopyButton
                          value={contact.email}
                          onCopy={() => showToast('Email copied to clipboard')}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-secondary uppercase tracking-wider mb-2">
                        Phone
                      </label>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-primary">{contact.phone || '-'}</span>
                        {contact.phone && (
                          <CopyButton
                            value={contact.phone}
                            onCopy={() => showToast('Phone number copied to clipboard')}
                          />
                        )}
                      </div>
                    </div>
                    {contact.mobile && (
                      <div>
                        <label className="block text-xs font-medium text-secondary uppercase tracking-wider mb-2">
                          Mobile
                        </label>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-primary">{contact.mobile}</span>
                          <CopyButton
                            value={contact.mobile}
                            onCopy={() => showToast('Mobile number copied to clipboard')}
                          />
                        </div>
                      </div>
                    )}
                    {contact.role && contact.type !== 'flex-broker' && (
                      <KeyValue label="Role" value={contact.role} />
                    )}
                    {contact.territory && <KeyValue label="Territory" value={contact.territory} />}
                    {contact.specialisms && contact.specialisms.length > 0 && (
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-secondary uppercase tracking-wider mb-2">
                          Specialisms
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {contact.specialisms.map((spec, idx) => (
                            <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {contact.preferredSubmarkets && contact.preferredSubmarkets.length > 0 && (
                      <KeyValue
                        label="Preferred Submarkets"
                        value={contact.preferredSubmarkets.join(', ')}
                      />
                    )}
                    {contact.referralSource && (
                      <KeyValue label="Referral Source" value={contact.referralSource} />
                    )}
                    {contact.commissionStructure && (
                      <KeyValue label="Commission Structure" value={contact.commissionStructure} />
                    )}
                    <div>
                      <label className="block text-xs font-medium text-secondary uppercase tracking-wider mb-2">
                        Relationship Health
                      </label>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              healthScore >= 80
                                ? 'bg-primary'
                                : healthScore >= 60
                                  ? 'bg-yellow-500'
                                  : 'bg-destructive'
                            }`}
                            style={{ width: `${healthScore}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-secondary capitalize">
                          {contact.relationshipHealth}
                        </span>
                      </div>
                    </div>
                    {contact.lastContacted && (
                      <KeyValue label="Last Contacted" value={contact.lastActivity || '-'} />
                    )}
                  </div>
                  {contact.notes && (
                    <div className="mt-6 pt-6 border-t border-[#E6E6E6]">
                      <label className="block text-xs font-medium text-secondary uppercase tracking-wider mb-2">
                        Relationship Notes
                      </label>
                      <p className="text-sm text-primary leading-relaxed">{contact.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-xs text-secondary mb-1">Open Deals</div>
                    <div className="text-2xl font-semibold text-primary">{contact.openDeals || 0}</div>
                  </div>
                  <div>
                    <div className="text-xs text-secondary mb-1">Open Viewings</div>
                    <div className="text-2xl font-semibold text-primary">
                      {contact.openViewings || 0}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-secondary mb-1">Total Deals</div>
                    <div className="text-2xl font-semibold text-primary">{contact.totalDeals || 0}</div>
                  </div>
                  <div>
                    <div className="text-xs text-secondary mb-1">Total Viewings</div>
                    <div className="text-2xl font-semibold text-primary">
                      {contact.totalViewings || 0}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-medium text-secondary uppercase tracking-wider mb-2">
                    Referral Volume
                  </label>
                  <div className="text-2xl font-semibold text-primary">
                    {contact.referralVolume ?? '-'}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-secondary uppercase tracking-wider mb-2">
                    Revenue Attribution
                  </label>
                  <div className="text-2xl font-semibold text-primary">
                    {contact.revenueAttribution != null
                      ? `£${contact.revenueAttribution.toLocaleString()}`
                      : '-'}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-secondary uppercase tracking-wider mb-2">
                    Conversion Rate
                  </label>
                  <div className="text-2xl font-semibold text-primary">
                    {contact.conversionRate != null ? `${contact.conversionRate}%` : '-'}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-secondary uppercase tracking-wider mb-2">
                    Commission Paid
                  </label>
                  <div className="text-2xl font-semibold text-primary">
                    {contact.commissionPaid != null
                      ? `£${contact.commissionPaid.toLocaleString()}`
                      : '-'}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-secondary uppercase tracking-wider mb-2">
                    Quality Score
                  </label>
                  <div className="text-2xl font-semibold text-primary">
                    {contact.qualityScore != null ? `${contact.qualityScore}%` : '-'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communications" className="mt-6">
          <CommunicationLog communications={communications} />
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-secondary">Documents will be displayed here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

