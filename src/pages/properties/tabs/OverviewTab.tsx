import type { Property } from '../../../types/property';
import { KeyValue } from '../../../components/ui/KeyValue';
import { ContactCard } from '../../../components/ui/ContactCard';
import { InlineStat } from '../../../components/ui/InlineStat';
import { DataBar } from '../../../components/ui/DataBar';
import { Chip } from '../../../components/ui/Chip';

interface OverviewTabProps {
  property: Property;
}

export function OverviewTab({ property }: OverviewTabProps) {
  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2 space-y-6">
        <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
          <h2 className="text-xl font-semibold text-[#252525] mb-4">Specifications</h2>
          <div className="grid grid-cols-2 gap-4">
            {property.totalSizeSqFt && (
              <KeyValue label="Total Size" value={`${property.totalSizeSqFt.toLocaleString()} sq ft`} />
            )}
            {property.floorCount && <KeyValue label="Floors" value={property.floorCount.toString()} />}
            {property.lifts && <KeyValue label="Lifts" value={property.lifts} />}
            {property.builtYear && (
              <KeyValue
                label="Built"
                value={
                  property.refurbishedYear
                    ? `${property.builtYear}, refurbished ${property.refurbishedYear}`
                    : property.builtYear.toString()
                }
              />
            )}
            {property.parking && <KeyValue label="Parking" value={property.parking} />}
            {property.submarket && <KeyValue label="Submarket" value={property.submarket} />}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
          <h2 className="text-xl font-semibold text-[#252525] mb-4">Amenities</h2>
          <div className="space-y-3">
            {property.amenities.length > 0 ? (
              property.amenities.map((amenity, idx) => (
                <div key={idx} className="flex items-start">
                  <div className="w-2 h-2 bg-[#252525] rounded-full mt-1.5 mr-3" aria-hidden="true" />
                  <div className="font-medium text-[#252525]">{amenity}</div>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#8e8e8e]">No amenities listed</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
          <h2 className="text-xl font-semibold text-[#252525] mb-4">Location & Transport</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-xs font-semibold text-[#8e8e8e] uppercase tracking-wider mb-3">
                Address
              </div>
              <div className="text-sm text-[#252525]">
                {property.addressLine}
                <br />
                {property.postcode}, {property.city}
                <br />
                {property.country}
              </div>
              {property.geo && (
                <div className="mt-3 text-xs text-[#8e8e8e]">
                  Lat {property.geo.lat}, Long {property.geo.lng}
                </div>
              )}
            </div>
            <div>
              <div className="text-xs font-semibold text-[#8e8e8e] uppercase tracking-wider mb-3">
                Area Features
              </div>
              <div className="text-sm text-[#252525]">City Core location</div>
            </div>
          </div>
        </div>

        {property.compliance && (
          <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
            <h2 className="text-xl font-semibold text-[#252525] mb-4">Certification & Compliance</h2>
            <div className="grid grid-cols-3 gap-4">
              {property.compliance.epc && (
                <div className="flex items-center justify-between p-4 bg-[#fafafa] rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="text-xl">📄</div>
                    <div>
                      <div className="text-xs text-[#8e8e8e]">EPC Rating</div>
                      <div className="text-sm font-semibold text-[#252525]">
                        {property.compliance.epc.rating}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-[#8e8e8e] text-right">
                    {property.compliance.epc.ref && <div>Ref {property.compliance.epc.ref}</div>}
                    {property.compliance.epc.issued && (
                      <div>Issued {property.compliance.epc.issued}</div>
                    )}
                    {property.compliance.epc.expires && (
                      <div>Expires {property.compliance.epc.expires}</div>
                    )}
                  </div>
                </div>
              )}
              {property.compliance.hsCertified !== undefined && (
                <div className="flex items-center justify-between p-4 bg-[#fafafa] rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="text-xl">🛡️</div>
                    <div>
                      <div className="text-xs text-[#8e8e8e]">H and S Certified</div>
                      <div className="text-sm font-semibold text-[#252525]">
                        {property.compliance.hsCertified ? 'Yes' : 'No'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {property.compliance.breeam && (
                <div className="flex items-center justify-between p-4 bg-[#fafafa] rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="text-xl">🌿</div>
                    <div>
                      <div className="text-xs text-[#8e8e8e]">BREEAM</div>
                      <div className="text-sm font-semibold text-[#252525]">
                        {property.compliance.breeam}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {property.contacts && (
          <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
            <h3 className="text-lg font-semibold text-[#252525] mb-4">Key Contacts</h3>
            <div className="space-y-4">
              {property.contacts.agent && (
                <div>
                  <div className="text-xs font-semibold text-[#8e8e8e] uppercase tracking-wider mb-2">
                    Disposal Agent
                  </div>
                  <ContactCard
                    name={property.contacts.agent.name}
                    firm={property.contacts.agent.firm}
                    email={property.contacts.agent.email}
                    phone={property.contacts.agent.phone}
                    onEmail={() => {
                      if (property.contacts?.agent?.email) {
                        window.location.href = `mailto:${property.contacts.agent.email}`;
                      }
                    }}
                    onCall={() => {
                      if (property.contacts?.agent?.phone) {
                        window.location.href = `tel:${property.contacts.agent.phone}`;
                      }
                    }}
                  />
                </div>
              )}
              {property.contacts.landlord && (
                <div className="pt-4 border-t border-[#E6E6E6]">
                  <div className="text-xs font-semibold text-[#8e8e8e] uppercase tracking-wider mb-2">
                    Landlord
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-[#fafafa] rounded-lg">
                    <div className="w-10 h-10 bg-[#252525] rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm">🏢</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-[#252525] truncate">
                        {property.contacts.landlord.name}
                      </div>
                      <div className="text-xs text-[#8e8e8e]">Property Owner</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
          <h3 className="text-lg font-semibold text-[#252525] mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <InlineStat label="Total Units" value={property.stats?.totalUnits || 0} />
            <InlineStat label="Available" value={property.stats?.available || 0} />
            <InlineStat label="Under Offer" value={property.stats?.underOffer || 0} />
            <InlineStat label="Let" value={property.stats?.let || 0} />
            {property.stats && (
              <div className="pt-4 border-t border-[#E6E6E6]">
                <DataBar value={property.stats.occupancyPct} label="Occupancy Rate" />
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
          <h3 className="text-lg font-semibold text-[#252525] mb-4">Marketing Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-[#fafafa] rounded-lg">
              <div className="text-sm text-[#252525]">Visibility</div>
              <Chip variant={property.marketing.visibility === 'Public' ? 'primary' : 'default'}>
                {property.marketing.visibility}
              </Chip>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#fafafa] rounded-lg">
              <div className="text-sm text-[#252525]">Status</div>
              <Chip
                variant={
                  property.marketing.status === 'On Market'
                    ? 'primary'
                    : property.marketing.status === 'Broker-Ready'
                      ? 'accent'
                      : 'default'
                }
              >
                {property.marketing.status}
              </Chip>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#fafafa] rounded-lg">
              <div className="text-sm text-[#252525]">Fit-out</div>
              <Chip variant="default">{property.marketing.fitOut}</Chip>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

