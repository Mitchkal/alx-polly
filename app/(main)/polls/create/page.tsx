import { Metadata } from "next";
import { CreatePollForm } from "@/components/polls/create-poll-form";

export const metadata: Metadata = {
  title: "Create Poll",
  description: "Create a new poll",
};

export default function CreatePollPage() {
  return (
    <div className="container py-10">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Create a Poll</h1>
          <p className="text-muted-foreground">
            Create a new poll for the community to vote on
          </p>
        </div>
        <CreatePollForm />
      </div>
    </div>
  );
}