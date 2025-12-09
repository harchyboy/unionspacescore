import type { Property } from '../../../types/property';

interface OverviewTabProps {
  property: Property;
}

export function OverviewTab({ property }: OverviewTabProps) {
  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2 space-y-6">
        {/* Property Specifications */}
        <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
          <h2 className="text-xl font-semibold text-primary mb-4">Property Specifications</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-xs font-semibold text-secondary uppercase tracking-wider mb-3">Building Details</div>
              <div className="space-y-3 text-sm">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary rounded-full mt-1.5 mr-3"></div>
                  <div className="flex-1">
                    <div className="text-secondary">Property ID</div>
                    <div className="font-medium text-primary">PROP-{property.id.slice(0, 8).toUpperCase()}</div>
                  </div>
                </div>
                {property.totalSizeSqFt && (
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-primary rounded-full mt-1.5 mr-3"></div>
                    <div className="flex-1">
                      <div className="text-secondary">Total Size</div>
                      <div className="font-medium text-primary">{property.totalSizeSqFt.toLocaleString()} sq ft</div>
                    </div>
                  </div>
                )}
                {property.floorCount && (
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-primary rounded-full mt-1.5 mr-3"></div>
                    <div className="flex-1">
                      <div className="text-secondary">Floors</div>
                      <div className="font-medium text-primary">{property.floorCount} floors</div>
                    </div>
                  </div>
                )}
                {property.lifts && (
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-primary rounded-full mt-1.5 mr-3"></div>
                    <div className="flex-1">
                      <div className="text-secondary">Lifts</div>
                      <div className="font-medium text-primary">{property.lifts}</div>
                    </div>
                  </div>
                )}
                {property.builtYear && (
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-primary rounded-full mt-1.5 mr-3"></div>
                    <div className="flex-1">
                      <div className="text-secondary">Built</div>
                      <div className="font-medium text-primary">
                        {property.builtYear}
                        {property.refurbishedYear && `, refurbished ${property.refurbishedYear}`}
                      </div>
                    </div>
                  </div>
                )}
                {property.parking && (
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-primary rounded-full mt-1.5 mr-3"></div>
                    <div className="flex-1">
                      <div className="text-secondary">Parking</div>
                      <div className="font-medium text-primary">{property.parking}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-secondary uppercase tracking-wider mb-3">Amenities</div>
              <div className="space-y-3 text-sm">
                {property.amenities.length > 0 ? (
                  property.amenities.map((amenity, idx) => (
                    <div key={idx} className="flex items-start">
                      <div className="w-2 h-2 bg-primary rounded-full mt-1.5 mr-3"></div>
                      <div className="font-medium text-primary">{amenity}</div>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-primary rounded-full mt-1.5 mr-3"></div>
                      <div className="font-medium text-primary">24/7 access and security</div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-primary rounded-full mt-1.5 mr-3"></div>
                      <div className="font-medium text-primary">Reception services</div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-primary rounded-full mt-1.5 mr-3"></div>
                      <div className="font-medium text-primary">Bike storage and showers</div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-primary rounded-full mt-1.5 mr-3"></div>
                      <div className="font-medium text-primary">Meeting rooms</div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-primary rounded-full mt-1.5 mr-3"></div>
                      <div className="font-medium text-primary">On site café</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6 text-sm">
            <div className="p-3 bg-[#FAFAFA] rounded-lg">
              <div className="text-xs text-secondary">Submarket</div>
              <div className="font-semibold text-primary">{property.submarket || 'City Core'}</div>
            </div>
            <div className="p-3 bg-[#FAFAFA] rounded-lg">
              <div className="text-xs text-secondary">Geo</div>
              <div className="font-semibold text-primary">
                {property.geo ? `Lat ${property.geo.lat}, Long ${property.geo.lng}` : 'N/A'}
              </div>
            </div>
            <div className="p-3 bg-[#FAFAFA] rounded-lg">
              <div className="text-xs text-secondary">Address parts</div>
              <div className="font-semibold text-primary">{property.postcode}, {property.city}</div>
            </div>
          </div>
        </div>

        {/* Location & Transport */}
        <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
          <h2 className="text-xl font-semibold text-primary mb-4">Location & Transport</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-xs font-semibold text-secondary uppercase tracking-wider mb-3">Nearest Stations</div>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary rounded-full mt-1.5 mr-3"></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-primary">Liverpool Street</div>
                    <div className="text-xs text-secondary">3 min walk</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary rounded-full mt-1.5 mr-3"></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-primary">Moorgate</div>
                    <div className="text-xs text-secondary">5 min walk</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary rounded-full mt-1.5 mr-3"></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-primary">Bank</div>
                    <div className="text-xs text-secondary">8 min walk</div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-secondary uppercase tracking-wider mb-3">Area Features</div>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary rounded-full mt-1.5 mr-3"></div>
                  <div className="text-sm font-medium text-primary">{property.submarket || 'City Core'} location</div>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary rounded-full mt-1.5 mr-3"></div>
                  <div className="text-sm font-medium text-primary">Excellent transport links</div>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary rounded-full mt-1.5 mr-3"></div>
                  <div className="text-sm font-medium text-primary">Premium retail and dining</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Certification & Compliance */}
        <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
          <h2 className="text-xl font-semibold text-primary mb-4">Certification & Compliance</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 bg-[#FAFAFA] rounded-lg w-full">
              <div className="flex items-center space-x-3">
                <i className="fa-solid fa-certificate text-primary text-xl"></i>
                <div>
                  <div className="text-xs text-secondary">EPC Rating</div>
                  <div className="text-sm font-semibold text-primary">
                    {property.compliance?.epc?.rating || 'A'}
                  </div>
                </div>
              </div>
              <div className="text-xs text-secondary text-right">
                <div>Ref {property.compliance?.epc?.ref || 'EPC-1133'}</div>
                <div>Issued {property.compliance?.epc?.issued || '2024-06-12'}</div>
                <div>Expires {property.compliance?.epc?.expires || '2034-06-11'}</div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-[#FAFAFA] rounded-lg w-full">
              <div className="flex items-center space-x-3">
                <i className="fa-solid fa-shield-halved text-primary text-xl"></i>
                <div>
                  <div className="text-xs text-secondary">H and S Certified</div>
                  <div className="text-sm font-semibold text-primary">
                    {property.compliance?.hsCertified !== undefined ? (property.compliance.hsCertified ? 'Yes' : 'No') : 'Yes'}
                  </div>
                </div>
              </div>
              <div className="text-xs text-secondary text-right">
                <div>Last audit 2025-04-03</div>
                <div>Next review 2026-04-03</div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-[#FAFAFA] rounded-lg w-full">
              <div className="flex items-center space-x-3">
                <i className="fa-solid fa-leaf text-primary text-xl"></i>
                <div>
                  <div className="text-xs text-secondary">BREEAM</div>
                  <div className="text-sm font-semibold text-primary">
                    {property.compliance?.breeam || 'Excellent'}
                  </div>
                </div>
              </div>
              <div className="text-xs text-secondary text-right">
                <div>Assessed 2019-11-01</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="col-span-1 space-y-6">
        {/* Key Contacts */}
        <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">Key Contacts</h3>
          <div className="space-y-4">
            <div>
              <div className="text-xs font-semibold text-secondary uppercase tracking-wider mb-2">Disposal Agent</div>
              <div className="flex items-center space-x-3 p-3 bg-[#FAFAFA] rounded-lg">
                <img 
                  src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg" 
                  alt="Agent avatar" 
                  className="w-10 h-10 rounded-full object-cover" 
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-primary truncate">
                    {property.contacts?.agent?.name || 'James Mitchell'}
                  </div>
                  <div className="text-xs text-secondary">
                    {property.contacts?.agent?.firm || 'Knight Frank'}
                  </div>
                </div>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button className="w-full px-3 py-2 text-xs text-primary border border-[#E6E6E6] rounded-lg hover:bg-[#FAFAFA] transition-all flex items-center justify-center space-x-2">
                  <i className="fa-solid fa-envelope"></i>
                  <span>Email</span>
                </button>
                <button className="w-full px-3 py-2 text-xs text-primary border border-[#E6E6E6] rounded-lg hover:bg-[#FAFAFA] transition-all flex items-center justify-center space-x-2">
                  <i className="fa-solid fa-phone"></i>
                  <span>Call</span>
                </button>
              </div>
            </div>
            <div className="pt-4 border-t border-[#E6E6E6]">
              <div className="text-xs font-semibold text-secondary uppercase tracking-wider mb-2">Landlord</div>
              <div className="flex items-center space-x-3 p-3 bg-[#FAFAFA] rounded-lg">
                <div className="w-10 h-10 bg-primary rounded flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-building text-white"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-primary truncate">
                    {property.contacts?.landlord?.name || 'British Land'}
                  </div>
                  <div className="text-xs text-secondary">Property Owner</div>
                </div>
              </div>
              <div className="mt-2">
                <button className="w-full px-3 py-2 text-xs text-primary border border-[#E6E6E6] rounded-lg hover:bg-[#FAFAFA] transition-all flex items-center justify-center space-x-2">
                  <i className="fa-solid fa-user-tie"></i>
                  <span>View PM Contact</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-secondary">Total Units</div>
              <div className="text-lg font-semibold text-primary">{property.stats?.totalUnits || property.units?.length || 8}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-secondary">Available</div>
              <div className="text-lg font-semibold text-primary">{property.stats?.available || 3}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-secondary">Under Offer</div>
              <div className="text-lg font-semibold text-primary">{property.stats?.underOffer || 2}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-secondary">Let</div>
              <div className="text-lg font-semibold text-primary">{property.stats?.let || 3}</div>
            </div>
            <div className="pt-4 border-t border-[#E6E6E6]">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-secondary">Occupancy Rate</div>
                <div className="text-lg font-semibold text-primary">{property.stats?.occupancyPct || 62}%</div>
              </div>
              <div className="w-full bg-[#FAFAFA] rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full" 
                  style={{ width: `${property.stats?.occupancyPct || 62}%` }}
                ></div>
              </div>
            </div>
            <div className="pt-4 border-t border-[#E6E6E6]">
              <div className="text-sm font-medium text-primary mb-2">Health Drivers</div>
              <ul className="text-xs text-primary space-y-1">
                <li>• All units have floorplans</li>
                <li>• EPC valid until 2034</li>
                <li>• Media coverage complete</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Marketing Status */}
        <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">Marketing Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-[#FAFAFA] rounded-lg">
              <div className="text-sm text-primary">Visibility</div>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                property.marketing.visibility === 'Public' ? 'bg-primary text-white' : 'bg-secondary text-white'
              }`}>
                {property.marketing.visibility}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#FAFAFA] rounded-lg">
              <div className="text-sm text-primary">Status</div>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                property.marketing.status === 'On Market' || property.marketing.status === 'Broker-Ready' 
                  ? 'bg-primary text-white' 
                  : 'bg-[#FAFAFA] text-primary'
              }`}>
                {property.marketing.status}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#FAFAFA] rounded-lg">
              <div className="text-sm text-primary">Fit-out</div>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#FAFAFA] text-primary">
                {property.marketing.fitOut}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#FAFAFA] rounded-lg">
              <div className="text-sm text-primary">Public Listing</div>
              <button className="text-xs underline text-primary">Copy link</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
