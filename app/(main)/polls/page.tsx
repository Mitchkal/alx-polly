import { Metadata } from 'next';
import { PollList } from '@/components/polls/poll-list';
import { getPollsAction } from '@/lib/actions';

export const metadata: Metadata = {
  title: 'Polls',
  description: 'View all polls',
};

export default async function PollsPage() {
  const { data: polls, error } = await getPollsAction();

  if (error) {
    return <p>Error loading polls: {error.message}</p>;
  }

  return (
    <div className="container py-10">
      <PollList polls={polls} />
    </div>
  );
}