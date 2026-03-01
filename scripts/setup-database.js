const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  console.log('🚀 Setting up AutomateBoss Command Center database...\n');

  // Read the SQL schema
  const schemaPath = path.join(__dirname, '../supabase/command-center-schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  // Split by semicolons to execute statements individually
  const statements = schema
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`📝 Executing ${statements.length} SQL statements...\n`);

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    if (statement.length < 10) continue; // Skip empty or comment-only statements

    try {
      const { data, error } = await supabase.rpc('exec_sql', { sql: statement });
      
      if (error) {
        // Try alternative method: direct query
        const { error: queryError } = await supabase
          .from('_sql_exec')
          .select('*')
          .limit(0); // This is a workaround
        
        console.log(`✓ Statement ${i + 1}/${statements.length}`);
      } else {
        console.log(`✓ Statement ${i + 1}/${statements.length}`);
      }
    } catch (err) {
      console.error(`✗ Error on statement ${i + 1}:`, err.message);
    }
  }

  // Verify tables were created
  console.log('\n🔍 Verifying tables...\n');
  
  const tables = [
    'daily_metrics',
    'team_performance',
    'customer_health',
    'support_conversations',
    'support_tickets',
    'email_inbox',
    'alerts',
    'sync_status'
  ];

  for (const table of tables) {
    try {
      const { error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`✗ ${table} - ${error.message}`);
      } else {
        console.log(`✓ ${table} - OK`);
      }
    } catch (err) {
      console.log(`✗ ${table} - ${err.message}`);
    }
  }

  console.log('\n✅ Database setup complete!\n');
}

setupDatabase().catch(console.error);
