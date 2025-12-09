import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

const tabs = [
  { id: 'all', label: 'All Units (58)' },
  { id: 'available', label: 'Available (32)' },
  { id: 'under-offer', label: 'Under Offer (18)' },
  { id: 'let', label: 'Let (8)' },
  { id: 'viewing', label: 'Viewing Stage (14)' },
  { id: 'hots', label: 'HoTs (6)' },
];

// Mock units data
const mockUnits = [
  {
    id: '1',
    code: '99B-3-01',
    floor: 'Floor 3, Suite 01',
    property: { name: '99 Bishopsgate', submarket: 'City Core' },
    sizeSqFt: 2450,
    desks: 18,
    fitOut: 'Cat A+',
    status: 'Available',
    pricingMode: 'All-Inclusive',
    guidePrice: '£8,400/mo',
    visibility: 'Private',
    pipeline: 'Viewing',
    daysOnMarket: 42,
    isConfidential: true,
  },
  {
    id: '2',
    code: 'TAA-2-05',
    floor: 'Floor 2, Suite 05',
    property: { name: 'The Tides At Arverne', submarket: 'Shoreditch' },
    sizeSqFt: 3200,
    desks: 24,
    fitOut: 'Fitted',
    status: 'Under Offer',
    pricingMode: 'Bolt-On',
    guidePrice: '£5,600/mo',
    priceExtras: '+ SC + Rates',
    visibility: 'Public',
    pipeline: 'HoTs',
    daysOnMarket: 28,
    isConfidential: false,
  },
  {
    id: '3',
    code: 'OCS-15-02',
    floor: 'Floor 15, Suite 02',
    property: { name: 'One Canada Square', submarket: 'Canary Wharf' },
    sizeSqFt: 1850,
    desks: 14,
    fitOut: 'Cat A',
    status: 'Available',
    pricingMode: 'All-Inclusive',
    guidePrice: '£6,200/mo',
    visibility: 'Public',
    pipeline: null,
    daysOnMarket: 14,
    isConfidential: false,
  },
  {
    id: '4',
    code: 'TLB-8-03',
    floor: 'Floor 8, Suite 03',
    property: { name: 'The Leadenhall Building', submarket: 'City Core' },
    sizeSqFt: 4100,
    desks: 32,
    fitOut: 'Cat A+',
    status: 'Available',
    pricingMode: 'Bolt-On',
    guidePrice: '£9,800/mo',
    priceExtras: '+ SC + Rates',
    visibility: 'Private',
    pipeline: 'Viewing',
    daysOnMarket: 7,
    isConfidential: false,
  },
  {
    id: '5',
    code: 'PP-4-12',
    floor: 'Floor 4, Suite 12',
    property: { name: 'Principal Place', submarket: 'Shoreditch' },
    sizeSqFt: 2800,
    desks: 20,
    fitOut: 'Fitted',
    status: 'Under Offer',
    pricingMode: 'All-Inclusive',
    guidePrice: '£7,800/mo',
    visibility: 'Public',
    pipeline: 'Legals',
    daysOnMarket: 35,
    isConfidential: false,
  },
  {
    id: '6',
    code: '99B-5-08',
    floor: 'Floor 5, Suite 08',
    property: { name: '99 Bishopsgate', submarket: 'City Core' },
    sizeSqFt: 1500,
    desks: 12,
    fitOut: 'Cat A+',
    status: 'Available',
    pricingMode: 'All-Inclusive',
    guidePrice: '£5,200/mo',
    visibility: 'Public',
    pipeline: null,
    daysOnMarket: 3,
    isConfidential: false,
  },
  {
    id: '7',
    code: 'OCS-22-06',
    floor: 'Floor 22, Suite 06',
    property: { name: 'One Canada Square', submarket: 'Canary Wharf' },
    sizeSqFt: 5400,
    desks: 42,
    fitOut: 'Cat A',
    status: 'Let',
    pricingMode: 'Bolt-On',
    guidePrice: '£12,800/mo',
    priceExtras: '+ SC + Rates',
    visibility: 'Private',
    pipeline: null,
    daysOnMarket: 62,
    isConfidential: false,
  },
  {
    id: '8',
    code: 'TLB-12-01',
    floor: 'Floor 12, Suite 01',
    property: { name: 'The Leadenhall Building', submarket: 'City Core' },
    sizeSqFt: 3600,
    desks: 28,
    fitOut: 'Cat A+',
    status: 'Available',
    pricingMode: 'All-Inclusive',
    guidePrice: '£10,200/mo',
    visibility: 'Public',
    pipeline: 'Viewing',
    daysOnMarket: 18,
    isConfidential: false,
  },
];

export function UnitsList() {
  const [activeTab, setActiveTab] = useState('all');
  const [sizeFilter, setSizeFilter] = useState('');
  const [fitoutFilter, setFitoutFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pricingFilter, setPricingFilter] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState('');
  const [submarketFilter, setSubmarketFilter] = useState('');
  const [pipelineFilter, setPipelineFilter] = useState('');
  const [isLoading] = useState(false);

  const clearFilters = () => {
    setSizeFilter('');
    setFitoutFilter('');
    setStatusFilter('');
    setPricingFilter('');
    setVisibilityFilter('');
    setSubmarketFilter('');
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
        return 'bg-green-100 text-green-800';
      case 'Under Offer':
        return 'bg-amber-100 text-amber-800';
      case 'Let':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPipelineBadgeStyle = (pipeline: string | null) => {
    if (!pipeline) return 'bg-gray-100 text-gray-800';
    switch (pipeline) {
      case 'Viewing':
        return 'bg-blue-100 text-blue-800';
      case 'HoTs':
        return 'bg-purple-100 text-purple-800';
      case 'Legals':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

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
            className="bg-primary text-white px-6 py-2.5 rounded-lg font-medium hover:bg-opacity-90 transition-all flex items-center space-x-2"
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
              <option value="Cat A">Cat A</option>
              <option value="Cat A+">Cat A+</option>
              <option value="Fitted">Fitted</option>
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
            </select>
            <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary text-xs pointer-events-none"></i>
          </div>
          
          <div className="relative">
            <select
              value={pricingFilter}
              onChange={(e) => setPricingFilter(e.target.value)}
              className="appearance-none bg-[#FAFAFA] border border-[#E6E6E6] rounded-lg px-4 py-2 pr-8 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Pricing Modes</option>
              <option value="All-Inclusive">All-Inclusive</option>
              <option value="Bolt-On">Bolt-On</option>
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
              <option value="Public">Public</option>
              <option value="Private">Private</option>
            </select>
            <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary text-xs pointer-events-none"></i>
          </div>
          
          <div className="relative">
            <select
              value={submarketFilter}
              onChange={(e) => setSubmarketFilter(e.target.value)}
              className="appearance-none bg-[#FAFAFA] border border-[#E6E6E6] rounded-lg px-4 py-2 pr-8 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Submarkets</option>
              <option value="City Core">City Core</option>
              <option value="Shoreditch">Shoreditch</option>
              <option value="Mayfair">Mayfair</option>
              <option value="Canary Wharf">Canary Wharf</option>
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
              <option value="Viewing">Viewing</option>
              <option value="HoTs">HoTs</option>
              <option value="Legals">Legals</option>
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
                  <th className="px-6 py-3 text-left text-xs font-semibold text-secondary uppercase tracking-wider">Pricing Mode</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-secondary uppercase tracking-wider">Guide Price</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-secondary uppercase tracking-wider">Visibility</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-secondary uppercase tracking-wider">Pipeline</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-secondary uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E6E6]">
                {mockUnits.map((unit) => (
                  <tr 
                    key={unit.id} 
                    className="hover:bg-[#FAFAFA] transition-all cursor-pointer relative overflow-visible"
                    onClick={() => window.location.href = `/units/${unit.id}`}
                  >
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" className="w-4 h-4 text-primary border-[#E6E6E6] rounded focus:ring-primary" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="font-semibold text-primary text-sm">{unit.code}</div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white ${getAgingBadgeColor(unit.daysOnMarket)} ${unit.daysOnMarket >= 25 ? 'animate-pulse' : ''}`}>
                          {unit.daysOnMarket}d
                        </span>
                      </div>
                      <div className="text-xs text-secondary">{unit.floor}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-primary font-medium">{unit.property.name}</div>
                      <div className="text-xs text-secondary">{unit.property.submarket}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-primary">{unit.sizeSqFt.toLocaleString()} sq ft</td>
                    <td className="px-6 py-4 text-sm text-primary">{unit.desks}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#FAFAFA] text-primary">
                        {unit.fitOut}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadgeStyle(unit.status)}`}>
                        {unit.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${unit.pricingMode === 'All-Inclusive' ? 'bg-primary text-white' : 'bg-secondary text-white'}`}>
                        {unit.pricingMode}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-primary font-medium">{unit.guidePrice}</div>
                      {unit.priceExtras && <div className="text-xs text-secondary">{unit.priceExtras}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${unit.visibility === 'Public' ? 'bg-primary text-white' : 'bg-secondary text-white'}`}>
                        {unit.visibility}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getPipelineBadgeStyle(unit.pipeline)}`}>
                        {unit.pipeline || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-secondary hover:text-primary">
                        <i className="fa-solid fa-ellipsis-vertical"></i>
                      </button>
                    </td>
                    {unit.isConfidential && (
                      <div className="absolute top-2 right-[-32px] bg-primary text-white px-10 py-0.5 text-[10px] font-semibold transform rotate-45 uppercase tracking-wider">
                        Confidential
                      </div>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bulk Actions */}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-secondary">
            Showing {mockUnits.length} of 58 units
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
            <div className="text-3xl font-semibold text-primary">58</div>
            <div className="text-xs text-secondary mt-2">Across 24 properties</div>
          </div>
          
          <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-secondary text-sm font-medium">Available</div>
              <i className="fa-solid fa-check-circle text-green-600"></i>
            </div>
            <div className="text-3xl font-semibold text-primary">32</div>
            <div className="text-xs text-secondary mt-2">55% of inventory</div>
          </div>
          
          <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-secondary text-sm font-medium">Under Offer</div>
              <i className="fa-solid fa-clock text-amber-600"></i>
            </div>
            <div className="text-3xl font-semibold text-primary">18</div>
            <div className="text-xs text-secondary mt-2">31% of inventory</div>
          </div>
          
          <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-secondary text-sm font-medium">Avg Time on Market</div>
              <i className="fa-solid fa-calendar text-primary"></i>
            </div>
            <div className="text-3xl font-semibold text-primary">24d</div>
            <div className="text-xs text-secondary mt-2">-3d vs last month</div>
          </div>
          
          <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-secondary text-sm font-medium">Avg Guide Price</div>
              <i className="fa-solid fa-sterling-sign text-primary"></i>
            </div>
            <div className="text-3xl font-semibold text-primary">£7.2k</div>
            <div className="text-xs text-secondary mt-2">Per month</div>
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
              {[
                { label: 'Available', value: 32, color: 'bg-green-500' },
                { label: 'Viewing', value: 14, color: 'bg-blue-500' },
                { label: 'HoTs', value: 6, color: 'bg-purple-500' },
                { label: 'Legals', value: 0, color: 'bg-amber-500' },
                { label: 'Let', value: 8, color: 'bg-gray-500' },
              ].map((item) => (
                <div key={item.label} className="flex flex-col items-center">
                  <div 
                    className={`w-16 ${item.color} rounded-t`} 
                    style={{ height: `${(item.value / 32) * 150}px`, minHeight: item.value > 0 ? '10px' : '0' }}
                  ></div>
                  <div className="text-xs text-secondary mt-2">{item.label}</div>
                  <div className="text-sm font-semibold text-primary">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity & Top Performers */}
        <div className="grid grid-cols-2 gap-6 mt-8">
          <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
            <h3 className="text-lg font-semibold text-primary mb-6">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-4 pb-4 border-b border-[#E6E6E6]">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-check text-white text-xs"></i>
                </div>
                <div className="flex-1">
                  <div className="text-sm text-primary font-medium">Unit marked available</div>
                  <div className="text-xs text-secondary mt-1">99B-5-08 is now available for viewing</div>
                  <div className="text-xs text-secondary mt-1">3 days ago</div>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 pb-4 border-b border-[#E6E6E6]">
                <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-handshake text-white text-xs"></i>
                </div>
                <div className="flex-1">
                  <div className="text-sm text-primary font-medium">HoTs reached</div>
                  <div className="text-xs text-secondary mt-1">TAA-2-05 progressed to Heads of Terms stage</div>
                  <div className="text-xs text-secondary mt-1">5 days ago</div>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 pb-4 border-b border-[#E6E6E6]">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-calendar text-white text-xs"></i>
                </div>
                <div className="flex-1">
                  <div className="text-sm text-primary font-medium">Viewing scheduled</div>
                  <div className="text-xs text-secondary mt-1">TLB-12-01 viewing booked for 15 Nov at 14:00</div>
                  <div className="text-xs text-secondary mt-1">1 week ago</div>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-pencil text-white text-xs"></i>
                </div>
                <div className="flex-1">
                  <div className="text-sm text-primary font-medium">Pricing updated</div>
                  <div className="text-xs text-secondary mt-1">Guide price adjusted for OCS-15-02</div>
                  <div className="text-xs text-secondary mt-1">2 weeks ago</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
            <h3 className="text-lg font-semibold text-primary mb-6">Top Performing Units</h3>
            <div className="space-y-4">
              {[
                { rank: 1, code: '99B-5-08', property: '99 Bishopsgate', size: '1,500 sq ft', days: 3 },
                { rank: 2, code: 'TLB-8-03', property: 'The Leadenhall Building', size: '4,100 sq ft', days: 7 },
                { rank: 3, code: 'OCS-15-02', property: 'One Canada Square', size: '1,850 sq ft', days: 14 },
                { rank: 4, code: 'TLB-12-01', property: 'The Leadenhall Building', size: '3,600 sq ft', days: 18 },
              ].map((item, idx) => (
                <div key={item.code} className={`flex items-center justify-between ${idx < 3 ? 'pb-4 border-b border-[#E6E6E6]' : ''}`}>
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 ${item.rank === 1 ? 'bg-primary' : 'bg-secondary'} text-white rounded-full flex items-center justify-center font-semibold`}>
                      {item.rank}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-primary">{item.code}</div>
                      <div className="text-xs text-secondary">{item.property} • {item.size}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-primary">{item.days} days</div>
                    <div className="text-xs text-secondary">Time to viewing</div>
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

