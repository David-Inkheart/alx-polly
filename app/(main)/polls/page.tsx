import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

const polls = [
  {
    id: "1",
    question: "Favorite programming language?",
    totalVotes: 540,
  },
  {
    id: "2",
    question: "Best framework for frontend?",
    totalVotes: 320,
  },
  {
    id: "3",
    question: "Tabs vs. Spaces?",
    totalVotes: 1020,
  },
];

export default function PollsPage() {
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Polls Dashboard</h1>
        <Button asChild>
          <Link href="/polls/create">Create New Poll</Link>
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {polls.map((poll) => (
          <Link href={`/polls/${poll.id}`} key={poll.id}>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="truncate">{poll.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {poll.totalVotes} votes
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}