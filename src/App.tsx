import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { PropertiesList } from './pages/properties/List';
import { PropertyDetails } from './pages/properties/Details';
import { PropertyNew } from './pages/properties/New';
import { Tom } from './pages/deals/Tom';
import { PipelineOverview } from './pages/deals/PipelineOverview';
import { Qualification } from './pages/deals/Qualification';
import { MatchingShortlist } from './pages/deals/MatchingShortlist';
import { Viewings } from './pages/deals/Viewings';
import { ProposalBuilder } from './pages/deals/ProposalBuilder';
import { DecisionScreen } from './pages/deals/DecisionScreen';
import { DealRoomSetup } from './pages/deals/DealRoomSetup';
import { HeadsOfTerms } from './pages/deals/HeadsOfTerms';
import { LegalsTracking } from './pages/deals/LegalsTracking';
import { ProvisionalOrders } from './pages/deals/ProvisionalOrders';
import { HandoffToOperations } from './pages/deals/HandoffToOperations';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppShell>
          <Routes>
            <Route path="/" element={<Navigate to="/deals" replace />} />
            <Route path="/properties" element={<PropertiesList />} />
            <Route path="/properties/:id" element={<PropertyDetails />} />
            <Route path="/properties/new" element={<PropertyNew />} />
            <Route path="/deals" element={<PipelineOverview />} />
            <Route path="/deals/pipeline" element={<PipelineOverview />} />
            <Route path="/deals/tom" element={<Tom />} />
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
          </Routes>
        </AppShell>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
