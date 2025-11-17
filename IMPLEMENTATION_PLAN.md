# UNION Spaces Core - Implementation Plan

## Executive Summary

This document outlines the plan to transform the UNION Spaces Core application from its current state to match the comprehensive UX designs provided in the `public` folder. The application is a React/TypeScript property management platform with deal flow, operations, and intelligence modules.

## Current State Analysis

### What Exists
- ✅ React/TypeScript setup with Vite
- ✅ React Router for navigation
- ✅ React Query for data fetching
- ✅ Tailwind CSS for styling
- ✅ MSW for API mocking
- ✅ Basic AppShell with minimal sidebar
- ✅ Properties module (List, Details, New) - partially complete
- ✅ Deal flow pages (all stages exist but not routed)
- ✅ Dashboard page (Tom.tsx - basic version)

### What's Missing
- ❌ Complete sidebar navigation matching `shared-sidebar.html`
- ❌ Suppliers module (list, detail, add/edit)
- ❌ Contacts module (list, detail, add/edit)
- ❌ Units module (list, detail, add)
- ❌ Deal flow routing and proper implementation
- ❌ Onboarding module
- ❌ Services module
- ❌ Tickets module
- ❌ Analytics module
- ❌ Settings module
- ❌ Consistent design system implementation
- ❌ Font Awesome icons integration
- ❌ Master-detail layouts for list pages
- ❌ Search functionality
- ❌ Filtering and sorting
- ❌ Data models/types for all entities
- ❌ API layer for all modules

## Design System Analysis

From the HTML designs, the application uses:

### Colors
- Primary: `#252525` (slate/primary)
- Secondary: `#8E8E8E` (concrete/secondary)
- Background: `#F0F0F0` (stone)
- Muted: `#FAFAFA`
- Border: `#E6E6E6`
- Destructive: `#ef4444`
- Font: Inter (400, 600)

### Components Pattern
- Master-detail layout for list pages (responsive)
- Slide-over drawers for forms
- Modal dialogs for confirmations
- Tab navigation for detail pages
- Search bars in header
- Filter sections with dropdowns
- Data tables with sorting
- Badge/chip components for status
- Card-based layouts

## Implementation Plan

### Phase 1: Foundation & Design System (Priority: High)

#### 1.1 Update AppShell Component
- [ ] Replace minimal sidebar with full sidebar from `shared-sidebar.html`
- [ ] Add all navigation items with proper routing
- [ ] Implement active state management
- [ ] Add badge counts to navigation items
- [ ] Add user profile section at bottom
- [ ] Ensure responsive behavior
- [ ] Add Font Awesome icons

#### 1.2 Design System Setup
- [ ] Update Tailwind config to match design tokens
- [ ] Create CSS variables file for design system
- [ ] Add Font Awesome to project (via CDN or package)
- [ ] Create shared component library:
  - [ ] Button variants
  - [ ] Input fields
  - [ ] Select dropdowns
  - [ ] Badge/Chip
  - [ ] Card
  - [ ] Table
  - [ ] SlideOver drawer
  - [ ] Modal/Dialog
  - [ ] Search input
  - [ ] Filter section
  - [ ] Empty state
  - [ ] Loading states

#### 1.3 Update Dashboard
- [ ] Enhance Tom.tsx to match `index.html` design
- [ ] Add pipeline overview chart
- [ ] Add priority actions section
- [ ] Add quick actions cards
- [ ] Add recent activity feed
- [ ] Add KPI cards with proper styling

### Phase 2: Core Modules - Deal Flow (Priority: High)

#### 2.1 Deal Flow Routing
- [ ] Add all deal flow routes to App.tsx:
  - `/deals` - Pipeline Overview
  - `/deals/qualification`
  - `/deals/matching`
  - `/deals/viewings`
  - `/deals/proposal-builder`
  - `/deals/decision`
  - `/deals/deal-room-setup`
  - `/deals/heads-of-terms`
  - `/deals/legals`
  - `/deals/provisional-orders`
  - `/deals/handoff`

#### 2.2 Deal Flow Pages Enhancement
- [ ] Review and enhance each deal flow page to match designs
- [ ] Add consistent layouts
- [ ] Add data tables where needed
- [ ] Add filtering and search
- [ ] Add action buttons
- [ ] Ensure proper navigation between stages

### Phase 3: Operations Modules (Priority: High)

#### 3.1 Suppliers Module
- [ ] Create types: `src/types/supplier.ts`
- [ ] Create API layer: `src/api/suppliers.ts`
- [ ] Create MSW handlers: `src/mocks/handlers/suppliers.ts`
- [ ] Create pages:
  - [ ] `src/pages/suppliers/List.tsx` - Master-detail layout
  - [ ] `src/pages/suppliers/Details.tsx` - Detail view
  - [ ] `src/pages/suppliers/New.tsx` - Add/Edit drawer
- [ ] Implement features:
  - [ ] List with table view
  - [ ] Search functionality
  - [ ] Filters (category, status, SLA)
  - [ ] Sorting
  - [ ] Master-detail responsive layout
  - [ ] Add/Edit drawer
  - [ ] Delete confirmation
  - [ ] SLA performance indicators
  - [ ] Contract status badges
  - [ ] Coverage areas display

#### 3.2 Contacts Module
- [ ] Create types: `src/types/contact.ts`
- [ ] Create API layer: `src/api/contacts.ts`
- [ ] Create MSW handlers: `src/mocks/handlers/contacts.ts`
- [ ] Create pages:
  - [ ] `src/pages/contacts/List.tsx` - Master-detail layout
  - [ ] `src/pages/contacts/Details.tsx` - Detail view
  - [ ] `src/pages/contacts/New.tsx` - Add/Edit drawer
- [ ] Implement features:
  - [ ] List with card/table view
  - [ ] Search functionality
  - [ ] Filters (type, company, role)
  - [ ] Contact details with communication history
  - [ ] Add/Edit form
  - [ ] Delete functionality

#### 3.3 Units Module
- [ ] Create types: `src/types/unit.ts` (may extend existing)
- [ ] Create API layer: `src/api/units.ts`
- [ ] Create MSW handlers: `src/mocks/handlers/units.ts`
- [ ] Create pages:
  - [ ] `src/pages/units/List.tsx` - List view
  - [ ] `src/pages/units/Details.tsx` - Detail view
  - [ ] `src/pages/units/New.tsx` - Add unit to property
- [ ] Implement features:
  - [ ] List with filters
  - [ ] Unit details
  - [ ] Add unit form
  - [ ] Status management
  - [ ] Link to parent property

#### 3.4 Onboarding Module
- [ ] Create types: `src/types/onboarding.ts`
- [ ] Create API layer: `src/api/onboarding.ts`
- [ ] Create MSW handlers: `src/mocks/handlers/onboarding.ts`
- [ ] Create pages:
  - [ ] `src/pages/onboarding/List.tsx` - Onboarding queue
  - [ ] `src/pages/onboarding/Details.tsx` - Onboarding detail
- [ ] Implement features:
  - [ ] Onboarding checklist
  - [ ] Task tracking
  - [ ] Status management
  - [ ] Timeline view

#### 3.5 Services Module
- [ ] Create types: `src/types/service.ts`
- [ ] Create API layer: `src/api/services.ts`
- [ ] Create MSW handlers: `src/mocks/handlers/services.ts`
- [ ] Create pages:
  - [ ] `src/pages/services/List.tsx` - Services list
  - [ ] `src/pages/services/Details.tsx` - Service detail
- [ ] Implement features:
  - [ ] Service catalog
  - [ ] Service requests
  - [ ] Status tracking

#### 3.6 Tickets Module
- [ ] Create types: `src/types/ticket.ts`
- [ ] Create API layer: `src/api/tickets.ts`
- [ ] Create MSW handlers: `src/mocks/handlers/tickets.ts`
- [ ] Create pages:
  - [ ] `src/pages/tickets/List.tsx` - Tickets list
  - [ ] `src/pages/tickets/Details.tsx` - Ticket detail
- [ ] Implement features:
  - [ ] Ticket list with filters
  - [ ] Priority indicators
  - [ ] SLA tracking
  - [ ] Status management
  - [ ] Assignment

### Phase 4: Intelligence Modules (Priority: Medium)

#### 4.1 Analytics Module
- [ ] Create types: `src/types/analytics.ts`
- [ ] Create API layer: `src/api/analytics.ts`
- [ ] Create MSW handlers: `src/mocks/handlers/analytics.ts`
- [ ] Create pages:
  - [ ] `src/pages/analytics/Dashboard.tsx` - Analytics dashboard
- [ ] Implement features:
  - [ ] KPI tiles
  - [ ] Charts (using recharts)
  - [ ] Trends analysis
  - [ ] Export functionality

#### 4.2 Settings Module
- [ ] Create pages:
  - [ ] `src/pages/settings/General.tsx` - General settings
  - [ ] `src/pages/settings/Users.tsx` - User management
  - [ ] `src/pages/settings/Integrations.tsx` - Integrations
- [ ] Implement features:
  - [ ] Settings forms
  - [ ] User management
  - [ ] Preferences

### Phase 5: Properties Module Enhancement (Priority: Medium)

#### 5.1 Properties List Enhancement
- [ ] Review `Property List Dashboard.html` design
- [ ] Enhance existing List.tsx to match design
- [ ] Add advanced filters
- [ ] Add view options (grid/list)
- [ ] Add bulk actions
- [ ] Add export functionality

#### 5.2 Properties Detail Enhancement
- [ ] Review `Properties Detailed Card.html` design
- [ ] Ensure all tabs match designs
- [ ] Add missing features
- [ ] Improve data visualization

### Phase 6: Shared Features (Priority: High)

#### 6.1 Search Functionality
- [ ] Create global search component
- [ ] Implement search across all modules
- [ ] Add search suggestions
- [ ] Add keyboard shortcuts

#### 6.2 Header Component
- [ ] Create shared header component
- [ ] Add search bar
- [ ] Add notifications
- [ ] Add help button
- [ ] Add context-aware actions

#### 6.3 Master-Detail Layout Component
- [ ] Create reusable master-detail layout
- [ ] Support responsive breakpoints
- [ ] Handle mobile navigation
- [ ] Support keyboard navigation

#### 6.4 Filter System
- [ ] Create reusable filter components
- [ ] Support URL state persistence
- [ ] Add filter presets
- [ ] Add clear all functionality

### Phase 7: Data & API Layer (Priority: High)

#### 7.1 Type Definitions
- [ ] Create comprehensive type definitions for all entities
- [ ] Ensure type safety across the app
- [ ] Add validation schemas (Zod)

#### 7.2 API Layer
- [ ] Create API functions for all modules
- [ ] Use React Query hooks
- [ ] Implement error handling
- [ ] Add loading states
- [ ] Add optimistic updates

#### 7.3 Mock Data
- [ ] Create comprehensive MSW handlers
- [ ] Add realistic mock data
- [ ] Support filtering, sorting, pagination
- [ ] Add delay simulation

### Phase 8: Testing & Polish (Priority: Medium)

#### 8.1 Component Testing
- [ ] Add unit tests for new components
- [ ] Add integration tests
- [ ] Test responsive behavior

#### 8.2 E2E Testing
- [ ] Add Playwright tests for critical flows
- [ ] Test navigation
- [ ] Test forms
- [ ] Test filters

#### 8.3 Accessibility
- [ ] Ensure keyboard navigation
- [ ] Add ARIA labels
- [ ] Test screen readers
- [ ] Ensure color contrast

#### 8.4 Performance
- [ ] Optimize bundle size
- [ ] Add code splitting
- [ ] Optimize images
- [ ] Add loading states

## File Structure

```
src/
├── api/                    # API functions and React Query hooks
│   ├── suppliers.ts
│   ├── contacts.ts
│   ├── units.ts
│   ├── tickets.ts
│   ├── services.ts
│   ├── onboarding.ts
│   ├── analytics.ts
│   └── properties.ts       # (existing)
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx    # (update)
│   │   ├── Header.tsx      # (new)
│   │   └── Sidebar.tsx     # (new)
│   ├── suppliers/          # (new)
│   ├── contacts/           # (new)
│   ├── units/              # (new)
│   ├── tickets/            # (new)
│   └── ui/                 # (enhance)
│       ├── MasterDetailLayout.tsx  # (new)
│       ├── SearchBar.tsx   # (new)
│       ├── FilterSection.tsx # (new)
│       └── ...
├── pages/
│   ├── deals/              # (enhance routing)
│   ├── properties/        # (enhance)
│   ├── suppliers/         # (new)
│   ├── contacts/          # (new)
│   ├── units/             # (new)
│   ├── tickets/           # (new)
│   ├── services/          # (new)
│   ├── onboarding/        # (new)
│   ├── analytics/         # (new)
│   └── settings/          # (new)
├── types/
│   ├── supplier.ts        # (new)
│   ├── contact.ts         # (new)
│   ├── unit.ts            # (enhance)
│   ├── ticket.ts          # (new)
│   ├── service.ts         # (new)
│   └── ...
├── mocks/
│   └── handlers/
│       ├── suppliers.ts    # (new)
│       ├── contacts.ts    # (new)
│       ├── units.ts        # (new)
│       └── ...
└── App.tsx                 # (update routing)
```

## Implementation Order

### Week 1: Foundation
1. Update AppShell with full sidebar
2. Set up design system
3. Create shared UI components
4. Update dashboard

### Week 2: Deal Flow
1. Add all deal flow routes
2. Enhance deal flow pages
3. Ensure proper navigation

### Week 3: Operations - Suppliers & Contacts
1. Suppliers module (complete)
2. Contacts module (complete)

### Week 4: Operations - Units, Tickets, Services
1. Units module
2. Tickets module
3. Services module

### Week 5: Remaining Modules
1. Onboarding module
2. Analytics module
3. Settings module

### Week 6: Polish & Testing
1. Enhance Properties module
2. Add shared features (search, filters)
3. Testing
4. Performance optimization

## Key Design Patterns

### Master-Detail Layout
- Desktop: Show list and detail side-by-side
- Mobile: Show list or detail, toggle with back button
- URL state management for deep linking

### Form Handling
- Slide-over drawers for add/edit
- React Hook Form for validation
- Zod schemas for type-safe validation

### Data Fetching
- React Query for all data fetching
- Optimistic updates for better UX
- Proper loading and error states

### State Management
- URL state for filters, search, pagination
- React Query cache for server state
- Local state for UI-only concerns

## Success Criteria

- [ ] All pages from designs are implemented
- [ ] Navigation matches sidebar design
- [ ] All modules have CRUD operations
- [ ] Responsive design works on mobile
- [ ] Search works across all modules
- [ ] Filters persist in URL
- [ ] Master-detail layouts work correctly
- [ ] Forms validate properly
- [ ] Loading states are shown
- [ ] Error states are handled
- [ ] Design matches HTML mockups
- [ ] TypeScript types are comprehensive
- [ ] Tests cover critical paths

## Notes

- The HTML files in `public` are design references, not to be used directly
- All functionality should be implemented in React/TypeScript
- Use the design system consistently across all modules
- Ensure accessibility from the start
- Mobile-first responsive design
- Performance should be considered throughout

