import { getPollById } from '@/lib/actions/polls';
import PollDetailClient from '@/components/poll-detail-client';
import { notFound } from 'next/navigation';

interface PollDetailPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

export default async function PollDetailPage({ params }: PollDetailPageProps) {
  const { id } = await params;

  try {
    const poll = await getPollById(id);
    if (!poll) notFound();
    return <PollDetailClient poll={poll} />;
  } catch (error) {
    console.error('Error fetching poll:', error);
    notFound();
  }
}
