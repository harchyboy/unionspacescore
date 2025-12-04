import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useContact, useDeleteContact } from '../../api/contacts';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { KeyValue } from '../../components/ui/KeyValue';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { ConfirmModal } from '../../components/ui/Modal';
import { CopyButton } from '../../components/contacts/CopyButton';
import { CommunicationLog, type Communication } from '../../components/contacts/CommunicationLog';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/ui/Toast';

const typeLabels: Record<string, string> = {
  'flex-broker': 'Broker',
  'Flex Broker': 'Broker',
  'disposal-agent': 'Disposal Agent',
  tenant: 'Tenant',
  landlord: 'Landlord',
  supplier: 'Supplier',
  internal: 'Internal',
};

interface ContactDetailsProps {
  id?: string;
}

export function ContactDetails({ id: idProp }: ContactDetailsProps) {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const id = idProp || params.id || '';
  const { data: contact, isLoading, error } = useContact(id);
  const deleteContact = useDeleteContact();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { toasts, showToast, removeToast } = useToast();

  // Communications - empty until connected to Zoho
  const communications: Communication[] = [];

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteContact.mutateAsync(id);
      showToast('Contact deleted successfully', 'success');
      setTimeout(() => {
        navigate('/contacts');
      }, 500);
    } catch (error) {
      console.error('Error deleting contact:', error);
      showToast('Failed to delete contact', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" text="Loading contact..." />
      </div>
    );
  }

  if (error || !contact) {
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

  const initials = `${contact.firstName[0]}${contact.lastName[0]}`.toUpperCase();
  const healthScore = contact.relationshipHealthScore || 0;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          {contact.avatar ? (
            <img
              src={contact.avatar}
              alt={contact.fullName}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-semibold">
              {initials}
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-1">
              <h1 className="text-2xl font-semibold text-primary">{contact.fullName}</h1>
              <Badge variant="primary">{typeLabels[contact.type] || contact.type}</Badge>
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
                  <i className="fa-solid fa-map-marker-alt"></i>
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
                        onClick={() => navigate(`/contacts/${id}/edit`)}
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
                    {contact.role && contact.type !== 'flex-broker' && contact.type !== 'Flex Broker' && (
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
                            <Badge key={idx} variant="outline" size="sm">
                              {spec}
                            </Badge>
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

