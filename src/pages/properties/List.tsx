import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProperties } from '../../api/properties';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

const tabs = [
  { id: 'all', label: 'All Properties' },
  { id: 'missing', label: 'Missing Assets' },
  { id: 'ready', label: 'Ready to Publish' },
  { id: 'healthy', label: 'Data Health > 85%' },
];

export function PropertiesList() {
  const [activeTab, setActiveTab] = useState('all');
  const [submarketFilter, setSubmarketFilter] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState('');
  const [agentFilter, setAgentFilter] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('');
  const [networkFilter, setNetworkFilter] = useState('');
  const [healthFilter, setHealthFilter] = useState('');
  const [sortBy, setSortBy] = useState('last-updated');

  const { data, isLoading, error } = useProperties({
    page: 1,
    limit: 50,
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  });

  const properties = data?.properties || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-8 py-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Error loading properties
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Page Header */}
      <div className="bg-white border-b border-[#E6E6E6] px-8 py-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-primary mb-2">Properties</h1>
            <p className="text-secondary text-sm">Portfolio control centre. Every building, readiness, and health in one place.</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="px-4 py-2.5 border border-[#E6E6E6] rounded-lg text-sm text-primary hover:bg-[#FAFAFA] transition-all flex items-center space-x-2">
              <i className="fa-solid fa-save"></i>
              <span>Save View</span>
            </button>
            <Link
              to="/properties/new"
              className="bg-primary text-white px-6 py-2.5 rounded-lg font-medium hover:bg-opacity-90 transition-all flex items-center space-x-2"
            >
              <i className="fa-solid fa-plus"></i>
              <span>Add Property</span>
            </Link>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex items-center space-x-4 mt-6">
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

      {/* Filters */}
      <div className="bg-white border-b border-[#E6E6E6] px-8 py-4">
        <div className="flex items-center space-x-3 flex-wrap gap-2">
          <div className="relative">
            <select
              value={submarketFilter}
              onChange={(e) => setSubmarketFilter(e.target.value)}
              className="appearance-none bg-[#FAFAFA] border border-[#E6E6E6] rounded-lg px-4 py-2 pr-8 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Submarkets</option>
              <option value="city-core">City Core</option>
              <option value="shoreditch">Shoreditch</option>
              <option value="mayfair">Mayfair</option>
              <option value="canary-wharf">Canary Wharf</option>
              <option value="kings-cross">King's Cross</option>
            </select>
            <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary text-xs pointer-events-none"></i>
          </div>
          
          <div className="relative">
            <select
              value={visibilityFilter}
              onChange={(e) => setVisibilityFilter(e.target.value)}
              className="appearance-none bg-[#FAFAFA] border border-[#E6E6E6] rounded-lg px-4 py-2 pr-8 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Visibility</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
            <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary text-xs pointer-events-none"></i>
          </div>
          
          <div className="relative">
            <select
              value={agentFilter}
              onChange={(e) => setAgentFilter(e.target.value)}
              className="appearance-none bg-[#FAFAFA] border border-[#E6E6E6] rounded-lg px-4 py-2 pr-8 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Disposal Agents</option>
              <option value="knight-frank">Knight Frank</option>
              <option value="cbre">CBRE</option>
              <option value="jll">JLL</option>
              <option value="savills">Savills</option>
              <option value="cushman">Cushman & Wakefield</option>
            </select>
            <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary text-xs pointer-events-none"></i>
          </div>
          
          <div className="relative">
            <select
              value={ownerFilter}
              onChange={(e) => setOwnerFilter(e.target.value)}
              className="appearance-none bg-[#FAFAFA] border border-[#E6E6E6] rounded-lg px-4 py-2 pr-8 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Owners</option>
              <option value="tom">Tom Townsend</option>
              <option value="max">Max Chen</option>
              <option value="dani">Dani Roberts</option>
            </select>
            <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary text-xs pointer-events-none"></i>
          </div>
          
          <div className="relative">
            <select
              value={networkFilter}
              onChange={(e) => setNetworkFilter(e.target.value)}
              className="appearance-none bg-[#FAFAFA] border border-[#E6E6E6] rounded-lg px-4 py-2 pr-8 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Broker Networks</option>
              <option value="public">Public Network</option>
              <option value="private-10">Private · 10 brokers</option>
              <option value="private-5">Private · 5 brokers</option>
            </select>
            <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary text-xs pointer-events-none"></i>
          </div>
          
          <div className="relative">
            <select
              value={healthFilter}
              onChange={(e) => setHealthFilter(e.target.value)}
              className="appearance-none bg-[#FAFAFA] border border-[#E6E6E6] rounded-lg px-4 py-2 pr-8 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Data Health</option>
              <option value="lt50">&lt; 50%</option>
              <option value="50-75">50-75%</option>
              <option value="75-85">75-85%</option>
              <option value="gt85">&gt; 85%</option>
            </select>
            <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary text-xs pointer-events-none"></i>
          </div>
          
          <button className="text-secondary hover:text-primary text-sm ml-2 flex items-center space-x-1">
            <i className="fa-solid fa-rotate-left text-xs"></i>
            <span>Clear all</span>
          </button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      <div className="bg-[#FAFAFA] border-b border-[#E6E6E6] px-8 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <input type="checkbox" className="w-4 h-4 text-primary border-[#E6E6E6] rounded focus:ring-primary" />
            <label className="text-sm text-secondary">Select All</label>
          </div>
          <span className="text-sm text-secondary">{properties.length} properties</span>
        </div>
        <div className="flex items-center space-x-2">
          <button className="px-4 py-2 border border-[#E6E6E6] bg-white rounded-lg text-sm text-primary hover:bg-[#FAFAFA] transition-all flex items-center space-x-2">
            <i className="fa-solid fa-eye-slash"></i>
            <span>Change Visibility</span>
          </button>
          <button className="px-4 py-2 border border-[#E6E6E6] bg-white rounded-lg text-sm text-primary hover:bg-[#FAFAFA] transition-all flex items-center space-x-2">
            <i className="fa-solid fa-user-tie"></i>
            <span>Assign Agent</span>
          </button>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-white border border-[#E6E6E6] rounded-lg px-4 py-2 pr-8 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="last-updated">Sort by: Last Updated</option>
              <option value="name-asc">Sort by: Name A-Z</option>
              <option value="name-desc">Sort by: Name Z-A</option>
              <option value="occupancy">Sort by: Occupancy High-Low</option>
              <option value="health">Sort by: Data Health</option>
            </select>
            <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary text-xs pointer-events-none"></i>
          </div>
        </div>
      </div>

      {/* Properties Table */}
      <div className="flex-1 overflow-y-auto bg-[#F0F0F0] px-8 py-6">
        {properties.length === 0 ? (
          <EmptyState
            title="No properties found"
            description="Get started by adding your first property."
            icon="fa-building"
          />
        ) : (
          <div className="bg-white rounded-lg border border-[#E6E6E6] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#FAFAFA] border-b border-[#E6E6E6]">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input type="checkbox" className="w-4 h-4 text-primary border-[#E6E6E6] rounded focus:ring-primary" />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-secondary uppercase tracking-wider">Property</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-secondary uppercase tracking-wider">Submarket</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-secondary uppercase tracking-wider">Units</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-secondary uppercase tracking-wider">Occupancy</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-secondary uppercase tracking-wider">Data Health</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-secondary uppercase tracking-wider">Visibility</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-secondary uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-secondary uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E6E6]">
                  {properties.map((property) => (
                    <tr key={property.id} className="hover:bg-[#FAFAFA] transition-colors">
                      <td className="px-6 py-4">
                        <input type="checkbox" className="w-4 h-4 text-primary border-[#E6E6E6] rounded focus:ring-primary" />
                      </td>
                      <td className="px-6 py-4">
                        <Link to={`/properties/${property.id}`} className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-[#F0F0F0] rounded-lg overflow-hidden">
                            {property.images?.[0] ? (
                              <img src={property.images[0]} alt={property.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <i className="fa-solid fa-building text-secondary"></i>
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-primary">{property.name}</div>
                            <div className="text-xs text-secondary">{property.addressLine}</div>
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-primary">{property.submarket || '—'}</td>
                      <td className="px-6 py-4 text-sm text-primary">{property.totalUnits || 0}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-[#E6E6E6] rounded-full h-2 w-20">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${property.occupancy || 0}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-primary">{property.occupancy || 0}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-[#E6E6E6] rounded-full h-2 w-20">
                            <div
                              className={`h-2 rounded-full ${
                                (property.dataHealth || 0) >= 85 ? 'bg-green-500' :
                                (property.dataHealth || 0) >= 50 ? 'bg-amber-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${property.dataHealth || 0}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-primary">{property.dataHealth || 0}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          property.visibility === 'Public' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {property.visibility || 'Private'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          property.marketingStatus === 'On Market' ? 'bg-primary text-white' :
                          property.marketingStatus === 'Broker-Ready' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {property.marketingStatus || 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-secondary hover:text-primary p-1">
                          <i className="fa-solid fa-ellipsis-vertical"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
