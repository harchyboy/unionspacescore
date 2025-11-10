import { Link } from 'react-router-dom';
import type { Property } from '../../types/property';
import { Chip } from '../ui/Chip';

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const occupancyPct = property.stats?.occupancyPct || 0;

  return (
    <Link
      to={`/properties/${property.id}`}
      className="block bg-white border border-[#E6E6E6] rounded-lg p-6 hover:shadow-lg transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-[#252525] mb-1">{property.name}</h3>
          <p className="text-sm text-[#8e8e8e]">
            {property.addressLine}, {property.postcode}
          </p>
        </div>
        <Chip variant={property.marketing.status === 'On Market' ? 'primary' : 'default'}>
          {property.marketing.status}
        </Chip>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-xs text-[#8e8e8e] mb-1">Units</div>
          <div className="text-sm font-semibold text-[#252525]">
            {property.stats?.totalUnits || property.units.length}
          </div>
        </div>
        <div>
          <div className="text-xs text-[#8e8e8e] mb-1">Occupancy</div>
          <div className="text-sm font-semibold text-[#252525]">{occupancyPct.toFixed(0)}%</div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-[#8e8e8e] pt-4 border-t border-[#E6E6E6]">
        <span>Updated {property.updatedAt ? new Date(property.updatedAt).toLocaleDateString() : 'N/A'}</span>
        <Chip variant="default">{property.marketing.visibility}</Chip>
      </div>
    </Link>
  );
}

