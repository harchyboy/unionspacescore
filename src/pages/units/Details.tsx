import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useUnit } from '../../api/units';

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'commercials', label: 'Commercials' },
  { id: 'activity', label: 'Activity' },
];

function formatMoneyGBP(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(value);
}

export function UnitDetails() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('overview');
  const [animationKey, setAnimationKey] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const navigate = useNavigate();

  const { data: unit, isLoading, error } = useUnit(id);

  const address = useMemo(() => {
    if (!unit?.property) return '—';
    const parts = [unit.property.addressLine, unit.property.city, unit.property.postcode, unit.property.country].filter(Boolean);
    return parts.length ? parts.join(', ') : '—';
  }, [unit?.property]);

  useEffect(() => {
    // Trigger animation on ID change
    setAnimationKey(prev => prev + 1);
  }, [id]);

  const handleBackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsExiting(true);
    // Navigate after animation completes
    setTimeout(() => {
      navigate('/units');
    }, 300);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !unit) {
    return (
      <div className="p-8">
        <div className="bg-white border border-[#E6E6E6] rounded-lg p-6">
          <h1 className="text-xl font-semibold text-primary mb-2">Unit</h1>
          <p className="text-secondary text-sm">Failed to load real unit data.</p>
          <pre className="text-xs text-secondary mt-4 whitespace-pre-wrap">{String((error as Error)?.message || error)}</pre>
          <div className="mt-4">
            <button onClick={() => navigate('/units')} className="text-primary hover:underline text-sm font-medium">
              Back to Units
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      key={animationKey}
      className="flex flex-col h-full overflow-hidden"
      style={{
        animation: isExiting ? 'slideOut 0.3s ease-out forwards' : 'slideIn 0.3s ease-out'
      }}
    >
      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          @keyframes slideOut {
            from {
              transform: translateX(0);
              opacity: 1;
            }
            to {
              transform: translateX(100%);
              opacity: 0;
            }
          }
        `}
      </style>
      
      {/* Header */}
      <header className="bg-white border-b border-[#E6E6E6] px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-6 flex-1">
          <button onClick={handleBackClick} className="text-secondary hover:text-primary">
            <i className="fa-solid fa-arrow-left text-lg"></i>
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="relative p-2 text-secondary hover:text-primary transition-all">
            <i className="fa-solid fa-bell text-lg"></i>
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
          </button>
          <button className="p-2 text-secondary hover:text-primary transition-all">
            <i className="fa-solid fa-question-circle text-lg"></i>
          </button>
        </div>
      </header>

      {/* Unit Header */}
      <div className="bg-white border-b border-[#E6E6E6] px-8 py-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <h1 className="text-3xl font-semibold text-primary">{unit.code}</h1>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary text-white">
                {unit.status || '—'}
              </span>
              {unit.pipelineStage ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#FAFAFA] text-primary">
                  {unit.pipelineStage}
                </span>
              ) : null}
            </div>
            <div className="flex items-center space-x-6 text-sm text-secondary">
              <div className="flex items-center space-x-2">
                <i className="fa-solid fa-building"></i>
                <span>{unit.property?.name || '—'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <i className="fa-solid fa-ruler-combined"></i>
                <span>{unit.sizeSqFt != null ? `${unit.sizeSqFt.toLocaleString()} sq ft` : '—'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <i className="fa-solid fa-chair"></i>
                <span>{unit.desks != null ? `${unit.desks} Desks` : '—'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <i className="fa-solid fa-door-closed"></i>
                <span>{unit.floor || '—'}</span>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-semibold text-primary">
                {formatMoneyGBP(unit.pricePcm)} <span className="text-base font-normal text-secondary">/ month</span>
              </div>
              <div className="text-xs text-secondary mt-1">{address}</div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="bg-primary text-white px-6 py-2.5 rounded-lg font-medium hover:bg-opacity-90 transition-all flex items-center space-x-2">
              <i className="fa-solid fa-calendar-check"></i>
              <span>Book Viewing</span>
            </button>
            {unit.property?.id ? (
              <Link
                to={`/properties/${unit.property.id}`}
                className="border border-primary text-primary px-6 py-2.5 rounded-lg font-medium hover:bg-[#FAFAFA] transition-all flex items-center space-x-2"
              >
                <i className="fa-solid fa-building"></i>
                <span>View Property</span>
              </Link>
            ) : null}
            <button className="border border-[#E6E6E6] text-secondary px-4 py-2.5 rounded-lg hover:bg-[#FAFAFA] transition-all">
              <i className="fa-solid fa-ellipsis-vertical"></i>
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex items-center space-x-4 border-t border-[#E6E6E6] pt-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'text-primary border-primary'
                  : 'text-secondary hover:text-primary border-transparent hover:border-secondary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-[#F0F0F0] px-8 py-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
              <h2 className="text-xl font-semibold text-primary mb-4">Unit Details</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between border-b border-[#E6E6E6] py-2">
                  <span className="text-secondary">Unit code</span>
                  <span className="text-primary font-medium">{unit.code}</span>
                </div>
                <div className="flex items-center justify-between border-b border-[#E6E6E6] py-2">
                  <span className="text-secondary">Status</span>
                  <span className="text-primary font-medium">{unit.status || '—'}</span>
                </div>
                <div className="flex items-center justify-between border-b border-[#E6E6E6] py-2">
                  <span className="text-secondary">Pipeline stage</span>
                  <span className="text-primary font-medium">{unit.pipelineStage || '—'}</span>
                </div>
                <div className="flex items-center justify-between border-b border-[#E6E6E6] py-2">
                  <span className="text-secondary">Fit-out</span>
                  <span className="text-primary font-medium">{unit.fitOut || '—'}</span>
                </div>
                <div className="flex items-center justify-between border-b border-[#E6E6E6] py-2">
                  <span className="text-secondary">Floor</span>
                  <span className="text-primary font-medium">{unit.floor || '—'}</span>
                </div>
                <div className="flex items-center justify-between border-b border-[#E6E6E6] py-2">
                  <span className="text-secondary">Size</span>
                  <span className="text-primary font-medium">{unit.sizeSqFt != null ? `${unit.sizeSqFt.toLocaleString()} sq ft` : '—'}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-secondary">Desks</span>
                  <span className="text-primary font-medium">{unit.desks != null ? unit.desks : '—'}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
              <h2 className="text-xl font-semibold text-primary mb-4">Property</h2>
              <div className="text-sm text-secondary mb-2">Linked via Zoho lookup (Unit → Property)</div>
              <div className="text-sm">
                <div className="text-primary font-semibold">{unit.property?.name || '—'}</div>
                <div className="text-secondary mt-1">{address}</div>
                {unit.property?.id ? (
                  <div className="mt-4">
                    <Link to={`/properties/${unit.property.id}`} className="text-primary hover:underline text-sm font-medium">
                      Open Property record
                    </Link>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'commercials' && (
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
              <h2 className="text-xl font-semibold text-primary mb-4">Pricing</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between border-b border-[#E6E6E6] py-2">
                  <span className="text-secondary">Price (per month)</span>
                  <span className="text-primary font-medium">{formatMoneyGBP(unit.pricePcm)}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-secondary">Price (per sq ft)</span>
                  <span className="text-primary font-medium">{formatMoneyGBP(unit.pricePsf)}</span>
                </div>
              </div>
              <p className="text-xs text-secondary mt-4">
                Values are synced from Zoho CRM unit fields (cached in Supabase).
              </p>
            </div>

            <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
              <h2 className="text-xl font-semibold text-primary mb-4">Sync metadata</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between border-b border-[#E6E6E6] py-2">
                  <span className="text-secondary">Zoho created</span>
                  <span className="text-primary font-medium">{unit.zohoCreatedAt ? new Date(unit.zohoCreatedAt).toLocaleString() : '—'}</span>
                </div>
                <div className="flex items-center justify-between border-b border-[#E6E6E6] py-2">
                  <span className="text-secondary">Zoho modified</span>
                  <span className="text-primary font-medium">{unit.zohoModifiedAt ? new Date(unit.zohoModifiedAt).toLocaleString() : '—'}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-secondary">Last cached update</span>
                  <span className="text-primary font-medium">{unit.updatedAt ? new Date(unit.updatedAt).toLocaleString() : '—'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="bg-white rounded-lg border border-[#E6E6E6] p-12 text-center">
            <i className="fa-solid fa-circle-info text-4xl text-secondary mb-4"></i>
            <p className="text-secondary">
              No activity feed is stored for units yet. (We can add this later via Zoho Notes/Timeline sync.)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

