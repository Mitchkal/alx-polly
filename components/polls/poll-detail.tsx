"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getPollAction, voteOnPollAction } from "@/lib/actions/poll-actions";
import { PollWithOptionsAndResults, PollOption } from "@/lib/types";

interface PollDetailProps {
  id: string;
}

export function PollDetail({ id }: PollDetailProps) {
  const [poll, setPoll] = useState<PollWithOptionsAndResults | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPoll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { poll: fetchedPoll, error } = await getPollAction(id);
      if (error) {
        throw new Error(error);
      }
      setPoll(fetchedPoll);
      // Check if user has already voted based on IP (simplified for client-side check)
      // In a real app, this would be determined by server-side logic or user session
      const voted = localStorage.getItem(`voted_on_poll_${id}`);
      if (voted) {
        setHasVoted(true);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPoll();
  }, [fetchPoll]);

  const handleVote = async (optionId: string) => {
    if (!poll) return;

    const formData = new FormData();
    formData.append('poll_id', poll.id);
    formData.append('option_id', optionId);

    try {
      const { error } = await voteOnPollAction(formData);
      if (error) {
        throw new Error(error);
      }

      // To get updated results, re-fetch the poll
      await fetchPoll();
      setHasVoted(true);
      localStorage.setItem(`voted_on_poll_${id}`, "true");
      window.location.href = `/polls/${poll.id}/results`;
    } catch (e: any) {
      setError(e.message);
    }
  };

  if (loading) {
    return <div className="max-w-3xl mx-auto text-center">Loading poll...</div>;
  }

  if (error) {
    return <div className="max-w-3xl mx-auto text-center text-red-500">Error: {error}</div>;
  }

  if (!poll) {
    return <div className="max-w-3xl mx-auto text-center">Poll not found.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Button variant="outline" className="mb-6" asChild>
        <a href="/polls">← Back to Polls</a>
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{poll.title}</CardTitle>
          <CardDescription>
            Created by {poll.created_by} on {new Date(poll.created_at).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">{poll.description}</p>
          
          <div className="space-y-4">
            {poll.options.map((option) => {
              const optionResult = poll.results.find(result => result.option_id === option.id);
              const votesForOption = optionResult ? optionResult.vote_count : 0;
              const totalVotes = poll.results.reduce((sum, result) => sum + result.vote_count, 0);
              const percentage = totalVotes === 0 ? 0 : Math.round((votesForOption / totalVotes) * 100) || 0;
              
              return (
                <div key={option.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id={option.id}
                      name="poll-option"
                      value={option.id}
                      disabled={hasVoted}
                      checked={selectedOption === option.id}
                      onChange={() => setSelectedOption(option.id)}
                      className="h-4 w-4 border-primary text-primary focus:ring-primary"
                    />
                    <label htmlFor={option.id} className="text-sm font-medium">
                      {option.text}
                    </label>
                  </div>
                  
                  <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{votesForOption} votes</span>
                    <span>{percentage}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={() => selectedOption && handleVote(selectedOption)} 
            disabled={!selectedOption || hasVoted}
            className="w-full"
          >
            {hasVoted ? "You have voted" : "Submit Vote"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}