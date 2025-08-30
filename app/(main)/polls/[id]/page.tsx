"use client";

import { VoteResult } from "@/components/vote-result";
import { QRCodeCard } from "@/components/qr-code-card";

export default function ViewPollPage() {
  const poll = {
    question: "What is your favorite programming language?",
    options: [
      { text: "JavaScript", votes: 150 },
      { text: "Python", votes: 120 },
      { text: "Rust", votes: 90 },
      { text: "TypeScript", votes: 180 },
    ],
    totalVotes: 540,
  };

  const pollUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div className="container mx-auto p-4 flex flex-col lg:flex-row gap-8 justify-center items-start h-screen">
      <div className="w-full lg:w-2/3">
        <VoteResult
          question={poll.question}
          options={poll.options}
          totalVotes={poll.totalVotes}
        />
      </div>
      <div className="w-full lg:w-1/3">
        <QRCodeCard url={pollUrl} />
      </div>
    </div>
  );
}