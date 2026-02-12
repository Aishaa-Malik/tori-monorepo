# Deploying the Google OAuth Edge Function

To properly deploy the Edge Function for Google OAuth, follow these steps:

## 1. Set Environment Variables

Before deploying, you need to set the required environment variables:

```bash
supabase secrets set GOOGLE_CLIENT_ID=942527714249-cdbhr135tk3icfqse2edotf1idttem55.apps.googleusercontent.com
supabase secrets set GOOGLE_CLIENT_SECRET=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
supabase secrets set FRONTEND_URL=http://localhost:3000
```

For production, replace `http://localhost:3000` with your actual production URL.

## 2. Deploy the Function

```bash
supabase functions deploy handle-google-oauth
```

## 3. Test the Function

You can test the function by sending a POST request with the required parameters:

```bash
curl -X POST https://znxzqsmyzzuwlzwgapdk.supabase.co/functions/v1/handle-google-oauth \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"code":"YOUR_AUTH_CODE","user_id":"USER_ID","tenant_id":"TENANT_ID"}'
```

## Security Notes

- **NEVER** expose your client secret in frontend code
- Always exchange OAuth tokens server-side (in Edge Functions)
- Make sure your redirect URIs in Google Cloud Console match exactly what you're using in your code

## Google OAuth Configuration

Make sure your Google Cloud Console has these redirect URIs configured:

- `http://localhost:3000/oauth/callback` (for development)
- Your production URL + `/oauth/callback` (for production)

Remove any unused redirect URIs to avoid confusion.
