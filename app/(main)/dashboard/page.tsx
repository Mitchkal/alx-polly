import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createServerSideClient } from '@/lib/supabase';
import { getUserPolls } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { PlusCircle, BarChart3, Trash2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Manage your polls',
};

/**
 * DashboardPage Component
 *
 * This Server Component renders the user's dashboard, displaying their created polls
 * with options to create new ones, view results, or delete.
 *
 * Why: Serves as the central hub for poll management in the Polling App, allowing
 * authenticated users to oversee and interact with their polls efficiently.
 *
 * Assumptions:
 * - User is authenticated via Supabase session.
 * - getUserPolls fetches polls correctly using Supabase client.
 * - Environment variables for Supabase are set.
 *
 * Edge Cases:
 * - No session: Redirects to login.
 * - Empty polls array: Displays message and create button.
 * - Long titles/descriptions: Uses line-clamp for truncation.
 *
 * Connections:
 * - Integrates with Supabase for auth and data via createServerSideClient and getUserPolls.
 * - Uses Next.js features like redirect and Metadata.
 * - Employs shadcn/ui components (Button, Card) for UI consistency.
 * - Links to create poll page and results via Next.js Link.
 * - Delete action via form to API route.
 */
export default async function DashboardPage() {
  // Create Supabase client
  // Why: For server-side auth and data access
  const supabase = createServerSideClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  // Auth check
  // Assumptions: Valid session required
  // Edge Cases: No session redirects
  if (!session) {
    redirect('/login');
  }
  
  // Fetch user polls
  // Why: Display user's created polls
  const polls = await getUserPolls(session.user.id, supabase);
  
  return (
    <div className="container py-10">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Polls</h1>
            <p className="text-muted-foreground">
              Manage polls you've created
            </p>
          </div>
          <Button asChild>
            <Link href="/polls/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Poll
            </Link>
          </Button>
        </div>
        
        {polls.length === 0 ? (
          // Handle no polls case
          // Why: Guides user to create first poll
          <div className="text-center py-10">
            <h2 className="text-xl font-semibold mb-2">You haven't created any polls yet</h2>
            <p className="text-muted-foreground mb-6">Create your first poll to get started</p>
            <Button asChild>
              <Link href="/polls/create">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Poll
              </Link>
            </Button>
          </div>
        ) : (
          // Render poll cards
          // Why: Provides interactive list of polls
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {polls.map((poll) => (
              <Card key={poll.id}>
                <CardHeader>
                  <CardTitle className="line-clamp-2">{poll.title}</CardTitle>
                  {poll.description && (
                    <CardDescription className="line-clamp-2">
                      {poll.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Created: {new Date(poll.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-sm font-medium">
                      Status: {poll.is_public ? 'Public' : 'Private'}
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/polls/${poll.id}/results`}>
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Results
                    </Link>
                  </Button>
                  <form action={`/api/polls/${poll.id}/delete`} method="post">
                    <Button variant="destructive" size="sm" type="submit">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </form>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}