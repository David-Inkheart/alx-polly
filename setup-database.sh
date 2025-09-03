#!/bin/bash
set -euo pipefail

# Database Setup Script for Polling App
# This script helps set up the Supabase database schema using the Supabase CLI

echo "🚀 Setting up Polling App Database"
echo "=================================="

# Check if we're in a Supabase project
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ Not in a Supabase project directory."
    echo "Please initialize a Supabase project first:"
    echo "npx supabase@latest init"
    echo ""
    echo "Or if you already have a Supabase project, run this from its root directory."
    exit 1
fi

echo "📦 Applying database migrations..."

echo "Pushing local migrations to the linked project..."
npx supabase@latest db push --linked --include-all
if [ $? -eq 0 ]; then
  echo "✅ Migrations applied successfully"
else
  echo "❌ Failed to apply migrations"
  echo ""
  echo "💡 Troubleshooting tips:"
  echo "1) Login: npx supabase@latest login"
  echo "2) Link your project (once): npx supabase@latest link --project-ref YOUR_PROJECT_REF"
  echo "3) Dry run to preview: npx supabase@latest db push --linked --dry-run"
  echo "4) Or apply SQL manually in the Supabase dashboard SQL editor"
  exit 1
fi

echo ""
echo "🎉 Database setup complete!"
echo ""
echo "Next steps:"
echo "1. Update your environment variables in .env.local:"
echo "   NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}"
echo "   NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}"
echo ""
echo "2. Generate TypeScript types (optional):"
echo "   npx supabase@latest gen types typescript --local > lib/database.types.ts"
echo ""
echo "3. Start your development server:"
echo "   npm run dev"
