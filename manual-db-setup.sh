#!/bin/bash
set -euo pipefail

# Manual Database Setup Helper for Polling App
# This script helps you set up the database manually

echo "📋 Manual Database Setup Helper"
echo "==============================="
echo ""

echo "📄 Migration files available:"
echo "1. migrations/001_initial_schema.sql"
echo "2. migrations/002_rls_policies.sql"
echo ""

echo "📋 To apply manually:"
echo ""
echo "1. Go to your Supabase dashboard: https://supabase.com/dashboard"
echo "2. Select your project"
echo "3. Go to SQL Editor"
echo "4. Copy and paste the contents of each file in order:"
echo ""
echo "📄 File 1: 001_initial_schema.sql"
echo "----------------------------------"
if [ -f migrations/001_initial_schema.sql ]; then
  cat migrations/001_initial_schema.sql
elif [ -f supabase/migrations/001_initial_schema.sql ]; then
  cat supabase/migrations/001_initial_schema.sql
else
  echo "⚠️ File not found at migrations/001_initial_schema.sql or supabase/migrations/001_initial_schema.sql"
fi
echo ""
echo "----------------------------------"
echo ""

echo "📄 File 2: 002_rls_policies.sql"
echo "--------------------------------"
if [ -f migrations/002_rls_policies.sql ]; then
  cat migrations/002_rls_policies.sql
elif [ -f supabase/migrations/002_rls_policies.sql ]; then
  cat supabase/migrations/002_rls_policies.sql
else
  echo "⚠️ File not found at migrations/002_rls_policies.sql or supabase/migrations/002_rls_policies.sql"
fi
echo ""
echo "--------------------------------"
echo ""
echo ""

echo "✅ After applying both files, your database will be ready!"
echo ""
echo "Next steps:"
echo "1. Update your .env.local with Supabase credentials"
echo "2. Run: npm run dev"
