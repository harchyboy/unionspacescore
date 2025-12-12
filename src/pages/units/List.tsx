import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useUnits, type UnitListItem } from '../../api/units';

function formatMoneyGBP(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(value);
}

function daysSince(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  const diffMs = Date.now() - t;
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

export function UnitsList() {
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [sizeFilter, setSizeFilter] = useState('');
  const [fitoutFilter, setFitoutFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pipelineFilter, setPipelineFilter] = useState('');
  const navigate = useNavigate();

  const { data, isLoading, error } = useUnits({
    search,
    status: statusFilter || undefined,
    fitOut: fitoutFilter || undefined,
    pipelineStage: pipelineFilter || undefined,
    limit: 200,
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  });

  const units = data?.units ?? [];

  const filteredUnits = useMemo(() => {
    let list = units.slice();

    // Tab filters (derived from real status/pipelineStage)
    if (activeTab === 'available') list = list.filter((u) => (u.status || '').toLowerCase() === 'available');
    if (activeTab === 'under-offer') list = list.filter((u) => (u.status || '').toLowerCase() === 'under offer');
    if (activeTab === 'let') list = list.filter((u) => (u.status || '').toLowerCase() === 'let');
    if (activeTab === 'viewing') list = list.filter((u) => (u.pipelineStage || '').toLowerCase() === 'viewing');
    if (activeTab === 'hots') list = list.filter((u) => (u.pipelineStage || '').toLowerCase() === 'hots');

    // Size band filter
    if (sizeFilter) {
      const parseBand = (band: string) => {
        if (band === '0-1000') return [0, 1000] as const;
        if (band === '1000-2500') return [1000, 2500] as const;
        if (band === '2500-5000') return [2500, 5000] as const;
        if (band === '5000-10000') return [5000, 10000] as const;
        if (band === '10000+') return [10000, Infinity] as const;
        return null;
      };
      const b = parseBand(sizeFilter);
      if (b) {
        const [min, max] = b;
        list = list.filter((u) => {
          const s = u.sizeSqFt ?? null;
          if (s == null) return false;
          return s >= min && s <= max;
        });
      }
    }

    return list;
  }, [units, activeTab, sizeFilter]);

  const counts = useMemo(() => {
    const by = (pred: (u: UnitListItem) => boolean) => units.filter(pred).length;
    return {
      all: units.length,
      available: by((u) => (u.status || '').toLowerCase() === 'available'),
      underOffer: by((u) => (u.status || '').toLowerCase() === 'under offer'),
      let: by((u) => (u.status || '').toLowerCase() === 'let'),
      viewing: by((u) => (u.pipelineStage || '').toLowerCase() === 'viewing'),
      hots: by((u) => (u.pipelineStage || '').toLowerCase() === 'hots'),
    };
  }, [units]);

  const clearFilters = () => {
    setSearch('');
    setSizeFilter('');
    setFitoutFilter('');
    setStatusFilter('');
    setPipelineFilter('');
  };

  const getAgingBadgeColor = (days: number) => {
    if (days >= 40) return 'bg-destructive';
    if (days >= 25) return 'bg-amber-500';
    return 'bg-green-500';
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-[#252525] text-white';
      case 'Under Offer':
        return 'bg-[#F0F0F0] text-[#252525] border border-[#8E8E8E]';
      case 'Let':
        return 'bg-[#F0F0F0] text-[#252525]';
      default:
        return 'bg-[#F0F0F0] text-[#252525]';
    }
  };

  const getPipelineBadgeStyle = (pipeline: string | null) => {
    if (!pipeline) return 'bg-[#F0F0F0] text-[#252525]';
    switch (pipeline) {
      case 'Viewing':
        return 'bg-[#F0F0F0] text-[#252525] border border-[#8E8E8E]';
      case 'HoTs':
        return 'bg-[#F0F0F0] text-[#252525] border border-[#252525]';
      case 'Legals':
        return 'bg-[#252525] text-white';
      default:
        return 'bg-[#F0F0F0] text-[#252525]';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-white border border-[#E6E6E6] rounded-lg p-6">
          <h1 className="text-xl font-semibold text-primary mb-2">Units</h1>
          <p className="text-secondary text-sm">Failed to load real unit data.</p>
          <pre className="text-xs text-secondary mt-4 whitespace-pre-wrap">{String((error as Error).message || error)}</pre>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'all', label: `All Units (${counts.all})` },
    { id: 'available', label: `Available (${counts.available})` },
    { id: 'under-offer', label: `Under Offer (${counts.underOffer})` },
    { id: 'let', label: `Let (${counts.let})` },
    { id: 'viewing', label: `Viewing (${counts.viewing})` },
    { id: 'hots', label: `HoTs (${counts.hots})` },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Page Header */}
      <div className="bg-white border-b border-[#E6E6E6] px-8 py-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-primary mb-2">Units</h1>
            <p className="text-secondary text-sm">Manage available spaces, pricing, and pipeline stages</p>
          </div>
          <Link
            to="/properties/new"
            className="bg-[#252525] text-white px-5 py-2.5 rounded font-medium hover:bg-[#252525]/90 transition-all flex items-center space-x-2"
          >
            <i className="fa-solid fa-plus"></i>
            <span>Add Unit</span>
          </Link>
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
          <div className="flex-1"></div>
          <div className="relative">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search units / properties…"
              className="bg-[#FAFAFA] border border-[#E6E6E6] rounded-lg px-4 py-2 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary w-[280px]"
            />
          </div>
          <button className="text-secondary hover:text-primary text-sm flex items-center space-x-1">
            <i className="fa-solid fa-filter"></i>
            <span>Filters</span>
          </button>
          <button className="text-secondary hover:text-primary text-sm flex items-center space-x-1">
            <i className="fa-solid fa-download"></i>
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-[#E6E6E6] px-8 py-4">
        <div className="flex items-center space-x-3 flex-wrap gap-2">
          <div className="relative">
            <select
              value={sizeFilter}
              onChange={(e) => setSizeFilter(e.target.value)}
              className="appearance-none bg-[#FAFAFA] border border-[#E6E6E6] rounded-lg px-4 py-2 pr-8 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Size Bands</option>
              <option value="0-1000">0-1,000 sq ft</option>
              <option value="1000-2500">1,000-2,500 sq ft</option>
              <option value="2500-5000">2,500-5,000 sq ft</option>
              <option value="5000-10000">5,000-10,000 sq ft</option>
              <option value="10000+">10,000+ sq ft</option>
            </select>
            <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary text-xs pointer-events-none"></i>
          </div>
          
          <div className="relative">
            <select
              value={fitoutFilter}
              onChange={(e) => setFitoutFilter(e.target.value)}
              className="appearance-none bg-[#FAFAFA] border border-[#E6E6E6] rounded-lg px-4 py-2 pr-8 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Fit-out</option>
              <option value="Shell">Shell</option>
              <option value="Cat A">Cat A</option>
              <option value="Cat A+">Cat A+</option>
            </select>
            <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary text-xs pointer-events-none"></i>
          </div>
          
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-[#FAFAFA] border border-[#E6E6E6] rounded-lg px-4 py-2 pr-8 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Status</option>
              <option value="Available">Available</option>
              <option value="Under Offer">Under Offer</option>
              <option value="Let">Let</option>
              <option value="Closed">Closed</option>
            </select>
            <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary text-xs pointer-events-none"></i>
          </div>
          
          <div className="relative">
            <select
              value={pipelineFilter}
              onChange={(e) => setPipelineFilter(e.target.value)}
              className="appearance-none bg-[#FAFAFA] border border-[#E6E6E6] rounded-lg px-4 py-2 pr-8 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Pipeline Stages</option>
              <option value="New">New</option>
              <option value="Viewing">Viewing</option>
              <option value="HoTs">HoTs</option>
              <option value="Legals">Legals</option>
              <option value="Closed">Closed</option>
            </select>
            <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary text-xs pointer-events-none"></i>
          </div>
          
          <button 
            onClick={clearFilters}
            className="text-secondary hover:text-primary text-sm ml-2"
          >
            Clear all
          </button>
        </div>
      </div>

      {/* Units Table & Content */}
      <div className="flex-1 overflow-y-auto bg-[#F0F0F0] px-8 py-6">
        {/* Units Table */}
        <div className="bg-white rounded-lg border border-[#E6E6E6] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#FAFAFA] border-b border-[#E6E6E6]">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input type="checkbox" className="w-4 h-4 text-primary border-[#E6E6E6] rounded focus:ring-primary" />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-secondary uppercase tracking-wider">Unit</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-secondary uppercase tracking-wider">Property</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-secondary uppercase tracking-wider">Size</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-secondary uppercase tracking-wider">Desks</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-secondary uppercase tracking-wider">Fit-out</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-secondary uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-secondary uppercase tracking-wider">Price (pcm)</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-secondary uppercase tracking-wider">Pipeline</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-secondary uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E6E6]">
                {filteredUnits.map((unit) => {
                  const daysOnMarket = daysSince(unit.zohoCreatedAt || unit.createdAt) ?? 0;
                  return (
                  <tr 
                    key={unit.id} 
                    className="hover:bg-[#FAFAFA] transition-all cursor-pointer relative overflow-visible"
                    onClick={() => navigate(`/units/${unit.id}`)}
                  >
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" className="w-4 h-4 text-primary border-[#E6E6E6] rounded focus:ring-primary" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="font-semibold text-primary text-sm">{unit.code}</div>
                        {daysOnMarket ? (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white ${getAgingBadgeColor(daysOnMarket)} ${daysOnMarket >= 25 ? 'animate-pulse' : ''}`}>
                            {daysOnMarket}d
                          </span>
                        ) : null}
                      </div>
                      <div className="text-xs text-secondary">{unit.floor || '—'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-primary font-medium">{unit.property?.name || '—'}</div>
                      <div className="text-xs text-secondary">{unit.property?.city || unit.property?.postcode || '—'}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-primary">{unit.sizeSqFt != null ? `${unit.sizeSqFt.toLocaleString()} sq ft` : '—'}</td>
                    <td className="px-6 py-4 text-sm text-primary">{unit.desks != null ? unit.desks : '—'}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded text-[11px] font-bold uppercase tracking-wider bg-[#FAFAFA] text-primary">
                        {unit.fitOut || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded text-[11px] font-bold uppercase tracking-wider ${getStatusBadgeStyle(unit.status || '')}`}>
                        {unit.status || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-primary font-medium">{formatMoneyGBP(unit.pricePcm)}</div>
                      {unit.pricePsf != null ? <div className="text-xs text-secondary">{formatMoneyGBP(unit.pricePsf)} / sq ft</div> : null}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded text-[11px] font-bold uppercase tracking-wider ${getPipelineBadgeStyle(unit.pipelineStage || null)}`}>
                        {unit.pipelineStage || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-secondary hover:text-primary">
                        <i className="fa-solid fa-ellipsis-vertical"></i>
                      </button>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bulk Actions */}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-secondary">
            Showing {filteredUnits.length} of {counts.all} units
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-4 py-2 border border-[#E6E6E6] rounded-lg text-sm text-primary hover:bg-[#FAFAFA] transition-all flex items-center space-x-2">
              <i className="fa-solid fa-share-nodes"></i>
              <span>Publish / Unpublish</span>
            </button>
            <button className="px-4 py-2 border border-[#E6E6E6] rounded-lg text-sm text-primary hover:bg-[#FAFAFA] transition-all flex items-center space-x-2">
              <i className="fa-solid fa-file-pdf"></i>
              <span>Generate PDF Pack</span>
            </button>
            <button className="px-4 py-2 border border-[#E6E6E6] rounded-lg text-sm text-primary hover:bg-[#FAFAFA] transition-all flex items-center space-x-2">
              <i className="fa-solid fa-envelope"></i>
              <span>Invite Viewing</span>
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-5 gap-6">
          <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-secondary text-sm font-medium">Total Units</div>
              <i className="fa-solid fa-door-open text-primary"></i>
            </div>
            <div className="text-3xl font-semibold text-primary">{counts.all}</div>
            <div className="text-xs text-secondary mt-2">Across {new Set(units.map(u => u.property?.id).filter(Boolean)).size} properties</div>
          </div>
          
          <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-secondary text-sm font-medium">Available</div>
              <i className="fa-solid fa-check-circle text-green-600"></i>
            </div>
            <div className="text-3xl font-semibold text-primary">{counts.available}</div>
            <div className="text-xs text-secondary mt-2">{counts.all ? Math.round((counts.available / counts.all) * 100) : 0}% of inventory</div>
          </div>
          
          <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-secondary text-sm font-medium">Under Offer</div>
              <i className="fa-solid fa-clock text-amber-600"></i>
            </div>
            <div className="text-3xl font-semibold text-primary">{counts.underOffer}</div>
            <div className="text-xs text-secondary mt-2">{counts.all ? Math.round((counts.underOffer / counts.all) * 100) : 0}% of inventory</div>
          </div>
          
          <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-secondary text-sm font-medium">Avg Days on Market</div>
              <i className="fa-solid fa-calendar text-primary"></i>
            </div>
            <div className="text-3xl font-semibold text-primary">
              {(() => {
                const vals = units.map((u) => daysSince(u.zohoCreatedAt || u.createdAt)).filter((d): d is number => d != null);
                if (!vals.length) return '—';
                const avg = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
                return `${avg}d`;
              })()}
            </div>
            <div className="text-xs text-secondary mt-2">Based on Zoho created date</div>
          </div>
          
          <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-secondary text-sm font-medium">Avg Guide Price</div>
              <i className="fa-solid fa-sterling-sign text-primary"></i>
            </div>
            <div className="text-3xl font-semibold text-primary">
              {(() => {
                const vals = units.map((u) => u.pricePcm).filter((v): v is number => typeof v === 'number' && !Number.isNaN(v));
                if (!vals.length) return '—';
                const avg = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
                return formatMoneyGBP(avg);
              })()}
            </div>
            <div className="text-xs text-secondary mt-2">Per month (from Zoho)</div>
          </div>
        </div>

        {/* Pipeline Distribution */}
        <div className="mt-8">
          <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-primary">Pipeline Distribution</h3>
              <button className="text-sm text-secondary hover:text-primary flex items-center space-x-1">
                <span>View Details</span>
                <i className="fa-solid fa-arrow-right text-xs"></i>
              </button>
            </div>
            <div className="flex items-end justify-between h-[200px] px-8">
              {(() => {
                const available = counts.available;
                const viewing = counts.viewing;
                const hots = counts.hots;
                const legals = units.filter((u) => (u.pipelineStage || '').toLowerCase() === 'legals').length;
                const letCount = counts.let;
                const items = [
                  { label: 'Available', value: available, color: 'bg-green-500' },
                  { label: 'Viewing', value: viewing, color: 'bg-blue-500' },
                  { label: 'HoTs', value: hots, color: 'bg-purple-500' },
                  { label: 'Legals', value: legals, color: 'bg-amber-500' },
                  { label: 'Let', value: letCount, color: 'bg-gray-500' },
                ];
                const max = Math.max(1, ...items.map((i) => i.value));
                return items.map((item) => (
                <div key={item.label} className="flex flex-col items-center">
                  <div 
                    className={`w-16 ${item.color} rounded-t`} 
                    style={{ height: `${(item.value / max) * 150}px`, minHeight: item.value > 0 ? '10px' : '0' }}
                  ></div>
                  <div className="text-xs text-secondary mt-2">{item.label}</div>
                  <div className="text-sm font-semibold text-primary">{item.value}</div>
                </div>
                ));
              })()}
            </div>
          </div>
        </div>

        {/* Recent Activity & Top Performers */}
        <div className="grid grid-cols-2 gap-6 mt-8">
          <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
            <h3 className="text-lg font-semibold text-primary mb-2">Data Source</h3>
            <p className="text-sm text-secondary">
              This page is backed by synced Zoho CRM unit records (Zoho → Supabase → API → UI).
            </p>
            <p className="text-xs text-secondary mt-3">
              If the list is empty, run the sync endpoint and ensure Zoho Units have a linked Zoho Property.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
            <h3 className="text-lg font-semibold text-primary mb-6">Newest Units</h3>
            <div className="space-y-4">
              {filteredUnits
                .slice()
                .sort((a, b) => (new Date(b.zohoCreatedAt || b.createdAt || 0).getTime() - new Date(a.zohoCreatedAt || a.createdAt || 0).getTime()))
                .slice(0, 4)
                .map((u, idx) => (
                  <div key={u.id} className={`flex items-center justify-between ${idx < 3 ? 'pb-4 border-b border-[#E6E6E6]' : ''}`}>
                    <div>
                      <div className="text-sm font-semibold text-primary">{u.code}</div>
                      <div className="text-xs text-secondary">{u.property?.name || '—'}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-primary">{u.sizeSqFt != null ? `${u.sizeSqFt.toLocaleString()} sq ft` : '—'}</div>
                      <div className="text-xs text-secondary">{u.status || '—'}</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

