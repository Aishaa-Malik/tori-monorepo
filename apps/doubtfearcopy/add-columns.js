// Script to add required columns to tenant_integrations table
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://znxzqsmyzzuwlzwgapdk.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpueHpxc215enp1d2x6d2dhcGRrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjY4MzUyMSwiZXhwIjoyMDY4MjU5NTIxfQ.BdzzD-YNRDXmwppCvHlIOl4cKH0uoMcFG4e5wwcsY0I';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addColumns() {
  try {
    console.log('Adding required columns to tenant_integrations table...');
    
    // Execute the SQL query to add columns
    const { error } = await supabase.rpc('run_sql_query', {
      query: `
        ALTER TABLE tenant_integrations 
        ADD COLUMN IF NOT EXISTS integration_data JSONB, 
        ADD COLUMN IF NOT EXISTS access_token TEXT, 
        ADD COLUMN IF NOT EXISTS refresh_token TEXT, 
        ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMPTZ, 
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
      `
    });
    
    if (error) {
      console.error('Error executing SQL query:', error.message);
      console.log('\nAlternative approach: Using Supabase REST API to check columns');
      await checkExistingColumns();
    } else {
      console.log('✅ SQL query executed successfully!');
      console.log('Columns have been added to the tenant_integrations table.');
    }
  } catch (err) {
    console.error('Failed to add columns:', err);
    console.log('\nAlternative approach: Using Supabase REST API to check columns');
    await checkExistingColumns();
  }
}

async function checkExistingColumns() {
  try {
    // Get a sample record
    const { data, error } = await supabase
      .from('tenant_integrations')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error querying table:', error.message);
      console.log('\nRecommendation: Please run the SQL query directly in the Supabase SQL editor:');
      console.log(`
ALTER TABLE tenant_integrations 
ADD COLUMN IF NOT EXISTS integration_data JSONB, 
ADD COLUMN IF NOT EXISTS access_token TEXT, 
ADD COLUMN IF NOT EXISTS refresh_token TEXT, 
ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMPTZ, 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
`);
      return;
    }
    
    // If we have data, check if columns exist
    if (data && data.length > 0) {
      const record = data[0];
      const requiredColumns = [
        'integration_data',
        'access_token',
        'refresh_token',
        'token_expires_at',
        'updated_at'
      ];
      
      const missingColumns = [];
      requiredColumns.forEach(column => {
        if (!record.hasOwnProperty(column)) {
          missingColumns.push(column);
        }
      });
      
      if (missingColumns.length > 0) {
        console.log(`Missing columns: ${missingColumns.join(', ')}`);
        console.log('\nRecommendation: Please run the SQL query directly in the Supabase SQL editor');
      } else {
        console.log('✅ All required columns already exist in the tenant_integrations table!');
      }
    } else {
      console.log('Table exists but has no data to check columns');
      console.log('\nRecommendation: Please run the SQL query directly in the Supabase SQL editor');
    }
  } catch (err) {
    console.error('Check failed:', err);
  }
}

addColumns();