import type { Property } from '../../types/property';
import { Chip } from '../ui/Chip';
import { InlineStat } from '../ui/InlineStat';
import { DataBar } from '../ui/DataBar';

interface PropertyHeaderProps {
  property: Property;
}

export function PropertyHeader({ property }: PropertyHeaderProps) {
  const stats = property.stats;

  return (
    <div className="bg-white border-b border-[#E6E6E6]">
      <div className="px-8 py-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-semibold text-[#252525]">{property.name}</h1>
              <Chip variant={property.marketing.status === 'On Market' ? 'primary' : 'default'}>
                {property.marketing.status}
              </Chip>
              <Chip variant="default">{property.marketing.visibility}</Chip>
            </div>
            <p className="text-sm text-[#8e8e8e]">
              {property.addressLine}, {property.postcode}, {property.city}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6 mt-6">
          <InlineStat label="Total Units" value={stats?.totalUnits || 0} />
          <InlineStat label="Available" value={stats?.available || 0} />
          <InlineStat label="Under Offer" value={stats?.underOffer || 0} />
          <InlineStat label="Let" value={stats?.let || 0} />
        </div>

        {stats && (
          <div className="mt-6">
            <DataBar value={stats.occupancyPct} label="Occupancy Rate" />
          </div>
        )}
      </div>
    </div>
  );
}

