import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useProperties } from '../../api/properties';
import { useSubmarkets } from '../../api/submarkets';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { MultiSelect } from '../../components/ui/MultiSelect';

const tabs = [
  { id: 'all', label: 'All Properties' },
  { id: 'missing', label: 'Missing Assets' },
  { id: 'ready', label: 'Ready to Publish' },
  { id: 'healthy', label: 'Data Health > 85%' },
];

export function PropertiesList() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('all');
  const [submarketFilter, setSubmarketFilter] = useState<string[]>([]);
  const [visibilityFilter, setVisibilityFilter] = useState('');
  const [agentFilter, setAgentFilter] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('');
  const [networkFilter, setNetworkFilter] = useState('');
  const [healthFilter, setHealthFilter] = useState('');
  const [sortBy, setSortBy] = useState('last-updated');
  const [selectAll, setSelectAll] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 50;

  const { data, isLoading, error } = useProperties({
    page,
    limit,
    sortBy: 'updatedAt',
    sortOrder: 'desc',
    submarkets: submarketFilter.length > 0 ? submarketFilter.join(',') : undefined,
    visibility: visibilityFilter || undefined,
    brokerSet: agentFilter || undefined,
  });

  const { data: submarketStatsData } = useSubmarkets();

  const properties = data?.properties || [];
  const totalProperties = data?.total || 0;
  const submarketStats = submarketStatsData || [];
  const totalPages = Math.ceil(totalProperties / limit);

  const clearFilters = () => {
    setSubmarketFilter([]);
    setVisibilityFilter('');
    setAgentFilter('');
    setOwnerFilter('');
    setNetworkFilter('');
    setHealthFilter('');
  };

  // Only show full page spinner on initial load, not refetching
  if (isLoading && !data) {
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
            <button
              onClick={async () => {
                if (!confirm('This will fetch all properties from Zoho. It may take a minute. Continue?')) return;
                try {
                  const response = await fetch('/api/sync', { 
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ entity: 'properties' })
                  });
                  
                  let result;
                  try {
                    result = await response.json();
                  } catch {
                    result = { message: await response.text() };
                  }

                  if (response.ok) {
                    const synced = result?.results?.properties?.synced || 0;
                    alert(`Sync complete! ${synced} properties synced from Zoho.`);
                    queryClient.invalidateQueries({ queryKey: ['properties'] });
                  } else {
                    alert(`Sync failed: ${result.message || 'Unknown error'}`);
                  }
                } catch (error) {
                  console.error('Sync failed', error);
                  alert('Sync failed. Check console for details.');
                }
              }}
              className="px-4 py-2.5 border border-[#E6E6E6] rounded-lg text-sm text-primary hover:bg-[#FAFAFA] transition-all flex items-center space-x-2"
            >
              <i className="fa-solid fa-rotate"></i>
              <span>Sync Zoho</span>
            </button>
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
            <MultiSelect
              options={submarketStats.map(s => ({ value: s.submarket, label: s.submarket }))}
              value={submarketFilter}
              onChange={setSubmarketFilter}
              placeholder="All Submarkets"
              className="min-w-[200px]"
            />
          </div>
          
          <div className="relative">
            <select
              value={visibilityFilter}
              onChange={(e) => setVisibilityFilter(e.target.value)}
              className="appearance-none bg-[#FAFAFA] border border-[#E6E6E6] rounded-lg px-4 py-2 pr-8 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Visibility</option>
              <option value="Public">Public</option>
              <option value="Private">Private</option>
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
              <option value="Knight Frank">Knight Frank</option>
              <option value="CBRE">CBRE</option>
              <option value="JLL">JLL</option>
              <option value="Savills">Savills</option>
              <option value="Cushman & Wakefield">Cushman & Wakefield</option>
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
              <option value="Tom">Tom</option>
              <option value="Tom Townsend">Tom Townsend</option>
              <option value="Max Chen">Max Chen</option>
              <option value="Dani Roberts">Dani Roberts</option>
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
              <option value="Public Network">Public Network</option>
              <option value="Private · 10 brokers">Private · 10 brokers</option>
              <option value="Private · 5 brokers">Private · 5 brokers</option>
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
              <option value="<50">&lt; 50%</option>
              <option value="50-75">50-75%</option>
              <option value="75-85">75-85%</option>
              <option value=">85">&gt; 85%</option>
            </select>
            <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary text-xs pointer-events-none"></i>
          </div>
          
          <button 
            onClick={clearFilters}
            className="text-secondary hover:text-primary text-sm ml-2 flex items-center space-x-1"
          >
            <i className="fa-solid fa-rotate-left text-xs"></i>
            <span>Clear all</span>
          </button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      <div className="bg-[#FAFAFA] border-b border-[#E6E6E6] px-8 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              checked={selectAll}
              onChange={(e) => setSelectAll(e.target.checked)}
              className="w-4 h-4 text-primary border-[#E6E6E6] rounded focus:ring-primary" 
            />
            <label className="text-sm text-secondary">Select All</label>
          </div>
          <span className="text-sm text-secondary">{totalProperties} properties</span>
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
              <option value="occupancy-desc">Sort by: Occupancy High-Low</option>
              <option value="health-desc">Sort by: Data Health</option>
            </select>
            <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary text-xs pointer-events-none"></i>
          </div>
        </div>
      </div>

      {/* Properties Table & Content */}
      <div className="flex-1 overflow-y-auto bg-[#F0F0F0] px-8 py-6">
        {properties.length === 0 ? (
          <div className="bg-white rounded-lg border border-[#E6E6E6] p-12 text-center">
            <div className="w-16 h-16 bg-[#FAFAFA] rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fa-solid fa-building text-secondary text-2xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-primary mb-2">No properties yet</h3>
            <p className="text-sm text-secondary mb-6">Add a building to start matching spaces</p>
            <Link
              to="/properties/new"
              className="bg-primary text-white px-6 py-2.5 rounded-lg font-medium hover:bg-opacity-90 transition-all inline-block"
            >
              Add Your First Property
            </Link>
          </div>
        ) : (
          <>
            {/* Properties Table */}
            <div className="bg-white rounded-lg border border-[#E6E6E6] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#FAFAFA] border-b border-[#E6E6E6]">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <input type="checkbox" className="w-4 h-4 text-primary border-[#E6E6E6] rounded focus:ring-primary" />
                      </th>
                      <th className="px-6 py-3 text-left">
                        <button className="flex items-center space-x-1 text-xs font-semibold text-secondary uppercase tracking-wider hover:text-primary">
                          <span>Property</span>
                          <i className="fa-solid fa-sort text-xs"></i>
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left">
                        <button className="flex items-center space-x-1 text-xs font-semibold text-secondary uppercase tracking-wider hover:text-primary">
                          <span>Submarket</span>
                          <i className="fa-solid fa-sort text-xs"></i>
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left">
                        <button className="flex items-center space-x-1 text-xs font-semibold text-secondary uppercase tracking-wider hover:text-primary">
                          <span>Units</span>
                          <i className="fa-solid fa-sort text-xs"></i>
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left">
                        <button className="flex items-center space-x-1 text-xs font-semibold text-secondary uppercase tracking-wider hover:text-primary">
                          <span>Occupancy</span>
                          <i className="fa-solid fa-sort text-xs"></i>
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left">
                        <button className="flex items-center space-x-1 text-xs font-semibold text-secondary uppercase tracking-wider hover:text-primary">
                          <span>Visibility</span>
                          <i className="fa-solid fa-sort text-xs"></i>
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left">
                        <button className="flex items-center space-x-1 text-xs font-semibold text-secondary uppercase tracking-wider hover:text-primary">
                          <span>Broker Network</span>
                          <i className="fa-solid fa-sort text-xs"></i>
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left">
                        <button className="flex items-center space-x-1 text-xs font-semibold text-secondary uppercase tracking-wider hover:text-primary">
                          <span>Landlord</span>
                          <i className="fa-solid fa-sort text-xs"></i>
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left">
                        <button className="flex items-center space-x-1 text-xs font-semibold text-secondary uppercase tracking-wider hover:text-primary">
                          <span>Owner</span>
                          <i className="fa-solid fa-sort text-xs"></i>
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left">
                        <button className="flex items-center space-x-1 text-xs font-semibold text-secondary uppercase tracking-wider hover:text-primary">
                          <span>Assets</span>
                          <i className="fa-solid fa-sort text-xs"></i>
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left">
                        <button className="flex items-center space-x-1 text-xs font-semibold text-secondary uppercase tracking-wider hover:text-primary">
                          <span>Data Health</span>
                          <i className="fa-solid fa-sort text-xs"></i>
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left">
                        <button className="flex items-center space-x-1 text-xs font-semibold text-secondary uppercase tracking-wider hover:text-primary">
                          <span>Updated By</span>
                          <i className="fa-solid fa-sort text-xs"></i>
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6E6E6]">
                    {properties.map((property) => (
                      <tr 
                        key={property.id} 
                        className="hover:bg-[#FAFAFA] transition-all cursor-pointer"
                      >
                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" className="w-4 h-4 text-primary border-[#E6E6E6] rounded focus:ring-primary" />
                        </td>
                        <td className="px-6 py-4">
                          <Link to={`/properties/${property.id}`} className="flex items-center space-x-3 group">
                            <div className="w-12 h-12 bg-[#FAFAFA] rounded overflow-hidden flex-shrink-0">
                              {property.images?.[0] ? (
                                <img src={property.images[0]} alt={property.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <i className="fa-solid fa-building text-secondary"></i>
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-semibold text-primary text-sm group-hover:underline">{property.name}</div>
                              <div className="text-xs text-secondary">{property.addressLine}</div>
                            </div>
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-sm text-primary">{property.submarket || '—'}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-1 text-sm">
                            <span className="font-semibold text-primary">{property.stats?.available || 0}</span>
                            <span className="text-secondary">/</span>
                            <span className="text-secondary">{property.stats?.totalUnits || property.units?.length || 0}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-[#FAFAFA] rounded-full h-2 w-20">
                              <div 
                                className="bg-primary h-2 rounded-full" 
                                style={{ width: `${property.stats?.occupancyPct || 0}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-secondary font-medium">{property.stats?.occupancyPct || 0}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#FAFAFA] text-primary border border-[#E6E6E6]">
                            {property.marketing?.visibility || 'Private'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-secondary">
                          {property.marketing?.brokerSet || 'Public Network'}
                        </td>
                        <td className="px-6 py-4 text-sm text-primary">
                          {property.contacts?.landlord?.name || '—'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <img 
                              src="https://hartzai.com/wp-content/uploads/2025/10/Tom.jpg" 
                              alt="Tom" 
                              className="w-6 h-6 rounded-full object-cover"
                            />
                            <span className="text-sm text-primary">Tom</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2 text-xs">
                            <span className="text-secondary">{property.images?.length || 0} imgs</span>
                            {(property.images?.length || 0) > 0 && (
                              <i className="fa-solid fa-check text-primary"></i>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-[#FAFAFA] rounded-full h-2 w-16">
                              <div 
                                className="bg-primary h-2 rounded-full" 
                                style={{ width: `${property.dataHealth || 85}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-primary font-medium">{property.dataHealth || 85}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-primary">Tom</div>
                          <div className="text-xs text-secondary">2h ago</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-secondary">
                Showing {totalProperties === 0 ? 0 : (page - 1) * limit + 1}-{Math.min(page * limit, totalProperties)} of {totalProperties} properties
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-2 border border-[#E6E6E6] rounded-lg text-sm text-secondary hover:bg-[#FAFAFA] transition-all disabled:opacity-50"
                >
                  <i className="fa-solid fa-chevron-left"></i>
                </button>
                <span className="px-3 py-2 text-sm text-secondary">
                  Page {page} of {totalPages || 1}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-2 border border-[#E6E6E6] rounded-lg text-sm text-primary hover:bg-[#FAFAFA] transition-all disabled:opacity-50"
                >
                  <i className="fa-solid fa-chevron-right"></i>
                </button>
              </div>
            </div>

            {/* Portfolio Overview */}
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-primary mb-4">Portfolio Overview</h2>
              <div className="grid grid-cols-4 gap-6">
                <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-secondary text-sm font-medium">Total Properties</div>
                    <div className="w-10 h-10 bg-[#FAFAFA] rounded-lg flex items-center justify-center">
                      <i className="fa-solid fa-building text-primary"></i>
                    </div>
                  </div>
                  <div className="text-3xl font-semibold text-primary mb-1">{totalProperties}</div>
                  <div className="flex items-center space-x-1 text-xs">
                    <i className="fa-solid fa-arrow-up text-primary"></i>
                    <span className="text-primary font-medium">+2</span>
                    <span className="text-secondary">this month</span>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-secondary text-sm font-medium">Available Units</div>
                    <div className="w-10 h-10 bg-[#FAFAFA] rounded-lg flex items-center justify-center">
                      <i className="fa-solid fa-door-open text-primary"></i>
                    </div>
                  </div>
                  <div className="text-3xl font-semibold text-primary mb-1">58</div>
                  <div className="text-xs text-secondary">Across all properties</div>
                </div>
                
                <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-secondary text-sm font-medium">Avg Occupancy</div>
                    <div className="w-10 h-10 bg-[#FAFAFA] rounded-lg flex items-center justify-center">
                      <i className="fa-solid fa-chart-line text-primary"></i>
                    </div>
                  </div>
                  <div className="text-3xl font-semibold text-primary mb-1">48%</div>
                  <div className="flex items-center space-x-1 text-xs">
                    <i className="fa-solid fa-arrow-up text-primary"></i>
                    <span className="text-primary font-medium">+5%</span>
                    <span className="text-secondary">vs last quarter</span>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-secondary text-sm font-medium">Avg Data Health</div>
                    <div className="w-10 h-10 bg-[#FAFAFA] rounded-lg flex items-center justify-center">
                      <i className="fa-solid fa-heart-pulse text-primary"></i>
                    </div>
                  </div>
                  <div className="text-3xl font-semibold text-primary mb-1">82%</div>
                  <div className="flex items-center space-x-1 text-xs">
                    <i className="fa-solid fa-arrow-up text-primary"></i>
                    <span className="text-primary font-medium">+8%</span>
                    <span className="text-secondary">this month</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Submarket Breakdown & Recent Activity */}
            <div className="grid grid-cols-2 gap-6 mt-8">
              <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
                <h3 className="text-lg font-semibold text-primary mb-6">Submarket Breakdown</h3>
                <div className="space-y-4">
                  {submarketStats.length === 0 ? (
                    <div className="text-sm text-secondary">No submarket data available</div>
                  ) : (
                    submarketStats.slice(0, 5).map((stat) => (
                      <div key={stat.submarket}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-primary font-medium">{stat.submarket}</span>
                          <span className="text-sm text-secondary">{stat.count} properties</span>
                        </div>
                        <div className="w-full bg-[#FAFAFA] rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${(stat.count / totalProperties) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
                <h3 className="text-lg font-semibold text-primary mb-6">Recent Activity</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4 pb-4 border-b border-[#E6E6E6]">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="fa-solid fa-plus text-white text-xs"></i>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-primary font-medium">New property added</div>
                      <div className="text-xs text-secondary mt-1">99 Bishopsgate added to portfolio</div>
                      <div className="text-xs text-secondary mt-1">2 hours ago</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 pb-4 border-b border-[#E6E6E6]">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="fa-solid fa-file-pdf text-white text-xs"></i>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-primary font-medium">Floorplan uploaded</div>
                      <div className="text-xs text-secondary mt-1">New floorplan added to Principal Place</div>
                      <div className="text-xs text-secondary mt-1">1 day ago</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="fa-solid fa-pencil text-white text-xs"></i>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-primary font-medium">Property updated</div>
                      <div className="text-xs text-secondary mt-1">Occupancy data refreshed for One Canada Square</div>
                      <div className="text-xs text-secondary mt-1">3 days ago</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Disposal Agent Performance */}
            <div className="mt-8">
              <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
                <h3 className="text-lg font-semibold text-primary mb-6">Disposal Agent Performance</h3>
                <div className="grid grid-cols-5 gap-4">
                  {[
                    { name: 'Knight Frank', count: 6 },
                    { name: 'CBRE', count: 5 },
                    { name: 'JLL', count: 5 },
                    { name: 'Savills', count: 4 },
                    { name: 'Cushman', count: 4 },
                  ].map((agent) => (
                    <div key={agent.name} className="text-center">
                      <div className="w-16 h-16 bg-[#FAFAFA] rounded-full flex items-center justify-center mx-auto mb-3">
                        <i className="fa-solid fa-building text-primary text-2xl"></i>
                      </div>
                      <div className="text-sm font-semibold text-primary">{agent.name}</div>
                      <div className="text-xs text-secondary mt-1">{agent.count} properties</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
