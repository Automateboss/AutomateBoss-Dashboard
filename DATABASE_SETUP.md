# Database Setup Instructions

## Manual Step Required

The database schema needs to be executed in Supabase's SQL Editor.

### Steps:

1. **Open Supabase SQL Editor:**
   https://supabase.com/dashboard/project/ddibpuzphmpmmcjbqjey/sql/new

2. **Copy the SQL schema:**
   - File location: `/Users/joyllc/.openclaw/workspace/dashboard/supabase/command-center-schema.sql`
   - Or copy the content below

3. **Paste and Run** in the SQL editor

4. **Verify tables created:**
   - daily_metrics
   - team_performance
   - customer_health
   - support_conversations
   - support_tickets
   - email_inbox
   - alerts
   - sync_status

### Verification

Run this script after manual SQL execution:
```bash
node scripts/init-db.mjs
```

All 8 tables should show ✅ Exists.

## Alternative: psql

If you have psql installed, get the connection string from:
https://supabase.com/dashboard/project/ddibpuzphmpmmcjbqjey/settings/database

Then run:
```bash
psql "YOUR_CONNECTION_STRING" < supabase/command-center-schema.sql
```
