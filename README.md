This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Polling App with QR Code Sharing

## Project Overview

This is a web application built with Next.js that allows users to create polls, share them via unique links or QR codes, and vote on them. It features user authentication, poll management, and real-time voting.

## Tech Stack

- **Framework**: Next.js (App Router)
- **Database & Auth**: Supabase
- **Styling**: Tailwind CSS with shadcn/ui components
- **QR Code Generation**: qrcode.react
- **Language**: TypeScript

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd alx-polly
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Supabase:
   - Create a Supabase project at [supabase.com](https://supabase.com).
   - Note your Project URL and Anon Key.
   - Set up the database schema using the SQL in `/supabase/schema.sql`.

4. Configure environment variables:
   Create a `.env.local` file in the root:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

## Running Locally

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

To run tests:
```bash
npm test
```

## Usage Examples

### Creating a Poll
1. Register/Login to your account.
2. Navigate to 'Create Poll'.
3. Fill in title, description, and options.
4. Submit to create and get sharing options.

### Voting on a Poll
1. Access via shared link or QR code.
2. Select an option and vote.
3. View results if allowed.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
