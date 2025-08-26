import { Metadata } from "next";
import { PollDetail } from "@/components/polls/poll-detail";

export const metadata: Metadata = {
  title: "Poll Details",
  description: "View and vote on a specific poll",
};

interface PollDetailPageProps {
  params: {
    id: string;
  };
}

export default function PollDetailPage({ params }: PollDetailPageProps) {
  return (
    <div className="container py-10">
      <PollDetail id={params.id} />
    </div>
  );
}