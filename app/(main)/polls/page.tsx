import { Metadata } from "next";
import { PollList } from "@/components/polls/poll-list";

export const metadata: Metadata = {
  title: "Polls",
  description: "View and vote on polls",
};

export default function PollsPage() {
  return (
    <div className="container py-10">
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Polls</h1>
          <p className="text-muted-foreground">
            Browse and vote on polls created by the community
          </p>
        </div>
        <PollList />
      </div>
    </div>
  );
}