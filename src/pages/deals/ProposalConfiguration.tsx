import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useMemo, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import type { Deal, DealType, ServiceLine, ServiceCategory, ServiceRoute } from '../../types/deal';
import {
  isAlwaysUnionCategory,
  normaliseServiceLine,
  getAvailableRoutes,
} from '../../utils/dealRules';

// Available services with their categories
const AVAILABLE_SERVICES: Array<{ name: string; category: ServiceCategory }> = [
  { name: 'Base Rent', category: 'Base' },
  { name: 'Cleaning', category: 'Cleaning' },
  { name: 'Internet', category: 'Internet' },
  { name: 'IT Support', category: 'ITSupport' },
  { name: 'AV Equipment', category: 'AV' },
  { name: 'Meeting Room Credits', category: 'MeetingRooms' },
  { name: 'Variable Print', category: 'Printing' },
  { name: 'Coffee Service', category: 'Coffee' },
  { name: 'Food & Beverage', category: 'FoodBeverage' },
  { name: 'Plants', category: 'Plants' },
  { name: 'Daytime Housekeeper', category: 'DaytimeHousekeeper' },
  { name: 'Other Variable Service', category: 'OtherVariable' },
];

// Load deal from localStorage (mock)
function loadDeal(dealId: string): Deal | null {
  try {
    const deals = JSON.parse(localStorage.getItem('union.deals') || '[]');
    return deals.find((d: Deal) => d.id === dealId) || null;
  } catch {
    return null;
  }
}

// Save deal to localStorage (mock)
function saveDeal(deal: Deal) {
  try {
    const deals = JSON.parse(localStorage.getItem('union.deals') || '[]');
    const index = deals.findIndex((d: Deal) => d.id === deal.id);
    if (index >= 0) {
      deals[index] = deal;
    } else {
      deals.push(deal);
    }
    localStorage.setItem('union.deals', JSON.stringify(deals));
  } catch (error) {
    console.error('Failed to save deal:', error);
  }
}

export function ProposalConfiguration() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [deal, setDeal] = useState<Deal | null>(null);
  const [serviceLines, setServiceLines] = useState<ServiceLine[]>([]);

  useEffect(() => {
    if (id) {
      const loadedDeal = loadDeal(id);
      if (loadedDeal) {
        setDeal(loadedDeal);
        setServiceLines(loadedDeal.serviceLines || []);
      }
    }
  }, [id]);

  const dealType: DealType = deal?.type || 'AllInclusive';

  // Initialize service lines for services that don't exist yet
  const allServiceLines = useMemo(() => {
    const existing = new Map(serviceLines.map((sl) => [sl.name, sl]));
    return AVAILABLE_SERVICES.map((service) => {
      const existingLine = existing.get(service.name);
      if (existingLine) {
        return existingLine;
      }
      return {
        id: crypto.randomUUID(),
        dealId: deal?.id || '',
        name: service.name,
        category: service.category,
        included: false,
        route: 'UnionAgreement' as ServiceRoute,
        isPostSignAddition: false,
      };
    });
  }, [serviceLines, deal?.id]);

  const updateServiceLine = (lineId: string, updates: Partial<ServiceLine>) => {
    setServiceLines((prev) => {
      const updated = prev.map((line) => (line.id === lineId ? { ...line, ...updates } : line));
      // Also update in allServiceLines state
      return updated;
    });
  };

  const handleToggleIncluded = (line: ServiceLine) => {
    if (line.isPostSignAddition) return; // Can't change post-sign additions

    const newIncluded = !line.included;
    let newRoute = line.route;

    // If including and it's an always-union category, set route
    if (newIncluded && isAlwaysUnionCategory(line.category)) {
      newRoute = 'UnionAgreement';
    } else if (newIncluded && dealType === 'AllInclusive' && !isAlwaysUnionCategory(line.category)) {
      // Default to BundledInRent for All Inclusive
      newRoute = 'BundledInRent';
    } else if (newIncluded && dealType === 'BoltOn') {
      // Default to UnionAgreement for Bolt On
      newRoute = 'UnionAgreement';
    }

    updateServiceLine(line.id, { included: newIncluded, route: newRoute });
  };

  const handleRouteChange = (lineId: string, newRoute: ServiceRoute) => {
    updateServiceLine(lineId, { route: newRoute });
  };

  const handleSaveConfiguration = () => {
    if (!deal) return;

    // Normalize all service lines
    const normalizedLines = allServiceLines
      .filter((line) => line.included)
      .map((line) => normaliseServiceLine(dealType, line));

    const updatedDeal: Deal = {
      ...deal,
      serviceLines: normalizedLines,
      updatedAt: new Date().toISOString(),
    };

    saveDeal(updatedDeal);
    navigate(`/deals/${id}/proposal/builder`);
  };

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
          to={`/deals/${id}`}
          className="text-sm text-secondary hover:text-primary flex items-center space-x-2 mb-2"
        >
          <i className="fa-solid fa-chevron-left text-xs"></i>
          <span>Back to Deal Overview</span>
        </Link>
        <h1 className="text-3xl font-semibold text-primary mb-2">Proposal Configuration</h1>
        <p className="text-secondary">Configure services and their routing for this deal</p>
      </div>

      {/* Header with deal info */}
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

      {/* Service table */}
      <Card className="mb-6">
        <h2 className="text-lg font-semibold text-primary mb-4">Services</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E6E6E6]">
                <th className="text-left py-3 px-4 text-sm font-medium text-primary">Service Name</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-primary">Category</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-primary">Included</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-primary">Route</th>
              </tr>
            </thead>
            <tbody>
              {allServiceLines.map((line) => {
                const availableRoutes = getAvailableRoutes(dealType, line.category);
                const isAlwaysUnion = isAlwaysUnionCategory(line.category);
                const isLocked = line.isPostSignAddition || isAlwaysUnion;

                return (
                  <tr key={line.id} className="border-b border-[#E6E6E6]">
                    <td className="py-3 px-4">
                      <span className="text-sm text-primary">{line.name}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-secondary">{line.category}</span>
                    </td>
                    <td className="py-3 px-4">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={line.included}
                          onChange={() => handleToggleIncluded(line)}
                          disabled={isLocked && !line.included}
                          className="w-4 h-4 text-primary border-[#E6E6E6] rounded focus:ring-primary"
                        />
                      </label>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Select
                          options={availableRoutes.map((route) => ({
                            value: route,
                            label:
                              route === 'BundledInRent'
                                ? 'Bundled in Rent'
                                : route === 'LandlordAgreement'
                                  ? 'Landlord Agreement'
                                  : 'UNION Agreement',
                          }))}
                          value={line.route}
                          onChange={(e) => handleRouteChange(line.id, e.target.value as ServiceRoute)}
                          disabled={!line.included || isLocked}
                          className="min-w-[160px]"
                        />
                        {isAlwaysUnion && line.included && (
                          <span className="text-xs text-secondary italic">
                            Always direct UNION agreement
                          </span>
                        )}
                        {line.isPostSignAddition && (
                          <Badge variant="outline" size="sm">
                            Post-sign
                          </Badge>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Info note for post-sign additions */}
      {deal.stage === 'Signed' || deal.stage === 'Live' ? (
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <div className="flex items-start space-x-2">
            <i className="fa-solid fa-info-circle text-blue-600 mt-0.5"></i>
            <p className="text-sm text-blue-800">
              Post sign additions always create direct UNION agreements.
            </p>
          </div>
        </Card>
      ) : null}

      {/* Actions */}
      <div className="flex items-center justify-end space-x-3">
        <Button variant="outline" onClick={() => navigate(`/deals/${id}`)}>
          Cancel
        </Button>
        <Button onClick={handleSaveConfiguration} icon="fa-check">
          Save Configuration
        </Button>
      </div>
    </div>
  );
}
