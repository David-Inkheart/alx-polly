/**
 * Server component for displaying individual poll details and voting interface
 * Handles poll fetching and 404 handling for non-existent polls
 */

import { getPollById } from '@/lib/actions/polls';
import PollDetailClient from '@/components/poll-detail-client';
import { notFound } from 'next/navigation';

/**
 * Props for the PollDetailPage component
 */
interface PollDetailPageProps {
  params: Promise<{ id: string }>;
}

// Force dynamic rendering for fresh poll data
export const dynamic = 'force-dynamic';

/**
 * Individual poll detail page component
 * Fetches specific poll by ID and renders voting interface
 */
export default async function PollDetailPage({ params }: PollDetailPageProps) {
  // Extract poll ID from route parameters
  const { id } = await params;

  try {
    // Fetch poll data from database
    const poll = await getPollById(id);
    if (!poll) notFound();

    // Render client component with poll data
    return <PollDetailClient poll={poll} />;
  } catch (error) {
    console.error('Error fetching poll:', error);
    // Redirect to 404 page for any errors
    notFound();
  }
}
