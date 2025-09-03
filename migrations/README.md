# Database Schema

This folder contains the database migrations and schema setup for the polling application.

## Tables Overview

### 1. `polls`

Stores poll questions and metadata.

- `id`: Unique identifier (UUID) NOT NULL DEFAULT gen_random_uuid()
- `question`: The poll question text NOT NULL
- `created_at`: Timestamp when poll was created NOT NULL DEFAULT now()
- `updated_at`: Timestamp when poll was last updated NOT NULL (managed by update trigger)
- `created_by`: User ID who created the poll NOT NULL (references auth.users)
- `total_votes`: Total number of votes across all options DEFAULT 0

### 2. `poll_options`

Stores voting options for each poll.

- `id`: Unique identifier (UUID) NOT NULL DEFAULT gen_random_uuid()
- `poll_id`: Reference to the poll this option belongs to NOT NULL ON DELETE CASCADE
- `text`: The option text NOT NULL
- `votes_count`: Number of votes for this option DEFAULT 0
- `created_at`: Timestamp when option was created NOT NULL DEFAULT now()

### 3. `votes`

Stores individual votes from users.

- `id`: Unique identifier (UUID) NOT NULL DEFAULT gen_random_uuid()
- `poll_id`: Reference to the poll being voted on NOT NULL ON DELETE CASCADE
- `option_id`: Reference to the option being voted for NOT NULL ON DELETE CASCADE
- `user_id`: User ID who cast the vote NOT NULL (references auth.users)
- `created_at`: Timestamp when vote was cast NOT NULL DEFAULT now()

## Setup Instructions

### Option 1: Automated Setup (Recommended)

1. **Install Supabase CLI** (if not already installed):

   ```bash
   # Using npm (if supported)
   npm install supabase@latest --save-dev

   # Or using other package managers
   brew install supabase/tap/supabase    # macOS
   # OR
   scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
   scoop install supabase                 # Windows
   ```

2. **Initialize Supabase project** (if not already done):

   ```bash
   npx supabase@latest init
   npx supabase@latest login
   npx supabase@latest link --project-ref YOUR_PROJECT_REF
   ```

3. **Run the automated setup script**:
   ```bash
   npm run db:setup
   ```

### Option 2: Manual Setup

1. **Create Supabase Project**

   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Wait for the database to be ready

2. **Apply Migrations Manually**
   - Open your Supabase project dashboard
   - Go to the SQL Editor
   - Copy and paste the contents of each migration file in order:
     1. `001_initial_schema.sql`
     2. `002_rls_policies.sql`
     3. `003_secure_votes_view.sql`

### Option 3: Using Supabase CLI Directly

If you have Supabase CLI installed globally:

```bash
# Initialize and link project
supabase init
supabase login
supabase link --project-ref YOUR_PROJECT_REF

# Apply migrations
supabase db execute --file migrations/001_initial_schema.sql
supabase db execute --file migrations/002_rls_policies.sql
supabase db execute --file migrations/003_secure_votes_view.sql
```

### 3. Verify Setup

After running the migrations, you should see:

- 3 tables: `polls`, `poll_options`, `votes`
- Proper relationships and constraints
- RLS policies enabled on all tables
- 2 SECURITY DEFINER functions: `get_poll_results()` and `get_all_poll_results()`
- Secure access to aggregate results without exposing user PII

## Security Features

### Row Level Security (RLS)

- **Polls**: Anyone can view, only authenticated users can create, only creators can update/delete
- **Poll Options**: Anyone can view, only poll creators can modify options
- **Votes**: Table is private to protect PII. Only authenticated users can vote, and only owners can view individual votes. Public access to results is provided through a secure aggregate view/function.

### Data Integrity

- Foreign key constraints ensure data consistency
- Unique constraint prevents duplicate votes from same user on same poll

### Creating a Poll

```sql
-- Insert poll
INSERT INTO polls (question, created_by)
VALUES ('What''s your favorite programming language?', 'user-uuid')
RETURNING id;

-- Insert options
INSERT INTO poll_options (poll_id, text)
VALUES
  ('poll-uuid', 'JavaScript'),
  ('poll-uuid', 'Python'),
  ('poll-uuid', 'TypeScript');
```

### Casting a Vote

**Security Note**: For security reasons, INSERT statements should never accept user-supplied `user_id` values. Instead, configure the database to automatically bind the authenticated user's ID using either:

1. **RLS Policy**: Create a policy that enforces `user_id = auth.uid()` for INSERT operations on the `authenticated` role
2. **Column DEFAULT**: Set a column default that calls `auth.uid()` to automatically populate the user_id

This prevents users from submitting votes on behalf of other users.

```sql
-- Secure INSERT - user_id is automatically populated
INSERT INTO votes (poll_id, option_id)
VALUES ('poll-uuid', 'option-uuid');
```

### Getting Poll Results (Secure)

Use the secure aggregate functions instead of direct table access to protect user privacy:

```sql
-- Get results for a specific poll
SELECT * FROM get_poll_results('poll-uuid');

-- Get results for all polls
SELECT * FROM get_all_poll_results();
```

**Security Note**: Direct queries to the `votes` table are now restricted. The `get_poll_results()` and `get_all_poll_results()` functions provide secure access to aggregate data without exposing individual user votes or PII.
