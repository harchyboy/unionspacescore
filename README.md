# UNION Spaces Core

A modern React + TypeScript application for property and unit management in UNION Spaces, built with Vite, Tailwind CSS, and comprehensive developer tooling.

## Prerequisites

- **Node.js**: v20.11.1 (specified in `.nvmrc`)
- **Package Manager**: pnpm (recommended)

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

3. **Start the development server:**

   ```bash
   pnpm dev
   ```

   The app will be available at `http://localhost:5173` with Hot Module Replacement (HMR) enabled.

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
- `pnpm test` - Run tests with Vitest
- `pnpm test:ui` - Run tests with Vitest UI
- `pnpm open` - Open the app in your default browser

## Testing

Tests are written with Vitest and React Testing Library:

```bash
# Run tests once
pnpm test

# Run tests with UI
pnpm test:ui
```

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

Mocks are automatically enabled when `VITE_ENV=local` in your `.env` file.

### Mock Endpoints

- `GET /api/health` - Health check endpoint
- `GET /api/properties` - Returns a list of properties with sample data

### Disabling Mocks

Set `VITE_ENV` to any value other than `local` in your `.env` file, or remove the environment variable.

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
- **Testing**: Vitest 4.0.8, React Testing Library
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
├── public/                  # Static assets
├── src/
│   ├── mocks/              # MSW mock handlers
│   │   ├── browser.ts      # Browser MSW setup
│   │   └── handlers.ts     # API mock handlers
│   ├── test/               # Test setup
│   │   └── setup.ts        # Vitest setup
│   ├── App.tsx             # Main app component
│   ├── App.test.tsx        # App tests
│   ├── index.css           # Global styles with Tailwind
│   └── main.tsx            # App entry point
├── .env.example            # Environment variables template
├── .gitignore              # Git ignore rules
├── .nvmrc                  # Node.js version
├── .prettierrc             # Prettier configuration
├── .prettierignore         # Prettier ignore rules
├── eslint.config.js        # ESLint configuration
├── index.html              # HTML template
├── package.json            # Dependencies and scripts
├── postcss.config.js       # PostCSS configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite configuration
```

## Development

### Hot Module Replacement (HMR)

The development server supports HMR. Changes to your code will automatically update in the browser without a full page reload.

### Environment Variables

- `VITE_API_URL` - API base URL (default: `http://localhost:3000`)
- `VITE_ENV` - Environment mode (set to `local` to enable mocks)

## License

[Add your license here]
