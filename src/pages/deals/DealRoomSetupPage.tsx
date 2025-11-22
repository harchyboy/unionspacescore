import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import type { Deal, ServiceLine, ServiceRoute } from '../../types/deal';
import { summariseAgreementPlan, isAlwaysUnionCategory } from '../../utils/dealRules';

// Load deal from localStorage (mock)
function loadDeal(dealId: string): Deal | null {
  try {
    const deals = JSON.parse(localStorage.getItem('union.deals') || '[]');
    return deals.find((d: Deal) => d.id === dealId) || null;
  } catch {
    return null;
  }
}

export function DealRoomSetupPage() {
  const { dealId } = useParams<{ dealId: string }>();
  const navigate = useNavigate();
  const [deal, setDeal] = useState<Deal | null>(null);

  useEffect(() => {
    if (dealId) {
      const loadedDeal = loadDeal(dealId);
      if (loadedDeal) {
        setDeal(loadedDeal);
      }
    }
  }, [dealId]);

  const dealType = deal?.type || 'AllInclusive';

  // Memoize serviceLines to avoid dependency issues
  const serviceLines = useMemo(() => deal?.serviceLines || [], [deal?.serviceLines]);

  // Group services by route
  const servicesByRoute = useMemo(() => {
    const grouped: Record<ServiceRoute, ServiceLine[]> = {
      BundledInRent: [],
      LandlordAgreement: [],
      UnionAgreement: [],
    };

    serviceLines.forEach((line) => {
      if (line.included) {
        grouped[line.route].push(line);
      }
    });

    return grouped;
  }, [serviceLines]);

  // Summary counts
  const summary = useMemo(() => summariseAgreementPlan(serviceLines.filter((l) => l.included)), [serviceLines]);

  if (!deal) {
    return (
      <div className="px-8 py-6">
        <p className="text-secondary">Loading deal...</p>
      </div>
    );
  }

  return (
    <div className="px-8 py-6">
      <div className="mb-6">
        <Link
          to={`/deals/${dealId}`}
          className="text-sm text-secondary hover:text-primary flex items-center space-x-2 mb-2"
        >
          <i className="fa-solid fa-chevron-left text-xs"></i>
          <span>Back to Deal Overview</span>
        </Link>
        <h1 className="text-3xl font-semibold text-primary mb-2">Deal Room Setup</h1>
        <p className="text-secondary">Final structure after rules are applied</p>
      </div>

      {/* Header with deal info and type badge */}
      <Card className="mb-6">
        <div className="grid grid-cols-4 gap-6">
          <div>
            <div className="text-sm text-secondary mb-1">Deal Name</div>
            <div className="text-base font-medium text-primary">{deal.name}</div>
          </div>
          <div>
            <div className="text-sm text-secondary mb-1">Property</div>
            <div className="text-base font-medium text-primary">{deal.property || 'N/A'}</div>
          </div>
          <div>
            <div className="text-sm text-secondary mb-1">Tenant</div>
            <div className="text-base font-medium text-primary">{deal.tenant || 'N/A'}</div>
          </div>
          <div>
            <div className="text-sm text-secondary mb-1">Deal Type</div>
            <Badge variant={dealType === 'AllInclusive' ? 'primary' : 'secondary'}>
              {dealType === 'AllInclusive' ? 'All Inclusive' : 'Bolt On'}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Summary cards */}
      <Card className="mb-6">
        <h2 className="text-lg font-semibold text-primary mb-4">Agreement Summary</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-muted p-4 rounded-lg">
            <div className="text-sm text-secondary mb-1">Bundled in Rent</div>
            <div className="text-2xl font-semibold text-primary">{summary.bundledInRent}</div>
          </div>
          <div className="bg-muted p-4 rounded-lg">
            <div className="text-sm text-secondary mb-1">Landlord Agreements</div>
            <div className="text-2xl font-semibold text-primary">{summary.landlordAgreements}</div>
          </div>
          <div className="bg-muted p-4 rounded-lg">
            <div className="text-sm text-secondary mb-1">UNION Agreements</div>
            <div className="text-2xl font-semibold text-primary">{summary.unionAgreements}</div>
          </div>
        </div>
      </Card>

      {/* Services grouped by route */}
      <div className="space-y-6 mb-6">
        {/* Bundled in Rent */}
        {dealType === 'AllInclusive' && servicesByRoute.BundledInRent.length > 0 && (
          <Card>
            <h2 className="text-lg font-semibold text-primary mb-4">
              Bundled in Rent ({servicesByRoute.BundledInRent.length})
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E6E6E6]">
                    <th className="text-left py-3 px-4 text-sm font-medium text-primary">Service Name</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-primary">Category</th>
                  </tr>
                </thead>
                <tbody>
                  {servicesByRoute.BundledInRent.map((line) => (
                    <tr key={line.id} className="border-b border-[#E6E6E6]">
                      <td className="py-3 px-4">
                        <span className="text-sm text-primary">{line.name}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-secondary">{line.category}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Landlord Agreements */}
        {servicesByRoute.LandlordAgreement.length > 0 && (
          <Card>
            <h2 className="text-lg font-semibold text-primary mb-4">
              Landlord Agreements ({servicesByRoute.LandlordAgreement.length})
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E6E6E6]">
                    <th className="text-left py-3 px-4 text-sm font-medium text-primary">Service Name</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-primary">Category</th>
                  </tr>
                </thead>
                <tbody>
                  {servicesByRoute.LandlordAgreement.map((line) => (
                    <tr key={line.id} className="border-b border-[#E6E6E6]">
                      <td className="py-3 px-4">
                        <span className="text-sm text-primary">{line.name}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-secondary">{line.category}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* UNION Agreements */}
        {servicesByRoute.UnionAgreement.length > 0 && (
          <Card>
            <h2 className="text-lg font-semibold text-primary mb-4">
              UNION Agreements ({servicesByRoute.UnionAgreement.length})
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E6E6E6]">
                    <th className="text-left py-3 px-4 text-sm font-medium text-primary">Service Name</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-primary">Category</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-primary">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {servicesByRoute.UnionAgreement.map((line) => {
                    const isVariable = isAlwaysUnionCategory(line.category);
                    return (
                      <tr key={line.id} className="border-b border-[#E6E6E6]">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-primary">{line.name}</span>
                            {line.isPostSignAddition && (
                              <Badge variant="outline" size="sm">
                                Post-sign
                              </Badge>
                            )}
                            {isVariable && (
                              <Badge variant="secondary" size="sm">
                                Variable
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-secondary">{line.category}</span>
                        </td>
                        <td className="py-3 px-4">
                          {isVariable && (
                            <span className="text-xs text-secondary italic">
                              Always direct UNION agreement
                            </span>
                          )}
                          {line.isPostSignAddition && (
                            <span className="text-xs text-secondary italic">
                              Added after signing
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Empty state */}
        {serviceLines.filter((l) => l.included).length === 0 && (
          <Card>
            <div className="text-center py-8">
              <p className="text-secondary">No services configured yet.</p>
              <p className="text-sm text-secondary mt-2">
                Configure services in the Proposal Configuration screen.
              </p>
            </div>
          </Card>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end space-x-3">
        <Button variant="outline" onClick={() => navigate(`/deals/${dealId}`)}>
          Back to Deal
        </Button>
        <Button onClick={() => navigate(`/deals/${dealId}/deal-room`)} icon="fa-arrow-right">
          Continue to Deal Room
        </Button>
      </div>
    </div>
  );
}
