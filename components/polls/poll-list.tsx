"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Mock data for polls
const mockPolls = [
  {
    id: "1",
    title: "What's your favorite programming language?",
    description: "Vote for your preferred programming language",
    votes: 42,
    createdAt: "2023-05-15",
    createdBy: "John Doe",
  },
  {
    id: "2",
    title: "Best frontend framework?",
    description: "Which frontend framework do you prefer?",
    votes: 38,
    createdAt: "2023-05-10",
    createdBy: "Jane Smith",
  },
  {
    id: "3",
    title: "Do you prefer remote work or office work?",
    description: "Share your preference for work environment",
    votes: 56,
    createdAt: "2023-05-05",
    createdBy: "Alex Johnson",
  },
];

export function PollList() {
  const [polls, setPolls] = useState(mockPolls);

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {polls.map((poll) => (
        <Link href={`/polls/${poll.id}`} key={poll.id}>
          <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="line-clamp-2">{poll.title}</CardTitle>
              <CardDescription>Created by {poll.createdBy}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {poll.description}
              </p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <p className="text-sm text-muted-foreground">
                {poll.votes} votes
              </p>
              <p className="text-sm text-muted-foreground">
                {poll.createdAt}
              </p>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  );
}