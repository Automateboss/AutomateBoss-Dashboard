import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local
config({ path: join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const schemaPath = join(__dirname, '../supabase/command-center-schema.sql');
const schema = readFileSync(schemaPath, 'utf8');

console.log('🚀 Setting up database...\n');

// Split SQL into individual statements
const statements = schema
  .split(';')
  .map(s => s.trim())
  .filter(s => s && s.length > 10 && !s.startsWith('--'))
  .map(s => s + ';');

console.log(`Found ${statements.length} SQL statements\n`);

// Execute each statement
for (let i = 0; i < statements.length; i++) {
  const stmt = statements[i];
  const preview = stmt.substring(0, 60).replace(/\s+/g, ' ');
  
  try {
    // Supabase doesn't have direct SQL execution via REST API
    // So we'll output instructions instead
    console.log(`Statement ${i + 1}: ${preview}...`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
}

console.log('\n⚠️  NOTE: Supabase REST API doesn\'t support direct SQL execution.');
console.log('📋 Please execute the SQL manually:');
console.log(`\n1. Open: ${supabaseUrl.replace('https://', 'https://supabase.com/dashboard/project/').replace('.supabase.co', '')}/sql/new`);
console.log('2. Copy the contents of: supabase/command-center-schema.sql');
console.log('3. Paste and run in the SQL editor\n');
console.log('OR use psql with connection string from Supabase settings.\n');

// Try to verify by checking if we can query (won't work if tables don't exist yet)
console.log('🔍 Checking existing tables...\n');

const tablesToCheck = [
  'daily_metrics',
  'team_performance',
  'customer_health',
  'support_conversations',
  'support_tickets',
  'email_inbox',
  'alerts',
  'sync_status'
];

for (const table of tablesToCheck) {
  try {
    const { data, error } = await supabase.from(table).select('count').limit(0);
    if (error) {
      console.log(`❌ ${table}: Not found`);
    } else {
      console.log(`✅ ${table}: Exists`);
    }
  } catch (err) {
    console.log(`❌ ${table}: ${err.message}`);
  }
}
