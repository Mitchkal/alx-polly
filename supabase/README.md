# Supabase Schema Setup for ALX-Polly

This directory contains the database schema for the ALX-Polly application. The schema defines the structure for polls, options, votes, and the necessary security policies.

## Schema Overview

The database schema consists of the following tables:

1. **polls** - Stores poll information including title, description, and settings
2. **poll_options** - Stores the options for each poll
3. **votes** - Records votes cast by users or anonymous visitors

Additionally, there is a view:

- **poll_results** - Aggregates vote counts for each poll option

And a function:

- **has_user_voted** - Checks if a user has already voted in a specific poll

## Row Level Security (RLS)

The schema implements Row Level Security to ensure data access is properly controlled:

- Public polls are viewable by everyone
- Users can only create, update, and delete their own polls
- Users can view their own polls (even if private)
- Anyone can vote on public polls
- Users can delete their own votes

## Setup Instructions

### 1. Create a Supabase Project

If you haven't already, create a new Supabase project at [https://app.supabase.io](https://app.supabase.io).

### 2. Run the Schema SQL

You can apply the schema in one of two ways:

#### Option A: Using the Supabase Dashboard

1. Navigate to the SQL Editor in your Supabase dashboard
2. Copy the contents of `schema.sql` from this directory
3. Paste into the SQL Editor and run the query

#### Option B: Using the Supabase CLI

If you have the Supabase CLI installed:

```bash
supabase db push --db-url=<your-supabase-db-url>
```

### 3. Configure Environment Variables

Ensure your `.env.local` file contains the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SECRET_KEY=your-service-role-key
```

You can find these values in your Supabase project settings.

## Testing the Schema

After setting up the schema, you can test it by:

1. Creating a user account through the authentication UI
2. Creating a poll through the application
3. Voting on a poll
4. Viewing poll results

## Schema Modifications

If you need to modify the schema:

1. Update the `schema.sql` file with your changes
2. Apply the changes using one of the methods described above
3. Update the TypeScript types in `/lib/types.ts` to match your schema changes
4. Update the database functions in `/lib/db.ts` as needed

## Troubleshooting

If you encounter issues with the schema:

- Check the Supabase logs in the dashboard
- Verify that RLS policies are correctly applied
- Ensure your environment variables are correctly set
- Check that your client code is using the correct types and functions