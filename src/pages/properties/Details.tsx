import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useProperty } from '../../api/properties';
import { PropertyHeader } from '../../components/properties/PropertyHeader';
import { OverviewTab } from './tabs/OverviewTab';
import { UnitsTab } from './tabs/UnitsTab';
import { AvailabilityTab } from './tabs/AvailabilityTab';
import { CommercialsTab } from './tabs/CommercialsTab';
import { DocumentsMediaTab } from './tabs/DocumentsMediaTab';
import { ActivityCommsTab } from './tabs/ActivityCommsTab';
import { AnalyticsTab } from './tabs/AnalyticsTab';
import { ApprovalsTab } from './tabs/ApprovalsTab';
import { RiskTab } from './tabs/RiskTab';
import { DealRoomTab } from './tabs/DealRoomTab';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'units', label: 'Units' },
  { id: 'availability', label: 'Availability & Viewings' },
  { id: 'commercials', label: 'Commercials' },
  { id: 'documents', label: 'Documents & Media' },
  { id: 'activity', label: 'Activity & Comms' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'approvals', label: 'Approvals' },
  { id: 'risk', label: 'Risk' },
  { id: 'deal-room', label: 'Deal Room' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export function PropertyDetails() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') || 'overview') as TabId;

  const { data: property, isLoading, error } = useProperty(id);

  const handleTabChange = (tabId: TabId) => {
    setSearchParams({ tab: tabId });
  };

  if (isLoading) {
    return (
      <div className="px-8 py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg" />
          <div className="h-64 bg-gray-200 rounded-lg" />
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="px-8 py-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error instanceof Error ? error.message : 'Property not found'}
        </div>
        <Link to="/properties" className="mt-4 text-[#252525] underline">
          Back to Properties
        </Link>
      </div>
    );
  }

  return (
    <div>
      <PropertyHeader property={property} />

      <div className="px-8 py-6">
        <div
          role="tablist"
          className="flex space-x-1 border-b border-[#E6E6E6] mb-6 overflow-x-auto"
          aria-label="Property details tabs"
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                aria-controls={`tabpanel-${tab.id}`}
                id={`tab-${tab.id}`}
                onClick={() => handleTabChange(tab.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-[#252525] text-[#252525]'
                    : 'border-transparent text-[#8e8e8e] hover:text-[#252525] hover:border-[#8e8e8e]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div role="tabpanel" id={`tabpanel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
          {activeTab === 'overview' && <OverviewTab property={property} />}
          {activeTab === 'units' && <UnitsTab property={property} />}
          {activeTab === 'availability' && <AvailabilityTab property={property} />}
          {activeTab === 'commercials' && <CommercialsTab property={property} />}
          {activeTab === 'documents' && <DocumentsMediaTab property={property} />}
          {activeTab === 'activity' && <ActivityCommsTab property={property} />}
          {activeTab === 'analytics' && <AnalyticsTab property={property} />}
          {activeTab === 'approvals' && <ApprovalsTab property={property} />}
          {activeTab === 'risk' && <RiskTab property={property} />}
          {activeTab === 'deal-room' && <DealRoomTab property={property} />}
        </div>
      </div>
    </div>
  );
}

