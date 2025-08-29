'use client';

import { PollResult, PollWithOptionsAndResults } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface PollResultsProps {
  poll: PollWithOptionsAndResults;
}

export function PollResults({ poll }: PollResultsProps) {
  // Calculate total votes
  const totalVotes = poll.results.reduce((sum, result) => sum + result.vote_count, 0);
  
  // Sort results by vote count (highest first)
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