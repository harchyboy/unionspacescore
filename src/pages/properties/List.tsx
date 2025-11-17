import { useState } from 'react';
import { useProperties, useBulkUpdateProperties, useBulkPushToBrokerSet } from '../../api/properties';
import { PropertyCard } from '../../components/properties/PropertyCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../hooks/useToast';
import { Link } from 'react-router-dom';
import type { PropertyId } from '../../types/property';

export function PropertiesList() {
  const [search, setSearch] = useState('');
  const [marketingStatus, setMarketingStatus] = useState('');
  const [visibility, setVisibility] = useState('');
  const [brokerSet, setBrokerSet] = useState('');
  const [missingMedia, setMissingMedia] = useState(false);
  const [brokerReadyThisWeek, setBrokerReadyThisWeek] = useState(false);
  const [selectedProperties, setSelectedProperties] = useState<Set<PropertyId>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<'updatedAt' | 'name'>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const { showToast } = useToast();
  const bulkUpdateMutation = useBulkUpdateProperties();
  const bulkPushMutation = useBulkPushToBrokerSet();

  const { data, isLoading, error } = useProperties({
    search,
    marketingStatus: marketingStatus || undefined,
    visibility: visibility || undefined,
    brokerSet: brokerSet || undefined,
    missingMedia: missingMedia || undefined,
    brokerReadyThisWeek: brokerReadyThisWeek || undefined,
    page,
    limit: 10,
    sortBy,
    sortOrder,
  });

  const properties = data?.properties || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 10);

  const handleSelectAll = () => {
    if (selectedProperties.size === properties.length) {
      setSelectedProperties(new Set());
    } else {
      setSelectedProperties(new Set(properties.map((p) => p.id)));
    }
  };

  const handleSelectProperty = (propertyId: PropertyId) => {
    const newSelected = new Set(selectedProperties);
    if (newSelected.has(propertyId)) {
      newSelected.delete(propertyId);
    } else {
      newSelected.add(propertyId);
    }
    setSelectedProperties(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const handleBulkUpdateVisibility = (newVisibility: 'Private' | 'Public') => {
    if (selectedProperties.size === 0) return;
    bulkUpdateMutation.mutate(
      {
        propertyIds: Array.from(selectedProperties),
        updates: { visibility: newVisibility },
      },
      {
        onSuccess: (data) => {
          showToast(`Updated ${data.updated} properties`, 'success');
          setSelectedProperties(new Set());
          setShowBulkActions(false);
        },
        onError: (error: Error) => {
          showToast(error.message, 'error');
        },
      }
    );
  };

  const handleBulkUpdateMarketingStatus = (newStatus: 'Draft' | 'Broker-Ready' | 'On Market') => {
    if (selectedProperties.size === 0) return;
    bulkUpdateMutation.mutate(
      {
        propertyIds: Array.from(selectedProperties),
        updates: { marketingStatus: newStatus },
      },
      {
        onSuccess: (data) => {
          showToast(`Updated ${data.updated} properties`, 'success');
          setSelectedProperties(new Set());
          setShowBulkActions(false);
        },
        onError: (error: Error) => {
          showToast(error.message, 'error');
        },
      }
    );
  };

  const handleBulkPushToBrokerSet = (brokerSetValue: string) => {
    if (selectedProperties.size === 0) return;
    bulkPushMutation.mutate(
      {
        propertyIds: Array.from(selectedProperties),
        brokerSet: brokerSetValue,
      },
      {
        onSuccess: (data) => {
          showToast(`Pushed ${data.updated} properties to broker set`, 'success');
          setSelectedProperties(new Set());
          setShowBulkActions(false);
        },
        onError: (error: Error) => {
          showToast(error.message, 'error');
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="px-8 py-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-8 py-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Error loading properties: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      </div>
    );
  }

  return (
    <div className="px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-[#252525]">Properties</h1>
        <Link
          to="/properties/new"
          className="bg-[#252525] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-all flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Property</span>
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-[#E6E6E6] p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
          <div className="md:col-span-2 lg:col-span-2">
            <input
              type="text"
              placeholder="Search properties..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-[#E6E6E6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#252525]"
            />
          </div>
          <select
            value={marketingStatus}
            onChange={(e) => {
              setMarketingStatus(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-[#E6E6E6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#252525]"
          >
            <option value="">All Status</option>
            <option value="Draft">Draft</option>
            <option value="Broker-Ready">Broker-Ready</option>
            <option value="On Market">On Market</option>
          </select>
          <select
            value={visibility}
            onChange={(e) => {
              setVisibility(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-[#E6E6E6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#252525]"
          >
            <option value="">All Visibility</option>
            <option value="Private">Private</option>
            <option value="Public">Public</option>
          </select>
          <select
            value={brokerSet}
            onChange={(e) => {
              setBrokerSet(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-[#E6E6E6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#252525]"
          >
            <option value="">All Broker Sets</option>
            <option value="premium">Premium Set</option>
            <option value="standard">Standard Set</option>
            <option value="budget">Budget Set</option>
          </select>
          <div className="flex items-center space-x-2">
            <label className="flex items-center space-x-2 text-sm text-[#8e8e8e] cursor-pointer">
              <input
                type="checkbox"
                checked={missingMedia}
                onChange={(e) => {
                  setMissingMedia(e.target.checked);
                  setPage(1);
                }}
                className="w-4 h-4 border border-[#E6E6E6] rounded"
              />
              <span>Missing Media</span>
            </label>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2 text-sm text-[#8e8e8e] cursor-pointer">
            <input
              type="checkbox"
              checked={brokerReadyThisWeek}
              onChange={(e) => {
                setBrokerReadyThisWeek(e.target.checked);
                setPage(1);
              }}
              className="w-4 h-4 border border-[#E6E6E6] rounded"
            />
            <span>Broker-Ready This Week</span>
          </label>
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field as 'updatedAt' | 'name');
              setSortOrder(order as 'asc' | 'desc');
            }}
            className="px-4 py-2 border border-[#E6E6E6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#252525]"
          >
            <option value="updatedAt-desc">Updated (Newest)</option>
            <option value="updatedAt-asc">Updated (Oldest)</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
          </select>
        </div>
      </div>

      {showBulkActions && selectedProperties.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-[#252525]">
                {selectedProperties.size} property{selectedProperties.size !== 1 ? 'ies' : ''} selected
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedProperties(new Set());
                  setShowBulkActions(false);
                }}
              >
                Clear Selection
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleBulkPushToBrokerSet(e.target.value);
                    e.target.value = '';
                  }
                }}
                className="px-3 py-1.5 border border-[#E6E6E6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#252525]"
              >
                <option value="">Push to Broker Set...</option>
                <option value="premium">Premium Set</option>
                <option value="standard">Standard Set</option>
                <option value="budget">Budget Set</option>
              </select>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleBulkUpdateVisibility(e.target.value as 'Private' | 'Public');
                    e.target.value = '';
                  }
                }}
                className="px-3 py-1.5 border border-[#E6E6E6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#252525]"
              >
                <option value="">Update Visibility...</option>
                <option value="Private">Private</option>
                <option value="Public">Public</option>
              </select>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleBulkUpdateMarketingStatus(e.target.value as 'Draft' | 'Broker-Ready' | 'On Market');
                    e.target.value = '';
                  }
                }}
                className="px-3 py-1.5 border border-[#E6E6E6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#252525]"
              >
                <option value="">Update Marketing Status...</option>
                <option value="Draft">Draft</option>
                <option value="Broker-Ready">Broker-Ready</option>
                <option value="On Market">On Market</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {properties.length === 0 ? (
        <EmptyState
          title="No properties found"
          description="Get started by adding your first property."
          action={{
            label: 'Add Property',
            onClick: () => {
              window.location.href = '/properties/new';
            },
          }}
        />
      ) : (
        <>
          <div className="mb-4 flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedProperties.size === properties.length && properties.length > 0}
              onChange={handleSelectAll}
              className="w-4 h-4 border border-[#E6E6E6] rounded"
            />
            <span className="text-sm text-[#8e8e8e]">Select All</span>
          </div>
          <div className="grid grid-cols-1 gap-4 mb-6">
            {properties.map((property) => (
              <div key={property.id} className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={selectedProperties.has(property.id)}
                  onChange={() => handleSelectProperty(property.id)}
                  className="mt-6 w-4 h-4 border border-[#E6E6E6] rounded"
                />
                <div className="flex-1">
                  <PropertyCard property={property} />
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white rounded-lg border border-[#E6E6E6] p-4">
              <div className="text-sm text-[#8e8e8e]">
                Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, total)} of {total} properties
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 text-sm border border-[#E6E6E6] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#fafafa]"
                >
                  Previous
                </button>
                <span className="text-sm text-[#252525]">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 text-sm border border-[#E6E6E6] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#fafafa]"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

