import React, { useState } from 'react';

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (contact: any) => Promise<void>;
}

const contactTypes = [
  { id: 'broker', label: 'Brokers', subLabel: 'Tenant representative' },
  { id: 'disposal', label: 'Disposal Agents', subLabel: 'Landlord representative' },
  { id: 'tenant_rep', label: 'Traditional Tenant Reps', subLabel: 'Occupier contact' },
  { id: 'landlord', label: 'Landlords', subLabel: 'Landlord representative' },
  { id: 'client', label: 'Clients / Occupiers', subLabel: 'Active customer contact' },
  { id: 'supplier', label: 'Suppliers', subLabel: 'Service provider' },
];

const AddContactModal: React.FC<AddContactModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [activeType, setActiveType] = useState('broker');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<any>({
    firstName: '',
    lastName: '',
    role: '',
    companyName: '',
    cityRegion: '',
    email: '',
    phone: '',
    
    // Type specific fields
    brokerageTerritory: '',
    specialisms: '',
    preferredSubmarkets: [],
    referralSource: '',
    commissionStructure: '',
    
    landlordRoster: '',
    instructionTypes: [],
    
    serviceCategory: '',
    coverageAreas: '',
    rateCard: '',
    leadTime: '',
    
    portfolioSize: '',
    assetClasses: [],
    geographicFocus: '',
    propertyCount: '',
    
    companySize: '',
    industrySector: '',
    minSize: '',
    maxSize: '',
    budgetMin: '',
    budgetMax: '',
    
    relationshipNotes: '',
    
    emailLogging: false,
    confidential: false,
    cadence: 'Weekly updates',
    contactStatus: 'Active'
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleMultiSelect = (name: string, value: string) => {
    setFormData(prev => {
        const current = prev[name] || [];
        if (current.includes(value)) {
            return { ...prev, [name]: current.filter((item: string) => item !== value) };
        } else {
            return { ...prev, [name]: [...current, value] };
        }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const fullContact = {
        ...formData,
        name: `${formData.firstName} ${formData.lastName}`,
        company: formData.companyName,
        contactType: activeType
    };

    try {
      await onAdd(fullContact);
      onClose();
      // Reset form is complex, maybe just reload page or let parent handle
    } catch (err: any) {
      setError(err.message || 'Failed to add contact');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSectionHeader = (title: string, subtitle?: string) => (
    <div className="mb-4 border-b border-gray-200 pb-2 mt-6 first:mt-0">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto py-10">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-200 flex justify-between items-start bg-white rounded-t-lg">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Add Contact</h2>
            <p className="text-gray-500 mt-1">Expand your network. Fill in the details below to create a new contact record.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <i className="fa-solid fa-times text-xl"></i>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6 bg-gray-50">
          <form id="add-contact-form" onSubmit={handleSubmit} className="space-y-6">
            
            {error && (
              <div className="p-4 bg-red-50 text-red-700 rounded-md border border-red-200 flex items-start">
                <i className="fa-solid fa-circle-exclamation mt-0.5 mr-3"></i>
                <span>{error}</span>
              </div>
            )}

            {/* Contact Type */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                {renderSectionHeader('Contact Type', 'Define the relationship and role of this contact')}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {contactTypes.map(type => (
                        <button
                            key={type.id}
                            type="button"
                            onClick={() => setActiveType(type.id)}
                            className={`flex flex-col items-start p-3 rounded-lg border transition-all ${
                                activeType === type.id 
                                    ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            <span className={`font-medium text-sm ${activeType === type.id ? 'text-primary' : 'text-gray-900'}`}>
                                {type.label}
                            </span>
                            <span className="text-xs text-gray-500 mt-1">{type.subLabel}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Personal & Company Details */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-6">
                <div>
                    {renderSectionHeader('Personal Details', 'Basic contact information')}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                            <input type="text" name="firstName" required value={formData.firstName} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                            <input type="text" name="lastName" required value={formData.lastName} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Role / Title *</label>
                            <input type="text" name="role" required value={formData.role} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                        </div>
                    </div>
                </div>

                <div>
                    {renderSectionHeader('Company Details', 'Organisation and firm information')}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                            <input type="text" name="companyName" required value={formData.companyName} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none" placeholder="If the firm doesn't exist, we'll create it automatically" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">City / Region</label>
                            <input type="text" name="cityRegion" value={formData.cityRegion} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                        </div>
                    </div>
                </div>

                <div>
                    {renderSectionHeader('Contact Information', 'How to reach this contact')}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                            <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none" placeholder="Primary email for all communications" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Conditional Sections */}
            {(activeType === 'broker' || activeType === 'tenant_rep') && (
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    {renderSectionHeader('Broker Details', 'Additional information for broker contacts')}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Brokerage Territory</label>
                            <input type="text" name="brokerageTerritory" value={formData.brokerageTerritory} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Specialisms</label>
                            <input type="text" name="specialisms" value={formData.specialisms} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Submarkets</label>
                        <div className="flex flex-wrap gap-2">
                            {['City Core', 'Shoreditch', 'Mayfair', 'Canary Wharf'].map(m => (
                                <button
                                    key={m}
                                    type="button"
                                    onClick={() => handleMultiSelect('preferredSubmarkets', m)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                                        formData.preferredSubmarkets.includes(m)
                                        ? 'bg-primary text-white border-primary'
                                        : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                                    }`}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Referral Source</label>
                            <input type="text" name="referralSource" value={formData.referralSource} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Commission Structure</label>
                            <input type="text" name="commissionStructure" value={formData.commissionStructure} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                        </div>
                    </div>
                </div>
            )}

            {activeType === 'disposal' && (
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    {renderSectionHeader('Disposal Agent Details', 'Additional information for disposal agent contacts')}
                    <div className="mb-4">
                         <label className="block text-sm font-medium text-gray-700 mb-1">Landlord Roster</label>
                         <input type="text" name="landlordRoster" value={formData.landlordRoster} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none" placeholder="Comma-separated list of landlords this agent represents" />
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-gray-700 mb-2">Instruction Types</label>
                         <div className="flex flex-wrap gap-2">
                            {['Part Fitted', 'Fitted', 'Shell & Core'].map(type => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => handleMultiSelect('instructionTypes', type)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                                        formData.instructionTypes.includes(type)
                                        ? 'bg-primary text-white border-primary'
                                        : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                                    }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            
            {activeType === 'supplier' && (
                 <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    {renderSectionHeader('Supplier Details', 'Service provider information')}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Service Category</label>
                            <select name="serviceCategory" value={formData.serviceCategory} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none">
                                <option value="">Select category</option>
                                <option value="Cleaning">Cleaning</option>
                                <option value="AV & Technology">AV & Technology</option>
                                <option value="IT Support">IT Support</option>
                                <option value="Repairs & Maintenance">Repairs & Maintenance</option>
                                <option value="Furniture">Furniture</option>
                                <option value="Utilities">Utilities</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Coverage Areas</label>
                            <input type="text" name="coverageAreas" value={formData.coverageAreas} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Rate Card (£/hour)</label>
                            <input type="number" name="rateCard" value={formData.rateCard} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Lead Time (days)</label>
                            <input type="number" name="leadTime" value={formData.leadTime} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                        </div>
                     </div>
                 </div>
            )}

            {activeType === 'landlord' && (
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    {renderSectionHeader('Landlord Details', 'Portfolio and asset information')}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio Size (sq ft)</label>
                            <input type="text" name="portfolioSize" value={formData.portfolioSize} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none" placeholder="Total square footage" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Property Count</label>
                             <input type="number" name="propertyCount" value={formData.propertyCount} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none" placeholder="Number of properties" />
                        </div>
                    </div>
                    <div className="mb-4">
                         <label className="block text-sm font-medium text-gray-700 mb-2">Asset Classes</label>
                         <div className="flex flex-wrap gap-2">
                            {['Office', 'Retail', 'Industrial', 'Mixed Use', 'Residential', 'Flexible Office'].map(cls => (
                                <button
                                    key={cls}
                                    type="button"
                                    onClick={() => handleMultiSelect('assetClasses', cls)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                                        formData.assetClasses.includes(cls)
                                        ? 'bg-primary text-white border-primary'
                                        : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                                    }`}
                                >
                                    {cls}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Geographic Focus</label>
                        <input type="text" name="geographicFocus" value={formData.geographicFocus} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none" placeholder="Primary markets where this landlord operates" />
                    </div>
                </div>
            )}

             {activeType === 'client' && (
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    {renderSectionHeader('Tenant / Client Details', 'Occupier and requirement information')}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">Company Size</label>
                             <select name="companySize" value={formData.companySize} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none">
                                <option value="">Select size</option>
                                <option value="Startup">Startup (1-10 employees)</option>
                                <option value="Small">Small (11-50 employees)</option>
                                <option value="Medium">Medium (51-200 employees)</option>
                                <option value="Large">Large (201-1000 employees)</option>
                                <option value="Enterprise">Enterprise (1000+ employees)</option>
                             </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Industry Sector</label>
                             <input type="text" name="industrySector" value={formData.industrySector} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                        </div>
                    </div>
                    
                    <h4 className="text-sm font-semibold text-gray-900 mt-4 mb-3">Current Space Requirements</h4>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                             <label className="block text-xs text-gray-500 mb-1">Min Size (sq ft)</label>
                             <input type="number" name="minSize" value={formData.minSize} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                        </div>
                        <div>
                             <label className="block text-xs text-gray-500 mb-1">Max Size (sq ft)</label>
                             <input type="number" name="maxSize" value={formData.maxSize} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="block text-xs text-gray-500 mb-1">Min Budget (£/sq ft)</label>
                             <input type="number" name="budgetMin" value={formData.budgetMin} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                        </div>
                        <div>
                             <label className="block text-xs text-gray-500 mb-1">Max Budget (£/sq ft)</label>
                             <input type="number" name="budgetMax" value={formData.budgetMax} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                        </div>
                    </div>
                </div>
            )}

            {/* Relationship & Notes */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                 {renderSectionHeader('Relationship & Notes', 'Context for future interactions')}
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Relationship Notes</label>
                    <textarea name="relationshipNotes" rows={3} value={formData.relationshipNotes} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none" placeholder="This helps shape tone and approach in future communications"></textarea>
                 </div>
            </div>

            {/* Communication Preferences */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                {renderSectionHeader('Communication Preferences', 'How this contact prefers to engage')}
                <div className="space-y-4">
                    <div className="flex items-start">
                        <div className="flex items-center h-5">
                            <input id="emailLogging" name="emailLogging" type="checkbox" checked={formData.emailLogging} onChange={handleCheckboxChange} className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded" />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="emailLogging" className="font-medium text-gray-700">Email logging consent</label>
                            <p className="text-gray-500">Automatically associate emails with this contact's record</p>
                        </div>
                    </div>
                    
                    <div className="flex items-start">
                        <div className="flex items-center h-5">
                            <input id="confidential" name="confidential" type="checkbox" checked={formData.confidential} onChange={handleCheckboxChange} className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded" />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="confidential" className="font-medium text-gray-700">Confidential requirement flag</label>
                            <p className="text-gray-500">This broker typically works with confidential tenant identities</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">Communication Cadence</label>
                             <select name="cadence" value={formData.cadence} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none">
                                <option value="Weekly updates">Weekly updates</option>
                                <option value="Fortnightly updates">Fortnightly updates</option>
                                <option value="Monthly updates">Monthly updates</option>
                                <option value="On-demand only">On-demand only</option>
                             </select>
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">Contact Status</label>
                             <select name="contactStatus" value={formData.contactStatus} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none">
                                <option value="Active">Active</option>
                                <option value="Do not contact">Do not contact</option>
                             </select>
                        </div>
                    </div>
                </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-gray-200 bg-white rounded-b-lg flex justify-end space-x-3">
            <button onClick={onClose} type="button" className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all">
                Cancel
            </button>
            <button
              form="add-contact-form"
              type="submit"
              className="px-5 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-opacity-90 transition-all shadow-sm flex items-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin mr-2"></i>
                  Saving...
                </>
              ) : (
                'Add Contact'
              )}
            </button>
        </div>
      </div>
    </div>
  );
};

export default AddContactModal;
