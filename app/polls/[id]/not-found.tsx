import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PollNotFound() {
  return (
    <div className="container py-10">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Poll Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The poll you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <div className="flex justify-center space-x-4">
          <Button asChild>
            <Link href="/polls">Browse Polls</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/polls/create">Create Poll</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}