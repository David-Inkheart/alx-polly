"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface VoteOption {
  text: string;
  votes: number;
}

interface VoteResultProps {
  question: string;
  options: VoteOption[];
  totalVotes: number;
}

export function VoteResult({ question, options, totalVotes }: VoteResultProps) {
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{question}</CardTitle>
        <CardDescription>Total votes: {totalVotes}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {options.map((option, index) => {
          const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
          return (
            <div key={index} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{option.text}</span>
                <span>{option.votes} votes ({percentage.toFixed(1)}%)</span>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500 ease-in-out"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}