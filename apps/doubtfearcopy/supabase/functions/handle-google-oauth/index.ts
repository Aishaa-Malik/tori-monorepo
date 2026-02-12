// Deno module imports with proper type declarations
/// <reference types="https://deno.land/std@0.168.0/http/server.ts" />
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
/// <reference types="https://esm.sh/@supabase/supabase-js@2" />
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Define Deno namespace for TypeScript
declare namespace Deno {
  export const env: {
    get(key: string): string | undefined;
  };
}

serve(async (req) => {
  try {
    const { code, tenant_id, user_id } = await req.json();
    
    // Validate required parameters
    if (!code) {
      throw new Error('Authorization code is required');
    }
    
    if (!user_id) {
      throw new Error('User ID is required');
    }
    
    console.log('Received parameters:', { code: '***', tenant_id, user_id });
    
    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: '942527714249-cdbhr135tk3icfqse2edotf1idttem55.apps.googleusercontent.com',
        client_secret: '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',
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: `${Deno.env.get('SITE_URL') || 'http://localhost:3000'}/oauth/callback`
      })
    });
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', errorText);
      throw new Error(`Failed to exchange code for tokens: ${tokenResponse.status} ${errorText}`);
    }
    
    const tokens = await tokenResponse.json();
    console.log('Received tokens from Google');
    
    // Get user's primary calendar info
    const calendarResponse = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary', {
      headers: { 'Authorization': `Bearer ${tokens.access_token}` }
    });
    
    if (!calendarResponse.ok) {
      const errorText = await calendarResponse.text();
      console.error('Failed to get calendar info:', errorText);
      throw new Error(`Failed to get calendar info: ${calendarResponse.status} ${errorText}`);
    }
    
    const calendarInfo = await calendarResponse.json();
    console.log('Calendar info retrieved:', calendarInfo.id);
    
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('REACT_APP_SUPABASE_URL')!,
      Deno.env.get('REACT_APP_SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    // Store integration data
    const integrationData = {
      user_id,
      integration_type: 'google_calendar',
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_expires_at: new Date(Date.now() + tokens.expires_in * 1000),
      calendar_id: calendarInfo.id || 'primary',
      connection_data: {
        calendar_name: calendarInfo.summary,
        calendar_email: calendarInfo.id,
        connected_at: new Date().toISOString()
      },
      is_connected: true
    };
    
    // Add tenant_id if provided and not empty string
    if (tenant_id && tenant_id !== '') {
      Object.assign(integrationData, { tenant_id });
    } else {
      console.log('No valid tenant_id provided, integration will be associated with user only');
    }
    
    const { error } = await supabase
      .from('tenant_integrations')
      .upsert(integrationData);
      
    if (error) {
      console.error('Database error:', error);
      throw error;
    }
    
    console.log('Integration data saved successfully');
    
    return new Response(JSON.stringify({ 
      success: true, 
      calendar_email: calendarInfo.id,
      message: 'Google Calendar connected successfully'
    }), {
      headers: { 'Content-Type': 'application/json' }, 
      status: 200
    });
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || 'Unknown error occurred'
    }), {
      headers: { 'Content-Type': 'application/json' }, 
      status: 400
    });
  }
});