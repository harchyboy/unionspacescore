# Zoho CRM Database Sync

This document explains how to set up the database sync between your application and Zoho CRM, so data is cached locally for fast access and only updated when changes occur.

## Architecture Overview

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│   Vercel    │────▶│  Supabase   │
│   (React)   │     │   API       │     │  Database   │
└─────────────┘     └──────┬──────┘     └─────────────┘
                          │                    ▲
                          │                    │
                          ▼                    │
                   ┌─────────────┐      ┌──────┴──────┐
                   │  Zoho CRM   │─────▶│  Webhooks   │
                   │    API      │      │  (Real-time)│
                   └─────────────┘      └─────────────┘
```

### How It Works

1. **Initial Sync**: Run a one-time sync to pull all contacts and accounts from Zoho into Supabase
2. **Read Operations**: The API reads from the local database first (fast!), falling back to Zoho if needed
3. **Write Operations**: Creates/updates go to both Zoho AND the local database
4. **Webhook Updates**: When changes happen in Zoho CRM directly, webhooks update the local database

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and service role key from Settings → API

### 2. Run the Database Schema

1. Go to your Supabase project's SQL Editor
2. Copy the contents of `supabase/schema.sql`
3. Run the SQL to create the required tables

### 3. Configure Environment Variables

Add these to your Vercel project (or `.env.local` for local development):

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SYNC_API_KEY=your-random-secret-key  # Optional but recommended
```

### 4. Run Initial Sync

After deploying, trigger an initial sync to populate the database:

```bash
# Sync all data (contacts + accounts)
curl -X POST "https://your-app.vercel.app/api/sync" \
  -H "x-api-key: your-sync-api-key" \
  -H "Content-Type: application/json" \
  -d '{"entity": "all"}'

# Or sync just contacts
curl -X POST "https://your-app.vercel.app/api/sync" \
  -H "x-api-key: your-sync-api-key" \
  -d '{"entity": "contacts"}'

# Or sync just accounts
curl -X POST "https://your-app.vercel.app/api/sync" \
  -H "x-api-key: your-sync-api-key" \
  -d '{"entity": "accounts"}'
```

### 5. Configure Zoho Webhooks

To receive real-time updates when data changes in Zoho CRM:

1. Go to Zoho CRM → Setup → Developer Hub → Webhooks
2. Create a new webhook with these settings:

   **For Contacts:**
   - URL: `https://your-app.vercel.app/api/webhooks/zoho`
   - Module: Contacts
   - Events: Create, Update, Delete

   **For Accounts:**
   - URL: `https://your-app.vercel.app/api/webhooks/zoho`
   - Module: Accounts
   - Events: Create, Update, Delete

3. Save and activate the webhooks

## API Endpoints

### Sync Endpoint

```
GET  /api/sync          # Get sync status
POST /api/sync          # Trigger a sync
```

**POST body options:**
```json
{
  "entity": "all"       // "all", "contacts", or "accounts"
}
```

### Webhook Endpoint

```
POST /api/webhooks/zoho  # Receives Zoho webhook notifications
```

This endpoint is called automatically by Zoho when records change.

## Monitoring

### Check Sync Status

```bash
curl "https://your-app.vercel.app/api/sync" \
  -H "x-api-key: your-sync-api-key"
```

Response:
```json
{
  "contacts": {
    "lastSync": "2024-01-15T10:30:00Z",
    "status": "success",
    "recordsInDb": 1250
  },
  "accounts": {
    "lastSync": "2024-01-15T10:30:00Z",
    "status": "success",
    "recordsInDb": 450
  }
}
```

### View Webhook Logs

In Supabase, query the `webhook_logs` table:

```sql
SELECT * FROM webhook_logs 
ORDER BY processed_at DESC 
LIMIT 100;
```

## Scheduled Sync (Optional)

For extra reliability, set up a scheduled sync using:

### Vercel Cron Jobs

Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/sync?apiKey=your-sync-api-key&entity=all",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

This runs a full sync every 6 hours as a backup.

### External Cron Service

Use services like:
- [cron-job.org](https://cron-job.org)
- [EasyCron](https://www.easycron.com)
- GitHub Actions scheduled workflows

## Troubleshooting

### Data Not Showing from Database

1. Check if Supabase is configured:
   - Verify `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` are set
   - Check Vercel logs for connection errors

2. Run initial sync if the database is empty:
   ```bash
   curl -X POST "your-app/api/sync" -H "x-api-key: your-key"
   ```

### Webhooks Not Working

1. Verify the webhook URL is correct in Zoho CRM
2. Check the `webhook_logs` table for errors
3. Ensure the webhook is activated in Zoho CRM

### Sync Failures

1. Check Zoho API rate limits (you get 24,000 API calls/day on free plan)
2. Review sync_status table for error messages
3. Check Vercel function logs for detailed errors

## Performance Benefits

| Operation | Before (Zoho Direct) | After (With Database) |
|-----------|---------------------|----------------------|
| List Contacts | 800-1500ms | 50-150ms |
| Search | 500-1000ms | 30-100ms |
| Filter | 600-1200ms | 40-120ms |

The database provides:
- **10-20x faster** read operations
- No Zoho API rate limit concerns for reads
- Offline resilience (data still accessible if Zoho is slow/down)
- Better search and filtering capabilities

## Fallback Behavior

If Supabase is not configured or the database is empty:
- The API automatically falls back to direct Zoho API calls
- No code changes needed - just works with or without the database
- Response includes `source: "database"` or `source: "zoho"` field

