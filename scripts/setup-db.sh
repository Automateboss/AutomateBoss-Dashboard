#!/bin/bash

# Load environment variables
source ../.env.local

SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL}"
SERVICE_KEY="${SUPABASE_SERVICE_ROLE_KEY}"

echo "🚀 Setting up AutomateBoss Command Center database..."
echo ""

# Read the SQL file
SQL=$(cat ../supabase/command-center-schema.sql)

# Execute SQL via Supabase REST API using the query endpoint
curl -X POST \
  "${SUPABASE_URL}/rest/v1/rpc/exec" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"${SQL}\"}"

echo ""
echo "✅ Database setup initiated!"
echo ""
echo "Note: Check Supabase dashboard to verify tables were created:"
echo "${SUPABASE_URL}/project/default/editor"
