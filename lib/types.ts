export interface VoteOption {
  text: string;
  votes: number;
}

export interface Poll {
  id: string;
  question: string;
  options: VoteOption[];
  totalVotes: number;
  createdAt: string;
  updatedAt: string;
}
