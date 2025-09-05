'use client';

import { PollResult, PollWithOptionsAndResults } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface PollResultsProps {
  poll: PollWithOptionsAndResults;
}

/**
 * PollResults Component
 *
 * This component displays the results of a poll, including vote counts and percentages for each option.
 *
 * Why: Provides a visual summary of poll outcomes after voting, allowing users to see aggregated results.
 * Enhances transparency and engagement in the Polling App by showing how others voted.
 *
 * Assumptions:
 * - Poll data with results is passed from a parent component (likely fetched via Server Action).
 * - Options and results are synchronized.
 *
 * Edge Cases:
 * - Zero total votes shows 0% for all options.
 * - Sorting handles ties in vote counts.
 *
 * Connections:
 * - Uses PollWithOptionsAndResults type from '@/lib/types' for prop typing.
 * - Integrates shadcn/ui Card and Progress for UI consistency and visual progress bars.
 * - Typically used in conjunction with PollDetail for post-voting views.
 */
export function PollResults({ poll }: PollResultsProps) {
  // Calculate total votes
  // Why: Needed for percentage calculations
  // Edge Cases: Handles zero votes
  const totalVotes = poll.results.reduce((sum, result) => sum + result.vote_count, 0);
  
  // Sort results by vote count descending
  // Why: Displays most popular options first
  const sortedResults = [...poll.results].sort((a, b) => b.vote_count - a.vote_count);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{poll.title}</CardTitle>
        <CardDescription>
          {poll.description}
          <div className="mt-2 text-sm font-medium">
            Total votes: {totalVotes}
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedResults.map((result) => {
            // Calculate percentage
            // Assumptions: totalVotes > 0 check prevents division by zero
            const percentage = totalVotes > 0 
              ? Math.round((result.vote_count / totalVotes) * 100) 
              : 0;
            
            return (
              <div key={result.option_id} className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">{result.option_text}</span>
                  <span className="text-sm text-muted-foreground">
                    {result.vote_count} votes ({percentage}%)
                  </span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}