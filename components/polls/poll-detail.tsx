"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface PollDetailProps {
  id: string;
}

// Mock data for a poll
const mockPoll = {
  id: "1",
  title: "What's your favorite programming language?",
  description: "Vote for your preferred programming language",
  createdAt: "2023-05-15",
  createdBy: "John Doe",
  options: [
    { id: "1", text: "JavaScript", votes: 15 },
    { id: "2", text: "Python", votes: 12 },
    { id: "3", text: "TypeScript", votes: 8 },
    { id: "4", text: "Java", votes: 7 },
  ],
  totalVotes: 42,
};

export function PollDetail({ id }: PollDetailProps) {
  const [poll, setPoll] = useState(mockPoll);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  const handleVote = () => {
    if (!selectedOption) return;
    
    // In a real app, you would send the vote to the server
    // For now, we'll just update the local state
    setHasVoted(true);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Button variant="outline" className="mb-6" asChild>
        <a href="/polls">← Back to Polls</a>
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{poll.title}</CardTitle>
          <CardDescription>
            Created by {poll.createdBy} on {poll.createdAt}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">{poll.description}</p>
          
          <div className="space-y-4">
            {poll.options.map((option) => {
              const percentage = Math.round((option.votes / poll.totalVotes) * 100) || 0;
              
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
                    <span>{option.votes} votes</span>
                    <span>{percentage}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleVote} 
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