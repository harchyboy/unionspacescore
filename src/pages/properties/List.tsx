import { useState } from 'react';
import { useProperties } from '../../api/properties';
import { PropertyCard } from '../../components/properties/PropertyCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { Link } from 'react-router-dom';

export function PropertiesList() {
  const [search, setSearch] = useState('');
  const [marketingStatus, setMarketingStatus] = useState('');
  const [visibility, setVisibility] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<'updatedAt' | 'name'>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const { data, isLoading, error } = useProperties({
    search,
    marketingStatus: marketingStatus || undefined,
    visibility: visibility || undefined,
    page,
    limit: 10,
    sortBy,
    sortOrder,
  });

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

  const properties = data?.properties || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 10);

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="md:col-span-2">
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
        </div>
        <div className="flex items-center space-x-4">
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
          <div className="grid grid-cols-1 gap-4 mb-6">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
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

