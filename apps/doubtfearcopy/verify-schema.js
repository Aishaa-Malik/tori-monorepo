// Script to verify tenant_integrations table schema
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://znxzqsmyzzuwlzwgapdk.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpueHpxc215enp1d2x6d2dhcGRrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjY4MzUyMSwiZXhwIjoyMDY4MjU5NTIxfQ.BdzzD-YNRDXmwppCvHlIOl4cKH0uoMcFG4e5wwcsY0I';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifySchema() {
  try {
    console.log('Verifying tenant_integrations table schema...');
    
    // Query the table definition
    const { data, error } = await supabase
      .from('tenant_integrations')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error querying table:', error.message);
      return;
    }
    
    // Check if the table exists
    if (data === null) {
      console.log('Table exists but has no data');
    } else {
      console.log('Table exists with data');
    }
    
    // Get column information
    const { data: columns, error: columnsError } = await supabase.rpc('get_table_columns', { table_name: 'tenant_integrations' });
    
    if (columnsError) {
      console.error('Error getting column information:', columnsError.message);
      console.log('Trying alternative approach...');
      
      // Alternative approach: insert a test record with all expected columns
      const testRecord = {
        // Use a valid UUID format
        tenant_id: '00000000-0000-0000-0000-000000000001',
        user_id: '00000000-0000-0000-0000-000000000002',
        integration_type: 'test',
        integration_data: { test: true },
        access_token: 'test-token',
        refresh_token: 'test-refresh',
        token_expires_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { error: insertError } = await supabase
        .from('tenant_integrations')
        .insert(testRecord)
        .select();
      
      if (insertError) {
        console.error('Insert test record failed:', insertError.message);
        console.log('Error details:', insertError);
        
        // Check which columns might be missing
        if (insertError.message.includes('column')) {
          console.log('Possible missing columns in the error message above');
        }
      } else {
        console.log('Test record inserted successfully, all required columns exist');
        
        // Clean up test record
        await supabase
          .from('tenant_integrations')
          .delete()
          .eq('tenant_id', testRecord.tenant_id)
          .eq('user_id', testRecord.user_id);
      }
    } else {
      console.log('Column information:');
      console.table(columns);
    }
    
  } catch (err) {
    console.error('Verification failed:', err);
  }
}

verifySchema();