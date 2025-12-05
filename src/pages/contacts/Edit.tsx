import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useContact, useUpdateContact } from '../../api/contacts';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/ui/Toast';
import { SlideOver } from '../../components/ui/SlideOver';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { CompanyLookup } from '../../components/contacts/CompanyLookup';
import type { ContactType, RelationshipHealth } from '../../types/contact';

const contactTypes: { value: ContactType; label: string }[] = [
  { value: 'flex-broker', label: 'Broker' },
  { value: 'disposal-agent', label: 'Disposal Agent' },
  { value: 'tenant', label: 'Tenant/Prospect' },
  { value: 'landlord', label: 'Landlord' },
  { value: 'supplier', label: 'Supplier' },
  { value: 'internal', label: 'Internal' },
];

const healthOptions: { value: RelationshipHealth; label: string }[] = [
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'needs-attention', label: 'Needs Attention' },
];

export function ContactEdit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: contact, isLoading } = useContact(id || '');
  const updateContact = useUpdateContact();
  const { toasts, showToast, removeToast } = useToast();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    mobile: '',
    company: '',
    accountId: '',
    companyCity: '',
    type: 'flex-broker' as ContactType,
    role: '',
    territory: '',
    submarkets: [] as string[],
    specialisms: [] as string[],
    preferredSubmarkets: [] as string[],
    referralSource: '',
    commissionStructure: '',
    relationshipHealth: 'good' as RelationshipHealth,
    relationshipHealthScore: 70,
    notes: '',
  });

  useEffect(() => {
    if (contact) {
      setFormData({
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        phone: contact.phone || '',
        mobile: contact.mobile || '',
        company: contact.company || '',
        accountId: contact.companyId || '',
        companyCity: '', // not returned yet, reserved for future mapping
        type: contact.type,
        role: contact.role || '',
        territory: contact.territory || '',
        submarkets: contact.submarkets || [],
        specialisms: contact.specialisms || [],
        preferredSubmarkets: contact.preferredSubmarkets || [],
        referralSource: contact.referralSource || '',
        commissionStructure: contact.commissionStructure || '',
        relationshipHealth: contact.relationshipHealth,
        relationshipHealthScore: contact.relationshipHealthScore || 70,
        notes: contact.notes || '',
      });
    }
  }, [contact]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      await updateContact.mutateAsync({
        id,
        ...formData,
      });
      showToast('Contact updated successfully', 'success');
      setTimeout(() => {
        navigate(`/contacts/${id}`);
      }, 500);
    } catch (error) {
      console.error('Error updating contact:', error);
      showToast('Failed to update contact', 'error');
    }
  };

  const handleChange = (field: string, value: string | ContactType | RelationshipHealth | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCompanyChange = (value: string, meta?: { accountId?: string | null; city?: string | null }) => {
    setFormData((prev) => ({
      ...prev,
      company: value,
      accountId: meta?.accountId ?? '',
      companyCity: meta?.city ?? prev.companyCity,
    }));
  };

  if (isLoading) {
    return (
      <SlideOver isOpen={true} title="Edit Contact" onClose={() => navigate(`/contacts/${id}`)} size="lg">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </SlideOver>
    );
  }

  return (
    <SlideOver
      isOpen={true}
      title="Edit Contact"
      onClose={() => navigate(`/contacts/${id}`)}
      size="lg"
      footer={
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => navigate(`/contacts/${id}`)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            isLoading={updateContact.isPending}
            disabled={!formData.firstName || !formData.lastName || !formData.email}
          >
            Save Changes
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <ToastContainer toasts={toasts} onRemove={removeToast} />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            required
          />
          <Input
            label="Last Name"
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            required
          />
        </div>

        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
          />
          <Input
            label="Mobile"
            type="tel"
            value={formData.mobile}
            onChange={(e) => handleChange('mobile', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <CompanyLookup
            label="Company Name"
            value={formData.company}
            initialAccountId={formData.accountId}
            onChange={handleCompanyChange}
          />
          <Select
            label="Type"
            options={contactTypes}
            value={formData.type}
            onChange={(e) => handleChange('type', e.target.value as ContactType)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Role"
            value={formData.role}
            onChange={(e) => handleChange('role', e.target.value)}
          />
          <Input
            label="Territory"
            value={formData.territory}
            onChange={(e) => handleChange('territory', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Referral Source"
            value={formData.referralSource}
            onChange={(e) => handleChange('referralSource', e.target.value)}
          />
          <Input
            label="Commission Structure"
            value={formData.commissionStructure}
            onChange={(e) => handleChange('commissionStructure', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Relationship Health"
            options={healthOptions}
            value={formData.relationshipHealth}
            onChange={(e) => handleChange('relationshipHealth', e.target.value as RelationshipHealth)}
          />
          <Input
            label="Health Score (0-100)"
            type="number"
            min="0"
            max="100"
            value={formData.relationshipHealthScore}
            onChange={(e) => handleChange('relationshipHealthScore', parseInt(e.target.value) || 0)}
          />
        </div>

        <Textarea
          label="Relationship Notes"
          rows={4}
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="Add any notes about this contact..."
        />
      </form>
    </SlideOver>
  );
}

