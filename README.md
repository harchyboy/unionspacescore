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
