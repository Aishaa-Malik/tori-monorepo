// Script to check if tenant_integrations table has the required columns
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://znxzqsmyzzuwlzwgapdk.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpueHpxc215enp1d2x6d2dhcGRrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjY4MzUyMSwiZXhwIjoyMDY4MjU5NTIxfQ.BdzzD-YNRDXmwppCvHlIOl4cKH0uoMcFG4e5wwcsY0I';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
  try {
    console.log('Checking tenant_integrations table columns...');
    
    // Get a sample record to check column existence
    const { data, error } = await supabase
      .from('tenant_integrations')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error querying table:', error.message);
      return;
    }
    
    // Check if the table exists and has data
    if (!data || data.length === 0) {
      console.log('Table exists but has no data');
      // Try to get column info from metadata
      await checkColumnsFromMetadata();
      return;
    }
    
    console.log('Table exists with data');
    
    // Check for required columns in the first record
    const record = data[0];
    const requiredColumns = [
      'integration_data',
      'access_token',
      'refresh_token',
      'token_expires_at',
      'updated_at'
    ];
    
    console.log('\nChecking for required columns:');
    const missingColumns = [];
    
    requiredColumns.forEach(column => {
      if (record.hasOwnProperty(column)) {
        console.log(`✅ Column '${column}' exists`);
      } else {
        console.log(`❌ Column '${column}' is missing`);
        missingColumns.push(column);
      }
    });
    
    if (missingColumns.length > 0) {
      console.log('\n⚠️ Some columns are missing. You may need to run the SQL query:');
      console.log(`
ALTER TABLE tenant_integrations 
ADD COLUMN IF NOT EXISTS integration_data JSONB, 
ADD COLUMN IF NOT EXISTS access_token TEXT, 
ADD COLUMN IF NOT EXISTS refresh_token TEXT, 
ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMPTZ, 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
`);
    } else {
      console.log('\n✅ All required columns exist in the tenant_integrations table!');
    }
    
  } catch (err) {
    console.error('Check failed:', err);
  }
}

async function checkColumnsFromMetadata() {
  try {
    // Try to execute a query that would fail if columns don't exist
    const { error } = await supabase.rpc('check_columns_exist', { 
      table_name: 'tenant_integrations',
      column_names: ['integration_data', 'access_token', 'refresh_token', 'token_expires_at', 'updated_at']
    });
    
    if (error) {
      console.log('Could not check columns through metadata');
      console.log('You may need to run the SQL query to add the required columns');
    }
  } catch (err) {
    console.error('Metadata check failed:', err);
  }
}

checkColumns();