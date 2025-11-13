import { useNavigate } from 'react-router-dom';
import { useMatches, useAddToShortlist } from '../../../api/matching';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { EmptyState } from '../../../components/ui/EmptyState';
import type { DealId } from '../../../types/deal';

interface MatchingTabProps {
  dealId: DealId;
}

export function MatchingTab({ dealId }: MatchingTabProps) {
  const navigate = useNavigate();
  const { data, isLoading, error } = useMatches(dealId);
  const addToShortlistMutation = useAddToShortlist();

  const handleAddToShortlist = (propertyId: string, unitId?: string) => {
    addToShortlistMutation.mutate({ dealId, propertyId, unitId });
  };

  const handleViewProperty = (propertyId: string) => {
    navigate(`/properties/${propertyId}`);
  };

  const handleRemoveFromShortlist = (propertyId: string, unitId?: string) => {
    // TODO: Implement remove from shortlist
    console.log('Remove from shortlist', { propertyId, unitId });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Error loading matches: {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    );
  }

  if (!data || data.matches.length === 0) {
    return (
      <EmptyState
        title="No matches found"
        description="We couldn't find any properties matching this deal's requirements. Try adjusting the requirements or check back later."
      />
    );
  }

  const renderMatchCard = (match: typeof data.matches[0]) => {
    const property = match.property;
    const unit = match.unit;
    const isShortlisted = match.isShortlisted;
    
    // Get property image - use a placeholder or actual image URL
    const propertyImage = 'https://storage.googleapis.com/uxpilot-auth.appspot.com/a3db4da860-1ca4ccea942d69abaf2c.png';
    
    // Format address
    const address = `${property.addressLine || ''}${property.city ? ` • ${property.city}` : ''}${property.postcode ? ` • ${property.postcode}` : ''}`.trim();
    
    // Get size, desks, rate, available
    const size = unit?.sizeSqFt ? `${unit.sizeSqFt.toLocaleString()} sq ft` : 'N/A';
    const desks = unit?.desks ? `${unit.desks} desks` : 'N/A';
    const rate = unit?.pricePsf ? `£${unit.pricePsf} per sq ft` : 'N/A';
    const available = unit?.status === 'Available' ? 'Immediate' : unit?.status || 'Immediate';

    return (
      <div
        key={`${property.id}-${unit?.id || 'property'}`}
        className={`bg-white rounded-lg ${
          isShortlisted ? 'border-2 border-green-200' : 'border border-[#8E8E8E]/30'
        } p-6 hover:border-[#252525]/50 transition-colors`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start flex-1">
            <div className="w-24 h-24 bg-[#F0F0F0] rounded-lg overflow-hidden mr-4 flex-shrink-0">
              <img
                className="w-full h-full object-cover"
                src={propertyImage}
                alt={property.name}
                onError={(e) => {
                  // Fallback to placeholder if image fails to load
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/96';
                }}
              />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-[#252525] mb-1">{property.name}</h3>
                  <p className="text-sm text-[#8E8E8E]">{address}</p>
                </div>
                <span
                  className={`inline-flex items-center px-3 py-1 ${
                    isShortlisted
                      ? 'bg-green-100 text-green-800'
                      : 'bg-[#F0F0F0] text-[#252525]'
                  } text-sm font-semibold rounded-full`}
                >
                  {isShortlisted && <i className="fa-solid fa-star mr-2"></i>}
                  {isShortlisted ? 'Shortlisted' : 'Suggested'}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-4 mt-4">
                <div>
                  <div className="text-xs text-[#8E8E8E] uppercase tracking-wide mb-1">Size</div>
                  <div className="text-sm font-semibold text-[#252525]">{size}</div>
                </div>
                <div>
                  <div className="text-xs text-[#8E8E8E] uppercase tracking-wide mb-1">Desks</div>
                  <div className="text-sm font-semibold text-[#252525]">{desks}</div>
                </div>
                <div>
                  <div className="text-xs text-[#8E8E8E] uppercase tracking-wide mb-1">Rate</div>
                  <div className="text-sm font-semibold text-[#252525]">{rate}</div>
                </div>
                <div>
                  <div className="text-xs text-[#8E8E8E] uppercase tracking-wide mb-1">Available</div>
                  <div className="text-sm font-semibold text-[#252525]">{available}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="pt-4 border-t border-[#8E8E8E]/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6 text-xs">
              {match.reasons.slice(0, 4).map((reason, idx) => {
                // Determine if reason is positive based on score (higher score = positive)
                const isPositive = reason.score >= 70;
                return (
                  <div
                    key={idx}
                    className={`flex items-center ${
                      isPositive ? 'text-green-800' : 'text-amber-800'
                    }`}
                  >
                    <i
                      className={`fa-solid ${
                        isPositive ? 'fa-circle-check' : 'fa-triangle-exclamation'
                      } mr-2`}
                    ></i>
                    <span>{reason.description}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleViewProperty(property.id)}
                className="px-3 py-1.5 text-sm text-[#252525] hover:bg-[#F0F0F0] rounded-lg transition-colors border border-[#8E8E8E]/30"
              >
                View Details
              </button>
              {isShortlisted ? (
                <button
                  onClick={() => handleRemoveFromShortlist(property.id, unit?.id)}
                  className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                >
                  <i className="fa-solid fa-xmark mr-1"></i>
                  Remove
                </button>
              ) : (
                <button
                  onClick={() => handleAddToShortlist(property.id, unit?.id)}
                  disabled={addToShortlistMutation.isPending}
                  className="px-3 py-1.5 text-sm text-[#252525] hover:bg-green-50 rounded-lg transition-colors border border-[#8E8E8E]/30"
                >
                  <i className="fa-solid fa-plus mr-1"></i>
                  Shortlist
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {data.matches.map(renderMatchCard)}
    </div>
  );
}
