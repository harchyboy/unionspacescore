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

        {/* Data Health, Valve Sync, and Broker Set Cards */}
        <div className="grid grid-cols-3 gap-6 mt-6">
          {/* Data Health Card */}
          <div className="flex flex-col justify-between bg-[#F0F0F0] rounded-xl border border-[#E6E6E6] p-5 min-h-[120px]">
            <div>
              <div className="text-xs text-[#8e8e8e] mb-1">Data Health</div>
              <div className="text-base font-semibold text-[#252525]">92%</div>
            </div>
            <button className="text-xs text-[#252525] underline hover:no-underline self-start mt-4">
              View drivers
            </button>
          </div>

          {/* Valve Sync Card */}
          <div className="flex flex-col justify-between bg-[#F0F0F0] rounded-xl border border-[#E6E6E6] p-5 min-h-[120px]">
            <div>
              <div className="text-xs text-[#8e8e8e] mb-1">Valve Sync</div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#252525] text-white text-xs font-medium">
                  {property.marketing.valveSyncStatus === 'synced' ? 'Pushed' : property.marketing.valveSyncStatus === 'error' ? 'Failed' : property.marketing.valveSyncStatus === 'pending' ? 'Pending' : 'Not Synced'}
                </span>
              </div>
              {property.marketing.lastSyncedAt ? (
                <div className="text-xs text-[#8e8e8e] leading-snug">
                  Last sync{' '}
                  {(() => {
                    const syncDate = new Date(property.marketing.lastSyncedAt);
                    const now = new Date();
                    const diffMs = now.getTime() - syncDate.getTime();
                    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                    
                    if (diffDays === 0) {
                      return `today ${syncDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
                    } else if (diffDays === 1) {
                      return `yesterday ${syncDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
                    } else if (diffDays < 7) {
                      return `${diffDays} days ago`;
                    } else {
                      return syncDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
                    }
                  })()}
                </div>
              ) : (
                <div className="text-xs text-[#8e8e8e] leading-snug">Never synced</div>
              )}
            </div>
            <button className="px-3 py-1.5 border border-[#E6E6E6] rounded text-xs hover:bg-white transition-colors mt-4 self-start">
              Sync now
            </button>
          </div>

          {/* Broker Set Card */}
          <div className="flex flex-col justify-between bg-[#F0F0F0] rounded-xl border border-[#E6E6E6] p-5 min-h-[120px]">
            <div>
              <div className="text-xs text-[#8e8e8e] mb-1">Broker Set</div>
              <div className="text-base font-semibold text-[#252525]">
                {property.marketing.brokerSet || property.marketing.visibility} · 10 brokers
              </div>
            </div>
            <button className="px-3 py-1.5 border border-[#E6E6E6] rounded text-xs hover:bg-white transition-colors mt-4 self-start">
              Manage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

