import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="container py-10">
      <div className="flex flex-col gap-8">
        <section className="flex flex-col gap-4 py-10">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Create and share polls with the world
          </h1>
          <p className="max-w-[700px] text-lg text-muted-foreground">
            Polly is a simple and easy-to-use polling application. Create polls, share them with friends, and see the results in real-time.
          </p>
          <div className="flex gap-4 mt-4">
            <Link href="/polls">
              <Button size="lg">Browse Polls</Button>
            </Link>
            <Link href="/polls/create">
              <Button variant="outline" size="lg">Create a Poll</Button>
            </Link>
          </div>
        </section>

        <section className="py-10">
          <h2 className="text-3xl font-bold tracking-tight mb-6">How it works</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Create</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Create a poll with multiple options in just a few clicks.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Share</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Share your poll with friends, family, or the world.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Analyze</CardTitle>
              </CardHeader>
              <CardContent>
                <p>View results in real-time as people vote on your poll.</p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
