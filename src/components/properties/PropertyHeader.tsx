import { Link, useNavigate } from 'react-router-dom';
import type { Property } from '../../types/property';

interface PropertyHeaderProps {
  property: Property;
  onBackClick?: () => void;
}

export function PropertyHeader({ property, onBackClick }: PropertyHeaderProps) {
  const stats = property.stats;
  const dataHealth = property.dataHealth || 92;
  const navigate = useNavigate();

  const handleBackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onBackClick) {
      onBackClick();
    }
    // Navigate after animation completes
    setTimeout(() => {
      navigate('/properties');
    }, 300);
  };

  return (
    <div className="bg-white border-b border-[#E6E6E6]">
      {/* Top Header with Navigation */}
      <header className="border-b border-[#E6E6E6] px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-6 flex-1">
          <button 
            onClick={handleBackClick}
            className="text-secondary hover:text-primary text-sm flex items-center space-x-2"
          >
            <i className="fa-solid fa-arrow-left"></i>
            <span>Back to Properties</span>
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <button className="relative p-2 text-secondary hover:text-primary transition-all" aria-label="Notifications">
            <i className="fa-solid fa-bell text-lg"></i>
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
          </button>
          <button className="p-2 text-secondary hover:text-primary transition-all" aria-label="Help">
            <i className="fa-solid fa-question-circle text-lg"></i>
          </button>
        </div>
      </header>

      {/* Property Header Section */}
      <section className="px-8 py-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start space-x-6 flex-1">
            {/* Property Image */}
            <div className="w-32 h-32 bg-[#FAFAFA] rounded-lg overflow-hidden flex-shrink-0">
              {property.images?.[0] ? (
                <img 
                  className="w-full h-full object-cover" 
                  src={property.images[0]} 
                  alt={`${property.name} hero`} 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <i className="fa-solid fa-building text-4xl text-secondary"></i>
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-semibold text-primary">{property.name}</h1>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  property.marketing.status === 'On Market' ? 'bg-primary text-white' :
                  property.marketing.status === 'Broker-Ready' ? 'bg-primary text-white' :
                  'bg-[#FAFAFA] text-primary border border-[#E6E6E6]'
                }`}>
                  {property.marketing.status}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#FAFAFA] text-primary border border-[#E6E6E6]">
                  {property.marketing.fitOut}
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  property.marketing.visibility === 'Public' ? 'bg-primary text-white' : 'bg-secondary text-white'
                }`}>
                  {property.marketing.visibility}
                </span>
              </div>
              
              <p className="text-secondary mb-4">
                {property.addressLine}, {property.postcode}
              </p>
              
              <div className="flex flex-wrap items-center gap-6 text-sm mb-5">
                <div className="flex items-center space-x-2">
                  <i className="fa-solid fa-building text-secondary"></i>
                  <span className="text-primary">
                    <strong>{stats?.totalUnits || property.units?.length || 0}</strong> Units
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <i className="fa-solid fa-chart-line text-secondary"></i>
                  <span className="text-primary">
                    <strong>{stats?.occupancyPct || 0}%</strong> Occupancy
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <i className="fa-solid fa-calendar text-secondary"></i>
                  <span className="text-primary">
                    Updated <time dateTime={property.updatedAt}>2 hours ago</time>
                  </span>
                </div>
              </div>
              
              {/* Data Health and Broker Set Cards */}
              <div className="flex flex-nowrap gap-6">
                <div className="flex flex-col justify-between w-[260px] bg-[#FAFAFA] rounded-xl shadow-sm p-5">
                  <div>
                    <div className="text-xs text-secondary mb-1">Data Health</div>
                    <div className="text-base font-semibold text-primary">{dataHealth}%</div>
                  </div>
                  <button className="text-xs text-primary underline hover:no-underline self-start mt-4">
                    View drivers
                  </button>
                </div>
                <div className="flex flex-col justify-between w-[260px] bg-[#FAFAFA] rounded-xl shadow-sm p-5">
                  <div>
                    <div className="text-xs text-secondary mb-1">Broker Set</div>
                    <div className="text-base font-semibold text-primary">
                      {property.marketing.brokerSet || `${property.marketing.visibility} · 10 brokers`}
                    </div>
                  </div>
                  <button className="px-3 py-1.5 border border-[#E6E6E6] rounded text-xs hover:bg-white transition-colors mt-4 self-start">
                    Manage
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-3 ml-6">
            <button className="px-4 py-2.5 border border-[#E6E6E6] rounded-lg text-sm text-primary hover:bg-[#FAFAFA] transition-all flex items-center space-x-2">
              <i className="fa-solid fa-upload"></i>
              <span>Upload Doc</span>
            </button>
            <button className="px-4 py-2.5 border border-[#E6E6E6] rounded-lg text-sm text-primary hover:bg-[#FAFAFA] transition-all flex items-center space-x-2">
              <i className="fa-solid fa-share-nodes"></i>
              <span>Publish to Brokers</span>
            </button>
            <Link 
              to={`/properties/${property.id}?tab=units`}
              className="bg-primary text-white px-6 py-2.5 rounded-lg font-medium hover:bg-opacity-90 transition-all flex items-center space-x-2"
            >
              <i className="fa-solid fa-plus"></i>
              <span>Add Unit</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
