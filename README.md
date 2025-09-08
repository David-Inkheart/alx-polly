# ALX Polly - Interactive Polling Application

A modern, full-stack polling application that allows users to create polls, share them via unique links and QR codes, and vote securely. Built with data integrity and user experience in mind.

## 🚀 Features

- **User Authentication**: Secure signup/login with Supabase Auth
- **Poll Creation**: Create polls with multiple options
- **Voting System**: One vote per user per poll with fraud prevention
- **QR Code Sharing**: Generate QR codes for easy poll sharing
- **Real-time Results**: Live vote count updates
- **Data Protection**: Prevent option changes after voting starts
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Type Safety**: Full TypeScript implementation

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui with Radix UI primitives
- **Backend**: Next.js API Routes, Server Actions
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel (recommended)

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

## 🔧 Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd alx-polly
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Supabase Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com)

2. **Run the database setup script**:

   ```bash
   # This will display the SQL migrations you need to run
   ./manual-db-setup.sh
   ```

3. **Execute the SQL migrations** in your Supabase dashboard:
   - Go to SQL Editor in your Supabase project
   - Copy and paste the migration files in order:
     1. `migrations/001_initial_schema.sql`
     2. `migrations/002_rls_policies.sql`

### 4. Environment Variables

Create a `.env.local` file in the project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Optional: For email confirmation redirects
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Getting your Supabase keys:**

1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Copy the Project URL and anon/public key
4. For service role key, go to Settings → API → Service Role

### 5. Run Database Migrations (Alternative)

If you prefer using Supabase CLI:

```bash
# Install Supabase CLI
npm install -g supabase

# Link your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

## 🚀 Running the Application

### Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Production Build

```bash
npm run build
npm start
```

## 🧪 Testing

### Manual Testing Steps

1. **User Registration & Login**:

   - Visit `/signup` to create an account
   - Login at `/login`
   - Verify authentication state persists

2. **Creating a Poll**:

   - Navigate to `/polls` after logging in
   - Click "Create New Poll"
   - Fill in question and at least 2 options
   - Submit to create the poll

3. **Voting on a Poll**:

   - Visit a poll URL (e.g., `/polls/abc123`)
   - Select an option
   - Click "Vote" to submit
   - Verify you can't vote again

4. **Editing a Poll**:
   - Go to your polls dashboard (`/polls`)
   - Click "Edit" on any poll
   - Try editing the question (should work)
   - Try editing options after voting (should be blocked)

### API Testing

Test the voting API directly:

```bash
# Cast a vote (replace with actual poll ID and option ID)
curl -X POST http://localhost:3000/api/polls/your-poll-id/vote \
  -H "Content-Type: application/json" \
  -d '{"optionId": "your-option-id"}'
```

Expected response:

```json
{
  "success": true,
  "message": "Vote cast successfully"
}
```

## 📖 Usage Examples

### Creating Your First Poll

1. **Sign up/Login**: Create an account or log in
2. **Navigate to Polls**: Go to `/polls`
3. **Create Poll**:
   - Question: "What's your favorite programming language?"
   - Options: "JavaScript", "Python", "TypeScript", "Go"
4. **Share**: Copy the poll URL or scan the QR code

### Voting Process

1. **Access Poll**: Visit the shared poll URL
2. **Authenticate**: Log in if not already authenticated
3. **Vote**: Select your choice and click "Vote"
4. **View Results**: See real-time vote counts and percentages

### Poll Management

- **Edit Question**: Can always be changed (even after voting)
- **Edit Options**: Only possible before any votes are cast
- **Delete Poll**: Permanently removes poll and all votes
- **View Statistics**: See total votes and option breakdown

## 🏗️ Project Structure

```
alx-polly/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (main)/            # Main application pages
│   │   └── polls/         # Poll-related pages
│   └── api/               # API routes
├── components/            # Reusable UI components
│   ├── polls-client.tsx   # Poll dashboard component
│   ├── poll-detail-client.tsx # Poll voting interface
│   └── poll-edit-form.tsx # Poll editing form
├── lib/                   # Utility functions and configurations
│   ├── actions/           # Server actions
│   └── supabase-server.ts # Supabase client setup
├── migrations/            # Database migration files
└── public/               # Static assets
```

## 🔒 Security Features

- **Authentication Required**: All voting requires user login
- **One Vote Per User**: Database constraints prevent duplicate votes
- **Data Integrity**: Options cannot be changed after voting starts
- **Input Validation**: Comprehensive client and server-side validation
- **SQL Injection Prevention**: Parameterized queries via Supabase
- **Authorization Checks**: Users can only edit/delete their own polls

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect Repository**: Link your GitHub repo to Vercel
2. **Environment Variables**: Add Supabase keys to Vercel environment
3. **Deploy**: Automatic deployments on push to main branch

### Other Platforms

The app can be deployed to any platform supporting Node.js:

- Netlify
- Railway
- DigitalOcean App Platform

Make sure to set all environment variables in your deployment platform.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes and test thoroughly
4. Commit with clear messages: `git commit -m "Add: new feature"`
5. Push to your branch: `git push origin feature/your-feature`
6. Create a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

**Database Connection Issues:**

- Verify your Supabase URL and keys in `.env.local`
- Ensure your Supabase project is active
- Check that migrations have been applied

**Authentication Problems:**

- Confirm email confirmation is set up in Supabase
- Check that `NEXT_PUBLIC_SITE_URL` matches your domain

**Build Errors:**

- Ensure Node.js version is 18+
- Clear node_modules: `rm -rf node_modules && npm install`

For more help, check the [Next.js documentation](https://nextjs.org/docs) or create an issue in the repository.
