"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { type Poll } from "@/lib/types";

interface PollListProps {
  polls: Poll[];
}

/**
 * PollList Component
 *
 * This component renders a grid of poll cards, each linking to the poll's detail page.
 *
 * Why: Provides an overview of available polls for users to browse and select,
 * facilitating discovery and navigation in the Polling App.
 *
 * Assumptions:
 * - Polls array is fetched and passed from a parent Server Component.
 * - Each poll has required fields like id, title, description.
 *
 * Edge Cases:
 * - Empty polls array displays a 'No polls available' message.
 * - Long titles or descriptions are truncated with line-clamp.
 *
 * Connections:
 * - Uses Poll type from '@/lib/types' for prop typing.
 * - Integrates Next.js Link for client-side navigation.
 * - Employs shadcn/ui Card components for consistent, responsive UI.
 */
export function PollList({ polls }: PollListProps) {
  // Check for empty polls
  // Edge Cases: Handle no data scenario
  if (!polls || polls.length === 0) {
    return <p>No polls available.</p>;
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {polls.map((poll) => (
        <Link href={`/polls/${poll.id}`} key={poll.id}>
          <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="line-clamp-2">{poll.title}</CardTitle>
              <CardDescription>Created by {poll.created_by}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {poll.description}
              </p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <p className="text-sm text-muted-foreground">
                {poll.votes_count} votes
              </p>
              <p className="text-sm text-muted-foreground">
                {new Date(poll.created_at).toLocaleDateString()}
              </p>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  );
}