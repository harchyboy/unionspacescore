import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateContact } from '../../api/contacts';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/ui/Toast';
import { SlideOver } from '../../components/ui/SlideOver';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { CompanyLookup } from '../../components/contacts/CompanyLookup';
import type { ContactType } from '../../types/contact';

const contactTypes: { value: ContactType; label: string }[] = [
  { value: 'Broker', label: 'Broker' },
  { value: 'Disposal Agent', label: 'Disposal Agent' },
  { value: 'Tenant', label: 'Tenant/Prospect' },
  { value: 'Landlord', label: 'Landlord' },
  { value: 'Supplier', label: 'Supplier' },
  { value: 'Internal', label: 'Internal' },
];

export function ContactNew() {
  const navigate = useNavigate();
  const createContact = useCreateContact();
  const { toasts, showToast, removeToast } = useToast();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    mobile: '',
    company: '',
    companyCity: '',
    accountId: '',
    type: 'Broker' as ContactType,
    role: '',
    territory: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const contact = await createContact.mutateAsync(formData);
      showToast('Contact created successfully', 'success');
      setTimeout(() => {
        navigate(`/contacts/${contact.id}`);
      }, 500);
    } catch (error) {
      console.error('Error creating contact:', error);
      // Show the specific error message from the API if available
      const message = error instanceof Error ? error.message : 'Failed to create contact';
      showToast(message, 'error');
    }
  };

  const handleChange = (field: string, value: string) => {
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

  return (
    <SlideOver
      isOpen={true}
      title="Add Contact"
      onClose={() => navigate('/contacts')}
      size="lg"
      footer={
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => navigate('/contacts')}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            isLoading={createContact.isPending}
            disabled={!formData.firstName || !formData.lastName || !formData.email}
          >
            Save Contact
          </Button>
        </div>
      }
    >
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <form onSubmit={handleSubmit} className="space-y-6">
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
            required
          />
          <Select
            label="Type"
            options={contactTypes}
            value={formData.type}
            onChange={(e) => handleChange('type', e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Role/Title"
            value={formData.role}
            onChange={(e) => handleChange('role', e.target.value)}
            required
          />
          <Input
            label="City/Region"
            value={formData.territory}
            onChange={(e) => handleChange('territory', e.target.value)}
            placeholder="e.g., London"
          />
        </div>

        <Textarea
          label="Relationship Notes"
          rows={4}
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="Add any relevant notes about this contact..."
        />
      </form>
    </SlideOver>
  );
}
