"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { type Poll } from "@/lib/types";

interface PollListProps {
  polls: Poll[];
}

export function PollList({ polls }: PollListProps) {
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