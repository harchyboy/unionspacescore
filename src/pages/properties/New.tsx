import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateProperty } from '../../api/properties';
import type { Property } from '../../types/property';

const basicsSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  addressLine: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  postcode: z.string().min(1, 'Postcode is required'),
  country: z.string().min(1, 'Country is required').default('United Kingdom'),
});

const marketingSchema = z.object({
  visibility: z.enum(['Private', 'Public']),
  status: z.enum(['Draft', 'Broker-Ready', 'On Market']),
  fitOut: z.enum(['Shell', 'Cat A', 'Cat A+']),
});

type BasicsFormData = z.infer<typeof basicsSchema>;
type MarketingFormData = z.infer<typeof marketingSchema>;

export function PropertyNew() {
  const navigate = useNavigate();
  const createProperty = useCreateProperty();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<Property>>({
    amenities: [],
    marketing: {
      visibility: 'Private',
      status: 'Draft',
      fitOut: 'Shell',
    },
    units: [],
  });

  const totalSteps = 8;

  const {
    register: registerBasics,
    handleSubmit: handleBasicsSubmit,
    formState: { errors: basicsErrors },
  } = useForm<BasicsFormData>({
    resolver: zodResolver(basicsSchema),
    defaultValues: {
      country: 'United Kingdom',
    },
  });

  const {
    register: registerMarketing,
    handleSubmit: handleMarketingSubmit,
    formState: { errors: marketingErrors },
  } = useForm<MarketingFormData>({
    resolver: zodResolver(marketingSchema),
    defaultValues: {
      visibility: 'Private',
      status: 'Draft',
      fitOut: 'Shell',
    },
  });

  const onBasicsSubmit = (data: BasicsFormData) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setCurrentStep((s) => s + 1);
  };

  const onMarketingSubmit = (data: MarketingFormData) => {
    setFormData((prev) => ({
      ...prev,
      marketing: {
        ...prev.marketing!,
        ...data,
      },
    }));
    setCurrentStep((s) => s + 1);
  };

  const handleFinalSubmit = async () => {
    try {
      const newProperty = await createProperty.mutateAsync(formData);
      navigate(`/properties/${newProperty.id}`);
    } catch (error) {
      console.error('Failed to create property:', error);
      alert('Failed to create property. Please try again.');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <form onSubmit={handleBasicsSubmit(onBasicsSubmit)} className="space-y-4">
            <h2 className="text-xl font-semibold text-[#252525] mb-4">Basics</h2>
            <div>
              <label htmlFor="property-name" className="block text-sm font-medium text-[#252525] mb-2">
                Property Name <span className="text-red-500">*</span>
              </label>
              <input
                id="property-name"
                {...registerBasics('name')}
                type="text"
                className="w-full px-4 py-2 border border-[#E6E6E6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#252525]"
                placeholder="e.g. 99 Bishopsgate"
              />
              {basicsErrors.name && (
                <p className="mt-1 text-sm text-red-600">{basicsErrors.name.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="property-address-line" className="block text-sm font-medium text-[#252525] mb-2">
                Address Line <span className="text-red-500">*</span>
              </label>
              <input
                id="property-address-line"
                {...registerBasics('addressLine')}
                type="text"
                className="w-full px-4 py-2 border border-[#E6E6E6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#252525]"
                placeholder="e.g. 99 Bishopsgate"
              />
              {basicsErrors.addressLine && (
                <p className="mt-1 text-sm text-red-600">{basicsErrors.addressLine.message}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="property-city" className="block text-sm font-medium text-[#252525] mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  id="property-city"
                  {...registerBasics('city')}
                  type="text"
                  className="w-full px-4 py-2 border border-[#E6E6E6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#252525]"
                  placeholder="e.g. London"
                />
                {basicsErrors.city && (
                  <p className="mt-1 text-sm text-red-600">{basicsErrors.city.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="property-postcode" className="block text-sm font-medium text-[#252525] mb-2">
                  Postcode <span className="text-red-500">*</span>
                </label>
                <input
                  id="property-postcode"
                  {...registerBasics('postcode')}
                  type="text"
                  className="w-full px-4 py-2 border border-[#E6E6E6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#252525]"
                  placeholder="e.g. EC2M 3XD"
                />
                {basicsErrors.postcode && (
                  <p className="mt-1 text-sm text-red-600">{basicsErrors.postcode.message}</p>
                )}
              </div>
            </div>
            <div>
              <label htmlFor="property-country" className="block text-sm font-medium text-[#252525] mb-2">
                Country <span className="text-red-500">*</span>
              </label>
              <input
                id="property-country"
                {...registerBasics('country')}
                type="text"
                className="w-full px-4 py-2 border border-[#E6E6E6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#252525]"
                placeholder="e.g. United Kingdom"
              />
              {basicsErrors.country && (
                <p className="mt-1 text-sm text-red-600">{basicsErrors.country.message}</p>
              )}
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 text-sm bg-[#252525] text-white rounded-lg hover:bg-opacity-90"
              >
                Next
              </button>
            </div>
          </form>
        );

      case 2:
        return (
          <div>
            <h2 className="text-xl font-semibold text-[#252525] mb-4">Location</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#252525] mb-2">Submarket</label>
                <input
                  type="text"
                  value={formData.submarket || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, submarket: e.target.value }))}
                  className="w-full px-4 py-2 border border-[#E6E6E6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#252525]"
                  placeholder="e.g. City of London"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#252525] mb-2">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.geo?.lat || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        geo: { ...prev.geo, lat: parseFloat(e.target.value) || 0, lng: prev.geo?.lng || 0 },
                      }))
                    }
                    className="w-full px-4 py-2 border border-[#E6E6E6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#252525]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#252525] mb-2">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.geo?.lng || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        geo: { ...prev.geo, lat: prev.geo?.lat || 0, lng: parseFloat(e.target.value) || 0 },
                      }))
                    }
                    className="w-full px-4 py-2 border border-[#E6E6E6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#252525]"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-between mt-6">
              <button
                onClick={() => setCurrentStep((s) => s - 1)}
                className="px-4 py-2 text-sm border border-[#E6E6E6] rounded-lg hover:bg-[#fafafa]"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentStep((s) => s + 1)}
                className="px-4 py-2 text-sm bg-[#252525] text-white rounded-lg hover:bg-opacity-90"
              >
                Next
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <h2 className="text-xl font-semibold text-[#252525] mb-4">Specifications</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#252525] mb-2">Total Size (sq ft)</label>
                  <input
                    type="number"
                    value={formData.totalSizeSqFt || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, totalSizeSqFt: parseInt(e.target.value) || undefined }))
                    }
                    className="w-full px-4 py-2 border border-[#E6E6E6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#252525]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#252525] mb-2">Floor Count</label>
                  <input
                    type="number"
                    value={formData.floorCount || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, floorCount: parseInt(e.target.value) || undefined }))
                    }
                    className="w-full px-4 py-2 border border-[#E6E6E6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#252525]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#252525] mb-2">Lifts</label>
                <input
                  type="text"
                  value={formData.lifts || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, lifts: e.target.value || undefined }))}
                  className="w-full px-4 py-2 border border-[#E6E6E6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#252525]"
                  placeholder="e.g. 2 passenger, 1 service"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#252525] mb-2">Built Year</label>
                  <input
                    type="number"
                    value={formData.builtYear || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, builtYear: parseInt(e.target.value) || undefined }))
                    }
                    className="w-full px-4 py-2 border border-[#E6E6E6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#252525]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#252525] mb-2">Refurbished Year</label>
                  <input
                    type="number"
                    value={formData.refurbishedYear || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        refurbishedYear: parseInt(e.target.value) || undefined,
                      }))
                    }
                    className="w-full px-4 py-2 border border-[#E6E6E6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#252525]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#252525] mb-2">Parking</label>
                <input
                  type="text"
                  value={formData.parking || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, parking: e.target.value || undefined }))}
                  className="w-full px-4 py-2 border border-[#E6E6E6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#252525]"
                  placeholder="e.g. 24 spaces"
                />
              </div>
            </div>
            <div className="flex justify-between mt-6">
              <button
                onClick={() => setCurrentStep((s) => s - 1)}
                className="px-4 py-2 text-sm border border-[#E6E6E6] rounded-lg hover:bg-[#fafafa]"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentStep((s) => s + 1)}
                className="px-4 py-2 text-sm bg-[#252525] text-white rounded-lg hover:bg-opacity-90"
              >
                Next
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div>
            <h2 className="text-xl font-semibold text-[#252525] mb-4">Amenities</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#252525] mb-2">
                  Add Amenities (one per line)
                </label>
                <textarea
                  value={(formData.amenities || []).join('\n')}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      amenities: e.target.value.split('\n').filter((a) => a.trim()),
                    }))
                  }
                  className="w-full px-4 py-2 border border-[#E6E6E6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#252525]"
                  rows={6}
                  placeholder="Reception&#10;Meeting rooms&#10;Kitchen facilities"
                />
              </div>
            </div>
            <div className="flex justify-between mt-6">
              <button
                onClick={() => setCurrentStep((s) => s - 1)}
                className="px-4 py-2 text-sm border border-[#E6E6E6] rounded-lg hover:bg-[#fafafa]"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentStep((s) => s + 1)}
                className="px-4 py-2 text-sm bg-[#252525] text-white rounded-lg hover:bg-opacity-90"
              >
                Next
              </button>
            </div>
          </div>
        );

      case 5:
        return (
          <form onSubmit={handleMarketingSubmit(onMarketingSubmit)} className="space-y-4">
            <h2 className="text-xl font-semibold text-[#252525] mb-4">Marketing</h2>
            <div>
              <label className="block text-sm font-medium text-[#252525] mb-2">
                Visibility <span className="text-red-500">*</span>
              </label>
              <select
                {...registerMarketing('visibility')}
                className="w-full px-4 py-2 border border-[#E6E6E6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#252525]"
              >
                <option value="Private">Private</option>
                <option value="Public">Public</option>
              </select>
              {marketingErrors.visibility && (
                <p className="mt-1 text-sm text-red-600">{marketingErrors.visibility.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#252525] mb-2">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                {...registerMarketing('status')}
                className="w-full px-4 py-2 border border-[#E6E6E6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#252525]"
              >
                <option value="Draft">Draft</option>
                <option value="Broker-Ready">Broker-Ready</option>
                <option value="On Market">On Market</option>
              </select>
              {marketingErrors.status && (
                <p className="mt-1 text-sm text-red-600">{marketingErrors.status.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#252525] mb-2">
                Fit-out <span className="text-red-500">*</span>
              </label>
              <select
                {...registerMarketing('fitOut')}
                className="w-full px-4 py-2 border border-[#E6E6E6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#252525]"
              >
                <option value="Shell">Shell</option>
                <option value="Cat A">Cat A</option>
                <option value="Cat A+">Cat A+</option>
              </select>
              {marketingErrors.fitOut && (
                <p className="mt-1 text-sm text-red-600">{marketingErrors.fitOut.message}</p>
              )}
            </div>
            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={() => setCurrentStep((s) => s - 1)}
                className="px-4 py-2 text-sm border border-[#E6E6E6] rounded-lg hover:bg-[#fafafa]"
              >
                Previous
              </button>
              <button type="submit" className="px-4 py-2 text-sm bg-[#252525] text-white rounded-lg hover:bg-opacity-90">
                Next
              </button>
            </div>
          </form>
        );

      case 6:
        return (
          <div>
            <h2 className="text-xl font-semibold text-[#252525] mb-4">Compliance</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#252525] mb-2">EPC Rating</label>
                <input
                  type="text"
                  value={formData.compliance?.epc?.rating || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      compliance: {
                        ...prev.compliance,
                        epc: { ...prev.compliance?.epc, rating: e.target.value },
                      },
                    }))
                  }
                  className="w-full px-4 py-2 border border-[#E6E6E6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#252525]"
                  placeholder="e.g. B"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#252525] mb-2">H and S Certified</label>
                <select
                  value={formData.compliance?.hsCertified === undefined ? '' : formData.compliance.hsCertified ? 'yes' : 'no'}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      compliance: {
                        ...prev.compliance,
                        hsCertified: e.target.value === 'yes',
                      },
                    }))
                  }
                  className="w-full px-4 py-2 border border-[#E6E6E6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#252525]"
                >
                  <option value="">Not set</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#252525] mb-2">BREEAM</label>
                <input
                  type="text"
                  value={formData.compliance?.breeam || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      compliance: {
                        ...prev.compliance,
                        breeam: e.target.value || undefined,
                      },
                    }))
                  }
                  className="w-full px-4 py-2 border border-[#E6E6E6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#252525]"
                  placeholder="e.g. Excellent"
                />
              </div>
            </div>
            <div className="flex justify-between mt-6">
              <button
                onClick={() => setCurrentStep((s) => s - 1)}
                className="px-4 py-2 text-sm border border-[#E6E6E6] rounded-lg hover:bg-[#fafafa]"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentStep((s) => s + 1)}
                className="px-4 py-2 text-sm bg-[#252525] text-white rounded-lg hover:bg-opacity-90"
              >
                Next
              </button>
            </div>
          </div>
        );

      case 7:
        return (
          <div>
            <h2 className="text-xl font-semibold text-[#252525] mb-4">Contacts</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#252525] mb-2">Agent Name</label>
                <input
                  type="text"
                  value={formData.contacts?.agent?.name || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      contacts: {
                        ...prev.contacts,
                        agent: { ...prev.contacts?.agent, name: e.target.value },
                      },
                    }))
                  }
                  className="w-full px-4 py-2 border border-[#E6E6E6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#252525]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#252525] mb-2">Agent Firm</label>
                <input
                  type="text"
                  value={formData.contacts?.agent?.firm || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      contacts: {
                        ...prev.contacts,
                        agent: { ...prev.contacts?.agent, firm: e.target.value },
                      },
                    }))
                  }
                  className="w-full px-4 py-2 border border-[#E6E6E6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#252525]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#252525] mb-2">Landlord Name</label>
                <input
                  type="text"
                  value={formData.contacts?.landlord?.name || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      contacts: {
                        ...prev.contacts,
                        landlord: { ...prev.contacts?.landlord, name: e.target.value },
                      },
                    }))
                  }
                  className="w-full px-4 py-2 border border-[#E6E6E6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#252525]"
                />
              </div>
            </div>
            <div className="flex justify-between mt-6">
              <button
                onClick={() => setCurrentStep((s) => s - 1)}
                className="px-4 py-2 text-sm border border-[#E6E6E6] rounded-lg hover:bg-[#fafafa]"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentStep((s) => s + 1)}
                className="px-4 py-2 text-sm bg-[#252525] text-white rounded-lg hover:bg-opacity-90"
              >
                Next
              </button>
            </div>
          </div>
        );

      case 8:
        return (
          <div>
            <h2 className="text-xl font-semibold text-[#252525] mb-4">Review</h2>
            <div className="bg-[#fafafa] rounded-lg p-6 space-y-4">
              <div>
                <div className="text-xs text-[#8e8e8e] mb-1">Name</div>
                <div className="text-sm font-medium text-[#252525]">{formData.name || 'Not set'}</div>
              </div>
              <div>
                <div className="text-xs text-[#8e8e8e] mb-1">Address</div>
                <div className="text-sm font-medium text-[#252525]">
                  {formData.addressLine || 'Not set'}, {formData.postcode || ''}, {formData.city || ''}
                </div>
              </div>
              <div>
                <div className="text-xs text-[#8e8e8e] mb-1">Marketing Status</div>
                <div className="text-sm font-medium text-[#252525]">
                  {formData.marketing?.status || 'Not set'} ({formData.marketing?.visibility || 'Not set'})
                </div>
              </div>
            </div>
            <div className="flex justify-between mt-6">
              <button
                onClick={() => setCurrentStep((s) => s - 1)}
                className="px-4 py-2 text-sm border border-[#E6E6E6] rounded-lg hover:bg-[#fafafa]"
              >
                Previous
              </button>
              <div className="space-x-2">
                <button
                  onClick={handleFinalSubmit}
                  disabled={createProperty.isPending}
                  className="px-4 py-2 text-sm bg-[#252525] text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50"
                >
                  {createProperty.isPending ? 'Creating...' : 'Create Property'}
                </button>
                <button
                  onClick={handleFinalSubmit}
                  disabled={createProperty.isPending}
                  className="px-4 py-2 text-sm border border-[#E6E6E6] rounded-lg hover:bg-[#fafafa] disabled:opacity-50"
                >
                  Save as Draft
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="px-8 py-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold text-[#252525] mb-6">Add Property</h1>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#8e8e8e]">
              Step {currentStep} of {totalSteps}
            </span>
          </div>
          <div className="w-full bg-[#fafafa] rounded-full h-2">
            <div
              className="bg-[#252525] h-2 rounded-full transition-all"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-[#E6E6E6] p-6 mb-6">{renderStep()}</div>
      </div>
    </div>
  );
}
