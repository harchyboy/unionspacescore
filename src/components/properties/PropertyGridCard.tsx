import { Link } from 'react-router-dom';
import type { Property } from '../../types/property';

interface PropertyGridCardProps {
  property: Property;
}

export function PropertyGridCard({ property }: PropertyGridCardProps) {
  const occupancyPct = property.stats?.occupancyPct || 0;
  
  // Determine badge text and style
  // Default to marketing status if no explicit "Union Managed" flag
  // In a real scenario, this might come from a specific field like property.managementStatus
  const isUnionManaged = property.marketing?.brokerSet?.includes('Union') || false; // Placeholder logic
  const badgeText = isUnionManaged ? 'UNION MANAGED' : 'STANDARD'; // Simplified for now based on request
  
  // Use marketing status for now as that's what we have
  const badgeLabel = property.marketing.status === 'On Market' ? 'UNION MANAGED' : 'STANDARD'; // Just mapping for visual demo
  const isDarkBadge = badgeLabel === 'UNION MANAGED';

  return (
    <Link
      to={`/properties/${property.id}`}
      className="block bg-white border border-[#E6E6E6] rounded-lg overflow-hidden hover:shadow-lg transition-all group h-full flex flex-col"
    >
      {/* Hero Image */}
      <div className="h-48 bg-[#FAFAFA] relative overflow-hidden">
        {property.images?.[0] ? (
          <img 
            src={property.images[0]} 
            alt={property.name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <i className="fa-solid fa-building text-4xl text-[#E6E6E6]"></i>
          </div>
        )}
        
        {/* Overlay Content */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
          <h3 className="text-xl font-bold text-white mb-1">{property.name}</h3>
          <p className="text-xs text-white/90 truncate">{property.addressLine}, {property.postcode}</p>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        {/* Badge */}
        <div className="mb-6">
          <span className={`inline-block px-3 py-1 rounded text-[10px] font-bold tracking-wider border ${
            isDarkBadge 
              ? 'bg-[#252525] text-white border-[#252525]' 
              : 'bg-white text-[#252525] border-[#252525]'
          }`}>
            {badgeLabel}
          </span>
        </div>

        {/* Stats Footer */}
        <div className="mt-auto pt-4 border-t border-[#E6E6E6] flex items-center justify-between text-sm text-[#8e8e8e]">
          <div className="flex items-center space-x-2">
            <i className="fa-solid fa-layer-group"></i>
            <span>{property.floorCount || 0} floors</span>
          </div>
          <div className="flex items-center space-x-2">
            <i className="fa-solid fa-user"></i>
            <span>{occupancyPct.toFixed(0)}% occ.</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

