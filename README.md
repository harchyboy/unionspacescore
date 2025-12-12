# UNION Spaces Core

A modern React + TypeScript application for property and unit management in UNION Spaces, built with Vite, Tailwind CSS, and comprehensive developer tooling.

## Prerequisites

- **Node.js**: v20.11.1 (specified in `.nvmrc`)
- **Package Manager**: pnpm (recommended)

> **Note for Windows ARM64 users**: If you encounter esbuild platform errors, you may need to manually install `@esbuild/win32-arm64` or use `esbuild-wasm`. This is a known issue with optional dependencies on Windows ARM64. CI runs on Linux and is unaffected.

### Installing Node.js

If you use `nvm` (Node Version Manager):

```bash
nvm install
nvm use
```

Or install Node.js v20.11.1 directly from [nodejs.org](https://nodejs.org/).

### Installing pnpm

```bash
npm install -g pnpm
```

## Quick Start

1. **Install dependencies:**

   ```bash
   pnpm install
   ```

2. **Set up environment variables:**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` if needed (defaults work for local development).

3. **Start the development server with MSW mocks:**

   ```bash
   # Windows PowerShell
   $env:VITE_ENV="local"; pnpm dev

   # Windows CMD
   set VITE_ENV=local && pnpm dev

   # macOS/Linux
   VITE_ENV=local pnpm dev
   ```

   The app will be available at `http://localhost:5173` with Hot Module Replacement (HMR) enabled.

   **Note**: MSW mocks are only enabled when `VITE_ENV=local`. This allows you to develop locally without a backend API.

4. **Open in browser (optional):**

   ```bash
   pnpm open
   ```

## Available Scripts

- `pnpm dev` - Start development server with HMR
- `pnpm build` - Build for production (`tsc -b && vite build`)
- `pnpm preview` - Preview production build on port 5173
- `pnpm lint` - Run ESLint on `.ts` and `.tsx` files
- `pnpm format` - Format code with Prettier
- `pnpm test` - Run unit tests with Vitest
- `pnpm test:ui` - Run unit tests with Vitest UI
- `pnpm test:e2e` - Run Playwright e2e tests
- `pnpm test:e2e:ui` - Run Playwright e2e tests with UI
- `pnpm open` - Open the app in your default browser

## Testing

### Unit Tests

Unit tests are written with Vitest and React Testing Library:

```bash
# Run unit tests once
pnpm test

# Run unit tests with UI
pnpm test:ui
```

Tests cover:
- API functions (`src/api/properties.test.ts`)
- Form validation (`src/pages/properties/New.test.tsx`)
- Component behavior (`src/pages/properties/Details.test.tsx`)

### E2E Tests

End-to-end tests are written with Playwright:

```bash
# Run e2e tests (starts dev server automatically)
pnpm test:e2e

# Run e2e tests with UI
pnpm test:e2e:ui
```

E2E tests cover:
- Properties list filtering and search
- Property details navigation
- Tab switching and URL persistence
- Add Property wizard flow
- Form validation

## Code Quality

### Linting

ESLint is configured with React and TypeScript rules:

```bash
pnpm lint
```

### Formatting

Prettier is configured for consistent code formatting:

```bash
pnpm format
```

### Pre-commit Hooks

Husky runs `pnpm lint` and `pnpm test` before each commit to ensure code quality.

## API Mocking

The project uses [MSW (Mock Service Worker)](https://mswjs.io/) for API mocking in local development.

### Enabling Mocks

Mocks are automatically enabled when `VITE_ENV=local`. Set this as an environment variable when starting the dev server:

```bash
# Windows PowerShell
$env:VITE_ENV="local"; pnpm dev

# Windows CMD
set VITE_ENV=local && pnpm dev

# macOS/Linux
VITE_ENV=local pnpm dev
```

### Mock Endpoints

- `GET /api/health` - Health check endpoint
- `GET /api/properties` - List properties (supports search, filters, pagination, sorting)
- `GET /api/properties/:id` - Get property by ID
- `POST /api/properties` - Create new property
- `PATCH /api/properties/:id` - Update property
- `POST /api/properties/:id/documents` - Upload document

### Seed Data

The mock includes seed data for:
- **99 Bishopsgate** - A complete property with 3 units, compliance info, contacts, and stats
- **Sample Property 2** - Draft property
- **Sample Property 3** - Broker-ready property

### Disabling Mocks

Set `VITE_ENV` to any value other than `local`, or omit it to disable mocks and use a real API.

## CI/CD

GitHub Actions runs on every push and pull request to validate the codebase:

### CI Pipeline

The CI workflow (`.github/workflows/ci.yml`) includes:

1. **Setup**: Checkout code, setup Node.js 20.11.1, setup pnpm, cache dependencies
2. **Install**: Install dependencies with frozen lockfile
3. **Lint**: Run ESLint
4. **Test**: Run Vitest tests
5. **Build**: Build the application and upload `dist` as an artifact

### CI Status

[![CI](https://github.com/harchyboy/unionspacescore/actions/workflows/ci.yml/badge.svg)](https://github.com/harchyboy/unionspacescore/actions/workflows/ci.yml)

## Tech Stack

- **Framework**: React 19.2.0
- **Language**: TypeScript 5.9.3
- **Build Tool**: Vite 7.2.2
- **Styling**: Tailwind CSS 4.1.17
- **Routing**: React Router 7.9.5
- **State Management**: React Query (@tanstack/react-query) 5.90.7
- **Forms**: React Hook Form 7.66.0 + Zod 4.1.12
- **Charts**: Recharts 3.4.1
- **Testing**: 
  - Vitest 4.0.8 (unit tests)
  - React Testing Library 16.3.0
  - Playwright 1.56.1 (e2e tests)
- **API Mocking**: MSW 2.12.1
- **Linting**: ESLint 9.39.1
- **Formatting**: Prettier 3.6.2
- **Git Hooks**: Husky 9.1.7

## Zoho Integration

This application integrates with the Zoho One ecosystem (CRM, Creator).

For architectural decisions on when to use standard CRM APIs vs. Zoho Creator workflows, please refer to [ARCHITECTURE.md](./ARCHITECTURE.md).

## Project Structure

```
union-core/
├── .github/
│   └── workflows/
│       └── ci.yml          # GitHub Actions CI workflow
├── .husky/
│   └── pre-commit          # Pre-commit hook
├── e2e/                    # Playwright e2e tests
│   └── properties.spec.ts  # Property area e2e tests
├── public/                 # Static assets
├── src/
│   ├── api/               # API layer
│   │   ├── properties.ts  # Property API functions and React Query hooks
│   │   └── properties.test.ts  # API unit tests
│   ├── components/        # React components
│   │   ├── layout/        # Layout components
│   │   │   └── AppShell.tsx  # Main app shell with sidebar
│   │   ├── properties/    # Property-specific components
│   │   │   ├── PropertyCard.tsx
│   │   │   └── PropertyHeader.tsx
│   │   └── ui/            # Reusable UI components
│   │       ├── Chip.tsx
│   │       ├── KeyValue.tsx
│   │       ├── DataBar.tsx
│   │       ├── Table.tsx
│   │       ├── EmptyState.tsx
│   │       └── ...
│   ├── mocks/             # MSW mock handlers
│   │   ├── browser.ts     # Browser MSW setup
│   │   ├── handlers.ts    # Main handlers export
│   │   └── handlers/
│   │       └── properties.ts  # Property API mocks
│   ├── pages/             # Page components
│   │   └── properties/
│   │       ├── List.tsx   # Properties list page
│   │       ├── Details.tsx # Property details page
│   │       ├── New.tsx    # Add property wizard
│   │       ├── Details.test.tsx
│   │       ├── New.test.tsx
│   │       └── tabs/      # Detail page tabs
│   │           ├── OverviewTab.tsx
│   │           ├── UnitsTab.tsx
│   │           ├── AvailabilityTab.tsx
│   │           ├── CommercialsTab.tsx
│   │           ├── DocumentsMediaTab.tsx
│   │           ├── ActivityCommsTab.tsx
│   │           ├── AnalyticsTab.tsx
│   │           ├── ApprovalsTab.tsx
│   │           ├── RiskTab.tsx
│   │           └── DealRoomTab.tsx
│   ├── test/              # Test setup
│   │   └── setup.ts       # Vitest setup
│   ├── types/             # TypeScript types
│   │   └── property.ts   # Property and Unit types
│   ├── App.tsx            # Main app component with routing
│   ├── App.test.tsx       # App tests
│   ├── index.css          # Global styles with Tailwind
│   └── main.tsx           # App entry point
├── playwright.config.ts   # Playwright configuration
├── .env.example           # Environment variables template
├── .gitignore             # Git ignore rules
├── .nvmrc                 # Node.js version
├── .prettierrc            # Prettier configuration
├── .prettierignore        # Prettier ignore rules
├── eslint.config.js       # ESLint configuration
├── index.html             # HTML template
├── package.json           # Dependencies and scripts
├── postcss.config.js      # PostCSS configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── vite.config.ts         # Vite configuration
```

## Property Area Features

The Property area includes:

### Pages & Routes

- **`/properties`** - Properties list with search, filters, sorting, and pagination
- **`/properties/:id`** - Property details with 10 tabs:
  - Overview - Specifications, amenities, location, compliance, contacts, stats, marketing
  - Units - Units table with filters and status management
  - Availability & Viewings - Availability calendar and viewing bookings
  - Commercials - Pricing, service charges, business rates, fit-out budget
  - Documents & Media - Document upload and media gallery
  - Activity & Comms - Activity feed, email/call logging, notes
  - Analytics - KPI tiles, occupancy trends, viewing charts, pipeline visualization
  - Approvals - Approval requests and workflow
  - Risk - Risk register with ratings and mitigation
  - Deal Room - HoTs, redlines, contracts, tasks
- **`/properties/new`** - Multi-step property creation wizard (8 steps)

### Features

- **Search & Filter**: Search by name/address, filter by marketing status and visibility
- **Sorting**: Sort by name or updated date (ascending/descending)
- **Pagination**: Navigate through property lists
- **Tab Navigation**: URL-persisted tab state (`?tab=overview`)
- **Form Validation**: Zod schema validation with react-hook-form
- **File Upload**: Document upload with progress (PDF, DOCX, PNG, JPG)
- **Charts**: Recharts integration for analytics visualization
- **Accessibility**: ARIA roles, keyboard navigation, focus management

## Development

### Hot Module Replacement (HMR)

The development server supports HMR. Changes to your code will automatically update in the browser without a full page reload.

### Environment Variables

- `VITE_ENV` - Environment mode (set to `local` to enable MSW mocks)
- `VITE_API_URL` - API base URL (default: relative paths `/api`)

### Running the App

1. **Start dev server with mocks:**
   ```bash
   # Windows PowerShell
   $env:VITE_ENV="local"; pnpm dev
   ```

2. **Navigate to:**
   - Properties list: `http://localhost:5173/properties`
   - Property details: `http://localhost:5173/properties/99-bishopsgate`
   - Add property: `http://localhost:5173/properties/new`

### Building for Production

```bash
pnpm build
```

The production build will be in the `dist/` directory.

## Deployment

The app can be easily deployed to various platforms. See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

### Quick Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Vercel will auto-detect the Vite configuration
4. Click "Deploy" - your app will be live in minutes!

**Note**: MSW mocks are automatically disabled in production. For production use, you'll need a real backend API.

## License

[Add your license here]

## Design System & Specifications

This document provides complete specifications for implementing the UNION+ platform frontend. Every measurement, color, font size, spacing value, and interaction is defined for pixel-perfect implementation.

**For:** Frontend developers, design QA, product team

**Based on:** Approved wireframes + UNION Visual Identity Guidelines v1.

**Platform:** Web application (desktop-first, responsive)

### 1. DESIGN TOKENS

#### 1.1 Color System
UNION+ uses a refined monochromatic palette designed for calm, professional sophistication.

**Core Palette:**
- **Stone**: `#F0F0F0` (Light warm grey - 50% usage)
- **Slate**: `#252525` (Deep rich grey - 25% usage)
- **Concrete**: `#8E8E8E` (Mid supportive grey - 25% usage)
- **White**: `#FFFFFF` (Pure white)
- **Black**: `#000000` (Pure black - minimal use)

**CRITICAL RULES:**
- Never use bright colors (no greens, blues, yellows, reds, oranges)
- Maintain 50/25/25 ratio: Stone (50%), Slate (25%), Concrete (25%)
- All UI must use only these defined colors

#### 1.2 Typography System
All text must use the Haltung typeface with precise sizing and spacing.

**Font Weights:**
- **Haltung Book (400)** - Body text
- **Haltung SemiBold (600)** - Headlines

**Type Scale:**
- **Hero**: 64px (User greeting)
- **H1**: 48px (Page titles)
- **H2**: 30px (Section headers)
- **H3**: 20px (Card titles)
- **Body**: 16px (Body text)
- **Caption**: 14px (Small text)

#### 1.3 Spacing System
**Spacing Principles:**
- Base grid: 25px
- Page margins: 25px
- Card internal padding: 32px
- Gap between cards: 25px
- Gap between major sections: 48px

### 2. COMPONENT SPECIFICATIONS

#### 2.1 Logo Component
**Specifications:**
- Width: 120px (optimal header size)
- Height: Auto (maintain aspect ratio)
- Minimum width: 100px (digital minimum)
- Color: Slate #252525

**Placement:**
- Location: Top-left of header/sidebar
- Margin: 25px from edges
- Clear space: 25px on all sides

**CRITICAL:** Never distort, recolor, or recreate logo

#### 2.2 Button Components
**Primary Button:**
- Height: 48px
- Padding: 16px 32px
- Border radius: 4px
- Background: Slate #252525
- Text color: White #FFFFFF
- Font: Haltung SemiBold 16px
- Usage: Primary actions (Manage, Add Service, New Request, Make Payment)

**Secondary Button:**
- Height: 48px
- Padding: 16px 32px
- Border: 1px solid Slate #252525
- Background: White #FFFFFF
- Text color: Slate #252525
- Usage: Secondary actions (Add to Plan, Manage in list view)

#### 2.3 Card Component
**Structure:**
- Background: White #FFFFFF
- Border: 1px solid #E6E6E6 (optional)
- Border radius: 4px
- Padding: 32px
- Shadow: 0 1px 3px rgba(37, 37, 37, 0.08)
- Usage: Service cards, info cards, content containers

#### 2.4 Status Pills
**Specifications:**
- Padding: 6px 16px
- Border radius: 4px
- Font: Haltung SemiBold 12px uppercase

**Status Variants:**
- **Active**: Slate background, Stone text
- **Pending**: Stone background, Slate text, Concrete border
- **Confirmed**: White background, Slate text, Concrete border

**CRITICAL:** Status must always include text label, never color alone

#### 2.5 Sidebar Navigation
**Specifications:**
- Width: 240px
- Background: Stone #F0F0F0
- Height: Full viewport (100vh)
- Position: Fixed left

**Navigation Items:**
- Padding: 12px 16px
- Border radius: 4px
- Active state: White background, 3px left border (Slate)
- Hover state: Semi-transparent white background

#### 2.6 Maintenance Timeline Item
**Specifications:**
- Background: White #FFFFFF
- Border radius: 4px
- Padding: 20px 24px
- Left border: 4px solid (status color)

**Status Border Colors:**
- **Confirmed**: Slate #252525
- **Pending**: Concrete #8E8E8E
- **Cancelled**: Stone #F0F0F0 (with opacity)

**CRITICAL:** 4px left border indicates status through color

#### 2.7 Table Component
**Header:**
- Background: Stone #F0F0F0
- Font: Haltung SemiBold 14px uppercase
- Padding: 12px 16px
- Border bottom: 1px solid Concrete

**Rows:**
- Border bottom: 1px solid Stone
- Padding: 16px
- Hover: Light Stone background (rgba)
- Usage: Invoice History, Requests & Tickets

#### 2.8 Financial Callout Card
**Specifications:**
- Background: Slate #252525
- Border radius: 4px
- Padding: 32px
- Amount text: Haltung SemiBold 64px, Stone color
- Label text: Haltung Book 16px, Concrete color
- Usage: Dashboard billing widget, Billing & Invoices page

### 3. LAYOUT SYSTEM

#### 3.1 Grid Structure
- Container max-width: 1600px
- Container padding: 25px
- Grid gap: 25px

**Grid Options:**
- 2 columns: `repeat(2, 1fr)`
- 3 columns: `repeat(3, 1fr)`
- 4 columns: `repeat(4, 1fr)`

#### 3.2 Page Layout
**Structure:**
- Sidebar: 240px fixed width
- Main content: Flexible width with 25px padding
- Background: Stone #F0F0F0

#### 3.3 Dashboard Layout
**Sections:**
- Greeting: Hero text section with 48px bottom margin
- Services: 2-column grid with 25px gap
- Bottom section: 2-column grid (Maintenance + Requests)

### 4. RESPONSIVE BREAKPOINTS

**Breakpoints:**
- Mobile: 375px
- Tablet: 768px
- Desktop: 1024px
- Wide: 1440px

**Mobile Adjustments:**
- Sidebar: Hidden or converted to bottom nav
- Main content: No left margin, 16px padding
- All grids: Single column layout
- Hero text: 48px (reduced from 64px)

### 5. ICON SYSTEM
**Specifications:**
- Default size: 20px × 20px
- Stroke width: 1.5px
- Style: Line icons (outline style)
- Color: Inherits from text or explicitly set

**Size Variants:**
- Small: 16px × 16px
- Large: 32px × 32px
- Extra Large: 48px × 48px

**Recommended library:** Lucide Icons or Heroicons

### 6. INTERACTION STATES

#### 6.1 Hover States
**Principle:** Always increase visual weight, never decrease

**Examples:**
- Cards: Enhanced shadow on hover
- Primary buttons: Background darkens to Black
- Secondary buttons: Background becomes Stone
- Links: Underline appears

#### 6.2 Focus States
- Outline: 2px solid Slate #252525
- Outline offset: 2px
- On dark backgrounds: Use Stone #F0F0F0 for outline color

#### 6.3 Loading States
Use skeleton screens with shimmer animation:
- Background: Linear gradient (Stone → White → Stone)
- Animation: 1.5s infinite shimmer

### 7. ACCESSIBILITY REQUIREMENTS

#### 7.1 Color Contrast (WCAG AA)
**Compliant Combinations:**
- Slate on White: 14.6:1 (AAA) ✓
- Slate on Stone: 8.8:1 (AAA) ✓
- Concrete on White: 4.6:1 (AA) ✓

**FAILS:**
- Concrete on Stone: 3.2:1 ✗

**WARNING:** Never use Concrete text on Stone backgrounds

#### 7.2 Interactive Elements
- Minimum touch target: 44×44px
- All interactive elements must have focus indicators
- Keyboard navigation must be fully supported
- Tab order must be logical

#### 7.3 ARIA Labels
**Required for:**
- Icon-only buttons
- Status indicators
- Navigation landmarks

### 8. IMPLEMENTATION PRIORITIES
**Phase 1: Foundation (Week 1)**
- Set up design tokens (CSS variables)
- Import Haltung font files
- Create base layout structure
- Implement logo component

**Phase 2: Core Components (Week 2)**
- Button system (primary, secondary, link)
- Card component
- Status pills
- Form inputs

**Phase 3: Navigation (Week 3)**
- Sidebar navigation
- Page headers

**Phase 4: Complex Components (Week 4)**
- Service cards
- Maintenance timeline
- Tables
- Financial callout cards

**Phase 5: Pages (Week 5-6)**
- Dashboard
- Active Services
- Service Store
- Billing & Invoices

**Phase 6: Polish (Week 7)**
- Hover states
- Loading states
- Responsive breakpoints
- Accessibility audit

### 9. QUALITY ASSURANCE CHECKLIST
Before marking implementation complete, verify all items below:

**Design Tokens:**
- [ ] All colors match exact hex values
- [ ] Haltung font loading correctly
- [ ] Spacing uses defined variables

**Components:**
- [ ] UNION logo on every page, correct size
- [ ] All buttons use exact specifications
- [ ] Status pills monochromatic only
- [ ] Cards have 32px padding

**Typography:**
- [ ] All text uses Haltung
- [ ] Headlines use SemiBold weight
- [ ] Body text uses Book weight

**Colors:**
- [ ] Stone #F0F0F0 for backgrounds (50%)
- [ ] Slate #252525 for primary elements (25%)
- [ ] Concrete #8E8E8E for secondary (25%)
- [ ] NO bright colors anywhere

**Accessibility:**
- [ ] Color contrast passes WCAG AA
- [ ] Focus indicators on all interactive elements
- [ ] Keyboard navigation works

### 10. BROWSER SUPPORT
**Target Browsers:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Testing Required On:**
- macOS (Safari, Chrome)
- Windows (Edge, Chrome, Firefox)
- iOS Safari
- Android Chrome

### 11. PERFORMANCE TARGETS
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Lighthouse Performance Score: > 90
- Bundle size: < 500KB (gzipped)

### 12. ASSETS REQUIRED
**Fonts:**
- Haltung-Book.woff
- Haltung-SemiBold.woff

**Logos:**
- union-wordmark.svg
- union-wordmark@2x.png
- union-symbol.svg

**Icons:**
- Icon library (Lucide/Heroicons) or custom SVG set

### 13. HANDOFF NOTES
**Design → Development:**
- All measurements in this document are exact
- CSS variables provided can be used as-is
- Component structure matches approved designs
- Any deviations should be flagged for design review
- Questions or clarifications: Contact design team before implementing alternative solutions
