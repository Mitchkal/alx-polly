"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getPollAction, voteOnPollAction } from "@/lib/actions/poll-actions";
import { PollWithOptionsAndResults, PollOption } from "@/lib/types";

interface PollDetailProps {
  id: string;
}

/**
 * PollDetail Component
 *
 * This component fetches and displays detailed information for a specific poll,
 * including options for voting if the user hasn't voted yet.
 *
 * Why: Provides an interactive view for users to vote on polls, showing real-time results.
 * Enhances user engagement by allowing participation and immediate feedback.
 *
 * Assumptions:
 * - Poll ID is valid and exists in Supabase.
 * - User may or may not have voted (checked via localStorage for simplicity).
 * - Network availability for fetching and voting actions.
 *
 * Edge Cases:
 * - Poll not found or fetch errors display error messages.
 * - User already voted disables voting UI.
 * - No options or zero votes handled in percentage calculations.
 * - Loading states show placeholders to improve UX.
 *
 * Connections:
 * - Uses getPollAction and voteOnPollAction from '@/lib/actions/poll-actions' for data fetching and mutations.
 * - Integrates with PollOptionDisplay sub-component for modular option rendering.
 * - Uses shadcn/ui components (Button, Card) for consistent styling.
 * - Redirects to results page after voting via window.location.
 */
export function PollDetail({ id }: PollDetailProps) {
  // State for storing fetched poll data
  // Why: Holds poll details for rendering
  const [poll, setPoll] = useState<PollWithOptionsAndResults | null>(null);
  // State for selected voting option
  // Assumptions: Only one option can be selected
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  // State tracking if user has voted
  // Edge Cases: Persists via localStorage to prevent multiple votes
  const [hasVoted, setHasVoted] = useState(false);
  // Loading state for fetch operations
  const [loading, setLoading] = useState(true);
  // Error state for fetch/vote failures
  const [error, setError] = useState<string | null>(null);

  // Callback for fetching poll data
  // Why: Encapsulates fetch logic for reuse (e.g., after voting)
  const fetchPoll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { poll: fetchedPoll, error } = await getPollAction(id);
      if (error) {
        throw new Error(error);
      }
      setPoll(fetchedPoll);
      // Simplified client-side vote check
      // Assumptions: localStorage available; not secure for production
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

      // Re-fetch for updated results
      await fetchPoll();
      setHasVoted(true);
      localStorage.setItem(`voted_on_poll_${id}`, "true");
      // Redirect to results
      // Connections: Links to results page for post-vote view
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
          <CardTitle className="text-2xl">{poll?.title}</CardTitle>
          <CardDescription>
            Created by {poll?.created_by} on {new Date(poll.created_at).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">{poll?.description}</p>
          
          <div className="space-y-4">
            {poll?.options.map((option) => (
              <PollOptionDisplay
                key={option.id}
                option={option}
                pollResults={poll.results}
                hasVoted={hasVoted}
                selectedOption={selectedOption}
                onSelectOption={setSelectedOption}
              />
            ))}
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

interface PollOptionDisplayProps {
  option: PollOption;
  pollResults: PollWithOptionsAndResults['results'];
  hasVoted: boolean;
  selectedOption: string | null;
  onSelectOption: (optionId: string) => void;
}

/**
 * PollOptionDisplay Sub-Component
 *
 * Renders individual poll options with voting radio and result progress bar.
 *
 * Why: Modularizes option display for reusability within PollDetail.
 * Calculates and shows vote percentages visually.
 *
 * Assumptions:
 * - Poll results are provided and match options.
 * - Total votes calculated externally.
 *
 * Edge Cases:
 * - Zero total votes shows 0%.
 * - Disabled when voted.
 *
 * Connections:
 * - Uses types PollOption and PollWithOptionsAndResults['results'].
 * - Integrates shadcn/ui Progress for visual feedback.
 */
function PollOptionDisplay({
  option,
  pollResults,
  hasVoted,
  selectedOption,
  onSelectOption,
}: PollOptionDisplayProps) {
  // Find votes for this option
  const optionResult = pollResults.find((result) => result.option_id === option.id);
  const votesForOption = optionResult ? optionResult.vote_count : 0;
  // Calculate total votes
  // Edge Cases: Avoid division by zero
  const totalVotes = pollResults.reduce((sum, result) => sum + result.vote_count, 0);
  const percentage = totalVotes === 0 ? 0 : Math.round((votesForOption / totalVotes) * 100) || 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <input
          type="radio"
          id={option.id}
          name="poll-option"
          value={option.id}
          disabled={hasVoted}
          checked={selectedOption === option.id}
          onChange={() => onSelectOption(option.id)}
          className="h-4 w-4 border-primary text-primary focus:ring-primary"
        />
        <label htmlFor={option.id} className="text-sm font-medium">
          {option.text}
        </label>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div className="h-full bg-primary" style={{ width: `${percentage}%` }} />
      </div>

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{votesForOption} votes</span>
        <span>{percentage}%</span>
      </div>
    </div>
  );
}
