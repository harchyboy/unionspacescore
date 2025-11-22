import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import type { DealType, Deal } from '../../types/deal';

export function DealNew() {
  const navigate = useNavigate();
  const [dealName, setDealName] = useState('');
  const [dealType, setDealType] = useState<DealType | ''>('');
  const [propertyId, setPropertyId] = useState('');
  const [tenantCompanyId, setTenantCompanyId] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!dealType) {
      setError('Deal structure is required');
      return;
    }

    if (!dealName.trim()) {
      setError('Deal name is required');
      return;
    }

    // Create new deal
    const newDeal: Deal = {
      id: `deal-${Date.now()}`,
      name: dealName.trim(),
      type: dealType as DealType,
      propertyId: propertyId.trim() || undefined,
      tenantCompanyId: tenantCompanyId.trim() || undefined,
      stage: 'Lead',
      serviceLines: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Store in localStorage for now (mock data)
    const existingDeals = JSON.parse(localStorage.getItem('union.deals') || '[]');
    existingDeals.push(newDeal);
    localStorage.setItem('union.deals', JSON.stringify(existingDeals));

    // Navigate to deal overview
    navigate(`/deals/${newDeal.id}`);
  };

  return (
    <div className="px-8 py-6">
      <div className="mb-6">
        <Link
          to="/deals"
          className="text-sm text-secondary hover:text-primary flex items-center space-x-2 mb-2"
        >
          <i className="fa-solid fa-chevron-left text-xs"></i>
          <span>Back to Pipeline</span>
        </Link>
        <h1 className="text-3xl font-semibold text-primary mb-2">Create New Deal</h1>
        <p className="text-secondary">Set up a new deal with its structure type</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <div className="space-y-6">
            <Input
              label="Deal Name"
              value={dealName}
              onChange={(e) => setDealName(e.target.value)}
              placeholder="e.g., Tech Hub London"
              required
            />

            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Deal Structure <span className="text-destructive">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setDealType('AllInclusive')}
                  className={`p-6 border-2 rounded-lg text-left transition-all ${
                    dealType === 'AllInclusive'
                      ? 'border-primary bg-primary/5'
                      : 'border-[#E6E6E6] hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <input
                      type="radio"
                      checked={dealType === 'AllInclusive'}
                      onChange={() => setDealType('AllInclusive')}
                      className="w-4 h-4 text-primary border-[#E6E6E6] focus:ring-primary"
                    />
                    <h3 className="text-lg font-semibold text-primary">All Inclusive</h3>
                  </div>
                  <p className="text-sm text-secondary ml-7">
                    Services can be bundled into rent or handled as separate agreements
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setDealType('BoltOn')}
                  className={`p-6 border-2 rounded-lg text-left transition-all ${
                    dealType === 'BoltOn'
                      ? 'border-primary bg-primary/5'
                      : 'border-[#E6E6E6] hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <input
                      type="radio"
                      checked={dealType === 'BoltOn'}
                      onChange={() => setDealType('BoltOn')}
                      className="w-4 h-4 text-primary border-[#E6E6E6] focus:ring-primary"
                    />
                    <h3 className="text-lg font-semibold text-primary">Bolt On</h3>
                  </div>
                  <p className="text-sm text-secondary ml-7">
                    Each service handled explicitly per agreement route
                  </p>
                </button>
              </div>
              {error && !dealType && (
                <p className="mt-2 text-sm text-destructive">{error}</p>
              )}
            </div>

            <Input
              label="Property ID"
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              placeholder="Optional: Property identifier"
            />

            <Input
              label="Tenant Company ID"
              value={tenantCompanyId}
              onChange={(e) => setTenantCompanyId(e.target.value)}
              placeholder="Optional: Tenant company identifier"
            />
          </div>
        </Card>

        <div className="flex items-center justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/deals')}
          >
            Cancel
          </Button>
          <Button type="submit" icon="fa-check">
            Create Deal
          </Button>
        </div>
      </form>
    </div>
  );
}

