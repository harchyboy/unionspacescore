import { useParams, useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { useMockStore } from '../../store/useMockStore';
import { useToast } from '../../hooks/useToast';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Card } from '../../components/ui/Card';
import type { AgreementPlan } from '../../types/dealRoom';

const SERVICES = [
  { code: 'CLEANING', name: 'Cleaning', locked: false },
  { code: 'IT', name: 'IT', locked: false },
  { code: 'INTERNET', name: 'Internet', locked: true },
  { code: 'AV', name: 'AV', locked: false },
  { code: 'COFFEE', name: 'Coffee', locked: false },
  { code: 'PLANTS', name: 'Plants', locked: false },
  { code: 'HOUSEKEEPER', name: 'Daytime Housekeeper', locked: false },
];

export function DealRoomSetupPage() {
  const { dealId } = useParams<{ dealId: string }>();
  const navigate = useNavigate();
  const { state, confirmSetup } = useMockStore();
  const { showToast, toasts, removeToast, ToastComponent } = useToast();

  const [dealType, setDealType] = useState<'AllInclusive' | 'BoltOn'>('AllInclusive');
  const [services, setServices] = useState(
    SERVICES.map((s) => ({
      ...s,
      included: s.code === 'INTERNET', // Internet is included by default
      route: (s.code === 'INTERNET' ? 'Landlord' : 'UnionDirect') as 'Landlord' | 'UnionDirect' | 'Supplier',
      notes: '',
    }))
  );

  const summary = useMemo(() => {
    const includedServices = services.filter((s) => s.included);
    return {
      landlordAgreements: includedServices.filter((s) => s.route === 'Landlord').length,
      unionAgreements: includedServices.filter((s) => s.route === 'UnionDirect').length,
      supplierAgreements: includedServices.filter((s) => s.route === 'Supplier').length,
    };
  }, [services]);

  const updateService = (code: string, updates: Partial<(typeof services)[0]>) => {
    setServices((prev) => prev.map((s) => (s.code === code ? { ...s, ...updates } : s)));
  };

  const handleConfirm = () => {
    const plan: AgreementPlan = {
      dealType,
      services: services.map((s) => ({
        code: s.code,
        name: s.name,
        included: s.included,
        route: s.route,
        notes: s.notes || undefined,
        locked: s.locked,
      })),
      summary,
    };

    confirmSetup(plan);
    showToast('Setup confirmed', 'success');
    navigate(`/deals/${dealId}/deal-room?tab=agreements`);
  };

  const deal = state.deal;
  const proposal = deal.proposal;

  return (
    <div className="px-8 py-6">
      <ToastComponent toasts={toasts} onRemove={removeToast} />
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-primary mb-2">Deal Room Setup</h1>
        <p className="text-secondary">Configure agreement plan for {deal.tenant.name}</p>
      </div>

      {/* Header strip */}
      <Card className="mb-6">
        <div className="grid grid-cols-4 gap-6">
          <div>
            <div className="text-sm text-secondary mb-1">Tenant</div>
            <div className="text-base font-medium text-primary">{deal.tenant.name}</div>
          </div>
          <div>
            <div className="text-sm text-secondary mb-1">Property</div>
            <div className="text-base font-medium text-primary">
              {deal.property.name}
              {deal.property.unit && `, ${deal.property.unit}`}
            </div>
          </div>
          <div>
            <div className="text-sm text-secondary mb-1">Proposal Totals</div>
            <div className="text-base font-medium text-primary">
              £{proposal.totals.monthly.toLocaleString()}/mo
              <span className="text-secondary text-sm ml-2">+ £{proposal.totals.setup.toLocaleString()} setup</span>
            </div>
          </div>
          <div>
            <Select
              label="Deal Type"
              options={[
                { value: 'AllInclusive', label: 'All Inclusive' },
                { value: 'BoltOn', label: 'Bolt On' },
              ]}
              value={dealType}
              onChange={(e) => setDealType(e.target.value as 'AllInclusive' | 'BoltOn')}
            />
          </div>
        </div>
      </Card>

      {/* Service table */}
      <Card className="mb-6">
        <h2 className="text-lg font-semibold text-primary mb-4">Services</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E6E6E6]">
                <th className="text-left py-3 px-4 text-sm font-medium text-primary">Service</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-primary">Included</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-primary">Route</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-primary">Notes</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.code} className="border-b border-[#E6E6E6]">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-primary">{service.name}</span>
                      {service.locked && (
                        <i className="fa-solid fa-lock text-secondary text-xs" title="Locked"></i>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={service.included}
                        onChange={(e) => updateService(service.code, { included: e.target.checked })}
                        disabled={service.locked}
                        className="w-4 h-4 text-primary border-[#E6E6E6] rounded focus:ring-primary"
                      />
                    </label>
                  </td>
                  <td className="py-3 px-4">
                    <Select
                      options={[
                        { value: 'Landlord', label: 'Landlord' },
                        { value: 'UnionDirect', label: 'Union Direct' },
                        { value: 'Supplier', label: 'Supplier' },
                      ]}
                      value={service.route}
                      onChange={(e) =>
                        updateService(service.code, { route: e.target.value as 'Landlord' | 'UnionDirect' | 'Supplier' })
                      }
                      disabled={!service.included || service.locked}
                      className="min-w-[140px]"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <Textarea
                      value={service.notes}
                      onChange={(e) => updateService(service.code, { notes: e.target.value })}
                      disabled={!service.included || service.locked}
                      placeholder="Add notes..."
                      rows={1}
                      className="min-w-[200px]"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Landlord appetite info */}
      <Card className="mb-6">
        <h2 className="text-lg font-semibold text-primary mb-2">Landlord Appetite</h2>
        <p className="text-sm text-secondary">
          Landlords typically prefer to handle services that are core to the building infrastructure, such as Internet
          connectivity. Union Direct services are managed by UNION, while Supplier agreements are with third-party
          vendors.
        </p>
      </Card>

      {/* Summary */}
      <Card className="mb-6">
        <h2 className="text-lg font-semibold text-primary mb-4">Agreement Summary</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-muted p-4 rounded-lg">
            <div className="text-sm text-secondary mb-1">Landlord Agreements</div>
            <div className="text-2xl font-semibold text-primary">{summary.landlordAgreements}</div>
          </div>
          <div className="bg-muted p-4 rounded-lg">
            <div className="text-sm text-secondary mb-1">Union Agreements</div>
            <div className="text-2xl font-semibold text-primary">{summary.unionAgreements}</div>
          </div>
          <div className="bg-muted p-4 rounded-lg">
            <div className="text-sm text-secondary mb-1">Supplier Agreements</div>
            <div className="text-2xl font-semibold text-primary">{summary.supplierAgreements}</div>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex justify-end">
        <Button onClick={handleConfirm} icon="fa-check">
          Confirm Setup
        </Button>
      </div>
    </div>
  );
}

