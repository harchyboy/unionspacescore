# Zoho Creator Integration Setup Guide

This guide will help you integrate your Vercel application with Zoho Creator API.

## Overview

The integration consists of:
1. **Serverless API Proxy** (`api/zoho-proxy.ts`) - Securely handles communication with Zoho
2. **Test Page** (`public/Zoho Integration Test.html`) - Interactive UI to test the integration

## Prerequisites

- A Zoho Creator account
- A Zoho Creator application with a Deluge function
- A Vercel account (or ability to run locally)

## Step 1: Get Your Zoho API Credentials

### 1.1 Create a Zoho Creator Function

In your Zoho Creator app, create a Deluge function that you want to call. Example:

```deluge
// Sample Deluge function
void testFunction(string userName) {
    info "Hello " + userName;
    response.put("message", "Hello " + userName + "!");
    response.put("timestamp", now);
    return response;
}
```

### 1.2 Get Your OAuth Token

1. Go to [Zoho API Console](https://api-console.zoho.com/)
2. Register a new client (Self Client type is easiest for testing)
3. Generate an OAuth token with the required scopes (ZohoCreator.form.ALL)
4. Copy the access token

### 1.3 Get Your API Endpoint URL

Your Zoho Creator API endpoint will look like:

```
https://creator.zoho.com/api/v2/[account_owner]/[app_link_name]/form/[form_name]/[function_name]
```

Example:
```
https://creator.zoho.com/api/v2/myaccount/my-app/form/MyForm/testFunction
```

## Step 2: Configure Environment Variables

### For Local Development

Create a `.env.local` file in your project root:

```env
ZOHO_OAUTH_TOKEN=1000.xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
ZOHO_API_ENDPOINT=https://creator.zoho.com/api/v2/your-account/your-app/form/YourForm/yourFunction
```

**Important:** Add `.env.local` to your `.gitignore` to keep credentials secure!

### For Vercel Deployment

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

| Variable Name | Value |
|--------------|-------|
| `ZOHO_OAUTH_TOKEN` | Your OAuth access token |
| `ZOHO_API_ENDPOINT` | Your full Zoho API endpoint URL |

4. Make sure to add them for all environments (Production, Preview, Development)

## Step 3: Install Dependencies

If you haven't already, install axios:

```bash
pnpm install axios
```

If you encounter permission errors on Windows, try:
- Closing your terminal and IDE
- Running as administrator
- Or manually close any processes locking node_modules

## Step 4: Test the Integration

### Local Testing

1. Start your development server:
   ```bash
   pnpm dev
   ```

2. Navigate to: `http://localhost:5173/Zoho%20Integration%20Test.html`

3. Enter a name and click "Call Zoho Function"

4. You should see a response from Zoho

### Production Testing

1. Deploy to Vercel:
   ```bash
   pnpm build
   vercel deploy
   ```

2. Navigate to: `https://your-app.vercel.app/Zoho%20Integration%20Test.html`

3. Test the integration

## Step 5: Integrate Into Your App

Now that the proxy is working, you can call it from any of your existing pages:

### Example: Vanilla JavaScript

```javascript
async function callZohoAPI(name) {
    try {
        const response = await fetch('/api/zoho-proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        });

        const data = await response.json();

        if (response.ok) {
            console.log('Success:', data);
            return data;
        } else {
            throw new Error(data.error || 'API call failed');
        }
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// Usage
callZohoAPI('John Doe')
    .then(result => {
        console.log('Zoho responded:', result);
    })
    .catch(error => {
        console.error('Failed to call Zoho:', error);
    });
```

### Example: With Loading State

```javascript
const submitButton = document.getElementById('submitBtn');
const resultDiv = document.getElementById('result');

submitButton.addEventListener('click', async () => {
    submitButton.disabled = true;
    submitButton.textContent = 'Loading...';
    
    try {
        const response = await fetch('/api/zoho-proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Test User' })
        });

        const data = await response.json();
        
        if (response.ok) {
            resultDiv.innerHTML = `<div class="success">${data.data.message}</div>`;
        } else {
            resultDiv.innerHTML = `<div class="error">${data.error}</div>`;
        }
    } catch (error) {
        resultDiv.innerHTML = `<div class="error">Network error: ${error.message}</div>`;
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Submit';
    }
});
```

## API Reference

### Endpoint: `POST /api/zoho-proxy`

**Request Body:**
```json
{
  "name": "string"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    // Zoho Creator response data
  }
}
```

**Error Responses:**

- **400 Bad Request:** Missing required field
  ```json
  {
    "error": "Missing required field: name"
  }
  ```

- **405 Method Not Allowed:** Only POST is allowed
  ```json
  {
    "error": "Method GET Not Allowed"
  }
  ```

- **500 Internal Server Error:** Server configuration or Zoho API error
  ```json
  {
    "error": "Server configuration error: Missing Zoho credentials"
  }
  ```

- **503 Service Unavailable:** Cannot reach Zoho API
  ```json
  {
    "error": "Unable to reach Zoho API"
  }
  ```

## Customizing the API Proxy

To modify the proxy to send different data to Zoho, edit `api/zoho-proxy.ts`:

```typescript
// Change the request body structure
const zohoResponse = await axios.post(
  ZOHO_API_ENDPOINT,
  {
    // Customize your payload here
    userName: name,
    additionalField: req.body.additionalField,
    timestamp: new Date().toISOString()
  },
  {
    headers: {
      'Authorization': `Zoho-oauthtoken ${ZOHO_OAUTH_TOKEN}`,
      'Content-Type': 'application/json'
    }
  }
);
```

## Security Best Practices

1. ✅ **Never expose credentials in client-side code** - Always use the server-side proxy
2. ✅ **Use environment variables** - Never hardcode tokens
3. ✅ **Validate input** - Sanitize all user input before sending to Zoho
4. ✅ **Implement rate limiting** - Consider adding rate limiting to prevent abuse
5. ✅ **Rotate tokens regularly** - Update your OAuth token periodically
6. ✅ **Use HTTPS** - Always use secure connections in production

## Troubleshooting

### "Server configuration error: Missing Zoho credentials"

- Make sure environment variables are set in Vercel
- For local development, ensure `.env.local` exists and is in the project root
- Restart your development server after adding environment variables

### "Unable to reach Zoho API"

- Verify your `ZOHO_API_ENDPOINT` is correct
- Check if Zoho Creator services are up
- Verify your network can reach Zoho's servers

### "EPERM: operation not permitted" during npm install

- Close your terminal and IDE
- Delete `node_modules` and reinstall
- Run your terminal as administrator (Windows)

### CORS Errors

- This should not happen because the API proxy runs on the same domain
- If you see CORS errors, make sure you're calling `/api/zoho-proxy` not the Zoho URL directly

### 401 Unauthorized from Zoho

- Your OAuth token may have expired
- Regenerate a new token in Zoho API Console
- Update the `ZOHO_OAUTH_TOKEN` environment variable

## Next Steps

1. **Extend the API** - Add more endpoints for different Zoho functions
2. **Add Authentication** - Protect your API routes with user authentication
3. **Implement Caching** - Cache Zoho responses to improve performance
4. **Add Logging** - Implement proper logging for monitoring
5. **Error Tracking** - Integrate with Sentry or similar for error tracking

## Support

For Zoho Creator API documentation, visit:
- [Zoho Creator API v2 Documentation](https://www.zoho.com/creator/help/api/v2/)
- [Zoho OAuth Documentation](https://www.zoho.com/creator/help/api/v2/oauth-overview.html)

For Vercel deployment help:
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vercel Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions)

