import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPollAction } from '@/lib/actions/poll-actions';
import { PollResults } from '@/components/polls/poll-results';
import { PollShare } from '@/components/polls/poll-share';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface PollResultsPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata(
  { params }: PollResultsPageProps
): Promise<Metadata> {
  const { poll } = await getPollAction(params.id);
  
  if (!poll) {
    return {
      title: 'Poll Not Found',
    };
  }
  
  return {
    title: `Results: ${poll.title}`,
    description: `View the results for the poll: ${poll.title}`,
  };
}

export default async function PollResultsPage({ params }: PollResultsPageProps) {
  const { poll, error } = await getPollAction(params.id);
  
  if (!poll || error) {
    notFound();
  }
  
  return (
    <div className="container py-10">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Poll Results</h1>
            <p className="text-muted-foreground">
              View the results for this poll
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" asChild>
              <Link href={`/polls/${params.id}`}>Back to Poll</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/polls">All Polls</Link>
            </Button>
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <PollResults poll={poll} />
          <PollShare pollId={poll.id} pollTitle={poll.title} />
        </div>
      </div>
    </div>
  );
}