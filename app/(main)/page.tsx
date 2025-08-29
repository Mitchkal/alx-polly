import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle, BarChart3, Share2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Home',
  description: 'Create and share polls with Polly',
};

export default function HomePage() {
  return (
    <div className="container py-10">
      <div className="flex flex-col items-center text-center space-y-10 py-10">
        <div className="space-y-4 max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Create, Share, and Analyze Polls with Ease
          </h1>
          <p className="text-xl text-muted-foreground">
            Polly is a modern polling platform that makes it simple to create polls, 
            share them with QR codes, and analyze results in real-time.
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/polls/create">
              <PlusCircle className="mr-2 h-5 w-5" />
              Create a Poll
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/polls">
              <BarChart3 className="mr-2 h-5 w-5" />
              Browse Polls
            </Link>
          </Button>
        </div>
        
        <div className="grid gap-8 md:grid-cols-3 max-w-5xl mt-16">
          <div className="flex flex-col items-center space-y-2 p-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <PlusCircle className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">Create Polls</h2>
            <p className="text-muted-foreground text-center">
              Create custom polls with multiple options in seconds. Add descriptions and customize settings.
            </p>
          </div>
          
          <div className="flex flex-col items-center space-y-2 p-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Share2 className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">Share Easily</h2>
            <p className="text-muted-foreground text-center">
              Share polls via links or QR codes. Perfect for events, classrooms, or social media.
            </p>
          </div>
          
          <div className="flex flex-col items-center space-y-2 p-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">Analyze Results</h2>
            <p className="text-muted-foreground text-center">
              View real-time results with beautiful visualizations. Track votes and analyze trends.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}