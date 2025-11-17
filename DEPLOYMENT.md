# Deployment Guide

## Feature Flags

This application supports feature flags to control which modules are available. This allows you to deploy different versions of the application with different feature sets.

### Environment Variable

Set the `VITE_ENABLED_FEATURES` environment variable to control which features are enabled:

- **`all`** (default): All features enabled
- **`contacts`**: Only contacts functionality
- **Comma-separated list**: Enable specific features (e.g., `contacts,analytics`)

### Available Features

- `overview` - Dashboard/Overview
- `deals` - Deal Flow management
- `properties` - Property management
- `units` - Unit management
- `deal-room` - Deal Room functionality
- `onboarding` - Onboarding tracking
- `services` - Services management
- `tickets` - Support tickets
- `suppliers` - Supplier management
- `contacts` - Contacts management
- `analytics` - Analytics and reporting
- `settings` - Application settings

## Deploying Contacts-Only Version

### Option 1: Separate Vercel Project (Recommended)

1. **Create a new Vercel project**:
   - Go to your Vercel dashboard
   - Click "Add New Project"
   - Import the same GitHub repository
   - Name it something like "union-spaces-contacts"

2. **Configure Environment Variables**:
   - In the Vercel project settings, go to "Environment Variables"
   - Add a new variable:
     - **Name**: `VITE_ENABLED_FEATURES`
     - **Value**: `contacts`
     - **Environment**: Production, Preview, Development (as needed)

3. **Deploy**:
   - Vercel will automatically deploy when you push to your main branch
   - Or manually trigger a deployment from the dashboard

### Option 2: Branch-Based Deployment

1. **Create a contacts-only branch**:
   ```bash
   git checkout -b contacts-only
   ```

2. **Create a `.env.production` file** (or set in Vercel):
   ```
   VITE_ENABLED_FEATURES=contacts
   ```

3. **Deploy the branch**:
   - In Vercel, configure the branch to deploy
   - Set the environment variable for that branch deployment

### Option 3: Multiple Vercel Projects from Same Repo

You can have multiple Vercel projects pointing to the same repository but with different environment variables:

- **Main Project**: `VITE_ENABLED_FEATURES=all` (or not set)
- **Contacts-Only Project**: `VITE_ENABLED_FEATURES=contacts`

Both will deploy from the same codebase but show different features.

## Testing Locally

To test the contacts-only mode locally:

1. Create a `.env.local` file in the project root:
   ```
   VITE_ENABLED_FEATURES=contacts
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. The application will only show contacts functionality.

## Behavior in Contacts-Only Mode

When `VITE_ENABLED_FEATURES=contacts` is set:

- ✅ Only contacts routes are accessible (`/contacts`, `/contacts/:id`, etc.)
- ✅ Only "Contacts" appears in the sidebar navigation
- ✅ Root path (`/`) redirects to `/contacts`
- ✅ All other routes redirect to `/contacts`
- ✅ Other navigation items are hidden from the sidebar
- ✅ Other features are completely disabled

## Custom Domain

You can assign a custom domain to the contacts-only deployment:

1. In Vercel project settings, go to "Domains"
2. Add your custom domain (e.g., `contacts.yourdomain.com`)
3. Follow Vercel's DNS configuration instructions

This allows you to have:
- `app.yourdomain.com` - Full application
- `contacts.yourdomain.com` - Contacts-only application
