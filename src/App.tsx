import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { MockStoreProvider } from './store/useMockStore';
import { PropertiesList } from './pages/properties/List';
import { PropertyDetails } from './pages/properties/Details';
import { PropertyNew } from './pages/properties/New';
import { Tom } from './pages/deals/Tom';
import { PipelineOverview } from './pages/deals/PipelineOverview';
import { Qualification } from './pages/deals/Qualification';
import { MatchingShortlist } from './pages/deals/MatchingShortlist';
import { Viewings } from './pages/deals/Viewings';
import { ProposalBuilder } from './pages/deals/ProposalBuilder';
import { ProposalConfiguration } from './pages/deals/ProposalConfiguration';
import { DealOverview } from './pages/deals/DealOverview';
import { DecisionScreen } from './pages/deals/DecisionScreen';
import { DealRoomSetup } from './pages/deals/DealRoomSetup';
import { HeadsOfTerms } from './pages/deals/HeadsOfTerms';
import { LegalsTracking } from './pages/deals/LegalsTracking';
import { ProvisionalOrders } from './pages/deals/ProvisionalOrders';
import { HandoffToOperations } from './pages/deals/HandoffToOperations';
import { DealRoomSetupPage } from './pages/deals/DealRoomSetupPage';
import { DealRoomHomePage } from './pages/deals/DealRoomHomePage';
import { DealRoomGuard } from './pages/deals/DealRoomGuard';
import { ContactsList } from './pages/contacts/List';
import { ContactDetailsPage } from './pages/contacts/ContactDetailsPage';
import { ContactNew } from './pages/contacts/New';
import { ContactEdit } from './pages/contacts/Edit';
import { CompaniesList } from './pages/companies/List';
import { UnitsList } from './pages/units/List';
import { UnitDetails } from './pages/units/Details';
import { isFeatureEnabled, FEATURES, isContactsOnlyMode } from './config/features';

// Placeholder pages for modules not yet implemented
function PlaceholderPage({ title, description }: { title: string; description?: string }) {
  return (
    <div className="px-8 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-primary mb-2">{title}</h1>
        {description && <p className="text-secondary">{description}</p>}
      </div>
      <div className="bg-white p-8 rounded-lg border border-[#E6E6E6] text-center">
        <i className="fa-solid fa-hammer text-4xl text-secondary mb-4"></i>
        <p className="text-secondary">This module is coming soon.</p>
      </div>
    </div>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const contactsOnly = isContactsOnlyMode();
  const defaultRoute = contactsOnly ? '/contacts' : '/';

  return (
    <QueryClientProvider client={queryClient}>
      <MockStoreProvider>
        <BrowserRouter>
          <AppShell>
            <Routes>
              {/* Dashboard */}
              {isFeatureEnabled(FEATURES.OVERVIEW) && (
                <Route path="/" element={<Tom />} />
              )}
              {contactsOnly && <Route path="/" element={<Navigate to="/contacts" replace />} />}

              {/* Deal Flow */}
              {isFeatureEnabled(FEATURES.DEALS) && (
                <>
                  <Route path="/deals" element={<PipelineOverview />} />
                  <Route path="/deals/:id" element={<DealOverview />} />
                  <Route path="/deals/:id/proposal/configure" element={<ProposalConfiguration />} />
                  <Route path="/deals/:id/proposal/builder" element={<ProposalBuilder />} />
                  <Route path="/deals/:id/proposal" element={<ProposalBuilder />} />
                  <Route path="/deals/qualification" element={<Qualification />} />
                  <Route path="/deals/matching" element={<MatchingShortlist />} />
                  <Route path="/deals/viewings" element={<Viewings />} />
                  <Route path="/deals/proposal-builder" element={<ProposalBuilder />} />
                  <Route path="/deals/decision" element={<DecisionScreen />} />
                  <Route path="/deals/deal-room-setup" element={<DealRoomSetup />} />
                  <Route path="/deals/heads-of-terms" element={<HeadsOfTerms />} />
                  <Route path="/deals/legals" element={<LegalsTracking />} />
                  <Route path="/deals/provisional-orders" element={<ProvisionalOrders />} />
                  <Route path="/deals/handoff" element={<HandoffToOperations />} />
                </>
              )}

              {/* Deal Room Routes */}
              {isFeatureEnabled(FEATURES.DEAL_ROOM) && (
                <>
                  <Route
                    path="/deals/:dealId/deal-room/setup"
                    element={
                      <DealRoomGuard>
                        <DealRoomSetupPage />
                      </DealRoomGuard>
                    }
                  />
                  <Route
                    path="/deals/:dealId/deal-room"
                    element={
                      <DealRoomGuard>
                        <DealRoomHomePage />
                      </DealRoomGuard>
                    }
                  />
                  <Route
                    path="/deal-room"
                    element={<PlaceholderPage title="Deal Room" description="Deal room management" />}
                  />
                </>
              )}

              {/* Properties */}
              {isFeatureEnabled(FEATURES.PROPERTIES) && (
                <>
                  <Route path="/properties" element={<PropertiesList />} />
                  <Route path="/properties/:id" element={<PropertyDetails />} />
                  <Route path="/properties/new" element={<PropertyNew />} />
                </>
              )}

              {/* Units */}
              {isFeatureEnabled(FEATURES.UNITS) && (
                <>
                  <Route path="/units" element={<UnitsList />} />
                  <Route path="/units/:id" element={<UnitDetails />} />
                </>
              )}

              {/* Operations */}
              {isFeatureEnabled(FEATURES.ONBOARDING) && (
                <>
                  <Route
                    path="/deals/:dealId/onboarding"
                    element={<PlaceholderPage title="Onboarding" description="Track new tenant onboarding" />}
                  />
                  <Route
                    path="/onboarding"
                    element={<PlaceholderPage title="Onboarding" description="Track new tenant onboarding" />}
                  />
                </>
              )}
              {isFeatureEnabled(FEATURES.SERVICES) && (
                <Route
                  path="/services"
                  element={<PlaceholderPage title="Services" description="Service management" />}
                />
              )}
              {isFeatureEnabled(FEATURES.TICKETS) && (
                <Route
                  path="/tickets"
                  element={<PlaceholderPage title="Tickets" description="Support ticket management" />}
                />
              )}
              {isFeatureEnabled(FEATURES.SUPPLIERS) && (
                <Route
                  path="/suppliers"
                  element={<PlaceholderPage title="Suppliers" description="Vendor and supplier management" />}
                />
              )}

              {/* Intelligence */}
              {isFeatureEnabled(FEATURES.CONTACTS) && (
                <>
                  <Route path="/contacts" element={<ContactsList />} />
                  <Route path="/contacts/new" element={<ContactNew />} />
                  <Route path="/contacts/:id/edit" element={<ContactEdit />} />
                  <Route path="/contacts/:id" element={<ContactDetailsPage />} />
                </>
              )}
              {isFeatureEnabled(FEATURES.COMPANIES) && (
                <>
                  <Route path="/companies" element={<CompaniesList />} />
                </>
              )}
              {isFeatureEnabled(FEATURES.ANALYTICS) && (
                <Route
                  path="/analytics"
                  element={<PlaceholderPage title="Analytics" description="Business intelligence and analytics" />}
                />
              )}
              {isFeatureEnabled(FEATURES.SETTINGS) && (
                <Route
                  path="/settings"
                  element={<PlaceholderPage title="Settings" description="Application settings" />}
                />
              )}

              {/* Catch-all: redirect to default route if contacts-only, otherwise 404 */}
              <Route path="*" element={<Navigate to={defaultRoute} replace />} />
          </Routes>
        </AppShell>
      </BrowserRouter>
      </MockStoreProvider>
    </QueryClientProvider>
  );
}

export default App;
