import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompanyStore } from '../../store/useCompanyStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import type { CompanyType, CompanyStatus } from '../../types/company';

export function CompanyNew() {
  const navigate = useNavigate();
  const { addCompany } = useCompanyStore();
  const [formData, setFormData] = useState({
    name: '',
    type: 'Agency' as CompanyType,
    relationshipOwner: '',
    status: 'Active' as CompanyStatus,
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Company name is required';
    }
    if (!formData.relationshipOwner.trim()) {
      newErrors.relationshipOwner = 'Relationship owner is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      addCompany({
        name: formData.name.trim(),
        type: formData.type,
        relationshipOwner: formData.relationshipOwner.trim(),
        status: formData.status,
        notes: formData.notes.trim() || undefined,
      });
      navigate('/contacts/companies');
    }
  };

  const handleCancel = () => {
    navigate('/contacts/companies');
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#F0F0F0]">
      {/* Page Header */}
      <div className="bg-white border-b border-[#E6E6E6] px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-primary mb-2">Add Company</h1>
            <p className="text-secondary text-sm">
              Create a new company record
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-2xl">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-[#E6E6E6] p-6 space-y-6">
            <Input
              label="Company name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={errors.name}
              required
              placeholder="Enter company name"
            />

            <Select
              label="Company type"
              options={[
                { value: 'Agency', label: 'Agency' },
                { value: 'Landlord', label: 'Landlord' },
                { value: 'Supplier', label: 'Supplier' },
                { value: 'Client', label: 'Client' },
              ]}
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as CompanyType })}
            />

            <Input
              label="Relationship owner"
              value={formData.relationshipOwner}
              onChange={(e) => setFormData({ ...formData, relationshipOwner: e.target.value })}
              error={errors.relationshipOwner}
              required
              placeholder="Enter relationship owner name"
            />

            <Select
              label="Status"
              options={[
                { value: 'Active', label: 'Active' },
                { value: 'Dormant', label: 'Dormant' },
                { value: 'Prospect', label: 'Prospect' },
              ]}
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as CompanyStatus })}
            />

            <Textarea
              label="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Optional notes about this company"
              rows={4}
            />

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 pt-4 border-t border-[#E6E6E6]">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                icon="fa-save"
              >
                Save company
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

