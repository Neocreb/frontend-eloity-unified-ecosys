# Getting Started with Eloity Platform

This guide will help you set up the Eloity Unified Ecosystem Platform on your local machine.

## Prerequisites

1. Node.js (version 16 or higher)
2. A Supabase account (free tier available)
3. Git (optional, for version control)

## Step 1: Clone or Download the Repository

If you haven't already, clone or download the repository to your local machine.

## Step 2: Install Dependencies

Navigate to the project directory and install the required dependencies:

```bash
npm install
```

## Step 3: Set Up Supabase

1. Create a Supabase account at https://supabase.com/
2. Create a new project
3. Note down your project ID (visible in the project dashboard URL)

## Step 4: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Open the `.env` file and update the Supabase configuration:
   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-public-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

   # Database Configuration (for migrations)
   SUPABASE_DB_URL=postgresql://postgres:YOUR_DB_PASSWORD@YOUR_PROJECT_ID.supabase.co:5432/postgres
   DATABASE_URL=postgresql://postgres:YOUR_DB_PASSWORD@YOUR_PROJECT_ID.supabase.co:5432/postgres
   ```

3. Get your actual credentials from the Supabase dashboard:
   - Project Settings > API for the keys
   - Settings > Database for the database password

## Step 5: Run Database Migrations

Once your environment variables are set, run the database migrations:

```bash
npm run migrate:apply
```

## Step 6: Start the Development Server

Start both the frontend and backend development servers:

```bash
npm run dev
```

The application will be available at http://localhost:5173

## Troubleshooting

### Migration Issues

If you encounter issues with migrations:

1. Verify your database connection string is correct
2. Ensure your Supabase project is not paused
3. Check that you're using the service role key for migrations

### Environment Variables Not Loading

1. Ensure your `.env` file is in the root directory
2. Verify there are no syntax errors in the file
3. Restart your development server after updating environment variables

### Connection Errors

1. Check your internet connection
2. Verify your Supabase credentials
3. Ensure your Supabase project region matches your connection string

## Next Steps

1. Explore the admin dashboard
2. Set up initial user accounts
3. Configure payment processors
4. Customize the platform for your needs

For more detailed documentation, refer to the README files in the repository.