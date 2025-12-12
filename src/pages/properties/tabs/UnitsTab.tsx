import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Property, Unit } from '../../../types/property';

interface UnitsTabProps {
  property: Property;
}

export function UnitsTab({ property }: UnitsTabProps) {
  const [statusFilter, setStatusFilter] = useState<string>('');

  const filteredUnits = property.units.filter((unit) => {
    if (!statusFilter) return true;
    return unit.status === statusFilter;
  });

  const getStatusVariant = (status: Unit['status']) => {
    switch (status) {
      case 'Available':
        return 'bg-[#252525] text-white';
      case 'Under Offer':
        return 'bg-[#F0F0F0] text-[#252525] border border-[#8E8E8E]';
      case 'Let':
        return 'bg-[#F0F0F0] text-[#252525]';
      case 'Closed':
        return 'bg-[#F0F0F0] text-[#252525]';
      default:
        return 'bg-[#F0F0F0] text-[#252525]';
    }
  };

  const getPipelineStyle = (pipeline?: Unit['pipelineStage']) => {
    if (!pipeline) return 'bg-[#F0F0F0] text-[#252525]';
    switch (pipeline) {
      case 'Viewing':
        return 'bg-[#F0F0F0] text-[#252525] underline';
      case 'HoTs':
        return 'bg-[#F0F0F0] text-[#252525] border border-[#252525] underline';
      case 'Legals':
        return 'bg-[#252525] text-white';
      case 'Closed':
        return 'bg-[#252525] text-white';
      default:
        return 'bg-[#F0F0F0] text-[#252525]';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-primary">Units</h2>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-[#FAFAFA] border border-[#E6E6E6] rounded-lg px-4 py-2 pr-8 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Filter units"
            >
              <option value="">All Units</option>
              <option value="Available">Available</option>
              <option value="Under Offer">Under Offer</option>
              <option value="Let">Let</option>
            </select>
            <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-secondary text-xs pointer-events-none"></i>
          </div>
          <Link
            to={`/properties/${property.id}?tab=units`}
            className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-all flex items-center space-x-2"
          >
            <i className="fa-solid fa-plus"></i>
            <span>Add Unit</span>
          </Link>
        </div>
      </div>

      {filteredUnits.length === 0 ? (
        <div className="text-center py-12 text-secondary">No units found</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#FAFAFA] border-b border-[#E6E6E6]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-secondary uppercase tracking-wider">Unit</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-secondary uppercase tracking-wider">Floor</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-secondary uppercase tracking-wider">Size</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-secondary uppercase tracking-wider">Desks</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-secondary uppercase tracking-wider">Fit-out</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-secondary uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-secondary uppercase tracking-wider">Price</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-secondary uppercase tracking-wider">Lease</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-secondary uppercase tracking-wider">Pipeline</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-secondary uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E6E6]">
              {filteredUnits.map((unit) => (
                <tr 
                  key={unit.id} 
                  className="hover:bg-[#FAFAFA] transition-all cursor-pointer"
                  onClick={() => window.location.href = `/units/${unit.id}`}
                >
                  <td className="px-4 py-4">
                    <div className="text-sm font-semibold text-primary">{unit.code}</div>
                    <div className="text-xs text-secondary">Suite</div>
                  </td>
                  <td className="px-4 py-4 text-sm text-primary">{unit.floor}</td>
                  <td className="px-4 py-4 text-sm text-primary">{unit.sizeSqFt.toLocaleString()} sq ft</td>
                  <td className="px-4 py-4 text-sm text-primary">{unit.desks}</td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center px-3 py-1 rounded text-[11px] font-bold uppercase tracking-wider bg-[#FAFAFA] text-primary">
                      {unit.fitOut}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded text-[11px] font-bold uppercase tracking-wider ${getStatusVariant(unit.status)}`}>
                      {unit.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-primary">
                    {unit.pricePsf && unit.pricePcm && (
                      <>£{unit.pricePsf} psf · £{unit.pricePcm.toLocaleString()} pcm</>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-primary">{unit.lease || '36 months'}</td>
                  <td className="px-4 py-4">
                    {unit.pipelineStage ? (
                      <a 
                        href="#deal-room" 
                        className={`inline-flex items-center px-3 py-1 rounded text-[11px] font-bold uppercase tracking-wider ${getPipelineStyle(unit.pipelineStage)}`}
                      >
                        {unit.pipelineStage}
                      </a>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded text-[11px] font-bold uppercase tracking-wider bg-[#FAFAFA] text-primary">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button 
                      className="text-secondary hover:text-primary" 
                      aria-label="Unit actions"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <i className="fa-solid fa-ellipsis-vertical"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
